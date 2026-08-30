import assert from "node:assert/strict";
import test from "node:test";

import {
  getChatApiKeyGroupPrimaryKeyNames,
  listConfiguredChatApiKeyGroupSlots,
  resolveChatApiKeyGroupPrimaryKey,
  shouldResetConversationApiKeyAssignments
} from "../src/chat-api-key-config.js";

test("chat API key lookup never falls back to another provider", () => {
  const env = {
    CHAT_API_PROVIDER: "openai",
    DEEPSEEK_API_KEY: "deepseek-1",
    DEEPSEEK_API_KEY_GROUP2: "deepseek-2"
  };

  assert.deepEqual(getChatApiKeyGroupPrimaryKeyNames("openai", 2), [
    "OPENAI_API_KEY_GROUP2",
    "CHAT_API_KEY_GROUP2",
    "CONVERSATION_API_KEY_GROUP2"
  ]);
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openai", 1), "");
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openai", 2), "");
  assert.deepEqual(listConfiguredChatApiKeyGroupSlots(env, "openai"), []);
});

test("configured key groups only include the active provider", () => {
  const env = {
    CHAT_API_KEY: "active-openai-1",
    OPENAI_API_KEY: "saved-openai-1",
    DEEPSEEK_API_KEY_GROUP2: "inactive-deepseek-2",
    ZHIPU_API_KEY_GROUP3: "inactive-zhipu-3"
  };

  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openai", 1), "saved-openai-1");
  assert.deepEqual(listConfiguredChatApiKeyGroupSlots(env, "openai"), [1]);
  assert.deepEqual(listConfiguredChatApiKeyGroupSlots(env, "deepseek"), [1, 2]);
  assert.deepEqual(listConfiguredChatApiKeyGroupSlots(env, "zhipu"), [1, 3]);
});

test("provider-specific group keys take priority over stale generic keys", () => {
  const env = {
    CHAT_API_KEY: "active-zhipu-1",
    CHAT_API_KEY_GROUP2: "active-zhipu-2",
    ZHIPU_API_KEY: "saved-zhipu-1",
    ZHIPU_API_KEY_GROUP2: "saved-zhipu-2",
    DEEPSEEK_API_KEY: "deepseek-1",
    DEEPSEEK_API_KEY_GROUP2: "deepseek-2"
  };

  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "zhipu", 1), "saved-zhipu-1");
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "zhipu", 2), "saved-zhipu-2");
  assert.deepEqual(listConfiguredChatApiKeyGroupSlots(env, "zhipu"), [1, 2]);
});

test("generic keys remain a backward-compatible fallback for the active provider", () => {
  const env = {
    CHAT_API_KEY: "legacy-openai-1",
    CHAT_API_KEY_GROUP2: "legacy-openai-2"
  };

  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openai", 1), "legacy-openai-1");
  assert.equal(resolveChatApiKeyGroupPrimaryKey(env, "openai", 2), "legacy-openai-2");
});

test("switching provider resets every story key lease even when fingerprints match", () => {
  const groups = { 1: "same-fingerprint" };
  assert.equal(shouldResetConversationApiKeyAssignments({
    previousProvider: "deepseek",
    nextProvider: "openai",
    previousGroups: groups,
    nextGroups: groups
  }), true);
  assert.equal(shouldResetConversationApiKeyAssignments({
    previousProvider: "deepseek",
    nextProvider: "deepseek",
    previousGroups: groups,
    nextGroups: groups
  }), false);
  assert.equal(shouldResetConversationApiKeyAssignments({
    previousProvider: "deepseek",
    nextProvider: "deepseek",
    previousGroups: groups,
    nextGroups: { 1: "changed-fingerprint" }
  }), true);
});
