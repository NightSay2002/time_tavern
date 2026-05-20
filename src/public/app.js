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
  importRoleCardBtn: document.getElementById("importRoleCardBtn"),
  roleCardImportFile: document.getElementById("roleCardImportFile"),
  roleCardList: document.getElementById("roleCardList"),
  selectSessionBtn: document.getElementById("selectSessionBtn"),
  saveSessionBtn: document.getElementById("saveSessionBtn"),
  sessionList: document.getElementById("sessionList"),

  editAiOutputBtn: document.getElementById("editAiOutputBtn"),
  contextCompressionInspectBtn: document.getElementById("contextCompressionInspectBtn"),
  timeTrackingSettingsBtn: document.getElementById("timeTrackingSettingsBtn"),
  envSettingsBtn: document.getElementById("envSettingsBtn"),
  mobilePageChatBtn: document.getElementById("mobilePageChatBtn"),
  mobilePageControlsBtn: document.getElementById("mobilePageControlsBtn"),

  messages: document.getElementById("messages"),
  aiLogs: document.getElementById("aiLogs"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),
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
  sessionPickerPrevBtn: document.getElementById("sessionPickerPrevBtn"),
  sessionPickerNextBtn: document.getElementById("sessionPickerNextBtn"),
  sessionPickerPageInfo: document.getElementById("sessionPickerPageInfo"),
  closeSessionPickerBtn: document.getElementById("closeSessionPickerBtn"),

  editAiDialog: document.getElementById("editAiDialog"),
  editAiForm: document.getElementById("editAiForm"),
  assistantMessageSelect: document.getElementById("assistantMessageSelect"),
  assistantMessageContent: document.getElementById("assistantMessageContent"),
  cancelEditAiDialog: document.getElementById("cancelEditAiDialog"),

  contextCompressionDialog: document.getElementById("contextCompressionDialog"),
  contextCompressionForm: document.getElementById("contextCompressionForm"),
  contextCompressionMeta: document.getElementById("contextCompressionMeta"),
  contextCompressionProfileSelect: document.getElementById("contextCompressionProfileSelect"),
  contextCompressionContentView: document.getElementById("contextCompressionContentView"),
  saveContextCompressionDialog: document.getElementById("saveContextCompressionDialog"),
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
  assistantPromptInput: document.getElementById("assistantPromptInput"),
  cancelAssistantPromptDialog: document.getElementById("cancelAssistantPromptDialog"),

  modularPromptDialog: document.getElementById("modularPromptDialog"),
  modularPromptForm: document.getElementById("modularPromptForm"),
  modularPromptModeSelect: document.getElementById("modularPromptModeSelect"),
  modularPromptModeName: document.getElementById("modularPromptModeName"),
  modularPromptDialogueContextRounds: document.getElementById("modularPromptDialogueContextRounds"),
  addModularPromptModeBtn: document.getElementById("addModularPromptModeBtn"),
  deleteModularPromptModeBtn: document.getElementById("deleteModularPromptModeBtn"),
  compressionProfileSelect: document.getElementById("compressionProfileSelect"),
  editCompressionProfileBtn: document.getElementById("editCompressionProfileBtn"),
  addCompressionProfileBtn: document.getElementById("addCompressionProfileBtn"),
  deleteCompressionProfileBtn: document.getElementById("deleteCompressionProfileBtn"),
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
let roleCardCoverImageReadTask = null;
let coverCropState = null;
let envExtraEntries = [];
const MOBILE_LAYOUT_QUERY = "(max-width: 980px)";
const CHARACTER_CARD_CREATION_ASSISTANT_MODE = "CharacterCardCreationAssistant";
const ROLE_CARD_PICKER_PAGE_SIZE = 9;
const SESSION_PICKER_PAGE_SIZE = 9;
const BUILTIN_PROMPT_MODES = ["single", "multi", "no_role"];
const DEFAULT_ROLE_CARD_MODE = "multi";
const STANDARD_COMPRESSION_PROFILE_ID = "standard";
const MODEL_TRIGGER_ACTION_CALL_API = "call_api";
const MODEL_TRIGGER_ACTION_COPY_USER_INPUT = "copy_user_input";
const COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY = "text_only";
const COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT = "role_and_text";
const KEYWORD_FOLLOWUP_CONTINUE_REASONER = "continue_reasoner";
const KEYWORD_FOLLOWUP_STOP_AFTER_MODEL = "stop_after_model";
const MODEL_APPEND_PLAYER_OTHER = "userx";
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
        key: "COMMAND_PREFIX",
        label: "文字指令前綴",
        type: "text",
        placeholder: "!ai",
        help: "例如：!ai 你好"
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
        placeholder: "deepseek-reasoner / gpt-4.1 / gemini-2.5-flash",
        help: "主聊天、大模型處理、補寫與角色卡助手都會使用此模型。"
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
        help: "選填。留空時一般對話使用 0.5，角色卡建立助手使用 0.9。"
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
  CHAT_API_TEMPERATURE: ["CONVERSATION_API_TEMPERATURE"]
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

