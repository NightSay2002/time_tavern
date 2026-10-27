import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { buildChatApiRequestBody, canDisableChatApiReasoning, canSetChatApiReasoningStrength, resolveChatApiReasoningEffort } from "../src/chat-api-request.js";
import { canDisableChatApiReasoning as webCanDisable, getGeminiReasoningEfforts, normalizeChatApiProviderSetting } from "../src/public/chat-api-provider-settings.js";
import { buildChatApiCompletionsUrl, resolveChatApiModelForEndpoint } from "../src/chat-api-endpoint.js";

const web = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const server = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const matrix = [
  ["gemini-4-argon", ["low", "medium", "high"]],
  ["models/gemini-4-argon", ["low", "medium", "high"]],
  ["gemini-3.8-flash", ["low", "medium", "high"]],
  ["gemini-3.1-pro-preview", ["low", "medium", "high"]],
  ["gemini-3-pro-preview", ["low", "high"]],
  ["gemini-3-flash-preview", ["minimal", "low", "medium", "high"]],
  ["gemini-3.1-flash-lite-preview", ["minimal", "low", "medium", "high"]],
  ["gemini-3.5-flash-lite", ["minimal", "low", "medium", "high"]],
  ["gemini-3.6-flash", ["minimal", "low", "medium", "high"]],
  ["gemini-3.1-flash-lite-image", ["minimal", "high"]],
  ["gemini-robotics-er-2-preview", ["minimal", "low", "medium", "high"]],
  ["gemini-2.5-pro", ["low", "medium", "high"]],
  ["gemini-2.5-flash", ["none", "low", "medium", "high"]],
  ["gemini-2.5-flash-lite", ["none", "low", "medium", "high"]],
  ["gemini-2.5-flash-preview-09-2025", ["none", "low", "medium", "high"]],
  ["gemini-2.5-flash-image", []],
  ["gemini-2.5-flash-preview-tts", []],
  ["gemini-2.0-flash", []],
  ["gemini-unknown", []],
  ["other/gemini-4-argon", []]
];

function loadFunctions(scope, source, names) {
  for (const name of names) {
    const start = source.indexOf(`function ${name}(`);
    assert.ok(start >= 0, name);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  }
}

test("Google model capabilities are shared by web and server and reject unsupported strengths", () => {
  for (const [model, efforts] of matrix) {
    assert.deepEqual(getGeminiReasoningEfforts(model), efforts, model);
    assert.equal(webCanDisable("gemini", model), efforts.includes("none"), model);
    assert.equal(canDisableChatApiReasoning("gemini", model), efforts.includes("none"), model);
    assert.equal(canSetChatApiReasoningStrength("gemini", model), efforts.some(value => value !== "none"), model);
    for (const value of ["", "none", "minimal", "low", "medium", "high", "max", "invalid"]) {
      assert.equal(resolveChatApiReasoningEffort("gemini", value, model), efforts.includes(value) ? value : "", `${model}: ${value}`);
    }
  }
});

test("Google request bodies send only the selected supported effort for text, images and streaming", () => {
  for (const [model, efforts] of matrix) {
    for (const stream of [false, true]) {
      for (const effort of [...efforts, "", "max"]) {
        const messages = [{ role: "user", content: [{ type: "text", text: "fixture" }, { type: "image_url", image_url: { url: "data:image/png;base64,test" } }] }];
        const body = buildChatApiRequestBody({ provider: "gemini", model, reasoningEffort: effort, messages, maxTokens: 4096, stream });
        assert.equal(body.model, model);
        assert.equal(body.reasoning_effort, efforts.includes(effort) ? effort : undefined);
        assert.equal(body.thinking, undefined);
        assert.equal(body.extra_body, undefined);
        assert.equal(body.messages, messages);
      }
    }
  }
  assert.equal(resolveChatApiReasoningEffort("gemini", " MEDIUM ", "gemini-4-argon"), "medium");
});

function uiScope() {
  const makeField = (value = "") => ({ value, disabled: false, closest: () => ({ classList: { toggle() {} } }) });
  const fields = new Map();
  const efforts = ["", "none", "minimal", "low", "medium", "high", "max"];
  for (const prefix of ["CHAT_API", "CHAT_IMAGE_API"]) {
    fields.set(`envField_${prefix}_PROVIDER`, makeField("gemini"));
    fields.set(`envField_${prefix}_MODEL`, makeField("gemini-4-argon"));
    fields.set(`envField_${prefix}_REASONING_EFFORT`, { ...makeField(), options: efforts.map(value => ({ value })) });
    fields.set(`envField_${prefix}_BASE_URL`, makeField());
    fields.set(`envField_${prefix}_KEY`, makeField("test-only-key"));
  }
  fields.set("envField_CHAT_IMAGE_INPUT_MODE", makeField("specialist"));
  fields.set("envField_CHAT_IMAGE_API_TEMPERATURE", makeField("0.7"));
  const scope = vm.createContext({
    activeChatApiProviderSetting: "gemini", canDisableChatApiReasoning: webCanDisable,
    getGeminiReasoningEfforts, normalizeChatApiProviderSetting,
    document: { getElementById: id => fields.get(id), querySelector: () => null },
    syncApiBaseUrlField() {}, syncApiCatalogControls() {}, setChatImageApiTestStatus() {}
  });
  loadFunctions(scope, web, ["syncChatApiReasoningField", "syncChatImageApiFields"]);
  return { scope, fields };
}

