import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  canDisableChatApiReasoning,
  createChatApiProviderDrafts,
  getChatApiProviderEnvEntries,
  normalizeChatApiProviderSetting,
  resolveChatApiReasoningEffort
} from "../src/public/chat-api-provider-settings.js";

const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

test("chat API provider drafts preserve each provider key, model, and base URL", () => {
  const { activeProvider, drafts } = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "deepseek",
    CHAT_API_KEY: "current-deepseek-key",
    CHAT_API_KEY2: "current-deepseek-processing-2",
    CHAT_API_KEY3: "current-deepseek-processing-3",
    CHAT_API_MODEL: "deepseek-v4-pro",
    CHAT_API_BASE_URL: "https://api.deepseek.com",
    ZHIPU_API_KEY: "saved-zhipu-key",
    ZHIPU_API_KEY2: "saved-zhipu-processing-2",
    ZHIPU_MODEL: "glm-5.3-flash",
    ZHIPU_BASE_URL: "https://open.bigmodel.cn/api/paas/v4"
  });

  assert.equal(activeProvider, "deepseek");
  assert.deepEqual(drafts.deepseek, {
    keyGroups: [{
      key: "current-deepseek-key",
      processingKeys: ["current-deepseek-processing-2", "current-deepseek-processing-3"]
    }],
    key: "current-deepseek-key",
    processingKeys: ["current-deepseek-processing-2", "current-deepseek-processing-3"],
    model: "deepseek-v4-pro",
    baseUrl: "https://api.deepseek.com"
  });
  assert.deepEqual(drafts.zhipu, {
    keyGroups: [{
      key: "saved-zhipu-key",
      processingKeys: ["saved-zhipu-processing-2"]
    }],
    key: "saved-zhipu-key",
    processingKeys: ["saved-zhipu-processing-2"],
    model: "glm-5.3-flash",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4"
  });

  const entries = Object.fromEntries(getChatApiProviderEnvEntries(drafts));
  assert.equal(entries.DEEPSEEK_API_KEY, "current-deepseek-key");
  assert.equal(entries.DEEPSEEK_API_KEY2, "current-deepseek-processing-2");
  assert.equal(entries.DEEPSEEK_API_KEY3, "current-deepseek-processing-3");
  assert.equal(entries.DEEPSEEK_MODEL, "deepseek-v4-pro");
  assert.equal(entries.ZHIPU_API_KEY, "saved-zhipu-key");
  assert.equal(entries.ZHIPU_API_KEY2, "saved-zhipu-processing-2");
  assert.equal(entries.ZHIPU_MODEL, "glm-5.3-flash");
});

test("provider aliases and custom provider settings normalize without crossing providers", () => {
  assert.equal(normalizeChatApiProviderSetting("GLM"), "zhipu");
  assert.equal(normalizeChatApiProviderSetting("unknown"), "deepseek");

  const { activeProvider, drafts } = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "custom",
    CHAT_API_KEY: "active-custom-key",
    CHAT_API_MODEL: "custom-model",
    CUSTOM_API_BASE_URL: "https://example.test/v1",
    DEEPSEEK_API_KEY: "saved-deepseek-key"
  });
  assert.equal(activeProvider, "custom");
  assert.equal(drafts.custom.key, "active-custom-key");
  assert.deepEqual(drafts.custom.keyGroups, [{ key: "active-custom-key", processingKeys: [] }]);
  assert.deepEqual(drafts.custom.processingKeys, []);
  assert.equal(drafts.custom.model, "custom-model");
  assert.equal(drafts.custom.baseUrl, "https://example.test/v1");
  assert.equal(drafts.deepseek.key, "saved-deepseek-key");
  assert.deepEqual(drafts.deepseek.processingKeys, []);
});

test("provider drafts keep separate large-model processing keys", () => {
  const { activeProvider, drafts } = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "zhipu",
    CHAT_API_KEY2: "active-glm-processing-2",
    DEEPSEEK_API_KEY2: "saved-deepseek-processing-2",
    OPENAI_API_KEY2: "saved-openai-processing-2",
    ZHIPU_API_KEY2: "saved-glm-processing-2"
  });

  assert.equal(activeProvider, "zhipu");
  assert.deepEqual(drafts.zhipu.processingKeys, ["saved-glm-processing-2"]);
  assert.deepEqual(drafts.deepseek.processingKeys, ["saved-deepseek-processing-2"]);
  assert.deepEqual(drafts.openai.processingKeys, ["saved-openai-processing-2"]);
});

