import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const htmlSource = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");

test("conversation contexts persist runtime separately from app state", () => {
  assert.match(serverSource, /CONVERSATION_CONTEXTS_DIR/u);
  assert.match(serverSource, /function captureConversationContextSnapshot/u);
  assert.match(serverSource, /conversation: cloneData\(currentState\.conversation/u);
  assert.match(serverSource, /aiLogs: cloneData\(currentState\.aiLogs/u);
  assert.match(serverSource, /writeConversationContextSnapshot/u);
  assert.match(serverSource, /conversation: _conversation/u);
  assert.match(serverSource, /aiLogs: _aiLogs/u);
});

test("legacy shared conversation migrates to its last Discord channel", () => {
  assert.match(serverSource, /getDiscordConversationContextId\(merged\.lastDiscordChannelId\)/u);
  assert.match(serverSource, /merged\.selectedConversationContextId = legacyContextId/u);
  assert.match(serverSource, /conversationContextStorageMigrated = true/u);
});

test("Discord work swaps channel runtime and restores the web-selected story", () => {
  assert.match(serverSource, /requestedContextId !== selectedContextId/u);
  assert.match(serverSource, /selectedContextSnapshot = captureConversationContextSnapshot\(state\)/u);
  assert.match(serverSource, /applyConversationContextSnapshot\([\s\S]*requestedContextId/u);
  assert.match(serverSource, /applyConversationContextSnapshot\(state, selectedContextSnapshot, selectedContextId\)/u);
});

test("web exposes and controls the selected conversation context", () => {
  assert.match(serverSource, /pathname === "\/api\/conversation-contexts" && method === "GET"/u);
  assert.match(serverSource, /pathname === "\/api\/conversation-context" && method === "PUT"/u);
  assert.match(htmlSource, /id="conversationContextSelect"/u);
  assert.match(webSource, /function renderConversationContextPicker/u);
  assert.match(webSource, /PUT[\s\S]*contextId/u);
});

