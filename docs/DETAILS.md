# 時分居酒屋細節文件

## 啟動器檢查

`start-mac.command` 與 `start-win.bat` 的共同流程：

- 切到專案根目錄。
- 根目錄缺少 `.env` 時，先從 `data/environment.env` 還原。
- 從 `.env` 讀取 `PORT`，沒有就用 `3234`。
- 檢查系統 `node` 是否至少為 18 且有 npm；不符合時從 Node.js 官方下載最新 24.x LTS 到 `.runtime/node/`。
- 下載的專案 Node.js 會比對官方 `SHASUMS256.txt`，不符合時停止啟動；不需要管理員權限，也不修改系統 Node.js。
- 檢查 `node_modules/discord.js` 與 `node_modules/opencc-js` 等必要執行依賴，缺少時執行 `npm install`。
- 打開 `http://localhost:<PORT>`。
- 執行 `npm start`。

第一次啟動是否套用預設：

- 主功能：會。後端先把 `defaults/app-defaults.json` 複製到 `data/app-defaults.json`；沒有 `data/app-state.json` 時，`createDefaultState()` 會讀取本機預設。
- NovelAI：會。後端先建立 `data/novelai-defaults.json`；`src/public/novelai.js` 在沒有 localStorage draft 時，會呼叫 `/api/novelai/defaults` 讀取本機預設。
- 啟動器本身不需要呼叫「匯入全局設定」API；預設由 server 與 NovelAI 頁面自動讀取。
- 缺少可用 Node.js 時，第一次啟動需要連線至 `nodejs.org`；缺少 npm 套件時也需要連線至 npm registry。之後可重用 `.runtime/node/` 與 `node_modules/`。

## 環境變數

常用設定可在主頁「環境設定」編輯，保存後寫回 `.env`，並同步備份到 `data/environment.env`。若新版本缺少根目錄 `.env`，啟動時會自動從備份還原。

