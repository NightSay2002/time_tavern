# 時分居酒屋

時分居酒屋是一個本地網頁管理端、Discord Bot、角色卡 Prompt 編輯器與 NovelAI 跑圖頁整合在一起的長篇對話工具。核心用途是讓角色卡對話可以長期保存、分支重寫、壓縮上下文、多人協作，並在需要時從對話或獨立頁面生成 NovelAI 圖片。

目前專案是純 Node.js HTTP server，沒有前端打包流程。啟動後會提供：

- 本地網頁對話面板：`http://localhost:3234`
- NovelAI 跑圖頁：`http://localhost:3234/novelai.html`
- 選配 Discord Bot：填入 Token 後同一個 process 會登入 Discord

## 快速開始

需求：

- Node.js `>=18.0.0`
- npm
- 至少一組 OpenAI-compatible 對話 API key
- 選配：Discord Bot Token
- 選配：NovelAI Persistent API Token

安裝與啟動：

```bash
npm install
cp .env.example .env
npm start
```

然後打開：

```text
http://localhost:3234
```

macOS 可直接打開 `start-mac.command`；Windows 可直接執行 `start-win.bat`。兩個啟動器都會檢查 `node_modules`，缺少依賴時自動跑 `npm install`，並打開目前 `PORT` 對應的本地網頁。

`.env` 至少建議填：

```env
CHAT_API_PROVIDER=deepseek
CHAT_API_KEY=你的 API Key
CHAT_API_MODEL=deepseek-reasoner
```

沒有 `DISCORD_BOT_TOKEN` 時，Discord 不會登入，但本地網頁仍可使用。沒有 `NOVELAI_API_TOKEN` 時，只是 NovelAI 跑圖頁不能生成與讀取餘額。

## 專案結構

```text
.
├── package.json
├── start-mac.command
├── start-win.bat
├── .env.example
├── src/
│   ├── index.js                 # HTTP API、狀態落盤、Prompt 組裝、Discord Bot、NovelAI proxy
│   └── public/
│       ├── index.html           # 主網頁 UI
│       ├── app.js               # 主網頁互動邏輯
│       ├── novelai.html         # NovelAI 跑圖頁
│       ├── novelai.js           # NovelAI 跑圖頁互動邏輯
│       ├── styles.css           # 共用 UI 樣式
│       ├── effects.js           # 視覺效果
│       └── assets/              # 圖片、字體、音訊、游標
├── prompts/
│   ├── CharacterCardCreationAssistant.txt
│   ├── Context_compression.txt
│   └── modular/
│       ├── single.json
│       ├── multi.json
│       └── no_role.json
├── defaults/
│   ├── app-defaults.json        # 可提交到 GitHub 的主程式預設
│   └── novelai-defaults.json    # 可提交到 GitHub 的 NovelAI 預設
└── data/
    ├── app-state.json           # 本機 runtime state
    ├── cardstate.json           # 使用者設定與角色卡分離備份
    ├── saved-sessions/          # 對話存檔大段內容
    └── novelai-album/           # NovelAI 收藏相簿
```

`.env`、`data/`、`node_modules/` 不應提交。`defaults/` 與 `prompts/modular/` 是用來發佈預設設定的，可以提交。

## 環境變數

