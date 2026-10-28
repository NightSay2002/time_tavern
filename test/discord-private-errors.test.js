import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { localizeSystemText } from "../src/ui-language.js";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function setup({ seconds = 15, language = "zh-TW" } = {}) {
  const timers = [];
  const warnings = [];
  const context = vm.createContext({
    safeText: (value) => String(value ?? "").trim(),
    discordSystemText: (value) => localizeSystemText(value, language),
    envFirstNumber: () => seconds,
    MessageFlags: { Ephemeral: 64 },
    console: { warn: (message) => warnings.push(message) },
    setTimeout: (callback, delay) => { timers.push({ callback, delay }); return { unref() {} }; },
    sendInteractionChannelFallback: () => assert.fail("Errors must not fall back to public channel messages"),
    formatInteractionExpiryLog: () => "expired"
  });
  for (const [start, end] of [
    ["function splitForDiscord(", "async function replayConversationFromUserIndexLocked("],
    ["function scheduleDiscordErrorMessageDeletion(", "function getDiscordReplyMessageIds("],
    ["async function sendInteractionPublicLongReply(", "function isUnknownInteractionError("],
    ["function isUnknownInteractionError(", "function startTypingIndicator("],
    ["async function sendDiscordArchivePublicChunks(", "function loadDiscordArchiveIntoCurrentChannel("]
  ]) {
    const begin = serverSource.indexOf(start);
    const finish = serverSource.indexOf(end, begin);
    assert.ok(begin >= 0 && finish > begin);
    vm.runInContext(serverSource.slice(begin, finish), context);
  }
  return { context, timers, warnings };
}

function mockInteraction({ deferred = false, replied = false, ephemeral = null } = {}) {
  const calls = [];
  const record = (method, payload, privateMessage) => calls.push({ method, payload, privateMessage });
  return {
    guildId: "guild", deferred, replied, ephemeral, calls,
    async deferReply(payload = {}) {
      this.ephemeral = Boolean(payload.flags & 64);
      this.deferred = true;
      record("deferReply", payload, this.ephemeral);
    },
    async reply(payload) {
      this.ephemeral = Boolean(payload.flags & 64);
      this.replied = true;
      record("reply", payload, this.ephemeral);
    },
    async editReply(payload) {
      this.replied = true;
      record("editReply", payload, this.ephemeral);
      return { id: `message-${calls.length}` };
    },
    async followUp(payload) {
      // Discord preserves the defer's visibility for an uncompleted initial response.
      const privateMessage = this.deferred && !this.replied ? this.ephemeral : Boolean(payload.flags & 64);
      this.replied = true;
      record("followUp", payload, privateMessage);
      return { id: `message-${calls.length}` };
    },
    async deleteReply() { record("deleteReply"); }
  };
}

function mockMessage({ guild = true, failAfter = Infinity } = {}) {
  const sent = [];
  const send = async (method, payload) => {
    if (sent.length >= failAfter) throw new Error("send failed");
    const message = { method, payload, deleted: false, async delete() { this.deleted = true; } };
    sent.push(message);
    return message;
  };
  return {
    guildId: guild ? "guild" : null,
    sent,
    reply: (payload) => send("reply", payload),
    channel: { send: (payload) => send("channel", payload) }
  };
}

test("Discord generation commands defer publicly and edit the original reply", () => {
  assert.match(
    serverSource,
    /shouldDeferSlashCommandEarly\(interaction\.commandName\)[\s\S]*?deferReply\(\)/u
  );
  assert.match(serverSource, /const failureText = getFailedConversationReplyText\(result\);[\s\S]*?safeSendInteractionError/u);
  assert.match(serverSource, /sendInteractionPublicLongReply\(interaction, replyText\)/u);
  assert.doesNotMatch(serverSource, /discardDeferredInteractionReply/u);
  assert.match(serverSource, /result\.openingDialogue \|\| "已開始對話。"/u);
  assert.match(serverSource, /已完成，沒有文字回覆。/u);
});

test("long generated replies edit the original interaction and retain it", async () => {
  const { context } = setup();
  const interaction = mockInteraction({ deferred: true, ephemeral: false });
  const sent = await context.sendInteractionPublicLongReply(interaction, "x".repeat(4000));
  assert.deepEqual(interaction.calls.map(call => call.method), ["editReply", "followUp", "followUp"]);
  assert.ok(interaction.calls.every(call => !call.privateMessage));
  assert.ok(interaction.calls.every(call => call.payload.allowedMentions.parse.length === 0));
  assert.equal(sent.length, 3);
});

test("a public deferred command exposes only a generic failure, with details private", async () => {
  const { context } = setup();
  const interaction = mockInteraction({ deferred: true, ephemeral: false });
  await context.safeSendInteractionError(interaction, "private API error @everyone");
  assert.deepEqual(interaction.calls.map(call => call.method), ["editReply", "followUp"]);
  assert.equal(interaction.calls[0].privateMessage, false);
  assert.doesNotMatch(interaction.calls[0].payload.content, /private API error/u);
  assert.equal(interaction.calls[1].privateMessage, true);
  assert.equal(interaction.calls[1].payload.content, "private API error @everyone");
  assert.equal(interaction.calls[1].payload.allowedMentions.parse.length, 0);
});

