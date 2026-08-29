import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDiscordArchiveBrowserPayload,
  buildDiscordArchiveContinueComponents,
  buildDiscordArchiveLatestPage,
  buildDiscordArchiveReplayPage,
  buildDiscordArchiveTranscript,
  getDiscordArchiveByNumber,
  getDiscordArchiveSessionsNewestFirst,
  parseDiscordArchiveBrowserCustomId,
  parseDiscordArchiveReplayCustomId
} from "../src/discord-archive.js";

function message(role, content, extra = {}) {
  return { role, content, ...extra };
}

function buildConversation(roundCount = 7) {
  const conversation = [message("assistant", "開場內容", { source: "opening" })];
  for (let turn = 1; turn <= roundCount; turn += 1) {
    conversation.push(message("user", `使用者 ${turn}`, { turnNumber: turn }));
    conversation.push(message("assistant", `AI ${turn}`, { source: "discord" }));
    if (turn === 3) {
      conversation.push(message("assistant", "圖片生成完成", {
        source: "model_image",
        imageOnly: true,
        excludeFromModel: true
      }));
    }
  }
  return conversation;
}

test("archive numbering is newest first and one based", () => {
  const sessions = [{ id: "old" }, { id: "middle" }, { id: "new" }];
  assert.deepEqual(getDiscordArchiveSessionsNewestFirst(sessions).map((item) => item.id), [
    "new",
    "middle",
    "old"
  ]);
  assert.equal(getDiscordArchiveByNumber(sessions, 1)?.session.id, "new");
  assert.equal(getDiscordArchiveByNumber(sessions, 3)?.session.id, "old");
  assert.equal(getDiscordArchiveByNumber(sessions, 0), null);
  assert.equal(getDiscordArchiveByNumber(sessions, 4), null);
});

test("archive transcript keeps opening separate and ignores image-only records", () => {
  const transcript = buildDiscordArchiveTranscript(buildConversation());
  assert.equal(transcript.openings.length, 1);
  assert.equal(transcript.rounds.length, 7);
  assert.equal(transcript.rounds[2].user.content, "使用者 3");
  assert.equal(transcript.rounds[2].assistant.content, "AI 3");
  assert.doesNotMatch(JSON.stringify(transcript), /圖片生成完成/u);
});

test("archive replay starts with opening and advances five rounds per page", () => {
  const conversation = buildConversation();
  const first = buildDiscordArchiveReplayPage(conversation, 0);
  assert.match(first.text, /開場內容/u);
  assert.match(first.text, /使用者 1/u);
  assert.match(first.text, /使用者 5/u);
  assert.doesNotMatch(first.text, /使用者 6/u);
  assert.equal(first.nextOffset, 5);
  assert.equal(first.hasMore, true);

  const second = buildDiscordArchiveReplayPage(conversation, first.nextOffset);
  assert.doesNotMatch(second.text, /開場內容/u);
  assert.match(second.text, /使用者 6/u);
  assert.match(second.text, /使用者 7/u);
  assert.equal(second.hasMore, false);
});

test("archive latest page contains only the final five rounds", () => {
  const latest = buildDiscordArchiveLatestPage(buildConversation(8));
  assert.doesNotMatch(latest.text, /開場內容/u);
  assert.doesNotMatch(latest.text, /使用者 3/u);
  assert.match(latest.text, /使用者 4/u);
  assert.match(latest.text, /使用者 8/u);
  assert.equal(latest.hasMore, false);
});

test("archive latest page omits the opening even when fewer than five rounds exist", () => {
  const latest = buildDiscordArchiveLatestPage(buildConversation(2));
  assert.doesNotMatch(latest.text, /開場內容/u);
  assert.match(latest.text, /使用者 1/u);
  assert.match(latest.text, /使用者 2/u);
});

test("archive browser uses stable session ids for private pagination payloads", () => {
  const sessions = [
    { id: "old", name: "舊存檔", roleCardName: "角色 A", updatedAt: "2026-01-01T00:00:00.000Z" },
    { id: "new", name: "新存檔", roleCardName: "角色 B", updatedAt: "2026-01-02T00:00:00.000Z" }
  ];
  const payload = buildDiscordArchiveBrowserPayload({
    sessions,
    sessionId: "new",
    conversation: buildConversation(1)
  });
  assert.match(payload.content, /對話存檔 1 \/ 2/u);
  assert.match(payload.content, /名稱：新存檔/u);
  assert.match(payload.content, /AI 1/u);
  assert.match(payload.content, /從頭回放：`\/archive_return mode:0 num:1`/u);
  assert.match(payload.content, /從最後對話繼續：`\/archive_return mode:1 num:1`/u);
  assert.deepEqual(payload.allowedMentions, { parse: [] });

  const buttons = payload.components[0].toJSON().components;
  assert.equal(buttons[0].disabled, true);
  assert.equal(parseDiscordArchiveBrowserCustomId(buttons[1].custom_id), "old");
});

test("archive continue button token round trips", () => {
  const components = buildDiscordArchiveContinueComponents("token-1");
  const button = components[0].toJSON().components[0];
  assert.equal(parseDiscordArchiveReplayCustomId(button.custom_id), "token-1");
  assert.equal(parseDiscordArchiveReplayCustomId("archive_replay:"), null);
  assert.equal(parseDiscordArchiveBrowserCustomId("other:value"), null);
});
