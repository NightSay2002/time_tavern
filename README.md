# 時分居酒屋

![時分居酒屋封面](src/public/assets/img/cover.png)

本地長篇角色對話工具，包含主聊天頁、角色卡與 Prompt 編輯、模型內容管理、Discord Bot，以及 NovelAI 跑圖頁。

## 快速啟動

啟動器需求：

- 第一次啟動可連線至 `nodejs.org` 與 npm registry
- 對話 API key：OpenAI-compatible Chat Completions API
- 選配：Discord Bot Token
- 選配：NovelAI Persistent API Token

`start-mac.command` 與 `start-win.bat` 會檢查 Node.js。系統已有 Node.js `>=18` 與 npm 時直接使用；否則從 Node.js 官方下載最新 Node.js 24.x LTS 到 `.runtime/node/`，驗證 SHA-256 後供此專案使用，不需要管理員權限，也不會修改系統 Node.js。

macOS：

```bash
./start-mac.command
```

Windows：

```bat
start-win.bat
```

手動啟動：

```bash
npm install
cp .env.example .env
npm start
```

手動執行 `npm start` 才需要預先自行安裝 Node.js `>=18` 與 npm。

啟動後打開：

- 主頁：`http://localhost:3234`
- NovelAI：`http://localhost:3234/novelai.html`

`npm start` 會先檢查目前追蹤的 GitHub 分支。工作區沒有程式碼改動且可 fast-forward 時會自動更新；離線、有本機程式碼改動或分支已分岔時會保留現況並繼續啟動。

使用者的角色卡、使用者設定、Prompt 與目前對話都放在被 Git 忽略的 `data/`，自動更新不會覆蓋。根目錄 `.env` 會自動備份到 `data/environment.env`；新版本缺少 `.env` 時，啟動器會由該備份還原。舊版若曾把本機預設或 Prompt 寫進追蹤檔，更新器會先遷移到 `data/` 再更新程式碼。

若本機程式檔改動使自動更新跳過，手動更新時先停止服務並備份整個 `data/`，取得乾淨的新版本後，只把備份的 `data/` 放回新版本再啟動。不要用舊程式檔覆蓋新版本。`data/environment.env` 含 Token 與 API Key，請勿分享或提交。

這個檢查只在每次 `npm start` 啟動時執行一次，不會中斷正在運行的 server 做熱更新。每台 server 都需要以 `npm start` 重啟才會拉取；直接執行 `node src/index.js` 會略過更新流程。需要暫時關閉時可在 `.env` 設定：

```env
TIME_TAVERN_AUTO_UPDATE=0
```

## 最少設定

`.env` 至少填對話 API：

```env
CHAT_API_PROVIDER=deepseek
CHAT_API_KEY=你的_API_Key
CHAT_API_MODEL=deepseek-v4-pro
```

也可把 provider 改為 `zhipu` 並選用 `glm-5.3` 或原生多模態的 `glm-5.3-flash`；使用一般 Base URL 時，系統使用 `CHAT_API_MODEL` 指定的模型且不會因上傳圖片自動換模型。完整 provider 設定見 [細節文件](docs/DETAILS.md)。

環境設定的對話 API Key 可用 `Key 1`、`Key 2...` 分頁管理，每組同時包含主對話 Key 與大模型處理 Key。新故事自動租用最前面的閒置組，任何 AI 呼叫都會續期；24 小時沒有 AI 活動後才供其他故事使用，刪除故事或 Discord 頻道則立即釋放。切換供應商時會保留各供應商自己的 Key 組、輸出模型與 Base URL，並讓現有故事改用新供應商重新分配；目前供應商的專屬 Key 優先，通用 Key 只作舊設定後備，若兩者都沒有則要求先設定。Base URL 可直接填入包含 `/chat/completions` 與查詢參數的完整 deployment URL；此時 API 輸出模型可留空，請求會使用 `api-key` 驗證。

NovelAI 圖片功能另外填：

```env
NOVELAI_API_TOKEN=你的_NovelAI_Persistent_API_Token
```

保存環境設定時，只有 `NOVELAI_API_TOKEN` 在空白與有值之間切換，系統才會自動停用或啟用所有 Prompt 跑圖觸發組合。Token 狀態沒有改變時，保留使用者在 Prompt 內手動調整的啟用狀態。

