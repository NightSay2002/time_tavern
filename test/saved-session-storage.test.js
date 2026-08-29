import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function functionSource(name, nextName) {
  const start = serverSource.indexOf(`function ${name}(`);
  const end = serverSource.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return serverSource.slice(start, end);
}

test("saved-session summaries use metadata without opening full snapshots", () => {
  const summarySource = functionSource("buildSavedSessionSummary", "normalizeConversationForClient");
  assert.doesNotMatch(summarySource, /readSavedSessionExternalData/);
  assert.match(summarySource, /session\.messageCount/);
});

test("app state stores cards separately and saved sessions contain conversation state only", () => {
  const saveStateSource = functionSource("saveState", "sendJson");
  const sessionCaptureSource = functionSource("captureSavedConversationSnapshot", "captureNarrativeCheckpoint");
  const sessionWriterSource = functionSource("writeSavedSessionExternalData", "materializeSavedSessionSnapshot");
  assert.match(saveStateSource, /roleCards: _roleCards/);
  assert.match(saveStateSource, /assistantCards: _assistantCards/);
  assert.match(saveStateSource, /persistCardState\(state\)/);
  assert.match(sessionCaptureSource, /conversation: cloneData/);
  assert.match(sessionCaptureSource, /contextCompression: normalizeContextCompressionState/);
  assert.match(sessionCaptureSource, /timeTracking: normalizeTimeTrackingState/);
  assert.doesNotMatch(sessionCaptureSource, /userProfile:/);
  assert.doesNotMatch(sessionCaptureSource, /roleCards:/);
  assert.doesNotMatch(sessionCaptureSource, /assistantCards:/);
  assert.doesNotMatch(sessionCaptureSource, /conversationSettings:/);
  assert.doesNotMatch(sessionCaptureSource, /modularPromptConfigs:/);
  assert.doesNotMatch(sessionWriterSource, /roleCards/);
  assert.match(sessionWriterSource, /compactAiLogsForStorage/);
  assert.match(sessionWriterSource, /snapshot: snapshotForStorage/);
});

test("loading a saved session preserves global cards, prompts, and settings", () => {
  const loaderSource = functionSource("applySavedConversationSnapshot", "ensureSavedSessionsDir");
  assert.doesNotMatch(loaderSource, /currentState\.roleCards\s*=/);
  assert.doesNotMatch(loaderSource, /currentState\.assistantCards\s*=/);
  assert.doesNotMatch(loaderSource, /currentState\.userProfile\s*=/);
  assert.doesNotMatch(loaderSource, /currentState\.conversationSettings\s*=/);
  assert.doesNotMatch(loaderSource, /currentState\.modularPromptConfigs\s*=/);
  assert.match(loaderSource, /mergeTimeTrackingProgress/);
  assert.match(loaderSource, /const currentRoleCardRuntimeState/);
  assert.match(loaderSource, /mergeActiveRoleRuntimeState/);
});

test("conversation-generated images stay temporary unless the conversation is archived", () => {
  const imageSaverSource = functionSource(
    "saveGeneratedNovelAiImagesForMessage",
    "normalizeKeywordSearchText"
  );
  const sessionCreatorSource = functionSource(
    "createSavedSessionFromCurrentState",
    "loadSavedSessionIntoRuntime"
  );
  const sessionLoaderSource = functionSource(
    "loadSavedSessionIntoRuntime",
    "deleteSavedSession"
  );
  const sessionDeleteSource = functionSource("deleteSavedSession", "deleteRoleCard");
  const saveStateSource = functionSource("saveState", "sendJson");
  assert.match(imageSaverSource, /saveCurrentConversationImage/);
  assert.doesNotMatch(imageSaverSource, /saveNovelAiAlbumItem/);
  assert.match(imageSaverSource, /context\.sourceUserMessageId/);
  assert.match(imageSaverSource, /state\.conversation\.some/);
  assert.match(sessionCreatorSource, /archiveConversationImagesForSavedSession/);
  assert.match(sessionLoaderSource, /restoreSavedSessionImagesToCurrentConversation/);
  assert.match(sessionDeleteSource, /deleteSavedSessionImages/);
  assert.match(saveStateSource, /cleanupCurrentConversationImages\(state\.conversation\)/);
  assert.match(serverSource, /\/api\/conversation-images\//u);
  assert.match(serverSource, /\/api\/sessions\/" \+ encodeURIComponent\(sessionId\) \+ "\/images\//u);
  assert.match(serverSource, /sourceUserMessageId: latestUser\.id/u);
});

test("full runtime snapshots still restore complete state for rollback and migration", () => {
  const loaderSource = functionSource("applyRuntimeSnapshot", "applySavedConversationSnapshot");
  assert.match(loaderSource, /currentState\.userProfile\s*=/);
  assert.match(loaderSource, /currentState\.roleCards\s*=/);
  assert.match(loaderSource, /currentState\.assistantCards\s*=/);
  assert.match(loaderSource, /currentState\.roleCardRuntimeState\s*= normalizeRoleCardRuntimeStateMap/);
  assert.match(loaderSource, /currentState\.conversationSettings\s*=/);
});

test("AI logs use shared content references in storage and expand for display", () => {
  const saveStateSource = functionSource("saveState", "sendJson");
  const statePayloadSource = functionSource("statePayload", "clearDiscordLoginRetryTimer");
  const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  assert.match(saveStateSource, /compactAiLogsForStorage\(state\.aiLogs\)/);
  assert.match(statePayloadSource, /aiLogContentStore: compactedAiLogs\.contentStore/);
  assert.match(webSource, /resolveAiLogStoredText/);
  assert.match(webSource, /wrapper\.addEventListener\("toggle"/);
});

test("100 cards and 100 saves keep app-state session metadata small", () => {
  const roleCards = Array.from({ length: 100 }, (_, index) => ({
    id: `card-${index + 1}`,
    name: `角色 ${index + 1}`,
    description: "測".repeat(1000)
  }));
  const conversation = [{ role: "user", content: "文".repeat(1000) }];
  const legacySessions = Array.from({ length: 100 }, (_, index) => ({
    id: `session-${index + 1}`,
    name: `存檔 ${index + 1}`,
    snapshot: { roleCards, conversation }
  }));
  const metadataSessions = legacySessions.map((session, index) => ({
    storageVersion: 4,
    id: session.id,
    name: session.name,
    roleCardId: `card-${index + 1}`,
    roleCardName: `角色 ${index + 1}`,
    messageCount: 1
  }));

  const legacyBytes = Buffer.byteLength(JSON.stringify({ roleCards, savedSessions: legacySessions }));
  const optimizedBytes = Buffer.byteLength(JSON.stringify({ savedSessions: metadataSessions }));

  assert.ok(legacyBytes > 25_000_000, `legacy fixture should exceed 25 MB, got ${legacyBytes}`);
  assert.ok(optimizedBytes < 50_000, `metadata should remain below 50 KB, got ${optimizedBytes}`);
  assert.ok(legacyBytes / optimizedBytes > 500, "metadata should be at least 500x smaller");
});
