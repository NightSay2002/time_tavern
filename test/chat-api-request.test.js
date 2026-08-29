import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChatApiRequestBody,
  canDisableChatApiReasoning,
  canSetChatApiReasoningStrength,
  normalizeDeepSeekReasoningEffort,
  normalizeGlmReasoningEffort,
  resolveChatApiReasoningEffort,
  shouldIncludeUserCustomSupplement
} from "../src/chat-api-request.js";

const baseRequest = {
  provider: "deepseek",
  model: "deepseek-v4-pro",
  temperature: 0.5,
  maxTokens: 32000,
  messages: [{ role: "user", content: "test" }]
};

test("DeepSeek reasoning effort accepts supported values only", () => {
  assert.equal(normalizeDeepSeekReasoningEffort(" LOW "), "low");
  assert.equal(normalizeDeepSeekReasoningEffort("max"), "max");
  assert.equal(normalizeDeepSeekReasoningEffort("medium"), "");
});

test("DeepSeek API default resolves to high while explicit none remains disabled", () => {
  assert.equal(resolveChatApiReasoningEffort("deepseek", ""), "high");
  assert.equal(resolveChatApiReasoningEffort("deepseek", "none"), "none");
  assert.equal(resolveChatApiReasoningEffort("zhipu", ""), "");
  assert.equal(resolveChatApiReasoningEffort("openai", "high"), "");

  const body = buildChatApiRequestBody({
    ...baseRequest,
    reasoningEffort: resolveChatApiReasoningEffort("deepseek", "")
  });
  assert.deepEqual(body.thinking, { type: "enabled" });
  assert.equal(body.reasoning_effort, "high");
  assert.equal(body.temperature, undefined);
});

test("DeepSeek reasoning can be disabled so temperature remains active", () => {
  const body = buildChatApiRequestBody({
    ...baseRequest,
    reasoningEffort: "none"
  });

  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.equal(body.reasoning_effort, undefined);
  assert.equal(body.temperature, 0.5);
});

test("explicitly disabling DeepSeek reasoning omits the user custom supplement", () => {
  assert.equal(shouldIncludeUserCustomSupplement("none"), false);
  assert.equal(shouldIncludeUserCustomSupplement("high"), true);
  assert.equal(shouldIncludeUserCustomSupplement(""), true);
});

test("DeepSeek explicit reasoning strength enables thinking and omits temperature", () => {
  for (const effort of ["low", "high", "max"]) {
    const body = buildChatApiRequestBody({
      ...baseRequest,
      reasoningEffort: effort
    });

    assert.deepEqual(body.thinking, { type: "enabled" });
    assert.equal(body.reasoning_effort, effort);
    assert.equal(body.temperature, undefined);
  }
});

test("API default and non-DeepSeek providers preserve the existing request shape", () => {
  const defaultBody = buildChatApiRequestBody(baseRequest);
  assert.equal(defaultBody.thinking, undefined);
  assert.equal(defaultBody.reasoning_effort, undefined);
  assert.equal(defaultBody.temperature, 0.5);

  const openAiBody = buildChatApiRequestBody({
    ...baseRequest,
    provider: "openai",
    reasoningEffort: "max"
  });
  assert.equal(openAiBody.thinking, undefined);
  assert.equal(openAiBody.reasoning_effort, undefined);
  assert.equal(openAiBody.temperature, 0.5);
});

test("GLM 5.3 uses the selected model directly and keeps native thinking enabled", () => {
  assert.equal(normalizeGlmReasoningEffort(" HIGH "), "high");
  assert.equal(normalizeGlmReasoningEffort("none"), "none");

  const messages = [{
    role: "user",
    content: [
      { type: "text", text: "看看這張圖" },
      { type: "image_url", image_url: { url: "data:image/png;base64,AA==" } }
    ]
  }];
  const body = buildChatApiRequestBody({
    provider: "zhipu",
    model: "glm-5.3-flash",
    reasoningEffort: "high",
    temperature: 0.5,
    maxTokens: 32000,
    messages
  });

  assert.equal(body.model, "glm-5.3-flash");
  assert.equal(body.temperature, 0.5);
  assert.deepEqual(body.thinking, { type: "enabled", clear_thinking: false });
  assert.equal(body.reasoning_effort, "high");
  assert.deepEqual(body.messages, messages);
});

test("reasoning disable capability follows provider and model support", () => {
  assert.equal(canDisableChatApiReasoning("deepseek", "deepseek-v4-pro"), true);
  assert.equal(canDisableChatApiReasoning("zhipu", "glm-4.5"), true);
  assert.equal(canDisableChatApiReasoning("zhipu", "glm-4-air"), false);
  assert.equal(canDisableChatApiReasoning("gemini", "gemini-2.5-flash"), true);
  assert.equal(canDisableChatApiReasoning("gemini", "gemini-2.5-pro"), false);
  assert.equal(canDisableChatApiReasoning("gemini", "gemini-3-pro"), false);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-5.1"), true);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-5.4-mini"), true);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-5-pro"), false);
  assert.equal(canDisableChatApiReasoning("openai", "gpt-4.1"), false);
  assert.equal(canDisableChatApiReasoning("custom", "gpt-5.4"), false);
  assert.equal(canSetChatApiReasoningStrength("deepseek", "deepseek-v4-pro"), true);
  assert.equal(canSetChatApiReasoningStrength("zhipu", "glm-5.3-flash"), true);
  assert.equal(canSetChatApiReasoningStrength("zhipu", "glm-4.5"), false);
});

test("supported non-DeepSeek models can explicitly disable reasoning", () => {
  const glmBody = buildChatApiRequestBody({
    ...baseRequest,
    provider: "zhipu",
    model: "glm-5.3-flash",
    reasoningEffort: "none"
  });
  assert.deepEqual(glmBody.thinking, { type: "disabled" });
  assert.equal(glmBody.reasoning_effort, undefined);

  const geminiBody = buildChatApiRequestBody({
    ...baseRequest,
    provider: "gemini",
    model: "gemini-2.5-flash",
    reasoningEffort: "none"
  });
  assert.equal(geminiBody.reasoning_effort, "none");

  const openAiBody = buildChatApiRequestBody({
    ...baseRequest,
    provider: "openai",
    model: "gpt-5.1",
    reasoningEffort: "none"
  });
  assert.equal(openAiBody.reasoning_effort, "none");
});

test("GLM API default omits explicit thinking controls", () => {
  const body = buildChatApiRequestBody({
    ...baseRequest,
    provider: "zhipu",
    model: "glm-5.3-flash",
    reasoningEffort: ""
  });
  assert.equal(body.thinking, undefined);
  assert.equal(body.reasoning_effort, undefined);
  assert.equal(body.temperature, 0.5);
});

test("unsupported models ignore a stale reasoning disable value", () => {
  assert.equal(resolveChatApiReasoningEffort("zhipu", "none", "glm-4-air"), "");
  assert.equal(resolveChatApiReasoningEffort("zhipu", "high", "glm-4.5"), "");
  assert.equal(resolveChatApiReasoningEffort("gemini", "none", "gemini-2.5-pro"), "");
  assert.equal(resolveChatApiReasoningEffort("openai", "none", "gpt-4.1"), "");

  const body = buildChatApiRequestBody({
    ...baseRequest,
    provider: "openai",
    model: "gpt-4.1",
    reasoningEffort: "none"
  });
  assert.equal(body.reasoning_effort, undefined);
  assert.equal(body.temperature, 0.5);
});
