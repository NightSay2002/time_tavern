import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

const html = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

function functionSource(name, nextName) {
  const start = serverSource.indexOf(`function ${name}(`);
  const end = serverSource.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return serverSource.slice(start, end);
}

test("web exposes a global lorebook editor with global and per-entry switches", () => {
  const dialog = html.match(/<dialog id="globalLorebookDialog"[\s\S]*?<\/dialog>/u)?.[0] || "";
  assert.match(html, /id="globalLorebookBtn"[^>]*>全局世界書</u);
  assert.match(dialog, /id="globalLorebookEnabled"[^>]*type="checkbox"/u);
  assert.match(dialog, /id="globalLorebookList"/u);
  assert.match(dialog, /id="addGlobalLorebookEntryBtn"/u);
  assert.match(appSource, /enabledBtn\.textContent = entry\.enabled !== false \? "啟用" : "停用"/u);
  assert.match(appSource, /request\("\/api\/global-lorebook"/u);
  const cardDialog = html.match(/<dialog id="roleCardDialog"[\s\S]*?<\/dialog>/u)?.[0] || "";
  assert.match(cardDialog, /id="copyRoleCardLorebooksToGlobalBtn"[^>]*type="button"/u);
  assert.match(appSource, /copyRoleCardLorebooksToGlobalBtn\?\.addEventListener\("click", copyRoleCardLorebooksToGlobal\)/u);
});

test("global lorebooks share role-card trigger rules but stay out of assistant mode", () => {
  const renderedEntriesSource = functionSource("getRenderedRoleCardLorebookEntries", "getLorebookContextSource");
  const triggeredSource = functionSource("resolveTriggeredLorebookEntries", "getPermanentRoleCardLorebookEntries");
  const permanentSource = functionSource("getPermanentRoleCardLorebookEntries", "getTriggeredRoleCardLorebooks");
  const attachSource = functionSource("attachTriggeredLorebooksToUserMessage", "getMinimumReplyChars");
  assert.match(renderedEntriesSource, /globalLorebook\.enabled/u);
  assert.match(renderedEntriesSource, /\.\.\.normalizeRoleCardLorebooks\(roleCard\?\.lorebooks\)/u);
  assert.match(renderedEntriesSource, /\.\.\.globalEntries/u);
  assert.match(triggeredSource, /getRenderedRoleCardLorebookEntries/u);
  assert.match(permanentSource, /getRenderedRoleCardLorebookEntries/u);
  assert.match(attachSource, /hasActiveAssistantTarget\(currentState\)[\s\S]*?return message/u);
});

test("global lorebooks persist with cards and remain outside conversation saves", () => {
  const cardStateSource = functionSource("extractCardState", "readPersistedCardStateFile");
  const saveStateSource = functionSource("saveState", "sendJson");
  const savedConversationSource = functionSource("captureSavedConversationSnapshot", "captureNarrativeCheckpoint");
  const loadSavedConversationSource = functionSource("applySavedConversationSnapshot", "ensureSavedSessionsDir");
  const routeStart = serverSource.indexOf('if (pathname === "/api/global-lorebook" && method === "GET")');
  const routeEnd = serverSource.indexOf('if (pathname === "/api/character-card-creation-assistant-prompt"', routeStart);
  const routeSource = serverSource.slice(routeStart, routeEnd);
  assert.match(cardStateSource, /globalLorebook: normalizeGlobalLorebook/u);
  assert.match(saveStateSource, /globalLorebook: _globalLorebook/u);
  assert.doesNotMatch(savedConversationSource, /globalLorebook/u);
  assert.doesNotMatch(loadSavedConversationSource, /currentState\.globalLorebook\s*=/u);
  assert.match(serverSource, /pathname === "\/api\/global-lorebook" && method === "GET"/u);
  assert.match(serverSource, /pathname === "\/api\/global-lorebook" && method === "PUT"/u);
  assert.doesNotMatch(routeSource, /statePayload/u);
});

test("lorebook content never chains to global or card entries through prepared input", () => {
  const scope = vm.createContext({
    safeText: value => typeof value === "string" ? value.trim() : "",
    getLatestUserMessage: current => [...current.conversation].reverse().find(message => message.role === "user"),
    getPreviousAssistantMessage: current => [...current.conversation].slice(0, -1).reverse().find(message => message.role === "assistant"),
    getActiveRoleCard: () => ({ id: "card" }),
    resolveUserDisplayName: () => "user",
    getRenderedRoleCardLorebookEntries: current => current.entries,
    getAttachedLorebookEntryIdsSinceLastCompression: current => new Set(current.attached || []),
    getLorebookEntryIdentity: entry => entry.id,
    isPermanentLorebookEntry: entry => Boolean(entry.permanent),
    splitLorebookKeywords: keywords => keywords || [],
    passesLorebookProbability: entry => entry.probability !== 0
  });
  for (const [name, next] of [["getLorebookContextSource", "getLorebookEntryIdentity"], ["doesLorebookKeywordGroupMatch", "doesLorebookEntryMatchSource"], ["doesLorebookEntryMatchSource", "isPermanentLorebookEntry"], ["resolveTriggeredLorebookEntries", "getPermanentRoleCardLorebookEntries"]]) {
    vm.runInContext(functionSource(name, next), scope);
  }
  const entries = [
    { id: "global:a", keywords: ["alpha"], content: "beta", enabled: true },
    { id: "card:b", keywords: ["beta"], content: "gamma", enabled: true },
    { id: "global:c", keywords: ["gamma"], content: "delta", enabled: true },
    { id: "disabled", keywords: ["alpha"], enabled: false },
    { id: "permanent", keywords: ["alpha"], permanent: true },
    { id: "zero", keywords: ["alpha"], probability: 0 }
  ];
  const current = { entries, conversation: [
    { id: "assistant-1", role: "assistant", content: "quiet" },
    { id: "user-1", role: "user", content: "alpha", baseModelContent: "alpha beta gamma", modelContent: "alpha\n\n【觸發世界書 Lorebooks】beta gamma" }
  ] };
  const ids = () => Array.from(scope.resolveTriggeredLorebookEntries(current, { id: "card" }), entry => entry.id);
  assert.deepEqual(ids(), ["global:a"]);
  current.attached = ["global:a"];
  current.conversation.push({ id: "assistant-2", role: "assistant", content: "quiet" }, { id: "user-2", role: "user", content: "繼續", baseModelContent: "beta gamma", modelContent: "beta gamma" });
  assert.deepEqual(ids(), []);
  current.conversation.at(-1).content = "beta";
  assert.deepEqual(ids(), ["card:b"]);
  current.conversation.at(-2).content = "gamma";
  assert.deepEqual(ids(), ["card:b", "global:c"]);
});

test("copying card lorebooks only appends new names and persists independent entries", { timeout: 30000 }, async t => {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tavern-lorebook-copy-"));
  fs.cpSync(path.join(root, "src"), path.join(directory, "src"), { recursive: true });
  fs.cpSync(path.join(root, "defaults"), path.join(directory, "defaults"), { recursive: true });
  fs.copyFileSync(path.join(root, "package.json"), path.join(directory, "package.json"));
  fs.symlinkSync(path.join(root, "node_modules"), path.join(directory, "node_modules"), "dir");
  const listener = net.createServer();
  await new Promise((resolve, reject) => { listener.once("error", reject); listener.listen(0, "127.0.0.1", resolve); });
  const port = listener.address().port;
  await new Promise(resolve => listener.close(resolve));
  const server = spawn(process.execPath, ["src/index.js"], {
    cwd: directory,
    env: { PATH: process.env.PATH, HOME: directory, PORT: String(port), NODE_ENV: "test" },
    stdio: ["ignore", "ignore", "pipe"]
  });
  let errors = "";
  server.stderr.on("data", chunk => { errors += chunk.toString(); });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill("SIGTERM");
      await once(server, "exit");
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${errors}`);
    try { ready = (await fetch(`${base}/api/global-lorebook`)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.equal(ready, true);
  const get = async url => (await fetch(`${base}${url}`)).json();
  const send = async (url, method, body, status = 200) => {
    const response = await fetch(`${base}${url}`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.status, status);
    return response.json();
  };
  const existing = { id: "same-id", key: "學校", keywords: ["學校"], content: "原有內容", enabled: true };
  const initial = await send("/api/global-lorebook", "PUT", { enabled: false, entries: [existing] });
  const cardsBefore = await get("/api/role-cards");
  await send("/api/global-lorebook/entries", "POST", { entries: "invalid" }, 400);
  const drafts = [
    { ...existing, key: " 学校 ", content: "不可覆蓋" },
    { id: "same-id", key: "天氣", keywords: ["雨"], secondaryKeywords: ["風"], content: "編輯中的內容", enabled: false, probability: 37 },
    { key: "天气", keywords: ["天"], content: "同批重名" },
    { key: "星空", content: "永久條目", permanent: true, probability: 80 },
    { key: "未完成", keywords: ["空"] },
    { key: "缺少關鍵字", content: "不能觸發" }
  ];
  const result = await send("/api/global-lorebook/entries", "POST", { entries: drafts });
  assert.equal(result.addedCount, 2);
  assert.equal(result.skippedCount, 2);
  assert.equal(result.invalidCount, 2);
  assert.equal(result.globalLorebook.enabled, false);
  assert.deepEqual(result.globalLorebook.entries[0], initial.globalLorebook.entries[0]);
  const weather = result.globalLorebook.entries[1];
  assert.notEqual(weather.id, "same-id");
  assert.equal(weather.content, "編輯中的內容");
  assert.equal(weather.enabled, false);
  assert.equal(weather.probability, 37);
  assert.deepEqual(weather.keywords, ["雨"]);
  assert.deepEqual(weather.secondaryKeywords, ["風"]);
  assert.equal(result.globalLorebook.entries[2].permanent, true);
  const persisted = JSON.parse(fs.readFileSync(path.join(directory, "data/cardstate.json"), "utf8"));
  assert.deepEqual(persisted.globalLorebook, result.globalLorebook);
  const repeated = await send("/api/global-lorebook/entries", "POST", { entries: drafts });
  assert.equal(repeated.addedCount, 0);
  assert.equal(repeated.skippedCount, 4);
  assert.deepEqual(repeated.globalLorebook, result.globalLorebook);
  const concurrent = await Promise.all(["山", "山"].map(key => send("/api/global-lorebook/entries", "POST", { entries: [{ key, content: key, permanent: true }] })));
  assert.equal(concurrent.reduce((total, item) => total + item.addedCount, 0), 1);
  assert.deepEqual(await get("/api/role-cards"), cardsBefore);
});
