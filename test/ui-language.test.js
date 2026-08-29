import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  localizeSystemText,
  normalizeChineseTextForMatch,
  normalizeUiLanguage,
  UI_LANGUAGE_SIMPLIFIED,
  UI_LANGUAGE_TRADITIONAL
} from "../src/ui-language.js";
import { buildDiscordRoleCardBrowserPayload } from "../src/discord-role-card-browser.js";
import { buildDiscordArchiveBrowserPayload } from "../src/discord-archive.js";

const webLanguageSource = fs.readFileSync(
  new URL("../src/public/ui-language.js", import.meta.url),
  "utf8"
);

test("UI language normalization defaults to Traditional Chinese", () => {
  assert.equal(normalizeUiLanguage("zh-Hans"), UI_LANGUAGE_SIMPLIFIED);
  assert.equal(normalizeUiLanguage("zh-Hant"), UI_LANGUAGE_TRADITIONAL);
  assert.equal(normalizeUiLanguage("unknown"), UI_LANGUAGE_TRADITIONAL);
});

test("complete conversion includes Taiwanese UI terminology", () => {
  assert.equal(
    localizeSystemText("伺服器、滑鼠、介面、儲存、資料夾與硬碟", UI_LANGUAGE_SIMPLIFIED),
    "服务器、鼠标、界面、保存、文件夹与硬盘"
  );
  assert.equal(
    localizeSystemText("伺服器與滑鼠", UI_LANGUAGE_TRADITIONAL),
    "伺服器與滑鼠"
  );
});

test("Chinese matching treats Traditional and Simplified text as the same value", () => {
  assert.equal(
    normalizeChineseTextForMatch("現在時間流逝，到了晚上"),
    normalizeChineseTextForMatch("现在时间流逝，到了晚上")
  );
  assert.equal(normalizeChineseTextForMatch("ＴＩＭＥ ＳＫＩＰ"), "time skip");
});

test("all time judgment word lists use script-independent matching", () => {
  const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const listStart = serverSource.indexOf("function normalizeTimeTrackingWordList(");
  const listEnd = serverSource.indexOf("\nfunction normalizeTimePeriod(", listStart);
  const matchStart = serverSource.indexOf("function normalizeTimeMatchText(");
  const matchEnd = serverSource.indexOf("\nfunction findTimeTrackingWordOccurrences(", matchStart);
  assert.match(serverSource.slice(listStart, listEnd), /normalizeChineseTextForMatch/);
  assert.match(serverSource.slice(matchStart, matchEnd), /normalizeChineseTextForMatch/);
});

test("Discord role-card browser converts labels but preserves card content", () => {
  const payload = buildDiscordRoleCardBrowserPayload({
    roleCards: [{ id: "card-1", name: "雲端與滑鼠", description: "儲存她的祕密" }],
    activeRoleCardId: "card-1"
  }, 1, UI_LANGUAGE_SIMPLIFIED);

  assert.match(payload.content, /角色卡 1 \/ 1（目前使用）/u);
  assert.match(payload.content, /名称：雲端與滑鼠/u);
  assert.match(payload.content, /儲存她的祕密/u);
  assert.equal(payload.components[0].components[0].data.label, "上一张");
});

test("Discord archive browser converts labels but preserves saved names and dialogue", () => {
  const payload = buildDiscordArchiveBrowserPayload({
    sessions: [{ id: "s1", name: "雲端存檔", roleCardName: "滑鼠少女", updatedAt: "2026-08-29T00:00:00.000Z" }],
    sessionId: "s1",
    conversation: [
      { role: "user", content: "請儲存這句", turnNumber: 1 },
      { role: "assistant", content: "角色回答：資料不變" }
    ],
    language: UI_LANGUAGE_SIMPLIFIED
  });

  assert.match(payload.content, /对话存档 1 \/ 1/u);
  assert.match(payload.content, /名称：雲端存檔/u);
  assert.match(payload.content, /角色：滑鼠少女/u);
  assert.match(payload.content, /請儲存這句/u);
  assert.match(payload.content, /角色回答：資料不變/u);
});

test("all web surfaces share the server-backed UI language controller", () => {
  const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const novelAiSource = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
  const storyboardSource = fs.readFileSync(new URL("../src/public/storyboard.js", import.meta.url), "utf8");
  const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

  assert.match(appSource, /createUiLanguageController/u);
  assert.doesNotMatch(appSource, /UI_T2S_CHARS|UI_T2S_PHRASES/u);
  assert.match(novelAiSource, /loadServerUiLanguage\(uiLanguageController\)/u);
  assert.match(storyboardSource, /loadServerUiLanguage\(uiLanguageController\)/u);
  assert.match(serverSource, /pathname === "\/api\/ui-language" && method === "PUT"/u);
  assert.match(serverSource, /pathname === "\/vendor\/opencc-t2cn[.]js"/u);
});

test("Traditional Chinese does not keep a page-wide mutation observer active", () => {
  assert.match(webLanguageSource, /if \(language !== UI_LANGUAGE_SIMPLIFIED\) \{\s*return;\s*\}/u);
});