常用設定可在主網頁的「環境設定」編輯，保存後會寫回 `.env`。對話 API key、Base URL、模型等多數設定會即時同步；Port、Discord Token、Slash 指令註冊等啟動期設定建議重啟。

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `PORT` | `3234` | 本地 HTTP server port。 |
| `CHAT_API_PROVIDER` | `deepseek` | `deepseek`、`openai`、`gemini` 或 `custom`。 |
| `CHAT_API_KEY` | 空 | 主聊天、補寫、角色卡助手、大模型處理使用。 |
| `CHAT_API_BASE_URL` | 依 provider | 自訂 OpenAI-compatible API 時填完整 base URL。 |
| `CHAT_API_MODEL` | `deepseek-reasoner` | 主對話模型。 |
| `CHAT_API_REQUEST_TIMEOUT_MS` | `600000` | 對話 API 逾時，毫秒。 |
| `CHAT_API_MAX_TOKENS` | `32000` | 輸出 token 上限；仍受模型上限限制。 |
| `CHAT_API_MAX_TOKENS_PARAM` | `max_tokens` | 可改成 `max_completion_tokens`。 |
| `CHAT_API_TEMPERATURE` | `0.5` | 一般對話 temperature；角色卡助手另用較高值。 |
| `CHAT_API_KEY2` / `CHAT_API_KEY3` | 空 | 大模型內容處理可按順序使用不同 key；不足時沿用最後一把。 |
| `AI_MIN_REPLY_CHARS` | `600` | 回覆可見字數太短時會嘗試補寫。 |
| `DISCORD_BOT_TOKEN` | 空 | Discord Bot Token。空白時不登入 Discord。 |
| `DISCORD_CLIENT_ID` | 從 token 推斷 | 產生 Bot 邀請連結用。 |
| `DISCORD_GUILD_ID` | 空 | 指定 guild 立即註冊 Slash 指令；空白時註冊全域指令。 |
| `COMMAND_PREFIX` | `!ai` | Discord 文字指令前綴。 |
| `DISCORD_TEXT_ATTACHMENT_MAX_BYTES` | `1048576` | Discord `.txt` 附件輸入大小上限。 |
| `DISCORD_LOGIN_RETRY_INITIAL_MS` | `15000` | Discord 登入遇到暫時性網路錯誤時，第一次重試等待時間。 |
| `DISCORD_LOGIN_RETRY_MAX_MS` | `300000` | Discord 登入重試退避上限。 |
| `DISCORD_LOGIN_RETRY_MAX_ATTEMPTS` | `0` | Discord 登入最多重試次數；`0` 代表不限次數。 |
| `WEB_USER_NAME_TEMPLATE` | `{{user}}` | 網頁聊天面板的使用者名字模板。 |
| `WEB_AI_NAME_TEMPLATE` | `{{chur}}` | 網頁聊天面板的 AI 名字模板。 |
| `WEB_USER_AVATAR_IMAGE` | 空 | 使用者頭像；UI 可直接上傳。 |
| `WEB_AI_AVATAR_IMAGE` | 角色卡封面 | AI 頭像；UI 可直接上傳。 |
| `WEB_BACKGROUND_IMAGE` | 空 | 網頁背景圖片；UI 可直接上傳。 |
| `WEB_DAILY_WELCOME_AUDIO` | `/assets/audio/welcome-back.mp3` | 每天第一次開頁播放的語音。 |
| `NOVELAI_API_TOKEN` | 空 | NovelAI Persistent API Token。別名：`NOVELAI_ACCESS_TOKEN`、`NOVELAI_TOKEN`、`NAI_API_TOKEN`。 |
| `NOVELAI_IMAGE_API_BASE_URL` | `https://image.novelai.net` | NovelAI 圖片 API base URL。 |
| `NOVELAI_PRIMARY_API_BASE_URL` | `https://api.novelai.net` | NovelAI 主 API base URL，用於讀取 Anlas / subscription。 |
| `NOVELAI_REQUEST_TIMEOUT_MS` | `600000` | NovelAI 請求逾時，毫秒。 |

Provider 預設 base URL：

| Provider | Base URL |
| --- | --- |
| `deepseek` | `https://api.deepseek.com` |
| `openai` | `https://api.openai.com/v1` |
| `gemini` | `https://generativelanguage.googleapis.com/v1beta/openai` |
| `custom` | 必須自行設定 `CHAT_API_BASE_URL` |

相容舊變數：`DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`、`DEEPSEEK_REQUEST_TIMEOUT_MS`、`DEEPSEEK_API_KEY2` 等仍會被讀取，但新設定建議統一使用 `CHAT_API_*`。

