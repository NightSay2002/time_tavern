import assert from "node:assert/strict";
import test from "node:test";
import dotenv from "dotenv";
import fs from "node:fs";
import vm from "node:vm";
import { formatApiPriceOverridesEnv, getManualApiPricing, normalizePricingEndpoint, parseApiPriceOverrides } from "../src/public/api-price-overrides.js";

const row = { provider: "custom", model: "private-model", endpoint: "https://example.test/v1/chat/completions?api-key=secret", currency: "USD",
  inputCacheMissPerMillion: 2, inputCacheHitPerMillion: "", outputPerMillion: 5 };

test("manual prices require exact provider, model and sanitized endpoint without leaking URL credentials", () => {
  const source = JSON.stringify([row]);
  const price = getManualApiPricing(source, "custom", "private-model", "https://example.test/v1/chat/completions?api-version=1");
  assert.equal(price.endpoint, "https://example.test/v1/chat/completions");
  assert.equal(price.inputCacheHitPerMillion, null);
  assert.equal(getManualApiPricing(source, "custom", "other-model", row.endpoint), null);
  assert.equal(getManualApiPricing(source, "custom", "private-model", "https://other.test/v1/chat/completions"), null);
  assert.equal(getManualApiPricing(source, "gemini", "private-model", ""), null);
  assert.throws(() => normalizePricingEndpoint("custom", "https://user:password@example.test/v1"), /無效/u);
});

test("manual pricing validates missing, zero, invalid, duplicate and oversized entries", () => {
  assert.equal(parseApiPriceOverrides(JSON.stringify([{ ...row, inputCacheHitPerMillion: 0 }]))[0].inputCacheHitPerMillion, 0);
  for (const bad of [null, false, "", -1, "NaN", "Infinity", 1e10]) {
    assert.throws(() => parseApiPriceOverrides(JSON.stringify([{ ...row, outputPerMillion: bad }])), /單價/u);
  }
  assert.throws(() => parseApiPriceOverrides(JSON.stringify([row, row])), /重複/u);
  assert.throws(() => parseApiPriceOverrides(JSON.stringify(Array(101).fill(row))), /100/u);
  assert.throws(() => parseApiPriceOverrides("not-json"), /JSON/u);
  assert.equal(getManualApiPricing("not-json", "custom", row.model, row.endpoint), null);
});

test("price settings round trip through dotenv without escaped JSON or credential pollution", () => {
  const value = JSON.stringify([{ ...row, model: "vendor's/model" }]);
  const parsed = dotenv.parse(`API_PRICING_OVERRIDES=${formatApiPriceOverridesEnv(value)}\n`);
  assert.equal(parseApiPriceOverrides(parsed.API_PRICING_OVERRIDES)[0].model, "vendor's/model");
  assert.doesNotMatch(parsed.API_PRICING_OVERRIDES, /api-key|secret/u);
});

test("the actual environment serializer saves pricing JSON in dotenv-compatible form", () => {
  const source = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const scope = vm.createContext({
    saveCurrentChatApiProviderDraft() {}, collectEnvFieldValues: () => ({ API_PRICING_OVERRIDES: JSON.stringify([row]) }),
    collectEnvExtraEntries: () => [], ENV_FIELD_GROUPS: [{ title: "API 計價", fields: [{ key: "API_PRICING_OVERRIDES" }] }],
    formatApiPriceOverridesEnv, parseApiPriceOverrides
  });
  for (const name of ["formatEnvValue", "buildEnvContentFromForm"]) {
    const start = source.indexOf(`function ${name}(`);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
  const saved = dotenv.parse(scope.buildEnvContentFromForm());
  assert.equal(parseApiPriceOverrides(saved.API_PRICING_OVERRIDES)[0].outputPerMillion, 5);
});

test("pricing rows use numeric inputs and never assign a read-only select type", () => {
  const nodes = [];
  const node = tag => {
    const item = { tag, children: [], dataset: {}, events: {}, value: "", append(...items) { this.children.push(...items); },
      appendChild(child) { this.children.push(child); }, setAttribute() {}, add(option) { this.children.push(option); },
      addEventListener(name, callback) { this.events[name] = callback; } };
    if (tag === "select") Object.defineProperty(item, "type", { get: () => "select-one" });
    if (tag === "table") {
      item.createTHead = () => ({ insertRow: () => node("tr") });
      item.createTBody = () => ({ rows: [], insertRow() { const row = node("tr"); this.rows.push(row); return row; } });
    }
    if (tag === "tr") item.insertCell = () => { const cell = node("td"); item.children.push(cell); return cell; };
    nodes.push(item);
    return item;
  };
  const scope = vm.createContext({ document: { createElement: node }, Option: function(text, value) { this.text = text; this.value = value; },
    getEnvFieldValue: () => JSON.stringify([row]), createEnvField: () => assert.fail("valid data must use the row editor") });
  const source = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const start = source.indexOf("function createEnvPricingField(");
  vm.runInContext(source.slice(start, source.indexOf("\n}\n", start) + 2), scope);
  scope.createEnvPricingField({ key: "API_PRICING_OVERRIDES", label: "prices" }, {});
  assert.equal(nodes.filter(item => item.tag === "select").length, 2);
  assert.equal(nodes.filter(item => item.type === "number").length, 3);
});
