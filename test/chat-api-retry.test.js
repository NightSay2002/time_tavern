import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fetchChatApiWithRetry, normalizeChatApiRetryCount } from "../src/chat-api-request.js";

const failedFetch = () => new TypeError("fetch failed");
const request = { method: "POST", body: '{"messages":[{"role":"user","content":"test"}]}', headers: { Authorization: "Bearer mock-key" } };
const url = "https://example.test/v1/chat/completions";

test("retry count is finite, bounded and defaults to three while preserving explicit zero", () => {
  for (const [input, expected] of [[undefined, 3], [null, 3], ["", 3], ["  ", 3], [0, 0], ["0", 0], ["20", 20], ["bad", 3], [Infinity, 3], [-1, 0], [99, 20], [2.5, 2]]) {
    assert.equal(normalizeChatApiRetryCount(input), expected);
  }
});

test("configured retries allow the sixth attempt to succeed without changing the request", async () => {
  let calls = 0;
  const delays = [];
  const result = await fetchChatApiWithRetry(url, request, {
    retries: 20,
    wait: async (ms) => delays.push(ms),
    fetchImpl: async (target, options) => {
      assert.equal(target, url);
      assert.equal(options, request);
      calls += 1;
      if (calls <= 5) throw failedFetch();
      return new Response("ok");
    }
  });
  assert.equal(await result.text(), "ok");
  assert.equal(calls, 6);
  assert.deepEqual(delays, [1000, 2000, 4000, 8000, 10000]);
});

test("zero disables retries and twenty stops after twenty-one attempts", async () => {
  for (const retries of [0, 20]) {
    let calls = 0;
    await assert.rejects(fetchChatApiWithRetry(url, request, {
      retries, wait: async () => {}, fetchImpl: async () => { calls += 1; throw failedFetch(); }
    }), /fetch failed/u);
    assert.equal(calls, retries + 1);
  }
});

test("only transient HTTP failures retry, failed bodies close and Retry-After is respected", async () => {
  for (const status of [408, 429, 500, 502, 503, 504]) {
    let calls = 0;
    let cancelled = false;
    const result = await fetchChatApiWithRetry(url, request, {
      retries: 1,
      wait: async (ms) => assert.equal(ms, 12000),
      fetchImpl: async () => {
        calls += 1;
        return calls === 1 ? new Response(new ReadableStream({ cancel() { cancelled = true; } }), { status, headers: { "Retry-After": "12" } }) : new Response("ok");
      }
    });
    assert.equal(result.status, 200);
    assert.equal(cancelled, true);
    assert.equal(calls, 2);
  }
  for (const status of [400, 401, 403, 404, 422]) {
    let calls = 0;
    const result = await fetchChatApiWithRetry(url, request, { retries: 20, fetchImpl: async () => { calls += 1; return new Response("error", { status }); } });
    assert.equal(result.status, status);
    assert.equal(calls, 1);
  }
});

test("invalid requests and certificate errors fail immediately", async () => {
  for (const error of [new TypeError("Failed to parse URL"), new TypeError("fetch failed", { cause: { code: "CERT_HAS_EXPIRED" } }), new DOMException("Aborted", "AbortError")]) {
    await assert.rejects(fetchChatApiWithRetry(url, request, { retries: 20, wait: async () => assert.fail("must not retry"), fetchImpl: async () => { throw error; } }), (result) => result === error);
  }
});

test("stop and timeout abort the backoff before another request", async () => {
  for (const reason of ["stop", "timeout"]) {
    const controller = new AbortController();
    let calls = 0;
    const result = fetchChatApiWithRetry(url, { ...request, signal: controller.signal }, {
      retries: 20,
      fetchImpl: async () => {
        calls += 1;
        setTimeout(() => controller.abort(new DOMException(reason, "AbortError")), 5);
        throw failedFetch();
      }
    });
    await assert.rejects(result, { name: "AbortError" });
    assert.equal(calls, 1);
  }
});

test("successful streaming responses are returned unread and never replayed after partial output", async () => {
  let calls = 0;
  let upstream;
  const response = await fetchChatApiWithRetry(url, request, {
    retries: 20,
    fetchImpl: async () => { calls += 1; return new Response(new ReadableStream({ start(controller) { upstream = controller; controller.enqueue(new TextEncoder().encode("partial")); } })); }
  });
  assert.equal(response.bodyUsed, false);
  const reader = response.body.getReader();
  assert.equal(new TextDecoder().decode((await reader.read()).value), "partial");
  upstream.error(failedFetch());
  await assert.rejects(reader.read(), /fetch failed/u);
  assert.equal(calls, 1);
});

test("retry setting is wired into streaming, nonstreaming, test requests and the environment form", () => {
  const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  assert.equal([...source.matchAll(/await fetchChatApiWithRetry\(/gu)].length, 3);
  assert.equal([...source.matchAll(/retries: normalizeChatApiRetryCount\(process.env.CHAT_API_RETRY_COUNT\)/gu)].length, 2);
  assert.match(source, /failureRetryCount: normalizeChatApiRetryCount\(envSource.CHAT_API_RETRY_COUNT\)/u);
  const app = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  assert.match(app, /key: "CHAT_API_RETRY_COUNT"[\s\S]*?min: "0",[\s\S]*?max: "20",[\s\S]*?step: "1"/u);
});
