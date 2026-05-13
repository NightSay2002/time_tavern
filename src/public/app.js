const el = {
  mobileInfoToggleBtn: document.getElementById("mobileInfoToggleBtn"),
  mobileInfoDrawer: document.getElementById("mobileInfoDrawer"),
  startStatus: document.getElementById("startStatus"),
  profileForm: document.getElementById("profileForm"),
  displayName: document.getElementById("displayName"),
  identityText: document.getElementById("identityText"),
  chatOutputModelSelect: document.getElementById("chatOutputModelSelect"),
  dialogueContextRoundsInput: document.getElementById("dialogueContextRoundsInput"),
  applyConversationSettingsBtn: document.getElementById("applyConversationSettingsBtn"),
  editModularPromptsBtn: document.getElementById("editModularPromptsBtn"),
  contextCompressionModeHint: document.getElementById("contextCompressionModeHint"),

  selectRoleCardBtn: document.getElementById("selectRoleCardBtn"),
  createRoleCardBtn: document.getElementById("createRoleCardBtn"),
  roleCardList: document.getElementById("roleCardList"),
  selectSessionBtn: document.getElementById("selectSessionBtn"),
  saveSessionBtn: document.getElementById("saveSessionBtn"),
  sessionList: document.getElementById("sessionList"),

  editAiOutputBtn: document.getElementById("editAiOutputBtn"),
  contextCompressionInspectBtn: document.getElementById("contextCompressionInspectBtn"),
  envSettingsBtn: document.getElementById("envSettingsBtn"),
  mobilePageChatBtn: document.getElementById("mobilePageChatBtn"),
  mobilePageControlsBtn: document.getElementById("mobilePageControlsBtn"),

  messages: document.getElementById("messages"),
  aiLogs: document.getElementById("aiLogs"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  sendBtn: document.getElementById("sendBtn"),

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
  contextCompressionContentView: document.getElementById("contextCompressionContentView"),
  saveContextCompressionDialog: document.getElementById("saveContextCompressionDialog"),
  closeContextCompressionDialog: document.getElementById("closeContextCompressionDialog"),

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
  addModularPromptModeBtn: document.getElementById("addModularPromptModeBtn"),
  deleteModularPromptModeBtn: document.getElementById("deleteModularPromptModeBtn"),
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
let compressionModelsDraft = [];
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
    title: "DeepSeek API",
    description: "API key 多數情況保存後會立即同步。",
    fields: [
      {
        key: "DEEPSEEK_API_KEY",
        label: "DeepSeek API Key",
        type: "password",
        autocomplete: "off"
      },
      {
        key: "DEEPSEEK_REQUEST_TIMEOUT_MS",
        label: "API 請求逾時",
        type: "number",
        placeholder: "600000",
        help: "單位毫秒。600000 = 10 分鐘。"
      },
      {
        key: "DEEPSEEK_MAX_TOKENS",
        label: "輸出 token 上限",
        type: "number",
        help: "選填。主聊天／壓縮呼叫預設 32000，仍會受模型上限限制。"
      },
      {
        key: "DEEPSEEK_API_KEY2",
        label: "壓縮用 DeepSeek API Key",
        type: "password",
        autocomplete: "off",
        help: "選填。舊版 deepseek_key2 / DEEPSEEK_KEY2 會自動帶入這裡。"
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
  DEEPSEEK_API_KEY2: ["DEEPSEEK_KEY2", "deepseek_key2"]
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
  return normalized || "single";
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
  const keywords = Array.isArray(source.keywords)
    ? source.keywords.map((item) => String(item || "").trim()).filter(Boolean)
    : parseTermInput(source.keywords || "");
  const activation = source.activation && typeof source.activation === "object" ? source.activation : {};
  return {
    id: String(source.id || `lore_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim(),
    expanded: Boolean(source.expanded),
    key: String(source.key || source.title || "").trim(),
    keywords,
    content: String(source.content || "").trim(),
    enabled: source.enabled !== false,
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
    content: String(source.content || source.text || "").trim()
  };
}

function getLegacyRoleCardCustomSections(card = {}) {
  return [
    { name: "性格", content: card.personality || "" },
    { name: "場景", content: card.scene || "" },
    { name: "系統指令", content: card.systemInstruction || "" },
    { name: "詳細描述", content: card.description || "" },
    { name: "人物關係（純文字）", content: card.relationships || "" }
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

function normalizeContextCompressionConfig(config = {}, fallbackPrompt = "") {
  const source = config && typeof config === "object" ? config : {};
  const models = Array.isArray(source.models)
    ? source.models.map((item, index) => normalizeCompressionModelConfig(item, index)).filter((item) => item.id)
    : [];
  return {
    mainRules: String(source.mainRules || source.prompt || source.contextCompressionPrompt || fallbackPrompt || "").trim(),
    models: models.length > 0
      ? models
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
    : document.createElement("input");
  input.dataset.envKey = field.key;
  input.id = `envField_${field.key}`;
  input.name = field.key;
  input.value = getEnvFieldValue(parsedEnv, field.key);
  input.placeholder = field.placeholder || "";
  input.spellcheck = false;

  if (field.type === "textarea") {
    input.rows = field.rows || 4;
  } else {
    input.type = field.type || "text";
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
    el.envSettingsFields.appendChild(section);
  });

  envExtraEntries = orderedEntries.filter((entry) => !ENV_KNOWN_KEYS.has(entry.key) && !ENV_DROPPED_KEYS.has(entry.key));
  renderEnvExtraRows(envExtraEntries);
}

function collectEnvFieldValues() {
  const values = {};
  el.envSettingsForm?.querySelectorAll("[data-env-key]").forEach((input) => {
    values[input.dataset.envKey] = input.value || "";
  });
  return values;
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
  return String(raw || "")
    .split(/[\r\n,，、;；|/／]+/)
    .map((item) => item.trim())
    .filter(Boolean);
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
  const getSection = (name) => customSections.find((section) => section.name === name)?.content || "";
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

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "muted";
    deleteBtn.type = "button";
    deleteBtn.textContent = "刪除";
    deleteBtn.disabled = Boolean(pendingRoleCardStartId);
    deleteBtn.addEventListener("click", () => removeRoleCard(card));

    actions.append(startBtn, editBtn, deleteBtn);
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

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "muted";
  deleteBtn.type = "button";
  deleteBtn.textContent = "刪除";
  deleteBtn.disabled = Boolean(pendingRoleCardStartId);
  deleteBtn.addEventListener("click", () => removeRoleCard(card));

  actions.append(startBtn, editBtn, deleteBtn);
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
        ? "正在壓縮上下文..."
        : "正在生成回覆..."
    );
    const fullContentBody = document.createElement("div");
    fullContentBody.className = "markdown-body";
    fullContentBody.innerHTML = renderMarkdownToHtml(fullContent);
    if (message.role === "assistant" && message.extra?.compressionNotice) {
      const compressionNotice = document.createElement("div");
      compressionNotice.className = "compression-notice";
      compressionNotice.textContent = "【( •̀ ω •́ )✧你已經歷了一次壓縮】";
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
    return "壓縮輸出";
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
      reasoningLabel.textContent = "DeepSeek 思考過程";
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

  el.sendBtn.disabled = !discordAuthorizeUrl;
  el.chatInput.readOnly = true;
  el.chatInput.placeholder = discordAuthorizeUrl
    ? "點擊按鈕把 Bot 新增到你的應用程式，然後使用 Slash 指令 /ai content:你的內容"
    : `尚未取得 Discord bot client_id；請在環境設定加入 DISCORD_CLIENT_ID 或有效 DISCORD_BOT_TOKEN`;
  el.sendBtn.textContent = discordAuthorizeUrl ? "新增 Bot 到我的應用程式" : "缺少 Discord Bot 連結";
  el.sendBtn.dataset.discordAuthorizeUrl = discordAuthorizeUrl;

  const canEditAiOutput = state.conversation.some((msg) => msg.role === "assistant");
  el.editAiOutputBtn.disabled = !canEditAiOutput;
}

function renderConversationModelSettings(state) {
  const settings = state?.conversationSettings || {};
  const compression = state?.contextCompression || {};
  if (el.chatOutputModelSelect) {
    el.chatOutputModelSelect.value = settings.chatOutputModel || "deepseek-reasoner";
  }
  if (el.dialogueContextRoundsInput) {
    el.dialogueContextRoundsInput.value = String(settings.dialogueContextRounds || 20);
  }
  if (el.contextCompressionModeHint) {
    const compressedTurn = Number(compression.compressedThroughTurnNumber || 0);
    el.contextCompressionModeHint.textContent = `壓縮模式固定啟用。已壓縮到第 ${compressedTurn || 0} 輪。`;
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
    contextCompression: normalizeContextCompressionConfig({}, appState?.contextCompressionPrompt || ""),
    contextCompressionPrompt: appState?.contextCompressionPrompt || "",
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

function renderModularPromptEditor(mode = "") {
  const promptMode = normalizeRoleCardMode(mode || getActivePromptMode(appState));
  const config = getModularConfig(promptMode);
  const compressionConfig = normalizeContextCompressionConfig(
    config.contextCompression || { mainRules: config.contextCompressionPrompt },
    config.contextCompressionPrompt || appState?.contextCompressionPrompt || ""
  );
  if (el.modularPromptModeSelect) {
    renderPromptModeOptions(el.modularPromptModeSelect, promptMode);
  }
  if (el.modularPromptModeName) {
    el.modularPromptModeName.value = config.name || getDefaultPromptModeDisplayName(promptMode);
  }
  if (el.deleteModularPromptModeBtn) {
    el.deleteModularPromptModeBtn.disabled = BUILTIN_PROMPT_MODES.includes(promptMode);
    el.deleteModularPromptModeBtn.title = BUILTIN_PROMPT_MODES.includes(promptMode)
      ? "內建模式不可刪除"
      : "";
  }
  if (el.modularCompressionMainRules) {
    el.modularCompressionMainRules.value = compressionConfig.mainRules || "";
  }
  renderCompressionModelEditor(compressionConfig.models);
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
    empty.textContent = "尚未建立壓縮模型。";
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
    label.textContent = `${model.name || model.id || `模型 ${index + 1}`} (${model.id || "未設定ID"})`;
    label.style.flex = "1";
    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
    deleteBtn.textContent = "刪除模型";
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
    addLabel.textContent = "新增模型規則";
    const addInput = document.createElement("textarea");
    addInput.rows = 5;
    addInput.className = "compression-model-rules";
    addInput.value = model.addRules || "";
    addInput.dataset.field = "compressionModelAddRules";
    addLabel.appendChild(addInput);

    const deleteLabel = document.createElement("label");
    deleteLabel.textContent = "刪除模型規則";
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
  const contextCompression = normalizeContextCompressionConfig({
    mainRules: el.modularCompressionMainRules?.value || "",
    models: collectCompressionModelsFromEditor()
  }, appState?.contextCompressionPrompt || "");
  return {
    version: 2,
    mode,
    name: el.modularPromptModeName?.value?.trim() || getDefaultPromptModeDisplayName(mode),
    contextCompression,
    contextCompressionPrompt: contextCompression.mainRules,
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
      content: item.querySelector("[data-field='sectionContent']")?.value || ""
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
    label.textContent = section.name || `自定義內容 ${index + 1}`;
    label.style.flex = "1";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "muted";
      deleteBtn.textContent = "刪除";
      deleteBtn.addEventListener("click", () => {
      roleCardCustomSectionsDraft = collectRoleCardCustomSectionsFromEditor({ keepEmpty: true })
        .filter((item) => item.id !== section.id);
      renderRoleCardCustomSectionEditor(roleCardCustomSectionsDraft);
    });

    title.append(label, deleteBtn);

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
      content: item.querySelector("[data-field='content']")?.value || "",
      enabled: Boolean(item.querySelector("[data-field='enabled']")?.checked),
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
      return item.key || item.content || item.keywords.length > 0;
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
    title.textContent = entry.key || `條目 ${index + 1}`;
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
      keyLabel,
      keywordLabel,
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
    el.roleCardOpening.value = card.openingDialogue;
    renderRoleCardLorebookEditor(card.lorebooks || []);
  } else {
    el.roleCardDialogTitle.textContent = "建立角色卡";
    roleCardCoverImageReadTask = null;
    el.roleCardId.value = "";
    renderPromptModeOptions(el.roleCardMode, "single");
    el.roleCardName.value = "";
    el.roleCardCoverImageFile.value = "";
    setRoleCardCoverPreview("", "center center");
    renderRoleCardCustomSectionEditor([]);
    el.roleCardOpening.value = "";
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

async function updateConversationSettings() {
  const settings = {
    chatOutputModel: el.chatOutputModelSelect?.value || "deepseek-reasoner",
    dialogueContextRounds: Number(el.dialogueContextRoundsInput?.value || 20) || 20
  };
  try {
    await request("/api/conversation-settings", {
      method: "PUT",
      body: JSON.stringify(settings)
    });
    await refresh();
    showToast("已套用對話模型與上下文設定");
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function openContextCompressionDialog() {
  try {
    const payload = await request("/api/context-compression", { method: "GET" });
    if (payload?.state) {
      appState = payload.state;
    }
    const compression = payload?.contextCompression || appState?.contextCompression || {};
    const compressedTurn = Number(compression.compressedThroughTurnNumber || 0);
    if (el.contextCompressionMeta) {
      el.contextCompressionMeta.textContent = [
        `狀態: ${compression.enabled ? "啟用" : "停用"}`,
        `已壓縮到第 ${compressedTurn || 0} 輪`,
        compression.updatedAt ? `更新時間: ${new Date(compression.updatedAt).toLocaleString("zh-Hant")}` : ""
      ].filter(Boolean).join("｜");
    }
    if (el.contextCompressionContentView) {
      el.contextCompressionContentView.value = compression.summary || "";
    }
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
        summary: el.contextCompressionContentView?.value || ""
      })
    });
    if (payload?.state) {
      appState = payload.state;
    }
    const compression = payload?.contextCompression || appState?.contextCompression || {};
    if (el.contextCompressionMeta) {
      const compressedTurn = Number(compression.compressedThroughTurnNumber || 0);
      el.contextCompressionMeta.textContent = [
        "狀態: 啟用",
        `已壓縮到第 ${compressedTurn || 0} 輪`,
        compression.updatedAt ? `更新時間: ${new Date(compression.updatedAt).toLocaleString("zh-Hant")}` : ""
      ].filter(Boolean).join("｜");
    }
    renderConversationModelSettings(appState || {});
    showToast("壓縮內容已保存");
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
  const baseConfig = getModularConfig(el.modularPromptModeSelect?.value || getActivePromptMode(appState));
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

  if (el.applyConversationSettingsBtn) {
    el.applyConversationSettingsBtn.addEventListener("click", async () => {
      await updateConversationSettings();
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

    const payload = {
      mode: normalizeRoleCardMode(el.roleCardMode.value),
      name: el.roleCardName.value.trim(),
      coverImage: el.roleCardCoverImage.value.trim(),
      coverPosition: "center center",
      customSections: collectRoleCardCustomSectionsFromEditor(),
      openingDialogue: el.roleCardOpening.value.trim(),
      lorebooks: collectRoleCardLorebooksFromEditor()
    };
    const corruptedFields = Object.entries({
      名字: payload.name,
      自定義內容: JSON.stringify(payload.customSections),
      開場對話: payload.openingDialogue,
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
    const discordAuthorizeUrl = appState?.discord?.authorizeUrl || el.sendBtn.dataset.discordAuthorizeUrl || "";
    if (discordAuthorizeUrl) {
      window.open(discordAuthorizeUrl, "_blank", "noopener,noreferrer");
      showToast("新增 Bot 後，請在 Discord 使用 Slash 指令 /ai content:你的內容");
      return;
    }
    showToast("尚未取得 Discord bot 授權連結，請在環境設定加入 DISCORD_CLIENT_ID 或有效 DISCORD_BOT_TOKEN。", "error");
  });

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

  if (el.addModularPromptModeBtn) {
    el.addModularPromptModeBtn.addEventListener("click", createCustomPromptMode);
  }

  if (el.deleteModularPromptModeBtn) {
    el.deleteModularPromptModeBtn.addEventListener("click", async () => {
      await deleteCurrentPromptMode();
    });
  }

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
        name: "新模型",
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
