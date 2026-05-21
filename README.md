# 時分居酒屋

時分居酒屋是一個本地網頁管理端加 Discord Bot 的對話工具。它以角色卡、世界書、可編輯 Prompt、OpenAI-compatible 對話 API、大模型內容壓縮、對話存檔與 Discord 指令為核心，適合長篇角色互動、劇情推進、角色卡製作與多人頻道協作。

專案目前是純 Node.js HTTP server，沒有前端打包流程；啟動後會同時提供本地網頁和選配的 Discord Bot。

## 功能總覽

- 本地網頁管理端：角色卡管理、對話、存檔、Prompt 編輯、模型內容編輯、環境設定、AI 呼叫紀錄。
- 對話 API：支援 OpenAI-compatible Chat Completions API，可設定 DeepSeek、OpenAI、Gemini 或自訂 Base URL。
- 角色卡系統：單角色、多角色、無角色與自訂 Prompt 模式。
- 每模式獨立上下文輪數：正文對話上下文輪數放在「編輯 Prompt」內，每個 Prompt 模式可各自設定。
- 世界書 Lorebooks：依最近對話或本輪輸入命中關鍵字後自動插入 Prompt。
- 大模型內容：按輪數、指定回合或關鍵字觸發，將長篇對話壓縮成可持續承接的模型內容。
- 多大模型配置：每個 Prompt 模式可建立多個大模型 profile、觸發組合、處理動作與玩家追加詞。
- 對話存檔：保存、載入、刪除、分支備份，並把長對話分離儲存在 `data/saved-sessions/`。
- Discord Bot：Slash 指令、文字前綴、頻道直接對話、DM 對話、`.txt` 附件輸入、玩家座位、重生成最新回覆、指定訊息分支重寫、自動推演多輪。
- AI 呼叫紀錄：保留最近對話 API request/response、模型、token usage、錯誤與 reasoning debug 內容。
- 網頁環境設定：可在 UI 直接編輯 `.env`，並可從網頁觸發伺服器重啟。

## 技術需求

- Node.js `>=18.0.0`
- npm
- 對話 API Key（DeepSeek、OpenAI、Gemini 或相容服務）
- 選配：Discord Bot Token

## 快速開始

1. 安裝依賴：

```bash
npm install
```

2. 建立環境設定：

```bash
cp .env.example .env
```

3. 編輯 `.env`，至少填入對話 API provider、key 與模型：

```env
CHAT_API_PROVIDER=deepseek
CHAT_API_KEY=你的 API Key
CHAT_API_MODEL=deepseek-reasoner
```

4. 啟動：

```bash
npm start
```

5. 開啟本地網頁：

```text
http://localhost:3234
```

若沒有設定 `DISCORD_BOT_TOKEN`，系統仍會正常啟動本地網頁管理端，只是不登入 Discord。

## 專案結構

```text
.
├── package.json
├── .env.example
├── src/
│   ├── index.js                 # HTTP server、API、對話 API 呼叫、Discord Bot
│   └── public/
│       ├── index.html           # 本地網頁 UI
│       ├── app.js               # 前端互動邏輯
│       ├── effects.js           # 背景與視覺效果
│       ├── styles.css           # UI 樣式
│       └── assets/              # 圖片、字體、游標
├── prompts/
│   ├── CharacterCardCreationAssistant.txt
│   ├── Context_compression.txt
│   └── modular/
│       ├── single.json
│       ├── multi.json
│       └── no_role.json
├── defaults/
│   └── app-defaults.json        # GitHub 發佈用預設使用者設定與角色卡
└── data/
    ├── app-state.json           # 執行狀態、目前對話、設定、存檔 metadata
    ├── cardstate.json           # 使用者設定與角色卡分離備份
    └── saved-sessions/          # 存檔對話與 AI log 分離檔
```

`data/`、`.env`、`node_modules/` 已在 `.gitignore` 中，不會被提交。

網頁中的「儲存預設」會把目前使用者設定與角色卡寫入 `defaults/app-defaults.json`，並把 Prompt 模式寫入 `prompts/modular/`。這些檔案可以提交到 GitHub，下載者第一次啟動時會自動套用；目前對話、AI logs 與存檔仍保留在被忽略的 `data/` 內，不會被保存成預設。

## 環境變數

