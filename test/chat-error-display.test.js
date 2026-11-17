import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import { isSystemAssistantErrorContent } from "../src/dialogue-context.js";

const web = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const server = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function loadFunction(scope, name, async = false) {
  const start = web.indexOf(`${async ? "async " : ""}function ${name}(`);
  assert.ok(start >= 0, name);
  vm.runInContext(web.slice(start, web.indexOf("\n}", start) + 2), scope);
}

function scopeForResponse(body, status = 200) {
  const scope = vm.createContext({ TextDecoder, fetch: async () => new Response(body, { status }) });
  loadFunction(scope, "safeParseJson");
  loadFunction(scope, "requestChatStream", true);
  return scope;
}

test("a prematurely closed chat stream reports an error instead of leaving a generating placeholder", async () => {
  const scope = scopeForResponse('{"type":"content_delta","delta":"partial"}\n');
  await assert.rejects(scope.requestChatStream("hi"), /未收到最終結果/u);
  const renders = [];
  scope.renderChatStreamNow = () => renders.push("render");
  scope.scheduleChatStreamRender = () => {};
  loadFunction(scope, "applyChatStreamEventToMessage");
  const message = { streaming: true, phase: "chat", content: "partial", extra: {} };
  scope.applyChatStreamEventToMessage({ type: "error", error: "連線中斷" }, message);
  assert.equal(message.streaming, false);
  assert.match(message.content, /連線中斷/u);
  assert.equal(renders.length, 1);
});

test("chat streams accept a complete response and expose explicit server errors", async () => {
  const events = [];
  const scope = scopeForResponse('{"type":"done","state":{"conversation":[]}}\n');
  await scope.requestChatStream("hi", [], { onEvent: event => events.push(event.type) });
  assert.deepEqual(events, ["done"]);
  const failed = scopeForResponse('{"type":"error","error":"PROHIBITED_CONTENT"}\n');
  await assert.rejects(failed.requestChatStream("hi"), /PROHIBITED_CONTENT/u);
});

test("the submit handler renders transport errors and response warnings as text", () => {
  assert.match(web, /applyChatStreamEventToMessage\(\{ type: "error", error: error\.message \}, streamingAssistantMessage\)/u);
  assert.match(web, /warningNotice\.textContent = getUiLanguageText\(generationWarning\)/u);
});

for (const streaming of [false, true]) {
  test(`${streaming ? "streaming" : "non-streaming"} expansion exposes failure without losing the original answer`, async () => {
    const scope = vm.createContext({
      safeText: value => typeof value === "string" ? value.trim() : "", getMinimumReplyChars: () => 600,
      countVisibleCharacters: value => value.replace(/\s+/g, "").length, isSystemAssistantErrorContent,
      buildContinuationMessagesForMinimumLength: () => [],
      callChatApiCompletion: async () => { throw new Error("PROHIBITED_CONTENT"); },
      callChatApiCompletionStreamRaw: async () => { throw new Error("PROHIBITED_CONTENT"); },
      isGenerationStoppedError: () => false, console: { warn() {} }
    });
    const guard = server.indexOf("function shouldExpandAssistantReply(");
    vm.runInContext(server.slice(guard, server.indexOf("\n}", guard) + 2), scope);
    const name = streaming ? "ensureMinimumAssistantLengthStreaming" : "ensureMinimumAssistantLength";
    const start = server.indexOf(`async function ${name}(`);
    assert.ok(start >= 0);
    vm.runInContext(server.slice(start, server.indexOf("\n}\n", start) + 2), scope);
    const original = "已".repeat(200);
    const result = await scope[name]({}, original);
    assert.equal(result.content, original);
    assert.match(result.warning, /PROHIBITED_CONTENT/u);
  });
}

for (const streaming of [false, true]) {
  test(`${streaming ? "streaming" : "non-streaming"} does not expand errors or answers under 200 visible characters`, async () => {
    let calls = 0;
    const scope = vm.createContext({
      safeText: value => typeof value === "string" ? value.trim() : "", getMinimumReplyChars: () => 600,
      countVisibleCharacters: value => value.replace(/\s+/g, "").length, isSystemAssistantErrorContent,
      buildContinuationMessagesForMinimumLength: () => [],
      callChatApiCompletion: async () => { calls++; return "續".repeat(600); },
      callChatApiCompletionStreamRaw: async () => { calls++; return { content: "續".repeat(600) }; },
      isGenerationStoppedError: () => false, console: { warn() {} }
    });
    const guard = server.indexOf("function shouldExpandAssistantReply(");
    vm.runInContext(server.slice(guard, server.indexOf("\n}", guard) + 2), scope);
    const name = streaming ? "ensureMinimumAssistantLengthStreaming" : "ensureMinimumAssistantLength";
    const start = server.indexOf(`async function ${name}(`);
    vm.runInContext(server.slice(start, server.indexOf("\n}\n", start) + 2), scope);
    for (const content of ["", "字".repeat(199), `字${" \n".repeat(30)}${"字".repeat(198)}`, `模型呼叫失敗，已改用錯誤訊息回覆：${"錯".repeat(250)}`, `[Error] ${"錯".repeat(250)}`, `錯誤：${"錯".repeat(250)}`, "尚未設定 CHAT_API_KEY / 對話 API Key，這是本地回覆佔位訊息。", "字".repeat(600)]) {
      const result = await scope[name]({}, content);
      assert.equal(result.content, content.trim());
      assert.equal(result.warning, "");
      assert.equal(calls, 0);
    }
    const result = await scope[name]({}, "字".repeat(200));
    assert.equal(calls, 1);
    assert.ok(result.content.length > 200);
    assert.equal(scope.shouldExpandAssistantReply("字".repeat(200), 200), false);
    assert.equal(scope.shouldExpandAssistantReply("字".repeat(199), 600), false);
    assert.equal(scope.shouldExpandAssistantReply("字".repeat(200), 600), true);
  });
}
