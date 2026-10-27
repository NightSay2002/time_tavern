import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const server = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const web = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

function loadFunctions(scope, source, names) {
  for (const name of names) {
    const start = source.indexOf(`function ${name}(`);
    assert.ok(start >= 0, name);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
}

function pricingScope() {
  const scope = vm.createContext({ safeText: value => String(value ?? "").trim(), TextDecoder });
  const start = server.indexOf("const CHAT_API_COST_PRICING =");
  const end = server.indexOf("const openRouterEndpointPricing = new Map();", start);
  vm.runInContext(server.slice(start, end + "const openRouterEndpointPricing = new Map();".length), scope);
  loadFunctions(scope, server, ["nonNegativeUsageNumber", "normalizeAiUsageCost", "normalizeAiUsage", "cacheOpenRouterEndpointPricing", "getAiUsagePricingForModel", "calculateAiUsageCost", "normalizeAiLog", "appendAiLogToState", "extractChatApiMessageText", "hasUsageTokens"]);
  const stream = server.indexOf("async function readChatApiStreamBody(");
  vm.runInContext(server.slice(stream, server.indexOf("\n}\n", stream) + 2), scope);
  scope.nowIso = () => "2026-10-27T01:00:00.000Z";
  scope.newId = () => "test-log";
  scope.state = { aiLogs: [] };
  scope.saveState = () => {};
  return scope;
}

function uiScope() {
  const scope = vm.createContext({});
  loadFunctions(scope, web, ["getUsageCost", "getUsageCostLabel", "getUsageCostCurrency", "getCurrencySymbol", "getPricingUnitLabel", "formatCurrencyAmount", "formatUsageCostBreakdown", "formatUsage", "formatAiLogCostTotals"]);
  return scope;
}

const tokens = { prompt_tokens: 1000, completion_tokens: 100, prompt_tokens_details: { cached_tokens: 200 } };

test("usage preserves unknown numeric values and explicit zero without inventing free charges", () => {
  const p = pricingScope();
  for (const value of [null, undefined, "", " ", false, true, -1, Infinity, NaN]) {
    assert.equal(p.nonNegativeUsageNumber(value), null);
    assert.equal(p.normalizeAiUsageCost({ amount: value }), null);
  }
  assert.equal(p.normalizeAiUsageCost({ amountUsd: 0 }).currency, "USD");
  assert.equal(p.normalizeAiUsage({ promptTokens: null }).promptTokens, null);
  assert.equal(p.normalizeAiUsage({ prompt_tokens: 0 }).promptTokens, 0);
  const usage = p.normalizeAiUsage({ ...tokens, cost: 0 }, "openrouter");
  assert.equal(usage.cost.amount, 0);
  assert.equal(usage.cost.type, "actual");
});

test("provider-reported structured charges take precedence for every provider and retain their currency", () => {
  const p = pricingScope();
  for (const provider of ["deepseek", "openai", "gemini", "zhipu", "openrouter", "custom"]) {
    const usage = p.normalizeAiUsage({ ...tokens, cost: { amount: 0.123, currency: "HKD" } }, provider, "vendor/route");
    const cost = p.calculateAiUsageCost(usage, "deepseek-v4-pro");
    assert.equal(cost.type, "actual");
    assert.equal(cost.source, "api_response");
    assert.equal(cost.currency, "HKD");
    assert.equal(cost.amount, 0.123);
    assert.equal(cost.provider, provider);
    assert.equal(cost.endpoint, "vendor/route");
    assert.ok(cost.updatedAt);
    assert.deepEqual(JSON.parse(JSON.stringify(p.normalizeAiUsage(usage).cost)), JSON.parse(JSON.stringify(cost)));
  }
  assert.equal(p.normalizeAiUsage({ ...tokens, cost: 1 }, "custom").cost, null);
  assert.equal(p.normalizeAiUsage({ ...tokens, cost: { amount: 1 } }, "custom").cost, null);
});

test("official estimates match both provider and exact model rather than substrings", () => {
  const p = pricingScope();
  const known = { deepseek: "deepseek-v4-pro", gemini: "gemini-2.5-flash", openai: "gpt-5.4-mini" };
  for (const [provider, model] of Object.entries(known)) {
    const usage = p.normalizeAiUsage(tokens, provider);
    const cost = p.calculateAiUsageCost(usage, model);
    assert.equal(cost.type, "estimated");
    assert.equal(cost.provider, provider);
    assert.equal(cost.source, "official_pricing");
    assert.equal(cost.updatedAt, "2026-10-27");
    assert.match(cost.sourceUrl, /^https:\/\//u);
    assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage(tokens, "custom"), model), null);
    assert.equal(p.calculateAiUsageCost(usage, `${model}-unknown-variant`), null);
    assert.equal(p.calculateAiUsageCost(usage, `other/${model}`), null);
  }
  assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage(tokens, "zhipu"), "gemini-2.5-flash"), null);
  assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage(tokens), "deepseek-v4-pro"), null);
});