test("Discord guild model errors end with an accurate 15 second deletion notice", async () => {
  const { context, timers } = setup();
  const message = mockMessage();
  const error = '對話 API 失敗: 402 {"error":{"message":"Insufficient Balance"}}';
  await context.sendDiscordMessageError(message, error);
  assert.equal(message.sent.length, 1);
  assert.equal(message.sent[0].method, "reply");
  assert.equal(message.sent[0].payload.content, `${error}\n\n此訊息將於 15 秒後自動刪除。`);
  assert.deepEqual(Array.from(message.sent[0].payload.allowedMentions.parse), []);
  assert.equal(message.sent[0].payload.allowedMentions.repliedUser, false);
  assert.equal(timers.length, 1);
  assert.equal(timers[0].delay, 15000);
  timers[0].callback();
  assert.equal(message.sent[0].deleted, true);
});

test("every guild message error stays in its source channel", () => {
  assert.doesNotMatch(serverSource, /message\.author\.send\(text\)/u);
  assert.match(serverSource, /await sendDiscordMessageError\(message, `處理失敗：/u);
  assert.match(serverSource, /await sendDiscordMessageError\(message, `編輯後重算失敗：/u);
});

test("deletion notices use the actual configured delay and selected language", async () => {
  for (const [seconds, expected] of [[45, 45], [600, 300], [0.5, 1]]) {
    const { context, timers } = setup({ seconds, language: "zh-CN" });
    const message = mockMessage();
    await context.sendDiscordMessageError(message, "編輯後重算失敗：fetch failed");
    const notice = localizeSystemText(`此訊息將於 ${expected} 秒後自動刪除。`, "zh-CN");
    assert.ok(message.sent[0].payload.content.endsWith(notice));
    assert.equal(timers[0].delay, expected * 1000);
  }
});

test("long guild errors split safely and schedule every sent part even when a later send fails", async () => {
  const { context, timers } = setup();
  const message = mockMessage();
  const error = "API error @everyone " + "x".repeat(4000);
  await context.sendDiscordMessageError(message, error);
  assert.equal(message.sent.length, 3);
  assert.equal(timers.length, 3);
  assert.equal(message.sent.map((item) => item.payload.content).join(""), `${error}\n\n此訊息將於 15 秒後自動刪除。`);
  for (const item of message.sent) {
    assert.ok(item.payload.content.length <= 1800);
    assert.deepEqual(Array.from(item.payload.allowedMentions.parse), []);
  }
  const partial = mockMessage({ failAfter: 1 });
  await assert.rejects(context.sendDiscordMessageError(partial, error), /send failed/u);
  assert.equal(timers.length, 4);
  timers.at(-1).callback();
  assert.equal(partial.sent[0].deleted, true);
});

test("direct message errors do not claim automatic deletion", async () => {
  const { context, timers } = setup();
  const message = mockMessage({ guild: false });
  await context.sendDiscordMessageError(message, "fetch failed");
  assert.equal(message.sent[0].payload.content, "fetch failed");
  assert.equal(timers.length, 0);
});

test("Slash model failures remain private before, during and after a reply", async () => {
  for (const initial of [{}, { deferred: true, ephemeral: true }, { replied: true, ephemeral: false }]) {
    const { context, timers } = setup();
    const interaction = mockInteraction(initial);
    const error = '402 {"message":"Insufficient Balance"}\nfetch failed @everyone ' + "x".repeat(3600);
    await context.safeSendInteractionError(interaction, error);
    assert.equal(interaction.calls.map((item) => item.payload.content).join(""), error);
    for (const call of interaction.calls) {
      assert.equal(call.privateMessage, true);
      assert.ok(call.payload.content.length <= 1800);
      assert.deepEqual(Array.from(call.payload.allowedMentions.parse), []);
    }
    assert.equal(timers.length, 0);
  }
});

test("expired private errors never fall back to a public reply", async () => {
  const { context, warnings } = setup();
  const interaction = mockInteraction();
  interaction.reply = async () => { throw Object.assign(new Error("Unknown interaction"), { code: 10062 }); };
  await context.safeSendInteractionError(interaction, "402 Insufficient Balance");
  assert.equal(warnings.length, 1);
  assert.equal(interaction.calls.length, 0);
});

test("archive playback edits its public reply and keeps its final button", async () => {
  const archiveHandler = serverSource.slice(serverSource.indexOf('if (name === "archive_return")'), serverSource.indexOf('if (name === "ai_status")'));
  assert.match(archiveHandler, /deferReply\(\)/u);
  const { context } = setup();
  const interaction = mockInteraction({ deferred: true, ephemeral: false });
  const components = [{ type: 1, components: [{ type: 2, custom_id: "continue" }] }];
  await context.sendDiscordArchivePublicChunks(interaction, "x".repeat(2000), components);
  assert.equal(interaction.calls[0].method, "editReply");
  assert.equal(interaction.calls[0].privateMessage, false);
  assert.equal(interaction.calls[0].payload.components.length, 0);
  const published = interaction.calls.filter((item) => item.method === "followUp");
  assert.equal(published.length, 1);
  assert.ok(published.every((item) => item.privateMessage === false));
  assert.equal(published[0].payload.components, components);
  assert.ok(interaction.calls.every(item => item.method !== "deleteReply"));
});
