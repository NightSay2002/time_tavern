const el = {
  mobileInfoToggleBtn: document.getElementById("mobileInfoToggleBtn"),
  mobileInfoDrawer: document.getElementById("mobileInfoDrawer"),
  startStatus: document.getElementById("startStatus"),
  profileForm: document.getElementById("profileForm"),
  displayName: document.getElementById("displayName"),
  identityText: document.getElementById("identityText"),
  editModularPromptsBtn: document.getElementById("editModularPromptsBtn"),
  contextCompressionModeHint: document.getElementById("contextCompressionModeHint"),

  selectRoleCardBtn: document.getElementById("selectRoleCardBtn"),
  createRoleCardBtn: document.getElementById("createRoleCardBtn"),
  createAssistantCardBtn: document.getElementById("createAssistantCardBtn"),
  importRoleCardBtn: document.getElementById("importRoleCardBtn"),
  roleCardImportFile: document.getElementById("roleCardImportFile"),
  roleCardList: document.getElementById("roleCardList"),
  selectSessionBtn: document.getElementById("selectSessionBtn"),
  saveSessionBtn: document.getElementById("saveSessionBtn"),

  editAiOutputBtn: document.getElementById("editAiOutputBtn"),
  contextCompressionInspectBtn: document.getElementById("contextCompressionInspectBtn"),
  timeTrackingSettingsBtn: document.getElementById("timeTrackingSettingsBtn"),
  novelAiImageBtn: document.getElementById("novelAiImageBtn"),
  novelAiStoryboardBtn: document.getElementById("novelAiStoryboardBtn"),
  envSettingsBtn: document.getElementById("envSettingsBtn"),
  useDefaultsBtn: document.getElementById("useDefaultsBtn"),
  saveDefaultsBtn: document.getElementById("saveDefaultsBtn"),
  updateDefaultsBtn: document.getElementById("updateDefaultsBtn"),
  uiLanguageToggleBtn: document.getElementById("uiLanguageToggleBtn"),
  mobilePageChatBtn: document.getElementById("mobilePageChatBtn"),
  mobilePageControlsBtn: document.getElementById("mobilePageControlsBtn"),

  messages: document.getElementById("messages"),
  chatHeaderAvatar: document.getElementById("chatHeaderAvatar"),
  chatHeaderTitle: document.getElementById("chatHeaderTitle"),
  chatHeaderSubtitle: document.getElementById("chatHeaderSubtitle"),
  aiLogs: document.getElementById("aiLogs"),
  chatForm: document.getElementById("chatForm"),
  chatCommandMenu: document.getElementById("chatCommandMenu"),
  chatPlusButton: document.getElementById("chatPlusButton"),
  chatCommandComposer: document.getElementById("chatCommandComposer"),
  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),
  stopChatBtn: document.getElementById("stopChatBtn"),
  discordBotLinkBtn: document.getElementById("discordBotLinkBtn"),

  roleCardDialog: document.getElementById("roleCardDialog"),
  roleCardForm: document.getElementById("roleCardForm"),
  roleCardDialogTitle: document.getElementById("roleCardDialogTitle"),
  roleCardId: document.getElementById("roleCardId"),
  roleCardMode: document.getElementById("roleCardMode"),
  roleCardName: document.getElementById("roleCardName"),
  roleCardCoverImageFile: document.getElementById("roleCardCoverImageFile"),
  roleCardCoverImage: document.getElementById("roleCardCoverImage"),
  roleCardCoverPreview: document.getElementById("roleCardCoverPreview"),
  editRoleCardCoverCropBtn: document.getElementById("editRoleCardCoverCropBtn"),
  removeRoleCardCoverBtn: document.getElementById("removeRoleCardCoverBtn"),
  roleCardCustomSectionList: document.getElementById("roleCardCustomSectionList"),
  addRoleCardCustomSectionBtn: document.getElementById("addRoleCardCustomSectionBtn"),
  roleCardOpeningTabs: document.getElementById("roleCardOpeningTabs"),
  addRoleCardOpeningBtn: document.getElementById("addRoleCardOpeningBtn"),
  roleCardOpening: document.getElementById("roleCardOpening"),
  roleCardLorebookList: document.getElementById("roleCardLorebookList"),
  addRoleCardLorebookBtn: document.getElementById("addRoleCardLorebookBtn"),
  cancelRoleCardDialog: document.getElementById("cancelRoleCardDialog"),

  coverCropDialog: document.getElementById("coverCropDialog"),
  coverCropStage: document.getElementById("coverCropStage"),
  coverCropImage: document.getElementById("coverCropImage"),
  coverCropBox: document.getElementById("coverCropBox"),
  coverCropPreview: document.getElementById("coverCropPreview"),
  changeCoverCropImageBtn: document.getElementById("changeCoverCropImageBtn"),
  confirmCoverCropBtn: document.getElementById("confirmCoverCropBtn"),
  cancelCoverCropBtn: document.getElementById("cancelCoverCropBtn"),

  roleCardPickerDialog: document.getElementById("roleCardPickerDialog"),
  roleCardPickerGrid: document.getElementById("roleCardPickerGrid"),
  roleCardPickerPrevBtn: document.getElementById("roleCardPickerPrevBtn"),
  roleCardPickerNextBtn: document.getElementById("roleCardPickerNextBtn"),
  roleCardPickerPageInfo: document.getElementById("roleCardPickerPageInfo"),
  closeRoleCardPickerBtn: document.getElementById("closeRoleCardPickerBtn"),

  sessionPickerDialog: document.getElementById("sessionPickerDialog"),
  sessionPickerGrid: document.getElementById("sessionPickerGrid"),
  sessionPickerCount: document.getElementById("sessionPickerCount"),
  sessionPreviewPanel: document.getElementById("sessionPreviewPanel"),
  sessionPreviewTitle: document.getElementById("sessionPreviewTitle"),
  sessionPreviewMeta: document.getElementById("sessionPreviewMeta"),
  sessionPreviewMessages: document.getElementById("sessionPreviewMessages"),
  sessionPreviewActions: document.getElementById("sessionPreviewActions"),
  loadSessionPreviewBtn: document.getElementById("loadSessionPreviewBtn"),
  deleteSessionPreviewBtn: document.getElementById("deleteSessionPreviewBtn"),
  sessionPickerPrevBtn: document.getElementById("sessionPickerPrevBtn"),
  sessionPickerNextBtn: document.getElementById("sessionPickerNextBtn"),
  sessionPickerPageInfo: document.getElementById("sessionPickerPageInfo"),
  saveSessionFromDialogBtn: document.getElementById("saveSessionFromDialogBtn"),
  closeSessionPickerBtn: document.getElementById("closeSessionPickerBtn"),

  editAiDialog: document.getElementById("editAiDialog"),
  editAiForm: document.getElementById("editAiForm"),
  assistantMessageSelect: document.getElementById("assistantMessageSelect"),
  assistantMessageContent: document.getElementById("assistantMessageContent"),
  cancelEditAiDialog: document.getElementById("cancelEditAiDialog"),
  editMessageDialog: document.getElementById("editMessageDialog"),
  editMessageForm: document.getElementById("editMessageForm"),
  editMessageHint: document.getElementById("editMessageHint"),
  editMessageContent: document.getElementById("editMessageContent"),
  cancelEditMessageDialog: document.getElementById("cancelEditMessageDialog"),

  contextCompressionDialog: document.getElementById("contextCompressionDialog"),
  contextCompressionForm: document.getElementById("contextCompressionForm"),
  contextCompressionMeta: document.getElementById("contextCompressionMeta"),
  contextCompressionProfileSelect: document.getElementById("contextCompressionProfileSelect"),
  contextCompressionContentView: document.getElementById("contextCompressionContentView"),
  saveContextCompressionDialog: document.getElementById("saveContextCompressionDialog"),
  exportContextCompressionDialog: document.getElementById("exportContextCompressionDialog"),
  closeContextCompressionDialog: document.getElementById("closeContextCompressionDialog"),

  timeTrackingDialog: document.getElementById("timeTrackingDialog"),
  timeTrackingForm: document.getElementById("timeTrackingForm"),
  timeTrackingMeta: document.getElementById("timeTrackingMeta"),
  timeTrackingEnabled: document.getElementById("timeTrackingEnabled"),
  timeTrackingDayNumber: document.getElementById("timeTrackingDayNumber"),
  timeTrackingYear: document.getElementById("timeTrackingYear"),
  timeTrackingMonth: document.getElementById("timeTrackingMonth"),
  timeTrackingDate: document.getElementById("timeTrackingDate"),
  timeTrackingPeriod: document.getElementById("timeTrackingPeriod"),
  timeTrackingAutoPeriodEnabled: document.getElementById("timeTrackingAutoPeriodEnabled"),
  timeTrackingAutoPeriodRounds: document.getElementById("timeTrackingAutoPeriodRounds"),
  timeTrackingNextDayWords: document.getElementById("timeTrackingNextDayWords"),
  timeTrackingConnectorWords: document.getElementById("timeTrackingConnectorWords"),
  timeTrackingNoChangeWords: document.getElementById("timeTrackingNoChangeWords"),
  timeTrackingMorningWords: document.getElementById("timeTrackingMorningWords"),
  timeTrackingNoonWords: document.getElementById("timeTrackingNoonWords"),
  timeTrackingEveningWords: document.getElementById("timeTrackingEveningWords"),
  closeTimeTrackingDialog: document.getElementById("closeTimeTrackingDialog"),

  envSettingsDialog: document.getElementById("envSettingsDialog"),
  envSettingsForm: document.getElementById("envSettingsForm"),
  envSettingsFields: document.getElementById("envSettingsFields"),
  envSettingsExtraList: document.getElementById("envSettingsExtraList"),
  addEnvExtraBtn: document.getElementById("addEnvExtraBtn"),
  envSettingsHint: document.getElementById("envSettingsHint"),
  restartServerBtn: document.getElementById("restartServerBtn"),
  cancelEnvSettingsDialog: document.getElementById("cancelEnvSettingsDialog"),

  assistantPromptDialog: document.getElementById("assistantPromptDialog"),
  assistantPromptForm: document.getElementById("assistantPromptForm"),
  assistantCardId: document.getElementById("assistantCardId"),
  assistantCardName: document.getElementById("assistantCardName"),
  assistantCardDescription: document.getElementById("assistantCardDescription"),
  assistantPromptInput: document.getElementById("assistantPromptInput"),
  cancelAssistantPromptDialog: document.getElementById("cancelAssistantPromptDialog"),

  modularPromptDialog: document.getElementById("modularPromptDialog"),
  modularPromptForm: document.getElementById("modularPromptForm"),
  modularPromptModeSelect: document.getElementById("modularPromptModeSelect"),
  modularPromptModeName: document.getElementById("modularPromptModeName"),
  modularPromptDialogueContextRounds: document.getElementById("modularPromptDialogueContextRounds"),
  addModularPromptModeBtn: document.getElementById("addModularPromptModeBtn"),
  deleteModularPromptModeBtn: document.getElementById("deleteModularPromptModeBtn"),
  exportModularPromptModeBtn: document.getElementById("exportModularPromptModeBtn"),
  importModularPromptModeBtn: document.getElementById("importModularPromptModeBtn"),
  modularPromptImportFile: document.getElementById("modularPromptImportFile"),
  compressionProfileSelect: document.getElementById("compressionProfileSelect"),
  editCompressionProfileBtn: document.getElementById("editCompressionProfileBtn"),
  addCompressionProfileBtn: document.getElementById("addCompressionProfileBtn"),
  deleteCompressionProfileBtn: document.getElementById("deleteCompressionProfileBtn"),
  exportCompressionProfileBtn: document.getElementById("exportCompressionProfileBtn"),
  importCompressionProfileBtn: document.getElementById("importCompressionProfileBtn"),
  compressionProfileImportFile: document.getElementById("compressionProfileImportFile"),
  compressionProfileName: document.getElementById("compressionProfileName"),
  compressionProfileEnabled: document.getElementById("compressionProfileEnabled"),
  compressionProfileContextScope: document.getElementById("compressionProfileContextScope"),
  compressionTriggerActionList: document.getElementById("compressionTriggerActionList"),
  addCompressionTriggerActionBtn: document.getElementById("addCompressionTriggerActionBtn"),
  compressionAppendTermList: document.getElementById("compressionAppendTermList"),
  addCompressionAppendTermBtn: document.getElementById("addCompressionAppendTermBtn"),
  modularCompressionMainRules: document.getElementById("modularCompressionMainRules"),
  modularCompressionModelList: document.getElementById("modularCompressionModelList"),
  addCompressionModelBtn: document.getElementById("addCompressionModelBtn"),
  modularReasonerMainRules: document.getElementById("modularReasonerMainRules"),
  modularReasonerContextRules: document.getElementById("modularReasonerContextRules"),
  previewModularPromptBtn: document.getElementById("previewModularPromptBtn"),
  modularPreviewReasonerSystem: document.getElementById("modularPreviewReasonerSystem"),
  modularPreviewCompressionPrompt: document.getElementById("modularPreviewCompressionPrompt"),
  cancelModularPromptDialog: document.getElementById("cancelModularPromptDialog"),

  toast: document.getElementById("toast")
};

let appState = null;
let pendingRoleCardStartId = "";
let mobilePage = "chat";
let mobileInfoOpen = false;
let mobileViewportUpdateFrame = 0;
let mobileMessageScrollFrame = 0;
let roleCardLorebooksDraft = [];
let roleCardCustomSectionsDraft = [];
let roleCardOpeningDialoguesDraft = [];
let selectedRoleCardOpeningId = "";
let compressionModelsDraft = [];
let compressionProfilesDraft = [];
let selectedCompressionProfileId = "standard";
let contextCompressionDialogPayload = null;
let selectedContextCompressionProfileId = "standard";
let roleCardPickerPage = 1;
let sessionPickerPage = 1;
let selectedSessionPreviewId = "";
let selectedSessionPreview = null;
let roleCardCoverImageReadTask = null;
let coverCropState = null;
let coverCropConfirmHandler = null;
let coverCropChangeImageHandler = null;
let envExtraEntries = [];
let chatStreamRenderFrame = 0;
let isChatStreaming = false;
let dailyWelcomeAudioArmed = false;
let chatCommandMenuOpen = false;
let selectedChatCommandIndex = 0;
let chatCommandMenuShowAll = false;
let activeChatCommandForm = null;
let focusedChatCommandField = "";
let editingUserMessageId = "";
let modularPromptRenderFrame = 0;
let modularPromptScrollLockState = null;
const MOBILE_LAYOUT_QUERY = "(max-width: 980px)";
const CHARACTER_CARD_CREATION_ASSISTANT_MODE = "CharacterCardCreationAssistant";
const DEFAULT_ASSISTANT_CARD_NAME = "寫卡助手";
const DEFAULT_ASSISTANT_CARD_DESCRIPTION = "專門協助建立角色卡、角色群組與無角色模式設定包。";
const ROLE_CARD_PICKER_PAGE_SIZE = 9;
const SESSION_PICKER_PAGE_SIZE = 6;
const BUILTIN_PROMPT_MODES = ["single", "multi", "no_role"];
const DEFAULT_ROLE_CARD_MODE = "multi";
const STANDARD_COMPRESSION_PROFILE_ID = "standard";
const MODEL_TRIGGER_ACTION_CALL_API = "call_api";
const MODEL_TRIGGER_ACTION_COPY_USER_INPUT = "copy_user_input";
const DIALOG_BACKDROP_CLOSE_CONFIRM_TEXT = "尚未保存的內容會遺失，確定要關閉嗎？";
const COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY = "text_only";
const COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT = "role_and_text";
const KEYWORD_FOLLOWUP_CONTINUE_REASONER = "continue_reasoner";
const KEYWORD_FOLLOWUP_STOP_AFTER_MODEL = "stop_after_model";
const KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER = "image_parallel_reasoner";
const KEYWORD_FOLLOWUP_IMAGE_ONLY = "image_only";
const MODEL_APPEND_PLAYER_OTHER = "userx";
const UI_LANGUAGE_TRADITIONAL = "zh-Hant";
const UI_LANGUAGE_SIMPLIFIED = "zh-Hans";
const UI_LANGUAGE_STORAGE_KEY = "time_tavern_ui_language";
const DAILY_WELCOME_PLAYED_STORAGE_KEY = "time_tavern_daily_welcome_played";
const UI_LANGUAGE_TEXT_ATTRS = ["placeholder", "title", "aria-label", "alt", "value"];
const ASSISTANT_FEEDBACK_LABELS = {
  like: "喜歡",
  dislike: "不喜歡"
};
const ASSISTANT_FEEDBACK_EMOJIS = {
  like: "👍",
  dislike: "👎"
};
const CHAT_COMMAND_MENU_ITEMS = [
  {
    id: "quick-keep-time",
    command: "{{保持時間}}",
    title: "保持時間",
    description: "填入保持目前時間的快捷指令到輸入欄，不會立即送出。",
    hint: "填入",
    insert: "{{保持時間}}"
  },
  {
    id: "quick-next-scene",
    command: "｛推进剧情到下一个场景｝",
    title: "推进剧情到下一个场景",
    description: "填入快捷劇情指令到輸入欄，不會立即送出。",
    hint: "填入",
    insert: "｛推进剧情到下一个场景｝"
  },
  {
    id: "quick-time-passes",
    command: "｛时间流逝——｝",
    title: "时间流逝——",
    description: "填入時間流逝快捷指令到輸入欄，不會立即送出。",
    hint: "填入",
    insert: "｛时间流逝——｝"
  },
  {
    id: "quick-continue",
    command: "｛繼續｝",
    title: "繼續",
    description: "填入繼續快捷指令到輸入欄，不會立即送出。",
    hint: "填入",
    insert: "｛繼續｝"
  },
  {
    id: "ai-start",
    command: "/ai_start",
    title: "開始目前角色卡對話",
    description: "如果還沒選角色卡，會先打開角色卡列表。",
    hint: "執行",
    action: "start"
  },
  {
    id: "ai-status",
    command: "/ai_status",
    title: "查看目前狀態",
    description: "查看目前角色卡與對話是否已開始。",
    hint: "執行",
    action: "status"
  },
  {
    id: "stop",
    command: "/stop",
    title: "停止生成",
    description: "停止目前正在生成的 AI 回覆。",
    hint: "執行",
    action: "stop"
  },
  {
    id: "reload",
    command: "/reload",
    title: "改寫較早輸入",
    description: "依倒數次序直接改寫使用者輸入並重新生成後續。",
    hint: "參數",
    form: "reload",
    fields: [
      {
        name: "num",
        label: "num",
        type: "number",
        placeholder: "1",
        defaultValue: "1",
        required: true,
        help: "1 是最近一次、2 是倒數第二次使用者輸入。"
      },
      {
        name: "comment",
        label: "comment",
        type: "text",
        placeholder: "取代原輸入的新內容",
        defaultValue: "",
        required: true,
        help: "這段內容會直接取代指定的使用者輸入。"
      }
    ]
  }
];
const UI_LANGUAGE_SKIP_TEXT_SELECTOR = [
  "script",
  "style",
  "template",
  "input",
  "textarea",
  "pre",
  "code",
  ".markdown-body",
  ".message-preview",
  ".message-reasoning-content",
  ".ai-log-block",
  "[data-ui-language-skip]"
].join(",");
const UI_LANGUAGE_SKIP_ATTR_SELECTOR = [
  "script",
  "style",
  "template",
  "pre",
  "code",
  ".markdown-body",
  ".message-preview",
  ".message-reasoning-content",
  ".ai-log-block",
  "[data-ui-language-skip]"
].join(",");
const UI_T2S_PHRASES = [
  ["伺服器", "服务器"],
  ["本地服务器", "本地服务器"],
  ["滑鼠", "鼠标"],
  ["介面", "界面"],
  ["網頁", "网页"],
  ["資料", "资料"],
  ["訊息", "讯息"],
  ["寫卡助手", "写卡助手"],
  ["簡繁轉換", "简繁转换"],
  ["繁體", "繁体"],
  ["簡體", "简体"]
];
const UI_T2S_CHARS = {
  並: "并",
  併: "并",
  來: "来",
  係: "系",
  個: "个",
  們: "们",
  偵: "侦",
  儲: "储",
  備: "备",
  傳: "传",
  傷: "伤",
  內: "内",
  關: "关",
  刪: "删",
  則: "则",
  創: "创",
  劇: "剧",
  動: "动",
  務: "务",
  匯: "汇",
  區: "区",
  協: "协",
  參: "参",
  啟: "启",
  單: "单",
  嗎: "吗",
  圍: "围",
  圖: "图",
  團: "团",
  場: "场",
  塊: "块",
  壓: "压",
  壞: "坏",
  學: "学",
  寫: "写",
  實: "实",
  專: "专",
  對: "对",
  導: "导",
  張: "张",
  後: "后",
  從: "从",
  復: "复",
  應: "应",
  態: "态",
  憶: "忆",
  戶: "户",
  換: "换",
  損: "损",
  擇: "择",
  攔: "拦",
  敗: "败",
  數: "数",
  斷: "断",
  時: "时",
  暫: "暂",
  書: "书",
  會: "会",
  機: "机",
  檔: "档",
  欄: "栏",
  權: "权",
  歡: "欢",
  沒: "没",
  測: "测",
  準: "准",
  溫: "温",
  為: "为",
  無: "无",
  產: "产",
  現: "现",
  環: "环",
  當: "当",
  發: "发",
  確: "确",
  稱: "称",
  範: "范",
  簡: "简",
  紀: "纪",
  紅: "红",
  純: "纯",
  細: "细",
  終: "终",
  組: "组",
  結: "结",
  給: "给",
  統: "统",
  經: "经",
  網: "网",
  綴: "缀",
  線: "线",
  編: "编",
  縮: "缩",
  總: "总",
  繼: "继",
  續: "续",
  義: "义",
  與: "与",
  舊: "旧",
  蓋: "盖",
  蘋: "苹",
  處: "处",
  製: "制",
  複: "复",
  覆: "复",
  見: "见",
  規: "规",
  視: "视",
  覽: "览",
  觸: "触",
  訂: "订",
  計: "计",
  訊: "讯",
  記: "记",
  設: "设",
  註: "注",
  詞: "词",
  試: "试",
  話: "话",
  該: "该",
  詳: "详",
  誤: "误",
  調: "调",
  請: "请",
  議: "议",
  讀: "读",
  變: "变",
  貼: "贴",
  資: "资",
  載: "载",
  輪: "轮",
  輯: "辑",
  輸: "输",
  轉: "转",
  這: "这",
  連: "连",
  進: "进",
  過: "过",
  達: "达",
  選: "选",
  還: "还",
  鈕: "钮",
  錄: "录",
  錯: "错",
  鍵: "键",
  鐘: "钟",
  門: "门",
  閉: "闭",
  開: "开",
  間: "间",
  頁: "页",
  項: "项",
  順: "顺",
  須: "须",
  預: "预",
  題: "题",
  顯: "显",
  體: "体",
  麼: "么",
  點: "点"
};
const TIME_PERIOD_LABELS = {
  morning: "早上",
  noon: "中午",
  evening: "晚上"
};
const ENV_FIELD_GROUPS = [
  {
    title: "伺服器",
    description: "Port 變更後需要重啟 npm start。",
    fields: [
      {
        key: "PORT",
        label: "本地伺服器 Port",
        type: "number",
        placeholder: "3234",
        help: "預設 3234。改完後請重啟伺服器。"
      }
    ]
  },
  {
    title: "Discord Bot",
    description: "不填 Bot Token 時，只會啟動本地網頁管理端。",
    fields: [
      {
        key: "DISCORD_BOT_TOKEN",
        label: "Discord Bot Token",
        type: "password",
        autocomplete: "off",
        help: "填入後需要重啟，Bot 才會重新登入。"
      },
      {
        key: "DISCORD_CLIENT_ID",
        label: "Discord Client ID",
        type: "text",
        help: "選填。無法從 Token 解出 Client ID 時，用它產生邀請連結。"
      },
      {
        key: "DISCORD_ALLOWED_USER_ID",
        label: "指定user only",
        type: "text",
        placeholder: "Discord User ID",
        help: "選填。設定後只接受這個使用者的 Discord 指令、訊息、編輯與反應。"
      },
      {
        key: "DISCORD_PUBLIC_KEY",
        label: "Discord Public Key",
        type: "text",
        autocomplete: "off",
        help: "選填備援。Bot 上線後會自動取得；也可填入 Developer Portal General Information 的 Public Key。"
      },
      {
        key: "DISCORD_TEXT_ATTACHMENT_MAX_BYTES",
        label: ".txt 附件大小上限",
        type: "number",
        placeholder: "1048576",
        help: "單位 bytes。1048576 = 1 MB。"
      }
    ]
  },
  {
    title: "對話API",
    description: "支援 OpenAI-compatible Chat Completions API。DeepSeek、OpenAI、Gemini 可直接用對應 provider 或自訂 Base URL。",
    fields: [
      {
        key: "CHAT_API_PROVIDER",
        label: "對話API供應商",
        type: "select",
        options: [
          ["deepseek", "DeepSeek"],
          ["openai", "OpenAI / ChatGPT"],
          ["gemini", "Gemini"],
          ["custom", "自訂 OpenAI-compatible"]
        ],
        help: "決定預設 Base URL；custom 供應商必須另外填 CHAT_API_BASE_URL。"
      },
      {
        key: "CHAT_API_KEY",
        label: "對話 API Key",
        type: "password",
        autocomplete: "off",
        help: "可填 DeepSeek、OpenAI 或 Gemini API key；舊版 DEEPSEEK_API_KEY / OPENAI_API_KEY / GEMINI_API_KEY 會自動帶入。"
      },
      {
        key: "CHAT_API_BASE_URL",
        label: "對話 API Base URL",
        type: "text",
        placeholder: "留空使用供應商預設",
        help: "OpenAI-compatible base，例如 https://api.openai.com/v1 或 https://generativelanguage.googleapis.com/v1beta/openai。"
      },
      {
        key: "CHAT_API_MODEL",
        label: "API輸出模型",
        type: "text",
        placeholder: "deepseek-v4-pro / gpt-4.1 / gemini-2.5-flash",
        help: "主聊天、大模型處理、補寫與角色卡助手都會使用此模型。"
      },
      {
        key: "DEEPSEEK_REASONING_EFFORT",
        label: "DeepSeek 思考模式強度",
        type: "select",
        options: [
          ["", "使用 API 預設（目前為高）"],
          ["none", "關閉（使用溫度）"],
          ["low", "低"],
          ["high", "高"],
          ["max", "最大"]
        ],
        help: "只套用於 DeepSeek provider。選擇關閉後 CHAT_API_TEMPERATURE 才會生效；低／高／最大會開啟思考且忽略溫度。"
      },
      {
        key: "CHAT_API_REQUEST_TIMEOUT_MS",
        label: "API 請求逾時",
        type: "number",
        placeholder: "600000",
        help: "單位毫秒。600000 = 10 分鐘。舊版 DEEPSEEK_REQUEST_TIMEOUT_MS 會自動帶入。"
      },
      {
        key: "CHAT_API_MAX_TOKENS",
        label: "輸出 token 上限",
        type: "number",
        help: "選填。主聊天／大模型處理呼叫預設 32000，仍會受模型上限限制。"
      },
      {
        key: "CHAT_API_MAX_TOKENS_PARAM",
        label: "輸出 token 參數",
        type: "select",
        options: [
          ["max_tokens", "max_tokens"],
          ["max_completion_tokens", "max_completion_tokens"]
        ],
        help: "大多數 OpenAI-compatible API 使用 max_tokens；部分 OpenAI 新模型可改用 max_completion_tokens。"
      },
      {
        key: "CHAT_API_TEMPERATURE",
        label: "溫度",
        type: "number",
        placeholder: "0.5",
        min: "0",
        max: "2",
        step: "0.1",
        inputMode: "decimal",
        help: "選填，可設定 0 至 2（支援 0.1 等小數）。DeepSeek 只有關閉思考模式時才會套用；留空時一般對話使用 0.5，寫卡助手使用 0.9。"
      }
    ]
  },
  {
    title: "網頁顯示",
    description: "控制本地網頁對話面板的名字與頭像。名字可使用 {{user}} 與 {{chur}}。",
    fields: [
      {
        key: "WEB_USER_NAME_TEMPLATE",
        label: "使用者名字模板",
        type: "text",
        placeholder: "{{user}}",
        help: "預設 {{user}}，會套用使用者設定的稱呼。"
      },
      {
        key: "WEB_AI_NAME_TEMPLATE",
        label: "AI 名字模板",
        type: "text",
        placeholder: "{{chur}}",
        help: "預設 {{chur}}，會套用目前角色卡名字。"
      },
      {
        key: "WEB_USER_AVATAR_IMAGE",
        label: "使用者頭像",
        type: "image",
        help: "選擇本機圖片後會裁切並保存成頭像資料；留空時使用文字頭像。"
      },
      {
        key: "WEB_AI_AVATAR_IMAGE",
        label: "AI 頭像",
        type: "image",
        help: "選擇本機圖片後會裁切並保存成頭像資料；留空時使用角色卡封面。"
      },
      {
        key: "WEB_BACKGROUND_IMAGE",
        label: "背景圖片",
        type: "image",
        crop: false,
        emptyText: "未設定背景",
        help: "選擇本機圖片後會壓縮並保存成背景資料；留空時使用預設靜態背景。"
      },
      {
        key: "WEB_DAILY_WELCOME_AUDIO",
        label: "每日第一次開啟語音",
        type: "text",
        placeholder: "/assets/audio/welcome-back.mp3",
        help: "每天第一次開啟網頁時播放。留空時使用內建 welcome-back.mp3；瀏覽器若阻擋自動播放，會等第一次點擊或按鍵後播放。"
      }
    ]
  },
  {
    title: "NovelAI 跑圖",
    description: "NovelAI API Token 只會存在本地 .env，由後端代為呼叫圖片 API。",
    fields: [
      {
        key: "NOVELAI_API_TOKEN",
        label: "NovelAI API Token",
        type: "password",
        autocomplete: "off",
        help: "填入 NovelAI Persistent API Token；不會保存到任何預設。"
      },
      {
        key: "NOVELAI_IMAGE_API_BASE_URL",
        label: "圖片 API Base URL",
        type: "text",
        placeholder: "https://image.novelai.net",
        help: "一般不用改。圖片生成會呼叫 /ai/generate-image。"
      },
      {
        key: "NOVELAI_PRIMARY_API_BASE_URL",
        label: "主 API Base URL",
        type: "text",
        placeholder: "https://api.novelai.net",
        help: "一般不用改。餘額會從 NovelAI 訂閱資料讀取。"
      },
      {
        key: "NOVELAI_REQUEST_TIMEOUT_MS",
        label: "NovelAI 請求逾時",
        type: "number",
        placeholder: "600000",
        help: "單位毫秒。生成大圖時可以保持 600000 或更高。"
      }
    ]
  },
  {
    title: "回覆行為",
    fields: [
      {
        key: "AI_MIN_REPLY_CHARS",
        label: "最少可見字數",
        type: "number",
        placeholder: "600",
        help: "最終回覆太短時會觸發提示或補救流程。"
      }
    ]
  }
];
const ENV_ALIAS_KEYS = {
  CHAT_API_KEY: ["CONVERSATION_API_KEY", "DEEPSEEK_API_KEY", "OPENAI_API_KEY", "GEMINI_API_KEY"],
  CHAT_API_KEY2: ["CONVERSATION_API_KEY2", "DEEPSEEK_API_KEY2", "DEEPSEEK_KEY2", "deepseek_key2"],
  CHAT_API_MODEL: ["CONVERSATION_API_MODEL", "DEEPSEEK_MODEL", "OPENAI_MODEL", "GEMINI_MODEL"],
  CHAT_API_BASE_URL: ["CONVERSATION_API_BASE_URL", "DEEPSEEK_BASE_URL"],
  CHAT_API_REQUEST_TIMEOUT_MS: ["CHAT_API_TIMEOUT_MS", "CONVERSATION_API_TIMEOUT_MS", "DEEPSEEK_REQUEST_TIMEOUT_MS"],
  CHAT_API_MAX_TOKENS: ["CONVERSATION_API_MAX_TOKENS", "DEEPSEEK_MAX_TOKENS"],
  CHAT_API_MAX_TOKENS_PARAM: ["CONVERSATION_API_MAX_TOKENS_PARAM"],
  CHAT_API_TEMPERATURE: ["CONVERSATION_API_TEMPERATURE"],
  WEB_USER_NAME_TEMPLATE: ["CHAT_USER_NAME_TEMPLATE"],
  WEB_AI_NAME_TEMPLATE: ["CHAT_AI_NAME_TEMPLATE"],
  WEB_USER_AVATAR_IMAGE: ["WEB_USER_AVATAR_URL", "CHAT_USER_AVATAR_URL"],
  WEB_AI_AVATAR_IMAGE: ["WEB_AI_AVATAR_URL", "CHAT_AI_AVATAR_URL"],
  WEB_BACKGROUND_IMAGE: ["WEB_BACKGROUND_URL"],
  NOVELAI_API_TOKEN: ["NOVELAI_ACCESS_TOKEN", "NOVELAI_TOKEN", "NAI_API_TOKEN"]
};
const ENV_KNOWN_KEYS = new Set(ENV_FIELD_GROUPS.flatMap((group) => group.fields.map((field) => field.key)));
Object.values(ENV_ALIAS_KEYS).flat().forEach((key) => ENV_KNOWN_KEYS.add(key));
const ENV_DROPPED_KEYS = new Set([
  "AI_REPLY_LENGTH_RULE",
  "DEEPSEEK_MODEL",
  "DEEPSEEK_BASE_URL",
  "DEEPSEEK_CALL_MODE",
  "DEEPSEEK_DIALOGUE_CONTEXT_ROUNDS",
  "DEEPSEEK_CHAT_MAX_TOKENS",
  "AI_REASONER_HISTORY_SYSTEM_PROMPT_FILE",
  "AI_STATE_PREP_SYSTEM_PROMPT_FILE",
  "CHARACTER_CARD_CREATION_ASSISTANT_PROMPT_FILE",
  "CONTEXT_COMPRESSION_PROMPT_FILE",
  "CHARACTER_CARD_CREATION_ASSISTANT_PROMPT",
  "CONTEXT_COMPRESSION_PROMPT"
]);
let uiLanguage = readStoredUiLanguage();
let uiLanguageObserver = null;
const uiLanguageTextOriginals = new WeakMap();
const uiLanguageAttrOriginals = new WeakMap();

function normalizeUiLanguage(value = "") {
  return value === UI_LANGUAGE_SIMPLIFIED ? UI_LANGUAGE_SIMPLIFIED : UI_LANGUAGE_TRADITIONAL;
}

function readStoredUiLanguage() {
  try {
    return normalizeUiLanguage(window.localStorage?.getItem(UI_LANGUAGE_STORAGE_KEY));
  } catch {
    return UI_LANGUAGE_TRADITIONAL;
  }
}

function saveUiLanguagePreference() {
  try {
    window.localStorage?.setItem(UI_LANGUAGE_STORAGE_KEY, uiLanguage);
  } catch {
    // The UI language still works for this page even if storage is unavailable.
  }
}

function toSimplifiedUiText(value = "") {
  let output = String(value || "");
  UI_T2S_PHRASES.forEach(([traditional, simplified]) => {
    output = output.split(traditional).join(simplified);
  });
  return Array.from(output, (char) => UI_T2S_CHARS[char] || char).join("");
}

function getUiLanguageText(traditionalText = "") {
  return uiLanguage === UI_LANGUAGE_SIMPLIFIED ? toSimplifiedUiText(traditionalText) : traditionalText;
}

function shouldSkipUiLanguageTextNode(node) {
  const parent = node?.parentElement;
  return !parent || !node.nodeValue.trim() || Boolean(parent.closest(UI_LANGUAGE_SKIP_TEXT_SELECTOR));
}

function shouldSkipUiLanguageAttributes(element) {
  return !element || Boolean(element.closest(UI_LANGUAGE_SKIP_ATTR_SELECTOR));
}

function shouldTranslateUiValueAttribute(element) {
  if (element?.tagName !== "INPUT") {
    return false;
  }
  return ["button", "submit", "reset"].includes(String(element.type || "").toLowerCase());
}

function translateUiTextNode(node, options = {}) {
  if (shouldSkipUiLanguageTextNode(node)) {
    return;
  }
  if (options.captureOriginal || !uiLanguageTextOriginals.has(node)) {
    uiLanguageTextOriginals.set(node, node.nodeValue);
  }
  const original = uiLanguageTextOriginals.get(node) || "";
  node.nodeValue = uiLanguage === UI_LANGUAGE_SIMPLIFIED ? toSimplifiedUiText(original) : original;
}

function translateUiElementAttributes(element, options = {}) {
  if (!(element instanceof Element) || shouldSkipUiLanguageAttributes(element)) {
    return;
  }
  let originals = uiLanguageAttrOriginals.get(element);
  if (!originals) {
    originals = {};
    uiLanguageAttrOriginals.set(element, originals);
  }
  UI_LANGUAGE_TEXT_ATTRS.forEach((attr) => {
    if (!element.hasAttribute(attr)) {
      return;
    }
    if (attr === "value" && !shouldTranslateUiValueAttribute(element)) {
      return;
    }
    if (options.captureOriginal || originals[attr] === undefined) {
      originals[attr] = element.getAttribute(attr) || "";
    }
    const original = originals[attr] || "";
    element.setAttribute(attr, uiLanguage === UI_LANGUAGE_SIMPLIFIED ? toSimplifiedUiText(original) : original);
  });
}

function translateUiLanguageWithin(root, options = {}) {
  if (!root) {
    return;
  }
  if (root.nodeType === Node.TEXT_NODE) {
    translateUiTextNode(root, options);
    return;
  }
  if (!(root instanceof Element) && root.nodeType !== Node.DOCUMENT_NODE) {
    return;
  }

  const rootElement = root instanceof Element ? root : null;
  if (rootElement) {
    translateUiElementAttributes(rootElement, options);
  }

  const elementWalker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  let elementNode = elementWalker.nextNode();
  while (elementNode) {
    translateUiElementAttributes(elementNode, options);
    elementNode = elementWalker.nextNode();
  }

  const textWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = textWalker.nextNode();
  while (textNode) {
    translateUiTextNode(textNode, options);
    textNode = textWalker.nextNode();
  }
}

function observeUiLanguageMutations() {
  if (!uiLanguageObserver) {
    return;
  }
  uiLanguageObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: UI_LANGUAGE_TEXT_ATTRS
  });
}

