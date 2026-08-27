import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

test("secondary actions live under the standalone other menu", () => {
  const functionBlock = html.match(/<h2>功能按鈕<\/h2>([\s\S]*?)<\/div>/u)?.[1] || "";
  assert.doesNotMatch(functionBlock, /useDefaultsBtn|novelAiImageBtn|uiLanguageToggleBtn|問題反映/);
  assert.match(html, /id="otherActionsBtn"[^>]*>其他</);
  assert.match(html, /id="openDefaultsMenuBtn"[^>]*>預設</);
  assert.match(html, /id="openNovelAiMenuBtn"[^>]*>NovelAI</);
  assert.match(html, /id="uiLanguageToggleBtn"[^>]*>簡繁轉換：繁體</);
  assert.match(html, /id="feedbackLink"[^>]*>[\s\S]*問題反映</);
});

test("role-card editing returns to the preserved picker page", () => {
  const pickerStart = appSource.indexOf("function openRoleCardPicker(");
  const pickerEnd = appSource.indexOf("\nfunction startCurrentChatTarget(", pickerStart);
  const pickerSource = appSource.slice(pickerStart, pickerEnd);
  assert.doesNotMatch(pickerSource, /roleCardPickerPage\s*=\s*1/);
  assert.match(appSource, /openRoleCardDialog\(card, \{ returnToPicker: true \}\)/);
  assert.match(appSource, /roleCardDialogReturnToPicker = false;\s*openRoleCardPicker\(\)/);
});
