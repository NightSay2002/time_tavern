import assert from "node:assert/strict";
import crypto from "node:crypto";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
function section(start, end, text = source) {
  const first = text.indexOf(start);
  const last = text.indexOf(end, first);
  assert.ok(first >= 0 && last > first);
  return text.slice(first, last);
}

test("AI log compaction hashes repeated chunks once and restores every character", () => {
  let hashCalls = 0;
  const context = vm.createContext({
    AI_LOG_CONTENT_REFERENCE_MIN_CHARS: 120, AI_LOG_CONTENT_CHUNK_CHARS: 4096,
    safeText: value => String(value || "").trim(),
    crypto: { createHash(...args) { hashCalls += 1; return crypto.createHash(...args); } }
  });
  vm.runInContext(section("function getAiLogTextFields(", "function getAiLogsFingerprint("), context);
  const prefix = "共同前文".repeat(8192);
  const logs = Array.from({ length: 200 }, (_, i) => ({
    id: String(i), requestMessages: [{ role: "user", content: `${prefix}${i}` }],
    responseText: `reply ${i}`, debugReasoningContent: ""
  }));
  const result = context.compactAiLogsForStorage(logs);
  assert.ok(hashCalls <= 201, `expected one hash per unique chunk, got ${hashCalls}`);
  const restored = context.expandAiLogsFromStorage(result.logs, result.contentStore);
  assert.equal(restored.length, logs.length);
  restored.forEach((entry, index) => {
    assert.equal(entry.id, logs[index].id);
    assert.equal(entry.requestMessages[0].content, logs[index].requestMessages[0].content);
    assert.equal(entry.responseText, logs[index].responseText);
    assert.equal(entry.debugReasoningContent, logs[index].debugReasoningContent);
  });
  assert.ok(Buffer.byteLength(JSON.stringify(result)) < Buffer.byteLength(JSON.stringify(logs)) / 10);
});

test("request body stops retaining and converting chunks as soon as the size limit is exceeded", async () => {
  let conversions = 0;
  let concatenations = 0;
  const context = vm.createContext({ Buffer: {
    isBuffer: Buffer.isBuffer,
    from(...args) { conversions += 1; return Buffer.from(...args); },
    concat(...args) { concatenations += 1; return Buffer.concat(...args); }
  } });
  vm.runInContext(section("function readRawBody(", "async function readBody("), context);
  const request = new EventEmitter();
  const result = context.readRawBody(request, 4);
  const rejected = assert.rejects(result, { statusCode: 413 });
  request.emit("data", "1234");
  request.emit("data", "5");
  for (let i = 0; i < 100; i += 1) request.emit("data", "more data");
  request.emit("end");
  await rejected;
  assert.equal(conversions, 2);
  assert.equal(concatenations, 0);

  const valid = new EventEmitter();
  const validResult = context.readRawBody(valid, 4);
  valid.emit("data", "12");
  valid.emit("data", "34");
  valid.emit("end");
  assert.equal((await validResult).toString(), "1234");
  const aborted = new EventEmitter();
  const abortedResult = context.readRawBody(aborted);
  const abortRejected = assert.rejects(abortedResult, /請求已中斷/u);
  aborted.emit("data", "partial");
  aborted.emit("aborted");
  aborted.emit("error", new Error("connection closed"));
  await abortRejected;
});

