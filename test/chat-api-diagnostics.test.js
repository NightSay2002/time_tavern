import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { fetchChatApiWithRetry } from "../src/chat-api-request.js";
import { fetchGeminiNative } from "../src/gemini-native.js";
import { normalizeWordReplacements, prepareWordReplacementMessages, restoreReplacedWords, createWordRestorer } from "../src/word-replacements.js";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function createScope(responses) {
  const logs = [];
  const scope = vm.createContext({
    normalizeWordReplacements, prepareWordReplacementMessages, restoreReplacedWords, createWordRestorer,
    process: { env: {} }, state: {}, AbortController, CHAT_API_LENGTH_RETRY_LIMIT: 1,
    getChatApiKey: () => "test", getChatApiModel: () => "test-model", getChatApiTemperature: () => 1,
    resolveChatApiMaxTokens: () => 64000, localizeChatApiMessages: x => x, getUiLanguage: () => "zh-TW",
    sanitizeChatApiMessagesForLog: x => [...x], getChatApiCompletionsUrl: () => "https://example.test",
    getChatApiProvider: () => "deepseek", envFirstText: () => "", getChatApiReasoningEffort: () => "",
    buildChatApiRequestBody: x => x, adaptChatApiRequestBody: x => x, buildChatApiRequestHeaders: () => ({}),
    isDeploymentChatCompletionsUrl: () => false, normalizeChatApiRetryCount: () => 1,
    createTimeoutController: () => ({ controller: new AbortController(), cleanup() {} }),
    fetchChatApiWithRetry: async (_, __, options) => { options.onRetry?.({ attempt: 1, status: 503 }); return responses.shift(); },
    fetchModelApi() {}, throwIfGenerationStopped() {}, isGenerationStoppedError: () => false,
    normalizeAiUsage: x => x || null, safeText: x => typeof x === "string" ? x : "",
    extractChatApiMessageText: x => x || "", shouldRetryChatApiLength: () => true,
    shouldRetryChatApiEmptyResponse: (content, count) => !content && count < 1,
    buildChatApiLengthRetryMessages: x => x, nowIso: () => "2026-10-28",
    appendAiLogToState: x => logs.push(x), appendAiLog: x => logs.push(x),
    readChatApiStreamBody: async response => response.streamed
  });
  for (const name of ["callChatApiCompletionRaw", "callChatApiCompletionStreamRaw"]) {
    const start = source.indexOf(`async function ${name}(`);
    vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  }
  return { scope, logs };
}

for (const stream of [false, true]) {
  test(`${stream ? "streaming" : "non-streaming"} applies global word rules to the real request and restores the reply`, async () => {
    const response = {
      ok: true,
      streamed: { content: "錒郗", reasoningContent: "", finishReason: "stop", usage: null },
      json: async () => ({ choices: [{ message: { content: "錒郗" }, finish_reason: "stop" }] })
    };
    const { scope } = createScope([response]);
    scope.state.wordReplacements = { enabled: true, entries: [{ from: "操", to: "錒" }, { from: "射", to: "郗" }] };
    let sent;
    scope.fetchChatApiWithRetry = async (_url, options) => { sent = JSON.parse(options.body); return response; };
    scope.readChatApiStreamBody = async (res, options) => {
      options.onContentDelta("錒");
      options.onContentDelta("郗");
      return res.streamed;
    };
    let deltas = "";
    const method = stream ? scope.callChatApiCompletionStreamRaw : scope.callChatApiCompletionRaw;
    const original = [{ role: "user", content: "操射" }];
    const result = await method({ messages: original, onContentDelta: (part) => { deltas += part; } });
    assert.match(sent.messages[0].content, /^錒郗/u);
    assert.match(sent.messages[0].content, /操改為錒/u);
    assert.equal(result.content, "操射");
    assert.equal(original[0].content, "操射");
    if (stream) assert.equal(deltas, "操射");
  });

  test(`${stream ? "streaming" : "non-streaming"} logs every length retry and its usage`, async () => {
    const makeResponse = (content, finishReason, tokens) => ({
      ok: true,
      streamed: { content, reasoningContent: "", finishReason, usage: { completionTokens: tokens } },
      json: async () => ({ choices: [{ message: { content }, finish_reason: finishReason }], usage: { completionTokens: tokens } })
    });
    const { scope, logs } = createScope([makeResponse("partial", "length", 42), makeResponse("complete", "stop", 17)]);
    const method = stream ? scope.callChatApiCompletionStreamRaw : scope.callChatApiCompletionRaw;
    const result = await method({ messages: [{ role: "user", content: "test" }] });
    assert.equal(result.content, "complete");
    assert.equal(logs.length, 2);
    assert.deepEqual(logs.map(x => [x.finishReason, x.usage.completionTokens, x.lengthRetryCount, x.networkRetryCount, x.retryReason || null]),
      [["length", 42, 0, 1, "length"], ["stop", 17, 1, 1, null]]);
  });

  test(`${stream ? "streaming" : "non-streaming"} records empty and missing-finish responses`, async () => {
    const makeResponse = (content, finishReason) => ({
      ok: true, streamed: { content, reasoningContent: "", finishReason, usage: null },
      json: async () => ({ choices: [{ message: { content }, finish_reason: finishReason }] })
    });
    const { scope, logs } = createScope([makeResponse("", "stop"), makeResponse("answer", "")]);
    await (stream ? scope.callChatApiCompletionStreamRaw : scope.callChatApiCompletionRaw)({ messages: [] });
    assert.equal(logs.length, 2);
    assert.equal(logs[0].retryReason, "empty_response");
    assert.equal(logs[0].finishReason, "stop");
    assert.equal(logs[1].emptyRetryCount, 1);
    assert.equal(logs[1].finishReason, "");
    assert.equal(logs[1].usage, null);
  });

  test(`${stream ? "streaming" : "non-streaming"} treats safety-blocked partial output as a failure`, async () => {
    const response = {
      ok: true,
      streamed: { content: "partial", reasoningContent: "", finishReason: "PROHIBITED_CONTENT", usage: null },
      json: async () => ({ choices: [{ message: { content: "partial" }, finish_reason: "PROHIBITED_CONTENT" }] })
    };
    const { scope, logs } = createScope([response]);
    await assert.rejects((stream ? scope.callChatApiCompletionStreamRaw : scope.callChatApiCompletionRaw)({ messages: [] }), /PROHIBITED_CONTENT/u);
    assert.equal(logs[0].status, "error");
    assert.equal(logs[0].finishReason, "PROHIBITED_CONTENT");
  });
}

