import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { resolveChatApiKey } from "../src/chat-api-key-config.js";

test("the active provider uses its primary key and never another provider's credentials", () => {
  const env = { CHAT_API_PROVIDER: "openai", CHAT_API_KEY: "current", DEEPSEEK_API_KEY: "other" };
  assert.equal(resolveChatApiKey(env, "openai"), "current");
  assert.equal(resolveChatApiKey(env, "zhipu"), "");
  assert.equal(resolveChatApiKey({ DEEPSEEK_API_KEY: "other" }, "openai"), "");
  assert.equal(resolveChatApiKey({ ...env, OPENAI_API_KEY: "saved" }, "openai"), "saved");
  assert.equal(resolveChatApiKey({ BIGMODEL_API_KEY: "glm" }, "glm"), "glm");
});

test("legacy numbered and story keys are ignored without becoming a fallback", () => {
  const env = {
    CHAT_API_KEY: "shared", CHAT_API_KEY2: "processing", CHAT_API_KEY_GROUP2: "story",
    DEEPSEEK_API_KEY2: "provider-processing", DEEPSEEK_API_KEY_GROUP2: "provider-story"
  };
  assert.equal(resolveChatApiKey(env, "deepseek"), "shared");
  delete env.CHAT_API_KEY;
  assert.equal(resolveChatApiKey(env, "deepseek"), "");
  assert.equal(resolveChatApiKey({ CONVERSATION_API_KEY: "legacy" }, "deepseek"), "legacy");
});

function runtime(env = {}) {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const context = vm.createContext({
    process: { env }, resolveChatApiKey,
    DEFAULT_CHAT_API_PROVIDER: "deepseek",
    normalizeChatApiProvider: (provider) => provider || "deepseek",
    envObjectFirstText: (values, names, fallback) => names.map((name) => values[name]).find(Boolean) || fallback,
    normalizeConversationContextId: (value) => value,
    LOCAL_CONVERSATION_CONTEXT_ID: "local"
  });
  for (const name of ["getPrimaryChatApiKey", "getChatApiKey", "stopConversationGeneration"]) {
    const start = source.indexOf(`function ${name}(`);
    assert.ok(start >= 0, name);
    vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), context);
  }
  return context;
}

test("all purposes and simultaneous stories share the primary key without lease allocation", () => {
  const env = { CHAT_API_PROVIDER: "deepseek", CHAT_API_KEY: "shared", CHAT_API_KEY2: "ignored" };
  const context = runtime(env);
  const state = {
    conversationApiKeyAssignments: {
      local: { slot: 1, lastUsedAt: new Date().toISOString() },
      "discord:1": { slot: 2, lastUsedAt: new Date().toISOString() }
    }
  };
  const before = structuredClone(state);
  for (const contextId of ["local", "discord:1", "discord:2", "qq:c2c:test"]) {
    for (const purpose of ["reasoner_history_chat", "chat_expand", "character_card_creation_assistant_chat", "context_compression:standard", "context_compression:custom:image_prompt"]) {
      assert.equal(context.getChatApiKey(purpose, state, contextId), "shared");
    }
  }
  assert.deepEqual(state, before);
  env.CHAT_API_KEY = "changed";
  assert.equal(context.getChatApiKey(), "changed");
  delete env.CHAT_API_KEY;
  assert.throws(() => context.getChatApiKey(), /環境設定/u);
});

test("switching providers takes effect for every purpose and requires that provider's key", () => {
  const env = { CHAT_API_PROVIDER: "deepseek", DEEPSEEK_API_KEY: "ds", OPENAI_API_KEY: "oa" };
  const context = runtime(env);
  assert.equal(context.getChatApiKey("context_compression"), "ds");
  env.CHAT_API_PROVIDER = "openai";
  assert.equal(context.getChatApiKey("context_compression"), "oa");
  assert.equal(context.getChatApiKey("chat"), "oa");
  env.CHAT_API_PROVIDER = "gemini";
  assert.throws(() => context.getChatApiKey(), /環境設定/u);
});

test("stop targets the requested story without modifying stored stories or shared credentials", () => {
  const context = runtime({ CHAT_API_KEY: "shared" });
  const stopped = [];
  context.requestStopActiveGeneration = (contextId) => { stopped.push(contextId); return contextId === "discord:1"; };
  assert.equal(context.stopConversationGeneration("discord:1").stopped, true);
  assert.equal(context.stopConversationGeneration("discord:2").stopped, false);
  assert.equal(context.stopConversationGeneration().stopped, false);
  assert.deepEqual(stopped, ["discord:1", "discord:2", "local"]);
  assert.equal(context.getChatApiKey(), "shared");
});