test("album index reads once until changed, refreshes after writes and preserves corrupt data", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "album-cache-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "index.json");
  let reads = 0;
  const context = vm.createContext({
    fs: { ...fs, readFileSync(...args) { reads += 1; return fs.readFileSync(...args); } },
    path, process, NOVELAI_ALBUM_DIR: directory, NOVELAI_ALBUM_INDEX_FILE: file,
    ensureDataFile() {}, safeText: value => String(value || "").trim(),
    nowIso: () => new Date().toISOString()
  });
  vm.runInContext(section("function writeJsonFile(", "function mergeLegacyPromptFilesIntoDefaults("), context);
  vm.runInContext(section("function ensureNovelAiAlbumDir(", "async function generateNovelAiImages("), context);
  const first = [{ id: "first", fileName: "a.png", metadata: { prompt: "test" } }];
  context.writeNovelAiAlbumIndex(first);
  for (let i = 0; i < 20; i += 1) assert.equal(context.readNovelAiAlbumIndex()[0].id, "first");
  assert.equal(reads, 1);
  context.writeNovelAiAlbumIndex([{ id: "second" }]);
  assert.equal(context.readNovelAiAlbumIndex()[0].id, "second");
  assert.equal(reads, 2);
  fs.writeFileSync(file, JSON.stringify([{ id: "external" }]));
  assert.equal(context.readNovelAiAlbumIndex()[0].id, "external");
  assert.equal(reads, 3);
  fs.writeFileSync(file, "{broken");
  assert.throws(() => context.readNovelAiAlbumIndex(), /已停止操作以保留原資料/u);
  assert.equal(fs.readFileSync(file, "utf8"), "{broken");
  fs.writeFileSync(file, JSON.stringify(first));
  assert.equal(context.readNovelAiAlbumIndex()[0].id, "first");
  assert.deepEqual(fs.readdirSync(directory), ["index.json"]);
});

test("failed album index writes retain existing images and remove only a failed new favorite", (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "album-write-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const file = path.join(directory, "index.json");
  let failRename = false;
  let id = 0;
  const context = vm.createContext({
    fs: { ...fs, renameSync(...args) {
      if (failRename) throw new Error("simulated write failure");
      return fs.renameSync(...args);
    } },
    path, process, NOVELAI_ALBUM_DIR: directory, NOVELAI_ALBUM_INDEX_FILE: file,
    ensureDataFile() {}, safeText: value => String(value || "").trim(),
    normalizePlainText: value => String(value || "").trim(), nowIso: () => new Date().toISOString(),
    newId: () => `favorite-${++id}`, getImageExtensionFromMime: () => "png",
    parseImageDataUrl: () => ({ mimeType: "image/png", buffer: Buffer.from("image fixture") })
  });
  vm.runInContext(section("function writeJsonFile(", "function mergeLegacyPromptFilesIntoDefaults("), context);
  vm.runInContext(section("function ensureNovelAiAlbumDir(", "async function generateNovelAiImages("), context);
  vm.runInContext(section("function saveNovelAiAlbumItem(", "function readRawBody("), context);
  context.saveNovelAiAlbumItem({});
  const original = fs.readFileSync(file, "utf8");
  failRename = true;
  assert.throws(() => context.saveNovelAiAlbumItem({}), /simulated write failure/u);
  assert.throws(() => context.deleteNovelAiAlbumItem("favorite-1"), /simulated write failure/u);
  assert.equal(fs.readFileSync(file, "utf8"), original);
  assert.deepEqual(fs.readdirSync(directory).sort(), ["favorite-1.png", "index.json"]);
  failRename = false;
  assert.equal(context.deleteNovelAiAlbumItem("favorite-1"), true);
  assert.deepEqual(fs.readdirSync(directory), ["index.json"]);
  assert.deepEqual(JSON.parse(fs.readFileSync(file, "utf8")), []);
  fs.writeFileSync(file, "{broken");
  assert.throws(() => context.saveNovelAiAlbumItem({}), /已停止操作以保留原資料/u);
  assert.deepEqual(fs.readdirSync(directory), ["index.json"]);
  assert.equal(fs.readFileSync(file, "utf8"), "{broken");
});