## 主網頁功能

主頁是 Discord 風格的聊天面板加功能欄：

- 使用者設定：稱呼、自訂補充，支援 `{{user}}` 與 `{{chur}}`。
- 角色卡：建立、選擇、開始、編輯、刪除、匯入、匯出。
- Prompt 編輯：角色模式、模式名字、正文規則、大模型規則、模塊、觸發組合。
- 模型內容：查看與手動編輯標準壓縮模型或自訂大模型目前內容。
- 統計判斷：時間、天數、自動早中晚切換與 `{保持時間}`。
- 對話存檔：保存、載入、刪除、預覽對話內容。
- AI 呼叫紀錄：顯示最新的 100 輪呼叫摘要，包含模型、token、費用估算與錯誤。
- 環境設定：編輯 `.env`、測試 API、上傳頭像/背景、重啟 server。
- NovelAI 跑圖入口：打開獨立頁 `/novelai.html`。
- 簡繁轉換：切換 UI 顯示。
- 使用預設 / 儲存預設：套用或保存可提交到 GitHub 的非機密設定。

聊天訊息支援 Markdown；assistant 訊息允許經過清理的 HTML 顯示。危險標籤和事件屬性會被過濾。

## 角色卡

角色卡包含：

- 角色模式：單角色、多角色、無角色或自訂 Prompt 模式。
- 名字與封面：封面可上傳、裁切、移除。
- 自定義內容：可建立任意欄位，例如性格、場景、系統指令、詳細描述、人物關係。
- 開場對話：支援多個開場，像工作表分頁那樣切換；開始角色卡時會加入對話。
- 世界書：關鍵字命中後把內容插入正文 Prompt。
- SillyTavern 匯入：支援 JSON、PNG、JPG/JPEG 角色卡；世界書條目沒有 name 時會嘗試用 key 當名稱。
- 匯出：有封面時匯出為帶資料的 JPG；沒有封面時匯出 JSON。

`{{user}}` 會替換成使用者設定的稱呼，`{{chur}}` 會替換成角色卡名字。這套替換用在角色卡內容、使用者自訂補充與 Prompt 編輯中。

## Prompt 編輯

內建模式：

- `single`：單角色
- `multi`：多角色
- `no_role`：無角色

也可以新增自訂模式。自訂模式會保存到 `prompts/modular/<mode>.json`；匯入 Prompt 模式時會建立一個新的模式，不覆蓋現有模式。

每個模式包含：

- 模式名字
- 正文對話上下文輪數
- 正文主要規則
- 正文輸出規則
- 模型主要規則
- 模塊
- 大模型 profiles
- 觸發組合與觸發後續動作
- 玩家追加詞

「模塊」主要用於 JSON 壓縮格式。若某個大模型沒有模塊，代表它可以用純文字保存內容，不強制 JSON。

## 大模型與模型內容

每個 Prompt 模式都有一個不能關閉的「標準壓縮模型」。除此之外，可以建立多個自訂大模型，用來保存事件、玩家資料、跑圖 prompt、配角生成結果或其他旁路資料。

觸發條件：

- 達到正文上限輪數
- 每回合觸發
- 指定回合觸發
- 觸發關鍵字

指定回合觸發的概念是以目前未壓縮區間計算。假設正文上下文是 20 輪，指定 `0, 5, 10`，壓縮後下一段也會在相對的 `0, 5, 10` 生效，因此整體進度上會對應到 20、25、30 等位置。指定回合欄位空白代表沒有此條件。

關鍵字規則：

- 一行一個關鍵字：同一行條件命中即可觸發。
- 多行代表多個必要條件時，需全部命中。
- `玩家1+受了重傷`：兩組詞需在 10 字距離內。
- `玩家1+受了重傷/死亡`：第二組可命中受了重傷或死亡。
- `{{user1}}+受了重傷`：必須是 Discord `user1` 的輸入並命中關鍵字。

