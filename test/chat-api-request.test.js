import assert from "node:assert/strict";
import test from "node:test";

import {
  buildChatApiRequestBody,
  normalizeDeepSeekReasoningEffort
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

test("DeepSeek reasoning can be disabled so temperature remains active", () => {
  const body = buildChatApiRequestBody({
    ...baseRequest,
    reasoningEffort: "none"
  });

  assert.deepEqual(body.thinking, { type: "disabled" });
  assert.equal(body.reasoning_effort, undefined);
  assert.equal(body.temperature, 0.5);
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
