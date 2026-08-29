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
});

test("Discord normal-message failures stay out of public guild channels", () => {
  assert.match(serverSource, /async function sendDiscordPrivateMessageError/u);
  assert.match(serverSource, /await message\.author\.send\(text\)/u);
  assert.match(serverSource, /await sendDiscordPrivateMessageError\(message, failureText\)/u);
});