function createVibeContext() {
  let calls = 0;
  let responseBytes = 12;
  const context = vm.createContext({
    crypto, Buffer, normalizePlainText: value => String(value || "").trim(),
    clampNumber: (value, fallback, min, max) => Math.max(min, Math.min(max, Number(value) || fallback)),
    makeNovelAiCorrelationId: () => "test", getNovelAiImageApiBaseUrl: () => "https://example.test",
    getNovelAiAuthHeaders: () => ({}),
    fetchWithTimeout: async () => { calls += 1; return { ok: true, arrayBuffer: async () => Buffer.alloc(responseBytes, calls % 256) }; }
  });
  vm.runInContext(section("const novelAiVibeEncodeCache =", "function getUiLanguage("), context);
  vm.runInContext(section("function getNovelAiVibeCacheKey(", "async function encodeNovelAiV4Vibes("), context);
  return {
    context, encode: image => context.encodeNovelAiVibeImage({ image, model: "test" }),
    calls: () => calls, setBytes: value => { responseBytes = value; },
    stats: () => vm.runInContext("({size: novelAiVibeEncodeCache.size, bytes: novelAiVibeEncodeCacheBytes})", context)
  };
}

test("Vibe cache evicts least recently used entries without losing cache hits", async () => {
  const cache = createVibeContext();
  for (let i = 0; i < 64; i += 1) await cache.encode(`image-${i}`);
  const first = await cache.encode("image-0");
  assert.equal(cache.calls(), 64);
  await cache.encode("image-64");
  assert.equal(await cache.encode("image-0"), first);
  assert.equal(cache.calls(), 65);
  await cache.encode("image-1");
  assert.equal(cache.calls(), 66);
  assert.equal(cache.stats().size, 64);
});

test("Vibe cache bounds encoded bytes and does not retain oversized results", async () => {
  const cache = createVibeContext();
  cache.setBytes(3 * 1024 * 1024);
  for (let i = 0; i < 3; i += 1) await cache.encode(`large-${i}`);
  assert.equal(cache.stats().size, 2);
  assert.equal(cache.stats().bytes, 8 * 1024 * 1024);
  cache.setBytes(7 * 1024 * 1024);
  assert.ok((await cache.encode("oversized")).length > 8 * 1024 * 1024);
  assert.equal(cache.stats().size, 2);
  await cache.encode("oversized");
  assert.equal(cache.calls(), 5);
});

test("message rendering only applies reasoning style to active reasoning, never completed text", () => {
  const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const classes = new Set();
  const rendered = [];
  const context = vm.createContext({
    getUiLanguageText: value => value,
    renderMarkdownToHtml(text, options) { rendered.push({ text, options }); return text; }
  });
  vm.runInContext(section("function getMessageStreamingReasoningText(", "function isMessageEdited(", appSource), context);
  vm.runInContext(section("function renderMessageText(", "function renderMessages(", appSource), context);
  const content = { classList: { toggle(name, force) {
    assert.equal(typeof force, "boolean", "undefined toggles the class instead of removing it");
    if (force) classes.add(name); else classes.delete(name);
  } } };
  const body = { innerHTML: "" };
  const normal = { role: "assistant", content: "Normal text with *intentional emphasis* and \"quotes\"." };
  for (let i = 0; i < 2; i += 1) {
    context.renderMessageText(normal, content, body);
    assert.equal(classes.has("streaming-reasoning"), false);
    assert.equal(body.innerHTML, normal.content);
    assert.equal(rendered.at(-1).options.allowHtml, true);
  }
  context.renderMessageText({ role: "assistant", streaming: true, content: "", extra: { streamingReasoning: "thinking" } }, content, body);
  assert.equal(classes.has("streaming-reasoning"), true);
  assert.equal(body.innerHTML, "thinking");
  for (const message of [
    { ...normal, streaming: true, extra: { streamingReasoning: "old thinking" } },
    { ...normal, streaming: false },
    { ...normal, streaming: null },
    normal,
    { role: "user", content: "User text" }
  ]) {
    classes.add("streaming-reasoning");
    context.renderMessageText(message, content, body);
    assert.equal(classes.has("streaming-reasoning"), false);
    assert.equal(body.innerHTML, message.content);
  }
});