Discord 不填 `DISCORD_BOT_TOKEN` 也能正常使用本地網頁。
設定 `DISCORD_ALLOWED_USER_ID` 後，Bot 只接受該 Discord 使用者的指令、訊息、編輯與反應。
`DISCORD_BOT_TOKEN`、`DISCORD_CLIENT_ID` 與 `DISCORD_ALLOWED_USER_ID` 只保留在本機 `.env`，不會寫入作者預設。

QQ 官方 Bot 為選配，只處理 C2C 私聊。填入 `QQ_BOT_APP_ID` 與 `QQ_BOT_APP_SECRET` 並重啟後，私訊 Bot 即可直接對話；每個 OpenID 都有獨立故事。可用 `QQ_ALLOWED_USER_OPENID` 限定唯一使用者，所有 QQ 憑證同樣只保留在本機。

## 第一次啟動預設

第一次啟動時，後端會把發布用的 `defaults/app-defaults.json` 複製成 `data/app-defaults.json`。如果沒有 `data/app-state.json`，再以這份本機預設建立目前狀態。

目前發布預設包含 22 張角色卡、2 個助手與 5 種 Prompt 模式，其中包含「跑圖卡」的跑圖不跑正文設定。

NovelAI 同樣把 `defaults/novelai-defaults.json` 複製成 `data/novelai-defaults.json`；瀏覽器沒有本頁 draft 時會讀取本機 NovelAI 預設。

`start-mac.command` 與 `start-win.bat` 會自動準備缺少的專案 Node.js、安裝缺少的 `node_modules`、執行 `npm start`，並在更新及伺服器啟動完成後依目前 `PORT` 開啟瀏覽器。預設套用由 server 與 NovelAI 前端完成，啟動器不需要額外呼叫套用 API。

服務已在運行時若更新到後端程式，請使用環境設定中的「重啟伺服器」或重新執行啟動器；只刷新網頁只會重新載入前端檔案。

主頁「設定及其他雜項」中的「全局設定」可把目前設定匯出成 JSON 檔、從自行選擇的 JSON 檔匯入，或直接套用目前版本隨附的作者預設。檔案不包含對話、對話存檔、AI 呼叫紀錄、Token 或 API Key；匯入與套用作者預設也不會覆蓋本機密鑰及對話存檔。

## 功能

主頁：

- 角色卡與助手：由彩色流動、霓虹邊框的「選擇」入口瀏覽卡片，或從「建立」選單建立及匯入角色卡；可直接開啟完整表單建立助手，新助手的 Prompt 預設留空，另支援編輯、裁切封面、單卡／全局世界書、開場對話與角色卡匯出。
- Prompt 編輯：角色模式、正文規則、大模型、模塊、觸發條件、並行跑圖與追加詞。
- 模型內容：查看、保存、匯出標準壓縮模型與自訂大模型內容。
- 對話：串流生成、圖片輸入、停止、改寫較早輸入、訊息編輯重算、對話專屬存檔與載入、分塊去重 AI 呼叫紀錄；每個故事及存檔不設回合數上限並完整保存長對話，主聊天預設顯示現在，存檔預覽由開場開始，兩者都以固定 20 則的滑動視窗查看全部歷史並可在最早訊息與現在之間直達切換；保持時間、推進場景、時間流逝與繼續等固定劇情指令會跟隨全局簡繁設定；對話跑圖不會自動收藏，未隨對話存檔保存的圖片會在對話結束後清除；重算與載入只回復劇情進度，不覆蓋目前設定。
- 角色卡時間統計：天數、日期、早中晚、全域新對話起點、繁簡互通關鍵字、自動切換，以及由 user 輸入直接觸發下一時間段；助手模式不套用。
- 設定及其他雜項：環境設定、全局設定與全站簡繁轉換直接顯示；「亂七八糟」包含問題反映，以及 NovelAI 跑圖與 Storyboard 入口。語言設定會在啟動與切換時同步網頁、Discord、QQ、角色卡、開場、對話顯示及模型文字輸入；本機角色卡與存檔仍保留原文，不會被批次改寫。

