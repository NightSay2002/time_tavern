import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

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