觸發後續動作：

- `call api`：呼叫對話 API 更新該模型內容。
- `直接複製貼上玩家的輸入內容`：不呼叫 API，直接把玩家輸入存入模型內容。
- `建立圖片，然後繼續觸發正文`：先跑 NovelAI 圖，再跑正文。
- `建立圖片（並行運作），同時繼續正文`：圖片背景生成，正文不等待。
- 可設定觸發後不 call 正文，完成後只輸出「模型名字完成處理」。

圖片動作是旁路輸出，不應把跑圖 Base Prompt 寫回一般模型內容，也不應污染後續正文上下文。

## 時間統計

「統計判斷編輯」控制對話中自動附加的時間資訊：

```text
當前天數 | 數值: 第x天
當前時間 | 數值: 第x天早上2026年1月1日
```

功能重點：

- 可整體啟用或停用；停用後 user 輸入不會附帶時間。
- 開始時預設第 1 天，日期可隨機或手動修正。
- 可設定配合詞、下一天詞、不改詞、早上詞、中午詞、晚上詞。
- user 輸入可直接改時間；正常回合內的 AI 輸出仍需要配合詞才改時間。
- 配合詞與天數詞、早中晚詞需在 5 字內。
- 不改詞在 5 字內會阻止改時間，例如「等到」「等一下」「的時候」。
- 支援 `3天後` / `三天後` 加天數，也支援 `第3天` 直接改成第 3 天。
- 自動切換早上、下午/中午、晚上可開關；晚上到早上會自動加 1 天。
- 自動切換前一輪會在正文最後提示可輸入 `{保持時間}`，該提示不會放進 API 呼叫紀錄。
- `{保持時間}` 與 `｛保持時間｝` 都會生效，延後目前設定的回合數。

## NovelAI 跑圖頁

入口在主網頁「功能按鈕」區，或直接打開：

```text
http://localhost:3234/novelai.html
```

頁面分成三欄：

- 左欄：模型與所有生成設定。
- 中欄：目前圖片完整預覽、Prompt 內容、還原設定、下載、收藏。
- 右欄：本地歷史縮圖；可點擊或用鍵盤上下鍵切換。

左欄功能：

- 模型選擇：V4.5 / V4 / Anime V3 / Furry V3 等選項。
- Base Prompt：主要 prompt，會標記重複詞。
- Fixed Prompt：常用固定片段，點名字插入 `||名字||`，生成時展開。
- Random Prompt：隨機片段，點名字插入 `||名字||`，生成時抽選並展開。
- Undesired Content：負面 prompt，同樣會標記重複詞。
- Character Prompts：可新增多個角色 prompt、啟用/停用、上下排序、刪除、用 5x5 方格選座標。
- Vibe Transfer：可拖入多張，每張有啟用、Reference Strength、Information Extracted。
- Image2Image：官方限制一張，提供 Strength 與 Noise。
- Precise Reference：可拖入多張，每張有啟用、Strength、Fidelity。
- Image Settings：Normal Portrait 832x1216、Normal Landscape 1216x832、Custom。
- AI Settings：Steps、Prompt Guidance、Variety+、Seed、Sampler、Prompt Guidance Rescale、Noise Schedule。
- Metadata：選圖片讀取 NovelAI metadata，也可保存/啟用 NovelAI 預設。
- Generate / Loop Generate：`生成數量` 為 `0` 代表一直生成直到停止；每張之間會有約 1 至 5 秒隨機延遲。

整個 NovelAI 頁面都支援拖入圖片。放開後會詢問用途：

- Vibe Transfer
- Image2Image
- Precise Reference
- 匯入設定
- Cancel

下載 PNG 時會優先保留 NovelAI 原生可匯回的 `Comment` metadata；如果圖片本身沒有可用 metadata，會補寫 NovelAI 相容的 `Comment`，並附帶 `TimeTavernNovelAIMetadata` 方便本頁完整還原設定。收藏會保存到 server 端 `data/novelai-album/`；一般歷史則保存在瀏覽器 IndexedDB。