function withUiLanguageObserverPaused(callback) {
  uiLanguageObserver?.disconnect();
  callback();
  observeUiLanguageMutations();
}

function updateUiLanguageToggleButton() {
  if (!el.uiLanguageToggleBtn) {
    return;
  }
  const label = uiLanguage === UI_LANGUAGE_SIMPLIFIED ? "简繁转换：简体" : "簡繁轉換：繁體";
  el.uiLanguageToggleBtn.textContent = label;
  el.uiLanguageToggleBtn.setAttribute("aria-pressed", uiLanguage === UI_LANGUAGE_SIMPLIFIED ? "true" : "false");
  el.uiLanguageToggleBtn.setAttribute("title", getUiLanguageText("點擊切換簡體 / 繁體 UI"));
}

function applyUiLanguage() {
  document.documentElement.lang = uiLanguage;
  withUiLanguageObserverPaused(() => {
    translateUiLanguageWithin(document.documentElement);
    updateUiLanguageToggleButton();
  });
}

function handleUiLanguageMutations(mutations = []) {
  withUiLanguageObserverPaused(() => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        translateUiTextNode(mutation.target, { captureOriginal: true });
        return;
      }
      if (mutation.type === "attributes") {
        translateUiElementAttributes(mutation.target, { captureOriginal: true });
        return;
      }
      mutation.addedNodes.forEach((node) => {
        translateUiLanguageWithin(node, { captureOriginal: true });
      });
    });
    updateUiLanguageToggleButton();
  });
}

function initUiLanguageToggle() {
  if ("MutationObserver" in window) {
    uiLanguageObserver = new MutationObserver(handleUiLanguageMutations);
  }
  if (el.uiLanguageToggleBtn) {
    el.uiLanguageToggleBtn.addEventListener("click", () => {
      uiLanguage = uiLanguage === UI_LANGUAGE_SIMPLIFIED ? UI_LANGUAGE_TRADITIONAL : UI_LANGUAGE_SIMPLIFIED;
      saveUiLanguagePreference();
      applyUiLanguage();
      showToast(uiLanguage === UI_LANGUAGE_SIMPLIFIED ? "已切換為簡體 UI" : "已切換為繁體 UI");
    });
  }
  applyUiLanguage();
}

function isChatApiProcessingKeyName(key = "") {
  const match = String(key || "").trim().match(/^CHAT_API_KEY([2-9]\d*)$/u);
  return Boolean(match && Number(match[1]) >= 2);
}

function isManagedEnvKey(key = "") {
  return ENV_KNOWN_KEYS.has(key) || isChatApiProcessingKeyName(key);
}

function normalizeRoleCardMode(mode = "") {
  const normalized = String(mode)
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  if (normalized === "multi") {
    return "multi";
  }
  if (normalized === "no_role" || normalized === "norole" || normalized === "none") {
    return "no_role";
  }
  return normalized || DEFAULT_ROLE_CARD_MODE;
}

function normalizeLorebookProbability(value, fallback = 100) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  const normalized = Number(value);
  if (!Number.isFinite(normalized)) {
    return fallback;
  }
  return Math.max(0, Math.min(100, Math.floor(normalized)));
}

function getRoleCardModeLabel(card) {
  return getPromptModeDisplayName(normalizeRoleCardMode(card?.mode));
}

function normalizeRoleCardLorebookEntry(entry = {}) {
  const source = entry && typeof entry === "object" ? entry : {};
  const content = String(source.content || source.text || source.內容 || "").trim();
  const keywords = dedupeTextList(parseTermInput(source.keywords ?? source.keyword ?? source.keys ?? source.關鍵字 ?? source["关键词"] ?? ""));
  const secondaryKeywords = dedupeTextList(
    parseTermInput(source.secondaryKeywords ?? source.secondaryKeyword ?? source.secondary_keys ?? source.secondaryKeys ?? source["第二關鍵字"] ?? source["第二关键词"] ?? "")
  );
  const permanent = Boolean(
    source.permanent ??
    source.constant ??
    source.alwaysActive ??
    source.always_active ??
    source.activation?.permanent
  );
  const probability = normalizeLorebookProbability(
    source.probability ?? source.activation?.probability ?? source.extensions?.probability,
    100
  );
  const key = String(
    source.key ||
    source.title ||
    source.name ||
    source.comment ||
    source.標題 ||
    source.名稱 ||
    getFirstMarkdownHeading(content) ||
    keywords[0] ||
    ""
  ).trim();
  const activation = source.activation && typeof source.activation === "object" ? source.activation : {};
  return {
    id: String(source.id || `lore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim(),
    expanded: Boolean(source.expanded),
    key,
    keywords,
    secondaryKeywords,
    content,
    enabled: source.enabled !== false,
    permanent,
    probability,
    activation: {
      activeTurns: 0,
      onCloseActivate: []
    }
  };
}

function normalizeRoleCardCustomSection(section = {}) {
  const source = section && typeof section === "object" ? section : {};
  return {
    id: String(source.id || `section_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim(),
    name: String(source.name || source.title || "").trim(),
    content: String(source.content || source.text || "").trim(),
    enabled: source.enabled !== false,
    includeInImagePrompt: source.includeInImagePrompt === true ||
      source.imagePrompt === true ||
      source.drawPrompt === true ||
      source.includeInDrawing === true ||
      source.useForImagePrompt === true
  };
}

function getLegacyRoleCardCustomSections(card = {}) {
  return [
    { name: "性格", content: card.personality || "" },
    { name: "場景", content: card.scene || card.scenario || "" },
    { name: "系統指令", content: card.systemInstruction || card.system_prompt || "" },
    { name: "詳細描述", content: card.description || "" },
    { name: "人物關係（純文字）", content: card.relationships || "" },
    { name: "後續指示", content: card.post_history_instructions || "" },
    { name: "範例對話", content: card.mes_example || "" },
    { name: "創作者備註", content: card.creator_notes || "" }
  ]
    .filter((item) => String(item.content || "").trim())
    .map((item) => normalizeRoleCardCustomSection(item));
}

function normalizeRoleCardCustomSections(value, card = {}) {
  const sections = Array.isArray(value)
    ? value.map((item) => normalizeRoleCardCustomSection(item)).filter((item) => item.name || item.content)
    : [];
  return sections.length > 0 ? sections : getLegacyRoleCardCustomSections(card);
}

function normalizeCompressionModelConfig(model = {}, index = 0) {
  const source = model && typeof model === "object" ? model : {};
  const rawId = String(source.id || source.key || source.name || `CompressionModel${index + 1}`).trim();
  const id = rawId.replace(/[^a-zA-Z0-9_]/g, "_").replace(/^_+|_+$/g, "") || `CompressionModel${index + 1}`;
  return {
    id,
    name: String(source.name || source.title || id).trim(),
    addRules: String(source.addRules || source.addRule || source.rules || "").trim(),
    deleteRules: String(source.deleteRules || source.deleteRule || "").trim()
  };
}

function normalizeContextCompressionConfig(config = {}, fallbackPrompt = "", options = {}) {
  const source = config && typeof config === "object" ? config : {};
  const allowEmptyModels = Boolean(options.allowEmptyModels);
  const allowEmptyMainRules = Boolean(options.allowEmptyMainRules);
  const hasExplicitMainRules = ["mainRules", "prompt", "contextCompressionPrompt"]
    .some((key) => Object.prototype.hasOwnProperty.call(source, key));
  const mainRules = String(source.mainRules ?? source.prompt ?? source.contextCompressionPrompt ?? "").trim();
  const models = Array.isArray(source.models)
    ? source.models.map((item, index) => normalizeCompressionModelConfig(item, index)).filter((item) => item.id)
    : [];
  return {
    mainRules: allowEmptyMainRules && hasExplicitMainRules
      ? mainRules
      : String(mainRules || fallbackPrompt || "").trim(),
    models: models.length > 0
      ? models
      : allowEmptyModels
        ? []
        : [
          normalizeCompressionModelConfig({
            id: "PlotProgression",
            name: "劇情狀態",
            addRules: "保存已成立的劇情進展、角色關係變化、重要場景狀態與未完成事項。",
            deleteRules: "刪除已失效、已完成、被新版取代或重複的舊劇情狀態。"
          })
        ]
  };
}

function hasExplicitEmptyCompressionModels(config = {}) {
  const source = config && typeof config === "object" ? config : {};
  return Array.isArray(source.models) && source.models.length === 0;
}

function normalizeCompressionProfileId(value = "") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || STANDARD_COMPRESSION_PROFILE_ID;
}

function getDefaultCompressionProfileName(id = STANDARD_COMPRESSION_PROFILE_ID) {
  return normalizeCompressionProfileId(id) === STANDARD_COMPRESSION_PROFILE_ID
    ? "標準壓縮模型"
    : String(id || "自訂壓縮模型").trim();
}

function normalizeDialogueContextRounds(value, fallback = 20) {
  const normalized = Number(value);
  const fallbackNumber = Number(fallback);
  return Number.isFinite(normalized) && normalized > 0
    ? Math.floor(normalized)
    : Number.isFinite(fallbackNumber) && fallbackNumber > 0
      ? Math.floor(fallbackNumber)
      : 20;
}

function parseIntegerList(value = "") {
  const normalizeListItem = (item) => item === null || item === undefined ? "" : String(item).trim();
  if (Array.isArray(value)) {
    return [...new Set(value
      .map((item) => normalizeListItem(item))
      .filter(Boolean)
      .map((item) => Math.floor(Number(item)))
      .filter((item) => Number.isFinite(item) && item >= 0))]
      .sort((a, b) => a - b);
  }
  return [...new Set(String(value || "")
    .split(/[\s,，、;；]+/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Math.floor(Number(item)))
    .filter((item) => Number.isFinite(item) && item >= 0))]
    .sort((a, b) => a - b);
}

function parseKeywordList(value = "") {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[\n,，、;；]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeKeywordTriggerSource(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return ["user", "assistant", "both"].includes(normalized) ? normalized : "both";
}

function normalizeCompressionContextScope(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (
    normalized === COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT ||
    normalized === "role_text" ||
    normalized === "role_card" ||
    normalized === "character_card" ||
    normalized === "card_and_text" ||
    normalized === "角色卡_正文" ||
    normalized === "角色卡+正文"
  ) {
    return COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT;
  }
  return COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY;
}

function normalizeCompressionTriggerConfig(input = {}, options = {}) {
  const source = input && typeof input === "object" ? input : {};
  return {
    everyTurn: Boolean(source.everyTurn ?? source.eachTurn ?? source.everyRound ?? source.onEveryTurn),
    roundLimit: Boolean(source.roundLimit ?? source.onRoundLimit ?? options.defaultRoundLimit),
    keywords: parseKeywordList(source.keywords ?? source.keyword ?? source.triggerKeywords),
    keywordSource: normalizeKeywordTriggerSource(source.keywordSource || source.source),
    turns: parseIntegerList(source.turns ?? source.scheduledTurns ?? source.rounds)
  };
}

function normalizeModelTriggerAction(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (
    normalized === MODEL_TRIGGER_ACTION_COPY_USER_INPUT ||
    normalized === "copy" ||
    normalized === "copy_user" ||
    normalized === "paste_user_input" ||
    normalized === "direct_copy"
  ) {
    return MODEL_TRIGGER_ACTION_COPY_USER_INPUT;
  }
  return MODEL_TRIGGER_ACTION_CALL_API;
}

function getModelTriggerActionLabel(value = "") {
  return normalizeModelTriggerAction(value) === MODEL_TRIGGER_ACTION_COPY_USER_INPUT
    ? "複製用戶輸入（不call api）"
    : "call api（使用本大模型規則＋模塊）";
}

function normalizeKeywordFollowupAction(value = "", legacySkipReasoner = false) {
  const raw = String(value || "").trim();
  const normalized = raw.toLowerCase().replace(/[-\s]+/g, "_");
  if (
    normalized === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL ||
    normalized === "stop" ||
    normalized === "stop_reasoner" ||
    normalized === "skip_reasoner" ||
    normalized === "no_reasoner" ||
    raw === "停下" ||
    raw === "不call正文" ||
    raw === "只輸出完成訊息"
  ) {
    return KEYWORD_FOLLOWUP_STOP_AFTER_MODEL;
  }
  if (
    normalized === KEYWORD_FOLLOWUP_IMAGE_ONLY ||
    normalized === "image_no_reasoner" ||
    normalized === "image_without_reasoner" ||
    raw === "跑圖不跑正文" ||
    raw === "跑圖不跑正文完全停止正文"
  ) {
    return KEYWORD_FOLLOWUP_IMAGE_ONLY;
  }
  if (
    normalized === KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER ||
    normalized === "image_parallel" ||
    normalized === "parallel_image" ||
    normalized === "generate_image_parallel" ||
    normalized === "image_then_reasoner" ||
    normalized === "image_then_continue" ||
    normalized === "generate_image_continue" ||
    normalized === "image_continue" ||
    raw === "建立圖片並行運作" ||
    raw === "建立圖片並行" ||
    raw === "並行建立圖片" ||
    raw === "建立圖片繼續觸發正文" ||
    raw === "建立圖片，繼續觸發正文"
  ) {
    return KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER;
  }
  if (
    normalized === KEYWORD_FOLLOWUP_CONTINUE_REASONER ||
    normalized === "continue" ||
    normalized === "continue_chat" ||
    normalized === "call_reasoner" ||
    raw === "繼續" ||
    raw === "繼續觸發正文"
  ) {
    return KEYWORD_FOLLOWUP_CONTINUE_REASONER;
  }
  return legacySkipReasoner ? KEYWORD_FOLLOWUP_STOP_AFTER_MODEL : KEYWORD_FOLLOWUP_CONTINUE_REASONER;
}

function isImageKeywordFollowupAction(value = "") {
  const normalized = normalizeKeywordFollowupAction(value);
  return normalized === KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER ||
    normalized === KEYWORD_FOLLOWUP_IMAGE_ONLY;
}

function isImageOnlyKeywordFollowupAction(value = "") {
  return normalizeKeywordFollowupAction(value) === KEYWORD_FOLLOWUP_IMAGE_ONLY;
}

function getKeywordFollowupActionLabel(value = "", legacySkipReasoner = false) {
  const normalized = normalizeKeywordFollowupAction(value, legacySkipReasoner);
  if (normalized === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL) {
    return "關鍵字後停下";
  }
  if (normalized === KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER) {
    return "關鍵字後並行建立圖片";
  }
  if (normalized === KEYWORD_FOLLOWUP_IMAGE_ONLY) {
    return "跑圖不跑正文";
  }
  return "";
}

function parseBoundedNumber(value, fallback, min, max) {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, min, max);
}

function parseBoundedInteger(value, fallback, min, max) {
  return Math.floor(parseBoundedNumber(value, fallback, min, max));
}

function normalizeModelImageGenerationSettings(input = {}) {
  const source = input && typeof input === "object"
    ? input.imageGeneration || input.novelAiImage || input.imageSettings || input
    : {};
  const rawSeed = String(source.seed ?? "").trim();
  const seedNumber = Number(rawSeed);
  return {
    model: String(source.model || "nai-diffusion-4-5-curated").trim() || "nai-diffusion-4-5-curated",
    negativePrompt: String(source.negativePrompt || source.negative_prompt || source.uc || "").trim(),
    width: parseBoundedInteger(source.width, 832, 64, 2048),
    height: parseBoundedInteger(source.height, 1216, 64, 2048),
    steps: parseBoundedInteger(source.steps, 28, 1, 50),
    samples: parseBoundedInteger(source.samples ?? source.n_samples, 1, 1, 4),
    scale: parseBoundedNumber(source.scale ?? source.guidance ?? source.promptGuidance, 6, 0, 20),
    cfgRescale: parseBoundedNumber(source.cfgRescale ?? source.cfg_rescale ?? source.promptGuidanceRescale, 0, 0, 1),
    sampler: String(source.sampler || "k_euler_ancestral").trim() || "k_euler_ancestral",
    noiseSchedule: String(source.noiseSchedule || source.noise_schedule || "karras").trim() || "karras",
    ucPreset: parseBoundedInteger(source.ucPreset, 0, 0, 99),
    varietyPlus: Boolean(source.varietyPlus || source.skipCfgAboveSigma),
    imageFormat: String(source.imageFormat || source.image_format || "png").trim().toLowerCase() === "webp" ? "webp" : "png",
    seed: rawSeed && Number.isFinite(seedNumber) && seedNumber >= 0 ? String(Math.floor(seedNumber) >>> 0) : ""
  };
}

function normalizeModelAppendPlayer(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!normalized) {
    return "";
  }
  const numberMatch = normalized.match(/^(?:user|玩家)?(\d+)$/u);
  if (numberMatch) {
    return `user${Math.max(1, Math.floor(Number(numberMatch[1])))}`;
  }
  if (normalized === "x" || normalized === "userx" || normalized === "other" || normalized === "others") {
    return MODEL_APPEND_PLAYER_OTHER;
  }
  return "";
}

function normalizeModelAppendTermConfig(term = {}, index = 0) {
  const source = term && typeof term === "object" ? term : {};
  const player = source.player ?? source.target ?? source.user ?? source.slot ?? "";
  return {
    id: String(source.id || source.key || `append_term_${index + 1}`).trim(),
    enabled: source.enabled !== false,
    player: normalizeModelAppendPlayer(player),
    content: String(source.content || source.text || source.appendText || source.prompt || "").trim(),
    expanded: Boolean(source.expanded)
  };
}

function normalizeModelAppendTermsConfig(input = {}) {
  const rawTerms = Array.isArray(input)
    ? input
    : Array.isArray(input?.appendTerms)
      ? input.appendTerms
      : Array.isArray(input?.playerAppendTerms)
        ? input.playerAppendTerms
        : [];
  return rawTerms.map((item, index) => normalizeModelAppendTermConfig(item, index));
}

function normalizeCompressionTriggerActionConfig(action = {}, index = 0, options = {}) {
  const source = action && typeof action === "object" ? action : {};
  const processingAction = normalizeModelTriggerAction(source.action || source.processingAction || source.afterTriggerAction);
  const legacySkipReasoner = Boolean(source.skipReasoner || source.skipResponse || source.noReasoner || source.skipChat);
  const keywordFollowupAction = normalizeKeywordFollowupAction(
    source.keywordFollowupAction ||
      source.keywordFollowup ||
      source.afterKeywordAction ||
      source.keywordAfterAction ||
      source["觸發關鍵字後續動作"],
    legacySkipReasoner
  );
  const triggers = normalizeCompressionTriggerConfig(
    source.triggers || source.trigger || source.conditions || source.condition || source,
    { defaultRoundLimit: Boolean(options.defaultRoundLimit) }
  );
  if (isImageOnlyKeywordFollowupAction(keywordFollowupAction)) {
    triggers.keywordSource = "user";
  }
  return {
    id: String(source.id || source.key || `trigger_action_${index + 1}`).trim(),
    name: String(source.name || source.title || source.label || `觸發組合 ${index + 1}`).trim(),
    enabled: source.enabled !== false,
    action: processingAction,
    keywordFollowupAction,
    skipReasoner: processingAction === MODEL_TRIGGER_ACTION_CALL_API &&
      (
        keywordFollowupAction === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL ||
        keywordFollowupAction === KEYWORD_FOLLOWUP_IMAGE_ONLY
      ),
    imageGeneration: normalizeModelImageGenerationSettings(source),
    triggers,
    expanded: Boolean(source.expanded)
  };
}

function normalizeCompressionTriggerActionsConfig(input = {}, options = {}) {
  const rawActions = Array.isArray(input)
    ? input
    : Array.isArray(input?.triggerActions)
      ? input.triggerActions
      : Array.isArray(input?.actions)
        ? input.actions
        : Array.isArray(input?.rules)
          ? input.rules
          : [];
  const legacyTriggers = options.legacyTriggers && typeof options.legacyTriggers === "object"
    ? options.legacyTriggers
    : {};
  const fallbackAction = {
    id: "default",
    name: options.defaultName || "標準觸發",
    enabled: true,
    action: MODEL_TRIGGER_ACTION_CALL_API,
    keywordFollowupAction: KEYWORD_FOLLOWUP_CONTINUE_REASONER,
    skipReasoner: false,
    triggers: Object.keys(legacyTriggers).length > 0
      ? legacyTriggers
      : { roundLimit: Boolean(options.defaultRoundLimit) }
  };
  const sourceActions = rawActions.length > 0 ? rawActions : [fallbackAction];
  return sourceActions.map((item, index) => normalizeCompressionTriggerActionConfig(item, index, {
    defaultRoundLimit: Boolean(options.defaultRoundLimit) && rawActions.length === 0
  }));
}

function createStandardCompressionProfile(contextCompression = {}) {
  return {
    id: STANDARD_COMPRESSION_PROFILE_ID,
    name: "標準壓縮模型",
    enabled: true,
    locked: true,
    contextScope: COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY,
    triggers: normalizeCompressionTriggerConfig({ roundLimit: true }, { defaultRoundLimit: true }),
    triggerActions: normalizeCompressionTriggerActionsConfig([], {
      defaultRoundLimit: true,
      defaultName: "標準壓縮"
    }),
    appendTerms: [],
    contextCompression: normalizeContextCompressionConfig(contextCompression, appState?.contextCompressionPrompt || "", {
      allowEmptyModels: hasExplicitEmptyCompressionModels(contextCompression)
    })
  };
}

function normalizeCompressionProfileConfig(profile = {}, index = 0, fallbackContextCompression = {}) {
  const source = profile && typeof profile === "object" ? profile : {};
  const id = normalizeCompressionProfileId(source.id || source.key || source.name || `compression_profile_${index + 1}`);
  const isStandard = id === STANDARD_COMPRESSION_PROFILE_ID;
  const triggerActions = normalizeCompressionTriggerActionsConfig(source.triggerActions || source.actions || source.triggerRules || [], {
    defaultRoundLimit: isStandard,
    defaultName: isStandard ? "標準壓縮" : "觸發組合 1",
    legacyTriggers: source.triggers || source.trigger || {}
  });
  return {
    id,
    name: String(source.name || source.title || source.displayName || getDefaultCompressionProfileName(id)).trim(),
    enabled: isStandard ? true : source.enabled !== false,
    locked: isStandard || Boolean(source.locked),
    contextScope: normalizeCompressionContextScope(
      source.contextScope || source.contextSource || source.readingScope || source.scope
    ),
    triggers: triggerActions[0]?.triggers ||
      normalizeCompressionTriggerConfig(source.triggers || source.trigger || {}, { defaultRoundLimit: isStandard }),
    triggerActions,
    appendTerms: normalizeModelAppendTermsConfig(source.appendTerms || source.playerAppendTerms || []),
    contextCompression: normalizeContextCompressionConfig(
      source.contextCompression || source.compression || fallbackContextCompression,
      fallbackContextCompression?.mainRules || appState?.contextCompressionPrompt || "",
      {
        allowEmptyModels: !isStandard ||
          hasExplicitEmptyCompressionModels(source.contextCompression || source.compression || fallbackContextCompression),
        allowEmptyMainRules: !isStandard
      }
    )
  };
}

function normalizeCompressionProfilesConfig(config = {}) {
  const standardContextCompression = normalizeContextCompressionConfig(
    config.contextCompression || { mainRules: config.contextCompressionPrompt },
    config.contextCompressionPrompt || appState?.contextCompressionPrompt || "",
    { allowEmptyModels: hasExplicitEmptyCompressionModels(config.contextCompression) }
  );
  const profiles = Array.isArray(config.compressionProfiles) ? config.compressionProfiles : [];
  const byId = new Map([[STANDARD_COMPRESSION_PROFILE_ID, createStandardCompressionProfile(standardContextCompression)]]);
  profiles.forEach((profile, index) => {
    const normalized = normalizeCompressionProfileConfig(profile, index, standardContextCompression);
    byId.set(normalized.id, normalized);
  });
  const standard = byId.get(STANDARD_COMPRESSION_PROFILE_ID) || createStandardCompressionProfile(standardContextCompression);
  byId.set(STANDARD_COMPRESSION_PROFILE_ID, {
    ...standard,
    id: STANDARD_COMPRESSION_PROFILE_ID,
    name: standard.name || "標準壓縮模型",
    enabled: true,
    locked: true,
    triggers: standard.triggerActions?.[0]?.triggers ||
      normalizeCompressionTriggerConfig(standard.triggers, { defaultRoundLimit: true }),
    triggerActions: normalizeCompressionTriggerActionsConfig(standard.triggerActions || [], {
      defaultRoundLimit: true,
      defaultName: "標準壓縮",
      legacyTriggers: standard.triggers
    })
  });
  return [
    byId.get(STANDARD_COMPRESSION_PROFILE_ID),
    ...Array.from(byId.values()).filter((profile) => profile.id !== STANDARD_COMPRESSION_PROFILE_ID)
  ];
}

function normalizeRoleCardCustomSectionsForEditor(value, card = {}) {
  const sections = Array.isArray(value)
    ? value.map((item) => normalizeRoleCardCustomSection(item))
    : [];
  return sections.length > 0 ? sections : getLegacyRoleCardCustomSections(card);
}

function normalizeRoleCardLorebooks(value) {
  return (Array.isArray(value) ? value : [])
    .map((item) => normalizeRoleCardLorebookEntry(item))
    .filter((item) => {
      return item.key || item.content || item.keywords.length > 0;
    });
}

function summarizeRoleCardLorebooks(value) {
  const lorebooks = normalizeRoleCardLorebooks(value);
  if (lorebooks.length === 0) {
    return "";
  }
  const enabledCount = lorebooks.filter((item) => item.enabled !== false).length;
  return `${enabledCount}/${lorebooks.length} 條`;
}

function getActivePromptMode(state) {
  const activeCard = (state?.roleCards || []).find((card) => card.id === state?.activeRoleCardId);
  return normalizeRoleCardMode(activeCard?.mode);
}

function isAssistantActive(state) {
  return Boolean(state?.activeAssistantMode);
}

function getAssistantCards(state = appState) {
  const cards = Array.isArray(state?.assistantCards) ? state.assistantCards : [];
  const hasDefault = cards.some((card) => card?.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE);
  const defaultCard = {
    id: CHARACTER_CARD_CREATION_ASSISTANT_MODE,
    name: DEFAULT_ASSISTANT_CARD_NAME,
    description: DEFAULT_ASSISTANT_CARD_DESCRIPTION,
    prompt: state?.characterCardCreationAssistantPrompt || "",
    locked: true
  };
  return hasDefault
    ? cards.map((card) => card?.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE ? { ...defaultCard, ...card, locked: true } : card)
    : [defaultCard, ...cards];
}

function getAssistantCardById(state = appState, assistantId = "") {
  return getAssistantCards(state).find((card) => card?.id === assistantId) || null;
}

function getActiveAssistantCard(state = appState) {
  return getAssistantCardById(state, state?.activeAssistantMode);
}

function getAssistantCardName(card = null) {
  return String(card?.name || DEFAULT_ASSISTANT_CARD_NAME).trim();
}

function getActiveAssistantName(state = appState) {
  return getAssistantCardName(getActiveAssistantCard(state));
}

function mergeDisplayedPersonality(basePersonality = "", runtimeAdditions = "") {
  const base = (basePersonality || "").trim();
  const additions = (runtimeAdditions || "").trim();
  if (!base) {
    return additions;
  }
  if (!additions) {
    return base;
  }
  return `${base}｜新增性格：${additions}`;
}

async function request(url, options = {}) {
  const finalOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {})
    }
  };

  const response = await fetch(url, finalOptions);
  const text = await response.text();
  const data = text ? safeParseJson(text) : {};

  if (!response.ok) {
    const error = new Error(data?.error || `請求失敗(${response.status})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function requestChatStream(content, handlers = {}) {
  const response = await fetch("/api/chat/send-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ content })
  });

  if (!response.ok) {
    const text = await response.text();
    const data = text ? safeParseJson(text) : {};
    throw new Error(data?.error || `請求失敗(${response.status})`);
  }

  const reader = response.body?.getReader?.();
  if (!reader) {
    throw new Error("瀏覽器不支援即時讀取回覆。");
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const processLine = (line) => {
    const trimmed = String(line || "").trim();
    if (!trimmed) {
      return;
    }
    const event = safeParseJson(trimmed);
    if (!event || typeof event !== "object") {
      return;
    }
    handlers.onEvent?.(event);
    if (event.type === "error") {
      throw new Error(event.error || "生成失敗。");
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex);
      buffer = buffer.slice(newlineIndex + 1);
      processLine(line);
      newlineIndex = buffer.indexOf("\n");
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    processLine(buffer);
  }
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function decodeHtmlEntities(value = "") {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value;
}

function decodeEscapedHtmlTags(html = "") {
  return String(html || "").replace(/&lt;(\/?)([a-zA-Z][\w:-]*)([\s\S]*?)&gt;/g, (_, closingSlash, tagName, rawAttrs) => {
    return `<${closingSlash}${tagName}${decodeHtmlEntities(rawAttrs)}>`;
  });
}

const ALLOWED_MESSAGE_HTML_TAGS = new Set([
  "a", "abbr", "article", "aside", "b", "blockquote", "br", "caption", "code", "del",
  "details", "div", "em", "figcaption", "figure", "footer", "h1", "h2", "h3", "h4", "h5",
  "h6", "header", "hr", "i", "img", "kbd", "li", "main", "mark", "ol", "p", "pre", "s",
  "section", "small", "span", "strong", "sub", "summary", "sup", "table", "tbody", "td",
  "tfoot", "th", "thead", "tr", "u", "ul"
]);

const DROP_MESSAGE_HTML_TAGS = new Set(["script", "style", "iframe", "object", "embed", "form", "input", "button", "textarea", "select", "option", "meta", "link"]);
const GLOBAL_MESSAGE_HTML_ATTRS = new Set(["class", "title", "aria-label", "role"]);
const MESSAGE_HTML_ATTRS_BY_TAG = {
  a: new Set(["href"]),
  img: new Set(["src", "alt", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
  details: new Set(["open"])
};
const ALLOWED_MESSAGE_CSS_PROPS = new Set([
  "background", "background-color", "border", "border-color", "border-radius", "border-style",
  "border-width", "color", "display", "font-size", "font-style", "font-weight", "gap", "grid-template-columns",
  "line-height", "margin", "margin-bottom", "margin-left", "margin-right", "margin-top", "max-width",
  "min-width", "opacity", "padding", "padding-bottom", "padding-left", "padding-right", "padding-top",
  "text-align", "text-decoration", "white-space", "width"
]);

function isSafeMessageHref(value = "") {
  const href = String(value || "").trim();
  return /^(https?:|mailto:|tel:)/iu.test(href) || href.startsWith("#");
}

function isSafeMessageImageSrc(value = "") {
  const src = String(value || "").trim();
  return /^(https?:|data:image\/(?:png|jpe?g|gif|webp);base64,)/iu.test(src);
}

function sanitizeMessageStyle(value = "") {
  return String(value || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separatorIndex = part.indexOf(":");
      if (separatorIndex <= 0) {
        return "";
      }
      const prop = part.slice(0, separatorIndex).trim().toLowerCase();
      const cssValue = part.slice(separatorIndex + 1).trim();
      if (!ALLOWED_MESSAGE_CSS_PROPS.has(prop)) {
        return "";
      }
      if (/url\s*\(|expression\s*\(|javascript:|vbscript:/iu.test(cssValue)) {
        return "";
      }
      return `${prop}: ${cssValue}`;
    })
    .filter(Boolean)
    .join("; ");
}

function sanitizeMessageHtml(html = "") {
  const template = document.createElement("template");
  template.innerHTML = String(html || "");

  const cleanNode = (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node;
    const tag = element.tagName.toLowerCase();

    if (DROP_MESSAGE_HTML_TAGS.has(tag)) {
      element.remove();
      return;
    }

    if (!ALLOWED_MESSAGE_HTML_TAGS.has(tag)) {
      element.replaceWith(...Array.from(element.childNodes));
      return;
    }

    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value || "";
      const allowedForTag = MESSAGE_HTML_ATTRS_BY_TAG[tag]?.has(name);
      const allowedGlobal = GLOBAL_MESSAGE_HTML_ATTRS.has(name);

      if (name.startsWith("on") || name === "srcdoc") {
        element.removeAttribute(attr.name);
        return;
      }

      if (name === "style") {
        const cleanStyle = sanitizeMessageStyle(value);
        if (cleanStyle) {
          element.setAttribute("style", cleanStyle);
        } else {
          element.removeAttribute(attr.name);
        }
        return;
      }

      if (!allowedForTag && !allowedGlobal) {
        element.removeAttribute(attr.name);
        return;
      }

      if (tag === "a" && name === "href" && !isSafeMessageHref(value)) {
        element.removeAttribute(attr.name);
        return;
      }

      if (tag === "img" && name === "src" && !isSafeMessageImageSrc(value)) {
        element.removeAttribute(attr.name);
      }
    });

    if (tag === "a" && element.hasAttribute("href")) {
      element.setAttribute("target", "_blank");
      element.setAttribute("rel", "noopener noreferrer");
    }

    if (tag === "img") {
      element.setAttribute("loading", "lazy");
    }
  };

  Array.from(template.content.querySelectorAll("*")).forEach(cleanNode);
  return template.innerHTML;
}

function renderInlineMarkdown(text = "") {
  let output = escapeHtml(text);
  const codeSpans = [];
  output = output.replace(/`([^`\n]+?)`/g, (_, code) => {
    const token = `\u0000CODE${codeSpans.length}\u0000`;
    codeSpans.push(`<code>${code}</code>`);
    return token;
  });
  output = output.replace(/\[([^\]\n]+?)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, href) =>
    `<a href="${escapeAttribute(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`
  );
  output = output
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__([^_\n]+?)__/g, "<strong>$1</strong>")
    .replace(/~~([^~\n]+?)~~/g, "<del>$1</del>")
    .replace(/(^|[^\*])\*([^*\n]+?)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^_])_([^_\n]+?)_/g, "$1<em>$2</em>");
  codeSpans.forEach((html, index) => {
    output = output.replace(`\u0000CODE${index}\u0000`, html);
  });
  return output;
}

function renderMarkdownToHtml(markdown = "", options = {}) {
  const source = String(markdown || "");
  if (!source) {
    return "";
  }

  const codeBlocks = [];
  let text = source.replace(/```([a-zA-Z0-9_-]+)?\n?([\s\S]*?)```/g, (_, language, code) => {
    const token = `\u0000BLOCK${codeBlocks.length}\u0000`;
    const languageClass = language ? ` language-${escapeAttribute(language)}` : "";
    codeBlocks.push(`<pre><code class="${languageClass.trim()}">${escapeHtml(code.replace(/\n$/, ""))}</code></pre>`);
    return token;
  });

  const lines = text.split(/\r?\n/);
  const html = [];
  let listType = "";
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) {
      return;
    }
    html.push(`<p>${paragraph.map((line) => renderInlineMarkdown(line)).join("<br>")}</p>`);
    paragraph = [];
  };

  const closeList = () => {
    if (!listType) {
      return;
    }
    html.push(`</${listType}>`);
    listType = "";
  };

  lines.forEach((line) => {
    const blockMatch = line.match(/^\u0000BLOCK(\d+)\u0000$/);
    if (blockMatch) {
      flushParagraph();
      closeList();
      html.push(codeBlocks[Number(blockMatch[1])] || "");
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      closeList();
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = Math.min(6, headingMatch[1].length);
      html.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      return;
    }

    const quoteMatch = line.match(/^>\s?(.*)$/);
    if (quoteMatch) {
      flushParagraph();
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(quoteMatch[1])}</blockquote>`);
      return;
    }

    const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
    if (unorderedMatch || orderedMatch) {
      flushParagraph();
      const nextType = unorderedMatch ? "ul" : "ol";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        html.push(`<${listType}>`);
      }
      html.push(`<li>${renderInlineMarkdown((unorderedMatch || orderedMatch)[1])}</li>`);
      return;
    }

    closeList();
    paragraph.push(line);
  });

  flushParagraph();
  closeList();
  const rendered = html.join("\n");
  if (!options.allowHtml) {
    return rendered;
  }
  return sanitizeMessageHtml(decodeEscapedHtmlTags(rendered));
}

function parseEnvValue(rawValue = "") {
  let value = String(rawValue ?? "").trim();
  if (!value) {
    return "";
  }

  const quote = value[0];
  if ((quote === "\"" || quote === "'" || quote === "`") && value.endsWith(quote)) {
    value = value.slice(1, -1);
  }

  return value
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, "\"")
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
}

function parseEnvContent(content = "") {
  const parsed = {};
  const orderedEntries = [];
  String(content || "").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) {
      return;
    }

    const key = match[1];
    const value = parseEnvValue(match[2]);
    parsed[key] = value;
    orderedEntries.push({ key, value });
  });

  return { parsed, orderedEntries };
}

function formatEnvValue(value = "") {
  const raw = String(value ?? "");
  if (!raw) {
    return "";
  }

  if (/^[^\s#"'`=]+$/.test(raw)) {
    return raw;
  }

  return JSON.stringify(raw);
}

function getEnvFieldValue(parsedEnv, key) {
  if (Object.prototype.hasOwnProperty.call(parsedEnv, key)) {
    return parsedEnv[key];
  }

  const aliases = ENV_ALIAS_KEYS[key] || [];
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(parsedEnv, alias)) {
      return parsedEnv[alias];
    }
  }

  return "";
}

function renderEnvImagePreview(preview, value = "", emptyText = "未設定頭像") {
  if (!preview) {
    return;
  }
  const imageValue = String(value || "").trim();
  preview.innerHTML = "";
  preview.classList.toggle("has-image", Boolean(imageValue));
  if (!imageValue) {
    preview.textContent = emptyText;
    return;
  }
  const image = document.createElement("img");
  image.src = imageValue;
  image.alt = emptyText.includes("背景") ? "背景預覽" : "頭像預覽";
  image.addEventListener("error", () => {
    preview.classList.remove("has-image");
    preview.textContent = "圖片無法顯示";
  });
  preview.appendChild(image);
}