test("token tiers use the correct boundary and missing token counts never become zero estimates", () => {
  const p = pricingScope();
  for (const [provider, model, boundary, low, high] of [["gemini", "gemini-2.5-pro", 200000, 1.25, 2.5], ["openai", "gpt-5.4", 272000, 2.5, 5], ["openai", "gpt-5.5", 272000, 5, 10]]) {
    for (const [count, rate] of [[boundary, low], [boundary + 1, high]]) {
      const cost = p.calculateAiUsageCost(p.normalizeAiUsage({ prompt_tokens: count, completion_tokens: 5 }, provider), model);
      assert.equal(cost.inputCacheMissPerMillion, rate);
    }
    assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage({ completion_tokens: 5 }, provider), model), null);
    assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage({ prompt_tokens: 10 }, provider), model), null);
  }
  assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage({ prompt_tokens: 1, completion_tokens: 2, prompt_cache_hit_tokens: 5 }, "deepseek"), "deepseek-v4-pro"), null);
  assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage({ prompt_tokens: 100, completion_tokens: 2, prompt_cache_miss_tokens: 10 }, "deepseek"), "deepseek-v4-pro"), null);
  const ds = p.calculateAiUsageCost(p.normalizeAiUsage(tokens, "deepseek"), "deepseek-v4-pro");
  assert.equal(ds.inputCacheMissPerMillion, 9);
  assert.match(ds.note, /高峰.*保守估算/u);
});

test("new log append evaluates price once while reads and later catalog changes preserve its snapshot", () => {
  const p = pricingScope();
  p.appendAiLogToState({ id: "priced-once", model: "gemini-2.5-flash", usage: p.normalizeAiUsage(tokens, "gemini") });
  const log = p.state.aiLogs[0];
  assert.equal(log.usage.cost.type, "estimated");
  assert.equal(log.usage.cost.source, "official_pricing");
  const amount = log.usage.cost.amount;
  vm.runInContext('CHAT_API_COST_PRICING.find(rate => rate.label === "Gemini 2.5 Flash").outputPerMillion = 999', p);
  assert.equal(p.normalizeAiLog(log).usage.cost.amount, amount);
});

test("historical amounts are retained as estimates with unknown provenance instead of recalculated", () => {
  const p = pricingScope();
  const legacy = p.normalizeAiLog({ id: "old", model: "deepseek-v4-pro", createdAt: "2026-09-01", usage: { ...tokens, cost: { amount: 123, currency: "CNY" } } });
  assert.equal(legacy.usage.cost.amount, 123);
  assert.equal(legacy.usage.cost.type, "estimated");
  assert.equal(legacy.usage.cost.source, "legacy");
  assert.equal(legacy.usage.cost.updatedAt, "");
  const oldRouter = p.normalizeAiUsage({ ...tokens, accountingProvider: "openrouter", cost: { amount: 0, currency: "USD" } });
  assert.equal(oldRouter.cost.type, "actual");
  const usage = p.normalizeAiUsage(tokens, "gemini");
  usage.cost = p.calculateAiUsageCost(usage, "gemini-2.5-flash");
  const fresh = p.normalizeAiLog({ id: "new", model: "gemini-2.5-flash", usage });
  fresh.usage.cost.amount = 0.99;
  assert.equal(p.normalizeAiLog(fresh).usage.cost.amount, 0.99);
  assert.equal(p.normalizeAiUsage(fresh.usage, "gemini").cost.type, "estimated");
});

