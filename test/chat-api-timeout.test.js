import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { buildChatApiRequestBody, fetchChatApiWithRetry, normalizeChatApiRetryCount, normalizeChatApiMaxTokensParamName } from "../src/chat-api-request.js";
import { buildChatApiCompletionsUrl, resolveChatApiModelForEndpoint, isDeploymentChatCompletionsUrl, adaptChatApiRequestBody, buildChatApiRequestHeaders } from "../src/chat-api-endpoint.js";
import { fetchGeminiNative } from "../src/gemini-native.js";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function scopeForTest() {
  const timers = new Map();
  let timerId = 0;
  const scope = vm.createContext({
    AbortController, DEFAULT_CHAT_API_PROVIDER: "deepseek", DEFAULT_CHAT_API_MODEL: "deepseek-v4-pro",
    GENERATION_STOPPED_MESSAGE: "已停止生成", serverTimeout: 600000,
    safeText: value => typeof value === "string" ? value.trim() : "",
    getChatApiRequestTimeoutMs: () => scope.serverTimeout,
    getPrimaryChatApiKey: () => "test-only-key", getChatApiReasoningEffort: () => "",
    isGenerationStoppedError: error => error?.code === "GENERATION_STOPPED",
    getCurrentConversationContextId: () => "local", nowIso: () => "2026-10-27",
    registerActiveGenerationRequest: entry => { scope.active = entry; },
    clearActiveGenerationRequest: entry => { if (scope.active === entry) scope.active = null; },
    buildChatApiCompletionsUrl, resolveChatApiModelForEndpoint, isDeploymentChatCompletionsUrl,
    adaptChatApiRequestBody, buildChatApiRequestHeaders, buildChatApiRequestBody,
    fetchChatApiWithRetry, normalizeChatApiRetryCount, normalizeChatApiMaxTokensParamName,
    fetchGeminiNative: (url, options, fetchImpl) => fetchImpl(url, options),
    normalizeAiUsage: value => value,
    setTimeout(callback, milliseconds) { const id = ++timerId; timers.set(id, { callback, milliseconds }); return id; },
    clearTimeout: id => timers.delete(id)
  });
  for (const name of ["envObjectFirstText", "envObjectFirstNumber", "normalizeChatApiProvider", "getDefaultChatApiBaseUrl", "getChatApiCompletionsUrlFromBaseUrl", "getChatApiProviderModelAliases", "getChatApiProviderBaseUrlAliases", "resolveChatApiTestConfig", "createTimeoutController", "formatFetchErrorMessage", "extractChatApiMessageText"]) {
    const start = source.indexOf(`function ${name}(`);
    assert.ok(start >= 0, name);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
  for (const name of ["testChatApiConnection", "testChatImageApiConnection"]) {
    const start = source.indexOf(`async function ${name}(`);
    vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  }
  return { scope, timers };
}

const env = { CHAT_API_PROVIDER: "gemini", CHAT_API_MODEL: "gemini-4-argon", CHAT_API_REQUEST_TIMEOUT_MS: "600000", CHAT_API_RETRY_COUNT: "0" };
const json = data => new Response(JSON.stringify(data));

test("connection tests honor every provider's unsaved timeout without a thirty second cap", () => {
  const { scope } = scopeForTest();
  for (const provider of ["deepseek", "openai", "gemini", "zhipu", "openrouter", "custom"]) {
    assert.equal(scope.resolveChatApiTestConfig({ ...env, CHAT_API_PROVIDER: provider }).requestTimeoutMs, 600000);
    assert.equal(scope.resolveChatApiTestConfig({ ...env, CHAT_API_PROVIDER: provider, CHAT_API_REQUEST_TIMEOUT_MS: "90000" }).requestTimeoutMs, 90000);
  }
  assert.equal(scope.resolveChatApiTestConfig({ ...env, CHAT_API_TEST_TIMEOUT_MS: "15000" }).requestTimeoutMs, 15000);
  assert.equal(scope.resolveChatApiTestConfig({}).requestTimeoutMs, 600000);
});

test("timeout messages use the captured request limit instead of the latest global timeout", () => {
  const { scope, timers } = scopeForTest();
  const tracked = scope.createTimeoutController(90000, { trackGeneration: true, purpose: "test" });
  assert.equal(tracked.generationEntry.timeoutMs, 90000);
  assert.equal(scope.active, tracked.generationEntry);
  scope.serverTimeout = 1200000;
  timers.get(tracked.timeout).callback();
  assert.equal(tracked.controller.signal.aborted, true);
  assert.equal(tracked.generationEntry.timedOut, true);
  assert.match(scope.formatFetchErrorMessage(new DOMException("aborted", "AbortError"), tracked.generationEntry), /90秒內未完成/u);
  assert.match(scope.formatFetchErrorMessage(new DOMException("timeout", "TimeoutError"), null, 30000), /30秒內未完成/u);
  tracked.generationEntry.stoppedByUser = true;
  assert.equal(scope.formatFetchErrorMessage(new DOMException("aborted", "AbortError"), tracked.generationEntry), "已停止生成");
  tracked.cleanup();
  assert.equal(scope.active, null);
  assert.equal(timers.size, 0);
});

test("timers clamp tiny and overflowing values and untracked tests do not replace an active story", () => {
  const { scope, timers } = scopeForTest();
  const active = { purpose: "story" };
  scope.active = active;
  for (const [requested, expected] of [[1, 1000], [30000, 30000], [600000, 600000], [99999999999, 2147483647]]) {
    const request = scope.createTimeoutController(requested);
    assert.equal(request.timeoutMs, expected);
    assert.equal(timers.get(request.timeout).milliseconds, expected);
    request.cleanup();
    assert.equal(scope.active, active);
  }
  assert.equal(timers.size, 0);
});

test("Gemini connection test reserves thinking output tokens and retains the selected model", async () => {
  const { scope, timers } = scopeForTest();
  let requestBody;
  scope.fetchModelApi = async (url, options) => {
    requestBody = JSON.parse(options.body);
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions");
    assert.equal([...timers.values()][0].milliseconds, 600000);
    return json({ choices: [{ message: { content: "OK" }, finish_reason: "stop" }] });
  };
  const result = await scope.testChatApiConnection(env);
  assert.equal(result.ok, true);
  assert.equal(requestBody.model, "gemini-4-argon");
  assert.equal(requestBody.max_tokens, 4096);
  assert.equal(requestBody.temperature, undefined);
  assert.equal(timers.size, 0);
});

test("Gemini connection test uses native BLOCK_NONE without the preset", async () => {
  const { scope } = scopeForTest();
  scope.fetchGeminiNative = fetchGeminiNative;
  scope.fetchModelApi = async (url, options) => {
    assert.equal(url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent");
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.maxOutputTokens, 4096);
    assert.equal(body.systemInstruction, undefined);
    assert.ok(body.safetySettings.length === 4 && body.safetySettings.every(item => item.threshold === "BLOCK_NONE"));
    return json({ candidates: [{ content: { parts: [{ text: "OK" }] }, finishReason: "STOP" }] });
  };
  const result = await scope.testChatApiConnection(env);
  assert.equal(result.ok, true);
  assert.equal(result.finishReason, "stop");
});

test("connection and response-body deadlines report the test limit without retries or leaked timers", async () => {
  for (const phase of ["connect", "body"]) {
    const { scope, timers } = scopeForTest();
    let calls = 0;
    let bodyStarted;
    const bodyReady = new Promise(resolve => { bodyStarted = resolve; });
    scope.fetchModelApi = async (_, { signal }) => {
      calls += 1;
      const pending = () => new Promise((resolve, reject) => {
        signal.addEventListener("abort", () => reject(signal.reason), { once: true });
        bodyStarted();
      });
      return phase === "connect" ? pending() : { ok: true, status: 200, text: pending };
    };
    const pending = scope.testChatApiConnection({ ...env, CHAT_API_TEST_TIMEOUT_MS: "45000" });
    await bodyReady;
    const timer = [...timers.values()][0];
    assert.equal(timer.milliseconds, 45000);
    timer.callback();
    const result = await pending;
    assert.equal(result.ok, false);
    assert.match(result.message, /45秒內未完成/u);
    assert.doesNotMatch(result.message, /600秒/u);
    assert.equal(calls, 1);
    assert.equal(timers.size, 0);
  }
});

test("empty generated text is not reported as a successful connection test", async () => {
  const { scope } = scopeForTest();
  for (const finish of ["stop", "length", "MAX_TOKENS", ""]) {
    scope.fetchModelApi = async () => json({ choices: [{ message: { content: "", reasoning_content: "thinking only" }, finish_reason: finish }] });
    const result = await scope.testChatApiConnection(env);
    assert.equal(result.ok, false);
    assert.match(result.message, /未回傳可見文字/u);
    if (/length|max_tokens/iu.test(finish)) assert.match(result.message, /輸出預算/u);
  }
});

test("image connection tests retain their configured timeout instead of imposing thirty seconds", async () => {
  const { scope } = scopeForTest();
  scope.CHAT_IMAGE_API_TEST_IMAGE = "data:image/png;base64,test";
  scope.resolveChatImageApiConfig = () => ({ provider: "gemini", configuredModel: "gemini-4-argon", requestTimeoutMs: 120000 });
  scope.requestChatImageUnderstanding = async options => {
    assert.equal(options.requestTimeoutMs, 120000);
    assert.equal(options.images.length, 1);
    return { content: "test image" };
  };
  assert.equal((await scope.testChatImageApiConnection({})).ok, true);
});

test("Gemini image connection and real image analysis do not inject a preset", async () => {
  const { scope } = scopeForTest();
  const logged = [];
  const sent = [];
  scope.fetchGeminiNative = fetchGeminiNative;
  scope.CHAT_IMAGE_API_TEST_IMAGE = "data:image/png;base64,dGVzdA==";
  scope.DEFAULT_CHAT_IMAGE_API_MAX_TOKENS = 1024;
  scope.resolveChatImageApiConfig = () => ({ provider: "gemini", configuredModel: "gemini-4-argon", model: "gemini-4-argon",
    apiKey: "test-key", completionsUrl: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", requestTimeoutMs: 120000 });
  scope.validateChatImageApiConfig = () => {};
  scope.buildChatImageUnderstandingMessages = () => [{ role: "user", content: [{ type: "text", text: "describe" },
    { type: "image_url", image_url: { url: "data:image/png;base64,dGVzdA==" } }] }];
  scope.sanitizeChatApiMessagesForLog = messages => [...messages];
  scope.throwIfGenerationStopped = () => {};
  scope.appendAiLogToState = entry => logged.push(entry);
  scope.fetchModelApi = async (_url, options) => {
    sent.push(JSON.parse(options.body));
    return json({ candidates: [{ content: { parts: [{ text: "image description" }] }, finishReason: "STOP" }] });
  };
  const start = source.indexOf("async function requestChatImageUnderstanding(");
  vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  assert.equal((await scope.testChatImageApiConnection({})).ok, true);
  assert.equal(sent[0].systemInstruction, undefined);
  await scope.requestChatImageUnderstanding({ envSource: {}, writeLog: true, targetState: {}, images: [] });
  assert.equal(sent[1].systemInstruction, undefined);
  assert.equal(logged[0].requestMessages.length, 1);
  assert.equal(logged[0].requestMessages[0].role, "user");
});
