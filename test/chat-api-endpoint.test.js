import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  adaptChatApiRequestBody,
  buildChatApiCompletionsUrl,
  buildChatApiRequestHeaders,
  isDeploymentChatCompletionsUrl,
  resolveChatApiModelForEndpoint
} from "../src/chat-api-endpoint.js";

const deploymentUrl = "https://gateway.example.test/api/v0/rest/deployments/gemini-2.5-pro/chat/completions?api-version=2024-02-01";
const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

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

test("empty completion content retries once before returning an actionable error", () => {
  assert.match(serverSource, /CHAT_API_EMPTY_RESPONSE_RETRY_LIMIT = 1/u);
  assert.match(serverSource, /shouldRetryChatApiEmptyResponse\(trimmed, emptyRetryCount\)/u);
  assert.match(serverSource, /shouldRetryChatApiEmptyResponse\(streamed\.content, emptyRetryCount\)/u);
  assert.match(serverSource, /對話 API 連續兩次回傳空白內容/u);
});

test("connection test leaves temperature at the deployment default", () => {
  const connectionTestBody = serverSource.match(
    /async function testChatApiConnection[\s\S]+?const requestBody = adaptChatApiRequestBody\(buildChatApiRequestBody\(\{([\s\S]+?)\}\), config[.]completionsUrl\);/u
  )?.[1] || "";

  assert.doesNotMatch(connectionTestBody, /temperature\s*:/u);
});