function createEnvImageField(field, parsedEnv) {
  const wrapper = document.createElement("div");
  wrapper.className = "env-field env-field-wide env-image-field";

  const title = document.createElement("span");
  title.className = "env-field-title";
  title.textContent = field.label;

  const keyLabel = document.createElement("code");
  keyLabel.className = "env-field-key";
  keyLabel.textContent = field.key;

  const hiddenInput = document.createElement("input");
  hiddenInput.type = "hidden";
  hiddenInput.dataset.envKey = field.key;
  hiddenInput.id = `envField_${field.key}`;
  hiddenInput.name = field.key;
  hiddenInput.value = getEnvFieldValue(parsedEnv, field.key);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.className = "hidden";

  const preview = document.createElement("div");
  preview.className = "env-image-preview";
  const emptyText = field.emptyText || "未設定頭像";
  renderEnvImagePreview(preview, hiddenInput.value, emptyText);

  const actions = document.createElement("div");
  actions.className = "env-image-actions";

  const uploadBtn = document.createElement("button");
  uploadBtn.type = "button";
  uploadBtn.className = "secondary";
  uploadBtn.textContent = hiddenInput.value ? "更換圖片" : "上傳圖片";
  uploadBtn.addEventListener("click", () => fileInput.click());

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "muted";
  removeBtn.textContent = "移除";
  removeBtn.addEventListener("click", () => {
    hiddenInput.value = "";
    fileInput.value = "";
    uploadBtn.textContent = "上傳圖片";
    renderEnvImagePreview(preview, "", emptyText);
  });

  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    if (!file) {
      return;
    }
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      if (field.crop === false) {
        const backgroundDataUrl = await createCompressedImageDataUrl(dataUrl, {
          maxSide: field.maxSide || 1920,
          quality: field.quality || 0.86
        });
        hiddenInput.value = backgroundDataUrl;
        uploadBtn.textContent = "更換圖片";
        renderEnvImagePreview(preview, backgroundDataUrl, emptyText);
        return;
      }
      await openCoverCropDialog(dataUrl, {
        onConfirm: (croppedDataUrl) => {
          hiddenInput.value = croppedDataUrl;
          uploadBtn.textContent = "更換圖片";
          renderEnvImagePreview(preview, croppedDataUrl, emptyText);
        },
        onChangeImage: () => {
          fileInput.value = "";
          fileInput.click();
        }
      });
    } catch (error) {
      showToast(error.message || "圖片讀取失敗", "error");
    } finally {
      fileInput.value = "";
    }
  });

  actions.append(uploadBtn, removeBtn);
  wrapper.append(title, keyLabel, hiddenInput, fileInput, preview, actions);

  if (field.help) {
    const help = document.createElement("span");
    help.className = "env-field-help";
    help.textContent = field.help;
    wrapper.appendChild(help);
  }

  return wrapper;
}

function createEnvField(field, parsedEnv) {
  if (field.type === "image") {
    return createEnvImageField(field, parsedEnv);
  }

  const wrapper = document.createElement("label");
  wrapper.className = `env-field env-field-${field.type === "textarea" ? "wide" : "normal"}`;

  const title = document.createElement("span");
  title.className = "env-field-title";
  title.textContent = field.label;

  const keyLabel = document.createElement("code");
  keyLabel.className = "env-field-key";
  keyLabel.textContent = field.key;

  const input = field.type === "textarea"
    ? document.createElement("textarea")
    : field.type === "select"
      ? document.createElement("select")
      : document.createElement("input");
  input.dataset.envKey = field.key;
  input.id = `envField_${field.key}`;
  input.name = field.key;
  input.placeholder = field.placeholder || "";
  input.spellcheck = false;

  if (field.type === "textarea") {
    input.rows = field.rows || 4;
    input.value = getEnvFieldValue(parsedEnv, field.key);
  } else if (field.type === "select") {
    const currentValue = getEnvFieldValue(parsedEnv, field.key);
    (field.options || []).forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      input.appendChild(option);
    });
    input.value = currentValue || field.options?.[0]?.[0] || "";
  } else {
    input.type = field.type || "text";
    input.value = getEnvFieldValue(parsedEnv, field.key);
    if (field.autocomplete) {
      input.autocomplete = field.autocomplete;
    }
    if (field.type === "number") {
      if (field.min !== undefined) {
        input.min = String(field.min);
      }
      if (field.max !== undefined) {
        input.max = String(field.max);
      }
      if (field.step !== undefined) {
        input.step = String(field.step);
      }
      if (field.inputMode) {
        input.inputMode = field.inputMode;
      }
    }
  }

  wrapper.append(title, keyLabel, input);

  if (field.help) {
    const help = document.createElement("span");
    help.className = "env-field-help";
    help.textContent = field.help;
    wrapper.appendChild(help);
  }

  return wrapper;
}

function createEnvExtraRow(entry = {}) {
  const row = document.createElement("div");
  row.className = "env-extra-row";

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = "KEY";
  keyInput.value = entry.key || "";
  keyInput.dataset.envExtraKey = "true";
  keyInput.spellcheck = false;

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = "value";
  valueInput.value = entry.value || "";
  valueInput.dataset.envExtraValue = "true";
  valueInput.spellcheck = false;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "muted";
  removeBtn.textContent = "刪除";
  removeBtn.addEventListener("click", () => row.remove());

  row.append(keyInput, valueInput, removeBtn);
  return row;
}

function renderEnvExtraRows(entries = []) {
  if (!el.envSettingsExtraList) {
    return;
  }
  el.envSettingsExtraList.innerHTML = "";
  entries.forEach((entry) => el.envSettingsExtraList.appendChild(createEnvExtraRow(entry)));
}

function getChatApiProcessingKeyValues(parsedEnv = {}) {
  const values = Object.entries(parsedEnv)
    .map(([key, value]) => {
      const match = key.match(/^CHAT_API_KEY([2-9]\d*)$/u);
      if (!match) {
        return null;
      }
      const index = Number(match[1]);
      return Number.isFinite(index) && index >= 2 ? { index, value: String(value ?? "") } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.value);

  if (values.length > 0) {
    return values;
  }

  const legacyKey2 = getEnvFieldValue(parsedEnv, "CHAT_API_KEY2");
  return [legacyKey2 || ""];
}

function renumberChatApiProcessingKeyRows() {
  const rows = Array.from(document.querySelectorAll("[data-chat-api-processing-key-row]"));
  rows.forEach((row, index) => {
    const key = `CHAT_API_KEY${index + 2}`;
    const label = row.querySelector("[data-chat-api-processing-key-label]");
    const input = row.querySelector("[data-chat-api-processing-key]");
    if (label) {
      label.textContent = key;
    }
    if (input) {
      input.dataset.envKey = key;
      input.name = key;
      input.id = `envField_${key}`;
      input.placeholder = key;
    }
  });
}

function createChatApiProcessingKeyRow(value = "", keyIndex = 2) {
  const row = document.createElement("div");
  row.className = "env-extra-row chat-api-processing-key-row";
  row.dataset.chatApiProcessingKeyRow = "true";
  const key = `CHAT_API_KEY${Math.max(2, Number(keyIndex) || 2)}`;

  const keyLabel = document.createElement("code");
  keyLabel.className = "env-field-key";
  keyLabel.dataset.chatApiProcessingKeyLabel = "true";
  keyLabel.textContent = key;

  const input = document.createElement("input");
  input.type = "password";
  input.autocomplete = "off";
  input.value = value;
  input.dataset.chatApiProcessingKey = "true";
  input.dataset.envKey = key;
  input.name = key;
  input.id = `envField_${key}`;
  input.placeholder = key;
  input.spellcheck = false;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "muted";
  removeBtn.textContent = "刪除";
  removeBtn.addEventListener("click", () => {
    row.remove();
    renumberChatApiProcessingKeyRows();
    setChatApiTestStatus("", "設定已變更，尚未重新測試");
  });

  row.append(keyLabel, input, removeBtn);
  return row;
}

function createChatApiProcessingKeyControls(parsedEnv = {}) {
  const wrapper = document.createElement("div");
  wrapper.className = "chat-api-processing-keys";

  const hint = document.createElement("p");
  hint.className = "form-hint";
  hint.textContent = "大模型處理用對話 API Key 會依目前啟用的大模型順序使用；Key 不足時沿用最後一把。";

  const list = document.createElement("div");
  list.id = "chatApiProcessingKeyList";
  list.className = "env-extra-list chat-api-processing-key-list";
  getChatApiProcessingKeyValues(parsedEnv).forEach((value, index) => {
    list.appendChild(createChatApiProcessingKeyRow(value, index + 2));
  });

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.id = "addChatApiProcessingKeyBtn";
  addBtn.className = "secondary";
  addBtn.textContent = "＋ 新增大模型處理 Key";
  addBtn.addEventListener("click", () => {
    const nextIndex = list.querySelectorAll("[data-chat-api-processing-key-row]").length + 2;
    list.appendChild(createChatApiProcessingKeyRow("", nextIndex));
    renumberChatApiProcessingKeyRows();
    setChatApiTestStatus("", "設定已變更，尚未重新測試");
  });

  wrapper.append(hint, list, addBtn);
  return wrapper;
}

function createChatApiTestControls() {
  const row = document.createElement("div");
  row.className = "env-test-row";

  const button = document.createElement("button");
  button.type = "button";
  button.id = "testChatApiConnectionBtn";
  button.className = "secondary";
  button.textContent = "測試連接";

  const status = document.createElement("span");
  status.id = "chatApiTestStatus";
  status.className = "env-test-status";
  status.textContent = "尚未測試";

  row.append(button, status);
  return row;
}

function renderEnvSettingsForm(content = "") {
  if (!el.envSettingsFields) {
    return;
  }

  const { parsed, orderedEntries } = parseEnvContent(content);
  el.envSettingsFields.innerHTML = "";

  ENV_FIELD_GROUPS.forEach((group) => {
    const section = document.createElement("section");
    section.className = "env-section";

    const heading = document.createElement("h4");
    heading.textContent = group.title;
    section.appendChild(heading);

    if (group.description) {
      const description = document.createElement("p");
      description.className = "form-hint";
      description.textContent = group.description;
      section.appendChild(description);
    }

    const grid = document.createElement("div");
    grid.className = "env-grid";
    group.fields.forEach((field) => grid.appendChild(createEnvField(field, parsed)));
    section.appendChild(grid);
    if (group.title === "對話API") {
      section.appendChild(createChatApiProcessingKeyControls(parsed));
      section.appendChild(createChatApiTestControls());
    }
    el.envSettingsFields.appendChild(section);
  });

  envExtraEntries = orderedEntries.filter((entry) => !isManagedEnvKey(entry.key) && !ENV_DROPPED_KEYS.has(entry.key));
  renderEnvExtraRows(envExtraEntries);
}

function collectEnvFieldValues() {
  const values = {};
  el.envSettingsForm?.querySelectorAll("[data-env-key]").forEach((input) => {
    values[input.dataset.envKey] = input.value || "";
  });
  return values;
}

function collectChatApiProcessingKeyValues() {
  return Array.from(document.querySelectorAll("[data-chat-api-processing-key]"))
    .map((input) => input.value || "");
}

function collectEnvExtraEntries() {
  const rows = Array.from(el.envSettingsExtraList?.querySelectorAll(".env-extra-row") || []);
  return rows
    .map((row) => {
      const key = row.querySelector("[data-env-extra-key]")?.value.trim() || "";
      const value = row.querySelector("[data-env-extra-value]")?.value || "";
      return { key, value };
    })
    .filter((entry) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(entry.key));
}

function buildEnvContentFromForm() {
  const values = collectEnvFieldValues();
  const lines = [
    "# 由網頁環境設定表單自動生成。",
    "# 保存後會寫入專案根目錄 .env。"
  ];

  ENV_FIELD_GROUPS.forEach((group) => {
    lines.push("", `# ${group.title}`);
    if (group.description) {
      lines.push(`# ${group.description}`);
    }
    group.fields.forEach((field) => {
      if (field.help) {
        lines.push(`# ${field.help}`);
      }
      lines.push(`${field.key}=${formatEnvValue(values[field.key] || "")}`);
    });
    if (group.title === "對話API") {
      const processingKeys = collectChatApiProcessingKeyValues();
      if (processingKeys.length > 0) {
        lines.push("# 大模型處理用對話 API Key。依啟用的大模型順序使用；Key 不足時沿用最後一把。");
        processingKeys.forEach((value, index) => {
          lines.push(`CHAT_API_KEY${index + 2}=${formatEnvValue(value)}`);
        });
      }
    }
  });

  const extraEntries = collectEnvExtraEntries();
  if (extraEntries.length) {
    lines.push("", "# 其他自訂環境變數");
    extraEntries.forEach((entry) => {
      lines.push(`${entry.key}=${formatEnvValue(entry.value)}`);
    });
  }

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n")}\n`;
}

function setChatApiTestStatus(type = "", message = "") {
  const status = document.getElementById("chatApiTestStatus");
  if (!status) {
    return;
  }
  status.className = `env-test-status${type ? ` ${type}` : ""}`;
  status.textContent = message || "尚未測試";
}

function isChatApiEnvField(key = "") {
  return key.startsWith("CHAT_API_") || key === "DEEPSEEK_REASONING_EFFORT";
}

async function testChatApiConnection() {
  const button = document.getElementById("testChatApiConnectionBtn");
  try {
    if (button) {
      button.disabled = true;
    }
    setChatApiTestStatus("testing", "測試中...");
    const payload = await request("/api/chat-api/test", {
      method: "POST",
      body: JSON.stringify({ content: buildEnvContentFromForm() })
    });
    const detail = [
      payload?.model ? `模型：${payload.model}` : "",
      payload?.durationMs ? `${payload.durationMs}ms` : ""
    ].filter(Boolean).join("｜");
    const message = payload?.message || (payload?.ok ? "連接成功。" : "連接失敗。");
    setChatApiTestStatus(payload?.ok ? "success" : "error", detail ? `${message} ${detail}` : message);
  } catch (error) {
    setChatApiTestStatus("error", `連接失敗：${error.message}`);
  } finally {
    if (button) {
      button.disabled = false;
    }
  }
}

function getUsageCost(usage) {
  const amount = Number(usage?.cost?.amount ?? usage?.cost?.amountCny ?? usage?.costCny);
  return Number.isFinite(amount) ? amount : null;
}

function getUsageCostCurrency(usage) {
  return String(usage?.cost?.currency || (usage?.cost?.amountCny || usage?.costCny ? "CNY" : "CNY")).toUpperCase();
}

function getCurrencySymbol(currency = "CNY") {
  return String(currency).toUpperCase() === "USD" ? "$" : "¥";
}

function getPricingUnitLabel(unit = "") {
  return unit === "per_million_tokens" || !unit ? "每百萬 tokens" : unit;
}

function formatCurrencyAmount(value, currency = "CNY") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "";
  }
  const abs = Math.abs(amount);
  const digits = abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  return `${getCurrencySymbol(currency)}${amount.toFixed(digits).replace(/0+$/u, "").replace(/[.]$/u, "")}`;
}

function formatUsageCostBreakdown(usage) {
  const cost = usage?.cost;
  if (!cost || typeof cost !== "object" || getUsageCost(usage) === null) {
    return "";
  }
  const currency = getUsageCostCurrency(usage);
  const unitLabel = getPricingUnitLabel(cost.pricingUnit);
  const lines = [
    `使用金額：${formatCurrencyAmount(getUsageCost(usage), currency)}${cost.pricingModel ? `（${cost.pricingModel}）` : ""}`,
    `計費單位：${currency} / ${unitLabel}`
  ];
  if (Number.isFinite(cost.inputCacheHitTokens) && Number.isFinite(cost.inputCacheHitPerMillion)) {
    lines.push(`輸入（快取命中）：${cost.inputCacheHitTokens} tokens × ${formatCurrencyAmount(cost.inputCacheHitPerMillion, currency)} / 百萬 = ${formatCurrencyAmount(cost.inputCacheHitCost, currency)}`);
  }
  if (Number.isFinite(cost.inputCacheMissTokens) && Number.isFinite(cost.inputCacheMissPerMillion)) {
    lines.push(`輸入（快取未命中）：${cost.inputCacheMissTokens} tokens × ${formatCurrencyAmount(cost.inputCacheMissPerMillion, currency)} / 百萬 = ${formatCurrencyAmount(cost.inputCacheMissCost, currency)}`);
  }
  if (Number.isFinite(cost.outputTokens) && Number.isFinite(cost.outputPerMillion)) {
    lines.push(`輸出：${cost.outputTokens} tokens × ${formatCurrencyAmount(cost.outputPerMillion, currency)} / 百萬 = ${formatCurrencyAmount(cost.outputCost, currency)}`);
  }
  if (cost.promptCacheMissFallback) {
    lines.push("未收到快取未命中 token 欄位時，剩餘輸入 token 會按未命中價格計算。");
  }
  return lines.join("\n");
}

function formatUsage(usage) {
  if (!usage || typeof usage !== "object") {
    return "";
  }
  const prompt = Number.isFinite(usage.promptTokens) ? usage.promptTokens : null;
  const completion = Number.isFinite(usage.completionTokens) ? usage.completionTokens : null;
  const total = Number.isFinite(usage.totalTokens) ? usage.totalTokens : null;
  const cacheHit = Number.isFinite(usage.promptCacheHitTokens) ? usage.promptCacheHitTokens : null;
  const cacheMiss = Number.isFinite(usage.promptCacheMissTokens) ? usage.promptCacheMissTokens : null;
  const cacheTotal = (cacheHit || 0) + (cacheMiss || 0);
  const cacheRate = cacheTotal > 0 && cacheHit !== null
    ? `${Math.round((cacheHit / cacheTotal) * 100)}%`
    : "";
  const cost = getUsageCost(usage);
  if (prompt === null && completion === null && total === null && cacheHit === null && cacheMiss === null && cost === null) {
    return "";
  }
  return [
    prompt !== null ? `輸入 ${prompt}` : "",
    completion !== null ? `輸出 ${completion}` : "",
    total !== null ? `總計 ${total}` : "",
    cacheHit !== null ? `Cache Hit ${cacheHit}` : "",
    cacheMiss !== null ? `Cache Miss ${cacheMiss}` : "",
    cacheRate ? `命中率 ${cacheRate}` : "",
    cost !== null ? `金額 ${formatCurrencyAmount(cost, getUsageCostCurrency(usage))}` : ""
  ].filter(Boolean).join(" / ");
}

function containsReplacementCharacter(input) {
  return String(input || "").includes("�");
}

function parseTermInput(raw) {
  if (Array.isArray(raw)) {
    return raw
      .flatMap((item) => parseTermInput(item))
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return String(raw || "")
    .split(/[\r\n,，、;；|/／]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function dedupeTextList(items = []) {
  const seen = new Set();
  const result = [];
  (Array.isArray(items) ? items : [items]).forEach((item) => {
    const normalized = String(item || "").trim();
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
}

function getFirstMarkdownHeading(text = "") {
  const match = String(text || "").match(/^\s{0,3}#{1,6}\s+(.+)$/mu);
  return match ? match[1].replace(/#+\s*$/u, "").trim() : "";
}

function encodeBase64Utf8(text = "") {
  const bytes = new TextEncoder().encode(String(text || ""));
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.slice(index, index + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64Utf8(text = "") {
  const binary = atob(String(text || "").trim());
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

function parseRoleCardPayloadText(text = "") {
  const source = String(text || "").trim();
  const candidates = [source];
  try {
    candidates.push(decodeBase64Utf8(source));
  } catch {
    // Plain JSON is also valid.
  }

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next representation.
    }
  }
  throw new Error("找不到可讀取的角色卡 JSON 資料。");
}

function readPngChunkType(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function readPngTextChunk(data) {
  const separatorIndex = data.indexOf(0);
  if (separatorIndex <= 0) {
    return null;
  }
  return {
    key: new TextDecoder("latin1").decode(data.slice(0, separatorIndex)),
    value: new TextDecoder("latin1").decode(data.slice(separatorIndex + 1))
  };
}

function readPngInternationalTextChunk(data) {
  const keywordEnd = data.indexOf(0);
  if (keywordEnd <= 0 || keywordEnd + 3 >= data.length) {
    return null;
  }
  const compressed = data[keywordEnd + 1] === 1;
  if (compressed) {
    return null;
  }
  let cursor = keywordEnd + 3;
  while (cursor < data.length && data[cursor] !== 0) {
    cursor += 1;
  }
  cursor += 1;
  while (cursor < data.length && data[cursor] !== 0) {
    cursor += 1;
  }
  cursor += 1;
  if (cursor >= data.length) {
    return null;
  }
  return {
    key: new TextDecoder().decode(data.slice(0, keywordEnd)),
    value: new TextDecoder().decode(data.slice(cursor))
  };
}

function extractPngRoleCardPayload(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((value, index) => bytes[index] === value)) {
    return null;
  }
  const metadataKeys = new Set(["chara", "character", "ccv3", "chara_card_v2", "sillytavern_json"]);
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = (
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3]
    ) >>> 0;
    const type = readPngChunkType(bytes, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > bytes.length) {
      break;
    }
    const data = bytes.slice(dataStart, dataEnd);
    const textEntry = type === "tEXt"
      ? readPngTextChunk(data)
      : type === "iTXt"
        ? readPngInternationalTextChunk(data)
        : null;
    if (textEntry && metadataKeys.has(String(textEntry.key || "").trim())) {
      return parseRoleCardPayloadText(textEntry.value);
    }
    offset = dataEnd + 4;
  }
  return null;
}

const JPEG_ROLE_CARD_MAGIC = "TimeTavernRoleCard\0";

function extractJpegRoleCardPayload(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }
  const decoder = new TextDecoder();
  const chunks = [];
  let offset = 2;
  while (offset + 4 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      break;
    }
    while (bytes[offset] === 0xff) {
      offset += 1;
    }
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xda || marker === 0xd9) {
      break;
    }
    if (marker >= 0xd0 && marker <= 0xd7) {
      continue;
    }
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    if (!length || offset + length > bytes.length) {
      break;
    }
    const data = bytes.slice(offset + 2, offset + length);
    if (marker === 0xef) {
      const text = decoder.decode(data);
      if (text.startsWith(JPEG_ROLE_CARD_MAGIC)) {
        const rest = text.slice(JPEG_ROLE_CARD_MAGIC.length);
        const separatorIndex = rest.indexOf("\0");
        if (separatorIndex >= 0 && /^\d{4}\/\d{4}$/u.test(rest.slice(0, separatorIndex))) {
          const [indexText, totalText] = rest.slice(0, separatorIndex).split("/");
          chunks.push({
            index: Number(indexText),
            total: Number(totalText),
            content: rest.slice(separatorIndex + 1)
          });
        } else {
          return parseRoleCardPayloadText(rest);
        }
      }
    }
    if (marker === 0xfe) {
      const text = decoder.decode(data);
      if (text.includes("{") && text.includes("}")) {
        try {
          return parseRoleCardPayloadText(text.slice(text.indexOf("{")));
        } catch {
          // Comments are optional metadata.
        }
      }
    }
    offset += length;
  }
  if (chunks.length === 0) {
    return null;
  }
  chunks.sort((a, b) => a.index - b.index);
  const expectedTotal = chunks[0].total;
  if (chunks.length !== expectedTotal) {
    throw new Error("JPG 角色卡資料不完整。");
  }
  return parseRoleCardPayloadText(chunks.map((chunk) => chunk.content).join(""));
}

function extractRoleCardPayloadFromImageBytes(bytes) {
  return extractPngRoleCardPayload(bytes) || extractJpegRoleCardPayload(bytes);
}

function attachImportedImageCover(payload, imageDataUrl = "") {
  if (!payload || !imageDataUrl) {
    return payload;
  }
  if (payload.data && typeof payload.data === "object") {
    payload.data.avatar = payload.data.avatar || imageDataUrl;
    const embedded = payload.data.extensions?.time_tavern_role_card || payload.data.extensions?.timeTavernRoleCard;
    if (embedded && typeof embedded === "object" && !embedded.coverImage) {
      embedded.coverImage = imageDataUrl;
    }
    return payload;
  }
  if (payload && typeof payload === "object" && !payload.coverImage) {
    payload.coverImage = imageDataUrl;
  }
  return payload;
}

function serializeDisplayValue(value) {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value ?? "");
}

function truncateText(text = "", maxLength = 140) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  if (!compact) {
    return "";
  }
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, Math.max(1, maxLength - 3))}...`;
}

function normalizeCoverPosition(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  const allowed = new Set([
    "center center",
    "center top",
    "center bottom",
    "left center",
    "right center",
    "left top",
    "right top",
    "left bottom",
    "right bottom"
  ]);
  return allowed.has(normalized) ? normalized : "center center";
}

function getDisplayedRoleCard(card, state = appState) {
  const runtime = state?.roleCardRuntimeState?.[card?.id] || {};
  const customSections = normalizeRoleCardCustomSections(card?.customSections, card);
  const getSection = (name) => customSections
    .find((section) => section.enabled !== false && section.name === name)?.content || "";
  return {
    ...card,
    customSections,
    personality: mergeDisplayedPersonality(getSection("性格"), runtime.personalityAdditions || runtime.personality),
    scene: runtime.scene || getSection("場景"),
    systemInstruction: runtime.systemInstruction || getSection("系統指令"),
    description: runtime.description || getSection("詳細描述"),
    relationships: runtime.relationships || getSection("人物關係（純文字）")
  };
}

function buildRoleCardIntro(card, state = appState) {
  const displayedCard = getDisplayedRoleCard(card, state);
  const sectionSummary = normalizeRoleCardCustomSections(displayedCard.customSections, displayedCard)
    .filter((section) => section.enabled !== false)
    .slice(0, 3)
    .map((section) => `${section.name}：${truncateText(section.content, 60)}`)
    .join("｜");
  return [
    `模式：${getRoleCardModeLabel(card)}`,
    sectionSummary,
    summarizeRoleCardLorebooks(card?.lorebooks) ? `世界書：${summarizeRoleCardLorebooks(card.lorebooks)}` : ""
  ].filter(Boolean).join("｜");
}

function buildRoleCardContent(card, state = appState) {
  const displayedCard = getDisplayedRoleCard(card, state);
  return [
    displayedCard.description ? `描述：${displayedCard.description}` : "",
    displayedCard.relationships ? `人物關係：${displayedCard.relationships}` : "",
    card?.openingDialogue ? `開場：${card.openingDialogue}` : ""
  ].filter(Boolean).join("｜") || "（未填內容）";
}

function setRoleCardCoverPreview(dataUrl = "", position = "center center") {
  const value = String(dataUrl || "").trim();
  const normalizedPosition = normalizeCoverPosition(position);
  el.roleCardCoverImage.value = value;
  el.roleCardCoverPreview.innerHTML = "";
  el.roleCardCoverPreview.classList.toggle("has-cover", Boolean(value));

  if (!value) {
    el.roleCardCoverPreview.textContent = "未設定封面";
    return;
  }

  const img = document.createElement("img");
  img.src = value;
  img.alt = "角色卡封面預覽";
  img.style.objectPosition = normalizedPosition;
  el.roleCardCoverPreview.appendChild(img);
}

function readImageFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("請選擇圖片檔案。"));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("圖片讀取失敗。"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

async function ensureRoleCardCoverReady() {
  if (roleCardCoverImageReadTask) {
    const dataUrl = await roleCardCoverImageReadTask;
    await openCoverCropDialog(dataUrl);
    roleCardCoverImageReadTask = null;
    return false;
  }

  const file = el.roleCardCoverImageFile?.files?.[0];
  if (file && !el.roleCardCoverImage.value.trim()) {
    const dataUrl = await readImageFileAsDataUrl(file);
    await openCoverCropDialog(dataUrl);
    return false;
  }
  return true;
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("圖片解析失敗。"));
    img.onload = () => resolve(img);
    img.src = dataUrl;
  });
}

function loadImageForExport(source = "") {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onerror = () => reject(new Error("封面圖片無法匯出，請改用本機上傳的封面或先移除封面匯出 JSON。"));
    img.onload = () => resolve(img);
    img.src = source;
  });
}

async function createCompressedImageDataUrl(dataUrl = "", options = {}) {
  const image = await loadImage(dataUrl);
  const maxSide = Math.max(320, Number(options.maxSide || 1920) || 1920);
  const quality = Math.min(0.95, Math.max(0.55, Number(options.quality || 0.86) || 0.86));
  const sourceWidth = image.naturalWidth || image.width || 1;
  const sourceHeight = image.naturalHeight || image.height || 1;
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function sanitizeDownloadFileName(value = "role-card") {
  return String(value || "role-card")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "role-card";
}

function cloneSerializable(value) {
  return JSON.parse(JSON.stringify(value || null));
}

function getRoleCardSectionContentForExport(card = {}, names = []) {
  const nameSet = new Set((Array.isArray(names) ? names : [names]).map((item) => String(item || "").trim()));
  return normalizeRoleCardCustomSections(card.customSections, card)
    .find((section) => section.enabled !== false && nameSet.has(section.name))?.content || "";
}

function buildRoleCardExportPayload(card = {}, options = {}) {
  const includeCoverImage = options.includeCoverImage !== false;
  const roleCard = {
    ...cloneSerializable(card),
    coverImage: includeCoverImage ? String(card.coverImage || "") : ""
  };
  const openings = normalizeRoleCardOpeningDialoguesForEditor(card.openingDialogues, card.openingDialogue);
  const activeOpening = openings.find((entry) => entry.id === card.activeOpeningDialogueId) ||
    openings.find((entry) => entry.content === card.openingDialogue) ||
    openings[0] ||
    null;
  const firstMessage = activeOpening?.content || card.openingDialogue || "";
  const alternateGreetings = openings
    .filter((entry) => entry.content && entry.id !== activeOpening?.id)
    .map((entry) => entry.content);
  const lorebooks = normalizeRoleCardLorebooks(card.lorebooks);
  return {
    spec: "chara_card_v2",
    spec_version: "2.0",
    data: {
      name: card.name || "未命名角色卡",
      description: getRoleCardSectionContentForExport(card, "詳細描述") || card.description || "",
      personality: getRoleCardSectionContentForExport(card, "性格") || card.personality || "",
      scenario: getRoleCardSectionContentForExport(card, "場景") || card.scene || "",
      first_mes: firstMessage,
      mes_example: getRoleCardSectionContentForExport(card, "範例對話"),
      creator_notes: getRoleCardSectionContentForExport(card, "創作者備註"),
      system_prompt: getRoleCardSectionContentForExport(card, "系統指令") || card.systemInstruction || "",
      post_history_instructions: getRoleCardSectionContentForExport(card, "後續指示"),
      alternate_greetings: alternateGreetings,
      tags: [],
      creator: "Time Tavern",
      character_version: "1.0",
      avatar: includeCoverImage ? String(card.coverImage || "") : "",
      extensions: {
        time_tavern_role_card: roleCard
      },
      character_book: {
        name: `${card.name || "角色卡"} 世界書`,
        scan_depth: 3,
        token_budget: 3000,
        recursive_scanning: false,
        entries: lorebooks.map((entry, index) => ({
          id: index + 1,
          name: entry.key || `條目 ${index + 1}`,
          comment: entry.key || `條目 ${index + 1}`,
          keys: Array.isArray(entry.keywords) ? entry.keywords : [],
          secondary_keys: Array.isArray(entry.secondaryKeywords) ? entry.secondaryKeywords : [],
          content: entry.content || "",
          enabled: entry.enabled !== false,
          constant: Boolean(entry.permanent),
          selective: !entry.permanent,
          position: "before_char",
          priority: 10,
          insertion_order: 100 + index,
          probability: normalizeLorebookProbability(entry.probability, 100)
        }))
      }
    }
  };
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToJpegBlob(canvas, quality = 0.92) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("JPG 建立失敗。"));
    }, "image/jpeg", quality);
  });
}

async function createJpegBlobFromCover(coverImage = "") {
  const image = await loadImageForExport(coverImage);
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvasToJpegBlob(canvas);
}

function createJpegRoleCardMetadataSegments(payload) {
  const encoder = new TextEncoder();
  const payloadText = encodeBase64Utf8(JSON.stringify(payload));
  const maxSegmentDataLength = 65000;
  const sampleHeader = `${JPEG_ROLE_CARD_MAGIC}0001/0001\0`;
  const chunkSize = Math.max(1, maxSegmentDataLength - encoder.encode(sampleHeader).length);
  const total = Math.ceil(payloadText.length / chunkSize) || 1;
  const segments = [];
  for (let index = 0; index < total; index += 1) {
    const header = `${JPEG_ROLE_CARD_MAGIC}${String(index + 1).padStart(4, "0")}/${String(total).padStart(4, "0")}\0`;
    const data = encoder.encode(`${header}${payloadText.slice(index * chunkSize, (index + 1) * chunkSize)}`);
    const segment = new Uint8Array(data.length + 4);
    segment[0] = 0xff;
    segment[1] = 0xef;
    const length = data.length + 2;
    segment[2] = (length >> 8) & 0xff;
    segment[3] = length & 0xff;
    segment.set(data, 4);
    segments.push(segment);
  }
  return segments;
}

async function injectJpegRoleCardPayload(jpegBlob, payload) {
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
  if (jpegBytes[0] !== 0xff || jpegBytes[1] !== 0xd8) {
    throw new Error("封面轉換後不是有效 JPG。");
  }
  const segments = createJpegRoleCardMetadataSegments(payload);
  const totalLength = jpegBytes.length + segments.reduce((sum, segment) => sum + segment.length, 0);
  const output = new Uint8Array(totalLength);
  output.set(jpegBytes.slice(0, 2), 0);
  let offset = 2;
  segments.forEach((segment) => {
    output.set(segment, offset);
    offset += segment.length;
  });
  output.set(jpegBytes.slice(2), offset);
  return new Blob([output], { type: "image/jpeg" });
}

async function exportRoleCard(card) {
  try {
    const fileBaseName = sanitizeDownloadFileName(card?.name || "role-card");
    if (String(card?.coverImage || "").trim()) {
      const payload = buildRoleCardExportPayload(card, { includeCoverImage: false });
      const jpegBlob = await createJpegBlobFromCover(card.coverImage);
      const roleCardJpeg = await injectJpegRoleCardPayload(jpegBlob, payload);
      triggerBlobDownload(roleCardJpeg, `${fileBaseName}.jpg`);
      showToast("已匯出 JPG 角色卡");
      return;
    }
    const payload = buildRoleCardExportPayload(card, { includeCoverImage: true });
    const jsonBlob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    triggerBlobDownload(jsonBlob, `${fileBaseName}.json`);
    showToast("已匯出 JSON 角色卡");
  } catch (error) {
    showToast(error.message || "角色卡匯出失敗", "error");
  }
}

function isJsonRoleCardFile(file) {
  const name = String(file?.name || "").toLowerCase();
  return file?.type === "application/json" || name.endsWith(".json");
}

async function readRoleCardPayloadFromFile(file) {
  if (isJsonRoleCardFile(file)) {
    return parseRoleCardPayloadText(await file.text());
  }
  if (!String(file?.type || "").startsWith("image/")) {
    throw new Error("只支援匯入 JSON、PNG、JPG 圖片角色卡。");
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const payload = extractRoleCardPayloadFromImageBytes(bytes);
  if (!payload) {
    throw new Error("這張圖片沒有找到可讀取的角色卡資料。");
  }
  const imageDataUrl = await readImageFileAsDataUrl(file);
  return attachImportedImageCover(payload, imageDataUrl);
}

async function importRoleCardFromFile(file) {
  if (!file) {
    return;
  }
  try {
    const payload = await readRoleCardPayloadFromFile(file);
    const response = await request("/api/role-cards", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    appState = response?.state || appState;
    await refresh();
    showToast("角色卡已匯入");
  } catch (error) {
    showToast(error.message || "角色卡匯入失敗", "error");
  } finally {
    if (el.roleCardImportFile) {
      el.roleCardImportFile.value = "";
    }
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

async function openCoverCropDialog(dataUrl, options = {}) {
  const image = await loadImage(dataUrl);
  coverCropConfirmHandler = typeof options.onConfirm === "function" ? options.onConfirm : null;
  coverCropChangeImageHandler = typeof options.onChangeImage === "function" ? options.onChangeImage : null;
  coverCropState = {
    source: dataUrl,
    image,
    crop: { x: 0, y: 0, width: 0, height: 0 },
    action: "",
    pointerStart: null,
    cropStart: null
  };
  el.coverCropImage.src = dataUrl;
  el.coverCropDialog.showModal();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  resetCoverCropBox();
}

function resetCoverCropDialogState() {
  coverCropState = null;
  coverCropConfirmHandler = null;
  coverCropChangeImageHandler = null;
}

function getCoverCropImageRect() {
  const stageRect = el.coverCropStage.getBoundingClientRect();
  const imageRect = el.coverCropImage.getBoundingClientRect();
  return {
    left: imageRect.left - stageRect.left,
    top: imageRect.top - stageRect.top,
    width: imageRect.width,
    height: imageRect.height
  };
}

function resetCoverCropBox() {
  if (!coverCropState) {
    return;
  }
  const rect = getCoverCropImageRect();
  const width = Math.max(80, rect.width * 0.76);
  const height = Math.max(80, rect.height * 0.76);
  coverCropState.crop = {
    x: (rect.width - width) / 2,
    y: (rect.height - height) / 2,
    width,
    height
  };
  renderCoverCropBox();
}

function renderCoverCropBox() {
  if (!coverCropState) {
    return;
  }
  const rect = getCoverCropImageRect();
  const crop = coverCropState.crop;
  el.coverCropBox.style.left = `${rect.left + crop.x}px`;
  el.coverCropBox.style.top = `${rect.top + crop.y}px`;
  el.coverCropBox.style.width = `${crop.width}px`;
  el.coverCropBox.style.height = `${crop.height}px`;
  updateCoverCropPreview();
}

function drawCoverCropToCanvas(canvas, maxSide = 640) {
  if (!coverCropState) {
    return "";
  }
  const rect = getCoverCropImageRect();
  const crop = coverCropState.crop;
  const image = coverCropState.image;
  const scaleX = image.naturalWidth / rect.width;
  const scaleY = image.naturalHeight / rect.height;
  const sourceX = clamp(crop.x * scaleX, 0, image.naturalWidth);
  const sourceY = clamp(crop.y * scaleY, 0, image.naturalHeight);
  const sourceWidth = clamp(crop.width * scaleX, 1, image.naturalWidth - sourceX);
  const sourceHeight = clamp(crop.height * scaleY, 1, image.naturalHeight - sourceY);
  const outputScale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  canvas.width = Math.max(1, Math.round(sourceWidth * outputScale));
  canvas.height = Math.max(1, Math.round(sourceHeight * outputScale));
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

function updateCoverCropPreview() {
  drawCoverCropToCanvas(el.coverCropPreview, 360);
}

function getCoverCropResultDataUrl() {
  const canvas = document.createElement("canvas");
  const qualities = [0.86, 0.76, 0.66, 0.56];
  drawCoverCropToCanvas(canvas, 760);
  const maxLength = 900 * 1024;
  const best = qualities
    .map((quality) => canvas.toDataURL("image/jpeg", quality))
    .find((dataUrl) => dataUrl.length <= maxLength);
  return best || canvas.toDataURL("image/jpeg", qualities[qualities.length - 1]);
}

function onCoverCropPointerDown(event) {
  if (!coverCropState) {
    return;
  }
  event.preventDefault();
  const isResize = event.target?.classList?.contains("cover-crop-handle");
  coverCropState.action = isResize ? "resize" : "move";
  coverCropState.pointerStart = { x: event.clientX, y: event.clientY };
  coverCropState.cropStart = { ...coverCropState.crop };
  el.coverCropBox.setPointerCapture?.(event.pointerId);
}

function onCoverCropPointerMove(event) {
  if (!coverCropState?.action) {
    return;
  }
  event.preventDefault();
  const rect = getCoverCropImageRect();
  const start = coverCropState.cropStart;
  const dx = event.clientX - coverCropState.pointerStart.x;
  const dy = event.clientY - coverCropState.pointerStart.y;
  const minSize = 48;

  if (coverCropState.action === "resize") {
    const width = clamp(start.width + dx, minSize, rect.width - start.x);
    const height = clamp(start.height + dy, minSize, rect.height - start.y);
    coverCropState.crop = { ...start, width, height };
  } else {
    coverCropState.crop = {
      ...start,
      x: clamp(start.x + dx, 0, rect.width - start.width),
      y: clamp(start.y + dy, 0, rect.height - start.height)
    };
  }
  renderCoverCropBox();
}

function onCoverCropPointerUp(event) {
  if (!coverCropState) {
    return;
  }
  coverCropState.action = "";
  el.coverCropBox.releasePointerCapture?.(event.pointerId);
}

function showToast(message, type = "ok") {
  el.toast.textContent = message;
  el.toast.className = `toast show${type === "error" ? " error" : ""}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toast.className = "toast";
  }, 1700);
}

