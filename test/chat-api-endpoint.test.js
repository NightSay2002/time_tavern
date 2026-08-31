import assert from "node:assert/strict";
import test from "node:test";

import {
  adaptChatApiRequestBody,
  buildChatApiCompletionsUrl,
  buildChatApiRequestHeaders,
  isDeploymentChatCompletionsUrl,
  resolveChatApiModelForEndpoint
} from "../src/chat-api-endpoint.js";

const deploymentUrl = "https://gateway.example.test/api/v0/rest/deployments/gemini-2.5-pro/chat/completions?api-version=2024-02-01";

test("a complete deployment URL is used without provider-specific rewriting", () => {
  assert.equal(buildChatApiCompletionsUrl(deploymentUrl), deploymentUrl);
  assert.equal(isDeploymentChatCompletionsUrl(deploymentUrl), true);
  assert.equal(
    buildChatApiCompletionsUrl("https://gateway.example.test/api/v0/rest"),
    "https://gateway.example.test/api/v0/rest/chat/completions"
  );
});

test("deployment endpoints use api-key and omit the body model", () => {
  assert.deepEqual(buildChatApiRequestHeaders("test-key", deploymentUrl), {
    accept: "application/json",
    "Content-Type": "application/json",
    "api-key": "test-key"
  });
  assert.deepEqual(adaptChatApiRequestBody({
    model: "gemini-2.5-pro",
    messages: [{ role: "user", content: "Hello" }],
    stream: false
  }, deploymentUrl), {
    messages: [{ role: "user", content: "Hello" }],
    stream: false
  });
  assert.equal(resolveChatApiModelForEndpoint("gemini-2.5-pro", "fallback-model", deploymentUrl), "");
});

test("ordinary OpenAI-compatible endpoints retain Bearer auth and model", () => {
  const url = buildChatApiCompletionsUrl("https://api.openai.com/v1");
  assert.equal(url, "https://api.openai.com/v1/chat/completions");
  assert.deepEqual(buildChatApiRequestHeaders("test-key", url), {
    accept: "application/json",
    "Content-Type": "application/json",
    Authorization: "Bearer test-key"
  });
  assert.deepEqual(adaptChatApiRequestBody({ model: "gpt-4.1" }, url), { model: "gpt-4.1" });
  assert.equal(resolveChatApiModelForEndpoint("gpt-4.1", "fallback-model", url), "gpt-4.1");
  assert.equal(resolveChatApiModelForEndpoint("", "fallback-model", url), "fallback-model");
});