| 變數 | 必填 | 預設 | 說明 |
| --- | --- | --- | --- |
| `PORT` | 否 | `3234` | 本地網頁與 API server port。改完建議重啟。 |
| `CHAT_API_PROVIDER` | 建議 | `deepseek` | 對話 API 供應商。可用 `deepseek`、`openai`、`gemini`、`custom`。 |
| `CHAT_API_KEY` | 建議 | 空 | 主聊天、補寫、角色卡助手與預設大模型處理使用。未設定時會回傳本地佔位訊息。 |
| `CHAT_API_BASE_URL` | 否 | 依 provider | 留空時依供應商使用預設 endpoint；自訂服務請填完整 OpenAI-compatible base URL。 |
| `CHAT_API_MODEL` | 建議 | `deepseek-reasoner` | API輸出模型，例如 `deepseek-reasoner`、`gpt-4.1`、`gemini-2.5-flash`。 |
| `CHAT_API_REQUEST_TIMEOUT_MS` | 否 | `600000` | API 請求逾時，毫秒。 |
| `CHAT_API_MAX_TOKENS` | 否 | `32000` | 主聊天、壓縮、補寫與角色卡助手的輸出 token 上限；仍會受模型本身上限限制。 |
| `CHAT_API_MAX_TOKENS_PARAM` | 否 | `max_tokens` | 輸出 token 參數名。多數相容 API 用 `max_tokens`；部分模型可改 `max_completion_tokens`。 |
| `CHAT_API_TEMPERATURE` | 否 | `0.5` | 一般對話 temperature；角色卡建立助手固定使用較高 temperature。 |
| `CHAT_API_KEY2` / `CHAT_API_KEY3` / ... | 否 | 空 | 大模型內容壓縮用 key。依目前啟用的大模型順序使用；例如 4 個大模型但只有 key2、key3、key4 時，第 4 個大模型沿用 key4。全空時使用 `CHAT_API_KEY`。 |
| `CHAT_API_MODEL_TOKEN_CAP` | 否 | 依模型 | 手動覆蓋模型 token cap；未設定時 `deepseek-chat` 為 `8192`，其他模型為 `64000`。 |
| `AI_MIN_REPLY_CHARS` | 否 | `600` | 回覆可見字數低於此值時，會嘗試補寫。 |
| `DISCORD_BOT_TOKEN` | 否 | 空 | Discord Bot token。空白時不登入 Discord。 |
| `DISCORD_CLIENT_ID` | 否 | 從 token 推斷 | 產生 Discord Bot 邀請連結用。 |
| `DISCORD_GUILD_ID` | 否 | 空 | 指定 guild 註冊 Slash 指令；空白時只註冊全域指令。 |
| `COMMAND_PREFIX` | 否 | `!ai` | Discord 文字指令前綴。 |
| `DISCORD_TEXT_ATTACHMENT_MAX_BYTES` | 否 | `1048576` | Discord `.txt` / `text/plain` 附件輸入大小上限。 |

Provider 預設 Base URL：

| Provider | 預設 Base URL |
| --- | --- |
| `deepseek` | `https://api.deepseek.com` |
| `openai` | `https://api.openai.com/v1` |
| `gemini` | `https://generativelanguage.googleapis.com/v1beta/openai` |
| `custom` | 未內建；請設定 `CHAT_API_BASE_URL`。 |

舊版環境變數仍會讀取作為相容別名：`DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`、`DEEPSEEK_MAX_TOKENS`、`DEEPSEEK_REQUEST_TIMEOUT_MS`、`DEEPSEEK_API_KEY2`、`DEEPSEEK_KEY2`、`deepseek_key2`。新設定請優先使用 `CHAT_API_*`。

網頁的「環境設定」會管理常用欄位，未列出的自訂 key 可放在「其他環境變數」。保存後會寫入 `.env`。對話 API key、Base URL、API輸出模型等多數情況會立即同步；Discord Token、Port、Slash 指令註冊等啟動期設定建議重啟。

## 完整功能表

### 主畫面