function isMultiRoleCard(card) {
  return normalizeRoleCardMode(card?.mode) === "multi";
}

function isNoRoleCard(card) {
  return normalizeRoleCardMode(card?.mode) === "no_role";
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
    enabled: source.enabled !== false
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
  if (Array.isArray(value)) {
    return [...new Set(value
      .map((item) => String(item || "").trim())
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
  return {
    id: String(source.id || source.key || `trigger_action_${index + 1}`).trim(),
    name: String(source.name || source.title || source.label || `觸發組合 ${index + 1}`).trim(),
    enabled: source.enabled !== false,
    action: processingAction,
    keywordFollowupAction,
    skipReasoner: processingAction === MODEL_TRIGGER_ACTION_CALL_API &&
      keywordFollowupAction === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL,
    triggers: normalizeCompressionTriggerConfig(
      source.triggers || source.trigger || source.conditions || source.condition || source,
      { defaultRoundLimit: Boolean(options.defaultRoundLimit) }
    ),
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
    contextCompression: normalizeContextCompressionConfig(contextCompression, appState?.contextCompressionPrompt || "")
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
      { allowEmptyModels: !isStandard, allowEmptyMainRules: !isStandard }
    )
  };
}

function normalizeCompressionProfilesConfig(config = {}) {
  const standardContextCompression = normalizeContextCompressionConfig(
    config.contextCompression || { mainRules: config.contextCompressionPrompt },
    config.contextCompressionPrompt || appState?.contextCompressionPrompt || ""
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

function isCharacterCardCreationAssistantActive(state) {
  return state?.activeAssistantMode === CHARACTER_CARD_CREATION_ASSISTANT_MODE;
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
    throw new Error(data?.error || `請求失敗(${response.status})`);
  }

  return data;
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

function renderMarkdownToHtml(markdown = "") {
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
  return html.join("\n");
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

function createEnvField(field, parsedEnv) {
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
  if (prompt === null && completion === null && total === null && cacheHit === null && cacheMiss === null) {
    return "";
  }
  return [
    prompt !== null ? `輸入 ${prompt}` : "",
    completion !== null ? `輸出 ${completion}` : "",
    total !== null ? `總計 ${total}` : "",
    cacheHit !== null ? `Cache Hit ${cacheHit}` : "",
    cacheMiss !== null ? `Cache Miss ${cacheMiss}` : "",
    cacheRate ? `命中率 ${cacheRate}` : ""
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
      reject(new Error("請選擇圖片檔案作為封面。"));
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

async function openCoverCropDialog(dataUrl) {
  const image = await loadImage(dataUrl);
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

function isMobileLayout() {
  return window.matchMedia(MOBILE_LAYOUT_QUERY).matches;
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
    el.mobileInfoToggleBtn.textContent = mobileInfoOpen ? "▾" : "▸";
    el.mobileInfoToggleBtn.setAttribute("aria-expanded", mobileInfoOpen ? "true" : "false");
  }
}

function fillProfile(state) {
  const { userProfile } = state;
  el.displayName.value = userProfile.displayName || "";
  el.identityText.value = userProfile.identityText || "";
}

function renderRoleCards(state) {
  el.roleCardList.innerHTML = "";

  const assistantItem = document.createElement("div");
  assistantItem.className = "role-card";

  const assistantTitle = document.createElement("h3");
  assistantTitle.textContent = isCharacterCardCreationAssistantActive(state)
    ? "CharacterCardCreationAssistant（目前使用）"
    : "CharacterCardCreationAssistant";

  const assistantDesc = document.createElement("p");
  assistantDesc.textContent =
    "專門協助建立角色卡、角色群組與無角色模式設定包。啟用後會重置目前對話，只使用助手 prompt 直接回覆。";

  const assistantActions = document.createElement("div");
  assistantActions.className = "inline-actions";

  const assistantStartBtn = document.createElement("button");
  assistantStartBtn.className = "secondary";
  assistantStartBtn.type = "button";
  const isPendingAssistantStart = pendingRoleCardStartId === CHARACTER_CARD_CREATION_ASSISTANT_MODE;
  assistantStartBtn.textContent = isPendingAssistantStart ? "處理中..." : "啟用助手並重置";
  assistantStartBtn.disabled = Boolean(pendingRoleCardStartId);
  assistantStartBtn.addEventListener("click", startCharacterCardCreationAssistant);

  const assistantPromptBtn = document.createElement("button");
  assistantPromptBtn.className = "secondary";
  assistantPromptBtn.type = "button";
  assistantPromptBtn.textContent = "編輯助手 Prompt";
  assistantPromptBtn.addEventListener("click", openAssistantPromptDialog);

  assistantActions.append(assistantStartBtn, assistantPromptBtn);
  assistantItem.append(assistantTitle, assistantDesc, assistantActions);
  el.roleCardList.appendChild(assistantItem);

  if (state.roleCards.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "尚無角色卡，其上方仍可直接啟用助手模式。";
    empty.style.color = "#9eb0d0";
    empty.style.fontSize = "12px";
    el.roleCardList.appendChild(empty);
    renderRoleCardPicker(state);
    return;
  }

  state.roleCards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "role-card";
    const cardDisplayName = card.name || "未命名角色卡";

    const title = document.createElement("h3");
    title.textContent =
      state.activeRoleCardId === card.id ? `${cardDisplayName}（目前使用）` : cardDisplayName;

    const desc = document.createElement("p");
    desc.textContent = truncateText(
      [buildRoleCardIntro(card, state), buildRoleCardContent(card, state)].filter(Boolean).join("｜"),
      100
    );

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const startBtn = document.createElement("button");
    startBtn.className = "secondary";
    startBtn.type = "button";
    const isPendingStart = pendingRoleCardStartId === card.id;
    startBtn.textContent = isPendingStart ? "處理中..." : "作為開始";
    startBtn.disabled = Boolean(pendingRoleCardStartId);
    startBtn.addEventListener("click", () => startRoleCard(card.id));

    const editBtn = document.createElement("button");
    editBtn.className = "secondary";
    editBtn.type = "button";
    editBtn.textContent = "編輯";
    editBtn.disabled = Boolean(pendingRoleCardStartId);
    editBtn.addEventListener("click", () => openRoleCardDialog(card));

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
    item.append(title, desc, actions);
    el.roleCardList.appendChild(item);
  });

  renderRoleCardPicker(state);
}

function renderRoleCardPicker(state = appState) {
  if (!el.roleCardPickerGrid || !state) {
    return;
  }

  const roleCards = Array.isArray(state.roleCards) ? state.roleCards : [];
  const items = [
    { type: "assistant", id: CHARACTER_CARD_CREATION_ASSISTANT_MODE },
    ...roleCards.map((card) => ({ type: "card", id: card.id, card }))
  ];
  const totalPages = Math.max(1, Math.ceil(items.length / ROLE_CARD_PICKER_PAGE_SIZE));
  roleCardPickerPage = Math.min(Math.max(1, roleCardPickerPage), totalPages);
  const startIndex = (roleCardPickerPage - 1) * ROLE_CARD_PICKER_PAGE_SIZE;
  const pageItems = items.slice(startIndex, startIndex + ROLE_CARD_PICKER_PAGE_SIZE);

  el.roleCardPickerGrid.innerHTML = "";

  if (!pageItems.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚無角色卡。";
    el.roleCardPickerGrid.appendChild(empty);
  }

  pageItems.forEach((item) => {
    if (item.type === "assistant") {
      el.roleCardPickerGrid.appendChild(createAssistantPickerTile(state));
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
    img.style.objectPosition = normalizeCoverPosition(position);
    cover.appendChild(img);
  } else {
    cover.textContent = fallbackText;
  }
  return cover;
}

function createAssistantPickerTile(state) {
  const tile = document.createElement("article");
  tile.className = "role-picker-card";

  const title = document.createElement("h4");
  title.textContent = isCharacterCardCreationAssistantActive(state)
    ? "CharacterCardCreationAssistant（目前使用）"
    : "CharacterCardCreationAssistant";

  const intro = document.createElement("p");
  intro.className = "role-picker-intro";
  intro.textContent = "簡介：角色卡、角色群組與無角色設定包建立助手。";

  const content = document.createElement("p");
  content.className = "role-picker-content";
  content.textContent = "內容：啟用後會重置目前對話，只使用助手 Prompt 直接回覆。";

  const actions = document.createElement("div");
  actions.className = "role-picker-actions";

  const startBtn = document.createElement("button");
  startBtn.className = "secondary";
  startBtn.type = "button";
  startBtn.textContent = pendingRoleCardStartId === CHARACTER_CARD_CREATION_ASSISTANT_MODE ? "處理中..." : "啟用助手";
  startBtn.disabled = Boolean(pendingRoleCardStartId);
  startBtn.addEventListener("click", async () => {
    await startCharacterCardCreationAssistant();
    el.roleCardPickerDialog?.close();
  });

  const promptBtn = document.createElement("button");
  promptBtn.className = "muted";
  promptBtn.type = "button";
  promptBtn.textContent = "編輯 Prompt";
  promptBtn.addEventListener("click", () => {
    el.roleCardPickerDialog?.close();
    openAssistantPromptDialog();
  });

  actions.append(startBtn, promptBtn);
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

function renderSessions(state) {
  const sessions = state.savedSessionsMeta || [];
  el.sessionList.innerHTML = "";

  if (!sessions.length) {
    const empty = document.createElement("p");
    empty.textContent = "尚無對話存檔。";
    empty.style.color = "#9eb0d0";
    empty.style.fontSize = "12px";
    el.sessionList.appendChild(empty);
    renderSessionPicker(state);
    return;
  }

  sessions.forEach((session) => {
    const item = document.createElement("div");
    item.className = "role-card";

    const title = document.createElement("h3");
    title.textContent = session.name;

    const desc = document.createElement("p");
    desc.textContent = `角色卡：${getSessionRoleCardLabel(session)}｜ID:${session.id}｜訊息:${session.messageCount}`;

    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const continueBtn = document.createElement("button");
    continueBtn.type = "button";
    continueBtn.className = "secondary";
    continueBtn.textContent = "載入續聊";
    continueBtn.addEventListener("click", () => loadSession(session.id, false));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => deleteSession(session));

    actions.append(continueBtn, deleteBtn);

    item.append(title, desc, actions);
    el.sessionList.appendChild(item);
  });

  renderSessionPicker(state);
}

function renderSessionPicker(state = appState) {
  if (!el.sessionPickerGrid || !state) {
    return;
  }

  const sessions = Array.isArray(state.savedSessionsMeta) ? state.savedSessionsMeta : [];
  const totalPages = Math.max(1, Math.ceil(sessions.length / SESSION_PICKER_PAGE_SIZE));
  sessionPickerPage = Math.min(Math.max(1, sessionPickerPage), totalPages);
  const startIndex = (sessionPickerPage - 1) * SESSION_PICKER_PAGE_SIZE;
  const pageItems = sessions.slice(startIndex, startIndex + SESSION_PICKER_PAGE_SIZE);

  el.sessionPickerGrid.innerHTML = "";

  if (!pageItems.length) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚無對話存檔。";
    el.sessionPickerGrid.appendChild(empty);
  }

  pageItems.forEach((session) => {
    el.sessionPickerGrid.appendChild(createSessionPickerTile(session, state));
  });

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

function createSessionPickerTile(session, state) {
  const tile = document.createElement("article");
  tile.className = "session-picker-card";

  const title = document.createElement("h4");
  title.textContent = session.name;

  const role = document.createElement("p");
  role.className = "session-picker-role";
  role.textContent = `角色卡：${getSessionRoleCardLabel(session)}`;

  const meta = document.createElement("p");
  meta.className = "session-picker-meta";
  const updatedText = session.updatedAt ? new Date(session.updatedAt).toLocaleString("zh-Hant") : "未知時間";
  meta.textContent = `訊息：${session.messageCount}｜更新：${updatedText}`;

  const actions = document.createElement("div");
  actions.className = "session-picker-actions";

  const continueBtn = document.createElement("button");
  continueBtn.type = "button";
  continueBtn.className = "secondary";
  continueBtn.textContent = "載入續聊";
  continueBtn.addEventListener("click", async () => {
    await loadSession(session.id, false);
    el.sessionPickerDialog?.close();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "muted";
  deleteBtn.textContent = "刪除";
  deleteBtn.addEventListener("click", () => deleteSession(session));

  actions.append(continueBtn, deleteBtn);
  tile.append(title, role, meta, actions);
  return tile;
}

function renderMessages(state) {
  el.messages.innerHTML = "";
  const compactMobile = isMobileLayout();
  const conversation = Array.isArray(state.conversation) ? [...state.conversation] : [];

  if (!conversation.length) {
    const empty = document.createElement("p");
    empty.textContent = "尚無對話。";
    empty.style.color = "#9eb0d0";
    el.messages.appendChild(empty);
    return;
  }

  conversation.forEach((message, index) => {
    const wrapper = document.createElement("details");
    wrapper.className = `message ${message.role}`;
    wrapper.open = compactMobile || index >= conversation.length - 1;

    const summary = document.createElement("summary");
    summary.className = "message-summary";

    const meta = document.createElement("div");
    const editedTag = message.edited ? "(已編輯)" : "";
    const sourceTag =
      message.source === "discord"
        ? "[Discord]"
        : message.source === "opening"
          ? "[開場]"
          : "[系統]";
    meta.className = "meta";
    meta.textContent = `#${index + 1} ${message.role === "assistant" ? "AI" : "User"} ${sourceTag} ${editedTag}`;

    const preview = document.createElement("div");
    preview.className = "message-preview";
    preview.textContent = message.streaming
      ? truncateText(message.content || "正在生成...", 90) || "正在生成..."
      : truncateText(message.content, 90) || "（空白）";

    const reasoning = typeof message.reasoningContent === "string" ? message.reasoningContent : "";

    const content = document.createElement("div");
    content.className = "message-content";
    const fullContent = message.content || (
      message.phase === "compression"
        ? "正在處理模型內容..."
        : "正在生成回覆..."
    );
    const fullContentBody = document.createElement("div");
    fullContentBody.className = "markdown-body";
    fullContentBody.innerHTML = renderMarkdownToHtml(fullContent);
    if (message.role === "assistant" && message.extra?.compressionNotice) {
      const compressionNotice = document.createElement("div");
      compressionNotice.className = "compression-notice";
      compressionNotice.textContent = "【( •̀ ω •́ )✧模型內容已更新】";
      content.appendChild(compressionNotice);
    }
    content.appendChild(fullContentBody);

    summary.append(meta, preview);

    if (message.role === "assistant" && reasoning) {
      const reasoningDetails = document.createElement("details");
      reasoningDetails.className = "message-reasoning";

      const reasoningSummary = document.createElement("summary");
      reasoningSummary.textContent = "顯示思考過程";

      const reasoningContent = document.createElement("div");
      reasoningContent.className = "message-reasoning-content";
      reasoningContent.innerHTML = renderMarkdownToHtml(reasoning);

      reasoningDetails.append(reasoningSummary, reasoningContent);
      wrapper.append(summary, reasoningDetails, content);
      el.messages.appendChild(wrapper);
      return;
    }

    wrapper.append(summary, content);
    el.messages.appendChild(wrapper);
  });

  el.messages.scrollTop = el.messages.scrollHeight;
}

function formatAiLogPurpose(purpose) {
  if (purpose === "context_compression") {
    return "模型內容處理";
  }
  if (purpose === "chat_expand") {
    return "補寫";
  }
  return "正文輸出";
}

function formatAiLogMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return "無";
  }

  return messages
    .map((message, index) => {
      const role = message?.role || "unknown";
      const content = typeof message?.content === "string" ? message.content : serializeDisplayValue(message?.content);
      return [`#${index + 1} ${role}`, content || "(空白)"].join("\n");
    })
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
  const hasConversationTarget = Boolean(state.aiSessionStarted && (state.activeRoleCardId || isCharacterCardCreationAssistantActive(state)));

  if (pendingRoleCardStartId) {
    el.startStatus.textContent = "切換中";
    el.startStatus.classList.add("started");
  } else if (state.aiSessionStarted && (state.activeRoleCardId || isCharacterCardCreationAssistantActive(state))) {
    el.startStatus.textContent = isCharacterCardCreationAssistantActive(state)
      ? "已開始（角色卡建立助手）"
      : "已開始";
    el.startStatus.classList.add("started");
  } else {
    el.startStatus.textContent = "尚未開始";
    el.startStatus.classList.remove("started");
  }

  el.chatInput.readOnly = Boolean(pendingRoleCardStartId);
  el.chatInput.placeholder = hasConversationTarget
    ? "輸入對話內容"
    : "請先選擇角色卡或啟用角色卡建立助手";
  el.sendBtn.disabled = Boolean(pendingRoleCardStartId) || !hasConversationTarget;
  el.sendBtn.textContent = pendingRoleCardStartId ? "切換中..." : "送出";

  if (el.discordBotLinkBtn) {
    el.discordBotLinkBtn.disabled = !discordAuthorizeUrl;
    el.discordBotLinkBtn.textContent = discordAuthorizeUrl ? "Discord Bot 連結" : "缺少 Discord Bot 連結";
    el.discordBotLinkBtn.dataset.discordAuthorizeUrl = discordAuthorizeUrl;
  }

  const canEditAiOutput = state.conversation.some((msg) => msg.role === "assistant");
  el.editAiOutputBtn.disabled = !canEditAiOutput;
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
  select.innerHTML = "";
  modes.forEach((entry) => {
    const option = document.createElement("option");
    option.value = entry.mode;
    option.textContent = entry.name || entry.mode;
    select.appendChild(option);
  });
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
  if (el.modularPreviewReasonerSystem) {
    el.modularPreviewReasonerSystem.value = "";
  }
  if (el.modularPreviewCompressionPrompt) {
    el.modularPreviewCompressionPrompt.value = "";
  }
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
  el.compressionProfileSelect.innerHTML = "";
  compressionProfilesDraft.forEach((profile, index) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${profile.name || profile.id || `大模型 ${index + 1}`}${profile.enabled === false ? "（未啟用）" : ""}`;
    el.compressionProfileSelect.appendChild(option);
  });
  selectedCompressionProfileId = compressionProfilesDraft.some((profile) => profile.id === selectedId)
    ? selectedId
    : STANDARD_COMPRESSION_PROFILE_ID;
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
    normalizeKeywordFollowupAction(action.keywordFollowupAction, action.skipReasoner) ===
      KEYWORD_FOLLOWUP_STOP_AFTER_MODEL ? "關鍵字後停下" : ""
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
  el.compressionTriggerActionList.innerHTML = "";

  if (normalizedActions.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚未建立觸發組合。";
    el.compressionTriggerActionList.appendChild(empty);
    return;
  }

  normalizedActions.forEach((action, index) => {
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
    keywordFollowupLabel.textContent = "觸發關鍵字後續動作";
    const keywordFollowupSelect = document.createElement("select");
    keywordFollowupSelect.dataset.field = "triggerKeywordFollowupAction";
    [
      [KEYWORD_FOLLOWUP_CONTINUE_REASONER, "按照對話繼續觸發正文"],
      [KEYWORD_FOLLOWUP_STOP_AFTER_MODEL, "停下，只輸出完成訊息"]
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
    turnsInput.placeholder = "例如：0, 5, 12";
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
      sourceLabel
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

    item.append(header, editor);
    el.compressionTriggerActionList.appendChild(item);
  });
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
  el.compressionAppendTermList.innerHTML = "";

  if (normalizedTerms.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚未建立追加詞。";
    el.compressionAppendTermList.appendChild(empty);
    return;
  }

  normalizedTerms.forEach((term, index) => {
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
    el.compressionAppendTermList.appendChild(item);
  });
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
  profile.contextCompression = normalizeContextCompressionConfig({
    mainRules: el.modularCompressionMainRules?.value || "",
    models: collectCompressionModelsFromEditor()
  }, appState?.contextCompressionPrompt || "", {
    allowEmptyModels: !isStandard,
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
  el.modularCompressionModelList.innerHTML = "";

  if (compressionModelsDraft.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-hint";
    empty.textContent = "尚未建立模塊，這個大模型會以純文本方式保存模型內容。";
    el.modularCompressionModelList.appendChild(empty);
    return;
  }

  compressionModelsDraft.forEach((model, index) => {
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
    el.modularCompressionModelList.appendChild(item);
  });
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
      enabled: Boolean(item.querySelector("[data-field='sectionEnabled']")?.checked)
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

    const title = document.createElement("div");
    title.className = "inline-actions";

    const label = document.createElement("strong");
    label.textContent = `${section.name || `自定義內容 ${index + 1}`}${section.enabled === false ? "｜停用" : ""}`;
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

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除";
    deleteBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true })
        .filter((item) => item.id !== section.id);
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });

    title.append(label, enabledBtn, deleteBtn);

    const enabledLabel = document.createElement("label");
    enabledLabel.textContent = "啟用";
    const enabledInput = document.createElement("input");
    enabledInput.type = "checkbox";
    enabledInput.checked = section.enabled !== false;
    enabledInput.dataset.field = "sectionEnabled";
    enabledLabel.prepend(enabledInput);
    enabledLabel.hidden = true;

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

    item.append(title, enabledLabel, nameLabel, contentLabel);
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
  const assistantMessages = (appState?.conversation || []).filter((msg) => msg.role === "assistant");
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

async function startCharacterCardCreationAssistant() {
  pendingRoleCardStartId = CHARACTER_CARD_CREATION_ASSISTANT_MODE;
  setMobilePage("chat");
  if (appState) {
    renderRoleCards(appState);
    renderStatus(appState);
  }
  showToast("正在啟用角色卡建立助手，請稍候...");

  try {
    await request("/api/assistant-modes/character-card-creation/start", { method: "POST" });
    await refresh();
    showToast("角色卡建立助手已啟用");
  } catch (error) {
    pendingRoleCardStartId = "";
    if (appState) {
      renderRoleCards(appState);
      renderStatus(appState);
    }
    showToast(error.message, "error");
  }
}

async function refresh() {
  const state = await request("/api/state", { method: "GET" });
  appState = state;
  pendingRoleCardStartId = "";

  fillProfile(state);
  renderConversationModelSettings(state);
  renderAllPromptModeSelects(getActivePromptMode(state));
  renderRoleCards(state);
  renderSessions(state);
  renderMessages(state);
  renderAiLogs(state);
  renderStatus(state);
  refreshAssistantSelector();
  applyMobilePage();
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

async function openAssistantPromptDialog() {
  try {
    const payload = await request("/api/character-card-creation-assistant-prompt", { method: "GET" });
    if (payload?.state) {
      appState = payload.state;
    }
    if (el.assistantPromptInput) {
      el.assistantPromptInput.value = payload?.prompt || appState?.characterCardCreationAssistantPrompt || "";
    }
    el.assistantPromptDialog?.showModal();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function saveAssistantPrompt() {
  try {
    const payload = await request("/api/character-card-creation-assistant-prompt", {
      method: "PUT",
      body: JSON.stringify({
        prompt: el.assistantPromptInput?.value || ""
      })
    });
    if (payload?.state) {
      appState = payload.state;
    }
    if (payload?.prompt && el.assistantPromptInput) {
      el.assistantPromptInput.value = payload.prompt;
    }
    showToast("助手 Prompt 已保存");
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
    appState = payload?.state || appState;
    renderAllPromptModeSelects(config.mode);
    renderModularPromptEditor(config.mode);
    showToast("Prompt 已保存");
  } catch (error) {
    showToast(error.message, "error");
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

async function saveSession() {
  const suggested = `對話存檔 ${new Date().toLocaleString("zh-Hant")}`;
  const input = window.prompt("請輸入存檔名稱", suggested);
  const name = (input || "").trim();

  try {
    await request("/api/sessions/save", {
      method: "POST",
      body: JSON.stringify({ name })
    });
    await refresh();
    showToast("已保存整體對話存檔");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function loadSession(sessionId, restart) {
  try {
    await request(`/api/sessions/${sessionId}/load`, {
      method: "POST",
      body: JSON.stringify({ restart: false })
    });
    await refresh();
    showToast("已從存檔點載入，可繼續對話");
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
    await request(`/api/sessions/${session.id}`, {
      method: "DELETE"
    });
    await refresh();
    showToast("對話存檔已刪除");
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
  };
  if (typeof layoutMedia.addEventListener === "function") {
    layoutMedia.addEventListener("change", handleLayoutChange);
  } else if (typeof layoutMedia.addListener === "function") {
    layoutMedia.addListener(handleLayoutChange);
  }

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
      renderModularPromptEditor();
      el.modularPromptDialog.showModal();
    });
  }

  if (el.selectRoleCardBtn) {
    el.selectRoleCardBtn.addEventListener("click", () => {
      roleCardPickerPage = 1;
      renderRoleCardPicker(appState);
      el.roleCardPickerDialog.showModal();
    });
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

  el.createRoleCardBtn.addEventListener("click", () => openRoleCardDialog(null));
  if (el.importRoleCardBtn && el.roleCardImportFile) {
    el.importRoleCardBtn.addEventListener("click", () => el.roleCardImportFile.click());
    el.roleCardImportFile.addEventListener("change", async () => {
      await importRoleCardFromFile(el.roleCardImportFile.files?.[0]);
    });
  }
  if (el.selectSessionBtn) {
    el.selectSessionBtn.addEventListener("click", () => {
      sessionPickerPage = 1;
      renderSessionPicker(appState);
      el.sessionPickerDialog.showModal();
    });
  }

  if (el.closeSessionPickerBtn) {
    el.closeSessionPickerBtn.addEventListener("click", () => el.sessionPickerDialog.close());
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

  el.saveSessionBtn.addEventListener("click", saveSession);

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
        setRoleCardCoverPreview(dataUrl);
        el.coverCropDialog.close();
        coverCropState = null;
      } catch (error) {
        showToast(error.message || "封面裁切失敗", "error");
      }
    });
  }

  if (el.cancelCoverCropBtn) {
    el.cancelCoverCropBtn.addEventListener("click", () => {
      coverCropState = null;
      el.coverCropDialog.close();
    });
  }

  if (el.changeCoverCropImageBtn) {
    el.changeCoverCropImageBtn.addEventListener("click", () => {
      coverCropState = null;
      el.coverCropDialog.close();
      el.roleCardCoverImageFile.value = "";
      el.roleCardCoverImageFile.click();
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
    const content = el.chatInput.value.trim();
    if (!content) {
      showToast("請先輸入內容", "error");
      return;
    }

    try {
      el.sendBtn.disabled = true;
      el.sendBtn.textContent = "生成中...";
      await request("/api/chat/send", {
        method: "POST",
        body: JSON.stringify({ content })
      });
      el.chatInput.value = "";
      await refresh();
      showToast("已送出");
    } catch (error) {
      showToast(error.message, "error");
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
      showToast("新增 Bot 後，可以在 Discord 使用 Slash 指令 /ai");
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

  if (el.addEnvExtraBtn) {
    el.addEnvExtraBtn.addEventListener("click", () => {
      el.envSettingsExtraList?.appendChild(createEnvExtraRow());
    });
  }

  if (el.closeContextCompressionDialog) {
    el.closeContextCompressionDialog.addEventListener("click", () => el.contextCompressionDialog.close());
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
      if (event.target?.dataset?.envKey?.startsWith("CHAT_API_")) {
        setChatApiTestStatus("", "設定已變更，尚未重新測試");
      }
    });
    el.envSettingsForm.addEventListener("change", (event) => {
      if (event.target?.dataset?.envKey?.startsWith("CHAT_API_")) {
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
        renderEnvSettingsForm(payload?.content || buildEnvContentFromForm());
        showToast("環境設定已保存");
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
      renderModularPromptEditor(el.modularPromptModeSelect.value);
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

}

async function boot() {
  bindEvents();
  try {
    await refresh();
  } catch (error) {
    showToast(`初始化失敗：${error.message}`, "error");
  }
}

boot();
