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
  assert.match(serverSource, /async function sendDiscordPrivateMessageError/u);
  assert.match(
    serverSource,
    /const sentMessages = await sendDiscordLongMessage\(message, discordSystemText\(failureText\)\);[\s\S]*?scheduleDiscordErrorMessageDeletion\(sentMessages\)/u
  );
  assert.match(serverSource, /DISCORD_ERROR_AUTO_DELETE_SECONDS/u);
  assert.match(serverSource, /void item\.delete\(\)\.catch/u);
});

test("unexpected normal-message errors still use private delivery", () => {
  assert.match(serverSource, /await message\.author\.send\(text\)/u);
  assert.match(serverSource, /await sendDiscordPrivateMessageError\(message, `處理失敗：/u);
});