test("compression and image-prompt models apply global replacement rules and restore their output", async () => {
  const purposes = ["context_compression", "context_compression:custom-model", "context_compression:custom-model:image_prompt"];
  const rules = { enabled: true, entries: [{ from: "操", to: "錒" }] };
  const response = { ok: true, json: async () => ({ choices: [{ message: { content: "錒作結果" }, finish_reason: "stop" }] }) };
  const { scope } = createScope([]);
  scope.state.wordReplacements = rules;
  const requests = [];
  scope.fetchChatApiWithRetry = async (_url, options) => { requests.push(JSON.parse(options.body)); return response; };
  for (const purpose of purposes) {
    const result = await scope.callChatApiCompletionRaw({
      purpose,
      messages: [{ role: "system", content: "操作規則" }, { role: "user", content: "操作內容" }],
      ...(purpose.endsWith(":image_prompt") ? { aiLogTargetState: { wordReplacements: rules } } : {})
    });
    assert.equal(result.content, "操作結果");
  }
  for (const request of requests) {
    assert.equal(request.messages[0].content, "錒作規則");
    assert.match(request.messages[1].content, /^錒作內容/u);
    assert.match(request.messages[1].content, /操改為錒/u);
  }
});

test("network retry callback only reports retries that will be attempted", async () => {
  const retries = [];
  let calls = 0;
  await fetchChatApiWithRetry("https://example.test", {}, {
    retries: 2, wait: async () => {}, onRetry: info => retries.push(info),
    fetchImpl: async () => ++calls === 1 ? new Response("error", { status: 503 }) : new Response("ok")
  });
  assert.deepEqual(retries, [{ attempt: 1, status: 503 }]);
});

test("Gemini chat emits native stream deltas before completion and retains diagnostics", async () => {
  const { scope, logs } = createScope([]);
  scope.fetchGeminiNative = fetchGeminiNative;
  scope.getChatApiProvider = () => "gemini";
  scope.getChatApiCompletionsUrl = () => "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  scope.buildChatApiRequestBody = ({ model, messages, maxTokens, stream }) => ({ model, messages, max_tokens: maxTokens, stream });
  scope.fetchChatApiWithRetry = (url, options, config) => config.fetchImpl(url, options);
  scope.TextDecoder = TextDecoder;
  scope.hasUsageTokens = () => true;
  const start = source.indexOf("async function readChatApiStreamBody(");
  vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  let release;
  let firstDelivered;
  const firstChunk = new Promise(resolve => { firstDelivered = resolve; });
  const encoder = new TextEncoder();
  let requests = 0;
  scope.fetchModelApi = async (url, options) => {
    requests += 1;
    assert.match(url, /:streamGenerateContent\?alt=sse$/u);
    assert.ok(JSON.parse(options.body).safetySettings.every(item => item.threshold === "BLOCK_NONE"));
    const stream = new ReadableStream({ start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "first" }] } }] })}\n\n`));
      release = () => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: " second" }] }, finishReason: "STOP" }], usageMetadata: { candidatesTokenCount: 5 } })}\n\n`));
        controller.close();
      };
    } });
    return new Response(stream);
  };
  const deltas = [];
  let complete = false;
  const request = scope.callChatApiCompletionStreamRaw({ messages: [{ role: "user", content: "hi" }],
    onContentDelta: chunk => { deltas.push(chunk); firstDelivered(); }, onReasoningDelta: chunk => deltas.push(chunk) }).then(result => { complete = true; return result; });
  await firstChunk;
  assert.equal(requests, 1);
  assert.equal(complete, false);
  assert.deepEqual(deltas, ["first"]);
  release();
  assert.equal((await request).content, "first second");
  assert.deepEqual(deltas, ["first", " second"]);
  assert.equal(logs[0].finishReason, "stop");
  assert.deepEqual(logs[0].requestMessages.map(message => [message.role, message.content]), [["user", "hi"]]);
});