test("one reasoning field migrates the old provider-specific values", () => {
  assert.equal(resolveChatApiReasoningEffort({ CHAT_API_REASONING_EFFORT: "high" }, "deepseek"), "high");
  assert.equal(resolveChatApiReasoningEffort({ DEEPSEEK_REASONING_EFFORT: "none" }, "deepseek"), "none");
  assert.equal(resolveChatApiReasoningEffort({ GLM_REASONING_EFFORT: "max" }, "zhipu"), "max");
  assert.equal(resolveChatApiReasoningEffort({
    DEEPSEEK_REASONING_EFFORT: "none",
    GLM_REASONING_EFFORT: "low"
  }, "zhipu"), "low");

  assert.equal((webSource.match(/label:\s*"思考模式強度"/gu) || []).length, 1);
  assert.match(webSource, /saveCurrentChatApiProviderDraft\(\);\s+showChatApiProviderDraft\(event\.target\.value\);/u);
  assert.match(webSource, /processingKeys:\s*collectChatApiProcessingKeyValues\(\)/u);
  assert.match(webSource, /renderChatApiKeyGroupControls\(\)/u);
  assert.match(webSource, /getChatApiProviderEnvEntries\(chatApiProviderDrafts\)/u);
  assert.match(webSource, /Object\.keys\(ENV_ALIAS_KEYS\)\.forEach\(\(key\) => ENV_KNOWN_KEYS\.add\(key\)\)/u);
  assert.match(serverSource, /"CHAT_API_REASONING_EFFORT", "DEEPSEEK_REASONING_EFFORT"/u);
  assert.match(serverSource, /"CHAT_API_REASONING_EFFORT", "GLM_REASONING_EFFORT"/u);
  assert.match(serverSource, /getChatApiProviderKeyAliases\(provider\)/u);
});

test("provider drafts preserve multiple general-purpose key groups", () => {
  const { drafts } = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "deepseek",
    CHAT_API_KEY: "story-key-1",
    CHAT_API_KEY2: "model-key-1",
    CHAT_API_KEY_GROUP2: "story-key-2",
    CHAT_API_KEY_GROUP2_2: "model-key-2"
  });
  assert.deepEqual(drafts.deepseek.keyGroups, [
    { key: "story-key-1", processingKeys: ["model-key-1"] },
    { key: "story-key-2", processingKeys: ["model-key-2"] }
  ]);
  const entries = Object.fromEntries(getChatApiProviderEnvEntries(drafts));
  assert.equal(entries.DEEPSEEK_API_KEY_GROUP2, "story-key-2");
  assert.equal(entries.DEEPSEEK_API_KEY_GROUP2_2, "model-key-2");
});

test("provider key groups remain isolated after saving and switching providers", () => {
  const initial = createChatApiProviderDrafts({
    CHAT_API_PROVIDER: "deepseek",
    CHAT_API_KEY: "stale-generic-1",
    CHAT_API_KEY_GROUP2: "stale-generic-2",
    DEEPSEEK_API_KEY: "deepseek-active-1",
    DEEPSEEK_API_KEY_GROUP2: "deepseek-active-2",
    ZHIPU_API_KEY: "zhipu-saved-1",
    ZHIPU_API_KEY_GROUP2: "zhipu-saved-2"
  });
  const providerEntries = Object.fromEntries(getChatApiProviderEnvEntries(initial.drafts));
  const switched = createChatApiProviderDrafts({
    ...providerEntries,
    CHAT_API_PROVIDER: "zhipu",
    CHAT_API_KEY: "another-stale-generic-1",
    CHAT_API_KEY_GROUP2: "another-stale-generic-2"
  });

  assert.deepEqual(switched.drafts.deepseek.keyGroups.map((group) => group.key), [
    "deepseek-active-1",
    "deepseek-active-2"
  ]);
  assert.deepEqual(switched.drafts.zhipu.keyGroups.map((group) => group.key), [
    "zhipu-saved-1",
    "zhipu-saved-2"
  ]);
});

test("web reasoning controls use the same provider and model capability matrix", () => {
  assert.equal(canDisableChatApiReasoning("deepseek", "deepseek-v4-pro"), true);
  assert.equal(canDisableChatApiReasoning("zhipu", "glm-5.3-flash"), true);
  assert.equal(canDisableChatApiReasoning("zhipu", "glm-4-air"), false);
  assert.equal(canDisableChatApiReasoning("gemini", "gemini-2.5-flash"), true);
  assert.equal(canDisableChatApiReasoning("gemini", "gemini-2.5-pro"), false);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-5.1"), true);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-5-pro"), false);
  assert.equal(canDisableChatApiReasoning("custom", "gpt-5.4"), false);
  assert.match(webSource, /canDisableChatApiReasoning\(provider, model\)/u);
  assert.match(webSource, /option\.value === "none"/u);
});
