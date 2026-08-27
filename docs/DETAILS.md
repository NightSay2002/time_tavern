# 時分居酒屋細節文件

## 啟動器檢查

`start-mac.command` 與 `start-win.bat` 的共同流程：

- 切到專案根目錄。
- 根目錄缺少 `.env` 時，先從 `data/environment.env` 還原。
- 從 `.env` 讀取 `PORT`，沒有就用 `3234`。
- 檢查系統 `node` 是否至少為 18 且有 npm；不符合時從 Node.js 官方下載最新 24.x LTS 到 `.runtime/node/`。
- 下載的專案 Node.js 會比對官方 `SHASUMS256.txt`，不符合時停止啟動；不需要管理員權限，也不修改系統 Node.js。
- 檢查 `node_modules/discord.js`，不存在時執行 `npm install`。
- 打開 `http://localhost:<PORT>`。
- 執行 `npm start`。

第一次啟動是否套用預設：

- 主功能：會。後端先把 `defaults/app-defaults.json` 複製到 `data/app-defaults.json`；沒有 `data/app-state.json` 時，`createDefaultState()` 會讀取本機預設。
- NovelAI：會。後端先建立 `data/novelai-defaults.json`；`src/public/novelai.js` 在沒有 localStorage draft 時，會呼叫 `/api/novelai/defaults` 讀取本機預設。
- 啟動器本身不需要呼叫「使用預設」API；預設由 server 與 NovelAI 頁面自動讀取。
- 缺少可用 Node.js 時，第一次啟動需要連線至 `nodejs.org`；缺少 npm 套件時也需要連線至 npm registry。之後可重用 `.runtime/node/` 與 `node_modules/`。

## 環境變數