| 區域 | 功能 | 說明 |
| --- | --- | --- |
| 手機資訊抽屜 | 標題、狀態、手機分頁 | 小螢幕可在「對話」與「功能」分頁間切換。 |
| 使用者設定 | 稱呼 | 作為 `{{user}}` 的替換內容。 |
| 使用者設定 | 自訂補充 | 會附加到每次使用者發言最後，支援 `{{user}}` 與 `{{chur}}`。 |
| Prompt 設定 | 編輯 Prompt | 開啟 Prompt 模式、大模型、模塊、觸發條件、每模式上下文輪數與預覽編輯器。 |
| Prompt 設定 | 模型內容狀態 | 顯示目前模式的上下文輪數與標準模型內容壓縮進度。 |
| 角色卡 | 選擇角色卡 | 開啟卡片式選擇器，可開始、編輯、刪除角色卡。 |
| 角色卡 | 建立角色卡 | 開啟角色卡表單。 |
| 對話存檔 | 選擇對話存檔 | 開啟存檔選擇器，可載入或刪除存檔。 |
| 對話存檔 | 保存目前整體對話 | 將目前角色卡、對話、壓縮內容、AI logs 與狀態保存成存檔。 |
| 功能按鈕 | 編輯 AI 的輸出對話 | 選擇一則 assistant 訊息並覆寫內容。 |
| 功能按鈕 | 查看/編輯模型內容 | 查看或手動修改標準與自訂大模型 profile 的目前內容。 |
| 功能按鈕 | 環境設定 | 編輯 `.env`，可測試對話 API 連接，也可觸發伺服器重啟。 |
| 對話區 | 訊息列表 | 顯示使用者與 AI 對話、開場、壓縮通知等。 |
| 對話區 | 輸入框 | 本地網頁送出一輪對話。 |
| 對話區 | Discord Bot 連結 | 依 Bot Client ID 或 Token 產生邀請連結。 |
| AI 呼叫紀錄 | Request/response 檢視 | 顯示最近對話 API 呼叫、用途、模型、token usage、錯誤與回應。 |

### 角色卡功能

| 功能 | 說明 |
| --- | --- |
| 角色模式 | 每張卡可選單角色、多角色、無角色或自訂 Prompt 模式。 |
| 名字 | 角色卡名稱；也會在選擇器與存檔摘要中顯示。 |
| 封面上傳 | 支援圖片上傳，前端以 data URL 存入角色卡。 |
| 封面取景 | 可拖曳裁切框並預覽縮圖。 |
| 移除封面 | 清除角色卡封面。 |
| 自定義內容 | 可建立任意「名字 + 內容」欄位，例如性格、場景、系統指令、詳細描述、人物關係；支援 `{{user}}` 與 `{{chur}}`。 |
| 舊欄位相容 | 若舊資料有 `personality`、`scene`、`systemInstruction` 等欄位，會轉成自定義內容。 |
| 開場對話 | 開始角色卡時可作為第一則 assistant 開場訊息。支援 `{{user}}` 與 `{{chur}}`。 |
| 世界書 Lorebooks | 每條世界書包含標題、關鍵字、內容與啟用狀態。 |
| 世界書觸發 | 以前一則 assistant 與最新 user 內容比對關鍵字，命中後插入正文 Prompt。 |
| 世界書去重 | 已在尚未壓縮區間插入過的世界書，不會重複附加。 |
| 文字損壞檢查 | 保存時會檢查 `�`，避免已損壞編碼寫入資料檔。 |

### Prompt 編輯功能

| 功能 | 說明 |
| --- | --- |
| 內建模式 | `single` 單角色、`multi` 多角色、`no_role` 無角色。 |
| 自訂模式 | 可新增模式，會存成 `prompts/modular/<mode>.json`。 |
| 刪除模式 | 內建模式不可刪除；若仍有角色卡使用該模式，也不可刪除。 |
| 模式名字 | 控制 UI 顯示名稱。 |
| 正文對話上下文輪數 | 位於模式名字下方；每個模式獨立設定，控制最近多少輪對話直接送入正文模型，也作為標準壓縮觸發依據。 |
| 正文主要規則 | 生成正文時的主要 system rules。 |
| 正文輸出規則 | 生成正文時的輸出格式、承接與風格規則。 |
| 模型主要規則 | 大模型內容壓縮時的總規則。 |
| 壓縮模塊 | 每個模塊定義 `id`、名稱、新增規則與刪除規則。 |
| JSON 壓縮格式 | 有模塊時，大模型輸出 `model.<id>` 與 `delete.<id>`；後端會追加新項並刪除舊項。 |
| 純文字壓縮格式 | 若某自訂 profile 沒有模塊，可輸出完整純文字模型內容。 |
| Prompt 預覽 | 可預覽正文 system prompt 與壓縮 prompt。 |
| `{{user}}`/`{{chur}}` 替換 | 預覽與實際呼叫會使用目前稱呼與角色卡名字替換。 |

