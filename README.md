# 時分居酒屋

![時分居酒屋封面](src/public/assets/img/cover.png)

本地長篇角色對話工具，包含主聊天頁、角色卡與 Prompt 編輯、模型內容管理、Discord Bot，以及 NovelAI 跑圖頁。

## 快速啟動

需求：

- Node.js `>=18`
- npm
- 對話 API key：OpenAI-compatible Chat Completions API
- 選配：Discord Bot Token
- 選配：NovelAI Persistent API Token

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

啟動後打開：

- 主頁：`http://localhost:3234`
- NovelAI：`http://localhost:3234/novelai.html`

`npm start` 會先檢查目前追蹤的 GitHub 分支。工作區沒有程式碼改動且可 fast-forward 時會自動更新；離線、有本機程式碼改動或分支已分岔時會保留現況並繼續啟動。

使用者的角色卡、使用者設定、Prompt、目前對話與本機預設都放在被 Git 忽略的 `data/`，自動更新不會覆蓋。舊版若曾把「儲存預設」或 Prompt 寫進追蹤檔，更新器會先遷移到 `data/` 再更新程式碼。

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

DeepSeek 預設使用 `deepseek-v4-pro`。`CHAT_API_TEMPERATURE` 可設定 `0–2`，並支援 `0.1` 等小數。

NovelAI 圖片功能另外填：

```env
NOVELAI_API_TOKEN=你的_NovelAI_Persistent_API_Token
```

Discord 不填 `DISCORD_BOT_TOKEN` 也能正常使用本地網頁。
`DISCORD_BOT_TOKEN` 與 `DISCORD_CLIENT_ID` 只保留在本機 `.env`，不會寫入作者預設。

## 第一次啟動預設

第一次啟動時，後端會把發布用的 `defaults/app-defaults.json` 複製成 `data/app-defaults.json`。如果沒有 `data/app-state.json`，再以這份本機預設建立目前狀態。

目前發布預設包含 18 張角色卡、2 個助手與 5 種 Prompt 模式，其中包含「跑圖卡」的跑圖不跑正文設定。

NovelAI 同樣把 `defaults/novelai-defaults.json` 複製成 `data/novelai-defaults.json`；瀏覽器沒有本頁 draft 時會讀取本機 NovelAI 預設。

`start-mac.command` 與 `start-win.bat` 會自動檢查 Node/npm、安裝缺少的 `node_modules`、執行 `npm start`，並在更新及伺服器啟動完成後依目前 `PORT` 開啟瀏覽器。預設套用由 server 與 NovelAI 前端完成，啟動器不需要額外呼叫套用 API。

服務已在運行時若更新到後端程式，請使用環境設定中的「重啟伺服器」或重新執行啟動器；只刷新網頁只會重新載入前端檔案。

主頁功能按鈕中的「儲存預設」只寫入本機預設；「使用預設」才會套用；「使用作者預設」會以目前程式版本隨附的作者預設替換本機預設，但不會立即修改正在使用的角色卡、Prompt 或目前對話。

## 功能

主頁：

- 角色卡：建立、裁切封面、世界書、開場對話、匯入/匯出。
- Prompt 編輯：角色模式、正文規則、大模型、模塊、觸發條件、並行跑圖（可繼續正文或完全停止正文）、追加詞；正文最近對話使用 API message role，不會把回合編號加入內容，壓縮合併區塊只標示 user/assistant。
- 模型內容：查看、保存、匯出標準壓縮模型與自訂大模型內容。
- 對話：串流生成、停止、改寫較早輸入、訊息編輯重算、存檔與載入、AI 呼叫紀錄；紀錄會顯示實際 API role，不另外建立回合編號。
- 時間統計：天數、日期、早中晚、關鍵字與自動切換。
- 預設：儲存、套用或手動更新本機預設。

NovelAI：

- 模型、尺寸、Steps、Guidance、Sampler、Seed、Variety+。
- Fixed Prompt / Random Prompt 片段庫。
- Character Prompts、Vibe Transfer、Image2Image、Precise Reference。
- 拖入圖片時，只有偵測到可讀取的 NovelAI PNG metadata 才會顯示「匯入設定」。
- 圖片生成、Loop Generate、下載 metadata；右側可切換本地歷史與收藏，取消收藏會把圖片移回歷史。
- Vibe Transfer、Image2Image、Precise Reference 圖片會保存在此瀏覽器的本地草稿，離開頁面後再返回仍會還原。
- 本地歷史每頁載入 20 張，支援逐張刪除或一鍵清空；新圖片以 Blob 與縮圖保存，避免大量原圖同時載入造成卡頓。
- 圖片檢視器：點擊主圖放大，拖曳移動，滾輪縮放。
- NovelAI 預設保存/啟用。

Discord：

- 六個 Slash 指令：`/ai_start`、`/ai_status`、`/stop`、`/player_set`、`/reload`、`/quick_send`。
- `/ai_start` 啟用頻道後可直接輸入對話；Bot 私訊也可直接輸入，不需要文字指令前綴。
- Bot 加入伺服器時會在可發言的文字頻道送出使用說明；使用者安裝應用程式後會收到私人聊天提示。
- 多玩家座位：`user1`、`user2` 等。
- `/quick_send` 提供保持時間、推進場景、時間流逝與繼續等快捷模板。
- `/reload num comment` 可改寫倒數第 `num` 次使用者輸入並重新生成後續。
- Discord 訊息編輯後可從該處重算分支。
- 使用者可用反應標記喜歡/不喜歡，回饋會附到下一輪。

## 預覽

![主頁截圖](src/public/assets/img/image1.png)

![Prompt 編輯截圖](src/public/assets/img/image2.png)

![NovelAI 跑圖頁截圖](src/public/assets/img/image3.png)

![NovelAI 圖片檢視截圖](src/public/assets/img/image4.png)

## 主要檔案

```text
src/index.js                 HTTP API、狀態、Prompt、Discord、NovelAI proxy
src/public/index.html        主頁
src/public/app.js            主頁互動
src/public/novelai.html      NovelAI 頁
src/public/novelai.js        NovelAI 互動
src/public/styles.css        共用樣式
defaults/app-defaults.json     發布用主功能與 Prompt 預設
defaults/novelai-defaults.json 發布用 NovelAI 預設
data/app-defaults.json         使用者本機主功能與 Prompt 預設
data/novelai-defaults.json     使用者本機 NovelAI 預設
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