常用設定可在主頁「環境設定」編輯，保存後寫回 `.env`，並同步備份到 `data/environment.env`。若新版本缺少根目錄 `.env`，啟動時會自動從備份還原。

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `PORT` | `3234` | 本地 HTTP server port。 |
| `TIME_TAVERN_AUTO_UPDATE` | `1` | 每次 `npm start` 啟動時檢查 GitHub；`0`、`false`、`off` 關閉。 |
| `CHAT_API_PROVIDER` | `deepseek` | `deepseek`、`openai`、`gemini`、`zhipu`、`custom`。 |
| `CHAT_API_KEY` | 空 | 目前供應商的主聊天、補寫、角色卡助手與大模型處理 Key。 |
| `CHAT_API_BASE_URL` | 依 provider | 自訂 OpenAI-compatible API base URL。 |
| `CHAT_API_MODEL` | `deepseek-v4-pro` | 主對話模型。 |
| `DEEPSEEK_*` / `OPENAI_*` / `GEMINI_*` / `ZHIPU_*` / `CUSTOM_*` | 空 | 網頁環境設定保存各供應商先前使用的 Key、模型與 Base URL；目前選中的值仍同步寫入上述 `CHAT_API_*` 欄位。 |
| `CHAT_API_REASONING_EFFORT` | 空 | 共用思考強度欄位；空值使用 API 預設，或設為 `low`、`high`、`max`。DeepSeek 另支援 `none` 關閉思考並啟用 temperature；GLM-5.3 不接受 `none`。舊版兩個變數仍可讀取。 |
| `CHAT_API_REQUEST_TIMEOUT_MS` | `600000` | 對話 API 逾時，毫秒。 |
| `CHAT_API_MAX_TOKENS` | `32000` | 輸出 token 上限。 |
| `CHAT_API_MAX_TOKENS_PARAM` | `max_tokens` | 可改 `max_completion_tokens`。 |
| `CHAT_API_TEMPERATURE` | `0.5` | 一般對話 temperature，可設定 `0–2` 並支援小數；DeepSeek 思考模式開啟時不生效。 |
| `CHAT_IMAGE_ATTACHMENT_MAX_COUNT` | `4` | 網頁與 Discord 每次最多附加圖片數。 |
| `CHAT_IMAGE_ATTACHMENT_MAX_BYTES` | `5242880` | 每張聊天圖片大小上限，單位 bytes。 |
| `CHAT_API_KEY2` / `CHAT_API_KEY3` | 空 | 大模型內容處理可按順序使用不同 key。 |
| `AI_MIN_REPLY_CHARS` | `600` | 回覆太短時嘗試補救。 |
| `DISCORD_BOT_TOKEN` | 空 | Discord Bot Token。 |
| `DISCORD_CLIENT_ID` | 從 token 推斷 | 產生 Bot 邀請連結用。 |
| `DISCORD_ALLOWED_USER_ID` | 空 | 設定後只接受該 Discord User ID 的指令、訊息、編輯與反應。 |
| `DISCORD_PUBLIC_KEY` | 自動取得 | 驗證 Discord Application Authorized Webhook；Bot 未連線時可填 Developer Portal Public Key 作備援。 |
| `DISCORD_GUILD_ID` | 空 | 額外指定 guild；啟動時亦會同步所有已加入的 guild。 |
| `DISCORD_TEXT_ATTACHMENT_MAX_BYTES` | `1048576` | Discord `.txt` 附件輸入大小上限。 |
| `DISCORD_LOGIN_RETRY_INITIAL_MS` | `15000` | Discord 登入第一次重試等待時間。 |
| `DISCORD_LOGIN_RETRY_MAX_MS` | `300000` | Discord 登入退避上限。 |
| `DISCORD_LOGIN_RETRY_MAX_ATTEMPTS` | `0` | `0` 代表不限次數。 |
| `WEB_USER_NAME_TEMPLATE` | `{{user}}` | 網頁使用者名字模板。 |
| `WEB_AI_NAME_TEMPLATE` | `{{chur}}` | 網頁 AI 名字模板。 |
| `WEB_USER_AVATAR_IMAGE` | 空 | 使用者頭像。 |
| `WEB_AI_AVATAR_IMAGE` | 角色卡封面 | AI 頭像。 |
| `WEB_BACKGROUND_IMAGE` | 空 | 網頁背景圖片。 |
| `WEB_DAILY_WELCOME_AUDIO` | `/assets/audio/welcome-back.mp3` | 每天第一次開頁播放。 |
| `NOVELAI_API_TOKEN` | 空 | NovelAI Persistent API Token。 |
| `NOVELAI_IMAGE_API_BASE_URL` | `https://image.novelai.net` | NovelAI 圖片 API base URL。 |
| `NOVELAI_PRIMARY_API_BASE_URL` | `https://api.novelai.net` | NovelAI 主 API base URL。 |
| `NOVELAI_REQUEST_TIMEOUT_MS` | `600000` | NovelAI 請求逾時，毫秒。 |

Provider 預設 base URL：

| Provider | Base URL |
| --- | --- |
| `deepseek` | `https://api.deepseek.com` |
| `openai` | `https://api.openai.com/v1` |
| `gemini` | `https://generativelanguage.googleapis.com/v1beta/openai` |
| `zhipu` | `https://open.bigmodel.cn/api/paas/v4` |
| `custom` | 必須自行設定 `CHAT_API_BASE_URL` |