| 變數 | 預設 | 說明 |
| --- | --- | --- |
| `PORT` | `3234` | 本地 HTTP server port。 |
| `TIME_TAVERN_AUTO_UPDATE` | `1` | 每次 `npm start` 啟動時檢查 GitHub；`0`、`false`、`off` 關閉。 |
| `CHAT_API_PROVIDER` | `deepseek` | `deepseek`、`openai`、`gemini`、`zhipu`、`custom`。 |
| `CHAT_API_KEY` | 空 | Key 1 的主聊天、補寫及角色卡助手 Key。舊設定直接沿用，不需遷移。 |
| `CHAT_API_BASE_URL` | 依 provider | 自訂 OpenAI-compatible API base URL，亦可直接填完整 Chat Completions 路線。 |
| `CHAT_API_MODEL` | `deepseek-v4-pro` | 主對話模型；Base URL 是完整 deployment URL 時可留空。 |
| `DEEPSEEK_*` / `OPENAI_*` / `GEMINI_*` / `ZHIPU_*` / `CUSTOM_*` | 空 | 網頁環境設定分開保存各供應商先前使用的 Key、模型與 Base URL；目前供應商的專屬 Key 優先，`CHAT_API_KEY` 只作舊設定後備，執行時不讀取其他供應商的 Key。 |
| `CHAT_API_REASONING_EFFORT` | `high` | 共用思考欄位。DeepSeek 空值使用 `high`；GLM 4.5+、Gemini 2.5 Flash／Flash-Lite，以及支援 `none` 的 GPT-5.1+ 非 Pro 模型可選 `none`。模型不支援時不送關閉參數。關閉後啟用 temperature，且不附帶使用者自訂補充。舊版 provider 專用變數仍可讀取。 |
| `CHAT_API_REQUEST_TIMEOUT_MS` | `600000` | 對話 API 逾時，毫秒。 |
| `CHAT_API_MAX_TOKENS` | `32000` | 輸出 token 上限。 |
| `CHAT_API_MAX_TOKENS_PARAM` | `max_tokens` | 可改 `max_completion_tokens`。 |
| `CHAT_API_TEMPERATURE` | `0.5` | 一般對話 temperature，可設定 `0–2` 並支援小數；DeepSeek 思考模式開啟時不生效。 |
| `CHAT_IMAGE_ATTACHMENT_MAX_COUNT` | `4` | 網頁與 Discord 每次最多附加圖片數。 |
| `CHAT_IMAGE_ATTACHMENT_MAX_BYTES` | `5242880` | 每張聊天圖片大小上限，單位 bytes。 |
| `CHAT_IMAGE_INPUT_MODE` | `main` | `main` 由主要模型直接讀圖；`specialist` 先由專用圖片模型轉成文字描述。 |
| `CHAT_IMAGE_API_PROVIDER` | `deepseek` | 專用圖片 API provider；支援與對話 API 相同的 provider 類型。 |
| `CHAT_IMAGE_API_BASE_URL` | 依 provider | 專用圖片 API 的 Base URL 或完整 deployment URL。 |
| `CHAT_IMAGE_API_MODEL` | 空 | 專用圖片模型；完整 deployment URL 已包含模型時可留空。 |
| `CHAT_IMAGE_API_REASONING_EFFORT` | 依 provider | 圖片模型獨立思考強度；DeepSeek 空值使用 `high`，可設 `none`、`low`、`high`、`max`。 |
| `CHAT_IMAGE_API_TEMPERATURE` | API 預設 | 圖片模型獨立 temperature，範圍 `0–2`；思考開啟時不送出。 |
| `CHAT_IMAGE_API_KEY` | 空 | 專用圖片 API Key；只保存於 `.env` 與 `data/environment.env`。 |
| `CHAT_API_KEY2` / `CHAT_API_KEY3` | 空 | Key 1 組內的大模型內容處理 Key，按啟用的大模型順序使用；不足時沿用該組最後一把。 |
| `CHAT_API_KEY_GROUP2` | 空 | Key 2 的主對話 Key；更多分頁依序使用 `CHAT_API_KEY_GROUP3...`。 |
| `CHAT_API_KEY_GROUP2_2` / `CHAT_API_KEY_GROUP2_3` | 空 | Key 2 組內的大模型內容處理 Key；其他分頁使用相同命名規則。 |
| `AI_MIN_REPLY_CHARS` | `600` | 回覆太短時嘗試補救。 |
| `DISCORD_BOT_TOKEN` | 空 | Discord Bot Token。 |
| `DISCORD_CLIENT_ID` | 從 token 推斷 | 產生 Bot 邀請連結用。 |
| `DISCORD_ALLOWED_USER_ID` | 空 | 設定後只接受該 Discord User ID 的指令、訊息、編輯與反應。 |
| `DISCORD_PUBLIC_KEY` | 自動取得 | 驗證 Discord Application Authorized Webhook；Bot 未連線時可填 Developer Portal Public Key 作備援。 |
| `DISCORD_TEXT_ATTACHMENT_MAX_BYTES` | `1048576` | Discord `.txt` 附件輸入大小上限。 |
| `DISCORD_ERROR_AUTO_DELETE_SECONDS` | `15` | 頻道一般對話的模型錯誤回覆保留秒數，範圍 1 至 300。 |
| `DISCORD_LOGIN_RETRY_INITIAL_MS` | `15000` | Discord 登入第一次重試等待時間。 |
| `DISCORD_LOGIN_RETRY_MAX_MS` | `300000` | Discord 登入退避上限。 |
| `DISCORD_LOGIN_RETRY_MAX_ATTEMPTS` | `0` | `0` 代表不限次數。 |
| `QQ_BOT_APP_ID` | 空 | QQ 開放平台官方機器人的 AppID；必須與 AppSecret 同時填寫。 |
| `QQ_BOT_APP_SECRET` | 空 | QQ 開放平台官方機器人的 AppSecret。 |
| `QQ_ALLOWED_USER_OPENID` | 空 | 選填；設定後只回應此 QQ `user_openid` 的 C2C 私聊。 |
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

一般 Base URL 使用 `{base}/chat/completions` 與 Bearer Token。若 Base URL 已是完整的 `/deployments/{deployment}/chat/completions?...` 路線，系統會原樣使用、改用 `api-key` header，並省略 request body 的 `model`；API 輸出模型可留空。系統不會推測 deployment 名稱或自動加入 API version。

環境設定的「測試連線」不傳 `temperature`，由 deployment 使用模型預設值；正式對話仍依 `CHAT_API_TEMPERATURE` 設定送出溫度。

API 回應成功但 `content` 空白時，正文請求會原樣重試一次，不會重新執行該回合的壓縮、跑圖或其他前置動作。第二次仍空白才標記該回合無效。Discord 一般頻道對話的模型失敗會回覆在原訊息旁並自動刪除；其他未預期錯誤仍使用私人通知。