### 大模型內容與壓縮功能

| 功能 | 說明 |
| --- | --- |
| 標準壓縮模型 | 每個模式一定有 `standard` profile，預設依該模式的上下文輪數觸發。 |
| 自訂大模型 | 可建立多個 profile，各自有名稱、啟用狀態、壓縮規則、模塊與觸發動作。 |
| 觸發組合 | 每個 profile 可有多個觸發組合。 |
| 輪數觸發 | 未壓縮完成的對話輪數達到目前 Prompt 模式的「正文對話上下文輪數」時觸發。 |
| 指定回合觸發 | 可指定第 N 回合觸發；`0` 代表開局第一次觸發。 |
| 關鍵字觸發 | 可從 user、assistant 或 both 搜尋關鍵字。 |
| 關鍵字表達式 | 支援 `+` 表示多組近距離同時命中，`/` 表示同組任一項，`{{user1}}`、`{{user2}}`、`{{userx}}` 表示 Discord 玩家座位條件。 |
| `call_api` 動作 | 觸發後呼叫對話 API，把上下文整理進該 profile 的模型內容。 |
| `copy_user_input` 動作 | 不呼叫 API，直接把最新 user 輸入存為該 profile 模型內容。 |
| 不 call 正文 | 觸發組合可選擇只處理大模型，不跑正文模型，回覆完成訊息。 |
| 壓縮合併 | JSON 模塊會依 `delete` 移除舊項，再把新 `model` 項追加到既有內容，並做簡單去重。 |
| 手動編輯 | 可在「查看/編輯模型內容」直接改目前 profile summary。 |
| 壓縮通知 | 若本輪處理後模型內容更新，Discord/網頁顯示時會加上模型內容更新提示。 |
| 玩家追加詞 | 自訂 profile 首次啟用後，可依 Discord 玩家座位把追加文字附到該玩家後續輸入。 |

### 對話功能

| 功能 | 說明 |
| --- | --- |
| 開始角色卡 | 清空目前對話進度、重置壓縮內容、標記待播開場。 |
| CharacterCardCreationAssistant | 角色卡建立助手模式，不使用角色卡正文流程，直接依專用 prompt 對話。 |
| 本地網頁送出 | 透過 `/api/chat/send` 送出一輪 user 內容。 |
| 繼續指令 | 輸入括號包住的「繼續 / continue / 續寫」等會轉成延續上一段 AI 的場外指令。 |
| 最少字數補寫 | AI 回覆低於 `AI_MIN_REPLY_CHARS` 時，最多補寫 2 次。 |
| 長度截斷重跑 | 對話 API 回傳 `finish_reason:length` 時，主聊天、補寫與角色卡助手會嘗試重跑。 |
| 開頭重複清理 | 若 AI 開頭直接重述使用者輸入，會嘗試移除重複片段。 |
| 對話上限 | Runtime conversation 最多保留最近 500 則訊息。 |
| AI log 上限 | AI 呼叫紀錄最多保留最近 200 筆。 |

### 對話存檔功能

| 功能 | 說明 |
| --- | --- |
| 保存目前整體對話 | 保存 user profile、角色卡、active target、對話設定、壓縮內容、Discord 玩家狀態、conversation、AI logs。 |
| 分離儲存 | 存檔 metadata 在 `data/app-state.json`；conversation 與 AI logs 寫入 `data/saved-sessions/<id>.json`。 |
| 載入存檔 | 將存檔 snapshot 套回目前 runtime。 |
| 刪除存檔 | 同時刪除 metadata 與分離檔。 |
| 分支備份 | `/replay` 或 Discord 編輯訊息重算前，會自動建立備份存檔。 |
| 存檔摘要 | 顯示 ID、名稱、角色卡/助手模式、狀態、建立/更新時間與訊息數。 |

### Discord Bot 功能