舊變數如 `DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`ZHIPU_API_KEY`、`BIGMODEL_API_KEY` 與 provider 專用 Base URL 仍會讀取；新設定建議統一用 `CHAT_API_*`。

GLM 與圖片輸入：

- `glm-5.3` 是文字模型；`glm-5.3-flash` 原生支援文字與圖片。兩者都使用同一個 `CHAT_API_MODEL` 欄位，程式不會因附件自動切換模型。
- 網頁切換 provider 時會保存目前 Key、模型與 Base URL 到該供應商的本機欄位，再帶入新供應商先前保存的值；切回 DeepSeek 會恢復原本的 DeepSeek Key 與模型。
- 網頁與 Discord 支援 PNG、JPEG、WebP、GIF，可只傳圖片或同時輸入文字。圖片會隨 user 訊息保存，編輯重算與 `/reload` 會保留原附件。
- 發送 API 時圖片使用 OpenAI-compatible `messages[].content[]` 的 `image_url` Base64 Data URL；AI 呼叫紀錄只保留圖片類型與大小，不保存第二份 Base64。
- 若選擇的模型不支援圖片，供應商會直接回傳模型能力錯誤，不會轉送其他模型。
- 智譜參考：[GLM-5.3](https://docs.bigmodel.cn/cn/guide/models/text/glm-5.3)、[GLM-5.3-Flash](https://docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash)。

## 主頁功能細節

角色卡：

- 角色模式：單角色、多角色、無角色或自訂 Prompt 模式。
- 封面可上傳、裁切、移除。
- 自定義內容支援任意欄位。
- 開場對話支援多分頁。
- 世界書會在關鍵字命中時插入正文 Prompt。
- 支援 SillyTavern JSON、PNG、JPG/JPEG 匯入。
- 匯出時有封面輸出帶資料 JPG，沒有封面輸出 JSON。

Prompt 與大模型：

- 每個 Prompt 模式有一個固定啟用的「標準壓縮模型」。
- 可建立自訂大模型保存事件、玩家資料、跑圖 prompt、配角資料等。
- 觸發條件包含上下文輪數、每回合、指定回合、關鍵字。
- 觸發動作包含 call api、複製 user 輸入與並行建立圖片。
- 「建立圖片（並行運作），同時繼續正文」會在背景跑圖並照常生成正文。
- 「跑圖不跑正文（完全停止正文）」固定只檢查 user 輸入；命中時仍執行本輪所有大模型與背景跑圖，但不呼叫正文、補寫及 assistant 後觸發。
- 保存環境設定時，只有 `NOVELAI_API_TOKEN` 從有值變空白或從空白變有值，才會自動停用或啟用所有 Prompt 跑圖觸發組合；Token 狀態未變時保留 Prompt 內的手動選擇。
- 單獨大模型可匯出/匯入；模型內容也可匯出。

時間統計：

- 可自動附加當前天數、日期與早中晚。
- 支援下一天詞、不改詞、早上詞、中午詞、晚上詞。
- 支援 `3天後` / `三天後` / `第3天`。
- 自動切換早中晚時，晚上到早上會自動加 1 天。
- `{{保持時間}}`、`{保持時間}` 與 `｛保持時間｝` 會延後自動切換。

對話與編輯：

- 開始角色卡會清空 runtime 對話、重置模型內容、加入開場。
- 助手模式把 `{{user}}` 當作普通字面內容，不會替換成使用者或角色名稱；角色卡模式維持原有模板替換。
- 串流生成會先顯示思考/生成過程，正文出現後替換正式內容。
- `/stop` 或網頁停止按鈕會取消目前生成。
- 編輯網頁使用者訊息或 Discord 原始訊息時，會刪除後續分支並重新生成。
- 網頁輸入列可預覽及移除待上傳圖片；Discord 私訊與已啟用頻道會讀取訊息中的支援圖片附件。

## NovelAI 細節

獨立 NovelAI 頁與 Prompt 編輯跑圖設定均支援 `nai-diffusion-5-full`、`nai-diffusion-5-curated` 及既有 V4.5／V4／V3 模型。V5 請求使用 `params_version: 4` 與 Karras noise schedule；NovelAI 尚未開放 V5 的 Variety+、Vibe Transfer 與 Precise Reference，因此選用 V5 時會停用 Variety+，並隱藏 Vibe Transfer、Precise Reference 及其拖圖用途選項，後端也不會送出相關參數。切回 V4 後會重新顯示並保留原本的參考圖草稿。

頁面三欄：

- 左欄：模型、prompt、片段庫、角色、參考圖、尺寸與生成參數。
- 中欄：目前圖片、內容、還原設定、下載、收藏、放大檢視。
- 右欄：本地歷史縮圖。

拖入圖片後可選用途：

- Vibe Transfer
- Image2Image
- Precise Reference
- 匯入設定

Fixed Prompt：

- 用 `||名字||` 插入 Base Prompt。
- Generate 時展開為固定內容。

Random Prompt：

- 用 `||名字||` 插入 Base Prompt。
- 每行可作為候選，也可用逗號放一串 prompt。
- 可設定抽選數量、`[]`、`{}`、數值權重與偏向值。
- metadata 會保存最終 prompt、template、片段庫與每個 placeholder 展開結果。

圖片與 metadata：

- 匯入圖片時可讀取 PNG 文字 chunks，以及 Alpha／RGB 最低位元中的 NovelAI stealth metadata。
- 只有偵測到可用的圖片設定時，拖放用途選擇才會顯示「匯入設定」。
- 下載 PNG 時優先保留 NovelAI 原生可匯回的 `Comment` metadata。
- 沒有可用 metadata 時會補寫 NovelAI 相容 `Comment`，並附 `TimeTavernNovelAIMetadata`。
- 下載「純圖片」時會移除 `tEXt`、`iTXt`、`zTXt`，並清除 Alpha／RGB 最低位元中的 `stealth_pnginfo`、`stealth_pngcomp`、`stealth_rgbinfo`、`stealth_rgbcomp`。
- 一般歷史存在瀏覽器 IndexedDB，每頁載入 20 張，支援逐張刪除與一鍵清空。新圖片以 Blob 與縮圖保存，避免同時載入大量原圖。
- 收藏存在 server 端 `data/novelai-album/`；右側可切換歷史與收藏，取消收藏後圖片會回到歷史。
- 點擊主圖會開啟圖片檢視器，支援拖曳移動與滾輪縮放。
- Vibe Transfer、Image2Image 與 Precise Reference 圖片會保存在瀏覽器本地草稿，離開頁面後再返回仍會還原。

純靜態版位於 <https://nightsay2002.github.io/novelai-image-static/>。它直接從瀏覽器連線 NovelAI，Token、參考圖草稿、分頁歷史與收藏均保存在該瀏覽器，不依賴本專案 server。

NovelAI 預設：

- 「保存預設」寫入 `data/novelai-defaults.json`。
- 預設保存 prompt、片段庫、角色 prompt、尺寸、AI Settings。
- 預設不保存 Image2Image / Vibe Transfer / Precise Reference 的圖片 data URL。

## Discord 指令

Slash 指令：

| 指令 | 參數 | 說明 |
| --- | --- | --- |
| `/ai_start` | `num` | `0` 使用目前角色卡或助手；`1...N` 切換到角色卡瀏覽器中的編號並開始，同時重置玩家座位。 |
| `/ai_status` | `num` | 只接受數字 `1` 或 `2`：`1` 查看 Bot、模型、對話與玩家狀態；`2` 以左右按鈕逐張瀏覽角色卡及其正確模式。 |
| `/stop` | 無 | 停止目前生成。 |
| `/player_set` | `number` | 把自己設定為指定玩家。 |
| `/reload` | `num`、`comment` | 直接改寫倒數第 `num` 次使用者輸入並重新生成；`1` 代表最近一次。 |
| `/quick_send` | `template`、`inside`、`message` | 快速發送常用劇情指令；所有模板都可在括號內補充並另起一行追加內容。 |

Discord 行為：

- Bot 每次上線都會立即同步 Slash 指令到所有已加入的 Discord 伺服器，並同步全域指令。
- Bot 新加入伺服器時，會優先在系統頻道、否則在第一個有權發言的文字頻道送出私人聊天與 `/ai_start` 使用說明。
- 應用程式安裝到使用者帳號時，`APPLICATION_AUTHORIZED` Webhook 會觸發 Bot 私訊使用說明。
- `/ai_start num:0` 或指定角色卡編號後，會把該伺服器的對話固定在目前頻道。
- 已啟用的頻道與 Bot 私訊可以直接輸入對話，不需要文字指令前綴。
- 第一個發言者自動成為 `user1`，第二個成為 `user2`。
- `/player_set 2` 可手動把自己設成 `user2`。
- 使用者編輯 Discord 原訊息時，Bot 會從該訊息建立備份並重新生成後續分支。
- AI 正文會自行加上 `👍` / `👎` 反應；點擊後會把回饋附到下一則 user 訊息。

Discord Developer Portal 設定：

1. 在 Installation 啟用 `Guild Install` 與 `User Install`，並使用 Discord Provided Link。
2. Guild Install 加入 `bot`、`applications.commands` 與 Bot 所需權限；User Install 加入 `applications.commands`。
3. 將 Webhooks Endpoint 設為可公開連線的 `https://你的網址/api/discord/events`，啟用 Events 並訂閱 `APPLICATION_AUTHORIZED`。
4. Bot 上線後會自動取得驗證用 Public Key；只有 Webhook 可能早於 Bot 連線時，才需要填 `DISCORD_PUBLIC_KEY`。