舊變數如 `DEEPSEEK_API_KEY`、`OPENAI_API_KEY`、`GEMINI_API_KEY`、`ZHIPU_API_KEY`、`BIGMODEL_API_KEY` 與 provider 專用 Base URL 仍會讀取；新設定建議統一用 `CHAT_API_*`。

思考模式：

- DeepSeek 支援關閉及 `low`、`high`、`max`；未指定時維持高強度。
- GLM 4.5 以上可關閉思考；`reasoning_effort` 強度只在 GLM 5.2 以上送出。
- Gemini OpenAI-compatible API 目前只為 Gemini 2.5 Flash／Flash-Lite 提供可用的 `none`；Gemini 2.5 Pro 與 Gemini 3 不顯示關閉。
- OpenAI 只在支援 `reasoning_effort: none` 的 GPT-5.1 以上非 Pro 模型顯示關閉；其他模型與自訂 provider 保留 API 預設。
- 只要目前請求實際解析為 `none`，網頁與 Discord 都不會把「使用者自訂補充」附加到該次模型輸入；使用者原訊息及已存資料不會刪除。

## 介面語言

主頁「設定及其他雜項」中的簡繁切換會保存為全域 `uiLanguage`，啟動時同步套用主頁、NovelAI、Storyboard、Discord 與 QQ。完整雙向轉換使用 OpenCC；繁體為 `zh-Hant`，簡體為 `zh-Hans`。

程式介面、Bot 指令說明、角色卡名稱與預覽、開場、聊天與存檔顯示，以及送往對話 API 的文字都會轉成目前字形；程式碼區塊、圖片及 Base64 不轉換。角色卡編輯欄位、Prompt、使用者輸入與存檔的原始資料不會被批次改寫，因此切換語言或載入對話存檔不會污染原文。

GLM 與圖片輸入：

