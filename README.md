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

## 最少設定

`.env` 至少填對話 API：

```env
CHAT_API_PROVIDER=deepseek
CHAT_API_KEY=你的_API_Key
CHAT_API_MODEL=deepseek-reasoner
```

NovelAI 圖片功能另外填：

```env
NOVELAI_API_TOKEN=你的_NovelAI_Persistent_API_Token
```

Discord 不填 `DISCORD_BOT_TOKEN` 也能正常使用本地網頁。

## 第一次啟動預設

第一次啟動時，如果本機沒有 `data/app-state.json`，後端會用 `defaults/app-defaults.json` 建立主功能預設。

NovelAI 頁第一次打開時，如果瀏覽器沒有本頁 draft，會讀取 `defaults/novelai-defaults.json` 作為初始跑圖設定。

`start-mac.command` 與 `start-win.bat` 會自動檢查 Node/npm、安裝缺少的 `node_modules`、依目前 `PORT` 開瀏覽器，然後執行 `npm start`。預設套用由 server 與 NovelAI 前端完成，啟動器不需要額外呼叫套用 API。

## 功能

主頁：

- 角色卡：建立、裁切封面、世界書、開場對話、匯入/匯出。
- Prompt 編輯：角色模式、正文規則、大模型、模塊、觸發條件、追加詞。
- 模型內容：查看、保存、匯出標準壓縮模型與自訂大模型內容。
- 對話：串流生成、停止、重跑、分支重寫、存檔、AI 呼叫紀錄。
- 時間統計：天數、日期、早中晚、關鍵字與自動切換。
- 預設：保存/套用可提交的主功能預設。

NovelAI：

- 模型、尺寸、Steps、Guidance、Sampler、Seed、Variety+。
- Fixed Prompt / Random Prompt 片段庫。
- Character Prompts、Vibe Transfer、Image2Image、Precise Reference。
- 圖片生成、Loop Generate、本地歷史、收藏、下載 metadata。
- 圖片檢視器：點擊主圖放大，拖曳移動，滾輪縮放。
- NovelAI 預設保存/啟用。

Discord：

- Slash 指令與文字指令。
- 多玩家座位：`user1`、`user2` 等。
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
prompts/modular/*.json       Prompt 模式
defaults/app-defaults.json   主功能預設
defaults/novelai-defaults.json NovelAI 預設
data/                        本機資料，不要提交
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