## 預設與發佈

Git 追蹤的 `defaults/app-defaults.json` 與 `defaults/novelai-defaults.json` 是隨程式發布的預設。第一次啟動會複製到 `data/`；之後 Git 自動更新不會修改使用者的本機預設。

主頁「儲存預設」會寫入 `data/app-defaults.json`，保存：

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

三個按鈕的差異：

- 「儲存預設」：把目前設定保存成使用者本機預設。
- 「使用預設」：以本機預設覆蓋目前使用者設定、角色卡、Prompt 與環境設定。
- 「使用作者預設」：把目前程式版本隨附的作者預設複製到本機預設，不立即修改目前角色卡、Prompt、使用者設定或目前對話。

Prompt 模式與助手 Prompt 都包含在主功能預設 JSON，不再分散寫入 `prompts/`。目前正在使用的 Prompt 同時保存在 `data/app-state.json`，所以只取得作者預設不會立即套用。

可提交的發布內容：

- `defaults/app-defaults.json`
- `defaults/novelai-defaults.json`
- `src/public/assets/img/cover.png`
- `src/public/assets/img/image1.png` 至 `image4.png`

自動更新只處理 Git 追蹤的程式與發布預設。`data/`、`.env`、角色卡與目前對話不會被 Git 更新；舊版追蹤檔中的使用者預設或 Prompt 改動會先遷移到 `data/`。

