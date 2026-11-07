import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

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
    /const imageContextId = normalizeConversationContextId\(activeConversationExecutionContextId\)/u
  );
});

test("parallel image tasks retain their own logs when shared history is at capacity", async () => {
  const contextSource = serverSource.match(/const imageContext = \{[\s\S]*?\n        \};/u)?.[0];
  assert.ok(contextSource);
  const functions = ["buildModelImageGenerationResult", "queueParallelModelImageGeneration"].map((name) => {
    const start = serverSource.indexOf(`${name === "queueParallelModelImageGeneration" ? "function" : "async function"} ${name}(`);
    assert.ok(start >= 0);
    return serverSource.slice(start, serverSource.indexOf("\n}\n", start) + 2);
  }).join("\n");
  for (const count of [0, 199, 200]) {
    for (const failure of [false, true]) {
      const original = Array.from({ length: count }, (_, index) => ({ id: `old-${index}` }));
      let finish;
      const completed = new Promise(resolve => { finish = resolve; });
      const currentState = { aiLogs: original, conversationContextIndex: {}, selectedConversationContextId: "local" };
      const scope = vm.createContext({
        currentState, imageContextId: "local", activeConversationExecutionContextId: "",
        normalizeConversationContextId: value => value || "", LOCAL_CONVERSATION_CONTEXT_ID: "local",
        cloneData: value => structuredClone(value), runtimeUserName: "", profile: {}, triggerAction: {},
        latestUser: { id: "message" }, triggeredBy: [], includeLatestAssistant: false,
        messagesToCompress: [], imageProfileState: {}, options: {},
        buildModelImagePromptApiMessages: () => [], getModelTriggerApiPurpose: () => "context_compression:image_prompt",
        callChatApiCompletionRaw: async ({ aiLogTargetState }) => {
          aiLogTargetState.aiLogs.push({ id: "new-model-log" });
          if (aiLogTargetState.aiLogs.length > 200) aiLogTargetState.aiLogs = aiLogTargetState.aiLogs.slice(-200);
          if (failure) throw new Error("model failed");
          return { content: "prompt" };
        },
        safeText: value => typeof value === "string" ? value : "",
        normalizeModelImageGenerationSettings: () => ({}),
        generateNovelAiImages: async () => ({ images: [] }),
        appendModelImageGenerationMessage: result => { finish(result); },
        withStateLock: async task => task(), console
      });
      vm.runInContext(functions, scope);
      vm.runInContext(`${contextSource}\nqueueParallelModelImageGeneration(imageContext);`, scope);
      const result = await completed;
      assert.deepEqual(Array.from(result.aiLogs, entry => entry.id), ["new-model-log"]);
      assert.equal(result.status === "error", failure);
      assert.equal(currentState.aiLogs.length, count);
      assert.equal(currentState.aiLogs, original);
    }
  }
});

test("completed and failed image task logs merge into the shared history", async () => {
  const start = serverSource.indexOf("async function appendModelImageGenerationMessage(");
  const source = serverSource.slice(start, serverSource.indexOf("\n}\n", start) + 2);
  for (const status of ["success", "error"]) {
    const state = { aiLogs: Array.from({ length: 200 }, (_, index) => ({ id: `old-${index}` })), conversation: [{ id: "source" }] };
    const scope = vm.createContext({
      state, safeText: value => typeof value === "string" ? value : "",
      normalizeAiLog: value => value, saveGeneratedNovelAiImagesForMessage: () => [],
      createModelImageMessage: () => ({ id: "image-message" }), appendConversationMessage() {},
      saveState() {}, sendDiscordModelImageMessage: async () => {}, sendQqModelImageMessage: async () => {}
    });
    vm.runInContext(source, scope);
    await scope.appendModelImageGenerationMessage({ status, aiLogs: [{ id: "new-model-log" }] }, { sourceUserMessageId: "source" });
    assert.equal(state.aiLogs.length, 200);
    assert.equal(state.aiLogs.at(-1).id, "new-model-log");
    assert.equal(state.aiLogs[0].id, "old-1");
  }
});