NovelAI 預設：

- 「保存預設」會寫入 `defaults/novelai-defaults.json`。
- 「啟用預設」是按鈕，點擊後把目前頁面恢復成已保存的預設。
- 預設會保存文字 prompt、片段庫、角色 prompt、尺寸與 AI Settings。
- 預設不保存 Image2Image / Vibe Transfer / Precise Reference 的圖片 data URL。

## Random Prompt 與 Fixed Prompt

Fixed Prompt 與 Random Prompt 是兩套獨立片段庫，格式都用 `||名字||` 插入 Base Prompt，避免與 NovelAI 權重 `{}` 混淆。

Fixed Prompt：

- 用來保存常用固定 prompt，例如品質詞、服裝、背景。
- 點擊名字只插入 `||名字||`。
- Generate 時展開為該片段內容。

Random Prompt：

- 用來測試畫風、髮型、構圖等隨機片段。
- 每行是一組候選，也可用逗號放一整串 prompt。
- 可設定抽選最少與最多數量。
- 可分別開關 `[] max`、`{} max`、數值權重。
- `[]` 與 `{}` 不會重疊；同一項只會選一種加權方式。
- 數值權重可設定最小、最大與偏向值；偏向值附近較常出現，極端值仍可能少量出現。
- 如果某個 prompt 尾字是數字，展開時會自動補空白，降低被 NovelAI 誤判成 `2025::` 權重語法的機率。

metadata 會保存：

- 實際送出的最終 prompt
- 原本 prompt template
- Fixed / Random 片段庫
- 每個 placeholder 的展開結果

## Discord Bot

Bot 邀請連結由網頁產生，包含 `bot` 與 `applications.commands` scope，以及基本聊天、反應、附件、讀取歷史、thread 發訊等權限。若要一般訊息也能觸發對話，Discord Developer Portal 需要開啟 Message Content Intent。

啟動時如果 Discord 連線偶發 timeout，例如 `UND_ERR_CONNECT_TIMEOUT`，server 會照常提供本地網頁，Bot 會在背景自動重試登入。Token 無效、Intents 不允許、401/403 這類設定錯誤不會無限重試，會在 console 明確提示需要檢查設定。

Slash 指令：

| 指令 | 參數 | 說明 |
| --- | --- | --- |
| `/ai` | `content`、`file` | 對 AI 輸入文字或上傳 `.txt`。 |
| `/ai_start` | 無 | 在目前頻道開始對話，並重置 user1/user2 玩家座位。 |
| `/ai_status` | 無 | 查看目前 Bot、模型、對話與玩家狀態。 |
| `/stop` | 無 | 停止目前正在生成的 AI 回覆。 |
| `/player_set` | `number` | 把自己設定為指定玩家，例如 `2`。可有多個 Discord user 同時是 user2。 |
| `/reload` | `feedback` | 移除最新 AI 回覆並重跑，可附改進要求。 |
| `/replay` | `message_number`、`content` | 從指定訊息編號建立分支並重寫後續。 |
| `/run_time` | `number`、`message` | 按要求自動推演多輪，角色卡助手模式不支援。 |
| `/quick_send` | `template`、`inside`、`message` | 快速發送常用劇情指令。`inside` 與 `message` 目前只支援 `｛推进剧情到下一个场景｝`、`｛时间流逝——｝`。 |
| `/ai_help` | 無 | 顯示可用指令。 |
| `/session_save` | `name` | 保存目前整體對話。 |
| `/session_list` | 無 | 列出對話存檔。 |
| `/session_load` | `id` | 載入對話存檔。 |

文字指令：

```text
!ai help
!ai status
!ai start
!ai player_set 2
!ai reload 這次回覆太短
!ai replay 12 新的使用者內容
!ai run_time 5 依照目前事件自然推進
!ai session_save 存檔名
!ai session_list
!ai session_load <id>
```

