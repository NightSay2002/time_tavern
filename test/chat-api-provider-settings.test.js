import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
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
    CHAT_API_MODEL: "deepseek-v4-pro",
    CHAT_API_BASE_URL: "https://api.deepseek.com",
    ZHIPU_API_KEY: "saved-zhipu-key",
    ZHIPU_MODEL: "glm-5.3-flash",
    ZHIPU_BASE_URL: "https://open.bigmodel.cn/api/paas/v4"
  });

  assert.equal(activeProvider, "deepseek");
  assert.deepEqual(drafts.deepseek, {
    key: "current-deepseek-key",
    model: "deepseek-v4-pro",
    baseUrl: "https://api.deepseek.com"
  });
  assert.deepEqual(drafts.zhipu, {
    key: "saved-zhipu-key",
    model: "glm-5.3-flash",
    baseUrl: "https://open.bigmodel.cn/api/paas/v4"
  });

  const entries = Object.fromEntries(getChatApiProviderEnvEntries(drafts));
  assert.equal(entries.DEEPSEEK_API_KEY, "current-deepseek-key");
  assert.equal(entries.DEEPSEEK_MODEL, "deepseek-v4-pro");
  assert.equal(entries.ZHIPU_API_KEY, "saved-zhipu-key");
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
  assert.equal(drafts.custom.model, "custom-model");
  assert.equal(drafts.custom.baseUrl, "https://example.test/v1");
  assert.equal(drafts.deepseek.key, "saved-deepseek-key");
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
  assert.match(webSource, /getChatApiProviderEnvEntries\(chatApiProviderDrafts\)/u);
  assert.match(serverSource, /"CHAT_API_REASONING_EFFORT", "DEEPSEEK_REASONING_EFFORT"/u);
  assert.match(serverSource, /"CHAT_API_REASONING_EFFORT", "GLM_REASONING_EFFORT"/u);
});