function getChatCommandMenuItemByForm(formName = "") {
  return CHAT_COMMAND_MENU_ITEMS.find((item) => item.form === formName) || null;
}

function getActiveChatCommandField(name = "") {
  if (!activeChatCommandForm) {
    return null;
  }
  return activeChatCommandForm.fields.find((field) => field.name === name) || null;
}

function setActiveChatCommandFieldValue(name = "", value = "") {
  const field = getActiveChatCommandField(name);
  if (!field) {
    return;
  }
  field.value = value;
}

function getActiveChatCommandFieldValue(name = "") {
  return String(getActiveChatCommandField(name)?.value || "").trim();
}

function getActiveChatCommandFieldValues() {
  if (!activeChatCommandForm) {
    return {};
  }
  return activeChatCommandForm.fields.reduce((values, field) => {
    values[field.name] = getActiveChatCommandFieldValue(field.name);
    return values;
  }, {});
}

function areActiveChatCommandFieldsEmpty() {
  if (!activeChatCommandForm) {
    return true;
  }
  return activeChatCommandForm.fields.every((field) => !getActiveChatCommandFieldValue(field.name));
}

function syncActiveChatCommandToHiddenInput() {
  if (!activeChatCommandForm || !el.chatInput) {
    return;
  }
  const values = activeChatCommandForm.fields
    .map((field) => getActiveChatCommandFieldValue(field.name))
    .filter(Boolean);
  el.chatInput.value = [activeChatCommandForm.command, ...values].filter(Boolean).join(" ");
}

function renderActiveChatCommandHelp() {
  if (!el.chatCommandMenu || !activeChatCommandForm) {
    return;
  }
  el.chatCommandMenu.innerHTML = "";
  el.chatCommandMenu.classList.add("is-command-form");
  el.chatCommandMenu.classList.remove("show-all", "is-filtered", "is-single");

  const header = document.createElement("div");
  header.className = "chat-command-form-header";

  const icon = document.createElement("span");
  icon.className = "chat-command-icon";
  icon.textContent = "/";

  const body = document.createElement("span");
  body.className = "chat-command-body";
  const title = document.createElement("span");
  title.className = "chat-command-title";
  const commandName = document.createElement("span");
  commandName.className = "chat-command-name";
  commandName.textContent = activeChatCommandForm.command;
  const titleText = document.createElement("span");
  titleText.className = "chat-command-title-text";
  titleText.textContent = activeChatCommandForm.title ? ` ${activeChatCommandForm.title}` : "";
  title.append(commandName, titleText);
  const description = document.createElement("span");
  description.className = "chat-command-description";
  description.textContent = activeChatCommandForm.description || "";
  body.append(title, description);
  header.append(icon, body);
  el.chatCommandMenu.appendChild(header);

  const fieldList = document.createElement("div");
  fieldList.className = "chat-command-field-help-list";
  activeChatCommandForm.fields.forEach((field) => {
    const row = document.createElement("div");
    row.className = `chat-command-field-help${focusedChatCommandField === field.name ? " active" : ""}`;

    const name = document.createElement("span");
    name.className = "chat-command-field-help-name";
    name.textContent = field.label || field.name;

    const help = document.createElement("span");
    help.className = "chat-command-field-help-text";
    help.textContent = field.help || "";

    row.append(name, help);
    fieldList.appendChild(row);
  });
  el.chatCommandMenu.appendChild(fieldList);
}

function openActiveChatCommandHelp() {
  if (!el.chatCommandMenu || !activeChatCommandForm) {
    return;
  }
  chatCommandMenuOpen = true;
  renderActiveChatCommandHelp();
  el.chatCommandMenu.hidden = false;
  el.chatPlusButton?.setAttribute("aria-expanded", "true");
}

function focusActiveChatCommandField(name = "") {
  focusedChatCommandField = name || activeChatCommandForm?.fields?.[0]?.name || "";
  openActiveChatCommandHelp();
}

function clearActiveChatCommandForm(options = {}) {
  activeChatCommandForm = null;
  focusedChatCommandField = "";
  el.chatForm?.classList.remove("has-command-composer");
  if (el.chatCommandComposer) {
    el.chatCommandComposer.hidden = true;
    el.chatCommandComposer.innerHTML = "";
  }
  if (el.chatInput) {
    el.chatInput.value = "";
    el.chatInput.hidden = false;
    el.chatInput.removeAttribute("aria-hidden");
  }
  if (!options.keepMenu) {
    closeChatCommandMenu();
  }
  resizeChatInput();
  realignMobileChat({ scroll: true });
  if (options.focusInput) {
    window.setTimeout(() => el.chatInput?.focus(), 0);
  }
}

function renderActiveChatCommandComposer() {
  if (!el.chatCommandComposer || !activeChatCommandForm) {
    return;
  }
  el.chatForm?.classList.add("has-command-composer");
  el.chatCommandComposer.hidden = false;
  el.chatCommandComposer.innerHTML = "";
  if (el.chatInput) {
    el.chatInput.hidden = true;
    el.chatInput.setAttribute("aria-hidden", "true");
  }

  const commandChip = document.createElement("span");
  commandChip.className = "chat-command-composer-command";
  commandChip.textContent = activeChatCommandForm.command;
  el.chatCommandComposer.appendChild(commandChip);

  activeChatCommandForm.fields.forEach((field) => {
    const wrapper = document.createElement("label");
    wrapper.className = `chat-command-param chat-command-param-${field.name}`;
    wrapper.dataset.field = field.name;

    const label = document.createElement("span");
    label.className = "chat-command-param-label";
    label.textContent = field.label || field.name;

    const input = document.createElement("input");
    input.className = "chat-command-param-input";
    input.type = field.type === "number" ? "number" : "text";
    input.placeholder = field.placeholder || "";
    input.value = field.value || "";
    if (field.type === "number") {
      input.min = "1";
      input.step = "1";
      input.inputMode = "numeric";
    }
    input.addEventListener("focus", () => {
      wrapper.classList.add("active");
      focusActiveChatCommandField(field.name);
    });
    input.addEventListener("blur", () => {
      wrapper.classList.remove("active");
    });
    input.addEventListener("input", () => {
      focusedChatCommandField = field.name;
      wrapper.classList.add("active");
      setActiveChatCommandFieldValue(field.name, input.value);
      syncActiveChatCommandToHiddenInput();
      openActiveChatCommandHelp();
      realignMobileChat({ scroll: true });
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        clearActiveChatCommandForm({ focusInput: true });
        return;
      }
      if (event.key === "Backspace" && !String(input.value || "")) {
        event.preventDefault();
        if (areActiveChatCommandFieldsEmpty()) {
          clearActiveChatCommandForm({ focusInput: true });
          return;
        }
        const fieldIndex = activeChatCommandForm.fields.findIndex((item) => item.name === field.name);
        const previousField = activeChatCommandForm.fields[fieldIndex - 1];
        const previousInput = previousField
          ? el.chatCommandComposer?.querySelector(`[data-field="${previousField.name}"] input`)
          : null;
        previousInput?.focus();
      }
    });

    wrapper.append(label, input);
    el.chatCommandComposer.appendChild(wrapper);
  });

  syncActiveChatCommandToHiddenInput();
  resizeChatInput();
  realignMobileChat({ scroll: true });
}

function startChatCommandForm(item, values = {}) {
  if (!item?.form) {
    return;
  }
  closeChatCommandMenu();
  activeChatCommandForm = {
    id: item.id,
    form: item.form,
    command: item.command,
    title: item.title,
    description: item.description,
    fields: (item.fields || []).map((field) => ({
      ...field,
      value: values[field.name] ?? field.defaultValue ?? ""
    }))
  };
  focusedChatCommandField = values.focusField || activeChatCommandForm.fields[0]?.name || "";
  renderActiveChatCommandComposer();
  openActiveChatCommandHelp();
  window.setTimeout(() => {
    const target = el.chatCommandComposer?.querySelector(`[data-field="${focusedChatCommandField}"] input`)
      || el.chatCommandComposer?.querySelector("input");
    target?.focus();
  }, 0);
}

async function submitActiveChatCommandForm() {
  if (!activeChatCommandForm) {
    return false;
  }
  const values = getActiveChatCommandFieldValues();
  const missingField = activeChatCommandForm.fields.find((field) => field.required && !values[field.name]);
  if (missingField) {
    focusActiveChatCommandField(missingField.name);
    showToast(`請填寫 ${missingField.label || missingField.name}。`, "error");
    return true;
  }
  if (activeChatCommandForm.form === "reload") {
    const num = Number(values.num);
    if (!Number.isInteger(num) || num < 1) {
      focusActiveChatCommandField("num");
      showToast("num 必須是 1 以上的整數。", "error");
      return true;
    }
    await rewriteRecentUserInputFromCommand(num, values.comment || "");
    clearActiveChatCommandForm();
    return true;
  }
  return false;
}

function getChatCommandQuery() {
  const value = el.chatInput?.value || "";
  if (!value.startsWith("/")) {
    return "";
  }
  return value.slice(1).split(/\s+/u)[0].toLowerCase();
}

function getVisibleChatCommandItems() {
  if (chatCommandMenuShowAll) {
    return CHAT_COMMAND_MENU_ITEMS;
  }
  const query = getChatCommandQuery();
  if (!query) {
    return CHAT_COMMAND_MENU_ITEMS;
  }
  return CHAT_COMMAND_MENU_ITEMS.filter((item) => {
    const haystack = [item.command, item.title, item.description].join(" ").toLowerCase();
    return haystack.includes(query);
  });
}