自動更新因本機程式檔改動而跳過時，可停止服務、備份整個 `data/`、取得乾淨的新版本，再只把 `data/` 放回新版本。啟動器會用 `data/environment.env` 還原缺少的 `.env`。備份包含 Token 與 API Key，不可公開。

## HTTP API

| Method | Path | 說明 |
| --- | --- | --- |
| `GET` | `/api/state` | 取得主 UI state。 |
| `GET` / `PUT` | `/api/env` | 讀取或保存 `.env`。 |
| `POST` | `/api/chat-api/test` | 測試對話 API。 |
| `POST` | `/api/restart` | 排程重啟 server。 |
| `GET` / `PUT` | `/api/time-tracking` | 讀取或保存時間統計。 |
| `GET` / `PUT` | `/api/context-compression` | 讀取或保存模型內容。 |
| `POST` | `/api/defaults/save` | 保存主功能預設。 |
| `POST` | `/api/defaults/apply` | 套用主功能預設。 |
| `POST` | `/api/defaults/update` | 以發布預設更新本機預設，不立即套用。 |
| `GET` / `POST` | `/api/novelai/defaults` | 讀取或保存 NovelAI 預設。 |
| `GET` | `/api/novelai/status` | 讀取 NovelAI token 狀態與 Anlas。 |
| `POST` | `/api/novelai/generate` | 生成 NovelAI 圖片。 |
| `GET` / `POST` | `/api/novelai/album` | 列出或收藏 NovelAI 圖片。 |
| `GET` | `/api/novelai/album/:id/image` | 讀取收藏圖片。 |
| `DELETE` | `/api/novelai/album/:id` | 刪除收藏圖片。 |
| `GET` / `POST` | `/api/role-cards` | 列出或建立角色卡。 |
| `PUT` / `DELETE` | `/api/role-cards/:id` | 更新或刪除角色卡。 |
| `POST` | `/api/role-cards/:id/start` | 開始角色卡。 |
| `GET` / `POST` | `/api/assistant-cards` | 列出或建立助手卡。 |
| `PUT` / `DELETE` | `/api/assistant-cards/:id` | 更新或刪除助手卡。 |
| `POST` | `/api/assistant-cards/:id/start` | 啟用助手卡。 |
| `PUT` | `/api/messages/:id` | 編輯 assistant 訊息。 |
| `POST` | `/api/messages/:id/replay-edit` | 編輯 user 訊息並重跑。 |
| `POST` | `/api/messages/:id/feedback` | 喜歡 / 不喜歡 / 取消回饋。 |
| `POST` | `/api/chat/send-stream` | 網頁串流送出一輪對話。 |
| `POST` | `/api/chat/stop` | 停止目前生成。 |
| `POST` | `/api/chat/reload` | 依 `num`、`comment` 改寫較早的使用者輸入並重算。 |
| `GET` / `POST` | `/api/sessions`、`/api/sessions/save` | 列出或建立網頁對話存檔。 |
| `GET` / `DELETE` | `/api/sessions/:id` | 預覽或刪除網頁對話存檔。 |
| `POST` | `/api/sessions/:id/load` | 載入存檔的對話專屬狀態；不覆蓋全域角色卡、助手、Prompt 或設定。 |
| `POST` | `/api/modular-prompts/:mode/preview` | 預覽 Prompt 模式。 |
| `PUT` / `DELETE` | `/api/modular-prompts/:mode` | 保存或刪除 Prompt 模式。 |