test("OpenRouter estimates only use a fresh, exactly selected endpoint and never direct-provider prices", () => {
  const p = pricingScope();
  const config = { provider: "openrouter", model: "author/model" };
  const catalog = { endpoints: [{ tag: "vendor/fp8", pricing: { prompt: "0.000002", completion: "0.000004", input_cache_read: "0.000001" } }] };
  p.cacheOpenRouterEndpointPricing(config, catalog);
  const usage = p.normalizeAiUsage(tokens, "openrouter", "vendor/fp8");
  const cost = p.calculateAiUsageCost(usage, config.model);
  assert.equal(cost.type, "estimated");
  assert.equal(cost.source, "openrouter_endpoint");
  assert.equal(cost.inputCacheMissPerMillion, 2);
  assert.equal(cost.amount, 0.0022);
  for (const route of ["", "vendor", "other/fp8"]) {
    assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage(tokens, "openrouter", route), config.model), null);
  }
  assert.equal(p.calculateAiUsageCost(usage, "deepseek-v4-pro"), null);
  assert.equal(p.normalizeAiLog({ model: config.model, usage }).usage.cost, null, "reading an older unknown charge must not reprice it");
  vm.runInContext('openRouterEndpointPricing.get("author/model").updatedAt = "2020-01-01"', p);
  assert.equal(p.calculateAiUsageCost(usage, config.model), null);
  usage.cost = cost;
  assert.equal(p.calculateAiUsageCost(p.normalizeAiUsage(usage), config.model).amount, 0.0022);
});

test("OpenRouter does not omit non-token charges or invent missing cache prices and bounds its cache", () => {
  const p = pricingScope();
  const config = { provider: "openrouter", model: "author/model" };
  const usage = p.normalizeAiUsage(tokens, "openrouter", "vendor");
  const cache = pricing => p.cacheOpenRouterEndpointPricing(config, { endpoints: [{ tag: "vendor", pricing }] });
  for (const key of ["image", "request", "web_search", "internal_reasoning", "input_cache_write"]) {
    cache({ prompt: "0", completion: "0", input_cache_read: "0", [key]: "0.01" });
    assert.equal(p.calculateAiUsageCost(usage, config.model), null);
  }
  cache({ prompt: "0", completion: "0" });
  assert.equal(p.calculateAiUsageCost(usage, config.model), null);
  cache({ prompt: "0", completion: "0", input_cache_read: "0" });
  assert.equal(p.calculateAiUsageCost(usage, config.model).amount, 0);
  for (let i = 0; i < 70; i++) p.cacheOpenRouterEndpointPricing({ ...config, model: `author/model-${i}` }, { endpoints: [] });
  assert.equal(vm.runInContext("openRouterEndpointPricing.size", p), 50);
});

test("streamed cost-only usage events preserve previously reported tokens and endpoint", async () => {
  const p = pricingScope();
  const response = new Response([
    `data: ${JSON.stringify({ choices: [{ delta: { content: "OK" } }], usage: { prompt_tokens: 100, completion_tokens: 20 } })}\n\n`,
    `data: ${JSON.stringify({ choices: [], usage: { cost: 0.2 } })}\n\n`,
    "data: [DONE]\n\n"
  ].join(""));
  const result = await p.readChatApiStreamBody(response, { apiProvider: "openrouter", apiEndpoint: "vendor/fp8" });
  assert.equal(result.content, "OK");
  assert.equal(result.usage.promptTokens, 100);
  assert.equal(result.usage.completionTokens, 20);
  assert.equal(result.usage.cost.amount, 0.2);
  assert.equal(result.usage.cost.type, "actual");
  assert.equal(result.usage.accountingEndpoint, "vendor/fp8");
});

test("web distinguishes actual, estimated, zero and unknown charges with source details", () => {
  const ui = uiScope();
  const actual = { cost: { amount: 0, currency: "USD", type: "actual", source: "api_response", updatedAt: "2026-10-27" } };
  const estimated = { cost: { amount: 1, currency: "CNY", type: "estimated", source: "official_pricing", sourceUrl: "https://pricing.test", updatedAt: "2026-10-27" } };
  assert.match(ui.formatUsage(actual), /實際費用 \$0/u);
  assert.match(ui.formatUsage(estimated), /估算費用 ¥1/u);
  assert.match(ui.formatUsage({ promptTokens: 10 }), /價格未知/u);
  assert.match(ui.formatUsageCostBreakdown(estimated), /官方牌價快照[\s\S]*https:\/\/pricing.test[\s\S]*2026-10-27/u);
  assert.match(ui.formatUsageCostBreakdown({}), /不計為免費/u);
  const totals = ui.formatAiLogCostTotals([{ usage: actual }, { usage: estimated }, { usage: {} }]);
  assert.match(totals, /實際費用：\$0 USD/u);
  assert.match(totals, /估算費用：¥1 CNY/u);
  assert.match(totals, /價格未知：1 筆/u);
  assert.equal(ui.formatCurrencyAmount(2, "HKD"), "HKD 2");
  assert.equal(ui.getUsageCost({ cost: { amount: "" } }), null);
});