test("both Google selectors expose the same supported options, including medium and minimal", () => {
  const { scope, fields } = uiScope();
  for (const [model, efforts] of matrix) {
    for (const prefix of ["CHAT_API", "CHAT_IMAGE_API"]) {
      fields.get(`envField_${prefix}_MODEL`).value = model;
      const input = fields.get(`envField_${prefix}_REASONING_EFFORT`);
      input.value = "max";
      if (prefix === "CHAT_API") scope.syncChatApiReasoningField();
      else scope.syncChatImageApiFields();
      assert.equal(input.disabled, efforts.length === 0, `${prefix}: ${model}`);
      assert.deepEqual(input.options.filter(option => !option.hidden).map(option => option.value), ["", ...efforts]);
      assert.equal(input.value, "", "unsupported values reset to API default");
    }
  }
});

test("specialist strength and temperature remain independent and disabled mode preserves contents", () => {
  const { scope, fields } = uiScope();
  const image = fields.get("envField_CHAT_IMAGE_API_REASONING_EFFORT");
  const temperature = fields.get("envField_CHAT_IMAGE_API_TEMPERATURE");
  image.value = "medium";
  fields.get("envField_CHAT_API_REASONING_EFFORT").value = "high";
  scope.syncChatImageApiFields();
  assert.equal(image.value, "medium");
  assert.equal(temperature.disabled, true);
  assert.equal(temperature.value, "0.7");
  assert.equal(fields.get("envField_CHAT_API_REASONING_EFFORT").value, "high");
  fields.get("envField_CHAT_IMAGE_INPUT_MODE").value = "main";
  scope.syncChatImageApiFields();
  assert.equal(image.disabled, true);
  assert.equal(image.value, "medium");
  fields.get("envField_CHAT_IMAGE_INPUT_MODE").value = "specialist";
  fields.get("envField_CHAT_IMAGE_API_MODEL").value = "gemini-2.5-flash";
  image.value = "none";
  scope.syncChatImageApiFields();
  assert.equal(temperature.disabled, false);
});

test("real server config resolvers keep main and specialist reasoning separate", () => {
  const scope = vm.createContext({
    process: { env: {} }, DEFAULT_CHAT_API_PROVIDER: "deepseek", DEFAULT_CHAT_API_MODEL: "deepseek-v4-pro",
    safeText: value => typeof value === "string" ? value.trim() : "", resolveChatApiReasoningEffort,
    getChatApiProvider: () => "gemini", getChatApiRequestTimeoutMs: () => 600000,
    getChatApiCompletionsUrlFromBaseUrl: buildChatApiCompletionsUrl, resolveChatApiModelForEndpoint
  });
  loadFunctions(scope, server, ["envObjectFirstText", "envObjectFirstNumber", "normalizeChatApiProvider", "getDefaultChatApiBaseUrl", "getChatApiProviderModelAliases", "getChatApiReasoningEffort", "resolveChatImageApiConfig"]);
  const env = { CHAT_API_PROVIDER: "gemini", CHAT_API_MODEL: "gemini-4-argon", CHAT_API_REASONING_EFFORT: "high", CHAT_IMAGE_API_PROVIDER: "gemini", CHAT_IMAGE_API_MODEL: "gemini-4-argon", CHAT_IMAGE_API_REASONING_EFFORT: "medium", CHAT_IMAGE_API_TEMPERATURE: "0.7" };
  assert.equal(scope.getChatApiReasoningEffort(env, "gemini"), "high");
  assert.equal(scope.resolveChatImageApiConfig(env).reasoningEffort, "medium");
  assert.equal(scope.resolveChatImageApiConfig(env).temperature, null);
  const disabled = scope.resolveChatImageApiConfig({ ...env, CHAT_IMAGE_API_MODEL: "gemini-2.5-flash", CHAT_IMAGE_API_REASONING_EFFORT: "none" });
  assert.equal(disabled.reasoningEffort, "none");
  assert.equal(disabled.temperature, 0.7);
  assert.equal(scope.resolveChatImageApiConfig({ ...env, CHAT_IMAGE_API_REASONING_EFFORT: "max" }).reasoningEffort, "");
});
