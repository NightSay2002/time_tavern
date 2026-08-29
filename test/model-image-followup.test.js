import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

test("model image follow-up exposes both parallel modes and always uses the image queue", () => {
  assert.doesNotMatch(webSource, /建立圖片，然後繼續觸發正文/u);
  assert.match(webSource, /建立圖片（並行運作），同時繼續正文/u);
  assert.match(webSource, /跑圖不跑正文（完全停止正文）/u);
  assert.match(serverSource, /const KEYWORD_FOLLOWUP_IMAGE_ONLY = "image_only";/u);
  assert.doesNotMatch(serverSource, /const KEYWORD_FOLLOWUP_IMAGE_THEN_REASONER/u);
  assert.doesNotMatch(webSource, /const KEYWORD_FOLLOWUP_IMAGE_THEN_REASONER/u);
  assert.match(serverSource, /queueParallelModelImageGeneration\(imageContext\);/u);
  assert.doesNotMatch(serverSource, /await runModelImageGenerationTask\(imageContext\);/u);
});

test("image-only mode suppresses正文 and fixes keyword matching to user input", () => {
  assert.match(
    serverSource,
    /if \(isImageOnlyKeywordFollowupAction\(keywordFollowupAction\)\) \{[\s\S]*?keywordSource: "user"/u
  );
  assert.match(
    webSource,
    /if \(isImageOnlyKeywordFollowupAction\(keywordFollowupAction\)\) \{[\s\S]*?triggers\.keywordSource = "user";/u
  );
  assert.match(
    serverSource,
    /suppressAssistantMessage: processedActions\.some\(\(item\) => item\.suppressAssistantMessage\)/u
  );
  assert.match(serverSource, /backgroundImageGeneration: hasPendingModelImageGeneration/u);
});

test("Prompt saving rejects a server response that downgrades image-only mode", () => {
  assert.match(webSource, /const requestedImageOnlyActions = new Set/u);
  assert.match(webSource, /const savedImageOnlyActions = new Set/u);
  assert.match(webSource, /伺服器仍在執行舊版本，無法保存「跑圖不跑正文」/u);
});

test("legacy sequential image settings migrate to parallel mode", () => {
  for (const source of [serverSource, webSource]) {
    assert.match(source, /normalized === "image_then_reasoner"/u);
    assert.match(
      source,
      /normalized === "image_continue"[\s\S]*?return KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER;/u
    );
  }
});

test("parallel image completion writes logs and images back to its source context", () => {
  assert.match(serverSource, /aiLogTargetState: currentState/u);
  assert.match(serverSource, /aiLogs: currentState\.aiLogs\.slice\(startingAiLogCount\)/u);
  assert.match(
    serverSource,
    /withStateLock\([\s\S]*?appendModelImageGenerationMessage\(result, context\)[\s\S]*?contextOptions/u
  );
  assert.match(
    serverSource,
    /contextId: normalizeConversationContextId\(activeConversationExecutionContextId\)/u
  );
});
