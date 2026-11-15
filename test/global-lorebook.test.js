import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

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
