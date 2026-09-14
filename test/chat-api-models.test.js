import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { listChatApiModels, listOpenRouterProviders, listOpenRouterModelEndpoints, normalizeOpenRouterPricing, buildChatApiCompletionsUrl, isDeploymentChatCompletionsUrl, resolveChatApiModelForEndpoint, adaptChatApiRequestBody, buildChatApiRequestHeaders } from "../src/chat-api-endpoint.js";
import { buildChatApiRequestBody, fetchChatApiWithRetry, normalizeChatApiRetryCount } from "../src/chat-api-request.js";
import { createChatApiProviderDrafts, getChatApiProviderEnvEntries, getOfficialChatApiBaseUrl } from "../src/public/chat-api-provider-settings.js";
import { resolveChatApiKeyGroupPrimaryKey } from "../src/chat-api-key-config.js";

const config = { provider: "openrouter", baseUrl: "https://openrouter.ai/api/v1", apiKey: "test-only-key" };
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });

test("model list uses GET with the selected key and only returns unique model metadata", async () => {
  const result = await listChatApiModels(config, async (url, options) => {
    assert.equal(url, "https://openrouter.ai/api/v1/models");
    assert.equal(options.headers.Authorization, "Bearer test-only-key");
    assert.equal(options.body, undefined);
    assert.equal(options.redirect, "error");
    return json({ data: [{ id: "z/model", name: "Z", other: "private" }, { id: "a/model" }, { id: "a/model" }, {}] });
  });
  assert.deepEqual(result, [{ id: "a/model", name: "a/model", pricing: {}, inputModalities: [], contextLength: null }, { id: "z/model", name: "Z", pricing: {}, inputModalities: [], contextLength: null }]);
});

test("model listing handles provider base paths, full completions URLs and query parameters", async () => {
  for (const provider of ["deepseek", "openai", "gemini", "openrouter"]) {
    const baseUrl = getOfficialChatApiBaseUrl(provider);
    await listChatApiModels({ ...config, provider, baseUrl }, async (url) => {
      assert.equal(url, `${baseUrl}/models`);
      return json({ data: [] });
    });
  }
  await listChatApiModels({ ...config, provider: "custom", baseUrl: "https://example.test/v1/chat/completions?api-version=v1" }, async (url) => {
    assert.equal(url, "https://example.test/v1/models?api-version=v1");
    return json({ data: [] });
  });
});

test("model listing follows bounded cursor pagination", async () => {
  let calls = 0;
  const result = await listChatApiModels(config, async (url) => {
    calls += 1;
    if (calls === 1) return json({ data: [{ id: "a" }], has_more: true, last_id: "a" });
    assert.equal(new URL(url).searchParams.get("after"), "a");
    return json({ data: [{ id: "b" }] });
  });
  assert.equal(calls, 2);
  assert.deepEqual(result.map((item) => item.id), ["a", "b"]);
  await assert.rejects(listChatApiModels(config, async () => json({ data: [{ id: "a" }], has_more: true })), /分頁異常/u);
});

test("model listing does not fetch with missing credentials or guess deployment model endpoints", async () => {
  const noFetch = async () => assert.fail("must not fetch");
  await assert.rejects(listChatApiModels({ ...config, provider: "zhipu" }, noFetch), /未公開/u);
  await assert.rejects(listChatApiModels({ ...config, provider: "openai", apiKey: "" }, noFetch), /API Key/u);
  await assert.rejects(listChatApiModels({ ...config, baseUrl: "https://example.test/deployments/a/chat/completions" }, noFetch), /deployment/u);
  await assert.rejects(listChatApiModels({ ...config, baseUrl: "file:///tmp/x" }, noFetch), /有效/u);
  await listChatApiModels({ ...config, apiKey: "" }, async (_, options) => {
    assert.equal(options.headers.Authorization, undefined);
    return json({ data: [] });
  });
});

test("model list errors never echo upstream secrets or silently invent a list", async () => {
  await assert.rejects(listChatApiModels(config, async () => json({ error: "secret-key" }, 401)), (error) => {
    assert.match(error.message, /HTTP 401/u);
    assert.doesNotMatch(error.message, /secret-key/u);
    return true;
  });
  await assert.rejects(listChatApiModels(config, async () => new Response("not json")), /JSON/u);
  await assert.rejects(listChatApiModels(config, async () => json({ models: [] })), /標準模型清單/u);
  await assert.rejects(listChatApiModels(config, async () => { throw new Error("secret-key"); }), /無法連接/u);
});