`/ai_start` 會把該伺服器的對話固定在目前頻道。之後該頻道內的普通訊息都會觸發 AI，不需要 `!ai`。如果在另一個頻道再次 `/ai_start`，會切換固定頻道並重置玩家座位。

Discord 其他行為：

- 第一個發言者自動成為 `user1`，第二個成為 `user2`。
- `/player_set 2` 可手動把自己設成 `user2`。
- 使用者編輯 Discord 原訊息時，Bot 會從該訊息建立備份並重新生成後續分支。
- 每次 AI 正文會自行加上 `👍` / `👎` 反應；使用者點擊後會把「喜歡 / 不喜歡這次正文輸出」標記到下一則 user 訊息。
- 再次點同一個反應或在網頁點同一表情可取消。

## 對話與存檔

對話流程：

- 開始角色卡會清空目前 runtime 對話進度、重置模型內容，並加入開場對話。
- 開場對話本身是對話的一部分，會保留到第一次壓縮發生。
- 正文對話使用最近 N 輪上下文；N 由目前 Prompt 模式設定。
- AI 若開頭重複使用者輸入，後端會嘗試去除重複片段與相鄰符號。
- `send-stream` 會先顯示模型思考/生成過程，正文出現後替換成正式內容。
- `/stop` 或網頁停止按鈕會取消目前生成請求。

存檔功能：

- 主網頁可保存、載入、刪除、預覽存檔。
- Discord 可用 `/session_save`、`/session_list`、`/session_load`。
- 存檔 metadata 在 `data/app-state.json`。
- 大段 conversation 與 AI logs 分離存在 `data/saved-sessions/<id>.json`。
- `/replay` 與 Discord 訊息編輯重算前會先建立分支備份。

## 預設與 GitHub 發佈

主網頁「儲存預設」會保存：

- 使用者設定
- 角色卡
- 角色卡 runtime state
- 目前角色卡 / 助手模式
- Prompt 模式與大模型設定
- 模型內容設定
- 時間統計設定
- 非機密環境顯示設定
- 頭像、背景等非 secret UI 資料

不保存：

- AI 呼叫紀錄
- Discord Bot Token
- 對話 API key
- NovelAI API token
- 目前對話正文
- 對話存檔本體

保存後可提交：

- `defaults/app-defaults.json`
- `defaults/novelai-defaults.json`
- `prompts/modular/*.json`

下載者第一次啟動時，如果本機沒有 `data/app-state.json`，會用 GitHub 預設初始化。已有本機資料時，可按「使用預設」手動套用；這會清空目前環境設定、目前對話與 AI logs，但保留對話存檔。

## HTTP API