test("stream updates coalesce and only render the active visible message", () => {
  const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const message = { id: "stream", streaming: true };
  let textRenders = 0;
  let fullRenders = 0;
  let scrolls = 0;
  const frames = new Map();
  let frameId = 0;
  const content = { querySelector: () => ({}) };
  const messages = {
    scrollHeight: 3000, scrollTop: 2000, clientHeight: 1000,
    querySelectorAll: () => [{ dataset: { messageId: "stream" }, querySelector: () => content }]
  };
  const context = vm.createContext({
    appState: { conversation: Array.from({ length: 99 }, () => ({})).concat(message) },
    chatStreamRenderFrame: 0, pendingChatStreamMessage: null,
    CONVERSATION_RENDER_WINDOW_SIZE: 20, conversationRenderStart: 80,
    el: { messages },
    window: {
      requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
      cancelAnimationFrame(id) { frames.delete(id); }
    },
    renderMessageText(actual) { assert.equal(actual, message); textRenders += 1; },
    renderMessages() { fullRenders += 1; }, renderStatus() {},
    scrollMessagesToBottom() { scrolls += 1; }
  });
  vm.runInContext(section("function renderChatStreamNow(", "function appendOptimisticChatTurn(", appSource), context);
  for (let i = 0; i < 10; i += 1) context.scheduleChatStreamRender(message);
  assert.equal(frames.size, 1);
  frames.values().next().value();
  assert.equal(textRenders, 1);
  assert.equal(fullRenders, 0);
  assert.equal(scrolls, 1);

  messages.scrollTop = 1000;
  context.renderChatStreamNow(message);
  assert.equal(textRenders, 2);
  assert.equal(scrolls, 1, "reading above the bottom must not scroll");
  messages.querySelectorAll = () => [];
  context.renderChatStreamNow(message);
  assert.equal(textRenders, 2, "offscreen replies must not rebuild the history window");
  context.appState.conversation = [];
  context.renderChatStreamNow(message);
  assert.equal(textRenders, 2, "stale stream objects must not change replacement state");
  context.renderChatStreamNow();
  assert.equal(fullRenders, 1, "initial and error renders retain the full-render path");
});

test("NovelAI drafts coalesce typing but immediate saves cancel pending writes", () => {
  const naiSource = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
  const timers = new Map();
  let timerId = 0;
  let writes = 0;
  let referenceWrites = 0;
  let prompt = "first";
  const saved = [];
  const context = vm.createContext({
    novelAiSettingsDraftTimer: null, NOVELAI_SETTINGS_STORAGE_KEY: "draft", console,
    window: {
      clearTimeout(id) { timers.delete(id); },
      setTimeout(callback, delay) { assert.equal(delay, 200); timers.set(++timerId, callback); return timerId; },
      localStorage: { setItem(key, value) { writes += 1; saved.push(JSON.parse(value)); } }
    },
    getFormSettings: () => ({ prompt, baseImage: "image", vibeTransfer: { images: ["vibe"] }, preciseReference: { images: ["precise"] } }),
    saveReferenceImageDraft: async () => { referenceWrites += 1; },
    normalizeFixedPromptSnippets: value => value || [], normalizeRandomPromptSnippets: value => value || [],
    saveFixedPromptSnippets() {}, saveRandomPromptSnippets() {}
  });
  vm.runInContext(section("function scheduleSettingsDraft(", "async function loadNovelAiDefaults(", naiSource), context);
  for (let i = 0; i < 30; i += 1) context.scheduleSettingsDraft();
  assert.equal(timers.size, 1);
  assert.equal(writes, 0);
  timers.values().next().value();
  assert.equal(writes, 1);
  assert.equal(saved[0].prompt, "first");
  assert.equal(saved[0].baseImage, "");
  assert.deepEqual(saved[0].vibeTransfer.images, []);
  context.scheduleSettingsDraft();
  prompt = "latest";
  context.saveSettingsDraft({ includeReferenceImages: true });
  assert.equal(timers.size, 0);
  assert.equal(writes, 2);
  assert.equal(saved[1].prompt, "latest");
  assert.equal(referenceWrites, 1);
});