| 功能 | 說明 |
| --- | --- |
| Slash 指令 | 啟動後自動註冊 `/ai`、`/ai_start`、`/ai_status`、`/player_set`、`/reload`、`/replay`、`/run_time`、`/ai_help`、`/session_save`、`/session_list`、`/session_load`。 |
| 全域指令 | 預設註冊到全域應用程式。 |
| Guild 指令 | 設定 `DISCORD_GUILD_ID` 時會額外嘗試註冊到指定伺服器。 |
| Bot 邀請連結 | 網頁可依 `DISCORD_CLIENT_ID` 或 token 推斷出的 client id 產生邀請 URL。 |
| `/ai_start` | 在目前頻道開始或重開對話，並把該頻道設為直接對話頻道。 |
| 頻道直接對話 | `/ai_start` 後，該伺服器頻道可直接輸入對話，不必加 `!ai`。 |
| 文字前綴 | 非啟用頻道可用 `!ai 內容` 或 `!ai 指令`。前綴可由 `COMMAND_PREFIX` 修改。 |
| DM 行為 | DM 可直接聊天；若要執行文字 meta 指令，請加前綴。 |
| `.txt` 附件 | `/ai file:` 或訊息附件可讀取 `.txt` / `text/plain`，上限由 `DISCORD_TEXT_ATTACHMENT_MAX_BYTES` 控制。 |
| 長回覆分段 | Discord 回覆會按約 1800 字分段送出。 |
| Typing indicator | 長時間生成時會定期送 typing 狀態。 |
| Message edit 重算 | 使用者編輯已送出的 Discord 對話訊息時，系統會從該訊息建立備份並重新生成後續。 |
| 玩家座位 | 伺服器頻道可用 `/player_set` 綁定 user1、user2 等座位，供 prompt 與觸發條件判斷。 |

## Discord 指令

### Slash 指令

| 指令 | 參數 | 說明 |
| --- | --- | --- |
| `/ai` | `content` 選填、`file` 選填 | 對 AI 輸入文字或上傳 `.txt` 作為本輪輸入。 |
| `/ai_start` | 無 | 開始目前網頁選定的角色卡或助手模式，並把此頻道設為直接對話頻道。 |
| `/ai_status` | 無 | 查看連線狀態、對話狀態、模型設定、目前模式、玩家分配與存檔數。 |
| `/player_set` | `number` 必填 | 把自己設定為指定玩家座位，例如 `2` 會成為 `user2`。 |
| `/reload` | `feedback` 選填 | 移除最新 AI 回覆，依同一 user 輸入重新生成，可附上改進要求。 |
| `/replay` | `message_number`、`content` 必填 | 從指定訊息編號建立分支，用新的 user 內容重寫後續。 |
| `/run_time` | `number`、`message` 必填 | 依要求自動推演多輪；單次最多 20 輪；角色卡助手模式不支援。 |
| `/ai_help` | 無 | 顯示使用指南與 Bot 邀請連結。 |
| `/session_save` | `name` 選填 | 保存目前整體對話。 |
| `/session_list` | 無 | 列出所有對話存檔。 |
| `/session_load` | `id` 必填 | 載入指定存檔。 |

### 文字指令

伺服器頻道使用：

```text
!ai 指令
```

DM 若要執行 meta 指令也請加前綴；沒有前綴時會當作聊天內容。已由 `/ai_start` 啟用的伺服器頻道可直接輸入對話。

| 文字指令 | 說明 |
| --- | --- |
| `!ai help` / `!ai ai_help` / `!ai 幫助` | 顯示指南。 |
| `!ai status` / `!ai ai_status` / `!ai 狀態` | 顯示狀態。 |
| `!ai start` / `!ai ai_start` / `!ai 開始` | 在目前頻道開始對話。 |
| `!ai player_set 2` | 把自己設定為 `user2`。 |
| `!ai reload <feedback>` | 依 feedback 重新生成最新回覆。 |
| `!ai replay <message_number> <content>` | 從指定訊息編號建立分支。 |
| `!ai run_time <number> <message>` | 自動推演多輪。 |
| `!ai session_save <name>` | 保存目前對話。 |
| `!ai session_list` | 列出存檔。 |
| `!ai session_load <id>` | 載入存檔。 |

## HTTP API