主要 API：

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/state` | 取得主 UI state。 |
| `GET` / `PUT` | `/api/env` | 讀取或保存 `.env`。 |
| `POST` | `/api/chat-api/test` | 測試對話 API 連接。 |
| `POST` | `/api/restart` | 排程重啟 server。 |
| `GET` / `PUT` | `/api/time-tracking` | 讀取或保存時間統計設定。 |
| `GET` / `PUT` | `/api/context-compression` | 讀取或保存模型內容。 |
| `POST` | `/api/defaults/save` | 保存 GitHub 預設。 |
| `POST` | `/api/defaults/apply` | 套用 GitHub 預設。 |
| `GET` / `POST` | `/api/novelai/defaults` | 讀取或保存 NovelAI 預設。 |
| `GET` | `/api/novelai/status` | 讀取 NovelAI token 狀態與 Anlas。 |
| `POST` | `/api/novelai/generate` | 生成 NovelAI 圖片。 |
| `GET` / `POST` | `/api/novelai/album` | 列出或收藏 NovelAI 圖片。 |
| `GET` | `/api/novelai/album/:id/image` | 讀取收藏圖片。 |
| `DELETE` | `/api/novelai/album/:id` | 刪除收藏圖片。 |
| `GET` / `POST` | `/api/sessions`、`/api/sessions/save` | 列出或保存對話存檔。 |
| `GET` / `PUT` / `DELETE` | `/api/sessions/:id` | 讀取、改名或刪除存檔。 |
| `POST` | `/api/sessions/:id/load` | 載入存檔。 |
| `POST` | `/api/sessions/:id/archive` / `/resume` | 封存或恢復存檔。 |
| `GET` / `POST` | `/api/role-cards` | 列出或建立角色卡。 |
| `PUT` / `DELETE` | `/api/role-cards/:id` | 更新或刪除角色卡。 |
| `POST` | `/api/role-cards/:id/start` | 開始角色卡。 |
| `GET` / `POST` | `/api/assistant-cards` | 列出或建立助手卡。 |
| `PUT` / `DELETE` | `/api/assistant-cards/:id` | 更新或刪除助手卡。 |
| `POST` | `/api/assistant-cards/:id/start` | 啟用助手卡。 |
| `PUT` | `/api/messages/:id` | 編輯 assistant 訊息。 |
| `POST` | `/api/messages/:id/replay-edit` | 編輯 user 訊息並從該處重跑分支。 |
| `POST` | `/api/messages/:id/feedback` | 喜歡 / 不喜歡 / 取消回饋。 |
| `POST` | `/api/chat/send` | 本地網頁送出一輪對話。 |
| `POST` | `/api/chat/send-stream` | 本地網頁串流送出一輪對話。 |
| `POST` | `/api/chat/stop` | 停止目前生成。 |
| `POST` | `/api/chat/reload` | 重跑最新 AI 回覆。 |
| `POST` | `/api/chat/replay` | 從指定訊息編號重寫分支。 |
| `POST` | `/api/chat/run-time` | 網頁自動推演多輪。 |
| `POST` | `/api/modular-prompts/:mode/preview` | 預覽 Prompt 模式。 |
| `PUT` / `DELETE` | `/api/modular-prompts/:mode` | 保存或刪除 Prompt 模式。 |

靜態檔由同一 server 從 `src/public/` 提供。

## 資料檔

| 檔案或目錄 | 說明 |
| --- | --- |
| `data/app-state.json` | runtime state、目前對話、模型內容、存檔 metadata、AI logs 摘要。 |
| `data/cardstate.json` | 使用者設定與角色卡分離備份。 |
| `data/saved-sessions/` | 對話存檔中的 conversation 與 AI logs。 |
| `data/novelai-album/` | NovelAI 收藏圖片與 index。 |
| `defaults/app-defaults.json` | 可提交的主程式預設。 |
| `defaults/novelai-defaults.json` | 可提交的 NovelAI 預設。 |
| `prompts/modular/*.json` | 可提交的 Prompt 模式設定。 |

`data/` 可能包含完整對話、角色設定與模型內容，不建議公開。

## 開發與檢查

常用命令：

```bash
npm start
npm test
node --check src/index.js
node --check src/public/app.js
node --check src/public/novelai.js
```

`npm test` 目前使用 Node.js 內建 test runner。專案沒有 build step，修改前端後刷新瀏覽器即可。

## 注意事項

- `.env` 包含 API key 與 Bot token，不要提交。
- Discord Bot 要讀取一般訊息，需要在 Developer Portal 開啟 Message Content Intent。
- 全域 Slash 指令可能需要等待 Discord 同步；測試時可設定 `DISCORD_GUILD_ID`。
- `data/app-state.json` 手動編輯錯誤時，server 會盡量 fallback；角色卡仍可能從 `data/cardstate.json` 恢復。
- NovelAI 圖片功能依賴 NovelAI 官方 API 與 token 狀態，Anlas 計算只作為前端預估。
- 本專案可自訂 Prompt 與生成內容，使用時請自行遵守所在地法律、Discord 規範與各模型供應商條款。
