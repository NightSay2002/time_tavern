import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");
const appSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const styles = fs.readFileSync(new URL("../src/public/styles.css", import.meta.url), "utf8");

test("conversation tools and global settings use separate sections", () => {
  const functionBlock = html.match(/<h2>功能按鈕<\/h2>([\s\S]*?)<\/div>/u)?.[1] || "";
  const settingsBlock = html.match(/<h2>設定及其他雜項<\/h2>([\s\S]*?)<\/div>/u)?.[1] || "";
  const otherMenu = html.match(/<dialog id="otherActionsDialog"[\s\S]*?<\/dialog>/u)?.[0] || "";
  const defaultsMenu = html.match(/<dialog id="defaultsMenuDialog"[\s\S]*?<\/dialog>/u)?.[0] || "";
  assert.match(functionBlock, /id="editAiOutputBtn"/u);
  assert.match(functionBlock, /id="contextCompressionInspectBtn"/u);
  assert.match(functionBlock, /id="timeTrackingSettingsBtn"/u);
  assert.doesNotMatch(functionBlock, /envSettingsBtn|openDefaultsMenuBtn|uiLanguageToggleBtn|otherActionsBtn/u);
  assert.match(settingsBlock, /id="envSettingsBtn"/u);
  assert.match(settingsBlock, /id="openDefaultsMenuBtn"[^>]*>全局設定/u);
  assert.match(settingsBlock, /id="uiLanguageToggleBtn"[^>]*>簡繁轉換：繁體/u);
  assert.match(settingsBlock, /id="otherActionsBtn"[^>]*>亂七八糟/u);
  assert.match(otherMenu, /<h3>亂七八糟<\/h3>/u);
  assert.doesNotMatch(otherMenu, /openDefaultsMenuBtn|uiLanguageToggleBtn/u);
  assert.match(otherMenu, /id="openNovelAiMenuBtn"[^>]*>NovelAI</u);
  assert.match(otherMenu, /id="feedbackLink"[^>]*>[\s\S]*問題反映/u);
  assert.match(defaultsMenu, /<h3>全局設定<\/h3>/u);
  assert.match(defaultsMenu, /id="useDefaultsBtn"[^>]*>匯入全局設定</u);
  assert.match(defaultsMenu, /id="saveDefaultsBtn"[^>]*>匯出當前全局設定</u);
  assert.match(defaultsMenu, /id="updateDefaultsBtn"[^>]*>使用作者預設</u);
  assert.match(defaultsMenu, /id="globalSettingsFileInput"[^>]*type="file"[^>]*accept="\.json,application\/json"/u);
  assert.match(appSource, /saveDefaultsBtn\.textContent = "匯出當前全局設定"/u);
  assert.match(appSource, /useDefaultsBtn\.textContent = "匯入全局設定"/u);
  assert.match(appSource, /window\.showSaveFilePicker/u);
  assert.match(appSource, /URL\.createObjectURL/u);
  assert.match(appSource, /globalSettingsFileInput\.click\(\)/u);
  assert.match(appSource, /request\("\/api\/defaults\/export"\)/u);
  assert.match(appSource, /request\("\/api\/defaults\/import"/u);
  assert.match(appSource, /request\("\/api\/defaults\/author"/u);
  assert.doesNotMatch(appSource, /\/api\/defaults\/(?:save|apply|update)/u);
  assert.doesNotMatch(appSource, /closeDefaultsMenuBtn[\s\S]{0,180}otherActionsDialog/u);
});

test("role-card picker uses the compact label and highlighted entry", () => {
  assert.match(html, /id="selectRoleCardBtn"[^>]*class="[^"]*desktop-role-picker-btn[^"]*"[^>]*>選擇<\/button>/u);
  assert.match(html, /<dialog id="roleCardPickerDialog"[\s\S]*?<h3>選擇卡<\/h3>/u);
  assert.doesNotMatch(html, /選擇角色卡/u);
  assert.doesNotMatch(appSource, /選擇角色卡/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?border:\s*2px solid #fff6fd/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?font-family:\s*"Pop Gothic"/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?font-size:\s*27px/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?background-image:\s*linear-gradient/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?animation:\s*rolePickerColorFlow 12s linear infinite/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?color:\s*#100712/u);
  assert.match(styles, /button\.desktop-role-picker-btn\s*\{[\s\S]*?text-shadow:\s*none/u);
  assert.match(styles, /button\.desktop-role-picker-btn:hover\s*\{/u);
  assert.match(styles, /button\.desktop-role-picker-btn:active\s*\{[\s\S]*?animation-play-state:\s*paused/u);
  assert.match(styles, /@keyframes rolePickerColorFlow\s*\{[\s\S]*?background-position:\s*100% 50%[\s\S]*?background-position:\s*0% 50%/u);
});

test("role-card creation actions live under one create menu", () => {
  const roleCardBlock = html.match(/<h2>角色卡<\/h2>([\s\S]*?)<div id="roleCardList"/u)?.[1] || "";
  const createMenu = html.match(/<dialog id="createMenuDialog"[\s\S]*?<\/dialog>/u)?.[0] || "";
  assert.match(roleCardBlock, /id="openCreateMenuBtn"[^>]*>建立</u);
  assert.doesNotMatch(roleCardBlock, /createRoleCardBtn|createAssistantCardBtn|importRoleCardBtn/u);
  assert.match(createMenu, /id="createRoleCardBtn"[^>]*>建立角色卡</u);
  assert.match(createMenu, /id="createAssistantCardBtn"[^>]*>建立新助手</u);
  assert.match(createMenu, /id="importRoleCardBtn"[^>]*>匯入角色卡</u);
});

test("new assistants open as an unsaved editor draft", () => {
  const assistantForm = html.match(/<form id="assistantPromptForm"[\s\S]*?<\/form>/u)?.[0] || "";
  assert.doesNotMatch(appSource, /window\.prompt\("新助手名稱"/u);
  assert.match(appSource, /openAssistantPromptDialog\(\{[\s\S]*?id:\s*""[\s\S]*?prompt:\s*""[\s\S]*?\}, \{ create: true \}\)/u);
  assert.match(appSource, /isCreating[\s\S]*?\? assistantCard\?\.prompt \|\| ""[\s\S]*?: assistantCard\?\.prompt \|\| appState\?\.characterCardCreationAssistantPrompt/u);
  assert.match(appSource, /isCreating \? "\/api\/assistant-cards" : `\/api\/assistant-cards\/\$\{assistantId\}`/u);
  assert.match(appSource, /method: isCreating \? "POST" : "PUT"/u);
  assert.ok(assistantForm.indexOf("assistantCardName") < assistantForm.indexOf("assistantCardDescription"));
  assert.ok(assistantForm.indexOf("assistantCardDescription") < assistantForm.indexOf("assistantPromptInput"));
  assert.ok(assistantForm.indexOf("assistantPromptInput") < assistantForm.indexOf("assistantCardOpeningDialogue"));
});

test("role-card editing returns to the preserved picker page", () => {
  const pickerStart = appSource.indexOf("function openRoleCardPicker(");
  const pickerEnd = appSource.indexOf("\nfunction startCurrentChatTarget(", pickerStart);
  const pickerSource = appSource.slice(pickerStart, pickerEnd);
  assert.doesNotMatch(pickerSource, /roleCardPickerPage\s*=\s*1/);
  assert.match(appSource, /openRoleCardDialog\(card, \{ returnToPicker: true \}\)/);
  assert.match(appSource, /roleCardDialogReturnToPicker = false;\s*openRoleCardPicker\(\)/);
});