function renderChatCommandMenu() {
  if (!el.chatCommandMenu) {
    return;
  }
  if (activeChatCommandForm) {
    renderActiveChatCommandHelp();
    return;
  }
  const items = getVisibleChatCommandItems();
  selectedChatCommandIndex = Math.min(Math.max(0, selectedChatCommandIndex), Math.max(0, items.length - 1));
  el.chatCommandMenu.innerHTML = "";
  el.chatCommandMenu.classList.remove("is-command-form");
  el.chatCommandMenu.classList.toggle("show-all", chatCommandMenuShowAll);
  el.chatCommandMenu.classList.toggle("is-filtered", !chatCommandMenuShowAll);
  el.chatCommandMenu.classList.toggle("is-single", items.length === 1);

  if (items.length === 0) {
    const empty = document.createElement("div");
    empty.className = "chat-command-empty";
    empty.textContent = "沒有符合的功能。";
    el.chatCommandMenu.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = `chat-command-item${index === selectedChatCommandIndex ? " active" : ""}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", index === selectedChatCommandIndex ? "true" : "false");
    option.dataset.commandId = item.id;

    const icon = document.createElement("span");
    icon.className = "chat-command-icon";
    icon.textContent = item.command.startsWith("/") ? "/" : "✦";

    const body = document.createElement("span");
    body.className = "chat-command-body";
    const title = document.createElement("span");
    title.className = "chat-command-title";
    if (item.command.startsWith("/")) {
      const commandName = document.createElement("span");
      commandName.className = "chat-command-name";
      commandName.textContent = item.command;
      const titleText = document.createElement("span");
      titleText.className = "chat-command-title-text";
      titleText.textContent = item.title ? ` ${item.title}` : "";
      title.append(commandName, titleText);
    } else {
      title.textContent = item.title;
    }
    const description = document.createElement("span");
    description.className = "chat-command-description";
    description.textContent = item.description;
    body.append(title, description);

    option.append(icon, body);
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => runChatCommandMenuItem(item));
    el.chatCommandMenu.appendChild(option);
  });
}

function openChatCommandMenu(options = {}) {
  if (!el.chatCommandMenu) {
    return;
  }
  chatCommandMenuShowAll = Boolean(options.showAll);
  chatCommandMenuOpen = true;
  renderChatCommandMenu();
  el.chatCommandMenu.hidden = false;
  el.chatPlusButton?.setAttribute("aria-expanded", "true");
}

function closeChatCommandMenu() {
  chatCommandMenuOpen = false;
  selectedChatCommandIndex = 0;
  chatCommandMenuShowAll = false;
  if (el.chatCommandMenu) {
    el.chatCommandMenu.hidden = true;
    el.chatCommandMenu.innerHTML = "";
  }
  el.chatPlusButton?.setAttribute("aria-expanded", "false");
}

function insertChatCommandTemplate(text = "") {
  if (!el.chatInput) {
    return;
  }
  clearActiveChatCommandForm({ keepMenu: true });
  el.chatInput.value = text;
  resizeChatInput();
  closeChatCommandMenu();
  el.chatInput.focus();
  const end = el.chatInput.value.length;
  el.chatInput.setSelectionRange?.(end, end);
}

function clearChatInputValue() {
  if (!el.chatInput) {
    return;
  }
  el.chatInput.value = "";
  resizeChatInput();
}

function openRoleCardPicker() {
  roleCardPickerPage = 1;
  const loading = document.createElement("p");
  loading.className = "form-hint";
  loading.textContent = "正在載入角色卡...";
  el.roleCardPickerGrid?.replaceChildren(loading);
  el.roleCardPickerDialog?.showModal();
  window.requestAnimationFrame(() => {
    if (el.roleCardPickerDialog?.open) {
      renderRoleCardPicker(appState, { force: true });
    }
  });
}

async function startCurrentChatTarget() {
  const activeCardId = appState?.activeRoleCardId || "";
  if (activeCardId) {
    await startRoleCard(activeCardId);
    return;
  }
  if (isAssistantActive(appState)) {
    await startAssistantCard(appState.activeAssistantMode);
    return;
  }
  openRoleCardPicker();
  showToast("請先選擇要開始的角色卡");
}

function openNovelAiDialog() {
  window.location.href = "/novelai.html";
}

async function stopActiveChatGeneration() {
  const payload = await request("/api/chat/stop", { method: "POST" });
  showToast(payload?.message || "已送出停止要求");
}

async function rewriteRecentUserInputFromCommand(num, comment = "") {
  if (!appState?.aiSessionStarted) {
    showToast("尚未開始對話，不能改寫輸入。", "error");
    return;
  }
  const previousImageCount = (appState?.conversation || []).filter((message) => isImageOnlyMessage(message)).length;
  try {
    isChatStreaming = true;
    renderStatus(appState);
    showToast(`正在改寫倒數第 ${num} 次使用者輸入...`);
    const payload = await request("/api/chat/reload", {
      method: "POST",
      body: JSON.stringify({ num, comment })
    });
    appState = payload?.state || appState;
    renderMessages(appState);
    renderAiLogs(appState);
    renderStatus(appState);
    realignMobileChat({ scroll: true });
    if (payload?.backgroundImageGeneration) {
      scheduleBackgroundImageRefresh(previousImageCount);
    }
    showToast(`已改寫倒數第 ${num} 次使用者輸入`);
  } finally {
    isChatStreaming = false;
    if (appState) {
      renderStatus(appState);
    }
  }
}

function showCurrentChatStatus() {
  const activeCard = getActiveRoleCardFromState(appState);
  const target = activeCard?.name || (isAssistantActive(appState) ? getActiveAssistantName(appState) : "未選擇");
  showToast(`${appState?.aiSessionStarted ? "已開始" : "尚未開始"}｜${target}`);
}

async function runChatCommandAction(action = "", args = []) {
  if (action === "start") {
    await startCurrentChatTarget();
    return;
  }
  if (action === "status") {
    showCurrentChatStatus();
    return;
  }
  if (action === "stop") {
    await stopActiveChatGeneration();
    return;
  }
}

async function runChatCommandMenuItem(item) {
  closeChatCommandMenu();
  if (item.form) {
    startChatCommandForm(item);
    return;
  }
  if (item.insert) {
    insertChatCommandTemplate(item.insert);
    return;
  }
  await runChatCommandAction(item.action);
}

async function handleChatSlashCommand(content = "") {
  const trimmed = String(content || "").trim();
  if (!trimmed.startsWith("/")) {
    return false;
  }
  const parts = trimmed.slice(1).trim().split(/\s+/u).filter(Boolean);
  const command = String(parts[0] || "").trim().toLowerCase();
  const args = parts.slice(1);
  if (!command) {
    openChatCommandMenu();
    return true;
  }

  if (command === "ai_start" || command === "start") {
    await runChatCommandAction("start", args);
    clearChatInputValue();
    return true;
  }
  if (command === "ai_status" || command === "status") {
    await runChatCommandAction("status", args);
    clearChatInputValue();
    return true;
  }
  if (command === "stop") {
    await runChatCommandAction("stop", args);
    clearChatInputValue();
    return true;
  }
  if (command === "reload") {
    const numValue = args[0] || "";
    const comment = args.slice(1).join(" ").trim();
    const num = Number(numValue);
    if (!Number.isInteger(num) || num < 1 || !comment) {
      startChatCommandForm(getChatCommandMenuItemByForm("reload"), {
        num: Number.isInteger(num) && num >= 1 ? String(num) : "1",
        comment,
        focusField: Number.isInteger(num) && num >= 1 ? "comment" : "num"
      });
      return true;
    }
    await rewriteRecentUserInputFromCommand(num, comment);
    clearChatInputValue();
    return true;
  }
  showToast(`未知指令：/${command}`, "error");
  openChatCommandMenu();
  return true;
}

function isMobileLayout() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
}

function getMobileViewportHeight() {
  const visualHeight = window.visualViewport?.height;
  const fallbackHeight = window.innerHeight || document.documentElement.clientHeight || 0;
  return Math.max(220, Math.round(Number(visualHeight || fallbackHeight || 0)));
}

function getMobileViewportOffsetTop() {
  const offsetTop = Number(window.visualViewport?.offsetTop || 0);
  return Number.isFinite(offsetTop) ? Math.max(0, Math.round(offsetTop)) : 0;
}

function getChatInputHeight() {
  if (!el.chatForm || !isMobileLayout()) {
    return 76;
  }
  const rect = el.chatForm.getBoundingClientRect();
  return Math.max(64, Math.ceil(Number(rect.height || 0)) || 76);
}

function resizeChatInput() {
  if (!el.chatInput) {
    return;
  }
  const input = el.chatInput;
  const computed = window.getComputedStyle(input);
  const minHeight = Number.parseFloat(computed.minHeight) || 48;
  const maxHeight = Number.parseFloat(computed.maxHeight) || (isMobileLayout() ? 132 : 168);
  input.style.height = `${minHeight}px`;
  const nextHeight = Math.min(Math.max(input.scrollHeight, minHeight), maxHeight);
  input.style.height = `${nextHeight}px`;
  input.style.overflowY = input.scrollHeight > maxHeight ? "auto" : "hidden";
  updateMobileViewportMetrics();
}

function updateMobileViewportMetrics() {
  const applyMetrics = () => {
    mobileViewportUpdateFrame = 0;
    document.documentElement.style.setProperty("--app-mobile-viewport-height", `${getMobileViewportHeight()}px`);
    document.documentElement.style.setProperty("--app-mobile-viewport-offset-top", `${getMobileViewportOffsetTop()}px`);
    document.documentElement.style.setProperty("--chat-input-height", `${getChatInputHeight()}px`);
  };

  if (typeof window.requestAnimationFrame !== "function") {
    applyMetrics();
    return;
  }

  if (mobileViewportUpdateFrame) {
    window.cancelAnimationFrame(mobileViewportUpdateFrame);
  }
  mobileViewportUpdateFrame = window.requestAnimationFrame(applyMetrics);
}

function scrollMessagesToBottom() {
  if (!el.messages) {
    return;
  }
  el.messages.scrollTop = el.messages.scrollHeight;
}

function scrollMessageNumberIntoView(messageNumber) {
  if (!el.messages) {
    return false;
  }
  const normalizedMessageNumber = Math.floor(Number(messageNumber || ""));
  if (!Number.isFinite(normalizedMessageNumber) || normalizedMessageNumber < 1) {
    return false;
  }
  const target = el.messages.querySelector(`[data-message-number="${normalizedMessageNumber}"]`);
  if (!target) {
    return false;
  }
  updateMobileViewportMetrics();
  const containerRect = el.messages.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const nextTop = el.messages.scrollTop + targetRect.top - containerRect.top - 10;
  el.messages.scrollTop = Math.max(0, nextTop);
  return true;
}

function realignMobileChat(options = {}) {
  updateMobileViewportMetrics();
  const shouldScroll = options.scroll || (isMobileLayout() && document.activeElement === el.chatInput);
  if (!shouldScroll) {
    return;
  }

  if (typeof window.requestAnimationFrame === "function") {
    if (mobileMessageScrollFrame) {
      window.cancelAnimationFrame(mobileMessageScrollFrame);
    }
    mobileMessageScrollFrame = window.requestAnimationFrame(() => {
      mobileMessageScrollFrame = 0;
      scrollMessagesToBottom();
    });
  } else {
    scrollMessagesToBottom();
  }

  window.setTimeout(scrollMessagesToBottom, 120);
}

function setMobilePage(page) {
  mobilePage = page === "controls" ? "controls" : "chat";
  mobileInfoOpen = false;
  applyMobilePage();
}

function applyMobilePage() {
  if (!isMobileLayout()) {
    document.body.removeAttribute("data-mobile-page");
    document.body.removeAttribute("data-mobile-info-open");
  } else {
    document.body.dataset.mobilePage = mobilePage;
    document.body.dataset.mobileInfoOpen = mobileInfoOpen ? "true" : "false";
  }

  if (el.mobilePageChatBtn) {
    el.mobilePageChatBtn.className = mobilePage === "chat" ? "secondary" : "muted";
    el.mobilePageChatBtn.setAttribute("aria-pressed", mobilePage === "chat" ? "true" : "false");
  }

  if (el.mobilePageControlsBtn) {
    el.mobilePageControlsBtn.className = mobilePage === "controls" ? "secondary" : "muted";
    el.mobilePageControlsBtn.setAttribute("aria-pressed", mobilePage === "controls" ? "true" : "false");
  }

  if (el.mobileInfoToggleBtn) {
    const toggleLabel = mobileInfoOpen ? "關閉導覽" : "開啟導覽";
    el.mobileInfoToggleBtn.textContent = mobileInfoOpen ? "×" : "☰";
    el.mobileInfoToggleBtn.setAttribute("aria-label", toggleLabel);
    el.mobileInfoToggleBtn.title = toggleLabel;
    el.mobileInfoToggleBtn.setAttribute("aria-expanded", mobileInfoOpen ? "true" : "false");
  }

  realignMobileChat({ scroll: isMobileLayout() && mobilePage === "chat" });
}

function fillProfile(state) {
  const { userProfile } = state;
  el.displayName.value = userProfile.displayName || "";
  el.identityText.value = userProfile.identityText || "";
}

function renderRoleCards(state) {
  el.roleCardList?.replaceChildren();
  if (el.roleCardPickerDialog?.open) {
    renderRoleCardPicker(state, { force: true });
  }
}

function renderRoleCardPicker(state = appState, options = {}) {
  if (!el.roleCardPickerGrid || !state || (!options.force && !el.roleCardPickerDialog?.open)) {
    return;
  }

  const roleCards = Array.isArray(state.roleCards) ? state.roleCards : [];
  const assistantCards = getAssistantCards(state);
  const itemCount = assistantCards.length + roleCards.length;
  const totalPages = Math.max(1, Math.ceil(itemCount / ROLE_CARD_PICKER_PAGE_SIZE));
  roleCardPickerPage = Math.min(Math.max(1, roleCardPickerPage), totalPages);
  const startIndex = (roleCardPickerPage - 1) * ROLE_CARD_PICKER_PAGE_SIZE;
  const endIndex = Math.min(itemCount, startIndex + ROLE_CARD_PICKER_PAGE_SIZE);
  const pageItems = [];
  for (let index = startIndex; index < endIndex; index += 1) {
    if (index < assistantCards.length) {
      pageItems.push({ type: "assistant", assistantCard: assistantCards[index] });
    } else {
      pageItems.push({ type: "card", card: roleCards[index - assistantCards.length] });
    }
  }

  el.roleCardPickerGrid.innerHTML = "";

  if (!pageItems.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚無角色卡。";
    el.roleCardPickerGrid.appendChild(empty);
  }

  pageItems.forEach((item) => {
    if (item.type === "assistant") {
      el.roleCardPickerGrid.appendChild(createAssistantPickerTile(item.assistantCard, state));
      return;
    }
    el.roleCardPickerGrid.appendChild(createRoleCardPickerTile(item.card, state));
  });

  if (el.roleCardPickerPageInfo) {
    el.roleCardPickerPageInfo.textContent = `第 ${roleCardPickerPage} / ${totalPages} 頁`;
  }
  if (el.roleCardPickerPrevBtn) {
    el.roleCardPickerPrevBtn.disabled = roleCardPickerPage <= 1;
  }
  if (el.roleCardPickerNextBtn) {
    el.roleCardPickerNextBtn.disabled = roleCardPickerPage >= totalPages;
  }
}

function createPickerCover(content, fallbackText = "封面", position = "center center") {
  const cover = document.createElement("div");
  cover.className = "role-picker-cover";
  const image = String(content || "").trim();
  if (image) {
    const img = document.createElement("img");
    img.src = image;
    img.alt = fallbackText;
    img.loading = "lazy";
    img.decoding = "async";
    img.style.objectPosition = normalizeCoverPosition(position);
    cover.appendChild(img);
  } else {
    cover.textContent = fallbackText;
  }
  return cover;
}

function createAssistantPickerTile(assistantCard, state) {
  const tile = document.createElement("article");
  tile.className = "role-picker-card";
  if (state.activeAssistantMode === assistantCard?.id) {
    tile.classList.add("active");
  }

  const title = document.createElement("h4");
  const assistantName = getAssistantCardName(assistantCard);
  title.textContent = state.activeAssistantMode === assistantCard?.id
    ? `${assistantName}（目前使用）`
    : assistantName;

  const intro = document.createElement("p");
  intro.className = "role-picker-intro";
  intro.textContent = `簡介：${assistantCard?.description || DEFAULT_ASSISTANT_CARD_DESCRIPTION}`;

  const content = document.createElement("p");
  content.className = "role-picker-content";
  content.textContent = "內容：啟用後會重置目前對話，只使用助手卡 Prompt 直接回覆。";

  const actions = document.createElement("div");
  actions.className = "role-picker-actions";

  const startBtn = document.createElement("button");
  startBtn.className = "secondary";
  startBtn.type = "button";
  startBtn.textContent = pendingRoleCardStartId === assistantCard?.id ? "處理中..." : "啟用助手";
  startBtn.disabled = Boolean(pendingRoleCardStartId);
  startBtn.addEventListener("click", async () => {
    await startAssistantCard(assistantCard?.id || CHARACTER_CARD_CREATION_ASSISTANT_MODE);
    el.roleCardPickerDialog?.close();
  });

  const promptBtn = document.createElement("button");
  promptBtn.className = "muted";
  promptBtn.type = "button";
  promptBtn.textContent = "編輯 Prompt";
  promptBtn.addEventListener("click", () => {
    el.roleCardPickerDialog?.close();
    openAssistantPromptDialog(assistantCard);
  });

  actions.append(startBtn, promptBtn);
  if (!assistantCard?.locked) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "muted";
    deleteBtn.type = "button";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => removeAssistantCard(assistantCard));
    actions.append(deleteBtn);
  }
  tile.append(createPickerCover("", "助手"), title, intro, actions);
  return tile;
}

function createRoleCardPickerTile(card, state) {
  const tile = document.createElement("article");
  tile.className = "role-picker-card";
  if (state.activeRoleCardId === card.id) {
    tile.classList.add("active");
  }

  const title = document.createElement("h4");
  title.textContent = state.activeRoleCardId === card.id
    ? `${card.name || "未命名角色卡"}（目前使用）`
    : card.name || "未命名角色卡";

  const intro = document.createElement("p");
  intro.className = "role-picker-intro";
  intro.textContent = `簡介：${truncateText(buildRoleCardIntro(card, state) || "未填簡介", 120)}`;

  const content = document.createElement("p");
  content.className = "role-picker-content";
  content.textContent = `內容：${truncateText(buildRoleCardContent(card, state), 190)}`;

  const actions = document.createElement("div");
  actions.className = "role-picker-actions";

  const startBtn = document.createElement("button");
  startBtn.className = "secondary";
  startBtn.type = "button";
  startBtn.textContent = pendingRoleCardStartId === card.id ? "處理中..." : "作為開始";
  startBtn.disabled = Boolean(pendingRoleCardStartId);
  startBtn.addEventListener("click", async () => {
    await startRoleCard(card.id);
    el.roleCardPickerDialog?.close();
  });

  const editBtn = document.createElement("button");
  editBtn.className = "secondary";
  editBtn.type = "button";
  editBtn.textContent = "編輯";
  editBtn.disabled = Boolean(pendingRoleCardStartId);
  editBtn.addEventListener("click", () => {
    el.roleCardPickerDialog?.close();
    openRoleCardDialog(card);
  });

  const exportBtn = document.createElement("button");
  exportBtn.className = "secondary";
  exportBtn.type = "button";
  exportBtn.textContent = "匯出";
  exportBtn.disabled = Boolean(pendingRoleCardStartId);
  exportBtn.addEventListener("click", () => exportRoleCard(card));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "muted";
  deleteBtn.type = "button";
  deleteBtn.textContent = "刪除";
  deleteBtn.disabled = Boolean(pendingRoleCardStartId);
  deleteBtn.addEventListener("click", () => removeRoleCard(card));

  actions.append(startBtn, editBtn, exportBtn, deleteBtn);
  tile.append(createPickerCover(card.coverImage, card.name || "封面", card.coverPosition), title, intro, actions);
  return tile;
}

function getSessionRoleCardLabel(session) {
  return session?.roleCardName || session?.assistantMode || "未指定角色卡";
}

function renderSessionPreviewPlaceholder(message = "尚未選擇存檔。") {
  selectedSessionPreviewId = "";
  selectedSessionPreview = null;
  if (el.sessionPreviewTitle) {
    el.sessionPreviewTitle.textContent = "存檔預覽";
  }
  if (el.sessionPreviewMeta) {
    el.sessionPreviewMeta.textContent = "選擇一本存檔查看對話。";
  }
  if (el.sessionPreviewActions) {
    el.sessionPreviewActions.hidden = true;
  }
  if (el.sessionPreviewMessages) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = message;
    el.sessionPreviewMessages.replaceChildren(empty);
  }
}

function renderSessionPicker(state = appState) {
  if (!el.sessionPickerGrid || !state) {
    return;
  }
  const sessions = Array.isArray(state.savedSessionsMeta)
    ? [...state.savedSessionsMeta].reverse()
    : [];
  if (selectedSessionPreviewId && !sessions.some((session) => session.id === selectedSessionPreviewId)) {
    renderSessionPreviewPlaceholder();
  }
  const totalPages = Math.max(1, Math.ceil(sessions.length / SESSION_PICKER_PAGE_SIZE));
  sessionPickerPage = Math.min(Math.max(1, sessionPickerPage), totalPages);
  const startIndex = (sessionPickerPage - 1) * SESSION_PICKER_PAGE_SIZE;
  const pageItems = sessions.slice(startIndex, startIndex + SESSION_PICKER_PAGE_SIZE);
  el.sessionPickerGrid.replaceChildren();

  if (!pageItems.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚無對話存檔。";
    el.sessionPickerGrid.appendChild(empty);
  } else {
    for (let index = 0; index < pageItems.length; index += 3) {
      const shelf = document.createElement("section");
      shelf.className = "session-shelf";
      shelf.setAttribute("aria-label", `第 ${Math.floor(index / 3) + 1} 層`);
      const books = document.createElement("div");
      books.className = "session-shelf-books";
      pageItems.slice(index, index + 3).forEach((session, bookIndex) => {
        books.appendChild(createSessionBook(session, index + bookIndex));
      });
      shelf.appendChild(books);
      el.sessionPickerGrid.appendChild(shelf);
    }
  }

  if (el.sessionPickerCount) {
    el.sessionPickerCount.textContent = `共 ${sessions.length} 個存檔`;
  }
  if (el.sessionPickerPageInfo) {
    el.sessionPickerPageInfo.textContent = `第 ${sessionPickerPage} / ${totalPages} 頁`;
  }
  if (el.sessionPickerPrevBtn) {
    el.sessionPickerPrevBtn.disabled = sessionPickerPage <= 1;
  }
  if (el.sessionPickerNextBtn) {
    el.sessionPickerNextBtn.disabled = sessionPickerPage >= totalPages;
  }
}

function createSessionBook(session, index) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = `session-book session-book-tone-${index % 6}`;
  if (selectedSessionPreviewId === session.id) {
    item.classList.add("previewing");
  }
  item.title = `預覽「${session.name || "未命名存檔"}」`;
  item.setAttribute("aria-label", item.title);
  item.addEventListener("click", () => previewSession(session.id));

  const binding = document.createElement("span");
  binding.className = "session-book-binding";

  const title = document.createElement("strong");
  title.className = "session-book-title";
  title.textContent = session.name || "未命名存檔";

  const meta = document.createElement("span");
  meta.className = "session-book-meta";
  meta.textContent = `${session.messageCount || 0} 則`;

  item.append(binding, title, meta);
  return item;
}

function renderSessionPreview(session = {}) {
  const conversation = Array.isArray(session.conversation) ? session.conversation : [];
  selectedSessionPreviewId = session.id || "";
  selectedSessionPreview = session;
  if (el.sessionPreviewTitle) {
    el.sessionPreviewTitle.textContent = session.name || "存檔預覽";
  }
  if (el.sessionPreviewMeta) {
    const updatedText = session.updatedAt
      ? new Date(session.updatedAt).toLocaleString("zh-Hant")
      : "未知時間";
    el.sessionPreviewMeta.textContent =
      `${getSessionRoleCardLabel(session)}｜${conversation.length} 則訊息｜${updatedText}`;
  }
  if (el.sessionPreviewActions) {
    el.sessionPreviewActions.hidden = false;
  }
  if (!el.sessionPreviewMessages) {
    return;
  }
  if (!conversation.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "這個存檔沒有對話內容。";
    el.sessionPreviewMessages.replaceChildren(empty);
    renderSessionPicker(appState);
    return;
  }

  const fragment = document.createDocumentFragment();
  conversation.forEach((message, index) => {
    const item = document.createElement("article");
    item.className = `session-preview-message ${message.role || "unknown"}`;

    const header = document.createElement("div");
    header.className = "session-preview-message-header";
    const author = document.createElement("strong");
    author.textContent = `#${index + 1} ${message.role === "assistant" ? getSessionRoleCardLabel(session) : "使用者"}`;
    const timestamp = document.createElement("span");
    timestamp.textContent = message.createdAt ? formatMessageTimestamp(message.createdAt) : "";
    header.append(author, timestamp);

    const body = document.createElement("div");
    body.className = "session-preview-message-body markdown-body";
    body.innerHTML = renderMarkdownToHtml(message.content || "", {
      allowHtml: message.role === "assistant"
    });

    const imageAttachments = getMessageImageAttachments(message);
    if (imageAttachments.length > 0) {
      const imageGrid = document.createElement("div");
      imageGrid.className = "message-image-grid";
      imageAttachments.forEach((image) => {
        const link = document.createElement("a");
        link.className = "message-image-link";
        link.href = image.imageUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        const img = document.createElement("img");
        img.src = image.imageUrl;
        img.alt = image.fileName || "generated image";
        img.loading = "lazy";
        link.appendChild(img);
        imageGrid.appendChild(link);
      });
      body.appendChild(imageGrid);
    }

    item.append(header, body);
    fragment.appendChild(item);
  });
  el.sessionPreviewMessages.replaceChildren(fragment);
  renderSessionPicker(appState);
  if (isMobileLayout()) {
    window.requestAnimationFrame(() => {
      el.sessionPreviewPanel?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

async function previewSession(sessionId = "") {
  if (!sessionId) {
    return;
  }
  selectedSessionPreviewId = sessionId;
  if (el.sessionPreviewTitle) {
    el.sessionPreviewTitle.textContent = "讀取預覽中...";
  }
  if (el.sessionPreviewMeta) {
    el.sessionPreviewMeta.textContent = "";
  }
  renderSessionPicker(appState);
  try {
    const payload = await request(`/api/sessions/${encodeURIComponent(sessionId)}`, { method: "GET" });
    renderSessionPreview(payload.session || {});
  } catch (error) {
    renderSessionPreviewPlaceholder(error.message || "存檔預覽讀取失敗。");
    showToast(error.message || "存檔預覽讀取失敗", "error");
  }
}

function openSessionPicker() {
  sessionPickerPage = 1;
  renderSessionPicker(appState);
  el.sessionPickerDialog?.showModal();
}

async function saveSession() {
  const suggested = `對話存檔 ${new Date().toLocaleString("zh-Hant")}`;
  const input = window.prompt("請輸入存檔名稱", suggested);
  if (input === null) {
    return;
  }
  try {
    const payload = await request("/api/sessions/save", {
      method: "POST",
      body: JSON.stringify({ name: input.trim() })
    });
    appState = payload?.state || appState;
    await refresh();
    showToast("已保存目前對話");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadSession(session) {
  const ok = window.confirm(
    `載入「${session?.name || "這個存檔"}」會取代目前對話，確定要繼續嗎？`
  );
  if (!ok) {
    return;
  }
  try {
    const payload = await request(`/api/sessions/${encodeURIComponent(session.id)}/load`, {
      method: "POST",
      body: JSON.stringify({})
    });
    appState = payload?.state || appState;
    el.sessionPickerDialog?.close();
    await refresh();
    showToast("已載入對話存檔");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function deleteSession(session) {
  const ok = window.confirm(`確定要刪除對話存檔「${session.name}」嗎？此操作無法復原。`);
  if (!ok) {
    return;
  }
  try {
    const payload = await request(`/api/sessions/${encodeURIComponent(session.id)}`, {
      method: "DELETE"
    });
    appState = payload?.state || appState;
    await refresh();
    showToast("對話存檔已刪除");
  } catch (error) {
    showToast(error.message, "error");
  }
}

function getActiveRoleCardFromState(state = appState) {
  return (state?.roleCards || []).find((card) => card.id === state?.activeRoleCardId) || null;
}

function getWebDisplayConfig(state = appState) {
  const activeCard = getActiveRoleCardFromState(state);
  return {
    userName: state?.webDisplay?.userName || state?.userProfile?.displayName || "User",
    aiName: state?.webDisplay?.aiName || activeCard?.name || "AI",
    aiBadge: state?.chatApi?.model || "AI",
    userAvatar: state?.webDisplay?.userAvatar || "",
    aiAvatar: state?.webDisplay?.aiAvatar || activeCard?.coverImage || "",
    backgroundImage: state?.webDisplay?.backgroundImage || "",
    dailyWelcomeAudio: state?.webDisplay?.dailyWelcomeAudio || "/assets/audio/welcome-back.mp3"
  };
}

function createCssUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) {
    return "";
  }
  const escaped = raw
    .replace(/\\/gu, "\\\\")
    .replace(/"/gu, "\\\"")
    .replace(/\n|\r/gu, "");
  return `url("${escaped}")`;
}

function applyWebDisplaySettings(state = appState) {
  const display = getWebDisplayConfig(state);
  const backgroundImage = String(display.backgroundImage || "").trim();
  document.body.classList.toggle("has-custom-background", Boolean(backgroundImage));
  if (backgroundImage) {
    document.body.style.setProperty("--web-background-image", createCssUrl(backgroundImage));
  } else {
    document.body.style.removeProperty("--web-background-image");
  }
}

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStoredDailyWelcomeKey() {
  try {
    return localStorage.getItem(DAILY_WELCOME_PLAYED_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function setStoredDailyWelcomeKey(value = "") {
  try {
    localStorage.setItem(DAILY_WELCOME_PLAYED_STORAGE_KEY, value);
  } catch {
    // Storage can fail in private contexts; playback should still work for this page load.
  }
}

function playDailyWelcomeAudio(state = appState) {
  const audioSrc = String(getWebDisplayConfig(state).dailyWelcomeAudio || "").trim();
  const todayKey = getLocalDateKey();
  if (!audioSrc || getStoredDailyWelcomeKey() === todayKey || dailyWelcomeAudioArmed) {
    return;
  }

  const audio = new Audio(audioSrc);
  audio.preload = "auto";
  audio.volume = 0.72;

  const markPlayed = () => {
    setStoredDailyWelcomeKey(todayKey);
    dailyWelcomeAudioArmed = false;
    window.removeEventListener("pointerdown", playAfterGesture);
    window.removeEventListener("keydown", playAfterGesture);
  };
  const tryPlay = async () => {
    await audio.play();
    markPlayed();
  };
  const playAfterGesture = () => {
    tryPlay().catch(() => {
      dailyWelcomeAudioArmed = false;
      window.removeEventListener("pointerdown", playAfterGesture);
      window.removeEventListener("keydown", playAfterGesture);
    });
  };

  tryPlay().catch(() => {
    dailyWelcomeAudioArmed = true;
    window.addEventListener("pointerdown", playAfterGesture, { once: true, passive: true });
    window.addEventListener("keydown", playAfterGesture, { once: true });
  });
}

function createAvatarElement(url = "", label = "", role = "") {
  const avatar = document.createElement("div");
  avatar.className = `discord-avatar ${role ? `discord-avatar-${role}` : ""}`;
  const normalizedUrl = String(url || "").trim();
  const fallback = document.createElement("span");
  fallback.textContent = getInitials(label || role || "?");
  avatar.appendChild(fallback);
  if (normalizedUrl) {
    const image = document.createElement("img");
    image.alt = "";
    image.loading = "eager";
    image.decoding = "async";
    image.addEventListener("load", () => avatar.classList.add("has-image"));
    image.addEventListener("error", () => {
      avatar.classList.remove("has-image");
      image.remove();
    });
    avatar.appendChild(image);
    image.src = normalizedUrl;
    if (image.complete && image.naturalWidth > 0) {
      avatar.classList.add("has-image");
    }
  }
  return avatar;
}

function getInitials(value = "") {
  const text = String(value || "").trim();
  if (!text) {
    return "?";
  }
  const compact = text.replace(/\s+/g, "");
  return Array.from(compact).slice(0, 2).join("");
}

function formatDateDivider(value = "") {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatMessageTimestamp(value = "") {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleString("zh-Hant", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function getMessageAuthorInfo(message = {}, state = appState) {
  const display = getWebDisplayConfig(state);
  if (message.role === "assistant") {
    return {
      name: display.aiName,
      avatar: display.aiAvatar,
      badge: display.aiBadge
    };
  }
  return {
    name: display.userName,
    avatar: display.userAvatar,
    badge: message.source === "discord" ? "Discord" : ""
  };
}

function getMessageStreamingReasoningText(message = {}) {
  return typeof message.streamingReasoning === "string"
    ? message.streamingReasoning
    : typeof message.extra?.streamingReasoning === "string"
      ? message.extra.streamingReasoning
      : "";
}

function isMessageEdited(message = {}) {
  return Boolean(
    message.edited
      || message.replayFromDiscordEdit
      || message.replayFromWebEdit
      || message.extra?.replayFromDiscordEdit
      || message.extra?.replayFromWebEdit
  );
}

function normalizeAssistantFeedbackType(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "like" || normalized === "dislike" ? normalized : "";
}

function getMessageFeedbackType(message = {}) {
  return normalizeAssistantFeedbackType(message.feedback || message.extra?.feedback);
}

function getMessageImageAttachments(message = {}) {
  const source = message?.images || message?.extra?.images || message?.extra?.novelAiImages || [];
  return (Array.isArray(source) ? source : [])
    .map((item) => {
      const imageUrl = String(item?.imageUrl || item?.url || item?.dataUrl || "").trim();
      if (!imageUrl) {
        return null;
      }
      return {
        imageUrl,
        fileName: String(item?.fileName || item?.name || "generated-image.png").trim(),
        prompt: String(item?.prompt || "").trim()
      };
    })
    .filter(Boolean);
}

function isImageOnlyMessage(message = {}) {
  return Boolean(message?.imageOnly || message?.extra?.imageOnly || getMessageImageAttachments(message).length > 0);
}

function openEditAssistantMessage(messageId = "") {
  if (!messageId) {
    return;
  }
  refreshAssistantSelector();
  if (el.assistantMessageSelect) {
    el.assistantMessageSelect.value = messageId;
  }
  onAssistantMessagePick();
  el.editAiDialog?.showModal();
}

function openEditUserMessage(message = {}) {
  if (!message?.id || message.role !== "user") {
    return;
  }
  editingUserMessageId = message.id;
  if (el.editMessageContent) {
    el.editMessageContent.value = String(message.content || "");
  }
  if (el.editMessageHint) {
    const messageNumber = (appState?.conversation || []).findIndex((item) => item?.id === message.id) + 1;
    el.editMessageHint.textContent = `保存後會刪除此訊息之後的對話，並從第 ${messageNumber || "?"} 則重新生成。`;
  }
  el.editMessageDialog?.showModal();
  window.setTimeout(() => {
    el.editMessageContent?.focus();
    el.editMessageContent?.setSelectionRange?.(el.editMessageContent.value.length, el.editMessageContent.value.length);
  }, 0);
}

async function submitEditUserMessage() {
  const messageId = editingUserMessageId;
  const content = String(el.editMessageContent?.value || "").trim();
  if (!messageId || !content) {
    showToast("請填入要重新生成的訊息內容", "error");
    return;
  }
  const previousState = appState;
  const previousImageCount = (appState?.conversation || []).filter((message) => isImageOnlyMessage(message)).length;
  const conversation = Array.isArray(appState?.conversation) ? appState.conversation : [];
  const targetIndex = conversation.findIndex((item) => item?.id === messageId);
  const targetMessageNumber = targetIndex + 1;
  editingUserMessageId = "";
  el.editMessageDialog?.close();
  scrollMessageNumberIntoView(targetMessageNumber);
  try {
    isChatStreaming = true;
    renderStatus(appState);
    showToast("正在從編輯後的訊息重新生成...");
    const payload = await request(`/api/messages/${messageId}/replay-edit`, {
      method: "POST",
      body: JSON.stringify({ content })
    });
    appState = payload?.state || appState;
    renderMessages(appState, { focusMessageNumber: targetMessageNumber, scroll: false });
    renderAiLogs(appState);
    renderStatus(appState);
    refreshAssistantSelector();
    if (payload?.backgroundImageGeneration) {
      scheduleBackgroundImageRefresh(previousImageCount);
    }
    showToast("已刪除後續分支並重新生成");
  } catch (error) {
    appState = previousState;
    if (appState) {
      renderMessages(appState, { focusMessageNumber: targetMessageNumber, scroll: false });
      renderAiLogs(appState);
      renderStatus(appState);
      refreshAssistantSelector();
    }
    throw error;
  } finally {
    isChatStreaming = false;
    if (appState) {
      renderStatus(appState);
    }
  }
}

async function copyMessageText(message = {}) {
  const text = String(message.content || "");
  if (!text) {
    showToast("沒有可複製的內容", "error");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast("已複製文字");
  } catch {
    showToast("瀏覽器不允許直接複製，請手動選取文字。", "error");
  }
}

async function setAssistantMessageFeedback(messageId = "", feedback = "") {
  const normalizedFeedback = normalizeAssistantFeedbackType(feedback);
  if (!messageId || !normalizedFeedback) {
    return;
  }
  const currentMessage = (appState?.conversation || []).find((item) => item?.id === messageId);
  const currentFeedback = getMessageFeedbackType(currentMessage || {});
  const shouldClear = currentFeedback === normalizedFeedback;
  try {
    const payload = await request(`/api/messages/${messageId}/feedback`, {
      method: "POST",
      body: JSON.stringify(shouldClear ? { feedback: "clear" } : { feedback: normalizedFeedback })
    });
    if (payload?.state) {
      appState = payload.state;
      renderMessages(appState);
      renderAiLogs(appState);
      renderStatus(appState);
      refreshAssistantSelector();
    } else {
      await refresh();
    }
    if (payload?.cleared) {
      showToast("已取消表情標記");
      return;
    }
    showToast(
      payload?.pendingForNextUser
        ? `已標記：${ASSISTANT_FEEDBACK_LABELS[normalizedFeedback]}，會套用在下一則輸入`
        : `已標記：${ASSISTANT_FEEDBACK_LABELS[normalizedFeedback]}`
    );
  } catch (error) {
    showToast(error.message, "error");
  }
}

function getChatInputPlaceholder(state = appState, display = getWebDisplayConfig(state)) {
  const hasConversationTarget = Boolean(
    state?.aiSessionStarted && (state.activeRoleCardId || isAssistantActive(state))
  );
  if (!hasConversationTarget) {
    return isMobileLayout() ? "請先選擇角色卡" : "請先選擇角色卡或啟用助手";
  }
  return isMobileLayout() ? "輸入訊息" : `傳送訊息給 ${display.aiName || "AI"}`;
}

function renderChatHeader(state = appState) {
  const display = getWebDisplayConfig(state);
  const activeCard = getActiveRoleCardFromState(state);
  if (el.chatHeaderTitle) {
    el.chatHeaderTitle.textContent = display.aiName || "時分居酒屋";
  }
  if (el.chatHeaderSubtitle) {
    el.chatHeaderSubtitle.textContent = state?.aiSessionStarted
      ? [
          activeCard?.name ? `角色卡：${activeCard.name}` : isAssistantActive(state) ? getActiveAssistantName(state) : "對話已開始",
          state?.discord?.connected ? "Discord 已連線" : "本地對話"
        ].filter(Boolean).join("｜")
      : "選擇角色卡後開始對話";
  }
  if (el.chatHeaderAvatar) {
    el.chatHeaderAvatar.innerHTML = "";
    el.chatHeaderAvatar.appendChild(createAvatarElement(display.aiAvatar, display.aiName, "assistant"));
  }
  if (el.chatInput) {
    el.chatInput.placeholder = getChatInputPlaceholder(state, display);
  }
}

function renderMessages(state, options = {}) {
  const conversation = Array.isArray(state.conversation) ? [...state.conversation] : [];
  renderChatHeader(state);

  if (!conversation.length) {
    const empty = document.createElement("p");
    empty.className = "discord-empty";
    empty.textContent = "尚無對話。";
    el.messages.replaceChildren(empty);
    realignMobileChat();
    return;
  }

  const fragment = document.createDocumentFragment();
  let lastDivider = "";
  conversation.forEach((message, index) => {
    const dividerLabel = formatDateDivider(message.createdAt);
    if (dividerLabel && dividerLabel !== lastDivider) {
      const divider = document.createElement("div");
      divider.className = "discord-date-divider";
      divider.textContent = dividerLabel;
      fragment.appendChild(divider);
      lastDivider = dividerLabel;
    }

    const author = getMessageAuthorInfo(message, state);
    const wrapper = document.createElement("article");
    wrapper.className = `message discord-message ${message.role}`;
    wrapper.dataset.messageNumber = String(index + 1);
    if (message.id) {
      wrapper.dataset.messageId = message.id;
    }

    const avatar = createAvatarElement(author.avatar, author.name, message.role);

    const body = document.createElement("div");
    body.className = "discord-message-body";

    const header = document.createElement("div");
    header.className = "discord-message-header";

    const name = document.createElement("span");
    name.className = "discord-message-author";
    name.textContent = author.name;

    header.appendChild(name);
    if (author.badge) {
      const badge = document.createElement("span");
      badge.className = "discord-message-badge";
      badge.textContent = author.badge;
      header.appendChild(badge);
    }

    const timestamp = document.createElement("span");
    timestamp.className = "discord-message-time";
    timestamp.textContent = formatMessageTimestamp(message.createdAt);
    header.appendChild(timestamp);

    if (isMessageEdited(message)) {
      const edited = document.createElement("span");
      edited.className = "discord-message-edited";
      edited.textContent = "已編輯";
      header.appendChild(edited);
    }

    const content = document.createElement("div");
    content.className = "message-content discord-message-content";
    const streamingReasoning = getMessageStreamingReasoningText(message);
    const showStreamingReasoning = message.role === "assistant"
      && message.streaming
      && !String(message.content || "").trim()
      && Boolean(streamingReasoning);
    if (showStreamingReasoning) {
      content.classList.add("streaming-reasoning");
    }
    const fullContent = showStreamingReasoning ? streamingReasoning : message.content || (
      message.phase === "compression"
        ? "正在處理模型內容..."
        : "正在生成回覆..."
    );
    const fullContentBody = document.createElement("div");
    fullContentBody.className = "markdown-body";
    fullContentBody.innerHTML = renderMarkdownToHtml(fullContent, {
      allowHtml: message.role === "assistant"
    });
    if (message.role === "assistant" && (message.compressionNotice || message.extra?.compressionNotice)) {
      const compressionNotice = document.createElement("div");
      compressionNotice.className = "compression-notice";
      compressionNotice.textContent = "【( •̀ ω •́ )✧模型內容已更新】";
      content.appendChild(compressionNotice);
    }
    content.appendChild(fullContentBody);
    const autoTimeWarning = typeof message.autoTimeWarning === "string"
      ? message.autoTimeWarning.trim()
      : typeof message.extra?.autoTimeWarning === "string"
        ? message.extra.autoTimeWarning.trim()
        : "";
    if (message.role === "assistant" && autoTimeWarning) {
      const timeWarningNotice = document.createElement("div");
      timeWarningNotice.className = "auto-time-warning-notice";
      timeWarningNotice.textContent = autoTimeWarning;
      content.appendChild(timeWarningNotice);
    }
    const imageAttachments = getMessageImageAttachments(message);
    if (imageAttachments.length > 0) {
      const imageGrid = document.createElement("div");
      imageGrid.className = "message-image-grid";
      imageAttachments.forEach((image) => {
        const link = document.createElement("a");
        link.className = "message-image-link";
        link.href = image.imageUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.title = image.prompt || image.fileName;
        const img = document.createElement("img");
        img.src = image.imageUrl;
        img.alt = image.fileName || "generated image";
        img.loading = "lazy";
        link.appendChild(img);
        imageGrid.appendChild(link);
      });
      content.appendChild(imageGrid);
    }

    const feedbackControls = document.createElement("div");
    feedbackControls.className = "message-feedback-actions";
    if (message.role === "assistant" && !message.streaming && !isImageOnlyMessage(message)) {
      const currentFeedback = getMessageFeedbackType(message);
      ["like", "dislike"].forEach((feedbackType) => {
        const feedbackBtn = document.createElement("button");
        feedbackBtn.type = "button";
        feedbackBtn.className = `message-feedback-button${currentFeedback === feedbackType ? " active" : ""}`;
        feedbackBtn.textContent = ASSISTANT_FEEDBACK_EMOJIS[feedbackType];
        feedbackBtn.title = ASSISTANT_FEEDBACK_LABELS[feedbackType];
        feedbackBtn.setAttribute("aria-label", ASSISTANT_FEEDBACK_LABELS[feedbackType]);
        feedbackBtn.addEventListener("click", () => setAssistantMessageFeedback(message.id, feedbackType));
        feedbackControls.appendChild(feedbackBtn);
      });
      if (currentFeedback) {
        const feedbackLabel = document.createElement("span");
        feedbackLabel.className = "message-feedback-state";
        feedbackLabel.textContent = `已標記：${ASSISTANT_FEEDBACK_LABELS[currentFeedback]}`;
        feedbackControls.appendChild(feedbackLabel);
      }
    }

    body.append(header, content);
    if (message.role === "assistant" && !message.streaming && !isImageOnlyMessage(message)) {
      body.appendChild(feedbackControls);
    }

    const menu = document.createElement("details");
    menu.className = "discord-message-menu";
    menu.addEventListener("toggle", () => {
      wrapper.classList.toggle("has-open-menu", menu.open);
    });
    const menuSummary = document.createElement("summary");
    menuSummary.textContent = "⋯";
    menu.appendChild(menuSummary);
    const menuList = document.createElement("div");
    menuList.className = "discord-message-menu-list";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.textContent = "複製文字";
    copyBtn.addEventListener("click", async () => {
      menu.open = false;
      await copyMessageText(message);
    });
    menuList.appendChild(copyBtn);

    if (message.role === "assistant") {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "編輯訊息";
      editBtn.addEventListener("click", () => {
        menu.open = false;
        openEditAssistantMessage(message.id);
      });
      menuList.appendChild(editBtn);
    } else if (message.role === "user") {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.textContent = "編輯訊息";
      editBtn.addEventListener("click", () => {
        menu.open = false;
        openEditUserMessage(message);
      });
      menuList.appendChild(editBtn);
    }

    menu.appendChild(menuList);
    wrapper.append(avatar, body, menu);
    fragment.appendChild(wrapper);
  });

  el.messages.replaceChildren(fragment);
  if (options.focusMessageNumber && scrollMessageNumberIntoView(options.focusMessageNumber)) {
    return;
  }
  realignMobileChat({ scroll: options.scroll !== false });
}

function formatAiLogPurpose(purpose) {
  if (String(purpose || "").startsWith("context_compression")) {
    return "模型內容處理";
  }
  if (purpose === "chat_expand") {
    return "補寫";
  }
  return "正文輸出";
}

const AI_LOG_CONTEXT_ROUND_LABEL_PATTERN = /^#\d+\s+(?:user|assistant)\s*(?:\r?\n|$)/i;

function formatAiLogMessage(message = {}) {
  const role = message?.role || "unknown";
  const rawContent = typeof message?.content === "string"
    ? message.content
    : serializeDisplayValue(message?.content);
  const content = String(rawContent || "").trim();
  const contextLabelMatch = content.match(AI_LOG_CONTEXT_ROUND_LABEL_PATTERN);
  if (!contextLabelMatch) {
    return [`[${role}]`, content || "(空白)"].join("\n");
  }

  let messageContent = content.slice(contextLabelMatch[0].length).trimStart();
  while (AI_LOG_CONTEXT_ROUND_LABEL_PATTERN.test(messageContent)) {
    messageContent = messageContent.replace(AI_LOG_CONTEXT_ROUND_LABEL_PATTERN, "").trimStart();
  }
  return [contextLabelMatch[0].trim(), messageContent || "(空白)"].join("\n");
}

function formatAiLogMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "無";
  }

  return messages
    .map((message) => formatAiLogMessage(message))
    .join("\n\n----------------\n\n");
}

function renderAiLogs(state) {
  const logs = Array.isArray(state.aiLogs) ? [...state.aiLogs].reverse() : [];
  el.aiLogs.innerHTML = "";

  if (!logs.length) {
    const empty = document.createElement("p");
    empty.textContent = "尚無 AI 呼叫紀錄。";
    empty.style.color = "#9eb0d0";
    el.aiLogs.appendChild(empty);
    return;
  }

  const totalsByCurrency = logs.reduce((totals, log) => {
    const cost = getUsageCost(log.usage);
    if (cost !== null) {
      const currency = getUsageCostCurrency(log.usage);
      totals[currency] = (totals[currency] || 0) + cost;
    }
    return totals;
  }, {});
  const totalCostText = Object.entries(totalsByCurrency)
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => `${formatCurrencyAmount(amount, currency)} ${currency}`)
    .join(" / ");
  if (totalCostText) {
    const total = document.createElement("div");
    total.className = "ai-log-cost-total";
    total.textContent = `目前 AI 呼叫紀錄總金額：${totalCostText}（按幣種分開統計，只統計已有價格表的模型）`;
    el.aiLogs.appendChild(total);
  }

  logs.forEach((log) => {
    const wrapper = document.createElement("details");
    wrapper.className = "ai-log-item";

    const summary = document.createElement("summary");

    const title = document.createElement("div");
    title.className = "ai-log-title";

    const heading = document.createElement("span");
    const timeText = log.createdAt ? new Date(log.createdAt).toLocaleString("zh-Hant") : "";
    heading.textContent = `${formatAiLogPurpose(log.purpose)}｜${log.model || "未指定模型"}｜${timeText}`;

    const status = document.createElement("span");
    status.className = `ai-log-status${log.status ? ` ${log.status}` : ""}`;
    status.textContent =
      log.status === "error" ? "失敗" : log.status === "skipped" ? "略過" : "成功";

    const usageText = formatUsage(log.usage);
    if (usageText) {
      const usage = document.createElement("span");
      usage.className = "ai-log-usage";
      usage.textContent = usageText;
      title.append(heading, usage, status);
    } else {
      title.append(heading, status);
    }
    summary.appendChild(title);

    const body = document.createElement("div");
    body.className = "ai-log-body";

    if (usageText) {
      const usageLabel = document.createElement("label");
      usageLabel.textContent = "本次 Token 消耗";
      const usageArea = document.createElement("pre");
      usageArea.className = "ai-log-block";
      usageArea.textContent = usageText;
      usageLabel.appendChild(usageArea);
      body.append(usageLabel);
    }

    const costText = formatUsageCostBreakdown(log.usage);
    if (costText) {
      const costLabel = document.createElement("label");
      costLabel.textContent = "本次使用金額";
      const costArea = document.createElement("pre");
      costArea.className = "ai-log-block cost";
      costArea.textContent = costText;
      costLabel.appendChild(costArea);
      body.append(costLabel);
    }

    const requestLabel = document.createElement("label");
    requestLabel.textContent = "送給 AI 的內容";
    const requestArea = document.createElement("pre");
    requestArea.className = "ai-log-block";
    requestArea.textContent = formatAiLogMessages(log.requestMessages || []);
    requestLabel.appendChild(requestArea);

    const responseLabel = document.createElement("label");
    responseLabel.textContent = log.error ? "AI 輸出 / 錯誤內容" : "AI 輸出";
    const responseArea = document.createElement("pre");
    responseArea.className = "ai-log-block";
    responseArea.textContent = log.error ? `${log.responseText || ""}\n\n[Error]\n${log.error}` : log.responseText || "";
    responseLabel.appendChild(responseArea);

    body.append(requestLabel);

    if (log.debugReasoningContent) {
      const reasoningLabel = document.createElement("label");
      reasoningLabel.textContent = "模型思考過程";
      const reasoningArea = document.createElement("pre");
      reasoningArea.className = "ai-log-block reasoning";
      reasoningArea.textContent = log.debugReasoningContent;
      reasoningLabel.appendChild(reasoningArea);
      body.append(reasoningLabel);
    }

    body.append(responseLabel);
    wrapper.append(summary, body);
    el.aiLogs.appendChild(wrapper);
  });
}

function renderStatus(state) {
  const discordAuthorizeUrl = state.discord?.authorizeUrl || "";
  const hasConversationTarget = Boolean(state.aiSessionStarted && (state.activeRoleCardId || isAssistantActive(state)));
  const display = getWebDisplayConfig(state);

  if (pendingRoleCardStartId) {
    el.startStatus.textContent = "切換中";
    el.startStatus.classList.add("started");
  } else if (state.aiSessionStarted && (state.activeRoleCardId || isAssistantActive(state))) {
    el.startStatus.textContent = isAssistantActive(state)
      ? `已開始（${getActiveAssistantName(state)}）`
      : "已開始";
    el.startStatus.classList.add("started");
  } else {
    el.startStatus.textContent = "尚未開始";
    el.startStatus.classList.remove("started");
  }

  el.chatInput.readOnly = Boolean(pendingRoleCardStartId) || isChatStreaming;
  el.chatInput.placeholder = getChatInputPlaceholder(state, display);
  el.sendBtn.disabled = Boolean(pendingRoleCardStartId) || !hasConversationTarget || isChatStreaming;
  el.sendBtn.textContent = isChatStreaming ? "生成中..." : pendingRoleCardStartId ? "切換中..." : "送出";

  if (el.discordBotLinkBtn) {
    el.discordBotLinkBtn.disabled = !discordAuthorizeUrl;
    el.discordBotLinkBtn.textContent = "✦";
    el.discordBotLinkBtn.title = discordAuthorizeUrl ? "Discord Bot 連結" : "缺少 Discord Bot 連結";
    el.discordBotLinkBtn.dataset.discordAuthorizeUrl = discordAuthorizeUrl;
  }

  const canEditAiOutput = state.conversation.some((msg) => msg.role === "assistant" && !isImageOnlyMessage(msg));
  el.editAiOutputBtn.disabled = !canEditAiOutput;
}

function createClientMessageId(prefix = "msg") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function renderChatStreamNow() {
  if (!appState) {
    return;
  }
  if (chatStreamRenderFrame && typeof window.cancelAnimationFrame === "function") {
    window.cancelAnimationFrame(chatStreamRenderFrame);
  }
  chatStreamRenderFrame = 0;
  renderMessages(appState);
  renderStatus(appState);
  realignMobileChat({ scroll: true });
}

function scheduleChatStreamRender() {
  if (!appState) {
    return;
  }
  if (chatStreamRenderFrame) {
    return;
  }
  const render = () => {
    chatStreamRenderFrame = 0;
    renderMessages(appState);
    renderStatus(appState);
    realignMobileChat({ scroll: true });
  };
  if (typeof window.requestAnimationFrame === "function") {
    chatStreamRenderFrame = window.requestAnimationFrame(render);
  } else {
    render();
  }
}

function appendOptimisticChatTurn(content = "") {
  if (!appState) {
    return null;
  }
  const userCreatedAt = new Date().toISOString();
  const assistantCreatedAt = new Date(Date.now() + 1).toISOString();
  const userMessage = {
    id: createClientMessageId("temp_user"),
    role: "user",
    content,
    source: "web",
    createdAt: userCreatedAt,
    updatedAt: userCreatedAt
  };
  const assistantMessage = {
    id: createClientMessageId("temp_ai"),
    role: "assistant",
    content: "",
    source: "web",
    streaming: true,
    phase: "start",
    createdAt: assistantCreatedAt,
    updatedAt: assistantCreatedAt,
    extra: {
      streamingReasoning: ""
    }
  };
  appState = {
    ...appState,
    conversation: [
      ...(Array.isArray(appState.conversation) ? appState.conversation : []),
      userMessage,
      assistantMessage
    ]
  };
  renderChatStreamNow();
  return assistantMessage;
}

function applyChatStreamEventToMessage(event = {}, assistantMessage = null) {
  if (!assistantMessage || typeof event !== "object") {
    return;
  }
  if (event.type === "status") {
    assistantMessage.phase = event.phase === "before_reasoner" ? "compression" : event.phase || "";
    scheduleChatStreamRender();
    return;
  }
  if (event.type === "reasoning_delta") {
    if (!assistantMessage.content) {
      assistantMessage.extra = assistantMessage.extra || {};
      assistantMessage.extra.streamingReasoning = `${assistantMessage.extra.streamingReasoning || ""}${event.delta || ""}`;
      scheduleChatStreamRender();
    }
    return;
  }
  if (event.type === "content_delta") {
    assistantMessage.phase = "chat";
    assistantMessage.content = `${assistantMessage.content || ""}${event.delta || ""}`;
    if (assistantMessage.extra) {
      assistantMessage.extra.streamingReasoning = "";
    }
    scheduleChatStreamRender();
    return;
  }
  if (event.type === "error") {
    assistantMessage.streaming = false;
    assistantMessage.phase = "";
    assistantMessage.content = `生成失敗：${event.error || "未知錯誤"}`;
    if (assistantMessage.extra) {
      assistantMessage.extra.streamingReasoning = "";
    }
    renderChatStreamNow();
  }
}

function renderConversationModelSettings(state) {
  const compression = state?.contextCompression || {};
  if (el.contextCompressionModeHint) {
    const compressedTurn = Number(compression.compressedThroughTurnNumber || 0);
    const activeMode = getActivePromptMode(state);
    const activeConfig = state?.modularPromptConfigs?.[activeMode] || {};
    el.contextCompressionModeHint.textContent = `模型內容固定啟用。${getPromptModeDisplayName(activeMode)}上下文 ${normalizeDialogueContextRounds(activeConfig.dialogueContextRounds)} 輪；標準模型已處理到第 ${compressedTurn || 0} 輪。`;
  }
}

function getDefaultPromptModeDisplayName(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  if (normalizedMode === "multi") {
    return "多角色";
  }
  if (normalizedMode === "no_role") {
    return "無角色";
  }
  if (normalizedMode === "single") {
    return "單角色";
  }
  return normalizedMode;
}

function getPromptModeDisplayName(mode = "") {
  const promptMode = normalizeRoleCardMode(mode);
  const config = appState?.modularPromptConfigs?.[promptMode];
  return String(config?.name || config?.title || config?.displayName || getDefaultPromptModeDisplayName(promptMode)).trim();
}

function getPromptModeEntries() {
  const configs = appState?.modularPromptConfigs || {};
  const seen = new Set();
  return [
    ...BUILTIN_PROMPT_MODES,
    ...Object.keys(configs)
  ]
    .map((mode) => normalizeRoleCardMode(mode))
    .filter((mode) => {
      if (!mode || seen.has(mode)) {
        return false;
      }
      seen.add(mode);
      return true;
    })
    .map((mode) => ({
      mode,
      name: getPromptModeDisplayName(mode)
    }));
}

function renderPromptModeOptions(select, selectedMode = "single") {
  if (!select) {
    return;
  }
  const normalizedSelectedMode = normalizeRoleCardMode(selectedMode);
  const modes = getPromptModeEntries();
  if (!modes.some((entry) => entry.mode === normalizedSelectedMode)) {
    modes.push({
      mode: normalizedSelectedMode,
      name: getPromptModeDisplayName(normalizedSelectedMode)
    });
  }
  const signature = modes.map((entry) => `${entry.mode}:${entry.name || entry.mode}`).join("|");
  if (select.dataset.optionsSignature !== signature) {
    const fragment = document.createDocumentFragment();
    modes.forEach((entry) => {
      const option = document.createElement("option");
      option.value = entry.mode;
      option.textContent = entry.name || entry.mode;
      fragment.appendChild(option);
    });
    select.replaceChildren(fragment);
    select.dataset.optionsSignature = signature;
  }
  select.value = normalizedSelectedMode;
}

function renderAllPromptModeSelects(selectedMode = "") {
  const mode = normalizeRoleCardMode(selectedMode || el.modularPromptModeSelect?.value || el.roleCardMode?.value || getActivePromptMode(appState));
  renderPromptModeOptions(el.modularPromptModeSelect, mode);
  renderPromptModeOptions(el.roleCardMode, el.roleCardMode?.value || mode);
}

function getModularConfig(mode = "") {
  const promptMode = normalizeRoleCardMode(mode || el.modularPromptModeSelect?.value || getActivePromptMode(appState));
  return appState?.modularPromptConfigs?.[promptMode] || {
    mode: promptMode,
    name: getDefaultPromptModeDisplayName(promptMode),
    dialogueContextRounds: 20,
    contextCompression: normalizeContextCompressionConfig({}, appState?.contextCompressionPrompt || ""),
    contextCompressionPrompt: appState?.contextCompressionPrompt || "",
    compressionProfiles: [
      createStandardCompressionProfile(normalizeContextCompressionConfig({}, appState?.contextCompressionPrompt || ""))
    ],
    reasonerHistory: { mainRules: "", contextRules: "" }
  };
}

function clearModularPromptPreview() {
  if (el.modularPreviewReasonerSystem?.value) {
    el.modularPreviewReasonerSystem.value = "";
  }
  if (el.modularPreviewCompressionPrompt?.value) {
    el.modularPreviewCompressionPrompt.value = "";
  }
}

function normalizeWheelDeltaPixels(event) {
  const lineHeight = 16;
  const pageHeight = el.modularPromptForm?.clientHeight || window.innerHeight || 800;
  const multiplier = event.deltaMode === 1
    ? lineHeight
    : event.deltaMode === 2
      ? pageHeight
      : 1;
  return event.deltaY * multiplier;
}

function isElementScrollableVertically(element) {
  if (!element || element === document || element === window) {
    return false;
  }
  const style = window.getComputedStyle(element);
  const overflowY = style.overflowY;
  if (!/(auto|scroll|overlay)/.test(overflowY)) {
    return false;
  }
  return element.scrollHeight > element.clientHeight + 1;
}

function canScrollElementVertically(element, deltaY = 0) {
  if (!isElementScrollableVertically(element)) {
    return false;
  }
  if (deltaY < 0) {
    return element.scrollTop > 0;
  }
  if (deltaY > 0) {
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1;
  }
  return false;
}

function findScrollableElementWithinPromptDialog(target, boundary = el.modularPromptForm) {
  if (!target || !(target instanceof Element) || !boundary) {
    return null;
  }
  let current = target;
  while (current && current !== boundary && current !== document.body) {
    if (isElementScrollableVertically(current)) {
      return current;
    }
    current = current.parentElement;
  }
  return boundary.contains(target) ? boundary : null;
}

function scrollModularPromptFormBy(deltaY = 0) {
  if (!el.modularPromptForm || !deltaY) {
    return;
  }
  el.modularPromptForm.scrollTop += deltaY;
}

function shouldAllowNativePromptScroll(event, deltaY = 0) {
  if (!el.modularPromptDialog?.open || !el.modularPromptForm) {
    return true;
  }
  const target = event.target;
  if (!target || !(target instanceof Element) || !el.modularPromptForm.contains(target)) {
    return false;
  }
  const scrollable = findScrollableElementWithinPromptDialog(target);
  return scrollable && scrollable !== el.modularPromptForm && canScrollElementVertically(scrollable, deltaY);
}

function handleModularPromptWheel(event) {
  if (!el.modularPromptDialog?.open || !modularPromptScrollLockState || event.ctrlKey) {
    return;
  }
  const deltaY = normalizeWheelDeltaPixels(event);
  if (shouldAllowNativePromptScroll(event, deltaY)) {
    return;
  }
  event.preventDefault();
  scrollModularPromptFormBy(deltaY);
}

function handleModularPromptTouchStart(event) {
  if (!el.modularPromptDialog?.open || !modularPromptScrollLockState || event.touches.length !== 1) {
    return;
  }
  modularPromptScrollLockState.lastTouchY = event.touches[0].clientY;
}

function handleModularPromptTouchMove(event) {
  if (!el.modularPromptDialog?.open || !modularPromptScrollLockState || event.touches.length !== 1) {
    return;
  }
  const currentY = event.touches[0].clientY;
  const previousY = Number.isFinite(modularPromptScrollLockState.lastTouchY)
    ? modularPromptScrollLockState.lastTouchY
    : currentY;
  const deltaY = previousY - currentY;
  modularPromptScrollLockState.lastTouchY = currentY;
  if (!deltaY || shouldAllowNativePromptScroll(event, deltaY)) {
    return;
  }
  event.preventDefault();
  scrollModularPromptFormBy(deltaY);
}

function lockModularPromptPageScroll() {
  if (modularPromptScrollLockState || !document.body) {
    return;
  }
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;
  modularPromptScrollLockState = {
    scrollX,
    scrollY,
    lastTouchY: 0,
    bodyStyle: {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow
    }
  };
  document.body.classList.add("is-modal-scroll-locked");
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = `-${scrollX}px`;
  document.body.style.right = "0";
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";
  document.addEventListener("wheel", handleModularPromptWheel, { passive: false, capture: true });
  document.addEventListener("touchstart", handleModularPromptTouchStart, { passive: true, capture: true });
  document.addEventListener("touchmove", handleModularPromptTouchMove, { passive: false, capture: true });
}

function unlockModularPromptPageScroll() {
  if (!modularPromptScrollLockState || !document.body) {
    return;
  }
  document.removeEventListener("wheel", handleModularPromptWheel, { capture: true });
  document.removeEventListener("touchstart", handleModularPromptTouchStart, { capture: true });
  document.removeEventListener("touchmove", handleModularPromptTouchMove, { capture: true });
  const { scrollX, scrollY, bodyStyle } = modularPromptScrollLockState;
  modularPromptScrollLockState = null;
  document.body.classList.remove("is-modal-scroll-locked");
  document.body.style.position = bodyStyle.position;
  document.body.style.top = bodyStyle.top;
  document.body.style.left = bodyStyle.left;
  document.body.style.right = bodyStyle.right;
  document.body.style.width = bodyStyle.width;
  document.body.style.overflow = bodyStyle.overflow;
  window.scrollTo(scrollX, scrollY);
}

function openModularPromptDialog() {
  renderModularPromptEditor();
  el.modularPromptDialog.showModal();
  lockModularPromptPageScroll();
}

function isDialogBackdropPointer(dialog, event) {
  if (!dialog || !event || !dialog.open) {
    return false;
  }
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
    return false;
  }
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
}

function closeDialogFromBackdrop(dialog, options = {}) {
  if (!dialog?.open) {
    return;
  }
  if (options.confirmOnClose && !window.confirm(DIALOG_BACKDROP_CLOSE_CONFIRM_TEXT)) {
    return;
  }
  if (typeof options.onBeforeClose === "function") {
    options.onBeforeClose();
  }
  if (typeof options.close === "function") {
    options.close(dialog);
  } else if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function bindDialogBackdropClose(dialog, options = {}) {
  if (!dialog) {
    return;
  }
  let pointerStartedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    if (event.button && event.button !== 0) {
      pointerStartedOnBackdrop = false;
      return;
    }
    pointerStartedOnBackdrop = isDialogBackdropPointer(dialog, event);
  });
  dialog.addEventListener("click", (event) => {
    if (!pointerStartedOnBackdrop) {
      return;
    }
    pointerStartedOnBackdrop = false;
    if (!isDialogBackdropPointer(dialog, event)) {
      return;
    }
    closeDialogFromBackdrop(dialog, options);
  });
  dialog.addEventListener("close", () => {
    pointerStartedOnBackdrop = false;
  });
}

function createEditorEmptyHint(text = "") {
  const empty = document.createElement("p");
  empty.className = "form-hint";
  empty.textContent = text;
  return empty;
}

function replaceEditorChildren(container, children = []) {
  if (!container) {
    return;
  }
  const fragment = document.createDocumentFragment();
  children.forEach((child) => {
    if (child) {
      fragment.appendChild(child);
    }
  });
  container.replaceChildren(fragment);
}

function getSelectedCompressionProfile() {
  return compressionProfilesDraft.find((profile) => profile.id === selectedCompressionProfileId) ||
    compressionProfilesDraft[0] ||
    null;
}

function renderCompressionProfileOptions(selectedId = selectedCompressionProfileId) {
  if (!el.compressionProfileSelect) {
    return;
  }
  selectedCompressionProfileId = compressionProfilesDraft.some((profile) => profile.id === selectedId)
    ? selectedId
    : STANDARD_COMPRESSION_PROFILE_ID;
  const signature = compressionProfilesDraft
    .map((profile, index) => `${profile.id}:${profile.name || profile.id || `大模型 ${index + 1}`}:${profile.enabled === false ? 0 : 1}`)
    .join("|");
  if (el.compressionProfileSelect.dataset.optionsSignature !== signature) {
    const fragment = document.createDocumentFragment();
    compressionProfilesDraft.forEach((profile, index) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = `${profile.name || profile.id || `大模型 ${index + 1}`}${profile.enabled === false ? "（未啟用）" : ""}`;
      fragment.appendChild(option);
    });
    el.compressionProfileSelect.replaceChildren(fragment);
    el.compressionProfileSelect.dataset.optionsSignature = signature;
  }
  el.compressionProfileSelect.value = selectedCompressionProfileId;
}

function collectCompressionTriggerActionsFromEditor(options = {}) {
  if (!el.compressionTriggerActionList) {
    return [];
  }
  const keepExpanded = Boolean(options.keepExpanded);
  return Array.from(el.compressionTriggerActionList.querySelectorAll("[data-trigger-action-id]"))
    .map((item, index) => normalizeCompressionTriggerActionConfig({
      id: item.dataset.triggerActionId || "",
      name: item.querySelector("[data-field='triggerActionName']")?.value || "",
      enabled: item.querySelector("[data-field='triggerActionEnabled']")?.checked !== false,
      action: item.querySelector("[data-field='triggerActionProcessing']")?.value || MODEL_TRIGGER_ACTION_CALL_API,
      keywordFollowupAction: item.querySelector("[data-field='triggerKeywordFollowupAction']")?.value ||
        KEYWORD_FOLLOWUP_CONTINUE_REASONER,
      imageGeneration: {
        model: item.querySelector("[data-field='imageModel']")?.value || "",
        negativePrompt: item.querySelector("[data-field='imageNegativePrompt']")?.value || "",
        width: item.querySelector("[data-field='imageWidth']")?.value || "",
        height: item.querySelector("[data-field='imageHeight']")?.value || "",
        steps: item.querySelector("[data-field='imageSteps']")?.value || "",
        samples: item.querySelector("[data-field='imageSamples']")?.value || "",
        scale: item.querySelector("[data-field='imageScale']")?.value || "",
        cfgRescale: item.querySelector("[data-field='imageCfgRescale']")?.value || "",
        sampler: item.querySelector("[data-field='imageSampler']")?.value || "",
        noiseSchedule: item.querySelector("[data-field='imageNoiseSchedule']")?.value || "",
        seed: item.querySelector("[data-field='imageSeed']")?.value || "",
        varietyPlus: Boolean(item.querySelector("[data-field='imageVarietyPlus']")?.checked),
        imageFormat: item.querySelector("[data-field='imageFormat']")?.value || "png"
      },
      triggers: {
        everyTurn: Boolean(item.querySelector("[data-field='triggerEveryTurn']")?.checked),
        roundLimit: Boolean(item.querySelector("[data-field='triggerRoundLimit']")?.checked),
        turns: parseIntegerList(item.querySelector("[data-field='triggerTurns']")?.value || ""),
        keywords: parseKeywordList(item.querySelector("[data-field='triggerKeywords']")?.value || ""),
        keywordSource: item.querySelector("[data-field='triggerKeywordSource']")?.value || "both"
      },
      expanded: keepExpanded ? item.open : false
    }, index));
}

function formatTriggerActionSummary(action = {}, index = 0) {
  const triggers = normalizeCompressionTriggerConfig(action.triggers || {});
  const triggerParts = [];
  if (triggers.everyTurn) {
    triggerParts.push("每回合");
  }
  if (triggers.roundLimit) {
    triggerParts.push("正文上限");
  }
  if (triggers.turns.length > 0) {
    triggerParts.push(`回合 ${triggers.turns.join(", ")}`);
  }
  if (triggers.keywords.length > 0) {
    triggerParts.push(triggers.keywords.join(" + "));
  }
  return [
    action.name || `觸發組合 ${index + 1}`,
    triggerParts.length > 0 ? `(${triggerParts.join(" + ")})` : "(未設定觸發)",
    getModelTriggerActionLabel(action.action),
    getKeywordFollowupActionLabel(action.keywordFollowupAction, action.skipReasoner)
  ].filter(Boolean).join(" -> ");
}

function renderCompressionTriggerActionEditor(actions = []) {
  if (!el.compressionTriggerActionList) {
    return;
  }
  const normalizedActions = normalizeCompressionTriggerActionsConfig(actions, {
    defaultRoundLimit: selectedCompressionProfileId === STANDARD_COMPRESSION_PROFILE_ID,
    defaultName: selectedCompressionProfileId === STANDARD_COMPRESSION_PROFILE_ID ? "標準壓縮" : "觸發組合 1"
  });

  if (normalizedActions.length === 0) {
    replaceEditorChildren(el.compressionTriggerActionList, [createEditorEmptyHint("尚未建立觸發組合。")]);
    return;
  }

  const renderedActions = normalizedActions.map((action, index) => {
    const triggers = normalizeCompressionTriggerConfig(action.triggers || {});
    const item = document.createElement("details");
    item.className = "role-card compression-trigger-action-card";
    item.dataset.triggerActionId = action.id;
    item.open = Boolean(action.expanded);

    const header = document.createElement("summary");
    header.className = "inline-actions";
    const title = document.createElement("strong");
    title.textContent = formatTriggerActionSummary(action, index);
    title.style.flex = "1";

    const enabledBtn = document.createElement("button");
    enabledBtn.type = "button";
    enabledBtn.className = action.enabled !== false ? "secondary" : "muted";
    enabledBtn.textContent = action.enabled !== false ? "啟用" : "停用";
    enabledBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const current = collectCompressionTriggerActionsFromEditor({ keepExpanded: true });
      renderCompressionTriggerActionEditor(current.map((item) =>
        item.id === action.id ? { ...item, enabled: item.enabled === false, expanded: true } : item
      ));
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "secondary";
    editBtn.textContent = action.expanded ? "收合" : "編輯";
    editBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const current = collectCompressionTriggerActionsFromEditor({ keepExpanded: true });
      renderCompressionTriggerActionEditor(current.map((item) =>
        item.id === action.id ? { ...item, expanded: !item.expanded } : item
      ));
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", (event) => {
      event.preventDefault();
      renderCompressionTriggerActionEditor(
        collectCompressionTriggerActionsFromEditor({ keepExpanded: true }).filter((item) => item.id !== action.id)
      );
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });

    header.append(title, enabledBtn, editBtn, deleteBtn);

    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = action.enabled !== false;
    enabledInput.dataset.field = "triggerActionEnabled";
    enabledInput.hidden = true;

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "組合名字";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = action.name || "";
    nameInput.placeholder = "例如：玩家1設定";
    nameInput.dataset.field = "triggerActionName";
    nameLabel.appendChild(nameInput);

    const actionLabel = document.createElement("label");
    actionLabel.textContent = "觸發後處理動作";
    const actionSelect = document.createElement("select");
    actionSelect.dataset.field = "triggerActionProcessing";
    [
      [MODEL_TRIGGER_ACTION_CALL_API, "call api（使用本大模型規則＋模塊）"],
      [MODEL_TRIGGER_ACTION_COPY_USER_INPUT, "複製用戶輸入（不call api）"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      actionSelect.appendChild(option);
    });
    actionSelect.value = normalizeModelTriggerAction(action.action);
    actionLabel.appendChild(actionSelect);

    const keywordFollowupLabel = document.createElement("label");
    keywordFollowupLabel.textContent = "觸發後續動作";
    const keywordFollowupSelect = document.createElement("select");
    keywordFollowupSelect.dataset.field = "triggerKeywordFollowupAction";
    [
      [KEYWORD_FOLLOWUP_CONTINUE_REASONER, "按照對話繼續觸發正文"],
      [KEYWORD_FOLLOWUP_STOP_AFTER_MODEL, "停下，只輸出完成訊息"],
      [KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER, "建立圖片（並行運作），同時繼續正文"],
      [KEYWORD_FOLLOWUP_IMAGE_ONLY, "跑圖不跑正文（完全停止正文）"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      keywordFollowupSelect.appendChild(option);
    });
    keywordFollowupSelect.value = normalizeKeywordFollowupAction(action.keywordFollowupAction, action.skipReasoner);
    keywordFollowupLabel.appendChild(keywordFollowupSelect);

    const everyTurnLabel = document.createElement("label");
    everyTurnLabel.className = "checkbox-label";
    const everyTurnInput = document.createElement("input");
    everyTurnInput.type = "checkbox";
    everyTurnInput.checked = Boolean(triggers.everyTurn);
    everyTurnInput.dataset.field = "triggerEveryTurn";
    everyTurnLabel.append(everyTurnInput, document.createTextNode("每回合觸發"));

    const roundLabel = document.createElement("label");
    roundLabel.className = "checkbox-label";
    const roundInput = document.createElement("input");
    roundInput.type = "checkbox";
    roundInput.checked = Boolean(triggers.roundLimit);
    roundInput.dataset.field = "triggerRoundLimit";
    roundLabel.append(roundInput, document.createTextNode("達到正文上限輪數"));

    const turnsLabel = document.createElement("label");
    turnsLabel.textContent = "指定回合觸發";
    const turnsInput = document.createElement("input");
    turnsInput.type = "text";
    turnsInput.value = triggers.turns.join(", ");
    turnsInput.placeholder = "例如：0, 5, 10（每正文上限週期重複）";
    turnsInput.dataset.field = "triggerTurns";
    turnsLabel.appendChild(turnsInput);

    const keywordLabel = document.createElement("label");
    keywordLabel.textContent = "觸發關鍵字";
    const keywordInput = document.createElement("textarea");
    keywordInput.rows = 4;
    keywordInput.value = triggers.keywords.join("\n");
    keywordInput.placeholder = "換行=全部都要有\n玩家1+受了重傷/死亡 = 10字內靠近\n{{user1}}+受了重傷 = user1輸入時觸發";
    keywordInput.dataset.field = "triggerKeywords";
    keywordLabel.appendChild(keywordInput);

    const sourceLabel = document.createElement("label");
    sourceLabel.textContent = "關鍵字來源";
    const sourceSelect = document.createElement("select");
    sourceSelect.dataset.field = "triggerKeywordSource";
    [
      ["both", "{{user}} 或 AI 生成內容"],
      ["user", "只看 {{user}} 輸入"],
      ["assistant", "只看 AI 生成內容"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      sourceSelect.appendChild(option);
    });
    sourceSelect.value = triggers.keywordSource || "both";
    sourceLabel.appendChild(sourceSelect);

    const imageSettings = normalizeModelImageGenerationSettings(action);
    const imageSettingsBox = document.createElement("div");
    imageSettingsBox.className = "compression-image-settings";
    imageSettingsBox.dataset.imageSettings = "true";

    const imageSettingsTitle = document.createElement("strong");
    imageSettingsTitle.textContent = "建立圖片設定";
    const imageSettingsHint = document.createElement("small");
    imageSettingsHint.textContent = "大模型 call api 的輸出會作為 Base Prompt；以下設定會送到 NovelAI。";

    const createImageField = (labelText, fieldName, value, options = {}) => {
      const label = document.createElement("label");
      label.textContent = labelText;
      const input = options.textarea ? document.createElement("textarea") : document.createElement("input");
      if (options.textarea) {
        input.rows = options.rows || 2;
      } else {
        input.type = options.type || "text";
      }
      if (options.step) {
        input.step = options.step;
      }
      if (options.min !== undefined) {
        input.min = String(options.min);
      }
      if (options.max !== undefined) {
        input.max = String(options.max);
      }
      input.value = value ?? "";
      input.dataset.field = fieldName;
      label.appendChild(input);
      return { label, input };
    };
    const createImageSelect = (labelText, fieldName, value, entries) => {
      const label = document.createElement("label");
      label.textContent = labelText;
      const select = document.createElement("select");
      select.dataset.field = fieldName;
      entries.forEach(([entryValue, entryLabel]) => {
        const option = document.createElement("option");
        option.value = entryValue;
        option.textContent = entryLabel;
        select.appendChild(option);
      });
      select.value = value;
      label.appendChild(select);
      return { label, input: select };
    };

    const modelField = createImageSelect("NovelAI 模型", "imageModel", imageSettings.model, [
      ["nai-diffusion-4-5-curated", "NAI Diffusion V4.5 Curated"],
      ["nai-diffusion-4-5-full", "NAI Diffusion V4.5 Full"],
      ["nai-diffusion-4-full", "NAI Diffusion V4 Full"]
    ]);
    const negativeField = createImageField("Undesired Content", "imageNegativePrompt", imageSettings.negativePrompt, {
      textarea: true,
      rows: 3
    });
    const initialPreset = imageSettings.width === 832 && imageSettings.height === 1216
      ? "portrait"
      : imageSettings.width === 1216 && imageSettings.height === 832
        ? "landscape"
        : "custom";
    const sizePresetField = createImageSelect("Image Settings", "imageSizePreset", initialPreset, [
      ["portrait", "Normal Portrait 832x1216"],
      ["landscape", "Normal Landscape 1216x832"],
      ["custom", "Custom"]
    ]);
    const widthField = createImageField("寬度", "imageWidth", imageSettings.width, { type: "number", min: 64, max: 2048 });
    const heightField = createImageField("高度", "imageHeight", imageSettings.height, { type: "number", min: 64, max: 2048 });
    sizePresetField.input.addEventListener("change", () => {
      if (sizePresetField.input.value === "portrait") {
        widthField.input.value = "832";
        heightField.input.value = "1216";
      } else if (sizePresetField.input.value === "landscape") {
        widthField.input.value = "1216";
        heightField.input.value = "832";
      }
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });
    const stepsField = createImageField("Steps", "imageSteps", imageSettings.steps, { type: "number", min: 1, max: 50 });
    const samplesField = createImageField("張數", "imageSamples", imageSettings.samples, { type: "number", min: 1, max: 4 });
    const scaleField = createImageField("Prompt Guidance", "imageScale", imageSettings.scale, { type: "number", min: 0, max: 20, step: "0.1" });
    const cfgField = createImageField("Prompt Guidance Rescale", "imageCfgRescale", imageSettings.cfgRescale, {
      type: "number",
      min: 0,
      max: 1,
      step: "0.05"
    });
    const samplerField = createImageSelect("Sampler", "imageSampler", imageSettings.sampler, [
      ["k_euler_ancestral", "Euler Ancestral"],
      ["k_euler", "Euler"],
      ["k_dpmpp_2m", "DPM++ 2M"],
      ["k_dpmpp_sde", "DPM++ SDE"]
    ]);
    const noiseField = createImageSelect("Noise Schedule", "imageNoiseSchedule", imageSettings.noiseSchedule, [
      ["karras", "Karras"],
      ["native", "Native"],
      ["exponential", "Exponential"],
      ["polyexponential", "Polyexponential"]
    ]);
    const seedField = createImageField("Seed（空白=random）", "imageSeed", imageSettings.seed, { type: "text" });
    const formatField = createImageSelect("格式", "imageFormat", imageSettings.imageFormat, [
      ["png", "PNG"],
      ["webp", "WebP"]
    ]);
    const varietyLabel = document.createElement("label");
    varietyLabel.className = "checkbox-label";
    const varietyInput = document.createElement("input");
    varietyInput.type = "checkbox";
    varietyInput.checked = Boolean(imageSettings.varietyPlus);
    varietyInput.dataset.field = "imageVarietyPlus";
    varietyLabel.append(varietyInput, document.createTextNode("Variety+"));

    const imageSettingsGrid = document.createElement("div");
    imageSettingsGrid.className = "compression-image-settings-grid";
    imageSettingsGrid.append(
      modelField.label,
      sizePresetField.label,
      widthField.label,
      heightField.label,
      stepsField.label,
      samplesField.label,
      scaleField.label,
      cfgField.label,
      samplerField.label,
      noiseField.label,
      seedField.label,
      formatField.label,
      varietyLabel,
      negativeField.label
    );
    imageSettingsBox.append(imageSettingsTitle, imageSettingsHint, imageSettingsGrid);
    const syncKeywordFollowupFields = () => {
      const imageOnly = isImageOnlyKeywordFollowupAction(keywordFollowupSelect.value);
      imageSettingsBox.hidden = !isImageKeywordFollowupAction(keywordFollowupSelect.value);
      sourceSelect.disabled = imageOnly;
      sourceSelect.title = imageOnly ? "跑圖不跑正文只能檢查 user 輸入" : "";
      if (imageOnly) {
        sourceSelect.value = "user";
      }
    };
    syncKeywordFollowupFields();

    const editor = document.createElement("div");
    editor.className = "compression-trigger-action-grid";
    editor.append(
      enabledInput,
      nameLabel,
      actionLabel,
      keywordFollowupLabel,
      everyTurnLabel,
      roundLabel,
      turnsLabel,
      keywordLabel,
      sourceLabel,
      imageSettingsBox
    );

    editor.querySelectorAll("input, textarea, select").forEach((field) => {
      field.addEventListener("input", () => {
        syncSelectedCompressionProfileFromEditor();
        clearModularPromptPreview();
      });
      field.addEventListener("change", () => {
        syncSelectedCompressionProfileFromEditor();
        clearModularPromptPreview();
      });
    });
    keywordFollowupSelect.addEventListener("change", () => {
      syncKeywordFollowupFields();
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });

    item.append(header, editor);
    return item;
  });
  replaceEditorChildren(el.compressionTriggerActionList, renderedActions);
}

function collectCompressionAppendTermsFromEditor(options = {}) {
  if (!el.compressionAppendTermList) {
    return [];
  }
  const keepExpanded = Boolean(options.keepExpanded);
  return Array.from(el.compressionAppendTermList.querySelectorAll("[data-append-term-id]"))
    .map((item, index) => normalizeModelAppendTermConfig({
      id: item.dataset.appendTermId || "",
      enabled: item.querySelector("[data-field='appendTermEnabled']")?.checked !== false,
      player: item.querySelector("[data-field='appendTermPlayer']")?.value || "",
      content: item.querySelector("[data-field='appendTermContent']")?.value || "",
      expanded: keepExpanded ? item.open : false
    }, index));
}

function getModelAppendPlayerLabel(value = "") {
  const player = normalizeModelAppendPlayer(value);
  if (!player) {
    return "未指定玩家";
  }
  if (player === MODEL_APPEND_PLAYER_OTHER) {
    return "userx";
  }
  return player;
}

function formatAppendTermSummary(term = {}, index = 0) {
  const normalized = normalizeModelAppendTermConfig(term, index);
  const preview = normalized.content
    ? normalized.content.replace(/\s+/g, " ").slice(0, 36)
    : "未填內容";
  return [
    `追加詞 ${index + 1}`,
    getModelAppendPlayerLabel(normalized.player),
    normalized.enabled === false ? "停用" : "",
    preview
  ].filter(Boolean).join(" -> ");
}

function renderCompressionAppendTermEditor(terms = []) {
  if (!el.compressionAppendTermList) {
    return;
  }
  const normalizedTerms = normalizeModelAppendTermsConfig(terms);

  if (normalizedTerms.length === 0) {
    replaceEditorChildren(el.compressionAppendTermList, [createEditorEmptyHint("尚未建立追加詞。")]);
    return;
  }

  const renderedTerms = normalizedTerms.map((term, index) => {
    const item = document.createElement("details");
    item.className = "role-card compression-append-term-card";
    item.dataset.appendTermId = term.id;
    item.open = Boolean(term.expanded);

    const header = document.createElement("summary");
    header.className = "inline-actions";
    const title = document.createElement("strong");
    title.textContent = formatAppendTermSummary(term, index);
    title.style.flex = "1";

    const enabledBtn = document.createElement("button");
    enabledBtn.type = "button";
    enabledBtn.className = term.enabled !== false ? "secondary" : "muted";
    enabledBtn.textContent = term.enabled !== false ? "啟用" : "停用";
    enabledBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const current = collectCompressionAppendTermsFromEditor({ keepExpanded: true });
      renderCompressionAppendTermEditor(current.map((item) =>
        item.id === term.id ? { ...item, enabled: item.enabled === false, expanded: true } : item
      ));
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "secondary";
    editBtn.textContent = term.expanded ? "收合" : "編輯";
    editBtn.addEventListener("click", (event) => {
      event.preventDefault();
      const current = collectCompressionAppendTermsFromEditor({ keepExpanded: true });
      renderCompressionAppendTermEditor(current.map((item) =>
        item.id === term.id ? { ...item, expanded: !item.expanded } : item
      ));
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", (event) => {
      event.preventDefault();
      renderCompressionAppendTermEditor(
        collectCompressionAppendTermsFromEditor({ keepExpanded: true }).filter((item) => item.id !== term.id)
      );
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });

    header.append(title, enabledBtn, editBtn, deleteBtn);

    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = term.enabled !== false;
    enabledInput.dataset.field = "appendTermEnabled";
    enabledInput.hidden = true;

    const playerLabel = document.createElement("label");
    playerLabel.textContent = "指定玩家";
    const playerInput = document.createElement("input");
    playerInput.type = "text";
    playerInput.value = normalizeModelAppendPlayer(term.player);
    playerInput.placeholder = "例如：user1、user2、user3";
    playerInput.dataset.field = "appendTermPlayer";
    playerLabel.appendChild(playerInput);

    const contentLabel = document.createElement("label");
    contentLabel.textContent = "追加詞內容";
    contentLabel.style.gridColumn = "1 / -1";
    const contentInput = document.createElement("textarea");
    contentInput.rows = 4;
    contentInput.value = term.content || "";
    contentInput.placeholder = "例如：你是玩家1，目前角色資料以玩家1模型內容為準。";
    contentInput.dataset.field = "appendTermContent";
    contentLabel.appendChild(contentInput);

    const editor = document.createElement("div");
    editor.className = "compression-append-term-grid";
    editor.append(enabledInput, playerLabel, contentLabel);

    editor.querySelectorAll("input, textarea, select").forEach((field) => {
      field.addEventListener("input", () => {
        syncSelectedCompressionProfileFromEditor();
        clearModularPromptPreview();
      });
      field.addEventListener("change", () => {
        syncSelectedCompressionProfileFromEditor();
        clearModularPromptPreview();
      });
    });

    item.append(header, editor);
    return item;
  });
  replaceEditorChildren(el.compressionAppendTermList, renderedTerms);
}

function syncSelectedCompressionProfileFromEditor() {
  const profile = getSelectedCompressionProfile();
  if (!profile) {
    return;
  }
  const isStandard = profile.id === STANDARD_COMPRESSION_PROFILE_ID;
  profile.name = el.compressionProfileName?.value?.trim() || getDefaultCompressionProfileName(profile.id);
  profile.enabled = isStandard ? true : Boolean(el.compressionProfileEnabled?.checked);
  profile.locked = isStandard || Boolean(profile.locked);
  profile.contextScope = normalizeCompressionContextScope(el.compressionProfileContextScope?.value || profile.contextScope);
  profile.triggerActions = collectCompressionTriggerActionsFromEditor();
  profile.triggers = profile.triggerActions[0]?.triggers ||
    normalizeCompressionTriggerConfig({}, { defaultRoundLimit: isStandard });
  profile.appendTerms = collectCompressionAppendTermsFromEditor();
  const compressionModels = collectCompressionModelsFromEditor();
  profile.contextCompression = normalizeContextCompressionConfig({
    mainRules: el.modularCompressionMainRules?.value || "",
    models: compressionModels
  }, appState?.contextCompressionPrompt || "", {
    allowEmptyModels: !isStandard || compressionModels.length === 0,
    allowEmptyMainRules: !isStandard
  });
}

function renderCompressionProfileEditor(profileId = selectedCompressionProfileId) {
  if (compressionProfilesDraft.length === 0) {
    compressionProfilesDraft = [createStandardCompressionProfile({})];
  }
  selectedCompressionProfileId = compressionProfilesDraft.some((profile) => profile.id === profileId)
    ? profileId
    : STANDARD_COMPRESSION_PROFILE_ID;
  renderCompressionProfileOptions(selectedCompressionProfileId);
  const profile = getSelectedCompressionProfile();
  if (!profile) {
    return;
  }
  const isStandard = profile.id === STANDARD_COMPRESSION_PROFILE_ID;
  if (el.compressionProfileName) {
    el.compressionProfileName.value = profile.name || getDefaultCompressionProfileName(profile.id);
  }
  if (el.compressionProfileEnabled) {
    el.compressionProfileEnabled.checked = isStandard || profile.enabled !== false;
    el.compressionProfileEnabled.disabled = isStandard;
    el.compressionProfileEnabled.title = isStandard ? "標準壓縮模型固定啟用" : "";
  }
  if (el.compressionProfileContextScope) {
    el.compressionProfileContextScope.value = normalizeCompressionContextScope(profile.contextScope);
  }
  if (el.deleteCompressionProfileBtn) {
    el.deleteCompressionProfileBtn.disabled = isStandard;
    el.deleteCompressionProfileBtn.title = isStandard ? "標準壓縮模型不可刪除" : "";
  }
  renderCompressionTriggerActionEditor(profile.triggerActions || []);
  renderCompressionAppendTermEditor(profile.appendTerms || []);
  if (el.modularCompressionMainRules) {
    el.modularCompressionMainRules.value = profile.contextCompression?.mainRules || "";
  }
  renderCompressionModelEditor(profile.contextCompression?.models || []);
  clearModularPromptPreview();
}

function createCompressionProfile() {
  syncSelectedCompressionProfileFromEditor();
  let index = compressionProfilesDraft.length + 1;
  let id = normalizeCompressionProfileId(`compression_profile_${index}`);
  while (compressionProfilesDraft.some((profile) => profile.id === id)) {
    index += 1;
    id = normalizeCompressionProfileId(`compression_profile_${index}`);
  }
  const profile = normalizeCompressionProfileConfig({
    id,
    name: `大模型 ${index}`,
    enabled: true,
    triggerActions: [
      {
        id: `trigger_action_${Date.now()}`,
        name: "觸發組合 1",
        enabled: true,
        action: MODEL_TRIGGER_ACTION_CALL_API,
        keywordFollowupAction: KEYWORD_FOLLOWUP_CONTINUE_REASONER,
        skipReasoner: false,
        triggers: { everyTurn: false, roundLimit: false, keywords: [], keywordSource: "both", turns: [] },
        expanded: true
      }
    ],
    appendTerms: [],
    contextCompression: {
      mainRules: "",
      models: []
    }
  }, compressionProfilesDraft.length, null);
  compressionProfilesDraft.push(profile);
  renderCompressionProfileEditor(profile.id);
}

function deleteSelectedCompressionProfile() {
  const profile = getSelectedCompressionProfile();
  if (!profile || profile.id === STANDARD_COMPRESSION_PROFILE_ID) {
    showToast("標準壓縮模型不可刪除", "error");
    return;
  }
  if (!window.confirm(`確定要刪除大模型「${profile.name || profile.id}」嗎？`)) {
    return;
  }
  compressionProfilesDraft = compressionProfilesDraft.filter((item) => item.id !== profile.id);
  renderCompressionProfileEditor(STANDARD_COMPRESSION_PROFILE_ID);
}

function renderModularPromptEditor(mode = "") {
  const promptMode = normalizeRoleCardMode(mode || getActivePromptMode(appState));
  const config = getModularConfig(promptMode);
  compressionProfilesDraft = normalizeCompressionProfilesConfig(config);
  selectedCompressionProfileId = STANDARD_COMPRESSION_PROFILE_ID;
  if (el.modularPromptModeSelect) {
    renderPromptModeOptions(el.modularPromptModeSelect, promptMode);
  }
  if (el.modularPromptModeName) {
    el.modularPromptModeName.value = config.name || getDefaultPromptModeDisplayName(promptMode);
  }
  if (el.modularPromptDialogueContextRounds) {
    el.modularPromptDialogueContextRounds.value = String(normalizeDialogueContextRounds(config.dialogueContextRounds));
  }
  if (el.deleteModularPromptModeBtn) {
    el.deleteModularPromptModeBtn.disabled = BUILTIN_PROMPT_MODES.includes(promptMode);
    el.deleteModularPromptModeBtn.title = BUILTIN_PROMPT_MODES.includes(promptMode)
      ? "內建模式不可刪除"
      : "";
  }
  renderCompressionProfileEditor(selectedCompressionProfileId);
  if (el.modularReasonerMainRules) {
    el.modularReasonerMainRules.value = config.reasonerHistory?.mainRules || "";
  }
  if (el.modularReasonerContextRules) {
    el.modularReasonerContextRules.value = config.reasonerHistory?.contextRules || "";
  }
  clearModularPromptPreview();
}

function scheduleModularPromptEditorRender(mode = "") {
  const render = () => {
    modularPromptRenderFrame = 0;
    renderModularPromptEditor(mode);
  };
  if (typeof window.requestAnimationFrame !== "function") {
    render();
    return;
  }
  if (modularPromptRenderFrame) {
    window.cancelAnimationFrame(modularPromptRenderFrame);
  }
  modularPromptRenderFrame = window.requestAnimationFrame(render);
}

function collectCompressionModelsFromEditor(options = {}) {
  if (!el.modularCompressionModelList) {
    return [];
  }
  const keepEmpty = Boolean(options.keepEmpty);
  const models = Array.from(el.modularCompressionModelList.querySelectorAll("[data-compression-model-id]"))
    .map((item, index) => normalizeCompressionModelConfig({
      id: item.querySelector("[data-field='compressionModelId']")?.value || item.dataset.compressionModelId || "",
      name: item.querySelector("[data-field='compressionModelName']")?.value || "",
      addRules: item.querySelector("[data-field='compressionModelAddRules']")?.value || "",
      deleteRules: item.querySelector("[data-field='compressionModelDeleteRules']")?.value || ""
    }, index));
  return keepEmpty ? models : models.filter((item) => item.id || item.name || item.addRules || item.deleteRules);
}

function renderCompressionModelEditor(models = []) {
  if (!el.modularCompressionModelList) {
    return;
  }
  compressionModelsDraft = (Array.isArray(models) ? models : []).map((item, index) => normalizeCompressionModelConfig(item, index));

  if (compressionModelsDraft.length === 0) {
    replaceEditorChildren(el.modularCompressionModelList, [
      createEditorEmptyHint("尚未建立模塊，這個大模型會以純文本方式保存模型內容。")
    ]);
    return;
  }

  const renderedModels = compressionModelsDraft.map((model, index) => {
    const item = document.createElement("div");
    item.className = "role-card custom-section-card compression-model-card";
    item.dataset.compressionModelId = model.id;

    const title = document.createElement("div");
    title.className = "inline-actions";
    const label = document.createElement("strong");
    label.textContent = `${model.name || model.id || `模塊 ${index + 1}`} (${model.id || "未設定ID"})`;
    label.style.flex = "1";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除模塊";
    deleteBtn.addEventListener("click", () => {
      compressionModelsDraft = collectCompressionModelsFromEditor({ keepEmpty: true })
        .filter((entry, entryIndex) => entryIndex !== index);
      renderCompressionModelEditor(compressionModelsDraft);
      clearModularPromptPreview();
    });
    title.append(label, deleteBtn);

    const idLabel = document.createElement("label");
    idLabel.textContent = "id";
    const idInput = document.createElement("input");
    idInput.type = "text";
    idInput.value = model.id || "";
    idInput.placeholder = "例如：PlotProgression";
    idInput.dataset.field = "compressionModelId";
    idLabel.appendChild(idInput);

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "名字";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = model.name || "";
    nameInput.placeholder = "例如：劇情狀態";
    nameInput.dataset.field = "compressionModelName";
    nameLabel.appendChild(nameInput);

    const addLabel = document.createElement("label");
    addLabel.textContent = "新增模塊規則";
    const addInput = document.createElement("textarea");
    addInput.rows = 5;
    addInput.className = "compression-model-rules";
    addInput.value = model.addRules || "";
    addInput.dataset.field = "compressionModelAddRules";
    addLabel.appendChild(addInput);

    const deleteLabel = document.createElement("label");
    deleteLabel.textContent = "刪除模塊規則";
    const deleteInput = document.createElement("textarea");
    deleteInput.rows = 5;
    deleteInput.className = "compression-model-rules";
    deleteInput.value = model.deleteRules || "";
    deleteInput.dataset.field = "compressionModelDeleteRules";
    deleteLabel.appendChild(deleteInput);

    [idInput, nameInput, addInput, deleteInput].forEach((field) => {
      field.addEventListener("input", clearModularPromptPreview);
    });

    item.append(title, idLabel, nameLabel, addLabel, deleteLabel);
    return item;
  });
  replaceEditorChildren(el.modularCompressionModelList, renderedModels);
}

function collectModularPromptConfig() {
  const mode = normalizeRoleCardMode(el.modularPromptModeSelect?.value || "single");
  syncSelectedCompressionProfileFromEditor();
  const fallbackProfile = compressionProfilesDraft.find((profile) => profile.id === STANDARD_COMPRESSION_PROFILE_ID) ||
    createStandardCompressionProfile({});
  const compressionProfiles = compressionProfilesDraft.map((profile, index) =>
    normalizeCompressionProfileConfig(profile, index, fallbackProfile.contextCompression)
  );
  const standardProfile = compressionProfiles.find((profile) => profile.id === STANDARD_COMPRESSION_PROFILE_ID) ||
    createStandardCompressionProfile(fallbackProfile.contextCompression);
  const contextCompression = standardProfile.contextCompression;
  return {
    version: 2,
    mode,
    name: el.modularPromptModeName?.value?.trim() || getDefaultPromptModeDisplayName(mode),
    dialogueContextRounds: normalizeDialogueContextRounds(el.modularPromptDialogueContextRounds?.value || 20),
    contextCompression,
    contextCompressionPrompt: contextCompression.mainRules,
    compressionProfiles,
    reasonerHistory: {
      mainRules: el.modularReasonerMainRules?.value || "",
      contextRules: el.modularReasonerContextRules?.value || ""
    }
  };
}

function getModularPromptImportSource(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  return source.config ||
    source.promptMode ||
    source.modularPromptConfig ||
    source.timeTavernPromptMode ||
    source.extensions?.time_tavern_prompt_mode ||
    source;
}

function normalizeImportedModularPromptConfig(payload = {}, fallbackMode = "") {
  const source = getModularPromptImportSource(payload);
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("這不是有效的 Prompt 模式 JSON。");
  }
  const hasPromptFields = [
    "mode",
    "name",
    "title",
    "displayName",
    "dialogueContextRounds",
    "contextCompression",
    "contextCompressionPrompt",
    "compressionProfiles",
    "reasonerHistory",
    "reasonerMainRules",
    "reasonerContextRules"
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));
  if (!hasPromptFields) {
    throw new Error("JSON 中找不到可匯入的 Prompt 模式資料。");
  }

  const mode = normalizeRoleCardMode(source.mode || source.id || fallbackMode || "single");
  const contextCompressionInput = source.contextCompression ||
    source.compression ||
    {
      mainRules: source.contextCompressionPrompt || source.compressionPrompt || "",
      models: source.models || source.compressionModels || []
    };
  const compressionProfiles = normalizeCompressionProfilesConfig({
    ...source,
    contextCompression: contextCompressionInput,
    contextCompressionPrompt: source.contextCompressionPrompt || contextCompressionInput?.mainRules || ""
  });
  const standardProfile = compressionProfiles.find((profile) => profile.id === STANDARD_COMPRESSION_PROFILE_ID) ||
    createStandardCompressionProfile(normalizeContextCompressionConfig(contextCompressionInput, appState?.contextCompressionPrompt || ""));
  const contextCompression = standardProfile.contextCompression;
  const reasonerHistory = source.reasonerHistory || source.reasoner || {};

  return {
    version: 2,
    mode,
    name: String(source.name || source.title || source.displayName || getDefaultPromptModeDisplayName(mode)).trim(),
    dialogueContextRounds: normalizeDialogueContextRounds(source.dialogueContextRounds || source.contextRounds || 20),
    contextCompression,
    contextCompressionPrompt: contextCompression.mainRules,
    compressionProfiles,
    reasonerHistory: {
      mainRules: String(reasonerHistory.mainRules ?? source.reasonerMainRules ?? source.reasonerHistoryPrompt ?? "").trim(),
      contextRules: String(reasonerHistory.contextRules ?? source.reasonerContextRules ?? source.reasonerContextPrompt ?? "").trim()
    }
  };
}

function normalizePromptModeIdCandidate(value = "", fallback = "imported_prompt") {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || fallback;
}

function createUniqueImportedPromptModeId(config = {}) {
  const existingModes = new Set([
    ...BUILTIN_PROMPT_MODES,
    ...Object.keys(appState?.modularPromptConfigs || {})
  ].map((mode) => normalizeRoleCardMode(mode)));
  const base = normalizePromptModeIdCandidate(config.mode || config.name || "imported_prompt");
  if (!existingModes.has(base)) {
    return base;
  }
  const importedBase = `${base}_import`;
  if (!existingModes.has(importedBase)) {
    return importedBase;
  }
  let index = 2;
  let candidate = `${importedBase}_${index}`;
  while (existingModes.has(candidate)) {
    index += 1;
    candidate = `${importedBase}_${index}`;
  }
  return candidate;
}

function buildModularPromptModeExportPayload(config = collectModularPromptConfig()) {
  return {
    type: "time_tavern_prompt_mode",
    version: 1,
    exportedAt: new Date().toISOString(),
    config: cloneSerializable(config)
  };
}

function exportCurrentModularPromptMode() {
  try {
    const config = collectModularPromptConfig();
    const payload = buildModularPromptModeExportPayload(config);
    const fileName = `${sanitizeDownloadFileName(`prompt_${config.mode}_${config.name || getDefaultPromptModeDisplayName(config.mode)}`)}.json`;
    triggerBlobDownload(
      new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" }),
      fileName
    );
    showToast("已匯出 Prompt 模式");
  } catch (error) {
    showToast(error.message || "Prompt 匯出失敗", "error");
  }
}

function buildCompressionProfileExportPayload(profile = getSelectedCompressionProfile()) {
  const activeMode = normalizeRoleCardMode(el.modularPromptModeSelect?.value || getActivePromptMode(appState));
  const promptName = el.modularPromptModeName?.value?.trim() || getPromptModeDisplayName(activeMode);
  return {
    type: "time_tavern_compression_profile",
    version: 1,
    exportedAt: new Date().toISOString(),
    promptMode: {
      mode: activeMode,
      name: promptName
    },
    profile: cloneSerializable(profile)
  };
}

function exportSelectedCompressionProfile() {
  try {
    syncSelectedCompressionProfileFromEditor();
    const profile = getSelectedCompressionProfile();
    if (!profile) {
      throw new Error("目前沒有可匯出的大模型。");
    }
    const payload = buildCompressionProfileExportPayload(profile);
    const fileName = `${sanitizeDownloadFileName([
      "compression_profile",
      payload.promptMode?.name || payload.promptMode?.mode,
      profile.name || profile.id
    ].filter(Boolean).join("_"))}.json`;
    triggerBlobDownload(
      new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" }),
      fileName
    );
    showToast("已匯出大模型");
  } catch (error) {
    showToast(error.message || "大模型匯出失敗", "error");
  }
}

function getCompressionProfileImportSource(payload = {}) {
  const source = payload && typeof payload === "object" ? payload : {};
  return source.profile ||
    source.compressionProfile ||
    source.timeTavernCompressionProfile ||
    source.extensions?.time_tavern_compression_profile ||
    source;
}

function normalizeImportedCompressionProfile(payload = {}, targetProfile = getSelectedCompressionProfile(), targetIndex = 0) {
  const source = getCompressionProfileImportSource(payload);
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("這不是有效的大模型 JSON。");
  }
  const hasProfileFields = [
    "contextScope",
    "triggerActions",
    "actions",
    "triggers",
    "appendTerms",
    "playerAppendTerms",
    "contextCompression",
    "compression"
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));
  if (!hasProfileFields) {
    throw new Error("JSON 中找不到可匯入的大模型資料。");
  }
  const targetId = normalizeCompressionProfileId(targetProfile?.id || selectedCompressionProfileId);
  const isStandard = targetId === STANDARD_COMPRESSION_PROFILE_ID;
  return normalizeCompressionProfileConfig({
    ...source,
    id: targetId,
    enabled: isStandard ? true : source.enabled,
    locked: isStandard
  }, targetIndex, targetProfile?.contextCompression || null);
}

