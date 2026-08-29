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
  assert.match(serverSource, /displacedWebConversationContext = \{[\s\S]*snapshot: selectedContextSnapshot/u);
  assert.match(serverSource, /function getWebConversationStateView/u);
  assert.match(serverSource, /applyConversationContextSnapshot\([\s\S]*requestedContextId/u);
  assert.match(serverSource, /applyConversationContextSnapshot\(state, selectedContextSnapshot, selectedContextId\)/u);
});

test("web conversation mutations are serialized with Discord context work", () => {
  assert.match(serverSource, /pathname === "\/api\/sessions\/save"[\s\S]*?withStateLock\(\(\) =>/u);
  assert.match(serverSource, /pathname === "\/api\/context-compression"[\s\S]*?method === "PUT"[\s\S]*?withStateLock/u);
  assert.match(serverSource, /pathname === "\/api\/time-tracking"[\s\S]*?method === "PUT"[\s\S]*?withStateLock/u);
  assert.match(serverSource, /messageFeedbackMatch[\s\S]*?withStateLock/u);
  assert.match(serverSource, /messageEditMatch[\s\S]*?withStateLock/u);
  assert.match(serverSource, /replayConversationFromMessageNumber\(\{[\s\S]*?messageId/u);
});

test("web exposes and controls the selected conversation context", () => {
  assert.match(serverSource, /pathname === "\/api\/conversation-contexts" && method === "GET"/u);
  assert.match(serverSource, /pathname === "\/api\/conversation-context" && method === "PUT"/u);
  assert.match(serverSource, /pathname === "\/api\/conversation-context" && method === "DELETE"/u);
  assert.match(htmlSource, /id="conversationContextSelect"/u);
  assert.match(htmlSource, /id="deleteConversationContextBtn"/u);
  assert.match(webSource, /function renderConversationContextPicker/u);
  assert.match(webSource, /PUT[\s\S]*contextId/u);
  assert.match(webSource, /DELETE[\s\S]*contextId/u);
});

test("deleting a Discord story preserves archives and releases its key group", () => {
  const startIndex = serverSource.indexOf("function deleteConversationContext");
  const endIndex = serverSource.indexOf("function ensureSavedSessionsDir", startIndex);
  const deleteSource = serverSource.slice(startIndex, endIndex);
  assert.match(deleteSource, /本地對話不可刪除/u);
  assert.match(deleteSource, /delete currentState\.conversationContextIndex\[contextId\]/u);
  assert.match(deleteSource, /releaseConversationApiKeySlot\([\s\S]*contextId/u);
  assert.match(deleteSource, /fs\.rmSync\(getConversationContextFilePath\(contextId\)/u);
  assert.doesNotMatch(deleteSource, /savedSessions|SAVED_SESSIONS/u);
  assert.match(serverSource, /requireExistingContext: true/u);
});

test("Discord channel deletion and startup reconciliation release abandoned stories", () => {
  assert.match(serverSource, /async function cleanupDeletedDiscordChannelContexts/u);
  assert.match(serverSource, /discordClient\.channels\.fetch\(metadata\.channelId, \{ force: true \}\)/u);
  assert.match(serverSource, /discordClient\.on\("channelDelete"/u);
  assert.match(serverSource, /deleteDiscordConversationContextForChannel\(channel\.id/u);
  assert.match(serverSource, /await cleanupDeletedDiscordChannelContexts\(discordClient\)/u);
});

test("conversation contexts lease independent chat API key groups", () => {
  assert.match(serverSource, /conversationApiKeyAssignments: normalizeConversationApiKeyAssignments/u);
  assert.match(serverSource, /assignConversationApiKeyGroup\(state, \{ forceNew: true \}\)/u);
  assert.match(serverSource, /contextId: getDiscordConversationContextId\(channelId\),[\s\S]*forceNew: true/u);
  assert.match(serverSource, /getChatApiKey\(purpose, targetState, conversationContextId\)/u);
  assert.match(webSource, /對話 API Key 組切換/u);
  assert.match(webSource, /CHAT_API_KEY_GROUP\$\{groupNumber\}/u);
});

test("Discord start validates a free key group before changing the active story", () => {
  const startIndex = serverSource.indexOf("async function startSessionFromDiscord");
  const endIndex = serverSource.indexOf("function buildDiscordStatusText", startIndex);
  const startSource = serverSource.slice(startIndex, endIndex);
  const assignmentIndex = startSource.indexOf("const keyAssignment = assignConversationApiKeyGroup");
  const roleMutationIndex = startSource.indexOf("state.activeRoleCardId = requestedCard.id");
  assert.ok(assignmentIndex >= 0);
  assert.ok(roleMutationIndex > assignmentIndex);
  assert.match(startSource, /if \(!keyAssignment\.ok\) \{[\s\S]*return \{ ok: false/u);
});
