import assert from "node:assert/strict";
import test from "node:test";
import { buildGeminiNativeRequest, fetchGeminiNative } from "../src/gemini-native.js";

const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
const base = {
  model: "gemini-4-argon", max_tokens: 64000, reasoning_effort: "medium",
  messages: [
    { role: "system", content: "system rules" },
    { role: "user", content: [{ type: "text", text: "describe" }, { type: "image_url", image_url: { url: "data:image/png;base64,dGVzdA==" } }] },
    { role: "assistant", content: "answer" },
    { role: "user", content: "next" }
  ]
};

test("native Gemini requests retain conversation, images, reasoning and four BLOCK_NONE thresholds", () => {
  const request = buildGeminiNativeRequest(url, base);
  assert.equal(request.url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent");
  assert.deepEqual(request.body.systemInstruction.parts, [{ text: "system rules" }]);
  assert.deepEqual(request.body.contents.map(item => item.role), ["user", "model", "user"]);
  assert.deepEqual(request.body.contents[0].parts[1], { inlineData: { mimeType: "image/png", data: "dGVzdA==" } });
  assert.equal(request.body.generationConfig.maxOutputTokens, 64000);
  assert.equal(request.body.generationConfig.thinkingConfig.thinkingLevel, "MEDIUM");
  assert.equal(request.body.safetySettings.length, 4);
  assert.ok(request.body.safetySettings.every(item => item.threshold === "BLOCK_NONE"));
  assert.equal(new Set(request.body.safetySettings.map(item => item.category)).size, 4);
});

test("Gemini does not inject a preset when no system prompt is supplied", () => {
  for (const stream of [false, true]) {
    const request = buildGeminiNativeRequest(url, { ...base, stream, messages: [{ role: "user", content: "hello" }] });
    assert.equal(request.body.systemInstruction, undefined);
    assert.deepEqual(request.body.contents, [{ role: "user", parts: [{ text: "hello" }] }]);
  }
});

test("Gemini preserves each caller's system instructions without adding preset text", () => {
  for (const instruction of ["正文規則 {{user}}", "壓縮結果必須是 JSON", "請辨識圖片中的內容", "助手設定"]) {
    const messages = [{ role: "system", content: instruction }, { role: "user", content: "test" }];
    for (const stream of [false, true]) {
      const request = buildGeminiNativeRequest(url, { ...base, stream, messages });
      assert.deepEqual(request.body.systemInstruction.parts, [{ text: instruction }]);
    }
  }
});

test("native requests preserve Gemini 2.5 thinking budgets and response format", () => {
  const request = buildGeminiNativeRequest(url, { ...base, model: "gemini-2.5-flash", reasoning_effort: "none", response_format: { type: "json_object" } });
  assert.equal(request.url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent");
  assert.equal(request.body.generationConfig.thinkingConfig.thinkingBudget, 0);
  assert.equal(request.body.generationConfig.responseMimeType, "application/json");
  assert.deepEqual(request.body.systemInstruction.parts, [{ text: "system rules" }]);
});

test("native adapter rejects unsupported image or endpoint instead of leaking credentials", async () => {
  assert.throws(() => buildGeminiNativeRequest("https://example.test/v1beta/openai/chat/completions", base), /官方/u);
  assert.throws(() => buildGeminiNativeRequest(url, { ...base, messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: "https://example.test/image.png" } }] }] }), /內嵌圖片/u);
});

test("non-streaming native response retains safety reason, usage and image input", async () => {
  let sent;
  const response = await fetchGeminiNative(url, { method: "POST", headers: { Authorization: "Bearer secret" }, body: JSON.stringify(base) }, async (target, options) => {
    sent = { target, options, body: JSON.parse(options.body) };
    return Response.json({ candidates: [{ content: { parts: [{ text: "hello" }] }, finishReason: "SAFETY" }], usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 8, thoughtsTokenCount: 3, totalTokenCount: 21 } });
  });
  const result = await response.json();
  assert.equal(sent.options.headers["x-goog-api-key"], "secret");
  assert.equal(sent.options.headers.Authorization, undefined);
  assert.equal(result.choices[0].message.content, "hello");
  assert.equal(result.choices[0].finish_reason, "SAFETY");
  assert.equal(result.usage.completion_tokens, 11);
  assert.equal(result.usage.completion_tokens_details.reasoning_tokens, 3);
});