async function importCompressionProfileFromFile(file) {
  if (!file) {
    return;
  }
  try {
    syncSelectedCompressionProfileFromEditor();
    const currentProfile = getSelectedCompressionProfile();
    if (!currentProfile) {
      throw new Error("目前沒有可覆蓋的大模型。");
    }
    const ok = window.confirm(`匯入會覆蓋目前選中的大模型「${currentProfile.name || currentProfile.id}」。匯入後仍需按「保存 Prompt」才會正式保存。要繼續嗎？`);
    if (!ok) {
      return;
    }
    const text = await file.text();
    let payload = null;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error("大模型匯入失敗：JSON 格式不正確。");
    }
    const targetIndex = compressionProfilesDraft.findIndex((profile) => profile.id === currentProfile.id);
    const importedProfile = normalizeImportedCompressionProfile(payload, currentProfile, Math.max(0, targetIndex));
    compressionProfilesDraft = compressionProfilesDraft.map((profile) =>
      profile.id === currentProfile.id ? importedProfile : profile
    );
    renderCompressionProfileEditor(importedProfile.id);
    showToast("大模型已匯入，請按「保存 Prompt」寫入設定");
  } catch (error) {
    showToast(error.message || "大模型匯入失敗", "error");
  } finally {
    if (el.compressionProfileImportFile) {
      el.compressionProfileImportFile.value = "";
    }
  }
}

