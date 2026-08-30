import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  localizeChatApiMessages,
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
    localizeSystemText("服务器、鼠标、软件与保存文件", UI_LANGUAGE_TRADITIONAL),
    "伺服器、滑鼠、軟體與儲存檔案"
  );
});

test("chat API text follows the selected script without changing image payloads", () => {
  const imageUrl = "data:image/png;base64,abc123";
  const localized = localizeChatApiMessages([
    { role: "system", content: "角色卡编号与开场内容" },
    {
      role: "user",
      content: [
        { type: "text", text: "请查看附加图片" },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }
  ], UI_LANGUAGE_TRADITIONAL);

  assert.equal(localized[0].content, "角色卡編號與開場內容");
  assert.equal(localized[1].content[0].text, "請檢視附加圖片");
  assert.equal(localized[1].content[1].image_url.url, imageUrl);
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

test("Discord role-card browser converts labels, card names, and openings", () => {
  const payload = buildDiscordRoleCardBrowserPayload({
    roleCards: [{
      id: "card-1",
      name: "雲端與滑鼠",
      openingDialogues: [{ id: "opening-1", content: "儲存她的祕密" }]
    }],
    activeRoleCardId: "card-1"
  }, 1, UI_LANGUAGE_SIMPLIFIED);

  assert.match(payload.content, /角色卡 1 \/ 1（目前使用）/u);
  assert.match(payload.content, /名称：云端与鼠标/u);
  assert.match(payload.content, /保存她的秘密/u);
  assert.equal(payload.components[0].components[0].data.label, "上一张");
});

test("Discord archive browser converts saved names and dialogue", () => {
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
  assert.match(payload.content, /名称：云端存档/u);
  assert.match(payload.content, /角色：鼠标少女/u);
  assert.match(payload.content, /请保存这句/u);
  assert.match(payload.content, /角色回答：数据不变/u);
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
  assert.match(serverSource, /pathname === "\/vendor\/opencc-cn2t[.]js"/u);
  assert.match(webLanguageSource, /opencc-cn2t[.]js/u);
  assert.doesNotMatch(webLanguageSource, /[.]markdown-body/u);
});

test("Traditional Chinese does not keep a page-wide mutation observer active", () => {
  assert.match(webLanguageSource, /if \(language !== UI_LANGUAGE_SIMPLIFIED\) \{\s*return;\s*\}/u);
});