NovelAI：

- 支援 NAI Diffusion V5、V4.5、V4 與 V3，並提供常用生成參數、Prompt 片段與參考圖功能。
- 支援連續生成、圖片設定匯入、下載、收藏、本地歷史與放大檢視；生成及收藏異動會保留目前圖片庫分頁，上下方向鍵可跨頁連續瀏覽。
- 支援 NovelAI 預設的保存與啟用。
- 純靜態版本：<https://nightsay2002.github.io/novelai-image-static/>；Token 與圖片只保存在使用者瀏覽器。

Discord：

- 九個 Slash 指令：`/ai_start`、`/ai_status`、`/stop`、`/close`、`/player_set`、`/reload`、`/quick_send`、`/archive`、`/archive_return`。
- Slash 指令只註冊為全域應用程式指令；啟動時會清除舊版留下的伺服器指令，避免同一指令重複顯示。
- 每個頻道與私訊可獨立保存角色／助手、回合、時間、壓縮內容、模型狀態、玩家分配及聊天；AI 呼叫紀錄則全局共用。故事與對話存檔會跨重啟保留，分離資料檔存在時可自動重建遺失的輕量索引，只有使用者刪除故事或 Discord 實際刪除頻道才會移除。`/stop` 在生成中會停止回覆，閒置時只釋放目前故事租用的 Key，不刪除故事。支援文字／圖片附件、多開場角色卡、存檔瀏覽、多玩家座位、訊息重算與反應回饋，網頁可手動切換管理各故事。模型呼叫失敗會把該次輸入標為無效且不計入回合，下一次成功後自動清除；Slash 指令錯誤只向使用者顯示，成功正文直接送到原頻道，普通頻道訊息的錯誤改以私訊通知；存檔指令的數字參數只需輸入 `0` 或 `1`。

QQ：

- 官方 Bot 只接收私人 C2C 訊息，不處理群聊、QQ 頻道或主動通知；第一次私訊會使用目前選中的角色卡／助手直接開始，之後固定使用該 OpenID 的獨立故事，也支援圖片附件與對話跑圖回覆。QQ 專用文字指令可使用半形 `!` 或全形 `！`；`!開始`、`!开始` 都等同 `!ai_start 0 1`，指令說明與回覆會跟隨全局簡繁設定。

## 預覽

![主頁截圖](src/public/assets/img/image1.png)

![Prompt 編輯截圖](src/public/assets/img/image2.png)

![NovelAI 跑圖頁截圖](src/public/assets/img/image3.png)

![NovelAI 圖片檢視截圖](src/public/assets/img/image4.png)

## 主要檔案

```text
src/index.js                 HTTP API、狀態、Prompt、Discord、QQ、NovelAI proxy
src/qq-bot.js                QQ 官方 Bot C2C Gateway 與訊息 API
src/qq-command.js            QQ 私聊文字指令解析與說明
src/public/index.html        主頁
src/public/app.js            主頁互動
src/public/novelai.html      NovelAI 頁
src/public/novelai.js        NovelAI 互動
src/public/styles.css        共用樣式
defaults/app-defaults.json     發布用主功能與 Prompt 預設
defaults/novelai-defaults.json 發布用 NovelAI 預設
scripts/bootstrap-node-mac.sh   macOS 專案 Node.js 安裝器
scripts/bootstrap-node-win.ps1  Windows 專案 Node.js 安裝器
data/app-defaults.json         使用者本機主功能與 Prompt 預設
data/novelai-defaults.json     使用者本機 NovelAI 預設
data/environment.env           根目錄 .env 的本機備份
data/                          角色卡、設定、對話與其他本機資料，不要提交
```

## 更多細節

完整環境變數、Discord 指令、API、資料檔與功能細節見：

[docs/DETAILS.md](docs/DETAILS.md)

## 檢查

```bash
npm test
node --check src/index.js
node --check src/public/app.js
node --check src/public/novelai.js
```

`npm test` 使用本地模擬對話驗證 20 輪正文上下文：第 21 回合先觸發標準壓縮，再送出角色卡、壓縮內容、第 20 回合橋接與本次 user；測試不會呼叫外部模型 API。