async function importModularPromptModeFromFile(file) {
  if (!file) {
    return;
  }
  try {
    const ok = window.confirm("匯入會建立一個新的 Prompt 模式並立即保存，不會覆蓋目前模式。要繼續嗎？");
    if (!ok) {
      return;
    }
    const text = await file.text();
    let payload = null;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error("Prompt 匯入失敗：JSON 格式不正確。");
    }
    const importedConfig = normalizeImportedModularPromptConfig(payload, "imported_prompt");
    const mode = createUniqueImportedPromptModeId(importedConfig);
    const config = {
      ...importedConfig,
      mode,
      name: importedConfig.name || getDefaultPromptModeDisplayName(mode)
    };
    const response = await request(`/api/modular-prompts/${mode}`, {
      method: "PUT",
      body: JSON.stringify({ config })
    });
    appState = response?.state || appState;
    renderAllPromptModeSelects(config.mode);
    renderModularPromptEditor(config.mode);
    showToast(`Prompt 模式「${config.name}」已匯入並保存`);
  } catch (error) {
    showToast(error.message || "Prompt 匯入失敗", "error");
  } finally {
    if (el.modularPromptImportFile) {
      el.modularPromptImportFile.value = "";
    }
  }
}

function collectRoleCardCustomSectionsFromEditor(options = {}) {
  if (!el.roleCardCustomSectionList) {
    return [];
  }
  const keepEmpty = Boolean(options.keepEmpty);
  const sections = Array.from(el.roleCardCustomSectionList.querySelectorAll("[data-custom-section-id]"))
    .map((item) => normalizeRoleCardCustomSection({
      id: item.dataset.customSectionId || "",
      name: item.querySelector("[data-field='sectionName']")?.value || "",
      content: item.querySelector("[data-field='sectionContent']")?.value || "",
      enabled: item.dataset.sectionEnabled !== "false",
      includeInImagePrompt: item.dataset.sectionIncludeInImagePrompt === "true"
    }));
  return keepEmpty ? sections : sections.filter((item) => item.name || item.content);
}

function renderRoleCardCustomSectionEditor(sections = []) {
  if (!el.roleCardCustomSectionList) {
    return;
  }
  roleCardCustomSectionsDraft = normalizeRoleCardCustomSectionsForEditor(sections);
  el.roleCardCustomSectionList.innerHTML = "";

  if (roleCardCustomSectionsDraft.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚未建立自定義內容。";
    el.roleCardCustomSectionList.appendChild(empty);
    return;
  }

  roleCardCustomSectionsDraft.forEach((section, index) => {
    const item = document.createElement("div");
    item.className = "role-card custom-section-card";
    item.dataset.customSectionId = section.id;
    item.dataset.sectionEnabled = section.enabled !== false ? "true" : "false";
    item.dataset.sectionIncludeInImagePrompt = section.includeInImagePrompt ? "true" : "false";

    const title = document.createElement("div");
    title.className = "inline-actions";

    const label = document.createElement("strong");
    label.textContent = [
      section.name || `自定義內容 ${index + 1}`,
      section.enabled === false ? "停用" : "",
      section.includeInImagePrompt ? "加入繪圖" : ""
    ].filter(Boolean).join("｜");
    label.style.flex = "1";

    const enabledBtn = document.createElement("button");
    enabledBtn.type = "button";
    enabledBtn.className = section.enabled !== false ? "secondary" : "muted";
    enabledBtn.textContent = section.enabled !== false ? "啟用" : "停用";
    enabledBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true })
        .map((item) => item.id === section.id ? { ...item, enabled: item.enabled === false } : item);
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });

    const imagePromptBtn = document.createElement("button");
    imagePromptBtn.type = "button";
    imagePromptBtn.className = section.includeInImagePrompt ? "secondary" : "muted";
    imagePromptBtn.textContent = section.includeInImagePrompt ? "繪圖啟用" : "加入繪圖";
    imagePromptBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true })
        .map((item) => item.id === section.id ? { ...item, includeInImagePrompt: !item.includeInImagePrompt } : item);
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true })
        .filter((item) => item.id !== section.id);
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });

    title.append(label, enabledBtn, imagePromptBtn, deleteBtn);

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "自定義名字";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = section.name || "";
    nameInput.placeholder = "例如：性格";
    nameInput.dataset.field = "sectionName";
    nameLabel.appendChild(nameInput);

    const contentLabel = document.createElement("label");
    contentLabel.textContent = "內容";
    const contentInput = document.createElement("textarea");
    contentInput.rows = 4;
    contentInput.value = section.content || "";
    contentInput.placeholder = "輸入這個欄位要保存的內容。";
    contentInput.dataset.field = "sectionContent";
    contentLabel.appendChild(contentInput);

    item.append(title, nameLabel, contentLabel);
    el.roleCardCustomSectionList.appendChild(item);
  });
}

function normalizeRoleCardOpeningDialogueEntry(entry = {}, index = 0) {
  const source = typeof entry === "string"
    ? { content: entry }
    : entry && typeof entry === "object"
      ? entry
      : {};
  const content = String(
    source.content ??
    source.text ??
    source.value ??
    source.openingDialogue ??
    source.first_mes ??
    ""
  ).trim();
  return {
    id: String(source.id || `opening_${Date.now()}_${index}_${Math.random().toString(36).slice(2, 8)}`).trim(),
    name: String(source.name || source.title || source.label || `開場 ${index + 1}`).trim(),
    content
  };
}

function normalizeRoleCardOpeningDialoguesForEditor(value = [], fallbackOpening = "") {
  const rawItems = Array.isArray(value) ? value : [];
  const entries = rawItems
    .map((item, index) => normalizeRoleCardOpeningDialogueEntry(item, index))
    .filter((item) => item.name || item.content);
  const fallback = String(fallbackOpening || "").trim();
  if (fallback && !entries.some((item) => item.content === fallback)) {
    entries.unshift(normalizeRoleCardOpeningDialogueEntry({ id: "opening_primary", name: "開場 1", content: fallback }, 0));
  }
  if (entries.length === 0) {
    entries.push(normalizeRoleCardOpeningDialogueEntry({ name: "開場 1", content: "" }, 0));
  }
  return entries.map((entry, index) => ({
    ...entry,
    name: entry.name || `開場 ${index + 1}`
  }));
}

function syncSelectedRoleCardOpeningFromEditor() {
  if (!selectedRoleCardOpeningId || !el.roleCardOpening) {
    return;
  }
  const content = el.roleCardOpening.value;
  roleCardOpeningDialoguesDraft = roleCardOpeningDialoguesDraft.map((entry) =>
    entry.id === selectedRoleCardOpeningId ? { ...entry, content } : entry
  );
}

