import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { once } from "node:events";
import { pipeline } from "node:stream/promises";
import test from "node:test";
import vm from "node:vm";
import zlib from "node:zlib";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
function section(source, start, end) {
  const first = source.indexOf(start);
  const last = source.indexOf(end, first);
  assert.ok(first >= 0 && last > first);
  return source.slice(first, last);
}

test("summary state skips log compaction but preserves all conversations and log metadata", () => {
  let compactions = 0;
  const context = vm.createContext({
    getWebConversationStateView: value => value,
    normalizeAiLog: value => value,
    compactAiLogsForStorage(logs) { compactions += 1; return { logs, contentStore: {} }; },
    normalizeConversationForClient: value => value,
    getModularPromptConfigsPayload: () => ({}), getContextCompressionPrompt: () => "",
    getCharacterCardCreationAssistantPrompt: () => "", getWebChatDisplayConfig: () => ({}),
    listSavedSessionSummaries: value => value.savedSessions,
    createUiActions: () => ({}), getChatApiProvider: () => "custom",
    getChatApiBaseUrl: () => "", getChatApiModel: () => "test",
    getChatApiMaxTokensParamName: () => "max_tokens", getChatImageAttachmentMaxBytes: () => 1,
    getChatImageAttachmentMaxCount: () => 4,
    DISCORD_BOT_TOKEN: "", discordConnected: false, getDiscordClientId: () => "",
    getDiscordAuthorizeUrl: () => "", QQ_BOT_APP_ID: "", QQ_BOT_APP_SECRET: "", qqBotConnected: false,
    listConversationContexts: () => []
  });
  vm.runInContext(section(serverSource, "function statePayload(", "const savedSessionStorageFileMigrationCount"), context);
  const log = {
    id: "one", purpose: "chat", model: "test", usage: { promptTokens: 10, cost: { amount: 0.01 } },
    status: "success", createdAt: "2026-09-18T00:00:00Z",
    requestMessages: [{ role: "user", content: "complete input" }],
    responseText: "complete output", debugReasoningContent: "complete reasoning"
  };
  const state = {
    aiLogs: [log], roleCards: [{ id: "card" }], savedSessions: [{ id: "archive" }],
    conversation: Array.from({ length: 2001 }, (_, i) => ({ id: i, content: `message-${i}` }))
  };
  const summary = context.statePayload(state, { aiLogDetails: false });
  assert.equal(compactions, 0);
  assert.equal(summary.conversation, state.conversation);
  assert.equal(summary.roleCards, state.roleCards);
  assert.equal(summary.savedSessionsMeta, state.savedSessions);
  assert.equal(summary.aiLogs[0].detailsOmitted, true);
  assert.equal(summary.aiLogs[0].usage, log.usage);
  assert.equal(summary.aiLogs[0].requestMessages, undefined);
  assert.equal(summary.aiLogs[0].responseText, undefined);
  assert.equal(summary.aiLogs[0].debugReasoningContent, undefined);
  const full = context.statePayload(state);
  assert.equal(compactions, 1);
  assert.equal(full.aiLogs[0], log);
  assert.equal(log.detailsOmitted, undefined, "summarizing must not alter saved logs");
});

test("log details load on demand once, retain full content and permit retry after failure", async () => {
  let calls = 0;
  let result;
  let resolve;
  let failure = false;
  const context = vm.createContext({
    getUiLanguageText: value => value,
    request: async url => {
      calls += 1;
      assert.equal(url, "/api/ai-logs/one%20two");
      if (failure) throw new Error("offline");
      return new Promise(done => { resolve = done; });
    },
    populateAiLogBody(body, log, store) { result = { log, store }; }
  });
  vm.runInContext(section(webSource, "async function loadAiLogBody(", "function renderAiLogs("), context);
  const body = { dataset: {}, textContent: "", replaceChildren() { this.textContent = ""; } };
  const log = { id: "one two", detailsOmitted: true };
  const pending = context.loadAiLogBody(body, log, {}, "usage");
  await context.loadAiLogBody(body, log, {}, "usage");
  assert.equal(calls, 1);
  const full = { id: "one two", responseText: "all output", requestMessages: [{ content: "all input" }] };
  resolve({ log: full });
  await pending;
  assert.equal(body.dataset.rendered, "true");
  assert.equal(result.log, full);
  await context.loadAiLogBody(body, log, {}, "usage");
  assert.equal(calls, 1);

  delete body.dataset.rendered;
  failure = true;
  await context.loadAiLogBody(body, log, {}, "usage");
  assert.match(body.textContent, /offline/u);
  assert.equal(body.dataset.loading, undefined);
  assert.equal(body.dataset.rendered, undefined);
  failure = false;
  const retry = context.loadAiLogBody(body, log, {}, "usage");
  resolve({ log: full });
  await retry;
  assert.equal(body.dataset.rendered, "true");

  delete body.dataset.rendered;
  const existingStore = { shared: "text" };
  await context.loadAiLogBody(body, full, existingStore, "usage");
  assert.equal(calls, 3, "existing full API payloads need no extra request");
  assert.equal(result.store, existingStore);
});

test("static text uses streaming gzip and conditional caching without compressing images", async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "startup-static-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const scriptFile = path.join(directory, "module.js");
  const imageFile = path.join(directory, "image.png");
  const script = "export const text = 'static fixture';\n".repeat(4000);
  fs.writeFileSync(scriptFile, script);
  fs.writeFileSync(imageFile, "image fixture".repeat(100));
  const context = vm.createContext({
    fs, zlib, pipeline, console,
    getContentType: file => file.endsWith(".js") ? "text/javascript" : "image/png"
  });
  vm.runInContext(section(serverSource, "function requestMatchesEtag(", "function sendCachedJson("), context);
  vm.runInContext(section(serverSource, "function getStaticHeaders(", "function getActiveRoleCard("), context);
  const server = http.createServer((req, res) => {
    const file = req.url === "/image.png" ? imageFile : scriptFile;
    void context.sendStaticFile(req, res, file, fs.statSync(file));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise(resolve => server.close(resolve)));
  const request = (url, headers = {}) => new Promise((resolve, reject) => {
    http.get({ hostname: "127.0.0.1", port: server.address().port, path: url, headers }, res => {
      const chunks = [];
      res.on("data", chunk => chunks.push(chunk));
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }));
      res.on("error", reject);
    }).on("error", reject);
  });
  const compressed = await request("/module.js", { "Accept-Encoding": "gzip" });
  assert.equal(compressed.headers["content-encoding"], "gzip");
  assert.equal(compressed.headers.vary, "Accept-Encoding");
  assert.equal(zlib.gunzipSync(compressed.body).toString(), script);
  assert.ok(compressed.body.length < script.length / 10);
  const cached = await request("/module.js", { "If-None-Match": compressed.headers.etag, "Accept-Encoding": "gzip" });
  assert.equal(cached.status, 304);
  assert.equal(cached.body.length, 0);
  const identity = await request("/module.js", { "Accept-Encoding": "gzip;q=0, identity" });
  assert.equal(identity.headers["content-encoding"], undefined);
  assert.equal(identity.body.toString(), script);
  fs.writeFileSync(scriptFile, `${script}\n// changed`);
  const changed = await request("/module.js", { "If-None-Match": compressed.headers.etag });
  assert.equal(changed.status, 200);
  assert.notEqual(changed.headers.etag, compressed.headers.etag);
  const image = await request("/image.png", { "Accept-Encoding": "gzip" });
  assert.equal(image.headers["content-encoding"], undefined);
  assert.deepEqual(image.body, fs.readFileSync(imageFile));
});