test("model list aborts a slow upstream after 15 seconds", async () => {
  const listWithFastTimer = vm.runInNewContext(`(${listChatApiModels.toString()})`, {
    text: (value) => typeof value === "string" ? value.trim() : "",
    buildChatApiCompletionsUrl, isDeploymentChatCompletionsUrl, URL, AbortController,
    setTimeout(callback, milliseconds) {
      assert.equal(milliseconds, 15000);
      queueMicrotask(callback);
      return 1;
    },
    clearTimeout() {}
  });
  const pending = listWithFastTimer(config, (_, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
  }));
  await assert.rejects(pending, /逾時/u);
});

test("OpenRouter key groups and models survive switching without borrowing another provider key", () => {
  const { drafts } = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "openrouter", OPENROUTER_API_KEY: "router-1", OPENROUTER_API_KEY2: "router-processing",
    OPENROUTER_API_KEY_GROUP2: "router-2", OPENROUTER_MODEL: "openai/gpt-4.1", DEEPSEEK_API_KEY: "deepseek-1"
  });
  const env = Object.fromEntries(getChatApiProviderEnvEntries(drafts));
  assert.equal(env.OPENROUTER_MODEL, "openai/gpt-4.1");
  assert.equal(env.OPENROUTER_API_KEY2, "router-processing");
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openrouter", 2), "router-2");
  assert.equal(resolveChatApiKeyGroupPrimaryKey({ DEEPSEEK_API_KEY: "other" }, "openrouter"), "");
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "deepseek"), "deepseek-1");
});

test("OpenRouter provider catalog and provider-filtered vision models use separate official APIs", async () => {
  const providers = await listOpenRouterProviders(config, async (url) => {
    assert.equal(url, "https://openrouter.ai/api/v1/providers");
    return json({ data: [{ name: "Z", slug: "z" }, { name: "DeepInfra", slug: "deepinfra" }, {}] });
  });
  assert.deepEqual(providers, [{ name: "DeepInfra", slug: "deepinfra" }, { name: "Z", slug: "z" }]);
  const models = await listChatApiModels({ ...config, openrouterProvider: "deepinfra/fp8", imageOnly: true }, async (url) => {
    assert.equal(new URL(url).searchParams.get("providers"), "deepinfra");
    assert.equal(new URL(url).searchParams.get("input_modalities"), "image");
    return json({ data: [{ id: "author/vision", pricing: { prompt: "0", completion: "0.000002" }, architecture: { input_modalities: ["text", "image"] }, context_length: 65536 }] });
  });
  assert.equal(models[0].contextLength, 65536);
  assert.equal(models[0].pricing.prompt, "0");
  assert.deepEqual(models[0].inputModalities, ["text", "image"]);
});

test("OpenRouter endpoint prices preserve exact routes, zero, missing rates and health status", async () => {
  const result = await listOpenRouterModelEndpoints({ ...config, model: "author/model:free" }, async (url) => {
    assert.equal(url, "https://openrouter.ai/api/v1/models/author/model%3Afree/endpoints");
    return json({ data: { id: "author/model:free", architecture: { input_modalities: ["image"] }, endpoints: [
      { tag: "deepinfra/fp8", provider_name: "DeepInfra", pricing: { prompt: "0", completion: "0.000001", request: "0.01", input_cache_read: null }, status: -2 },
      { tag: "azure/us", provider_name: "Azure", pricing: { prompt: "0.000003" }, status: 0 }
    ] } });
  });
  assert.equal(result.endpoints.length, 2);
  assert.equal(result.endpoints[0].tag, "deepinfra/fp8");
  assert.equal(result.endpoints[0].status, -2);
  assert.deepEqual(result.endpoints[0].pricing, { prompt: "0", completion: "0.000001", request: "0.01" });
  assert.deepEqual(normalizeOpenRouterPricing({ prompt: -1, completion: "secret", image: "", request: false }), {});
  await assert.rejects(listOpenRouterModelEndpoints({ ...config, model: "../models" }, async () => assert.fail()), /完整/u);
  await assert.rejects(listOpenRouterProviders({ provider: "deepseek" }, async () => assert.fail()), /僅適用/u);
  await assert.rejects(listOpenRouterProviders(config, async () => json({ error: "secret" }, 401)), /HTTP 401/u);
  await assert.rejects(listOpenRouterProviders(config, async () => new Response("secret")), /無法讀取/u);
});