test("native Gemini streaming preserves split UTF-8 chunks, safety and usage", async () => {
  const request = buildGeminiNativeRequest(url, { ...base, stream: true });
  assert.equal(request.url, "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:streamGenerateContent?alt=sse");
  assert.ok(request.body.safetySettings.every(item => item.threshold === "BLOCK_NONE"));
  const events = [
    { candidates: [{ content: { parts: [{ text: "你好" }] } }] },
    { candidates: [{ content: { parts: [{ text: "世界" }] }, finishReason: "STOP" }] },
    { usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 7, thoughtsTokenCount: 3, totalTokenCount: 20 } }
  ];
  const bytes = new TextEncoder().encode(events.map(event => `data: ${JSON.stringify(event)}\r\n\r\n`).join(""));
  const stream = new ReadableStream({ start(controller) {
    for (let index = 0; index < bytes.length; index += 7) controller.enqueue(bytes.slice(index, index + 7));
    controller.close();
  } });
  const response = await fetchGeminiNative(url, { headers: { Authorization: "Bearer secret" }, body: JSON.stringify({ ...base, stream: true }) }, async () => new Response(stream));
  const result = (await response.text()).trim().split("\n\n").map(block => JSON.parse(block.slice(6)));
  assert.equal(result[0].choices[0].delta.content + result[1].choices[0].delta.content, "你好世界");
  assert.equal(result[1].choices[0].finish_reason, "stop");
  assert.equal(result[2].usage.completion_tokens, 10);
  assert.equal(result[2].usage.completion_tokens_details.reasoning_tokens, 3);
});

test("native Gemini reports premature termination, error events and propagates cancellation", async () => {
  const options = { headers: { Authorization: "Bearer secret" }, body: JSON.stringify({ ...base, stream: true }) };
  const broken = await fetchGeminiNative(url, options, async () => new Response('data: {"candidates":[{"content":{"parts":[{"text":"partial"}]}}]}\n\n'));
  await assert.rejects(broken.text(), /結束原因前中斷/u);
  const failed = await fetchGeminiNative(url, options, async () => new Response('data: {"error":{"message":"blocked"}}\n\n'));
  await assert.rejects(failed.text(), /blocked/u);
  let cancelled = false;
  const upstream = new ReadableStream({ cancel() { cancelled = true; } });
  const response = await fetchGeminiNative(url, options, async () => new Response(upstream));
  await response.body.cancel("stop");
  assert.equal(cancelled, true);
});

test("native Gemini streaming preserves a blocked finish reason", async () => {
  const options = { headers: { Authorization: "Bearer secret" }, body: JSON.stringify({ ...base, stream: true }) };
  const payload = { candidates: [{ content: { parts: [{ text: "partial" }] }, finishReason: "PROHIBITED_CONTENT" }] };
  const response = await fetchGeminiNative(url, options, async () => new Response(`data: ${JSON.stringify(payload)}\n\n`));
  const event = JSON.parse((await response.text()).trim().slice(6));
  assert.equal(event.choices[0].delta.content, "partial");
  assert.equal(event.choices[0].finish_reason, "PROHIBITED_CONTENT");
});

test("native adapter preserves HTTP errors and rejects error payloads", async () => {
  const options = { headers: { Authorization: "Bearer secret" }, body: JSON.stringify(base) };
  const error = await fetchGeminiNative(url, options, async () => new Response("bad request", { status: 400 }));
  assert.equal(error.status, 400);
  assert.equal(await error.text(), "bad request");
  await assert.rejects(fetchGeminiNative(url, options, async () => Response.json({ error: { message: "blocked" } })), /blocked/u);
});

test("native Gemini infers billable output from complete usage totals when visible tokens are omitted", async () => {
  const options = { headers: { Authorization: "Bearer secret" }, body: JSON.stringify(base) };
  const response = await fetchGeminiNative(url, options, async () => Response.json({ candidates: [{ finishReason: "SAFETY" }],
    usageMetadata: { promptTokenCount: 100, thoughtsTokenCount: 20, totalTokenCount: 120 } }));
  const payload = await response.json();
  assert.equal(payload.usage.completion_tokens, 20);
  assert.equal(payload.usage.completion_tokens_details.reasoning_tokens, 20);
});
