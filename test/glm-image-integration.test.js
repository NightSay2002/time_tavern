import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");

test("GLM provider uses the selected chat model without a vision-model override", () => {
  assert.match(serverSource, /return "https:\/\/open\.bigmodel\.cn\/api\/paas\/v4"/u);
  assert.match(serverSource, /\["CHAT_API_MODEL", "CONVERSATION_API_MODEL", \.\.\.getChatApiProviderModelAliases\(provider\)\]/u);
  assert.match(serverSource, /return \["ZHIPU_MODEL", "GLM_MODEL"\]/u);
  assert.doesNotMatch(serverSource, /CHAT_API_(?:VISION|IMAGE)_MODEL/u);
});

test("web chat submits image attachments with the normal chat request", () => {
  assert.match(htmlSource, /id="chatImageInput"[^>]+multiple/u);
  assert.match(webSource, /JSON\.stringify\(\{ content, images \}\)/u);
  assert.match(webSource, /appendOptimisticChatTurn\(displayContent, images\)/u);
});

test("Discord direct chat accepts and forwards supported image attachments", () => {
  assert.match(serverSource, /hasSupportedDiscordImageAttachment\(message\.attachments\)/u);
  assert.match(serverSource, /const chatInput = await buildDiscordChatInput\(userContent, message\.attachments\)/u);
  assert.match(serverSource, /content: userContent,\s+images,/u);
});