## 資料檔

| 檔案或目錄 | 說明 |
| --- | --- |
| `data/app-state.json` | runtime state、目前對話、目前 Prompt、模型內容、去重 AI logs 與對話存檔摘要；不重複保存角色卡或完整存檔。 |
| `data/app-defaults.json` | 使用者本機主功能、角色卡與 Prompt 預設。 |
| `data/novelai-defaults.json` | 使用者本機 NovelAI 預設。 |
| `data/environment.env` | 根目錄 `.env` 的完整本機備份，包含 Token 與 API Key。 |
| `data/cardstate.json` | 角色卡與助手的獨立資料檔；內容未變更時不重複寫入。 |
| `data/saved-sessions/` | 每個網頁對話存檔各自一份對話專屬快照；只保存對話、回合、時間進度、壓縮內容、該角色 runtime 與 AI logs，不保存角色卡、助手、Prompt 或全域設定。 |
| `data/novelai-album/` | NovelAI 收藏圖片與 index。 |
| `defaults/app-defaults.json` | 可提交的主功能與 Prompt 發布預設。 |
| `defaults/novelai-defaults.json` | 可提交的 NovelAI 發布預設。 |

`data/` 可能包含完整對話、角色設定與模型內容，不建議公開。

舊版對話存檔會在首次啟動新版時轉成對話專屬的分離式格式。主狀態只保留名稱、角色、訊息數等清單資料，因此角色卡與存檔增加時，打開存檔清單不會逐一解析所有完整存檔。AI 呼叫紀錄會把同一卡、同一 Prompt 中完全相同的長文字保存一次，再由各筆紀錄引用；網頁只在展開單筆紀錄時建立完整內容。載入時會依保存的角色卡或助手 ID 連接目前全域版本；若該 ID 已不存在，仍載入對話，但不自動啟用角色或助手。時間位置與自動切換進度會恢復，時間功能開關、輪數與關鍵字設定則保留載入前的全域值。

## 開發檢查

```bash
npm start
npm test
node --check src/index.js
node --check src/public/app.js
node --check src/public/novelai.js
```

專案沒有 build step，前端修改後刷新瀏覽器即可。