test("OpenRouter routing is strict only when selected and never leaks to direct providers", () => {
  for (const stream of [true, false]) {
    for (const slug of ["deepinfra", "deepinfra/fp8", "azure/us"]) {
      const body = buildChatApiRequestBody({ provider: "openrouter", openrouterProvider: slug, model: "author/model", messages: [], stream });
      assert.deepEqual(body.provider, { only: [slug], order: [slug], allow_fallbacks: false });
    }
  }
  assert.equal(buildChatApiRequestBody({ provider: "openrouter", messages: [] }).provider, undefined);
  assert.equal(buildChatApiRequestBody({ provider: "deepseek", openrouterProvider: "deepinfra", messages: [] }).provider, undefined);
  assert.throws(() => buildChatApiRequestBody({ provider: "openrouter", openrouterProvider: "bad value", messages: [] }), /無效/u);
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const calls = [...source.matchAll(/buildChatApiRequestBody\(\{([\s\S]*?)\}\),/gu)];
  assert.equal(calls.length, 4);
  assert.ok(calls.every((call) => call[1].includes("openrouterProvider:")), "test, image, nonstream and stream all receive routing");
});

test("OpenRouter usage keeps actual USD charges including free usage without direct-provider estimation", async () => {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const scope = vm.createContext({ safeText: (value) => String(value ?? "").trim(), TextDecoder });
  for (const name of ["normalizeAiUsageCost", "normalizeAiUsage", "calculateAiUsageCost", "extractChatApiMessageText", "hasUsageTokens", "readChatApiStreamBody"]) {
    const start = source.indexOf(`${name === "readChatApiStreamBody" ? "async " : ""}function ${name}(`);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
  for (const amount of [0, 0.0023]) {
    const usage = scope.normalizeAiUsage({ prompt_tokens: 500, completion_tokens: 20, cost: amount }, "openrouter");
    assert.equal(usage.cost.amount, amount);
    assert.equal(usage.cost.currency, "USD");
    const reloaded = scope.normalizeAiUsage(JSON.parse(JSON.stringify(usage)));
    assert.equal(scope.calculateAiUsageCost(reloaded, "deepseek/deepseek-v4-pro").amount, amount);
  }
  const missing = scope.normalizeAiUsage({ prompt_tokens: 100 }, "openrouter");
  assert.equal(scope.calculateAiUsageCost(missing, "deepseek/deepseek-v4-pro"), null);
  const streamed = await scope.readChatApiStreamBody(new Response('data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: {"choices":[],"usage":{"prompt_tokens":5,"completion_tokens":1,"cost":0.001}}\n\ndata: [DONE]\n\n'), { apiProvider: "openrouter" });
  assert.equal(streamed.usage.cost.amount, 0.001);
});

test("all four real request paths send independently selected inference routes", async () => {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const sent = [];
  const mainConfig = { ...config, model: "author/model", completionsUrl: `${config.baseUrl}/chat/completions`, openrouterProvider: "deepinfra/fp8" };
  const scope = vm.createContext({
    process: { env: {} }, state: {}, DEFAULT_CHAT_IMAGE_API_MAX_TOKENS: 1024,
    buildChatApiRequestBody, adaptChatApiRequestBody, buildChatApiRequestHeaders, clearTimeout,
    normalizeChatApiRetryCount,
    fetchChatApiWithRetry: (url, options, config) => fetchChatApiWithRetry(url, options, { ...config, fetchImpl: scope.fetch }),
    resolveChatApiTestConfig: () => mainConfig,
    resolveChatImageApiConfig: () => ({ ...mainConfig, openrouterProvider: "azure/us" }),
    getChatApiProvider: () => mainConfig.provider,
    envFirstText: () => mainConfig.openrouterProvider,
    validateChatImageApiConfig() {},
    buildChatImageUnderstandingMessages: () => [{ role: "user", content: [{ type: "image_url", image_url: { url: "data:image/png;base64,dGVzdA==" } }] }],
    getChatApiKey: () => "mock-key", getChatApiModel: () => "author/model",
    getChatApiCompletionsUrl: () => mainConfig.completionsUrl,
    getChatApiTemperature: () => 0.5, resolveChatApiMaxTokens: () => 1024,
    getChatApiReasoningEffort: () => "", getUiLanguage: () => "zh-TW",
    localizeChatApiMessages: (messages) => messages,
    sanitizeChatApiMessagesForLog: (messages) => messages,
    appendAiLogToState() {}, appendAiLog() {}, nowIso: () => "2026-09-08T00:00:00Z",
    createTimeoutController: () => ({ controller: new AbortController(), cleanup() {} }),
    isGenerationStoppedError: () => false, formatFetchErrorMessage: () => "mock transport stopped",
    safeText: (value) => String(value ?? "").trim(),
    fetch: async (url, options) => { sent.push({ url, body: JSON.parse(options.body) }); throw new Error("mock transport stopped"); }
  });
  for (const name of ["testChatApiConnection", "requestChatImageUnderstanding", "callChatApiCompletionRaw", "callChatApiCompletionStreamRaw"]) {
    const start = source.indexOf(`async function ${name}(`);
    vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  }
  assert.equal((await scope.testChatApiConnection()).ok, false);
  await assert.rejects(scope.requestChatImageUnderstanding(), /mock transport stopped/u);
  await assert.rejects(scope.callChatApiCompletionRaw({ messages: [] }), /mock transport stopped/u);
  await assert.rejects(scope.callChatApiCompletionStreamRaw({ messages: [] }), /mock transport stopped/u);
  assert.equal(sent.length, 4);
  for (const [index, slug] of ["deepinfra/fp8", "azure/us", "deepinfra/fp8", "deepinfra/fp8"].entries()) {
    assert.deepEqual(sent[index].body.provider, { only: [slug], order: [slug], allow_fallbacks: false });
  }
  mainConfig.provider = "deepseek";
  await scope.testChatApiConnection();
  assert.equal(sent.at(-1).body.provider, undefined);
});

test("all OpenRouter key groups are excluded from global and author defaults", () => {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const scope = vm.createContext({ safeText: (value) => String(value ?? "").trim() });
  const constants = source.indexOf("const DEFAULT_ENV_SECRET_KEY_PATTERN");
  vm.runInContext(source.slice(constants, source.indexOf("\n]);", constants) + 4), scope);
  const start = source.indexOf("function isDefaultEnvSecretKey(");
  vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  for (const key of ["OPENROUTER_API_KEY", "OPENROUTER_API_KEY2", "OPENROUTER_API_KEY_GROUP2", "OPENROUTER_API_KEY_GROUP2_2", "CHAT_IMAGE_API_KEY"]) {
    assert.equal(scope.isDefaultEnvSecretKey(key), true, key);
  }
  assert.equal(scope.isDefaultEnvSecretKey("OPENROUTER_MODEL"), false);
});

test("runtime, connection tests and image config enforce official URLs but preserve custom URLs", () => {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const env = {};
  const scope = vm.createContext({
    process: { env }, DEFAULT_CHAT_API_PROVIDER: "deepseek", DEFAULT_CHAT_API_MODEL: "default",
    normalizeChatApiRetryCount,
    safeText: (value) => String(value ?? "").trim(), buildChatApiCompletionsUrl, resolveChatApiModelForEndpoint,
    resolveChatApiKeyGroupPrimaryKey, resolveChatApiReasoningEffort: () => "", getChatApiRequestTimeoutMs: () => 30000,
    getChatApiReasoningEffort: () => "", normalizeChatApiMaxTokensParamName: () => "max_tokens"
  });
  for (const name of ["envFirstText", "envObjectFirstText", "envObjectFirstNumber", "normalizeChatApiProvider", "getChatApiProvider", "getDefaultChatApiBaseUrl", "getChatApiBaseUrl", "getChatApiCompletionsUrlFromBaseUrl", "getChatApiProviderBaseUrlAliases", "getChatApiProviderModelAliases", "getChatApiKeyGroupPrimaryKey", "resolveChatImageApiConfig", "resolveChatApiTestConfig"]) {
    const start = source.indexOf(`function ${name}(`);
    assert.ok(start >= 0, name);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
  for (const provider of ["deepseek", "openai", "gemini", "zhipu", "openrouter", "custom"]) {
    const base = "https://proxy.example.test/v1";
    Object.assign(env, { CHAT_API_PROVIDER: provider, CHAT_API_BASE_URL: base });
    const expected = provider === "custom" ? base : getOfficialChatApiBaseUrl(provider);
    assert.equal(scope.getChatApiBaseUrl(), expected);
    assert.equal(scope.resolveChatApiTestConfig(env).baseUrl, expected);
    assert.equal(scope.resolveChatImageApiConfig({ CHAT_IMAGE_API_PROVIDER: provider, CHAT_IMAGE_API_BASE_URL: base }).baseUrl, expected);
  }
  assert.equal(scope.resolveChatApiTestConfig({ CHAT_API_PROVIDER: "openrouter", CHAT_API_OPENROUTER_PROVIDER: "deepinfra/fp8", CHAT_IMAGE_API_OPENROUTER_PROVIDER: "azure/us" }).openrouterProvider, "deepinfra/fp8");
  assert.equal(scope.resolveChatImageApiConfig({ CHAT_IMAGE_API_PROVIDER: "openrouter", CHAT_API_OPENROUTER_PROVIDER: "deepinfra/fp8", CHAT_IMAGE_API_OPENROUTER_PROVIDER: "azure/us" }).openrouterProvider, "azure/us");
});
