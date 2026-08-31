import assert from "node:assert/strict";
import crypto from "node:crypto";
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

test("legacy and detached saved-session files migrate without deletion", () => {
  const migrationSource = functionSource("migrateSavedSessionStorageFiles", "inferSavedSessionRoleCardId");
  assert.match(migrationSource, /fs\.readdirSync\(SAVED_SESSIONS_DIR/u);
  assert.match(migrationSource, /expandAiLogsFromStorage/u);
  assert.match(migrationSource, /writeSavedSessionExternalData/u);
  assert.doesNotMatch(migrationSource, /unlinkSync|rmSync/u);
});

test("detached saved-session files rebuild a missing app-state index", () => {
  const recoverySource = functionSource(
    "reconcileSavedSessionIndexFromStorage",
    "materializeSavedSessionSnapshot"
  );
  const writerSource = functionSource("writeSavedSessionExternalData", "migrateSavedSessionStorageFiles");
  assert.match(recoverySource, /fs\.readdirSync\(SAVED_SESSIONS_DIR/u);
  assert.match(recoverySource, /expandAiLogsFromStorage\(snapshot\.aiLogs, snapshot\.aiLogContentStore\)/u);
  assert.match(recoverySource, /currentState\.savedSessions\.push\(session\)/u);
  assert.match(recoverySource, /writeSavedSessionExternalData\(session, snapshot\)/u);
  assert.doesNotMatch(recoverySource, /unlinkSync|rmSync/u);
  assert.match(writerSource, /metadata:/u);
  assert.match(serverSource, /savedSessionIndexRecoveryCount = reconcileSavedSessionIndexFromStorage\(state\)/u);
});

test("invalid primary state stops startup instead of returning an empty state", () => {
  const loaderSource = functionSource("loadState", "saveState");
  assert.match(loaderSource, /已停止啟動以避免用空白狀態覆蓋原資料/u);
  assert.doesNotMatch(loaderSource, /catch[^]*return createDefaultState\(\)/u);
  assert.match(serverSource, /let state = null;[\s\S]*state = loadState\(\)/u);
});

test("app state stores cards separately and saved sessions contain conversation state only", () => {
  const saveStateSource = functionSource("saveState", "sendJson");
  const contextWriterSource = functionSource(
    "writeConversationContextSnapshot",
    "rememberConversationContextMetadata"
  );
  const sessionCaptureSource = functionSource("captureSavedConversationSnapshot", "captureNarrativeCheckpoint");
  const sessionWriterSource = functionSource("writeSavedSessionExternalData", "migrateSavedSessionStorageFiles");
  assert.match(saveStateSource, /roleCards: _roleCards/);
  assert.match(saveStateSource, /assistantCards: _assistantCards/);
  assert.match(saveStateSource, /persistCardState\(state\)/);
  assert.match(saveStateSource, /conversation: _conversation/);
  assert.match(saveStateSource, /aiLogs: _aiLogs/);
  assert.match(saveStateSource, /persistSharedAiLogs\(state\.aiLogs\)/);
  assert.match(saveStateSource, /writeConversationContextSnapshot/);
  assert.match(contextWriterSource, /captureConversationContextSnapshot/);
  assert.doesNotMatch(contextWriterSource, /compactAiLogsForStorage|aiLogContentStore/);
  assert.match(sessionCaptureSource, /conversation: cloneData/);
  assert.doesNotMatch(sessionCaptureSource, /conversation[^\n]*(?:slice|splice)/u);
  assert.match(sessionCaptureSource, /contextCompression: normalizeContextCompressionState/);
  assert.match(sessionCaptureSource, /timeTracking: normalizeTimeTrackingState/);
  assert.doesNotMatch(sessionCaptureSource, /aiLogs/u);
  assert.doesNotMatch(sessionCaptureSource, /userProfile:/);
  assert.doesNotMatch(sessionCaptureSource, /roleCards:/);
  assert.doesNotMatch(sessionCaptureSource, /assistantCards:/);
  assert.doesNotMatch(sessionCaptureSource, /conversationSettings:/);
  assert.doesNotMatch(sessionCaptureSource, /modularPromptConfigs:/);
  assert.doesNotMatch(sessionWriterSource, /roleCards/);
  assert.match(sessionWriterSource, /compactAiLogsForStorage/);
  assert.match(sessionWriterSource, /snapshot: snapshotForStorage/);
  assert.doesNotMatch(sessionWriterSource, /conversation[^\n]*(?:slice|splice)/u);
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
  assert.match(saveStateSource, /cleanupCurrentConversationImagesAcrossContexts\(state\)/);
  assert.match(serverSource, /parsed\?\.snapshot\?\.conversation/u);
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
  const sharedWriterSource = functionSource("persistSharedAiLogs", "migrateConversationContextAiLogsToShared");
  const statePayloadSource = functionSource("statePayload", "clearDiscordLoginRetryTimer");
  const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  assert.match(sharedWriterSource, /compactAiLogsForStorage\(normalizedLogs\)/);
  assert.match(sharedWriterSource, /AI_LOGS_FILE/u);
  assert.match(statePayloadSource, /aiLogContentStore: compactedAiLogs\.contentStore/);
  assert.match(serverSource, /AI_LOG_CONTENT_CHUNK_CHARS/u);
  assert.match(serverSource, /ChunkRefs/u);
  assert.match(webSource, /resolveAiLogStoredText/);
  assert.match(webSource, /wrapper\.addEventListener\("toggle"/);
});

test("long AI log prompts round trip through chunk deduplication", () => {
  const fieldsSource = functionSource("getAiLogTextFields", "compactAiLogsForStorage");
  const compactSource = functionSource("compactAiLogsForStorage", "expandAiLogsFromStorage");
  const expandSource = functionSource("expandAiLogsFromStorage", "captureRuntimeSnapshot");
  const createStorageHelpers = new Function(
    "crypto",
    `
      const AI_LOG_CONTENT_REFERENCE_MIN_CHARS = 120;
      const AI_LOG_CONTENT_CHUNK_CHARS = 4096;
      const safeText = (value) => typeof value === "string" ? value.trim() : "";
      ${fieldsSource}
      ${compactSource}
      ${expandSource}
      return { compactAiLogsForStorage, expandAiLogsFromStorage };
    `
  );
  const { compactAiLogsForStorage, expandAiLogsFromStorage } = createStorageHelpers(crypto);
  const sharedPrefix = "共同上下文".repeat(2200);
  const logs = Array.from({ length: 20 }, (_, index) => ({
    id: `log-${index}`,
    requestMessages: [{ role: "user", content: `${sharedPrefix}\n第 ${index} 次輸入` }],
    responseText: `回覆 ${index}`,
    debugReasoningContent: ""
  }));

  const compacted = compactAiLogsForStorage(logs);
  const expanded = expandAiLogsFromStorage(compacted.logs, compacted.contentStore);
  const rawBytes = Buffer.byteLength(JSON.stringify(logs));
  const compactedBytes = Buffer.byteLength(JSON.stringify(compacted));

  assert.ok(compacted.logs[0].requestMessages[0].contentChunkRefs.length > 1);
  assert.ok(compactedBytes < rawBytes * 0.4, `${compactedBytes} should be much smaller than ${rawBytes}`);
  assert.deepEqual(
    expanded.map((entry) => entry.requestMessages[0].content),
    logs.map((entry) => entry.requestMessages[0].content)
  );
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
    storageVersion: 5,
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