本地網頁使用以下 API。所有 request/response 皆為 JSON，靜態檔由同一個 server 提供。

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/state` | 取得完整 UI state、prompt configs、saved sessions meta、Discord 狀態。 |
| `GET` | `/api/env` | 讀取 `.env` 內容。 |
| `PUT` | `/api/env` | 覆寫 `.env` 內容並同步 process env。 |
| `POST` | `/api/chat-api/test` | 使用目前表單內容測試對話 API 連接，不會先寫入 `.env`。 |
| `POST` | `/api/restart` | 排程重啟目前 Node server。 |
| `PUT` | `/api/conversation-settings` | 相容舊版 UI 的對話設定 API；新版 UI 以 `.env` 的 `CHAT_API_MODEL` 與各 Prompt 模式的 `dialogueContextRounds` 為主。 |
| `GET` | `/api/context-compression` | 取得目前模型內容與啟用的大模型 profiles。 |
| `PUT` | `/api/context-compression` | 手動保存指定 profile 的模型內容。 |
| `GET` | `/api/character-card-creation-assistant-prompt` | 讀取角色卡建立助手 prompt。 |
| `PUT` | `/api/character-card-creation-assistant-prompt` | 保存角色卡建立助手 prompt。 |
| `POST` | `/api/modular-prompts/:mode/preview` | 預覽指定模式的正文 system prompt 與壓縮 prompt。 |
| `PUT` | `/api/modular-prompts/:mode` | 保存指定 Prompt 模式。 |
| `DELETE` | `/api/modular-prompts/:mode` | 刪除自訂 Prompt 模式。 |
| `GET` | `/api/sessions` | 列出對話存檔摘要。 |
| `POST` | `/api/sessions/save` | 保存目前整體對話。 |
| `POST` | `/api/sessions/:id/load` | 載入指定存檔。 |
| `PUT` | `/api/sessions/:id` | 重新命名存檔。 |
| `POST` | `/api/sessions/:id/archive` | 將存檔標為 archived。 |
| `POST` | `/api/sessions/:id/resume` | 將存檔恢復為 active。 |
| `DELETE` | `/api/sessions/:id` | 刪除存檔與分離資料檔。 |
| `PUT` | `/api/user-profile` | 更新稱呼與自訂補充。 |
| `GET` | `/api/role-cards` | 取得角色卡列表與目前 active role card id。 |
| `POST` | `/api/assistant-modes/character-card-creation/start` | 啟用角色卡建立助手模式。 |
| `POST` | `/api/role-cards` | 建立角色卡。 |
| `PUT` | `/api/role-cards/:id` | 更新角色卡。 |
| `DELETE` | `/api/role-cards/:id` | 刪除角色卡。 |
| `POST` | `/api/role-cards/:id/start` | 開始指定角色卡對話。 |
| `PUT` | `/api/messages/:id` | 編輯 assistant 訊息內容。 |
| `POST` | `/api/chat/send` | 本地網頁送出一輪對話。 |
| `POST` | `/api/chat/send-stream` | 目前停用，會回傳 Discord 使用指南。 |

## 資料模型重點

### `data/app-state.json`

主要保存 runtime state：

- `userProfile`：稱呼與自訂補充。
- `roleCards`：角色卡資料；啟動時會被 `cardstate.json` 覆蓋同步。
- `roleCardRuntimeState`：角色卡執行期增量資料與世界書 runtime。
- `activeRoleCardId` / `activeAssistantMode`：目前對話目標。
- `conversationSettings`：模型與上下文輪數。
- `contextCompression`：標準與自訂大模型內容。
- `aiSessionStarted`、`pendingOpeningBroadcast`、`lastDiscordChannelId`：對話與 Discord 狀態。
- `discordPlayers`：Discord user id 到玩家座位的映射。
- `turnState`：目前 user turn number。
- `conversation`：目前 runtime 對話，最多保留 500 則。
- `aiLogs`：最近 AI 呼叫紀錄，最多保留 200 筆。
- `savedSessions`：存檔 metadata。

### `data/cardstate.json`

分離保存：

- `userProfile`
- `roleCards`
- `updatedAt`

### `defaults/app-defaults.json`

GitHub 發佈用預設資料，只包含：

- `userProfile`
- `roleCards`
- `updatedAt`

如果本機沒有自己的 `data/app-state.json`，啟動時會用這個檔案建立初始使用者設定與角色卡。它不包含 conversation、AI logs 或 saved sessions。

這讓角色卡資料在 runtime state 損壞或重整時有獨立備份。

### `data/saved-sessions/<session_id>.json`

分離保存存檔中的大段資料：

- `conversation`
- `aiLogs`
- `updatedAt`

## Prompt 檔案

| 檔案 | 用途 |
| --- | --- |
| `prompts/CharacterCardCreationAssistant.txt` | 角色卡建立助手 system prompt。 |
| `prompts/Context_compression.txt` | 預設上下文壓縮 prompt fallback。 |
| `prompts/modular/single.json` | 單角色模式的正文與大模型規則。 |
| `prompts/modular/multi.json` | 多角色模式的正文與大模型規則。 |
| `prompts/modular/no_role.json` | 無角色模式的正文與大模型規則。 |
| `prompts/modular/<custom>.json` | UI 新增的自訂模式。 |

建議優先使用網頁的「編輯 Prompt」操作，因為它會做欄位正規化並產生預覽。

## Discord 設定流程

1. 到 Discord Developer Portal 建立 Application 與 Bot。
2. 複製 Bot Token 到 `.env` 的 `DISCORD_BOT_TOKEN`。
3. 建議填入 `DISCORD_CLIENT_ID`，讓網頁能穩定產生 Bot 邀請連結。
4. 若要使用文字指令或讀取一般訊息，請在 Discord Bot 設定中啟用 Message Content Intent。
5. 啟動 `npm start`。
6. 在網頁按「Discord Bot 連結」邀請 Bot。
7. 到 Discord 使用 `/ai_start` 開始頻道對話。

Slash 指令全域註冊可能需要等待 Discord 同步；若要立即在特定伺服器測試，可設定 `DISCORD_GUILD_ID`。

## 常見操作流程

### 建立角色卡並開始網頁對話

1. 開啟 `http://localhost:3234`。
2. 在「使用者設定」填入稱呼與自訂補充。
3. 按「建立角色卡」。
4. 選擇角色模式，填寫名字、自定義內容、開場對話與世界書。
5. 保存角色卡。
6. 在「選擇角色卡」中按開始。
7. 在對話輸入框送出內容。