- `glm-5.3` 是文字模型；`glm-5.3-flash` 原生支援文字與圖片。兩者都使用同一個 `CHAT_API_MODEL` 欄位，程式不會因附件自動切換模型。
- 網頁切換 provider 時會保存目前 Key、模型與 Base URL 到該供應商的本機欄位，再帶入新供應商先前保存的值；切回 DeepSeek 會恢復原本的 DeepSeek Key 與模型。
- 網頁與 Discord 支援 PNG、JPEG、WebP、GIF，可只傳圖片或同時輸入文字。圖片會隨 user 訊息保存，編輯重算與 `/reload` 會保留原附件。
- `CHAT_IMAGE_INPUT_MODE=main` 時，圖片使用 OpenAI-compatible `messages[].content[]` 的 `image_url` Base64 Data URL 直接交給主要模型，維持舊版行為。
- `CHAT_IMAGE_INPUT_MODE=specialist` 時，一次最多四張圖片會先交給獨立圖片 API，依序辨識人物、物件、文字、場景、動作與圖片間關係；主要模型、壓縮、補寫與助手只收到隱藏文字描述，不收到原圖。
- 圖片 API 的思考強度與溫度完全獨立於主要對話。DeepSeek 空白思考設定解析為高強度；選擇 `none` 才會送出圖片溫度，明確選擇低／高／最大時溫度保留但不送出。
- 專用辨識結果與圖片及使用者文字的指紋保存在 user 訊息內；`/reload`、`/quick_send` 或訊息編輯的內容完全相同時直接複用，文字或圖片改變才重新辨識。原圖仍保留於聊天與對話存檔。
- 專用圖片 API 缺少 Key／模型、連線失敗或回傳空白時會停止該回合並套用既有無效對話回滾，不會讓主要模型在沒有圖片資訊時猜測。環境設定的「測試圖片讀取」會實際傳送一張標準 RGBA 32×32 PNG。
- AI 呼叫紀錄的 purpose 為 `image_understanding`，只保留圖片類型與大小，不保存第二份 Base64。`CHAT_IMAGE_API_KEY` 不加入故事 Key 分頁、作者預設或全局設定匯出。
- 智譜參考：[GLM-5.3](https://docs.bigmodel.cn/cn/guide/models/text/glm-5.3)、[GLM-5.3-Flash](https://docs.bigmodel.cn/cn/guide/models/vlm/glm-5.3-flash)。

## 主頁功能細節

聊天區固定在面板寬度內，長文字、網址與時間切換提醒會自動換行；寬表格及程式碼區塊可獨立橫向捲動，不會將輸入列與送出按鈕擠出畫面。

角色卡：

- 角色模式：單角色、多角色、無角色或自訂 Prompt 模式。
- 封面可上傳、裁切、移除。
- 自定義內容支援任意欄位。
- 開場對話支援多分頁；選擇分頁後可修改「開場名稱」，分頁文字即時更新，按角色卡「保存」一起儲存。名稱留空會使用「開場 1、開場 2」等預設名稱。
- 單卡世界書會在關鍵字命中時插入正文 Prompt。
- 角色卡區的「全局世界書」可建立所有角色卡共用的條目；總開關與每條條目均可獨立啟停，觸發規則沿用單卡世界書，助手模式不套用。
- 支援 SillyTavern JSON、PNG、JPG/JPEG 匯入。
- 匯出時有封面輸出帶資料 JPG，沒有封面輸出 JSON。

Prompt 與大模型：

- 每個 Prompt 模式有一個固定啟用的「標準壓縮模型」。
- 可建立自訂大模型保存事件、玩家資料、跑圖 prompt、配角資料等。
- 觸發條件包含上下文輪數、每回合、指定回合、關鍵字。
- 觸發動作包含 call api、複製 user 輸入與並行建立圖片。
- 「建立圖片（並行運作），同時繼續正文」會在背景跑圖並照常生成正文。
- 「跑圖不跑正文（完全停止正文）」固定只檢查 user 輸入；命中時仍執行本輪所有大模型與背景跑圖，但不呼叫正文、補寫及 assistant 後觸發。
- 對話觸發的跑圖只放在目前對話暫存，不會加入 NovelAI 收藏。保存對話時會保存該存檔引用的圖片；切卡、重新開始、啟用助手、載入其他存檔或匯入全局設定後，沒有隨存檔保存的舊對話圖片會清除。
- 保存環境設定時，只有 `NOVELAI_API_TOKEN` 從有值變空白或從空白變有值，才會自動停用或啟用所有 Prompt 跑圖觸發組合；Token 狀態未變時保留 Prompt 內的手動選擇。
- 單獨大模型可匯出/匯入；模型內容也可匯出。

時間統計：

- 可自動附加當前天數、日期與早中晚。
- 可把目前天數、年月日及時間段保存為全域起點；之後從網頁啟用角色卡、以及角色卡模式下使用 Discord `/ai_start` 建立的新對話都從該點開始，既有對話不受影響。
- 助手模式完全不套用統計判斷：不附加時間、不偵測時間詞、不重設時間進度，也不從助手對話快照或助手存檔還原時間。
- 支援下一天詞、不改詞、早上詞、中午詞、晚上詞。
- 所有統計判斷詞會自動以繁簡互通方式比對；每個詞只需輸入繁體或簡體其中一種，保存資料仍保留原本輸入字形。
- 「時間段更改詞」只檢查 user 輸入；命中後會在生成前立即前進一段，早上→中午→晚上→翌日早上。
- 支援 `3天後` / `三天後` / `第3天`。
- 自動切換早中晚時，晚上到早上會自動加 1 天。
- `{{保持時間}}`、`{保持時間}`、`｛保持時間｝` 及對應簡體寫法都會延後自動切換。
- 快捷劇情指令會按全局語言輸出 `{{保持時間}}`、`｛推進劇情到下一個場景｝`、`｛時間流逝——｝`、`｛繼續｝` 或其簡體版本；括號內補充及另行訊息保留使用者原文。

對話與編輯：

- 開始角色卡會清空 runtime 對話、重置模型內容、加入開場。
- 助手卡可設定開場對白；有值時 API 上下文從 `system → assistant 開場 → user` 開始，空白時維持 `system → user`。
- 建立新助手時依序填寫名稱、簡介、Prompt 與開場對白；Prompt 不會自動帶入寫卡助手內容。
- 助手模式把 `{{user}}` 當作普通字面內容，不會替換成使用者或角色名稱；角色卡模式維持原有模板替換。
- 串流生成會先顯示思考/生成過程，正文出現後替換正式內容。
- `/stop` 或網頁停止按鈕在生成中會取消目前生成；閒置時會釋放目前故事租用的對話 API Key，但不刪除故事或頻道。
- 編輯網頁使用者訊息或 Discord 原始訊息時，會刪除後續分支並重新生成。
- 編輯較早輸入時會回復該回合前的日期、時間段、切換計數、壓縮內容與目前角色劇情狀態；統計判斷的啟用狀態、時間段更改詞、其他關鍵詞、自動切換設定、正文模型、上下文輪數及其他角色卡狀態均保留目前值。
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
- 收藏存在 server 端 `data/novelai-album/`；右側可切換歷史與收藏，生成、收藏或取消收藏後都保留目前分頁，取消收藏的圖片會回到歷史。使用上下方向鍵到達本頁邊界時會自動載入相鄰分頁並繼續選圖。
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
| `/ai_start` | 選填 `num`、選填 `opening` | `num` 未填時等同 `0`，使用該頻道目前角色卡或助手；`1...N` 使用角色卡編號。`opening` 從 `1` 開始，未填時使用角色卡設定的預設開場。 |
| `/ai_status` | `num` | 只接受數字 `1` 或 `2`：`1` 查看目前頻道狀態；`2` 使用四個按鈕分別切換角色卡及其開場預覽。 |
| `/stop` | 無 | 生成中停止目前生成；閒置時釋放目前故事租用的 Key，故事仍保留。 |
| `/close` | 無 | 關閉並刪除目前 Discord 頻道或私訊的故事；已建立的對話存檔不受影響。 |
| `/player_set` | `number` | 把自己設定為指定玩家。 |
| `/reload` | `num`、`comment` | 直接改寫倒數第 `num` 次使用者輸入並重新生成；`1` 代表最近一次。 |
| `/quick_send` | `template`、`inside`、`message` | 快速發送常用劇情指令；固定指令及選項跟隨全局簡繁設定，括號內補充與另起一行的內容保留原文。 |
| `/archive` | `action`、選填 `name` | `0` 保存目前對話，未填名稱時使用日期時間；`1` 私密瀏覽存檔，1 號是最新存檔。 |
| `/archive_return` | `mode`、`num` | 載入第 `num` 號存檔；`mode:0` 從頭公開回放，`mode:1` 顯示最後五回合並從末端繼續。 |

Discord 行為：

- Bot 每次上線只同步全域 Slash 指令，並清除所有已加入伺服器中的舊 guild 指令，避免全域與伺服器指令重複顯示。全域指令同時支援伺服器安裝與使用者安裝。
- Bot 新加入伺服器時，會優先在系統頻道、否則在第一個有權發言的文字頻道送出私人聊天與 `/ai_start` 使用說明。
- 應用程式安裝到使用者帳號時，`APPLICATION_AUTHORIZED` Webhook 會觸發 Bot 私訊使用說明。
- 每個伺服器頻道與 Bot 私訊各自保存角色、對話、回合、時間、壓縮內容、模型狀態及玩家分配；在不同頻道使用 `/ai_start` 或 `/archive_return` 不會覆蓋其他頻道故事。AI 呼叫紀錄不按頻道拆分，所有故事共用同一份最近 200 筆紀錄。
- 每個新故事自動租用目前對話 API 供應商最前面的閒置 Key 組，Key 1 優先；切換供應商會清除舊租用，現有故事在下一次呼叫時改用新供應商重新分配。其他供應商保存的 Key 與分頁不會加入租用，也不會作為失敗回退；新供應商沒有 Key 時會要求先到環境設定填寫。每次實際 AI 呼叫會延長 24 小時，超過 24 小時沒有 AI 活動的組可由新故事接手。所有已設定組都忙碌時會要求新增 Key 組，不會讓兩個活躍故事偷偷共用。
- 使用網頁刪除或 `/close` 會立即釋放該故事的 Key 組；直接刪除 Discord 頻道也會由 Bot 收到的 `channelDelete` 事件釋放。Bot 重啟不會因頻道查詢失敗或暫時不可見而刪除故事。已建立的對話存檔不受影響。
- `/ai_start` 使用目前角色卡及其預設開場；`/ai_start num:22` 使用第 22 張角色卡設定的預設開場；`/ai_start num:22 opening:2` 明確使用開場 2。明確指定的開場只屬於目前頻道，不修改角色卡的全域預設。
- `/ai_status num:2` 顯示 `預覽（目前開場/開場總數）`；上一張／下一張會回到該卡開場 1，另外兩個按鈕只切換目前角色卡的開場。
- 角色卡預覽的四個按鈕各自使用唯一 ID；即使位於第一張、最後一張或角色卡沒有多個開場，Discord 也不會因停用按鈕的 ID 重複而拒絕回覆。
- 模型呼叫失敗與缺少 API Key 時，該次使用者輸入及系統通知會在網頁標示為「無效對話」，不成為正式回合；時間、壓縮及模型狀態回復到輸入前，兩則訊息也不進入正文、壓縮或大模型上下文。下一次對話成功後會自動移除先前所有無效對話；啟動時會把舊版本留在故事尾端的失敗回合補上無效標記。Discord 伺服器頻道中的一般對話、編輯重算及 Slash 指令錯誤會回覆到原頻道，禁止 mentions，並依 `DISCORD_ERROR_AUTO_DELETE_SECONDS` 自動刪除；Bot 私聊錯誤則留在同一個私聊。成功正文同樣直接送到來源頻道。
- 網頁聊天標題列可手動選擇「本地對話」、已使用過的 Discord 頻道／私訊或 QQ 私聊；查看、發言、編輯、重算、停止、保存及載入均作用於目前選擇的故事，外部 Bot 新活動不會自動切換網頁。選擇器旁的刪除按鈕只刪除該故事並切回本地對話，不會刪除對話存檔；本地對話不可刪除。
- `/archive action:1` 每次私密顯示一份存檔的名稱、角色與最後對話，使用左右按鈕翻頁；完整存檔只在顯示時讀取。
- `/archive` 的 `action` 與 `/archive_return` 的 `mode` 選項只顯示純數字 `0`／`1`；「瀏覽存檔」、「從頭回放」等中文只出現在參數說明，不是要輸入的內容。
- 存檔瀏覽會分行顯示完整的 `/archive_return mode:0 num:N` 與 `/archive_return mode:1 num:N`，中文說明不屬於指令內容。
- `/archive_return mode:0` 會先把 runtime 載入到存檔末端，再公開顯示開場白與最初五回合；每按一次「繼續」追加五回合。新對話會終止尚未完成的回放，並直接從存檔末端繼續。
- 存檔回放以一組 user 與下一則可見 assistant 為一回合，不顯示 `model_image` 等模型不可見訊息。載入仍保留目前全域角色卡、助手、Prompt 與設定。
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

## QQ 官方 Bot 私聊

- 只訂閱與處理 `C2C_MESSAGE_CREATE`，不處理群聊、QQ 頻道或主動通知。
- 在 QQ 開放平台建立官方機器人後，把 AppID 與 AppSecret 填入環境設定並重啟 server；本地 server 透過 Gateway WebSocket 收訊，不需要公開 webhook。
- 使用者私訊時直接對話，不需要 QQ 指令。該 OpenID 尚未開始故事時，會自動使用網頁目前選中的角色卡或助手；完全未選卡時才提示回網頁選擇。
- 每個 OpenID 使用獨立 `qq:c2c:*` context，分開保存對話、回合、時間、壓縮內容、角色 runtime、AI logs 與 API Key 租用狀態；網頁的故事選擇器可切換或刪除，已建立存檔不受影響。
- 支援私聊文字與 PNG、JPEG、WebP、GIF 圖片附件；背景跑圖屬於該次私聊回覆。QQ Bot 不支援 Discord Slash 指令、存檔瀏覽按鈕、玩家座位或反應回饋。
- `QQ_ALLOWED_USER_OPENID` 留空時接受所有能私訊 Bot 的使用者；設定後，其他 OpenID 的訊息會直接忽略。

QQ 私聊文字指令同時接受半形 `!` 與全形 `！`；`!開始` 與 `!开始` 均可使用。指令會先被 Bot 攔截，不會保存成對話回合或送進模型，說明與回覆會依全局 `uiLanguage` 統一字形：

| 指令 | 說明 |
| --- | --- |
| `!help` | 顯示全部 QQ 私聊指令。 |
| `!開始` | 使用目前角色卡的第一個開場開始，等同 `!ai_start 0 1`；簡體 `!开始` 亦可。 |
| `!ai_start [角色卡編號] [開場編號]` | 開始或重新開始故事；未填角色卡編號時使用目前角色或助手。 |
| `!ai_status 1` | 查看目前角色、故事狀態與回合。 |
| `!ai_status 2 [頁數]` | 每頁列出 10 張角色卡及開場數量。 |
| `!stop` | 生成中停止目前生成；閒置時釋放目前 QQ 故事租用的 Key。 |
| `!close` | 刪除目前 QQ 故事並釋放 Key；已建立存檔保留。 |
| `!archive 0 [名稱]` | 保存目前 QQ 對話。 |
| `!archive 1 [存檔編號]` | 查看指定存檔的資料及最後五回合；未填編號時查看最新一份。 |
| `!archive_return <0\|1> <存檔編號>` | 載入存檔末端；`0` 顯示開頭五回合，`1` 顯示最後五回合，之後都可直接繼續。 |

## 預設與發佈

Git 追蹤的 `defaults/app-defaults.json` 與 `defaults/novelai-defaults.json` 是隨程式發布的預設。第一次啟動會複製到 `data/`；之後 Git 自動更新不會修改使用者的本機預設。

主頁「匯出當前全局設定」會產生 JSON 檔，支援時由瀏覽器選擇儲存位置，否則使用瀏覽器下載功能。檔案保存：

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
- Discord 與 QQ Bot 憑證
- 對話 API key
- NovelAI API token
- 目前對話正文

三個按鈕的差異：

- 「匯出當前全局設定」：自行選擇位置保存一個 JSON 檔；瀏覽器不支援位置選擇 API 時，改用一般下載。
- 「匯入全局設定」：自行選擇 JSON 檔，覆蓋目前使用者設定、角色卡、Prompt 與非機密環境設定。
- 「使用作者預設」：直接套用目前程式版本隨附的作者預設，不建立匯入用中介檔。

匯入或使用作者預設會清空目前對話及 AI 呼叫紀錄，但保留所有對話存檔，以及這台裝置原有的 Discord Token、NovelAI Token、Client ID 與對話 API Key。

Prompt 模式與助手 Prompt 都包含在全局設定 JSON，不再分散寫入 `prompts/`。目前正在使用的 Prompt 同時保存在 `data/app-state.json`；按下「使用作者預設」後會立即套用作者版本。

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
| `GET` / `PUT` | `/api/ui-language` | 讀取或保存全域介面語言。 |
| `GET` / `PUT` | `/api/env` | 讀取或保存 `.env`。 |
| `POST` | `/api/chat-api/test` | 測試對話 API。 |
| `POST` | `/api/chat-image-api/test` | 使用尚未保存的設定實際測試圖片讀取。 |
| `POST` | `/api/restart` | 排程重啟 server。 |
| `GET` / `PUT` | `/api/time-tracking` | 讀取或保存時間統計。 |
| `GET` / `PUT` | `/api/global-lorebook` | 讀取或保存所有角色卡共用的全局世界書。 |
| `GET` / `PUT` | `/api/context-compression` | 讀取或保存模型內容。 |
| `GET` | `/api/defaults/export` | 取得不含密鑰與對話的全局設定 JSON。 |
| `POST` | `/api/defaults/import` | 匯入選定的全局設定並保留本機密鑰與對話存檔。 |
| `POST` | `/api/defaults/author` | 直接套用目前版本隨附的作者預設。 |
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
| `POST` | `/api/chat/stop` | 生成中停止目前生成；閒置時釋放目前故事租用的 Key。 |
| `POST` | `/api/chat/reload` | 依 `num`、`comment` 改寫較早的使用者輸入並重算。 |
| `GET` / `POST` | `/api/sessions`、`/api/sessions/save` | 列出或建立網頁對話存檔。 |
| `GET` / `DELETE` | `/api/sessions/:id` | 預覽或刪除網頁對話存檔。 |
| `POST` | `/api/sessions/:id/load` | 載入存檔的對話專屬狀態；不覆蓋全域角色卡、助手、Prompt 或設定。 |
| `GET` | `/api/conversation-images/:file` | 讀取目前對話的暫存跑圖。 |
| `GET` | `/api/sessions/:id/images/:file` | 讀取對話存檔保存的跑圖。 |
| `POST` | `/api/modular-prompts/:mode/preview` | 預覽 Prompt 模式。 |
| `PUT` / `DELETE` | `/api/modular-prompts/:mode` | 保存或刪除 Prompt 模式。 |

## 資料檔

| 檔案或目錄 | 說明 |
| --- | --- |
| `data/app-state.json` | 全域 runtime 設定、目前網頁故事 ID、Discord／QQ 輕量索引、目前 Prompt 與對話存檔摘要；不保存完整對話、AI logs、角色卡或完整存檔。 |
| `data/ai-logs.json` | 所有本地、Discord 與 QQ 故事共用的最近 200 筆 AI 呼叫紀錄；使用分塊去重格式保存。 |
| `data/app-defaults.json` | 使用者本機主功能、角色卡與 Prompt 預設。 |
| `data/novelai-defaults.json` | 使用者本機 NovelAI 預設。 |
| `data/environment.env` | 根目錄 `.env` 的完整本機備份，包含 Token 與 API Key。 |
| `data/cardstate.json` | 角色卡、助手與全局世界書的獨立資料檔；內容未變更時不重複寫入。 |
| `data/saved-sessions/` | 每個網頁對話存檔各自一份對話專屬快照；只保存對話、回合、時間進度、壓縮內容、該角色 runtime 與 AI logs，不保存角色卡、助手、Prompt 或全域設定。 |
| `data/conversation-contexts/` | 本地故事、每個 Discord 頻道／私訊及每個 QQ C2C OpenID 各自一份 runtime；保存對話、角色／助手、回合、時間進度、壓縮內容、角色 runtime 與玩家分配，不保存全局 AI logs。舊共享對話首次升級時會移入原 `lastDiscordChannelId`。QQ 檔名只使用 OpenID 雜湊。 |
| `data/conversation-images/` | 目前對話跑圖暫存；未被目前對話引用時自動清除。 |
| `data/saved-session-images/` | 各對話存檔引用的跑圖；刪除該存檔時一併刪除。 |
| `data/novelai-album/` | NovelAI 收藏圖片與 index。 |
| `defaults/app-defaults.json` | 可提交的主功能與 Prompt 發布預設。 |
| `defaults/novelai-defaults.json` | 可提交的 NovelAI 發布預設。 |

`data/` 可能包含完整對話、角色設定與模型內容，不建議公開。

舊版對話存檔會在首次啟動新版時轉成對話專屬的分離式格式。主狀態只保留名稱、角色、訊息數等清單資料，因此角色卡與存檔增加時，打開存檔清單不會逐一解析所有完整存檔。每份新存檔的分離檔也保存一份輕量摘要；若主狀態的存檔或故事索引遺失，啟動時會從仍存在的分離檔重建，正常啟動則不會重讀所有大型存檔。主狀態或角色卡狀態 JSON 損壞時會停止啟動，不會以空白狀態覆寫原檔。AI 呼叫紀錄最多保留最近 200 筆，會把完全相同的長文字或重複的 4 KB 文字區塊保存一次，再由各筆紀錄引用；舊存檔首次升級會自動改寫成分塊格式。網頁只在展開單筆紀錄時建立完整內容。載入時會依保存的角色卡或助手 ID 連接目前全域版本；若該 ID 已不存在，仍載入對話，但不自動啟用角色或助手。時間位置與自動切換進度會恢復，時間功能開關、輪數與關鍵字設定則保留載入前的全域值。

每個故事與對話存檔的完整訊息都會保留，程式不設回合數上限，也不會於 500 或 1000 回合時裁掉舊內容；實際容量只受本機磁碟與可用記憶體限制。主聊天預設顯示現在，點擊一本對話存檔後則由開場及第 1 則訊息開始預覽。兩者都使用固定 20 則訊息的 DOM 視窗，到達上方或下方邊界時會移動 10 則並保留另外 10 則作定位；在最新區段時可用 `⇈` 直達開場，到達最早區段後按鈕會變成 `⇊` 並可跳回現在。向兩個方向捲動都能恢復全部歷史，但 DOM 不會隨回合數累積。只供後端重算使用的回合 checkpoint 不會送到瀏覽器。暫存對話圖片的引用會在啟動時建立輕量索引，之後保存單一故事不會重新解析其他所有 context。以 4 個故事、每個 1000 回合、每則 user／assistant 約 1000 字及 200 筆 AI logs 的隔離測試計算，總 context 檔約 56.9 MiB，單一故事讀取及 JSON 解析約 41 至 45 ms；這只是效能範例而非保存上限，實際大小會依正文、模型內容與圖片引用而變化。

## 開發檢查

```bash
npm start
npm test
node --check src/index.js
node --check src/qq-bot.js
node --check src/public/app.js
node --check src/public/novelai.js
```

專案沒有 build step，前端修改後刷新瀏覽器即可。