function renderRoleCardOpeningTabs(selectedId = "") {
  if (!el.roleCardOpeningTabs || !el.roleCardOpening) {
    return;
  }
  if (roleCardOpeningDialoguesDraft.length === 0) {
    roleCardOpeningDialoguesDraft = normalizeRoleCardOpeningDialoguesForEditor([], "");
  }
  selectedRoleCardOpeningId = roleCardOpeningDialoguesDraft.some((entry) => entry.id === selectedId)
    ? selectedId
    : roleCardOpeningDialoguesDraft[0]?.id || "";
  const selectedEntry = roleCardOpeningDialoguesDraft.find((entry) => entry.id === selectedRoleCardOpeningId);
  el.roleCardOpening.value = selectedEntry?.content || "";
  el.roleCardOpeningTabs.innerHTML = "";

  roleCardOpeningDialoguesDraft.forEach((entry, index) => {
    const tab = document.createElement("div");
    tab.className = `opening-dialogue-tab${entry.id === selectedRoleCardOpeningId ? " active" : ""}`;

    const switchBtn = document.createElement("button");
    switchBtn.type = "button";
    switchBtn.className = "opening-dialogue-tab-label";
    switchBtn.textContent = entry.name || `開場 ${index + 1}`;
    switchBtn.title = entry.name || `開場 ${index + 1}`;
    switchBtn.addEventListener("click", () => {
      syncSelectedRoleCardOpeningFromEditor();
      renderRoleCardOpeningTabs(entry.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "opening-dialogue-tab-close";
    deleteBtn.textContent = "×";
    deleteBtn.title = "刪除這個開場";
    deleteBtn.addEventListener("click", () => {
      syncSelectedRoleCardOpeningFromEditor();
      const currentIndex = roleCardOpeningDialoguesDraft.findIndex((item) => item.id === entry.id);
      if (roleCardOpeningDialoguesDraft.length <= 1) {
        roleCardOpeningDialoguesDraft = normalizeRoleCardOpeningDialoguesForEditor([], "");
        renderRoleCardOpeningTabs(roleCardOpeningDialoguesDraft[0]?.id || "");
        return;
      }
      roleCardOpeningDialoguesDraft = roleCardOpeningDialoguesDraft.filter((item) => item.id !== entry.id);
      const nextEntry = roleCardOpeningDialoguesDraft[Math.max(0, currentIndex - 1)] || roleCardOpeningDialoguesDraft[0];
      renderRoleCardOpeningTabs(nextEntry?.id || "");
    });

    tab.append(switchBtn, deleteBtn);
    el.roleCardOpeningTabs.appendChild(tab);
  });
}

function collectRoleCardOpeningDialoguesFromEditor() {
  syncSelectedRoleCardOpeningFromEditor();
  return roleCardOpeningDialoguesDraft
    .map((entry, index) => normalizeRoleCardOpeningDialogueEntry(entry, index))
    .filter((entry) => entry.content);
}

function getSelectedRoleCardOpeningDialogue(dialogues = []) {
  return dialogues.find((entry) => entry.id === selectedRoleCardOpeningId)?.content || dialogues[0]?.content || "";
}

function collectRoleCardLorebookDraftsFromEditor() {
  if (!el.roleCardLorebookList) {
    return [];
  }
  return Array.from(el.roleCardLorebookList.querySelectorAll("[data-lorebook-id]"))
    .map((item) => ({
      id: item.dataset.lorebookId || "",
      expanded: Boolean(item.open),
      key: item.querySelector("[data-field='key']")?.value || "",
      keywords: parseTermInput(item.querySelector("[data-field='keywords']")?.value || ""),
      secondaryKeywords: parseTermInput(item.querySelector("[data-field='secondaryKeywords']")?.value || ""),
      content: item.querySelector("[data-field='content']")?.value || "",
      enabled: Boolean(item.querySelector("[data-field='enabled']")?.checked),
      permanent: Boolean(item.querySelector("[data-field='permanent']")?.checked),
      probability: normalizeLorebookProbability(item.querySelector("[data-field='probability']")?.value, 100),
      activation: {
        activeTurns: 0,
        onCloseActivate: []
      }
    }))
    .map((item) => normalizeRoleCardLorebookEntry(item));
}

function collectRoleCardLorebooksFromEditor() {
  return collectRoleCardLorebookDraftsFromEditor()
    .filter((item) => {
      return item.key || item.content || item.keywords.length > 0 || item.secondaryKeywords.length > 0;
    });
}

function renderRoleCardLorebookEditor(entries = []) {
  if (!el.roleCardLorebookList) {
    return;
  }
  roleCardLorebooksDraft = (Array.isArray(entries) ? entries : []).map((entry) => normalizeRoleCardLorebookEntry(entry));
  el.roleCardLorebookList.innerHTML = "";

  if (roleCardLorebooksDraft.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚未建立世界書條目。";
    el.roleCardLorebookList.appendChild(empty);
    return;
  }

  roleCardLorebooksDraft.forEach((entry, index) => {
    const item = document.createElement("details");
    item.className = "role-card";
    item.dataset.lorebookId = entry.id;
    item.open = Boolean(entry.expanded);

    const header = document.createElement("summary");
    header.className = "inline-actions";

    const title = document.createElement("strong");
    const titleParts = [
      entry.key || `條目 ${index + 1}`,
      entry.permanent ? "永久" : "",
      entry.secondaryKeywords?.length > 0 ? "第二關鍵字" : "",
      normalizeLorebookProbability(entry.probability, 100) < 100 ? `${normalizeLorebookProbability(entry.probability, 100)}%` : ""
    ].filter(Boolean);
    title.textContent = titleParts.join("｜");
    title.style.flex = "1";

    const enabledBtn = document.createElement("button");
    enabledBtn.type = "button";
    enabledBtn.className = entry.enabled !== false ? "secondary" : "muted";
    enabledBtn.textContent = entry.enabled !== false ? "啟用" : "停用";
    enabledBtn.addEventListener("click", (event) => {
      event.preventDefault();
      roleCardLorebooksDraft = collectRoleCardLorebookDraftsFromEditor().map((item) =>
        item.id === entry.id ? { ...item, enabled: item.enabled === false } : item
      );
      renderRoleCardLorebookEditor(roleCardLorebooksDraft);
    });

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "secondary";
    editBtn.textContent = entry.expanded ? "收合" : "編輯";
    editBtn.addEventListener("click", (event) => {
      event.preventDefault();
      roleCardLorebooksDraft = collectRoleCardLorebookDraftsFromEditor().map((item) =>
        item.id === entry.id ? { ...item, expanded: !item.expanded } : item
      );
      renderRoleCardLorebookEditor(roleCardLorebooksDraft);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", (event) => {
      event.preventDefault();
      roleCardLorebooksDraft = collectRoleCardLorebookDraftsFromEditor().filter((item) => item.id !== entry.id);
      renderRoleCardLorebookEditor(roleCardLorebooksDraft);
    });

    header.append(title, enabledBtn, editBtn, deleteBtn);

    const enabledLabel = document.createElement("label");
    enabledLabel.textContent = "啟用";
    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = entry.enabled !== false;
    enabledInput.dataset.field = "enabled";
    enabledLabel.prepend(enabledInput);
    enabledLabel.hidden = true;

    const permanentLabel = document.createElement("label");
    permanentLabel.className = "checkbox-label";
    const permanentInput = document.createElement("input");
    permanentInput.type = "checkbox";
    permanentInput.checked = Boolean(entry.permanent);
    permanentInput.dataset.field = "permanent";
    permanentLabel.append(permanentInput, document.createTextNode("永久啟用（放入角色卡自定義內容位置）"));

    const keyLabel = document.createElement("label");
    keyLabel.textContent = "條目標題 (Key)";
    const keyInput = document.createElement("input");
    keyInput.type = "text";
    keyInput.value = entry.key || "";
    keyInput.placeholder = "例如：小明";
    keyInput.dataset.field = "key";
    keyLabel.appendChild(keyInput);

    const keywordLabel = document.createElement("label");
    keywordLabel.textContent = "關鍵字 (Keywords)";
    const keywordInput = document.createElement("textarea");
    keywordInput.rows = 2;
    keywordInput.value = Array.isArray(entry.keywords) ? entry.keywords.join(", ") : "";
    keywordInput.placeholder = "例如：小明, 那個男人, 小明同學";
    keywordInput.dataset.field = "keywords";
    keywordLabel.appendChild(keywordInput);

    const secondaryKeywordLabel = document.createElement("label");
    secondaryKeywordLabel.textContent = "第二關鍵字";
    const secondaryKeywordInput = document.createElement("textarea");
    secondaryKeywordInput.rows = 2;
    secondaryKeywordInput.value = Array.isArray(entry.secondaryKeywords) ? entry.secondaryKeywords.join(", ") : "";
    secondaryKeywordInput.placeholder = "有填時，需要主關鍵字 + 第二關鍵字同時命中才會觸發。";
    secondaryKeywordInput.dataset.field = "secondaryKeywords";
    secondaryKeywordLabel.appendChild(secondaryKeywordInput);

    const probabilityLabel = document.createElement("label");
    probabilityLabel.textContent = "百分比啟用";
    const probabilityInput = document.createElement("input");
    probabilityInput.type = "number";
    probabilityInput.min = "0";
    probabilityInput.max = "100";
    probabilityInput.step = "1";
    probabilityInput.value = String(normalizeLorebookProbability(entry.probability, 100));
    probabilityInput.dataset.field = "probability";
    probabilityLabel.appendChild(probabilityInput);

    const contentLabel = document.createElement("label");
    contentLabel.textContent = "內容 (Content)";
    const contentInput = document.createElement("textarea");
    contentInput.rows = 4;
    contentInput.value = entry.content || "";
    contentInput.placeholder = "例如：小明是個性格開朗、喜歡吃蘋果的 18 歲少年，是主角的好友。";
    contentInput.dataset.field = "content";
    contentLabel.appendChild(contentInput);

    const editor = document.createElement("div");
    editor.className = "stack";
    editor.append(
      enabledLabel,
      permanentLabel,
      keyLabel,
      keywordLabel,
      secondaryKeywordLabel,
      probabilityLabel,
      contentLabel
    );

    item.append(header, editor);
    el.roleCardLorebookList.appendChild(item);
  });
}

function openRoleCardDialog(card = null) {
  if (card) {
    el.roleCardDialogTitle.textContent = "編輯角色卡";
    roleCardCoverImageReadTask = null;
    el.roleCardId.value = card.id;
    renderPromptModeOptions(el.roleCardMode, normalizeRoleCardMode(card.mode));
    el.roleCardName.value = card.name;
    el.roleCardCoverImageFile.value = "";
    setRoleCardCoverPreview(card.coverImage || "", card.coverPosition || "center center");
    renderRoleCardCustomSectionEditor(normalizeRoleCardCustomSections(card.customSections, card));
    roleCardOpeningDialoguesDraft = normalizeRoleCardOpeningDialoguesForEditor(card.openingDialogues, card.openingDialogue);
    renderRoleCardOpeningTabs(card.activeOpeningDialogueId || roleCardOpeningDialoguesDraft[0]?.id || "");
    renderRoleCardLorebookEditor(card.lorebooks || []);
  } else {
    el.roleCardDialogTitle.textContent = "建立角色卡";
    roleCardCoverImageReadTask = null;
    el.roleCardId.value = "";
    renderPromptModeOptions(el.roleCardMode, DEFAULT_ROLE_CARD_MODE);
    el.roleCardName.value = "";
    el.roleCardCoverImageFile.value = "";
    setRoleCardCoverPreview("", "center center");
    renderRoleCardCustomSectionEditor([]);
    roleCardOpeningDialoguesDraft = normalizeRoleCardOpeningDialoguesForEditor([], "");
    renderRoleCardOpeningTabs(roleCardOpeningDialoguesDraft[0]?.id || "");
    renderRoleCardLorebookEditor([]);
  }

  el.roleCardDialog.showModal();
}

function refreshAssistantSelector() {
  const assistantMessages = (appState?.conversation || []).filter((msg) => msg.role === "assistant" && !isImageOnlyMessage(msg));
  el.assistantMessageSelect.innerHTML = "";

  assistantMessages.forEach((msg, index) => {
    const option = document.createElement("option");
    option.value = msg.id;
    option.textContent = `#${index + 1} ${msg.content.slice(0, 30) || "(空白)"}`;
    el.assistantMessageSelect.appendChild(option);
  });

  if (assistantMessages.length > 0) {
    el.assistantMessageSelect.value = assistantMessages[assistantMessages.length - 1].id;
    onAssistantMessagePick();
  } else {
    el.assistantMessageContent.value = "";
  }
}

function onAssistantMessagePick() {
  const selectedId = el.assistantMessageSelect.value;
  const msg = (appState?.conversation || []).find((item) => item.id === selectedId);
  el.assistantMessageContent.value = msg?.content || "";
}

async function startRoleCard(cardId) {
  pendingRoleCardStartId = cardId;
  setMobilePage("chat");
  if (appState) {
    renderRoleCards(appState);
    renderStatus(appState);
  }
  showToast("正在切換角色卡，請稍候...");

  try {
    await request(`/api/role-cards/${cardId}/start`, { method: "POST" });
    await refresh();
    showToast("已使用角色卡開始，AI 已啟動");
  } catch (error) {
    pendingRoleCardStartId = "";
    if (appState) {
      renderRoleCards(appState);
      renderStatus(appState);
    }
    showToast(error.message, "error");
  }
}

async function startAssistantCard(assistantId = CHARACTER_CARD_CREATION_ASSISTANT_MODE) {
  const assistantCard = getAssistantCardById(appState, assistantId) || {
    id: CHARACTER_CARD_CREATION_ASSISTANT_MODE,
    name: DEFAULT_ASSISTANT_CARD_NAME
  };
  pendingRoleCardStartId = assistantCard.id;
  setMobilePage("chat");
  if (appState) {
    renderRoleCards(appState);
    renderStatus(appState);
  }
  showToast(`正在啟用${getAssistantCardName(assistantCard)}，請稍候...`);

  try {
    const url = assistantCard.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE
      ? "/api/assistant-modes/character-card-creation/start"
      : `/api/assistant-cards/${assistantCard.id}/start`;
    await request(url, { method: "POST" });
    await refresh();
    showToast(`${getAssistantCardName(assistantCard)}已啟用`);
  } catch (error) {
    pendingRoleCardStartId = "";
    if (appState) {
      renderRoleCards(appState);
      renderStatus(appState);
    }
    showToast(error.message, "error");
  }
}

async function startCharacterCardCreationAssistant() {
  await startAssistantCard(CHARACTER_CARD_CREATION_ASSISTANT_MODE);
}

async function createAssistantCard() {
  const name = (window.prompt("新助手名稱", "新助手") || "").trim();
  if (!name) {
    return;
  }
  try {
    const payload = await request("/api/assistant-cards", {
      method: "POST",
      body: JSON.stringify({
        name,
        description: "自訂助手卡。",
        prompt: appState?.characterCardCreationAssistantPrompt || ""
      })
    });
    appState = payload?.state || appState;
    renderRoleCards(appState);
    renderRoleCardPicker(appState);
    showToast("助手已建立");
    if (payload?.assistantCard) {
      openAssistantPromptDialog(payload.assistantCard);
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function removeAssistantCard(assistantCard) {
  const name = getAssistantCardName(assistantCard);
  const isActive = appState?.activeAssistantMode === assistantCard?.id;
  const ok = window.confirm(
    isActive
      ? `確定要刪除助手「${name}」嗎？目前對話會一併重置。`
      : `確定要刪除助手「${name}」嗎？`
  );
  if (!ok) {
    return;
  }
  try {
    const payload = await request(`/api/assistant-cards/${assistantCard.id}`, { method: "DELETE" });
    appState = payload?.state || appState;
    await refresh();
    showToast("助手已刪除");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function refresh() {
  const state = await request("/api/state", { method: "GET" });
  appState = state;
  pendingRoleCardStartId = "";
  applyWebDisplaySettings(state);

  fillProfile(state);
  renderConversationModelSettings(state);
  renderAllPromptModeSelects(getActivePromptMode(state));
  renderRoleCards(state);
  renderSessionPicker(state);
  renderMessages(state);
  renderAiLogs(state);
  renderStatus(state);
  refreshAssistantSelector();
  applyMobilePage();
  resizeChatInput();
  playDailyWelcomeAudio(state);
}

function scheduleBackgroundImageRefresh(previousImageCount = 0) {
  let attempts = 0;
  const maxAttempts = 8;
  const poll = async () => {
    attempts += 1;
    try {
      await refresh();
      const currentImageCount = (appState?.conversation || []).filter((message) => isImageOnlyMessage(message)).length;
      if (currentImageCount > previousImageCount || attempts >= maxAttempts) {
        return;
      }
    } catch {
      if (attempts >= maxAttempts) {
        return;
      }
    }
    window.setTimeout(poll, 2500);
  };
  window.setTimeout(poll, 1500);
}

function getCompressionProfileStateFromRuntime(compression = {}, profileId = STANDARD_COMPRESSION_PROFILE_ID) {
  const id = normalizeCompressionProfileId(profileId);
  if (id === STANDARD_COMPRESSION_PROFILE_ID) {
    return {
      summary: compression.summary || "",
      compressedThroughTurnNumber: Number(compression.compressedThroughTurnNumber || 0) || 0,
      updatedAt: compression.updatedAt || ""
    };
  }
  const profileState = compression.profiles?.[id] || {};
  return {
    summary: profileState.summary || "",
    compressedThroughTurnNumber: Number(profileState.compressedThroughTurnNumber || 0) || 0,
    updatedAt: profileState.updatedAt || ""
  };
}

function getContextCompressionProfilesForActiveMode() {
  const activeMode = getActivePromptMode(appState);
  return normalizeCompressionProfilesConfig(getModularConfig(activeMode));
}

function renderContextCompressionProfileView(profileId = selectedContextCompressionProfileId) {
  const compression = contextCompressionDialogPayload?.contextCompression || appState?.contextCompression || {};
  const profiles = getContextCompressionProfilesForActiveMode();
  selectedContextCompressionProfileId = profiles.some((profile) => profile.id === profileId)
    ? profileId
    : STANDARD_COMPRESSION_PROFILE_ID;
  if (el.contextCompressionProfileSelect) {
    el.contextCompressionProfileSelect.innerHTML = "";
    profiles.forEach((profile, index) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = `${profile.name || profile.id || `大模型 ${index + 1}`}${profile.enabled === false ? "（未啟用）" : ""}`;
      el.contextCompressionProfileSelect.appendChild(option);
    });
    el.contextCompressionProfileSelect.value = selectedContextCompressionProfileId;
  }
  const profile = profiles.find((item) => item.id === selectedContextCompressionProfileId) || profiles[0];
  const profileState = getCompressionProfileStateFromRuntime(compression, selectedContextCompressionProfileId);
  if (el.contextCompressionMeta) {
    el.contextCompressionMeta.textContent = [
      `大模型: ${profile?.name || selectedContextCompressionProfileId}`,
      profile?.enabled === false ? "狀態: 未啟用" : "狀態: 啟用",
      `已壓縮到第 ${profileState.compressedThroughTurnNumber || 0} 輪`,
      profileState.updatedAt ? `更新時間: ${new Date(profileState.updatedAt).toLocaleString("zh-Hant")}` : ""
    ].filter(Boolean).join("｜");
  }
  if (el.contextCompressionContentView) {
    el.contextCompressionContentView.value = profileState.summary || "";
  }
}

async function openContextCompressionDialog() {
  try {
    const payload = await request("/api/context-compression", { method: "GET" });
    if (payload?.state) {
      appState = payload.state;
    }
    contextCompressionDialogPayload = payload || {};
    selectedContextCompressionProfileId = STANDARD_COMPRESSION_PROFILE_ID;
    renderContextCompressionProfileView(selectedContextCompressionProfileId);
    renderConversationModelSettings(appState || {});
    el.contextCompressionDialog?.showModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveContextCompressionContent() {
  try {
    const payload = await request("/api/context-compression", {
      method: "PUT",
      body: JSON.stringify({
        profileId: selectedContextCompressionProfileId,
        summary: el.contextCompressionContentView?.value || ""
      })
    });
    if (payload?.state) {
      appState = payload.state;
    }
    contextCompressionDialogPayload = payload || {};
    renderContextCompressionProfileView(selectedContextCompressionProfileId);
    renderConversationModelSettings(appState || {});
    showToast("模型內容已保存");
  } catch (error) {
    showToast(error.message, "error");
  }
}

function buildContextCompressionExportPayload() {
  const compression = contextCompressionDialogPayload?.contextCompression || appState?.contextCompression || {};
  const activeMode = getActivePromptMode(appState);
  const promptConfig = getModularConfig(activeMode);
  const profiles = getContextCompressionProfilesForActiveMode();
  const profile = profiles.find((item) => item.id === selectedContextCompressionProfileId) || profiles[0] || {};
  const profileState = getCompressionProfileStateFromRuntime(compression, selectedContextCompressionProfileId);
  return {
    type: "time_tavern_model_content",
    version: 1,
    exportedAt: new Date().toISOString(),
    promptMode: {
      mode: activeMode,
      name: promptConfig.name || getPromptModeDisplayName(activeMode)
    },
    profile: cloneSerializable(profile),
    content: {
      summary: el.contextCompressionContentView?.value || "",
      compressedThroughTurnNumber: profileState.compressedThroughTurnNumber || 0,
      updatedAt: profileState.updatedAt || ""
    }
  };
}

function exportCurrentContextCompressionContent() {
  try {
    const payload = buildContextCompressionExportPayload();
    const fileName = `${sanitizeDownloadFileName([
      "model_content",
      payload.promptMode?.name || payload.promptMode?.mode,
      payload.profile?.name || payload.profile?.id
    ].filter(Boolean).join("_"))}.json`;
    triggerBlobDownload(
      new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" }),
      fileName
    );
    showToast("已匯出模型內容");
  } catch (error) {
    showToast(error.message || "模型內容匯出失敗", "error");
  }
}

function normalizeTimeTrackingWordListForEditor(value = "") {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  return String(value || "")
    .split(/[\n,，、;；|/／]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getTimeTrackingDialogPayload() {
  return {
    enabled: Boolean(el.timeTrackingEnabled?.checked),
    currentDayNumber: Math.max(1, Math.floor(Number(el.timeTrackingDayNumber?.value || 1))),
    currentYear: Math.max(1, Math.floor(Number(el.timeTrackingYear?.value || new Date().getFullYear()))),
    currentMonth: Math.max(1, Math.floor(Number(el.timeTrackingMonth?.value || 1))),
    currentDate: Math.max(1, Math.floor(Number(el.timeTrackingDate?.value || 1))),
    currentPeriod: el.timeTrackingPeriod?.value || "morning",
    autoPeriod: {
      enabled: Boolean(el.timeTrackingAutoPeriodEnabled?.checked),
      roundsPerPeriod: Math.max(1, Math.floor(Number(el.timeTrackingAutoPeriodRounds?.value || 3)))
    },
    config: {
      nextDayWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingNextDayWords?.value || ""),
      connectorWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingConnectorWords?.value || ""),
      noChangeWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingNoChangeWords?.value || ""),
      morningWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingMorningWords?.value || ""),
      noonWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingNoonWords?.value || ""),
      eveningWords: normalizeTimeTrackingWordListForEditor(el.timeTrackingEveningWords?.value || "")
    }
  };
}

function setTextareaWordList(field, words = []) {
  if (!field) {
    return;
  }
  field.value = (Array.isArray(words) ? words : []).join("\n");
}

function renderTimeTrackingDialog(timeTracking = {}) {
  const config = timeTracking.config || {};
  const autoPeriod = timeTracking.autoPeriod || {};
  const period = TIME_PERIOD_LABELS[timeTracking.currentPeriod] ? timeTracking.currentPeriod : "morning";
  if (el.timeTrackingMeta) {
    el.timeTrackingMeta.textContent = [
      `統計時間: ${timeTracking.enabled === false ? "停用" : "啟用"}`,
      `當前天數: 第${Number(timeTracking.currentDayNumber || 1)}天`,
      `當前時間: ${TIME_PERIOD_LABELS[period]} ${Number(timeTracking.currentYear || new Date().getFullYear())}年${Number(timeTracking.currentMonth || 1)}月${Number(timeTracking.currentDate || 1)}日`,
      autoPeriod.enabled ? `自動切換: 每 ${Number(autoPeriod.roundsPerPeriod || 3)} 回合` : "自動切換: 停用",
      timeTracking.updatedAt ? `更新時間: ${new Date(timeTracking.updatedAt).toLocaleString("zh-Hant")}` : ""
    ].filter(Boolean).join("｜");
  }
  if (el.timeTrackingEnabled) {
    el.timeTrackingEnabled.checked = timeTracking.enabled !== false;
  }
  if (el.timeTrackingDayNumber) {
    el.timeTrackingDayNumber.value = Number(timeTracking.currentDayNumber || 1);
  }
  if (el.timeTrackingYear) {
    el.timeTrackingYear.value = Number(timeTracking.currentYear || new Date().getFullYear());
  }
  if (el.timeTrackingMonth) {
    el.timeTrackingMonth.value = Number(timeTracking.currentMonth || 1);
  }
  if (el.timeTrackingDate) {
    el.timeTrackingDate.value = Number(timeTracking.currentDate || 1);
  }
  if (el.timeTrackingPeriod) {
    el.timeTrackingPeriod.value = period;
  }
  if (el.timeTrackingAutoPeriodEnabled) {
    el.timeTrackingAutoPeriodEnabled.checked = autoPeriod.enabled === true;
  }
  if (el.timeTrackingAutoPeriodRounds) {
    el.timeTrackingAutoPeriodRounds.value = Math.max(1, Math.floor(Number(autoPeriod.roundsPerPeriod || 3)));
  }
  setTextareaWordList(el.timeTrackingNextDayWords, config.nextDayWords || []);
  setTextareaWordList(el.timeTrackingConnectorWords, config.connectorWords || []);
  setTextareaWordList(el.timeTrackingNoChangeWords, config.noChangeWords || []);
  setTextareaWordList(el.timeTrackingMorningWords, config.morningWords || []);
  setTextareaWordList(el.timeTrackingNoonWords, config.noonWords || []);
  setTextareaWordList(el.timeTrackingEveningWords, config.eveningWords || []);
}

async function openTimeTrackingDialog() {
  try {
    const payload = await request("/api/time-tracking", { method: "GET" });
    if (payload?.state) {
      appState = payload.state;
    }
    renderTimeTrackingDialog(payload?.timeTracking || appState?.timeTracking || {});
    el.timeTrackingDialog?.showModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveTimeTrackingSettings() {
  try {
    const payload = await request("/api/time-tracking", {
      method: "PUT",
      body: JSON.stringify(getTimeTrackingDialogPayload())
    });
    if (payload?.state) {
      appState = payload.state;
    }
    renderTimeTrackingDialog(payload?.timeTracking || appState?.timeTracking || {});
    showToast("統計判斷已保存");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function openEnvSettingsDialog() {
  try {
    const payload = await request("/api/env", { method: "GET" });
    renderEnvSettingsForm(payload?.content || "");
    if (el.envSettingsHint) {
      el.envSettingsHint.textContent = payload?.restartHint || "保存後會寫入專案根目錄 .env。";
    }
    el.envSettingsDialog.showModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function openAssistantPromptDialog(assistantCardInput = null) {
  try {
    const assistantCard = assistantCardInput || getActiveAssistantCard(appState) || getAssistantCardById(appState, CHARACTER_CARD_CREATION_ASSISTANT_MODE);
    if (el.assistantPromptInput) {
      el.assistantPromptInput.value = assistantCard?.prompt || appState?.characterCardCreationAssistantPrompt || "";
    }
    if (el.assistantCardId) {
      el.assistantCardId.value = assistantCard?.id || CHARACTER_CARD_CREATION_ASSISTANT_MODE;
    }
    if (el.assistantCardName) {
      el.assistantCardName.value = getAssistantCardName(assistantCard);
    }
    if (el.assistantCardDescription) {
      el.assistantCardDescription.value = assistantCard?.description || DEFAULT_ASSISTANT_CARD_DESCRIPTION;
    }
    el.assistantPromptDialog?.showModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveAssistantPrompt() {
  const assistantId = el.assistantCardId?.value || CHARACTER_CARD_CREATION_ASSISTANT_MODE;
  try {
    const payload = await request(`/api/assistant-cards/${assistantId}`, {
      method: "PUT",
      body: JSON.stringify({
        name: el.assistantCardName?.value || DEFAULT_ASSISTANT_CARD_NAME,
        description: el.assistantCardDescription?.value || "",
        prompt: el.assistantPromptInput?.value || ""
      })
    });
    if (payload?.state) {
      appState = payload.state;
    }
    if (payload?.assistantCard) {
      if (el.assistantPromptInput) {
        el.assistantPromptInput.value = payload.assistantCard.prompt || "";
      }
      if (el.assistantCardName) {
        el.assistantCardName.value = payload.assistantCard.name || "";
      }
      if (el.assistantCardDescription) {
        el.assistantCardDescription.value = payload.assistantCard.description || "";
      }
    }
    renderRoleCards(appState);
    renderRoleCardPicker(appState);
    showToast("助手卡已保存");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveModularPromptConfig() {
  const config = collectModularPromptConfig();
  try {
    const payload = await request(`/api/modular-prompts/${config.mode}`, {
      method: "PUT",
      body: JSON.stringify({
        config
      })
    });
    const requestedImageOnlyActions = new Set(
      (config.compressionProfiles || []).flatMap((profile) =>
        (profile.triggerActions || [])
          .filter((action) => action.keywordFollowupAction === KEYWORD_FOLLOWUP_IMAGE_ONLY)
          .map((action) => `${profile.id}:${action.id}`)
      )
    );
    const savedImageOnlyActions = new Set(
      (payload?.config?.compressionProfiles || []).flatMap((profile) =>
        (profile.triggerActions || [])
          .filter((action) => action.keywordFollowupAction === KEYWORD_FOLLOWUP_IMAGE_ONLY)
          .map((action) => `${profile.id}:${action.id}`)
      )
    );
    if ([...requestedImageOnlyActions].some((id) => !savedImageOnlyActions.has(id))) {
      throw new Error("伺服器仍在執行舊版本，無法保存「跑圖不跑正文」。請先重啟伺服器後再保存。");
    }
    appState = payload?.state || appState;
    renderAllPromptModeSelects(config.mode);
    renderModularPromptEditor(config.mode);
    showToast("Prompt 已保存");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveDefaults() {
  if (!window.confirm("要把目前的使用者設定、角色卡、Prompt 與環境顯示等設定儲存成這台裝置的本機預設嗎？AI 呼叫紀錄、Discord Bot Token、對話 API Key 與目前對話不會保存。")) {
    return;
  }
  try {
    if (el.saveDefaultsBtn) {
      el.saveDefaultsBtn.disabled = true;
      el.saveDefaultsBtn.textContent = "儲存中...";
    }
    const payload = await request("/api/defaults/save", { method: "POST" });
    appState = payload?.state || appState;
    const defaults = payload?.defaults || {};
    showToast(`預設已保存：角色卡 ${defaults.roleCardCount || 0} 張，Prompt ${defaults.modularPromptCount || 0} 個，環境設定 ${defaults.environmentCount || 0} 項`);
  } catch (error) {
    showToast(error.message || "預設保存失敗", "error");
  } finally {
    if (el.saveDefaultsBtn) {
      el.saveDefaultsBtn.disabled = false;
      el.saveDefaultsBtn.textContent = "儲存預設";
    }
  }
}

async function applyDefaults() {
  if (!window.confirm("要使用本機預設覆蓋目前使用者設定、角色卡、Prompt 與環境設定嗎？原本環境設定、目前對話與 AI 呼叫紀錄會清空。")) {
    return;
  }
  try {
    if (el.useDefaultsBtn) {
      el.useDefaultsBtn.disabled = true;
      el.useDefaultsBtn.textContent = "套用中...";
    }
    const payload = await request("/api/defaults/apply", { method: "POST" });
    appState = payload?.state || appState;
    await refresh();
    const defaults = payload?.defaults || {};
    showToast(`預設已套用：角色卡 ${defaults.roleCardCount || 0} 張，Prompt ${defaults.modularPromptCount || 0} 個，環境設定 ${defaults.environmentCount || 0} 項`);
  } catch (error) {
    const message = error.status === 404
      ? "使用預設 API 尚未載入，請重啟伺服器後再按一次。"
      : error.message || "預設套用失敗";
    showToast(message, "error");
  } finally {
    if (el.useDefaultsBtn) {
      el.useDefaultsBtn.disabled = false;
      el.useDefaultsBtn.textContent = "使用預設";
    }
  }
}

async function updateDefaults() {
  if (!window.confirm("要取得目前程式版本隨附的作者預設嗎？這只會替換可供「使用預設」套用的內容，不會立即改動目前角色卡、使用者設定、Prompt 或目前對話。")) {
    return;
  }
  try {
    if (el.updateDefaultsBtn) {
      el.updateDefaultsBtn.disabled = true;
      el.updateDefaultsBtn.textContent = "取得中...";
    }
    const payload = await request("/api/defaults/update", { method: "POST" });
    appState = payload?.state || appState;
    const defaults = payload?.defaults || {};
    showToast(`作者預設已取得：角色卡 ${defaults.roleCardCount || 0} 張，Prompt ${defaults.modularPromptCount || 0} 個；目前使用中的資料沒有改動`);
  } catch (error) {
    showToast(error.message || "作者預設取得失敗", "error");
  } finally {
    if (el.updateDefaultsBtn) {
      el.updateDefaultsBtn.disabled = false;
      el.updateDefaultsBtn.textContent = "使用作者預設";
    }
  }
}

function createCustomPromptMode() {
  const configs = appState?.modularPromptConfigs || {};
  let index = Object.keys(configs).length + 1;
  let mode = normalizeRoleCardMode(`custom_mode_${index}`);
  while (configs[mode]) {
    index += 1;
    mode = normalizeRoleCardMode(`custom_mode_${index}`);
  }
  const baseConfig = collectModularPromptConfig();
  appState = {
    ...(appState || {}),
    modularPromptConfigs: {
      ...configs,
      [mode]: {
        ...baseConfig,
        mode,
        name: `新模式 ${index}`
      }
    }
  };
  renderAllPromptModeSelects(mode);
  renderModularPromptEditor(mode);
  showToast("已新增模式，編輯後請保存 Prompt");
}

async function deleteCurrentPromptMode() {
  const mode = normalizeRoleCardMode(el.modularPromptModeSelect?.value || "");
  if (BUILTIN_PROMPT_MODES.includes(mode)) {
    showToast("內建模式不可刪除", "error");
    return;
  }
  if (!mode) {
    return;
  }
  if (!window.confirm(`確定要刪除模式「${getPromptModeDisplayName(mode)}」嗎？`)) {
    return;
  }

  try {
    const payload = await request(`/api/modular-prompts/${mode}`, { method: "DELETE" });
    appState = payload?.state || appState;
    renderAllPromptModeSelects("single");
    renderModularPromptEditor("single");
    showToast("模式已刪除");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function previewModularPromptConfig() {
  const config = collectModularPromptConfig();
  try {
    const payload = await request(`/api/modular-prompts/${config.mode}/preview`, {
      method: "POST",
      body: JSON.stringify({
        config
      })
    });
    if (el.modularPreviewReasonerSystem) {
      el.modularPreviewReasonerSystem.value = payload.reasonerHistorySystemPrompt || "";
    }
    if (el.modularPreviewCompressionPrompt) {
      el.modularPreviewCompressionPrompt.value = payload.contextCompressionPrompt || "";
    }
    showToast("Prompt 預覽已更新");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function removeRoleCard(card) {
  const isActive = appState?.activeRoleCardId === card.id;
  const cardDisplayName = card.name || "未命名角色卡";
  const ok = window.confirm(
    isActive
      ? `確定要刪除角色卡「${cardDisplayName}」嗎？目前對話會一併重置。`
      : `確定要刪除角色卡「${cardDisplayName}」嗎？`
  );
  if (!ok) {
    return;
  }

  try {
    await request(`/api/role-cards/${card.id}`, {
      method: "DELETE"
    });
    await refresh();
    showToast("角色卡已刪除");
  } catch (error) {
    showToast(error.message, "error");
  }
}

function bindEvents() {
  if (el.mobilePageChatBtn) {
    el.mobilePageChatBtn.addEventListener("click", () => setMobilePage("chat"));
  }

  if (el.mobilePageControlsBtn) {
    el.mobilePageControlsBtn.addEventListener("click", () => setMobilePage("controls"));
  }

  if (el.mobileInfoToggleBtn) {
    el.mobileInfoToggleBtn.addEventListener("click", () => {
      mobileInfoOpen = !mobileInfoOpen;
      applyMobilePage();
    });
  }

  const layoutMedia = window.matchMedia(MOBILE_LAYOUT_QUERY);
  const handleLayoutChange = () => {
    applyMobilePage();
    if (appState) {
      renderMessages(appState);
      renderStatus(appState);
    }
    realignMobileChat({ scroll: isMobileLayout() && mobilePage === "chat" });
  };
  if (typeof layoutMedia.addEventListener === "function") {
    layoutMedia.addEventListener("change", handleLayoutChange);
  } else if (typeof layoutMedia.addListener === "function") {
    layoutMedia.addListener(handleLayoutChange);
  }

  window.addEventListener("resize", () => realignMobileChat());
  window.addEventListener("orientationchange", () => {
    window.setTimeout(() => realignMobileChat({ scroll: isMobileLayout() && mobilePage === "chat" }), 80);
  });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => realignMobileChat());
    window.visualViewport.addEventListener("scroll", () => realignMobileChat());
  }

  if (el.chatInput) {
    el.chatInput.addEventListener("focus", () => {
      if (isMobileLayout()) {
        setMobilePage("chat");
      }
      resizeChatInput();
      realignMobileChat({ scroll: true });
      window.setTimeout(() => realignMobileChat({ scroll: true }), 260);
    });
    el.chatInput.addEventListener("blur", () => {
      window.setTimeout(() => realignMobileChat(), 120);
    });
    el.chatInput.addEventListener("input", () => {
      resizeChatInput();
      if (el.chatInput.value.startsWith("/")) {
        chatCommandMenuShowAll = false;
        selectedChatCommandIndex = 0;
        openChatCommandMenu();
      } else if (chatCommandMenuOpen) {
        closeChatCommandMenu();
      }
      realignMobileChat({ scroll: true });
    });
    el.chatInput.addEventListener("keydown", (event) => {
      if (!chatCommandMenuOpen) {
        return;
      }
      const items = getVisibleChatCommandItems();
      if (event.key === "Escape") {
        event.preventDefault();
        closeChatCommandMenu();
        return;
      }
      if (event.key === "ArrowDown" && items.length > 0) {
        event.preventDefault();
        selectedChatCommandIndex = (selectedChatCommandIndex + 1) % items.length;
        renderChatCommandMenu();
        return;
      }
      if (event.key === "ArrowUp" && items.length > 0) {
        event.preventDefault();
        selectedChatCommandIndex = (selectedChatCommandIndex - 1 + items.length) % items.length;
        renderChatCommandMenu();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey && items[selectedChatCommandIndex]) {
        event.preventDefault();
        void runChatCommandMenuItem(items[selectedChatCommandIndex]);
      }
    });
  }

  if (el.chatPlusButton) {
    el.chatPlusButton.addEventListener("click", () => {
      selectedChatCommandIndex = 0;
      if (activeChatCommandForm) {
        clearActiveChatCommandForm({ keepMenu: true });
        openChatCommandMenu({ showAll: true });
        el.chatInput?.focus();
        return;
      }
      if (chatCommandMenuOpen && chatCommandMenuShowAll) {
        closeChatCommandMenu();
      } else {
        openChatCommandMenu({ showAll: true });
      }
      if (chatCommandMenuOpen) {
        el.chatInput?.focus();
      }
    });
  }

  document.addEventListener("click", (event) => {
    if (!chatCommandMenuOpen) {
      return;
    }
    if (el.chatForm?.contains(event.target)) {
      return;
    }
    closeChatCommandMenu();
  });

  el.profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await request("/api/user-profile", {
        method: "PUT",
        body: JSON.stringify({
          displayName: el.displayName.value,
          identityText: el.identityText.value
        })
      });
      await refresh();
      showToast("已保存使用者設定");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  if (el.editModularPromptsBtn) {
    el.editModularPromptsBtn.addEventListener("click", () => {
      openModularPromptDialog();
    });
  }

  if (el.selectRoleCardBtn) {
    el.selectRoleCardBtn.addEventListener("click", openRoleCardPicker);
  }

  if (el.closeRoleCardPickerBtn) {
    el.closeRoleCardPickerBtn.addEventListener("click", () => el.roleCardPickerDialog.close());
  }

  if (el.roleCardPickerPrevBtn) {
    el.roleCardPickerPrevBtn.addEventListener("click", () => {
      roleCardPickerPage -= 1;
      renderRoleCardPicker(appState);
    });
  }

  if (el.roleCardPickerNextBtn) {
    el.roleCardPickerNextBtn.addEventListener("click", () => {
      roleCardPickerPage += 1;
      renderRoleCardPicker(appState);
    });
  }

  if (el.saveSessionBtn) {
    el.saveSessionBtn.addEventListener("click", saveSession);
  }
  if (el.selectSessionBtn) {
    el.selectSessionBtn.addEventListener("click", openSessionPicker);
  }
  if (el.saveSessionFromDialogBtn) {
    el.saveSessionFromDialogBtn.addEventListener("click", saveSession);
  }
  if (el.loadSessionPreviewBtn) {
    el.loadSessionPreviewBtn.addEventListener("click", () => {
      if (selectedSessionPreview) {
        void loadSession(selectedSessionPreview);
      }
    });
  }
  if (el.deleteSessionPreviewBtn) {
    el.deleteSessionPreviewBtn.addEventListener("click", () => {
      if (selectedSessionPreview) {
        void deleteSession(selectedSessionPreview);
      }
    });
  }
  if (el.closeSessionPickerBtn) {
    el.closeSessionPickerBtn.addEventListener("click", () => el.sessionPickerDialog?.close());
  }
  if (el.sessionPickerPrevBtn) {
    el.sessionPickerPrevBtn.addEventListener("click", () => {
      sessionPickerPage -= 1;
      renderSessionPicker(appState);
    });
  }
  if (el.sessionPickerNextBtn) {
    el.sessionPickerNextBtn.addEventListener("click", () => {
      sessionPickerPage += 1;
      renderSessionPicker(appState);
    });
  }

  el.createRoleCardBtn.addEventListener("click", () => openRoleCardDialog(null));
  if (el.createAssistantCardBtn) {
    el.createAssistantCardBtn.addEventListener("click", createAssistantCard);
  }
  if (el.importRoleCardBtn && el.roleCardImportFile) {
    el.importRoleCardBtn.addEventListener("click", () => el.roleCardImportFile.click());
    el.roleCardImportFile.addEventListener("change", async () => {
      await importRoleCardFromFile(el.roleCardImportFile.files?.[0]);
    });
  }
  if (el.roleCardCoverImageFile) {
    el.roleCardCoverImageFile.addEventListener("change", async () => {
      const file = el.roleCardCoverImageFile.files?.[0];
      if (!file) {
        return;
      }
      try {
        roleCardCoverImageReadTask = readImageFileAsDataUrl(file);
        const dataUrl = await roleCardCoverImageReadTask;
        roleCardCoverImageReadTask = null;
        await openCoverCropDialog(dataUrl);
      } catch (error) {
        roleCardCoverImageReadTask = null;
        showToast(error.message, "error");
        el.roleCardCoverImageFile.value = "";
      }
    });
  }

  if (el.editRoleCardCoverCropBtn) {
    el.editRoleCardCoverCropBtn.addEventListener("click", async () => {
      const currentCover = el.roleCardCoverImage.value.trim();
      if (!currentCover) {
        el.roleCardCoverImageFile.click();
        return;
      }
      try {
        await openCoverCropDialog(currentCover);
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  if (el.removeRoleCardCoverBtn) {
    el.removeRoleCardCoverBtn.addEventListener("click", () => {
      roleCardCoverImageReadTask = null;
      el.roleCardCoverImageFile.value = "";
      setRoleCardCoverPreview("");
    });
  }

  if (el.coverCropBox) {
    el.coverCropBox.addEventListener("pointerdown", onCoverCropPointerDown);
    el.coverCropBox.addEventListener("pointermove", onCoverCropPointerMove);
    el.coverCropBox.addEventListener("pointerup", onCoverCropPointerUp);
    el.coverCropBox.addEventListener("pointercancel", onCoverCropPointerUp);
  }

  if (el.confirmCoverCropBtn) {
    el.confirmCoverCropBtn.addEventListener("click", () => {
      try {
        const dataUrl = getCoverCropResultDataUrl();
        if (coverCropConfirmHandler) {
          coverCropConfirmHandler(dataUrl);
        } else {
          setRoleCardCoverPreview(dataUrl);
        }
        el.coverCropDialog.close();
        resetCoverCropDialogState();
      } catch (error) {
        showToast(error.message || "封面裁切失敗", "error");
      }
    });
  }

  if (el.cancelCoverCropBtn) {
    el.cancelCoverCropBtn.addEventListener("click", () => {
      resetCoverCropDialogState();
      el.coverCropDialog.close();
    });
  }

  if (el.changeCoverCropImageBtn) {
    el.changeCoverCropImageBtn.addEventListener("click", () => {
      const changeImageHandler = coverCropChangeImageHandler;
      resetCoverCropDialogState();
      el.coverCropDialog.close();
      if (changeImageHandler) {
        changeImageHandler();
      } else {
        el.roleCardCoverImageFile.value = "";
        el.roleCardCoverImageFile.click();
      }
    });
  }

  if (el.addRoleCardCustomSectionBtn) {
    el.addRoleCardCustomSectionBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true });
      roleCardCustomSectionsDraft.push(normalizeRoleCardCustomSection({}));
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });
  }

  if (el.addRoleCardOpeningBtn) {
    el.addRoleCardOpeningBtn.addEventListener("click", () => {
      syncSelectedRoleCardOpeningFromEditor();
      const index = roleCardOpeningDialoguesDraft.length;
      const entry = normalizeRoleCardOpeningDialogueEntry({ name: `開場 ${index + 1}`, content: "" }, index);
      roleCardOpeningDialoguesDraft.push(entry);
      renderRoleCardOpeningTabs(entry.id);
    });
  }

  if (el.roleCardOpening) {
    el.roleCardOpening.addEventListener("input", syncSelectedRoleCardOpeningFromEditor);
  }

  el.roleCardForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      const coverReady = await ensureRoleCardCoverReady();
      if (!coverReady) {
        showToast("請先在裁切視窗按「確定」後再保存角色卡。", "error");
        return;
      }
    } catch (error) {
      roleCardCoverImageReadTask = null;
      showToast(error.message, "error");
      return;
    }

    const openingDialogues = collectRoleCardOpeningDialoguesFromEditor();
    const activeOpening = openingDialogues.find((entry) => entry.id === selectedRoleCardOpeningId) || openingDialogues[0] || null;
    const payload = {
      mode: normalizeRoleCardMode(el.roleCardMode.value),
      name: el.roleCardName.value.trim(),
      coverImage: el.roleCardCoverImage.value.trim(),
      coverPosition: "center center",
      customSections: collectRoleCardCustomSectionsFromEditor(),
      openingDialogue: (activeOpening?.content || getSelectedRoleCardOpeningDialogue(openingDialogues)).trim(),
      openingDialogues,
      activeOpeningDialogueId: activeOpening?.id || selectedRoleCardOpeningId,
      lorebooks: collectRoleCardLorebooksFromEditor()
    };
    const corruptedFields = Object.entries({
      名字: payload.name,
      自定義內容: JSON.stringify(payload.customSections),
      開場對話: payload.openingDialogue,
      開場對話分頁: JSON.stringify(payload.openingDialogues),
      世界書: JSON.stringify(payload.lorebooks)
    })
      .filter(([, value]) => containsReplacementCharacter(value))
      .map(([label]) => label);

    if (corruptedFields.length > 0) {
      showToast(`偵測到疑似已損壞文字：${corruptedFields.join("、")}，請重新貼上原文後再保存。`, "error");
      return;
    }

    try {
      if (el.roleCardId.value) {
        await request(`/api/role-cards/${el.roleCardId.value}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
      } else {
        await request("/api/role-cards", {
          method: "POST",
          body: JSON.stringify(payload)
        });
      }

      el.roleCardDialog.close();
      await refresh();
      showToast("角色卡已保存");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  el.cancelRoleCardDialog.addEventListener("click", () => el.roleCardDialog.close());

  if (el.addRoleCardLorebookBtn) {
    el.addRoleCardLorebookBtn.addEventListener("click", () => {
      roleCardLorebooksDraft = collectRoleCardLorebookDraftsFromEditor();
      roleCardLorebooksDraft.push(normalizeRoleCardLorebookEntry({}));
      renderRoleCardLorebookEditor(roleCardLorebooksDraft);
    });
  }

  el.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (activeChatCommandForm) {
      try {
        await submitActiveChatCommandForm();
      } catch (error) {
        showToast(error.message, "error");
      }
      return;
    }
    const content = el.chatInput.value.trim();
    if (!content) {
      showToast("請先輸入內容", "error");
      return;
    }
    closeChatCommandMenu();

    if (await handleChatSlashCommand(content)) {
      resizeChatInput();
      realignMobileChat({ scroll: true });
      return;
    }

    try {
      isChatStreaming = true;
      renderStatus(appState);
      const streamingAssistantMessage = appendOptimisticChatTurn(content);
      el.chatInput.value = "";
      resizeChatInput();
      realignMobileChat({ scroll: true });
      await requestChatStream(content, {
        onEvent: (streamEvent) => {
          if (streamEvent.type === "done" && streamEvent.state) {
            const previousImageCount = (appState?.conversation || []).filter((message) => isImageOnlyMessage(message)).length;
            appState = streamEvent.state;
            renderMessages(appState);
            renderAiLogs(appState);
            renderStatus(appState);
            refreshAssistantSelector();
            realignMobileChat({ scroll: true });
            if (streamEvent.backgroundImageGeneration) {
              scheduleBackgroundImageRefresh(previousImageCount);
            }
            return;
          }
          applyChatStreamEventToMessage(streamEvent, streamingAssistantMessage);
        }
      });
      await refresh();
      showToast("已送出");
    } catch (error) {
      showToast(error.message, "error");
      if (appState) {
        renderStatus(appState);
      }
    } finally {
      isChatStreaming = false;
      resizeChatInput();
      if (appState) {
        renderStatus(appState);
      }
    }
  });

  if (el.discordBotLinkBtn) {
    el.discordBotLinkBtn.addEventListener("click", () => {
      const discordAuthorizeUrl = appState?.discord?.authorizeUrl || el.discordBotLinkBtn.dataset.discordAuthorizeUrl || "";
      if (!discordAuthorizeUrl) {
        showToast("尚未取得 Discord bot 授權連結，請在環境設定加入 DISCORD_CLIENT_ID 或有效 DISCORD_BOT_TOKEN。", "error");
        return;
      }
      window.open(discordAuthorizeUrl, "_blank", "noopener,noreferrer");
      showToast("新增 Bot 後，可以在 Discord 使用 Slash 指令");
    });
  }

  if (el.stopChatBtn) {
    el.stopChatBtn.addEventListener("click", async () => {
      try {
        const payload = await request("/api/chat/stop", { method: "POST" });
        showToast(payload?.message || "已送出停止要求");
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  el.editAiOutputBtn.addEventListener("click", () => {
    refreshAssistantSelector();
    el.editAiDialog.showModal();
  });

  el.assistantMessageSelect.addEventListener("change", onAssistantMessagePick);

  el.editAiForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const messageId = el.assistantMessageSelect.value;
    const content = el.assistantMessageContent.value.trim();

    if (!messageId || !content) {
      showToast("請先選擇訊息並填入內容", "error");
      return;
    }

    try {
      await request(`/api/messages/${messageId}`, {
        method: "PUT",
        body: JSON.stringify({ content })
      });
      el.editAiDialog.close();
      await refresh();
      showToast("AI 輸出已更新");
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  el.cancelEditAiDialog.addEventListener("click", () => el.editAiDialog.close());

  if (el.editMessageForm) {
    el.editMessageForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await submitEditUserMessage();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  if (el.cancelEditMessageDialog) {
    el.cancelEditMessageDialog.addEventListener("click", () => {
      editingUserMessageId = "";
      el.editMessageDialog?.close();
    });
  }

  if (el.contextCompressionInspectBtn) {
    el.contextCompressionInspectBtn.addEventListener("click", async () => {
      await openContextCompressionDialog();
    });
  }

  if (el.timeTrackingSettingsBtn) {
    el.timeTrackingSettingsBtn.addEventListener("click", async () => {
      await openTimeTrackingDialog();
    });
  }

  if (el.novelAiImageBtn) {
    el.novelAiImageBtn.addEventListener("click", () => {
      openNovelAiDialog();
    });
  }

  if (el.novelAiStoryboardBtn) {
    el.novelAiStoryboardBtn.addEventListener("click", () => {
      window.location.href = "/NAI_storyboard";
    });
  }

  if (el.contextCompressionProfileSelect) {
    el.contextCompressionProfileSelect.addEventListener("change", () => {
      renderContextCompressionProfileView(el.contextCompressionProfileSelect.value);
    });
  }

  if (el.envSettingsBtn) {
    el.envSettingsBtn.addEventListener("click", async () => {
      await openEnvSettingsDialog();
    });
  }

  if (el.saveDefaultsBtn) {
    el.saveDefaultsBtn.addEventListener("click", saveDefaults);
  }

  if (el.useDefaultsBtn) {
    el.useDefaultsBtn.addEventListener("click", applyDefaults);
  }

  if (el.updateDefaultsBtn) {
    el.updateDefaultsBtn.addEventListener("click", updateDefaults);
  }

  if (el.addEnvExtraBtn) {
    el.addEnvExtraBtn.addEventListener("click", () => {
      el.envSettingsExtraList?.appendChild(createEnvExtraRow());
    });
  }

  if (el.closeContextCompressionDialog) {
    el.closeContextCompressionDialog.addEventListener("click", () => el.contextCompressionDialog.close());
  }

  if (el.exportContextCompressionDialog) {
    el.exportContextCompressionDialog.addEventListener("click", exportCurrentContextCompressionContent);
  }

  if (el.closeTimeTrackingDialog) {
    el.closeTimeTrackingDialog.addEventListener("click", () => el.timeTrackingDialog.close());
  }

  if (el.cancelEnvSettingsDialog) {
    el.cancelEnvSettingsDialog.addEventListener("click", () => el.envSettingsDialog.close());
  }

  if (el.restartServerBtn) {
    el.restartServerBtn.addEventListener("click", async () => {
      const ok = window.confirm("確定要重啟伺服器嗎？目前網頁會短暫斷線，幾秒後請刷新頁面。");
      if (!ok) {
        return;
      }
      try {
        el.restartServerBtn.disabled = true;
        const payload = await request("/api/restart", { method: "POST" });
        showToast(payload?.message || "正在重啟伺服器，請稍候刷新頁面。");
      } catch (error) {
        el.restartServerBtn.disabled = false;
        showToast(error.message, "error");
      }
    });
  }

  if (el.envSettingsForm) {
    el.envSettingsForm.addEventListener("click", async (event) => {
      if (event.target?.id !== "testChatApiConnectionBtn") {
        return;
      }
      event.preventDefault();
      await testChatApiConnection();
    });
    el.envSettingsForm.addEventListener("input", (event) => {
      if (isChatApiEnvField(event.target?.dataset?.envKey || "")) {
        setChatApiTestStatus("", "設定已變更，尚未重新測試");
      }
    });
    el.envSettingsForm.addEventListener("change", (event) => {
      if (isChatApiEnvField(event.target?.dataset?.envKey || "")) {
        setChatApiTestStatus("", "設定已變更，尚未重新測試");
      }
    });
    el.envSettingsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const payload = await request("/api/env", {
          method: "PUT",
          body: JSON.stringify({ content: buildEnvContentFromForm() })
        });
        if (el.envSettingsHint) {
          el.envSettingsHint.textContent = payload?.restartHint || "已保存 .env。";
        }
        if (payload?.state) {
          appState = payload.state;
        }
        renderEnvSettingsForm(payload?.content || buildEnvContentFromForm());
        const imageSync = payload?.promptImageActions;
        const imageSyncText = imageSync?.matchedCount > 0
          ? `，Prompt 跑圖已${imageSync.enabled ? "啟用" : "停用"} ${imageSync.matchedCount} 組`
          : "";
        showToast(`環境設定已保存${imageSyncText}`);
      } catch (error) {
        showToast(error.message, "error");
      }
    });
  }

  if (el.contextCompressionForm) {
    el.contextCompressionForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveContextCompressionContent();
    });
  }

  if (el.timeTrackingForm) {
    el.timeTrackingForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveTimeTrackingSettings();
    });
  }

  if (el.assistantPromptForm) {
    el.assistantPromptForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveAssistantPrompt();
    });
  }

  if (el.cancelAssistantPromptDialog) {
    el.cancelAssistantPromptDialog.addEventListener("click", () => el.assistantPromptDialog.close());
  }

  if (el.modularPromptModeSelect) {
    el.modularPromptModeSelect.addEventListener("change", () => {
      scheduleModularPromptEditorRender(el.modularPromptModeSelect.value);
    });
  }

  if (el.modularPromptModeName) {
    el.modularPromptModeName.addEventListener("input", () => {
      clearModularPromptPreview();
    });
  }

  if (el.modularPromptDialogueContextRounds) {
    el.modularPromptDialogueContextRounds.addEventListener("input", clearModularPromptPreview);
  }

  if (el.addModularPromptModeBtn) {
    el.addModularPromptModeBtn.addEventListener("click", createCustomPromptMode);
  }

  if (el.deleteModularPromptModeBtn) {
    el.deleteModularPromptModeBtn.addEventListener("click", async () => {
      await deleteCurrentPromptMode();
    });
  }

  if (el.exportModularPromptModeBtn) {
    el.exportModularPromptModeBtn.addEventListener("click", exportCurrentModularPromptMode);
  }

  if (el.importModularPromptModeBtn && el.modularPromptImportFile) {
    el.importModularPromptModeBtn.addEventListener("click", () => el.modularPromptImportFile.click());
    el.modularPromptImportFile.addEventListener("change", async () => {
      await importModularPromptModeFromFile(el.modularPromptImportFile.files?.[0]);
    });
  }

  if (el.compressionProfileSelect) {
    el.compressionProfileSelect.addEventListener("change", () => {
      syncSelectedCompressionProfileFromEditor();
      renderCompressionProfileEditor(el.compressionProfileSelect.value);
    });
  }

  if (el.editCompressionProfileBtn) {
    el.editCompressionProfileBtn.addEventListener("click", () => {
      renderCompressionProfileEditor(el.compressionProfileSelect?.value || selectedCompressionProfileId);
    });
  }

  if (el.addCompressionProfileBtn) {
    el.addCompressionProfileBtn.addEventListener("click", createCompressionProfile);
  }

  if (el.deleteCompressionProfileBtn) {
    el.deleteCompressionProfileBtn.addEventListener("click", deleteSelectedCompressionProfile);
  }

  if (el.exportCompressionProfileBtn) {
    el.exportCompressionProfileBtn.addEventListener("click", exportSelectedCompressionProfile);
  }

  if (el.importCompressionProfileBtn && el.compressionProfileImportFile) {
    el.importCompressionProfileBtn.addEventListener("click", () => el.compressionProfileImportFile.click());
    el.compressionProfileImportFile.addEventListener("change", async () => {
      await importCompressionProfileFromFile(el.compressionProfileImportFile.files?.[0]);
    });
  }

  if (el.addCompressionTriggerActionBtn) {
    el.addCompressionTriggerActionBtn.addEventListener("click", () => {
      const current = collectCompressionTriggerActionsFromEditor({ keepExpanded: true });
      current.push(normalizeCompressionTriggerActionConfig({
        id: `trigger_action_${Date.now()}`,
        name: `觸發組合 ${current.length + 1}`,
        enabled: true,
        action: MODEL_TRIGGER_ACTION_CALL_API,
        keywordFollowupAction: KEYWORD_FOLLOWUP_CONTINUE_REASONER,
        skipReasoner: false,
        triggers: { everyTurn: false, roundLimit: false, keywords: [], keywordSource: "both", turns: [] },
        expanded: true
      }, current.length));
      renderCompressionTriggerActionEditor(current);
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });
  }

  if (el.addCompressionAppendTermBtn) {
    el.addCompressionAppendTermBtn.addEventListener("click", () => {
      const current = collectCompressionAppendTermsFromEditor({ keepExpanded: true });
      current.push(normalizeModelAppendTermConfig({
        id: `append_term_${Date.now()}`,
        enabled: true,
        player: "",
        content: "",
        expanded: true
      }, current.length));
      renderCompressionAppendTermEditor(current);
      syncSelectedCompressionProfileFromEditor();
      clearModularPromptPreview();
    });
  }

  [
    el.compressionProfileName,
    el.compressionProfileEnabled,
    el.compressionProfileContextScope
  ].forEach((field) => {
    if (field) {
      field.addEventListener("input", () => {
        syncSelectedCompressionProfileFromEditor();
        renderCompressionProfileOptions(selectedCompressionProfileId);
        clearModularPromptPreview();
      });
      field.addEventListener("change", () => {
        syncSelectedCompressionProfileFromEditor();
        renderCompressionProfileOptions(selectedCompressionProfileId);
        clearModularPromptPreview();
      });
    }
  });

  [
    el.modularCompressionMainRules,
    el.modularReasonerMainRules,
    el.modularReasonerContextRules
  ].forEach((field) => {
    if (field) {
      field.addEventListener("input", clearModularPromptPreview);
    }
  });

  if (el.addCompressionModelBtn) {
    el.addCompressionModelBtn.addEventListener("click", () => {
      compressionModelsDraft = collectCompressionModelsFromEditor({ keepEmpty: true });
      compressionModelsDraft.push(normalizeCompressionModelConfig({
        id: `CustomModel${Date.now()}`,
        name: "新模塊",
        addRules: "",
        deleteRules: ""
      }, compressionModelsDraft.length));
      renderCompressionModelEditor(compressionModelsDraft);
      clearModularPromptPreview();
    });
  }

  if (el.previewModularPromptBtn) {
    el.previewModularPromptBtn.addEventListener("click", async () => {
      await previewModularPromptConfig();
    });
  }

  if (el.modularPromptForm) {
    el.modularPromptForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      await saveModularPromptConfig();
    });
  }

  if (el.cancelModularPromptDialog) {
    el.cancelModularPromptDialog.addEventListener("click", () => el.modularPromptDialog.close());
  }

  if (el.modularPromptDialog) {
    el.modularPromptDialog.addEventListener("close", unlockModularPromptPageScroll);
    el.modularPromptDialog.addEventListener("cancel", unlockModularPromptPageScroll);
  }

  [
    el.roleCardDialog,
    el.editAiDialog,
    el.contextCompressionDialog,
    el.timeTrackingDialog,
    el.envSettingsDialog,
    el.assistantPromptDialog,
    el.modularPromptDialog
  ].forEach((dialog) => bindDialogBackdropClose(dialog, { confirmOnClose: true }));

  bindDialogBackdropClose(el.coverCropDialog, {
    confirmOnClose: true,
    onBeforeClose: resetCoverCropDialogState
  });
  bindDialogBackdropClose(el.editMessageDialog, {
    confirmOnClose: true,
    onBeforeClose: () => {
      editingUserMessageId = "";
    }
  });
  bindDialogBackdropClose(el.roleCardPickerDialog);
  bindDialogBackdropClose(el.sessionPickerDialog);

}

async function boot() {
  initUiLanguageToggle();
  bindEvents();
  updateMobileViewportMetrics();
  try {
    await refresh();
  } catch (error) {
    showToast(`初始化失敗：${error.message}`, "error");
  }
}

boot();