### 編輯大模型與 Prompt

1. 按「編輯 Prompt」。
2. 選擇角色模式。
3. 編輯正文主要規則、正文輸出規則、模型主要規則。
4. 視需要新增模塊、大模型 profile、觸發組合與追加詞。
5. 按「更新預覽」檢查最終 Prompt。
6. 按「保存 Prompt」。

### 保存與分支

1. 對話進行中可按「保存目前整體對話」。
2. Discord 可用 `/session_save name:名稱`。
3. 想從中途改寫時，用 `/replay message_number:編號 content:新內容`。
4. `/replay` 會先建立分支備份，再截斷並重寫後續。

## 注意事項

- `.env` 含 API key 與 Bot token，不要提交或分享。
- `data/` 可能包含完整對話、角色卡、模型內容與 AI logs，也不要公開提交。
- 本專案可自訂 Prompt 與內容規則；請自行確保使用內容符合所在地法律、Discord 平台規範與模型供應商使用條款。
- `data/app-state.json` 若手動編輯失敗，server 會 fallback 建立預設 state；角色卡仍可能從 `cardstate.json` 恢復。
- `deepseek-chat` 的 token cap 在程式內限制為 `8192`，其他模型 cap 為 `64000`。
- 如果回覆太短，系統會嘗試補寫；若不想補寫，可把 `AI_MIN_REPLY_CHARS` 設小。
- `/run_time` 單次最多 20 輪，且 CharacterCardCreationAssistant 模式不支援。
- 網頁的 `/api/chat/send-stream` 目前停用；正常本地對話使用 `/api/chat/send`。

## 開發備註

- `npm start` 等同 `node src/index.js`。
- 專案沒有 build step。
- 專案沒有內建測試 script。
- 靜態檔從 `src/public/` 直接提供。
- `src/index.js` 同時負責 HTTP API、狀態落盤、Prompt 組裝、DeepSeek 呼叫與 Discord Bot。
- `src/public/app.js` 負責所有 UI 狀態渲染、表單送出、dialog、角色卡裁切與 API 呼叫。
