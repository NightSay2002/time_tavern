import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

function functionSource(name, nextName) {
  const start = serverSource.indexOf(`function ${name}(`);
  const end = serverSource.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return serverSource.slice(start, end);
}

test("conversation storage has no 1000-round cap while the web loads every batch", () => {
  const appendSource = functionSource("appendConversationMessage", "rollbackFailedConversationTurn");
  const clientSource = functionSource("normalizeConversationForClient", "buildSavedSessionDetail");
  const imageCleanupSource = functionSource(
    "cleanupCurrentConversationImagesAcrossContexts",
    "deleteSavedSessionImages"
  );
  assert.match(appendSource, /state\.conversation\.push\(entry\)/u);
  assert.doesNotMatch(appendSource, /slice\(-500\)|length > 500/u);
  assert.match(clientSource, /stateBeforeTurnSnapshot: _stateBeforeTurnSnapshot/u);
  assert.match(clientSource, /stateAfterTurnSnapshot: _stateAfterTurnSnapshot/u);
  assert.match(webSource, /const CONVERSATION_RENDER_WINDOW_SIZE = 20/u);
  assert.match(webSource, /const CONVERSATION_RENDER_SHIFT_SIZE = 10/u);
  assert.match(webSource, /conversationRenderStart \+ CONVERSATION_RENDER_WINDOW_SIZE/u);
  assert.match(webSource, /sessionPreviewRenderStart \+ CONVERSATION_RENDER_WINDOW_SIZE/u);
  assert.match(webSource, /function shiftConversationRenderWindow\(direction\)/u);
  assert.match(webSource, /function shiftSessionPreviewWindow\(direction\)/u);
  assert.match(webSource, /function jumpConversationHistoryEdge\(\)/u);
  assert.match(webSource, /function jumpSessionPreviewHistoryEdge\(\)/u);
  assert.match(webSource, /const label = atEarliest \? "跳回現在" : "跳到最早訊息"/u);
  assert.match(webSource, /: sameSession\s*\? Math\.min\(sessionPreviewRenderStart, latestStart\)\s*: 0;/u);
  assert.match(webSource, /el\.messages\.scrollTop <= 80/u);
  assert.match(webSource, /el\.sessionPreviewMessages\.scrollTop <= 80/u);
  assert.doesNotMatch(webSource, /顯示較早訊息/u);
  assert.match(imageCleanupSource, /conversationImageReferencesByContext\.forEach/u);
  assert.doesNotMatch(imageCleanupSource, /readJsonFile|readdirSync/u);

  const checkpoint = {
    contextCompression: { summary: "摘要".repeat(400) },
    timeTracking: { currentDay: 1, currentPeriod: "morning" },
    roleCardRuntimeState: {}
  };
  const roundCount = 1205;
  const conversation = Array.from({ length: roundCount }, (_, index) => [
    {
      id: `user-${index + 1}`,
      role: "user",
      content: "使用者內容".repeat(200),
      stateBeforeTurnSnapshot: checkpoint
    },
    {
      id: `assistant-${index + 1}`,
      role: "assistant",
      content: "正文內容".repeat(250),
      stateAfterTurnSnapshot: checkpoint
    }
  ]).flat();
  const oneStoryBytes = Buffer.byteLength(JSON.stringify({ conversation, aiLogs: [] }));
  const fourStoryBytes = oneStoryBytes * 4;

  assert.equal(conversation.length, roundCount * 2);
  const seenMessageIds = new Set();
  let visibleStart = Math.max(0, conversation.length - 20);
  while (visibleStart > 0) {
    conversation.slice(visibleStart, visibleStart + 20).forEach((message) => {
      seenMessageIds.add(message.id);
    });
    visibleStart = Math.max(0, visibleStart - 10);
  }
  conversation.slice(0, 20).forEach((message) => seenMessageIds.add(message.id));
  assert.equal(visibleStart, 0);
  assert.equal(seenMessageIds.size, conversation.length);
  assert.ok(fourStoryBytes < 80 * 1024 * 1024, `four stories should stay below 80 MiB, got ${fourStoryBytes}`);
});
