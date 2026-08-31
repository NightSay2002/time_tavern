import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

test("Discord generation commands defer privately and publish only successful output", () => {
  assert.match(
    serverSource,
    /shouldDeferSlashCommandEarly\(interaction\.commandName\)[\s\S]*?deferReply\(\{ flags: MessageFlags\.Ephemeral \}\)/u
  );
  assert.match(serverSource, /const failureText = getFailedConversationReplyText\(result\);[\s\S]*?safeSendInteractionError/u);
  assert.match(serverSource, /sendInteractionPublicLongReply\(interaction, replyText\)/u);
  assert.match(serverSource, /sent = await channel\.send\(\{/u);
});

test("Discord model failures appear beside the original message and auto-delete", () => {
  assert.match(serverSource, /async function sendDiscordMessageError/u);
  assert.match(
    serverSource,
    /const sentMessages = await sendDiscordLongMessage\(message, text\);[\s\S]*?scheduleDiscordErrorMessageDeletion\(sentMessages\)/u
  );
  assert.match(serverSource, /DISCORD_ERROR_AUTO_DELETE_SECONDS/u);
  assert.match(serverSource, /void item\.delete\(\)\.catch/u);
});

test("every guild message error stays in its source channel", () => {
  assert.doesNotMatch(serverSource, /message\.author\.send\(text\)/u);
  assert.match(serverSource, /await sendDiscordMessageError\(message, `處理失敗：/u);
  assert.match(serverSource, /await sendDiscordMessageError\(message, `編輯後重算失敗：/u);
});

test("guild Slash command errors are public briefly instead of ephemeral", () => {
  assert.match(
    serverSource,
    /async function safeSendInteractionError[\s\S]*?interaction\?\.guildId[\s\S]*?sendInteractionChannelFallback[\s\S]*?scheduleDiscordErrorMessageDeletion/u
  );
  assert.match(serverSource, /allowedMentions: \{ parse: \[\] \}/u);
});
