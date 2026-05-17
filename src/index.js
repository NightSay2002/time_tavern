import "dotenv/config";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ApplicationCommandOptionType, Client, GatewayIntentBits, MessageFlags, Partials } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3234);
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "..", "data");
const PROMPTS_DIR = path.join(__dirname, "..", "prompts");
const MODULAR_PROMPTS_DIR = path.join(PROMPTS_DIR, "modular");
const ENV_FILE = path.join(__dirname, "..", ".env");
const STATE_FILE = path.join(DATA_DIR, "app-state.json");
const CARD_STATE_FILE = path.join(DATA_DIR, "cardstate.json");
const SAVED_SESSIONS_DIR = path.join(DATA_DIR, "saved-sessions");
const COMMAND_PREFIX = safeText(process.env.COMMAND_PREFIX) || "!ai";
const DISCORD_BOT_TOKEN = safeText(process.env.DISCORD_BOT_TOKEN);
const DISCORD_GUILD_ID = safeText(process.env.DISCORD_GUILD_ID);
const DEFAULT_CHAT_API_PROVIDER = "deepseek";
const DEFAULT_CHAT_API_MODEL = "deepseek-reasoner";
const DEFAULT_MIN_REPLY_CHARS = 600;
const CHAT_API_LENGTH_RETRY_LIMIT = 1;
const CHAT_API_TEMPERATURE = 0.5;
const CHARACTER_CARD_CREATION_ASSISTANT_TEMPERATURE = 0.9;
const DEFAULT_DIALOGUE_CONTEXT_ROUNDS = 20;
const CHARACTER_CARD_CREATION_ASSISTANT_MODE = "CharacterCardCreationAssistant";
const DISCORD_TEXT_ATTACHMENT_MAX_BYTES = envNumber("DISCORD_TEXT_ATTACHMENT_MAX_BYTES", 1024 * 1024);
const STANDARD_COMPRESSION_PROFILE_ID = "standard";
const MODEL_TRIGGER_ACTION_CALL_API = "call_api";
const MODEL_TRIGGER_ACTION_COPY_USER_INPUT = "copy_user_input";
const MODEL_APPEND_PLAYER_OTHER = "userx";
const KEYWORD_PROXIMITY_CHARS = 10;
const TIME_TRACKING_CONNECTOR_PROXIMITY_CHARS = 5;
const TIME_PERIOD_MORNING = "morning";
const TIME_PERIOD_NOON = "noon";
const TIME_PERIOD_EVENING = "evening";
const TIME_PERIOD_LABELS = {
  [TIME_PERIOD_MORNING]: "早上",
  [TIME_PERIOD_NOON]: "中午",
  [TIME_PERIOD_EVENING]: "晚上"
};
const DEFAULT_TIME_TRACKING_CONFIG = {
  nextDayWords: ["下一天", "第二天", "隔天", "翌日", "次日", "明天", "明日"],
  connectorWords: ["來到", "来到", "已經", "已经", "現在", "现在", "到了", "變成", "变成", "已是"],
  noChangeWords: ["等到", "等一下", "的時候", "的时候"],
  morningWords: ["早上", "早晨", "清晨", "早餐", "早飯", "早饭", "上午", "天亮"],
  noonWords: ["中午", "下午", "午餐", "午飯", "午饭", "正午"],
  eveningWords: ["晚上", "夜晚", "晚餐", "晚飯", "晚饭", "傍晚", "深夜", "夜裡", "夜里"]
};

function envText(key, fallback) {
  const raw = process.env[key];
  if (typeof raw !== "string" || raw.trim() === "") {
    return fallback;
  }
  return raw.replace(/\\n/g, "\n");
}

function resolveMaybeRelativePath(filePath = "") {
  const normalizedPath = safeText(filePath);
  if (!normalizedPath) {
    return "";
  }
  return path.isAbsolute(normalizedPath) ? normalizedPath : path.resolve(process.cwd(), normalizedPath);
}

function loadTextFileIfExists(filePath, fallback = "") {
  const resolvedPath = resolveMaybeRelativePath(filePath);
  if (!resolvedPath) {
    return fallback;
  }

  try {
    if (!fs.existsSync(resolvedPath)) {
      return fallback;
    }
    return fs.readFileSync(resolvedPath, "utf8").trim() || fallback;
  } catch {
    return fallback;
  }
}

function readEnvFileContent() {
  try {
    if (!fs.existsSync(ENV_FILE)) {
      return "";
    }
    return fs.readFileSync(ENV_FILE, "utf8");
  } catch {
    return "";
  }
}

function parseEnvContent(content = "") {
  try {
    return dotenv.parse(safeText(content));
  } catch {
    return {};
  }
}

function saveEnvFileContent(content = "") {
  const previousEnv = parseEnvContent(readEnvFileContent());
  const nextContent = safeText(content);
  const nextEnv = parseEnvContent(nextContent);
  fs.writeFileSync(ENV_FILE, nextContent.endsWith("\n") ? nextContent : `${nextContent}\n`, "utf8");

  Object.keys(previousEnv).forEach((key) => {
    if (!Object.prototype.hasOwnProperty.call(nextEnv, key)) {
      delete process.env[key];
    }
  });
  Object.entries(nextEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });

  return nextContent;
}

function getContextCompressionPrompt() {
  return safeText(contextCompressionPrompt) ||
    "你是長篇角色互動的上下文壓縮器。請輸出可供後續正文模型承接的精簡上下文。";
}

function getCharacterCardCreationAssistantPrompt() {
  return safeText(characterCardCreationAssistantPrompt) ||
    "你是角色卡建立助手，請直接輸出正式正文。";
}

function ensurePromptsDir() {
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true });
  }
}

function saveContextCompressionPrompt(content = "") {
  const nextPrompt = safeText(content) || getContextCompressionPrompt();
  ensurePromptsDir();
  fs.writeFileSync(CONTEXT_COMPRESSION_PROMPT_FILE, `${nextPrompt}\n`, "utf8");
  contextCompressionPrompt = nextPrompt;
  return contextCompressionPrompt;
}

function saveCharacterCardCreationAssistantPrompt(content = "") {
  const nextPrompt = safeText(content) || getCharacterCardCreationAssistantPrompt();
  ensurePromptsDir();
  fs.writeFileSync(CHARACTER_CARD_CREATION_ASSISTANT_PROMPT_FILE, `${nextPrompt}\n`, "utf8");
  characterCardCreationAssistantPrompt = nextPrompt;
  return characterCardCreationAssistantPrompt;
}

function envTextOrFile(key, fallback, options = {}) {
  const fileKey = safeText(options.fileKey) || `${key}_FILE`;
  const defaultFilePath = safeText(options.defaultFilePath);
  const fileValue = safeText(process.env[fileKey]);
  const fileContent = loadTextFileIfExists(fileValue || defaultFilePath, "");
  if (fileContent) {
    return fileContent;
  }
  return envText(key, fallback);
}

function renderPromptTemplate(template, variables) {
  return Object.entries(variables).reduce((output, [key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    return output.replace(pattern, String(value ?? ""));
  }, template);
}

function envNumber(key, fallback) {
  const raw = Number(process.env[key] || "");
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function envFirstText(keys = [], fallback = "") {
  for (const key of keys) {
    const value = safeText(process.env[key]);
    if (value) {
      return value;
    }
  }
  return fallback;
}

function envFirstNumber(keys = [], fallback) {
  for (const key of keys) {
    const raw = Number(process.env[key] || "");
    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }
  }
  return fallback;
}

function envObjectFirstText(source = {}, keys = [], fallback = "") {
  const envSource = source && typeof source === "object" ? source : {};
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(envSource, key)) {
      continue;
    }
    const value = safeText(envSource[key]);
    if (value) {
      return value;
    }
  }
  return fallback;
}

function envObjectFirstNumber(source = {}, keys = [], fallback) {
  const envSource = source && typeof source === "object" ? source : {};
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(envSource, key)) {
      continue;
    }
    const raw = Number(envSource[key] || "");
    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }
  }
  return fallback;
}

function decodeDiscordClientIdFromToken(token = "") {
  const firstSegment = safeText(token).split(".")[0] || "";
  if (!firstSegment) {
    return "";
  }

  try {
    const decoded = Buffer.from(firstSegment, "base64url").toString("utf8");
    return /^\d{15,25}$/.test(decoded) ? decoded : "";
  } catch {
    return "";
  }
}

function getDiscordClientId() {
  return safeText(process.env.DISCORD_CLIENT_ID) ||
    safeText(activeDiscordClient?.application?.id) ||
    safeText(activeDiscordClient?.user?.id) ||
    decodeDiscordClientIdFromToken(process.env.DISCORD_BOT_TOKEN);
}

function getDiscordAuthorizeUrl() {
  const clientId = getDiscordClientId();
  if (!clientId) {
    return "";
  }
  return `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(clientId)}`;
}

function hasUnresolvedTemplatePlaceholder(line, preservedKeys = ["user"]) {
  const matches = String(line).match(/{{\s*([^}]+?)\s*}}/g);
  if (!matches) {
    return false;
  }

  return matches.some((token) => {
    const key = token.replace(/[{}]/g, "").trim().toLowerCase();
    return !preservedKeys.includes(key);
  });
}

function finalizePromptTemplate(template, variables) {
  return renderPromptTemplate(template, variables)
    .split("\n")
    .filter((line) => !hasUnresolvedTemplatePlaceholder(line))
    .join("\n")
    .trim();
}

const CHARACTER_CARD_CREATION_ASSISTANT_PROMPT_FILE = path.join(PROMPTS_DIR, "CharacterCardCreationAssistant.txt");
let characterCardCreationAssistantPrompt = envTextOrFile(
  "CHARACTER_CARD_CREATION_ASSISTANT_PROMPT",
  "你是角色卡建立助手，請直接輸出正式正文。",
  {
    defaultFilePath: CHARACTER_CARD_CREATION_ASSISTANT_PROMPT_FILE
  }
);

const CONTEXT_COMPRESSION_PROMPT_FILE = path.join(PROMPTS_DIR, "Context_compression.txt");
const COMPRESSION_USER_NOTICE_TEXT = "【( •̀ ω •́ )✧模型內容已更新】";
let contextCompressionPrompt = envTextOrFile(
  "CONTEXT_COMPRESSION_PROMPT",
  "你是長篇角色互動的上下文壓縮器。請輸出可供後續正文模型承接的精簡上下文。",
  {
    defaultFilePath: CONTEXT_COMPRESSION_PROMPT_FILE
  }
);
const GENERATION_STOPPED_MESSAGE = "已停止正在生成的對話。";
let activeGenerationRequest = null;

const DISCORD_SLASH_COMMANDS = [
  {
    name: "ai",
    description: "和 AI 對話",
    options: [
      {
        name: "content",
        description: "要對 AI 說的內容",
        type: ApplicationCommandOptionType.String,
        required: false
      },
      {
        name: "file",
        description: "可上傳 .txt 檔作為本輪輸入",
        type: ApplicationCommandOptionType.Attachment,
        required: false
      }
    ]
  },
  {
    name: "ai_start",
    description: "開始當前角色卡對話"
  },
  {
    name: "ai_status",
    description: "查看目前 AI 對話狀態"
  },
  {
    name: "stop",
    description: "停止目前正在生成的 AI 回覆"
  },
  {
    name: "player_set",
    description: "把自己設定為指定玩家座位",
    options: [
      {
        name: "number",
        description: "玩家編號，例如 1 或 2",
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  {
    name: "reload",
    description: "依照不滿意之處重新生成最新 AI 回覆",
    options: [
      {
        name: "feedback",
        description: "描述目前回覆不好或需要改進的地方",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: "replay",
    description: "從指定訊息編號建立分支並重寫後續",
    options: [
      {
        name: "message_number",
        description: "要重寫的訊息編號（1 起算）",
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: "content",
        description: "新的使用者內容",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: "run_time",
    description: "依照要求自動推演多輪對話",
    options: [
      {
        name: "number",
        description: "要自動推演的輪數",
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: "message",
        description: "推演要求，例如劇情方向、互動重點或限制",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: "ai_help",
    description: "查看可用指令"
  },
  {
    name: "session_save",
    description: "保存目前整體對話存檔",
    options: [
      {
        name: "name",
        description: "存檔名稱",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  },
  {
    name: "session_list",
    description: "列出所有對話存檔"
  },
  {
    name: "session_load",
    description: "載入對話存檔",
    options: [
      {
        name: "id",
        description: "存檔 ID",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  }
];

function nowIso() {
  return new Date().toISOString();
}

function newId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultTurnState() {
  return {
    totalUserTurns: 0,
    updatedAt: nowIso()
  };
}

function createDefaultContextCompressionState() {
  return {
    enabled: true,
    summary: "",
    compressedThroughTurnNumber: 0,
    profiles: {},
    updatedAt: ""
  };
}

function createDefaultDiscordPlayerState(channelId = "") {
  return {
    channelId: safeText(channelId),
    assignments: {},
    updatedAt: ""
  };
}

function getCurrentCalendarYear() {
  const year = new Date().getFullYear();
  return Number.isFinite(year) && year > 0 ? year : 2026;
}

function isLeapYear(year = getCurrentCalendarYear()) {
  const normalizedYear = Math.floor(Number(year));
  return normalizedYear % 4 === 0 && (normalizedYear % 100 !== 0 || normalizedYear % 400 === 0);
}

function normalizeTimeTrackingYear(value, fallback = getCurrentCalendarYear()) {
  const normalized = Math.floor(Number(value));
  const fallbackYear = Math.floor(Number(fallback));
  if (Number.isFinite(normalized) && normalized >= 1 && normalized <= 9999) {
    return normalized;
  }
  return Number.isFinite(fallbackYear) && fallbackYear >= 1 && fallbackYear <= 9999
    ? fallbackYear
    : getCurrentCalendarYear();
}

function getMonthDayCount(month, year = getCurrentCalendarYear()) {
  const normalizedMonth = Math.floor(Number(month));
  if (![1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(normalizedMonth)) {
    return 31;
  }
  if (normalizedMonth === 2 && isLeapYear(year)) {
    return 29;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][normalizedMonth - 1];
}

function isValidMonthDate(month, date, year = getCurrentCalendarYear()) {
  const normalizedMonth = Math.floor(Number(month));
  const normalizedDate = Math.floor(Number(date));
  const normalizedYear = normalizeTimeTrackingYear(year);
  return normalizedMonth >= 1 &&
    normalizedMonth <= 12 &&
    normalizedDate >= 1 &&
    normalizedDate <= getMonthDayCount(normalizedMonth, normalizedYear);
}

function createRandomValidMonthDate(year = getCurrentCalendarYear()) {
  const normalizedYear = normalizeTimeTrackingYear(year);
  const month = Math.floor(Math.random() * 12) + 1;
  const date = Math.floor(Math.random() * getMonthDayCount(month, normalizedYear)) + 1;
  return { month, date };
}

function createDefaultTimeTrackingState() {
  const currentYear = getCurrentCalendarYear();
  const { month, date } = createRandomValidMonthDate(currentYear);
  return {
    enabled: true,
    currentDayNumber: 1,
    currentPeriod: TIME_PERIOD_MORNING,
    currentYear,
    currentMonth: month,
    currentDate: date,
    config: cloneData(DEFAULT_TIME_TRACKING_CONFIG, DEFAULT_TIME_TRACKING_CONFIG),
    updatedAt: nowIso()
  };
}

function createDefaultState() {
  return {
    userProfile: {
      identityText: "",
      displayName: ""
    },
    roleCards: [],
    roleCardRuntimeState: {},
    activeRoleCardId: null,
    activeAssistantMode: null,
    conversationSettings: {
      chatOutputModel: DEFAULT_CHAT_API_MODEL,
      dialogueContextRounds: DEFAULT_DIALOGUE_CONTEXT_ROUNDS
    },
    contextCompression: createDefaultContextCompressionState(),
    aiSessionStarted: false,
    pendingOpeningBroadcast: false,
    lastDiscordChannelId: "",
    discordPlayers: createDefaultDiscordPlayerState(),
    turnState: createDefaultTurnState(),
    timeTracking: createDefaultTimeTrackingState(),
    conversation: [],
    aiLogs: [],
    savedSessions: [],
    activeSavedSessionId: null,
    updatedAt: nowIso()
  };
}

function normalizeChatApiModelOption(value, fallback = DEFAULT_CHAT_API_MODEL) {
  return safeText(value) || fallback;
}

function normalizeConversationSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  const dialogueContextRounds = Number(source.dialogueContextRounds);
  return {
    chatOutputModel: normalizeChatApiModelOption(source.chatOutputModel, DEFAULT_CHAT_API_MODEL),
    dialogueContextRounds:
      Number.isFinite(dialogueContextRounds) && dialogueContextRounds > 0
        ? Math.floor(dialogueContextRounds)
        : DEFAULT_DIALOGUE_CONTEXT_ROUNDS
  };
}

function normalizeTimeTrackingWordList(value, fallback = []) {
  const source = Array.isArray(value)
    ? value
    : safeText(value).split(/[\n,，、;；|/／]+/u);
  const fallbackList = Array.isArray(fallback) ? fallback : [];
  const seen = new Set();
  const words = source
    .map((item) => safeText(item))
    .filter(Boolean)
    .filter((item) => {
      const key = item.normalize("NFKC").toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  return words.length > 0 ? words : [...fallbackList];
}

function normalizeTimePeriod(value = TIME_PERIOD_MORNING) {
  const normalized = safeText(value).toLowerCase();
  if (normalized === TIME_PERIOD_MORNING || normalized === "早" || normalized === "早上" || normalized === "morning") {
    return TIME_PERIOD_MORNING;
  }
  if (normalized === TIME_PERIOD_NOON || normalized === "午" || normalized === "中午" || normalized === "noon" || normalized === "afternoon") {
    return TIME_PERIOD_NOON;
  }
  if (normalized === TIME_PERIOD_EVENING || normalized === "晚" || normalized === "晚上" || normalized === "night" || normalized === "evening") {
    return TIME_PERIOD_EVENING;
  }
  return TIME_PERIOD_MORNING;
}

function normalizeTimeTrackingConfig(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  return {
    nextDayWords: normalizeTimeTrackingWordList(
      source.nextDayWords || source.dayWords || source.dayProgressWords,
      DEFAULT_TIME_TRACKING_CONFIG.nextDayWords
    ),
    connectorWords: normalizeTimeTrackingWordList(
      source.connectorWords || source.timeConnectorWords || source.matchWords,
      DEFAULT_TIME_TRACKING_CONFIG.connectorWords
    ),
    noChangeWords: normalizeTimeTrackingWordList(
      source.noChangeWords || source.blockWords || source.ignoreWords || source.preventWords,
      DEFAULT_TIME_TRACKING_CONFIG.noChangeWords
    ),
    morningWords: normalizeTimeTrackingWordList(
      source.morningWords || source.earlyWords,
      DEFAULT_TIME_TRACKING_CONFIG.morningWords
    ),
    noonWords: normalizeTimeTrackingWordList(
      source.noonWords || source.afternoonWords,
      DEFAULT_TIME_TRACKING_CONFIG.noonWords
    ),
    eveningWords: normalizeTimeTrackingWordList(
      source.eveningWords || source.nightWords,
      DEFAULT_TIME_TRACKING_CONFIG.eveningWords
    )
  };
}

function normalizeTimeTrackingState(input = {}) {
  const defaults = createDefaultTimeTrackingState();
  const source = input && typeof input === "object" ? input : {};
  const currentDayNumber = Math.floor(Number(source.currentDayNumber ?? source.dayNumber ?? source.day));
  const currentYear = normalizeTimeTrackingYear(source.currentYear ?? source.year, defaults.currentYear);
  const month = Math.floor(Number(source.currentMonth ?? source.month));
  const date = Math.floor(Number(source.currentDate ?? source.date ?? source.dayOfMonth));
  const fallbackMonth = isValidMonthDate(source.startMonth, source.startDate, currentYear)
    ? Math.floor(Number(source.startMonth))
    : defaults.currentMonth;
  const fallbackDate = isValidMonthDate(source.startMonth, source.startDate, currentYear)
    ? Math.floor(Number(source.startDate))
    : defaults.currentDate;
  const resolvedMonth = isValidMonthDate(month, date, currentYear) ? month : fallbackMonth;
  const resolvedDate = isValidMonthDate(month, date, currentYear) ? date : fallbackDate;
  return {
    enabled: source.enabled !== false,
    currentDayNumber: Number.isFinite(currentDayNumber) && currentDayNumber > 0 ? currentDayNumber : 1,
    currentPeriod: normalizeTimePeriod(source.currentPeriod || source.period || source.timeOfDay),
    currentYear,
    currentMonth: resolvedMonth,
    currentDate: resolvedDate,
    config: normalizeTimeTrackingConfig(source.config || source.rules || source),
    updatedAt: safeText(source.updatedAt) || defaults.updatedAt
  };
}

function normalizeContextCompressionState(input) {
  const source = input && typeof input === "object" ? input : {};
  const compressedThroughTurnNumber = Number(source.compressedThroughTurnNumber);
  const rawProfiles = source.profiles && typeof source.profiles === "object"
    ? source.profiles
    : source.profileStates && typeof source.profileStates === "object"
      ? source.profileStates
      : {};
  const profiles = Object.fromEntries(
    Object.entries(rawProfiles)
      .map(([id, value]) => [normalizeCompressionProfileId(id), normalizeCompressionProfileState(value)])
      .filter(([id]) => id && id !== STANDARD_COMPRESSION_PROFILE_ID)
  );
  return {
    enabled: true,
    summary: safeText(source.summary),
    compressedThroughTurnNumber:
      Number.isFinite(compressedThroughTurnNumber) && compressedThroughTurnNumber > 0
        ? Math.floor(compressedThroughTurnNumber)
        : 0,
    profiles,
    updatedAt: safeText(source.updatedAt)
  };
}

function normalizeDiscordPlayerSlot(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/\s+/g, "");
  const numberMatch = normalized.match(/^(?:user|玩家)?(\d+)$/u);
  if (numberMatch) {
    const number = Math.max(1, Math.floor(Number(numberMatch[1])));
    return `user${number}`;
  }
  if (normalized === "x" || normalized === "userx" || normalized === "other" || normalized === "others") {
    return MODEL_APPEND_PLAYER_OTHER;
  }
  return "";
}

function normalizeDiscordPlayerState(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const rawAssignments = source.assignments && typeof source.assignments === "object"
    ? source.assignments
    : source.players && typeof source.players === "object"
      ? source.players
      : {};
  const assignments = Object.fromEntries(
    Object.entries(rawAssignments)
      .map(([userId, slot]) => [safeText(userId), normalizeDiscordPlayerSlot(slot)])
      .filter(([userId, slot]) => userId && slot)
  );
  return {
    channelId: safeText(source.channelId || source.activeChannelId),
    assignments,
    updatedAt: safeText(source.updatedAt)
  };
}

function isContextCompressionEnabled(currentState = state) {
  return true;
}

function normalizeNonNegativeInteger(value, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized >= 0 ? Math.floor(normalized) : fallback;
}

function getMessageTurnNumber(message) {
  const direct = normalizeNonNegativeInteger(message?.turnNumber, 0);
  if (direct > 0) {
    return direct;
  }
  const nested = normalizeNonNegativeInteger(message?.extra?.turnNumber, 0);
  return nested > 0 ? nested : null;
}

function inferTurnCountFromConversation(conversation) {
  const normalized = Array.isArray(conversation) ? conversation : [];
  const explicitMax = normalized.reduce((max, message) => {
    const turnNumber = getMessageTurnNumber(message);
    return turnNumber ? Math.max(max, turnNumber) : max;
  }, 0);
  if (explicitMax > 0) {
    return explicitMax;
  }
  return normalized.filter((message) => message?.role === "user").length;
}

function normalizeTurnState(input, currentState = {}) {
  const source = input && typeof input === "object" ? input : {};
  const explicitTotal = normalizeNonNegativeInteger(source.totalUserTurns, 0);
  const conversationTotal = inferTurnCountFromConversation(currentState?.conversation);
  return {
    totalUserTurns: Math.max(explicitTotal, conversationTotal),
    updatedAt: safeText(source.updatedAt) || nowIso()
  };
}

function syncTurnStateFromConversation(currentState) {
  if (!currentState || typeof currentState !== "object") {
    return createDefaultTurnState();
  }
  const conversationTotal = inferTurnCountFromConversation(currentState.conversation);
  currentState.turnState = {
    totalUserTurns: conversationTotal,
    updatedAt: nowIso()
  };
  return currentState.turnState;
}

function resetTimeTrackingProgress(currentState) {
  if (!currentState || typeof currentState !== "object") {
    return;
  }
  const previousConfig = normalizeTimeTrackingState(currentState.timeTracking).config;
  currentState.timeTracking = {
    ...createDefaultTimeTrackingState(),
    config: previousConfig,
    updatedAt: nowIso()
  };
}

function resetConversationProgress(currentState) {
  if (!currentState || typeof currentState !== "object") {
    return;
  }
  currentState.conversation = [];
  currentState.turnState = createDefaultTurnState();
  resetTimeTrackingProgress(currentState);
}

function resetDiscordPlayerAssignments(currentState, channelId = "") {
  if (!currentState || typeof currentState !== "object") {
    return;
  }
  currentState.discordPlayers = {
    ...createDefaultDiscordPlayerState(channelId),
    updatedAt: nowIso()
  };
}

function normalizeAiUsage(input) {
  const source = input && typeof input === "object" ? input : {};
  const promptTokens = Number(source.promptTokens ?? source.prompt_tokens);
  const completionTokens = Number(source.completionTokens ?? source.completion_tokens);
  const totalTokens = Number(source.totalTokens ?? source.total_tokens);
  const promptCacheHitTokens = Number(source.promptCacheHitTokens ?? source.prompt_cache_hit_tokens);
  const promptCacheMissTokens = Number(source.promptCacheMissTokens ?? source.prompt_cache_miss_tokens);

  return {
    promptTokens: Number.isFinite(promptTokens) ? promptTokens : null,
    completionTokens: Number.isFinite(completionTokens) ? completionTokens : null,
    totalTokens: Number.isFinite(totalTokens) ? totalTokens : null,
    promptCacheHitTokens: Number.isFinite(promptCacheHitTokens) ? promptCacheHitTokens : null,
    promptCacheMissTokens: Number.isFinite(promptCacheMissTokens) ? promptCacheMissTokens : null
  };
}

function normalizeAssistantMode(value) {
  const normalized = safeText(value);
  return normalized === CHARACTER_CARD_CREATION_ASSISTANT_MODE
    ? CHARACTER_CARD_CREATION_ASSISTANT_MODE
    : null;
}

function isCharacterCardCreationAssistantMode(mode) {
  return normalizeAssistantMode(mode) === CHARACTER_CARD_CREATION_ASSISTANT_MODE;
}

function isCharacterCardCreationAssistantActive(currentState) {
  return isCharacterCardCreationAssistantMode(currentState?.activeAssistantMode);
}

function hasActiveConversationTarget(currentState) {
  return Boolean(currentState?.activeRoleCardId || isCharacterCardCreationAssistantActive(currentState));
}

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STATE_FILE)) {
    fs.writeFileSync(STATE_FILE, JSON.stringify(createDefaultState(), null, 2), "utf8");
  }
}

function extractCardState(currentState) {
  return {
    userProfile: normalizeUserProfile(currentState?.userProfile),
    roleCards: Array.isArray(currentState?.roleCards)
      ? currentState.roleCards.map((card) => normalizeRoleCard(card))
      : [],
    updatedAt: nowIso()
  };
}

function readPersistedCardStateFile() {
  ensureDataFile();
  if (!fs.existsSync(CARD_STATE_FILE)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(CARD_STATE_FILE, "utf8"));
  } catch {
    return null;
  }
}

function loadCardState() {
  const raw = readPersistedCardStateFile();
  if (!raw || typeof raw !== "object") {
    return null;
  }

  return {
    userProfile: normalizeUserProfile(raw.userProfile),
    roleCards: Array.isArray(raw.roleCards) ? raw.roleCards.map((card) => normalizeRoleCard(card)) : [],
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function persistCardState(currentState) {
  ensureDataFile();
  const payload = extractCardState(currentState);
  fs.writeFileSync(CARD_STATE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

function readPersistedStateFile() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

function verifyPersistedRoleCard(cardId, expectedFields = {}) {
  try {
    const persisted = readPersistedCardStateFile() || readPersistedStateFile();
    const persistedCard = Array.isArray(persisted?.roleCards)
      ? persisted.roleCards.find((card) => safeText(card?.id) === safeText(cardId))
      : null;
    if (!persistedCard) {
      return { ok: false, reason: "角色卡未寫入到資料檔" };
    }

    const mismatched = Object.entries(expectedFields).filter(([field, expectedValue]) => {
      const actualValue = field === "relationships"
        ? normalizeRoleCardRelationships(persistedCard[field])
        : field === "lorebooks"
          ? JSON.stringify(normalizeRoleCardLorebooks(persistedCard[field]))
          : field === "customSections"
            ? JSON.stringify(normalizeRoleCardCustomSections(persistedCard[field], persistedCard))
          : safeText(persistedCard[field]);
      return actualValue !== safeText(expectedValue);
    });

    if (mismatched.length > 0) {
      return {
        ok: false,
        reason: `角色卡寫入後校驗失敗：${mismatched.map(([field]) => field).join("、")}`
      };
    }

    const corruptedFields = findRoleCardCorruptedFields({
      name: persistedCard.name,
      personality: persistedCard.personality,
      scene: persistedCard.scene,
      systemInstruction: persistedCard.systemInstruction,
      description: persistedCard.description,
      relationships: normalizeRoleCardRelationships(persistedCard.relationships),
      openingDialogue: persistedCard.openingDialogue,
      customSections: JSON.stringify(normalizeRoleCardCustomSections(persistedCard.customSections, persistedCard)),
      lorebooks: JSON.stringify(normalizeRoleCardLorebooks(persistedCard.lorebooks))
    });

    if (corruptedFields.length > 0) {
      return {
        ok: false,
        reason: `角色卡落盤後出現損壞字元：${corruptedFields.join("、")}`
      };
    }

    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: `角色卡寫入後校驗失敗：${safeText(error?.message) || "未知錯誤"}`
    };
  }
}

function loadState() {
  ensureDataFile();
  const raw = fs.readFileSync(STATE_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    const persistedCardState = loadCardState();
    const defaults = createDefaultState();
    const merged = {
      ...defaults,
      userProfile: normalizeUserProfile({
        ...defaults.userProfile,
        ...(parsed.userProfile || {})
      }),
      roleCards: Array.isArray(parsed.roleCards) ? parsed.roleCards.map((card) => normalizeRoleCard(card)) : [],
      roleCardRuntimeState: normalizeRoleCardRuntimeStateMap(parsed.roleCardRuntimeState),
      activeRoleCardId: safeText(parsed.activeRoleCardId) || null,
      activeAssistantMode: normalizeAssistantMode(parsed.activeAssistantMode),
      conversationSettings: normalizeConversationSettings(parsed.conversationSettings),
      contextCompression: normalizeContextCompressionState(parsed.contextCompression),
      timeTracking: normalizeTimeTrackingState(parsed.timeTracking),
      aiSessionStarted: Boolean(parsed.aiSessionStarted),
      pendingOpeningBroadcast: Boolean(parsed.pendingOpeningBroadcast),
      lastDiscordChannelId: safeText(parsed.lastDiscordChannelId),
      discordPlayers: normalizeDiscordPlayerState(parsed.discordPlayers),
      conversation: Array.isArray(parsed.conversation) ? cloneData(parsed.conversation, []) : [],
      aiLogs: Array.isArray(parsed.aiLogs) ? parsed.aiLogs.map((entry) => normalizeAiLog(entry)) : [],
      activeSavedSessionId: null
    };
    merged.turnState = normalizeTurnState(parsed.turnState, merged);

    if (persistedCardState) {
      merged.userProfile = normalizeUserProfile({
        ...merged.userProfile,
        ...persistedCardState.userProfile
      });
      merged.roleCards = Array.isArray(persistedCardState.roleCards)
        ? persistedCardState.roleCards.map((card) => normalizeRoleCard(card))
        : merged.roleCards;
    }

    merged.savedSessions = (Array.isArray(parsed.savedSessions) ? parsed.savedSessions : []).map(
      (session, index) => normalizeSavedSession(session, index)
    );
    if (!merged.roleCards.some((card) => card.id === merged.activeRoleCardId)) {
      merged.activeRoleCardId = null;
    }
    if (merged.activeAssistantMode) {
      merged.activeRoleCardId = null;
    }
    const validRoleCardIds = new Set(merged.roleCards.map((card) => card.id));
    merged.roleCardRuntimeState = Object.fromEntries(
      Object.entries(merged.roleCardRuntimeState).filter(([cardId]) => validRoleCardIds.has(cardId))
    );
    merged.activeSavedSessionId = null;
    return merged;
  } catch {
    return createDefaultState();
  }
}

function saveState(state) {
  state.turnState = normalizeTurnState(state.turnState, state);
  state.discordPlayers = normalizeDiscordPlayerState(state.discordPlayers);
  state.timeTracking = normalizeTimeTrackingState(state.timeTracking);
  state.activeSavedSessionId = null;
  state.updatedAt = nowIso();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  persistCardState(state);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload), "utf8");
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function beginNdjsonStream(res, status = 200) {
  res.writeHead(status, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  });
}

function writeNdjsonEvent(res, payload) {
  if (!res || res.destroyed || res.writableEnded) {
    return;
  }
  try {
    res.write(`${JSON.stringify(payload)}\n`);
  } catch (error) {
    console.warn(`NDJSON 寫入失敗：${safeText(error?.message) || "連線可能已關閉"}`);
  }
}

function safeText(input) {
  return typeof input === "string" ? input.trim() : "";
}

function containsReplacementCharacter(input) {
  return safeText(input).includes("�");
}

function findRoleCardCorruptedFields(fields = {}) {
  return Object.entries(fields)
    .filter(([, value]) => containsReplacementCharacter(value))
    .map(([key]) => key);
}

function cloneData(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function captureRuntimeSnapshot(currentState) {
  return {
    userProfile: cloneData(currentState.userProfile, createDefaultState().userProfile),
    roleCards: cloneData(currentState.roleCards, []).map((card) => normalizeRoleCard(card)),
    roleCardRuntimeState: normalizeRoleCardRuntimeStateMap(currentState.roleCardRuntimeState),
    activeRoleCardId: currentState.activeRoleCardId || null,
    activeAssistantMode: normalizeAssistantMode(currentState.activeAssistantMode),
    conversationSettings: normalizeConversationSettings(currentState.conversationSettings),
    contextCompression: normalizeContextCompressionState(currentState.contextCompression),
    timeTracking: normalizeTimeTrackingState(currentState.timeTracking),
    aiSessionStarted: Boolean(currentState.aiSessionStarted),
    pendingOpeningBroadcast: Boolean(currentState.pendingOpeningBroadcast),
    lastDiscordChannelId: safeText(currentState.lastDiscordChannelId),
    discordPlayers: normalizeDiscordPlayerState(currentState.discordPlayers),
    turnState: normalizeTurnState(currentState.turnState, currentState),
    conversation: cloneData(currentState.conversation, []),
    aiLogs: cloneData(currentState.aiLogs, [])
  };
}

function captureNarrativeCheckpoint(currentState) {
  return {
    activeRoleCardId: currentState.activeRoleCardId || null,
    activeAssistantMode: normalizeAssistantMode(currentState.activeAssistantMode),
    conversationSettings: normalizeConversationSettings(currentState.conversationSettings),
    contextCompression: normalizeContextCompressionState(currentState.contextCompression),
    timeTracking: normalizeTimeTrackingState(currentState.timeTracking),
    roleCardRuntimeState: normalizeRoleCardRuntimeStateMap(currentState.roleCardRuntimeState),
    turnState: normalizeTurnState(currentState.turnState, currentState)
  };
}

function applyNarrativeCheckpoint(currentState, checkpoint) {
  const source = checkpoint && typeof checkpoint === "object" ? checkpoint : {};
  currentState.activeRoleCardId = safeText(source.activeRoleCardId) || null;
  currentState.activeAssistantMode = normalizeAssistantMode(source.activeAssistantMode);
  delete currentState.conversationMode;
  currentState.conversationSettings = normalizeConversationSettings(source.conversationSettings);
  currentState.contextCompression = normalizeContextCompressionState(source.contextCompression);
  currentState.timeTracking = normalizeTimeTrackingState(source.timeTracking);
  if (currentState.activeAssistantMode) {
    currentState.activeRoleCardId = null;
  }
  currentState.roleCardRuntimeState = normalizeRoleCardRuntimeStateMap(source.roleCardRuntimeState);
  currentState.turnState = normalizeTurnState(source.turnState, currentState);
}

function getMessageStateBeforeTurnSnapshot(message) {
  const snapshot = message?.stateBeforeTurnSnapshot;
  return snapshot && typeof snapshot === "object" ? cloneData(snapshot, null) : null;
}

function getMessageStateAfterTurnSnapshot(message) {
  const snapshot = message?.stateAfterTurnSnapshot;
  return snapshot && typeof snapshot === "object" ? cloneData(snapshot, null) : null;
}

function restoreNarrativeStateForReplay(currentState, targetMessageIndex) {
  const conversation = Array.isArray(currentState.conversation) ? currentState.conversation : [];
  const targetMessage = conversation[targetMessageIndex];
  const directBeforeSnapshot = getMessageStateBeforeTurnSnapshot(targetMessage);

  if (directBeforeSnapshot) {
    applyNarrativeCheckpoint(currentState, directBeforeSnapshot);
    return;
  }

  for (let index = targetMessageIndex - 1; index >= 0; index -= 1) {
    const afterSnapshot = getMessageStateAfterTurnSnapshot(conversation[index]);
    if (afterSnapshot) {
      applyNarrativeCheckpoint(currentState, afterSnapshot);
      return;
    }

    const beforeSnapshot = getMessageStateBeforeTurnSnapshot(conversation[index]);
    if (beforeSnapshot) {
      applyNarrativeCheckpoint(currentState, beforeSnapshot);
      return;
    }
  }

  resetGeneratedBackendContextPreservingManual(currentState);
}

function applyRuntimeSnapshot(currentState, snapshot) {
  const defaults = createDefaultState();
  const source = snapshot && typeof snapshot === "object" ? snapshot : {};

  currentState.userProfile = normalizeUserProfile({
    ...defaults.userProfile,
    ...(source.userProfile || {})
  });
  currentState.roleCards = Array.isArray(source.roleCards)
    ? cloneData(source.roleCards, []).map((card) => normalizeRoleCard(card))
    : [];
  currentState.roleCardRuntimeState = normalizeRoleCardRuntimeStateMap(source.roleCardRuntimeState);
  const validRoleCardIds = new Set(currentState.roleCards.map((card) => card.id));
  currentState.roleCardRuntimeState = Object.fromEntries(
    Object.entries(currentState.roleCardRuntimeState).filter(([cardId]) => validRoleCardIds.has(cardId))
  );
  currentState.activeRoleCardId = safeText(source.activeRoleCardId) || null;
  currentState.activeAssistantMode = normalizeAssistantMode(source.activeAssistantMode);
  delete currentState.conversationMode;
  currentState.conversationSettings = normalizeConversationSettings(source.conversationSettings);
  currentState.contextCompression = normalizeContextCompressionState(source.contextCompression);
  currentState.timeTracking = normalizeTimeTrackingState(source.timeTracking);
  if (!currentState.roleCards.some((card) => card.id === currentState.activeRoleCardId)) {
    currentState.activeRoleCardId = null;
  }
  currentState.aiSessionStarted = Boolean(source.aiSessionStarted);
  currentState.pendingOpeningBroadcast = Boolean(source.pendingOpeningBroadcast);
  currentState.lastDiscordChannelId = safeText(source.lastDiscordChannelId);
  currentState.discordPlayers = normalizeDiscordPlayerState(source.discordPlayers);
  currentState.conversation = Array.isArray(source.conversation)
    ? cloneData(source.conversation, [])
    : [];
  currentState.aiLogs = Array.isArray(source.aiLogs)
    ? source.aiLogs.map((entry) => normalizeAiLog(entry))
    : [];
  currentState.turnState = normalizeTurnState(source.turnState, currentState);
}

function ensureSavedSessionsDir() {
  fs.mkdirSync(SAVED_SESSIONS_DIR, { recursive: true });
}

function getSavedSessionDataFileName(sessionId = "") {
  const normalizedId = safeText(sessionId).replace(/[^a-zA-Z0-9_-]/g, "_") || "unknown";
  return `${normalizedId}.json`;
}

function getSavedSessionDataFilePath(sessionOrId) {
  const sessionId = typeof sessionOrId === "string" ? sessionOrId : sessionOrId?.id;
  ensureSavedSessionsDir();
  return path.join(SAVED_SESSIONS_DIR, getSavedSessionDataFileName(sessionId));
}

function stripRuntimeSnapshotHistory(snapshot = {}) {
  const output = cloneData(snapshot, {});
  output.conversation = [];
  output.aiLogs = [];
  return output;
}

function readSavedSessionExternalData(session) {
  const fallback = {
    conversation: Array.isArray(session?.snapshot?.conversation)
      ? cloneData(session.snapshot.conversation, [])
      : [],
    aiLogs: Array.isArray(session?.snapshot?.aiLogs)
      ? cloneData(session.snapshot.aiLogs, [])
      : []
  };
  try {
    const filePath = getSavedSessionDataFilePath(session);
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return {
      conversation: Array.isArray(parsed.conversation)
        ? cloneData(parsed.conversation, [])
        : fallback.conversation,
      aiLogs: Array.isArray(parsed.aiLogs)
        ? parsed.aiLogs.map((entry) => normalizeAiLog(entry))
        : fallback.aiLogs
    };
  } catch (error) {
    console.warn(`讀取存檔對話分離檔失敗：${safeText(error?.message) || "未知錯誤"}`);
    return fallback;
  }
}

function writeSavedSessionExternalData(sessionOrId, data = {}) {
  const sessionId = typeof sessionOrId === "string" ? sessionOrId : sessionOrId?.id;
  if (!sessionId) {
    return;
  }
  const payload = {
    conversation: Array.isArray(data.conversation) ? cloneData(data.conversation, []) : [],
    aiLogs: Array.isArray(data.aiLogs) ? data.aiLogs.map((entry) => normalizeAiLog(entry)) : [],
    updatedAt: nowIso()
  };
  fs.writeFileSync(getSavedSessionDataFilePath(sessionId), JSON.stringify(payload, null, 2), "utf8");
}

function materializeSavedSessionSnapshot(session) {
  const snapshot = cloneData(session?.snapshot, {});
  const externalData = readSavedSessionExternalData(session);
  snapshot.conversation = externalData.conversation;
  snapshot.aiLogs = externalData.aiLogs;
  return snapshot;
}

function mergeConversationWithRuntimeTail(existingConversation = [], runtimeConversation = []) {
  const existing = Array.isArray(existingConversation) ? cloneData(existingConversation, []) : [];
  const runtime = Array.isArray(runtimeConversation) ? cloneData(runtimeConversation, []) : [];
  if (runtime.length === 0) {
    return existing;
  }
  if (existing.length === 0) {
    return runtime;
  }

  const firstRuntimeId = safeText(runtime[0]?.id);
  if (firstRuntimeId) {
    const startIndex = existing.findIndex((message) => safeText(message?.id) === firstRuntimeId);
    if (startIndex >= 0) {
      return [...existing.slice(0, startIndex), ...runtime];
    }
  }

  const knownIds = new Set(existing.map((message) => safeText(message?.id)).filter(Boolean));
  const missingRuntimeMessages = runtime.filter((message) => {
    const id = safeText(message?.id);
    return !id || !knownIds.has(id);
  });
  return [...existing, ...missingRuntimeMessages];
}

function mergeAiLogsById(existingLogs = [], runtimeLogs = []) {
  const output = (Array.isArray(existingLogs) ? existingLogs : []).map((entry) => normalizeAiLog(entry));
  const indexById = new Map(output.map((entry, index) => [safeText(entry.id), index]).filter(([id]) => id));
  (Array.isArray(runtimeLogs) ? runtimeLogs : []).forEach((entry) => {
    const normalized = normalizeAiLog(entry);
    const id = safeText(normalized.id);
    if (id && indexById.has(id)) {
      output[indexById.get(id)] = normalized;
      return;
    }
    if (id) {
      indexById.set(id, output.length);
    }
    output.push(normalized);
  });
  return output;
}

function appendSavedSessionExternalMessage(session, message) {
  if (!session || !message) {
    return;
  }
  const externalData = readSavedSessionExternalData(session);
  externalData.conversation.push(cloneData(message, message));
  writeSavedSessionExternalData(session, externalData);
}

function appendSavedSessionExternalAiLog(session, entry) {
  if (!session || !entry) {
    return;
  }
  const externalData = readSavedSessionExternalData(session);
  externalData.aiLogs.push(normalizeAiLog(entry));
  writeSavedSessionExternalData(session, externalData);
}

function normalizeSavedSession(rawSession, index) {
  const now = nowIso();
  const source = rawSession && typeof rawSession === "object" ? rawSession : {};
  const snapshot = source.snapshot && typeof source.snapshot === "object" ? source.snapshot : source;
  const normalizedState = createDefaultState();
  applyRuntimeSnapshot(normalizedState, snapshot);
  const id = safeText(source.id) || newId("session");
  const fullSnapshot = captureRuntimeSnapshot(normalizedState);
  const externalFilePath = getSavedSessionDataFilePath(id);
  if (
    !fs.existsSync(externalFilePath) &&
    (fullSnapshot.conversation.length > 0 || fullSnapshot.aiLogs.length > 0)
  ) {
    writeSavedSessionExternalData(id, fullSnapshot);
  }

  return {
    id,
    name: safeText(source.name) || `對話存檔 ${index + 1}`,
    status: safeText(source.status) === "archived" ? "archived" : "active",
    dataFile: getSavedSessionDataFileName(id),
    snapshot: stripRuntimeSnapshotHistory(fullSnapshot),
    createdAt: safeText(source.createdAt) || now,
    updatedAt: safeText(source.updatedAt) || now
  };
}

function buildSavedSessionSummary(session) {
  const roleCardId = session.snapshot?.activeRoleCardId || null;
  const externalData = readSavedSessionExternalData(session);
  const roleCard = Array.isArray(session.snapshot?.roleCards)
    ? session.snapshot.roleCards.find((card) => safeText(card?.id) === safeText(roleCardId))
    : null;
  const assistantMode = normalizeAssistantMode(session.snapshot?.activeAssistantMode);
  return {
    id: session.id,
    name: session.name,
    status: session.status,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    roleCardId,
    roleCardName: assistantMode || safeText(roleCard?.name) || "未指定角色卡",
    assistantMode,
    messageCount: externalData.conversation.length
  };
}

function listSavedSessionSummaries(currentState) {
  return currentState.savedSessions.map((session) => buildSavedSessionSummary(session));
}

function getSavedSessionById(currentState, sessionId) {
  return currentState.savedSessions.find((session) => session.id === sessionId) || null;
}

function syncActiveSavedSession(currentState) {
  currentState.activeSavedSessionId = null;
}

function createSavedSessionFromCurrentState(currentState, nameInput = "", options = {}) {
  const now = nowIso();
  const sessionId = newId("session");
  let snapshotSource = captureRuntimeSnapshot(currentState);

  const session = {
    id: sessionId,
    name: safeText(nameInput) || `對話存檔 ${currentState.savedSessions.length + 1}`,
    status: "active",
    dataFile: getSavedSessionDataFileName(sessionId),
    snapshot: stripRuntimeSnapshotHistory(snapshotSource),
    createdAt: now,
    updatedAt: now
  };
  writeSavedSessionExternalData(session, snapshotSource);
  currentState.savedSessions.push(session);
  currentState.activeSavedSessionId = null;
  return session;
}

function loadSavedSessionIntoRuntime(currentState, sessionId, options = {}) {
  const session = getSavedSessionById(currentState, sessionId);
  if (!session) {
    return null;
  }

  applyRuntimeSnapshot(currentState, materializeSavedSessionSnapshot(session));
  currentState.activeSavedSessionId = null;

  return session;
}

function setSavedSessionStatus(currentState, sessionId, status) {
  const session = getSavedSessionById(currentState, sessionId);
  if (!session) {
    return null;
  }

  session.status = status;
  session.updatedAt = nowIso();
  if (status === "archived" && currentState.activeSavedSessionId === sessionId) {
    currentState.activeSavedSessionId = null;
  }
  return session;
}

function deleteSavedSession(currentState, sessionId) {
  const index = currentState.savedSessions.findIndex((session) => session.id === sessionId);
  if (index < 0) {
    return null;
  }

  const [deleted] = currentState.savedSessions.splice(index, 1);
  try {
    const filePath = getSavedSessionDataFilePath(deleted);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.warn(`刪除存檔對話分離檔失敗：${safeText(error?.message) || "未知錯誤"}`);
  }
  if (currentState.activeSavedSessionId === sessionId) {
    currentState.activeSavedSessionId = null;
  }
  return deleted;
}

function deleteRoleCard(currentState, cardId) {
  const index = currentState.roleCards.findIndex((card) => card.id === cardId);
  if (index < 0) {
    return null;
  }

  const [deleted] = currentState.roleCards.splice(index, 1);
  if (currentState.roleCardRuntimeState && typeof currentState.roleCardRuntimeState === "object") {
    delete currentState.roleCardRuntimeState[cardId];
  }
  if (currentState.activeRoleCardId === cardId) {
    currentState.activeRoleCardId = null;
    currentState.aiSessionStarted = false;
    currentState.pendingOpeningBroadcast = false;
    currentState.lastDiscordChannelId = "";
    resetConversationProgress(currentState);
    resetGeneratedBackendContextPreservingManual(currentState);
  }
  return deleted;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on("data", (chunk) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(bufferChunk);
      totalLength += bufferChunk.length;
      if (totalLength > 12 * 1024 * 1024) {
        reject(new Error("請求內容過大"));
      }
    });

    req.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }

      try {
        const data = Buffer.concat(chunks).toString("utf8");
        resolve(JSON.parse(data));
      } catch {
        reject(new Error("JSON 格式錯誤"));
      }
    });

    req.on("error", reject);
  });
}

function getContentType(filePath) {
  if (filePath.endsWith(".html")) {
    return "text/html; charset=utf-8";
  }
  if (filePath.endsWith(".css")) {
    return "text/css; charset=utf-8";
  }
  if (filePath.endsWith(".js")) {
    return "application/javascript; charset=utf-8";
  }
  if (filePath.endsWith(".json")) {
    return "application/json; charset=utf-8";
  }
  if (filePath.endsWith(".woff2")) {
    return "font/woff2";
  }
  if (filePath.endsWith(".png")) {
    return "image/png";
  }
  if (filePath.endsWith(".gif")) {
    return "image/gif";
  }
  if (filePath.endsWith(".cur")) {
    return "image/x-icon";
  }
  return "application/octet-stream";
}

function getStaticHeaders(filePath) {
  const headers = { "Content-Type": getContentType(filePath) };
  if (/\.(?:woff2|png|gif|cur)$/i.test(filePath)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "no-cache";
  }
  return headers;
}

function getActiveRoleCard(state) {
  const baseCard = getStoredRoleCardById(state, state.activeRoleCardId);
  if (!baseCard) {
    return null;
  }
  return mergeRoleCardWithRuntimeState(baseCard, getRoleCardRuntimeStateEntry(state, baseCard.id));
}

function getStoredRoleCardById(state, cardId) {
  return (Array.isArray(state?.roleCards) ? state.roleCards : []).find((card) => card.id === cardId) || null;
}

function normalizeRoleCardRuntimeStateEntry(input) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    personalityAdditions: safeText(raw.personalityAdditions || raw.personality),
    scene: safeText(raw.scene),
    systemInstruction: safeText(raw.systemInstruction),
    description: safeText(raw.description),
    relationships: normalizeRoleCardRelationships(raw.relationships),
    lorebookRuntime: normalizeRoleCardLorebookRuntimeMap(raw.lorebookRuntime),
    lorebookLastSyncTurn: normalizeNonNegativeInteger(raw.lorebookLastSyncTurn, 0),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function normalizeRoleCardLorebookRuntimeEntry(input) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    activeUntilTurn: normalizeNonNegativeInteger(raw.activeUntilTurn, 0),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function normalizeRoleCardLorebookRuntimeMap(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  return Object.entries(source).reduce((acc, [entryId, value]) => {
    const normalizedId = safeText(entryId);
    if (!normalizedId) {
      return acc;
    }
    acc[normalizedId] = normalizeRoleCardLorebookRuntimeEntry(value);
    return acc;
  }, {});
}

function normalizeRoleCardRuntimeStateMap(input) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  return Object.entries(source).reduce((acc, [cardId, value]) => {
    const normalizedId = safeText(cardId);
    if (!normalizedId) {
      return acc;
    }
    acc[normalizedId] = normalizeRoleCardRuntimeStateEntry(value);
    return acc;
  }, {});
}

function getRoleCardRuntimeStateEntry(state, cardId) {
  const normalizedId = safeText(cardId);
  if (!normalizedId) {
    return null;
  }
  const map = state?.roleCardRuntimeState;
  if (!map || typeof map !== "object") {
    return null;
  }
  return normalizeRoleCardRuntimeStateEntry(map[normalizedId]);
}

function ensureRoleCardRuntimeStateEntry(state, cardId) {
  const normalizedId = safeText(cardId);
  if (!normalizedId) {
    return null;
  }
  if (!state.roleCardRuntimeState || typeof state.roleCardRuntimeState !== "object") {
    state.roleCardRuntimeState = {};
  }
  const existing = normalizeRoleCardRuntimeStateEntry(state.roleCardRuntimeState[normalizedId]);
  state.roleCardRuntimeState[normalizedId] = existing;
  return state.roleCardRuntimeState[normalizedId];
}

function mergeRoleCardWithRuntimeState(baseCard, runtimeState) {
  const base = normalizeRoleCard(baseCard);
  const runtime = runtimeState ? normalizeRoleCardRuntimeStateEntry(runtimeState) : null;
  if (!runtime) {
    return base;
  }
  return {
    ...base,
    personality: mergeBaseAndRuntimePersonality(base.personality, runtime.personalityAdditions),
    scene: safeText(runtime.scene) || base.scene,
    systemInstruction: safeText(runtime.systemInstruction) || base.systemInstruction,
    description: safeText(runtime.description) || base.description,
    relationships: safeText(runtime.relationships) || base.relationships
  };
}

function mergeBaseAndRuntimePersonality(basePersonality = "", runtimeAdditions = "") {
  const base = safeText(basePersonality);
  const additions = safeText(runtimeAdditions);
  if (!base) {
    return additions;
  }
  if (!additions) {
    return base;
  }
  return `${base}\n【新增性格】${additions}`;
}

function isClearRuntimePersonalityDirective(value = "") {
  const normalized = safeText(value).replace(/\s+/g, "");
  return (
    normalized === "無" ||
    normalized === "无" ||
    normalized === "清空" ||
    normalized === "刪除" ||
    normalized === "删除" ||
    normalized === "none" ||
    normalized === "null" ||
    normalized === "（無）" ||
    normalized === "(無)"
  );
}

function normalizeUserProfile(input) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    identityText: safeText(raw.identityText),
    displayName: safeText(raw.displayName)
  };
}

function splitLorebookKeywords(value) {
  if (Array.isArray(value)) {
    return dedupeStringArray(value.map((item) => safeText(item)).filter(Boolean));
  }
  return dedupeStringArray(
    safeText(value)
      .split(/[\n,，、;；|/／]+/)
      .map((item) => safeText(item))
      .filter(Boolean)
  );
}

function splitLorebookLinkTargets(value) {
  if (Array.isArray(value)) {
    return dedupeStringArray(value.map((item) => safeText(item)).filter(Boolean));
  }
  return dedupeStringArray(
    safeText(value)
      .split(/[\n,，、;；|/／]+/)
      .map((item) => safeText(item))
      .filter(Boolean)
  );
}

function normalizeRoleCardLorebookEntry(input) {
  const source = input && typeof input === "object" ? input : {};
  const key = safeText(source.key || source.title || source.name || source.標題 || source.名稱);
  const content = safeText(source.content || source.text || source.內容);
  const keywords = splitLorebookKeywords(
    source.keywords ?? source.keyword ?? source.關鍵字 ?? source["关键词"]
  );
  return {
    id: safeText(source.id) || newId("lore"),
    key,
    keywords,
    content,
    enabled: source.enabled !== false,
    activation: {
      activeTurns: 0,
      onCloseActivate: []
    },
    createdAt: safeText(source.createdAt) || nowIso(),
    updatedAt: safeText(source.updatedAt) || nowIso()
  };
}

function normalizeRoleCardLorebooks(input) {
  const items = Array.isArray(input) ? input : [];
  return items
    .map((item) => normalizeRoleCardLorebookEntry(item))
    .filter((item) => {
      return item.key && item.content && item.keywords.length > 0;
    });
}

function normalizeRoleCardCustomSection(input) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    id: safeText(raw.id) || newId("section"),
    name: safeText(raw.name || raw.title || raw.key || raw.label),
    content: safeText(raw.content || raw.text || raw.value),
    createdAt: safeText(raw.createdAt) || nowIso(),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function buildLegacyRoleCardCustomSections(raw = {}) {
  return [
    { name: "性格", content: safeText(raw.personality) },
    { name: "場景", content: safeText(raw.scene) },
    { name: "系統指令", content: safeText(raw.systemInstruction) },
    { name: "詳細描述", content: safeText(raw.description) },
    { name: "人物關係（純文字）", content: normalizeRoleCardRelationships(raw.relationships) }
  ]
    .filter((item) => item.content)
    .map((item) => normalizeRoleCardCustomSection(item));
}

function normalizeRoleCardCustomSections(input, raw = {}) {
  const sections = Array.isArray(input)
    ? input.map((item) => normalizeRoleCardCustomSection(item)).filter((item) => item.name || item.content)
    : [];
  return sections.length > 0 ? sections : buildLegacyRoleCardCustomSections(raw);
}

function getRoleCardCustomSectionValue(roleCard, names = []) {
  const normalizedNames = new Set((Array.isArray(names) ? names : [names]).map((item) => safeText(item)));
  return normalizeRoleCardCustomSections(roleCard?.customSections, roleCard)
    .find((section) => normalizedNames.has(section.name))?.content || "";
}

function normalizeRoleCard(input) {
  const raw = input && typeof input === "object" ? input : {};
  const customSections = normalizeRoleCardCustomSections(raw.customSections, raw);
  return {
    id: safeText(raw.id) || newId("card"),
    name: safeText(raw.name),
    mode: normalizeRoleCardMode(raw.mode),
    coverImage: safeText(raw.coverImage),
    coverPosition: normalizeCoverPosition(raw.coverPosition),
    customSections,
    personality: getRoleCardCustomSectionValue({ customSections }, "性格"),
    scene: getRoleCardCustomSectionValue({ customSections }, "場景"),
    systemInstruction: getRoleCardCustomSectionValue({ customSections }, "系統指令"),
    description: getRoleCardCustomSectionValue({ customSections }, "詳細描述"),
    relationships: getRoleCardCustomSectionValue({ customSections }, "人物關係（純文字）"),
    openingDialogue: safeText(raw.openingDialogue),
    lorebooks: normalizeRoleCardLorebooks(raw.lorebooks),
    createdAt: safeText(raw.createdAt) || nowIso(),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function normalizeCoverPosition(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/\s+/g, " ");
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

function normalizeRoleCardRelationships(value) {
  if (typeof value === "string") {
    return safeText(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === "string") {
          return safeText(item);
        }
        return safeText(JSON.stringify(item));
      })
      .filter(Boolean)
      .join("\n");
  }

  if (value && typeof value === "object") {
    return safeText(JSON.stringify(value));
  }

  return "";
}

function normalizeRoleCardMode(value) {
  const normalized = safeText(value)
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

function normalizeCompressionProfileId(value = "") {
  const normalized = safeText(value)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || STANDARD_COMPRESSION_PROFILE_ID;
}

function parseIntegerList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => safeText(item))
      .filter(Boolean)
      .map((item) => Math.floor(Number(item)))
      .filter((item) => Number.isFinite(item) && item >= 0);
  }
  return safeText(value)
    .split(/[\s,，、;；]+/u)
    .map((item) => safeText(item))
    .filter(Boolean)
    .map((item) => Math.floor(Number(item)))
    .filter((item) => Number.isFinite(item) && item >= 0);
}

function parseKeywordList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => safeText(item)).filter(Boolean);
  }
  return safeText(value)
    .split(/[\n,，、;；]+/u)
    .map((item) => safeText(item))
    .filter(Boolean);
}

function normalizeKeywordTriggerSource(value = "") {
  const normalized = safeText(value).toLowerCase();
  if (normalized === "user" || normalized === "assistant" || normalized === "both") {
    return normalized;
  }
  return "both";
}

function normalizeCompressionTriggerConfig(input = {}, options = {}) {
  const source = input && typeof input === "object" ? input : {};
  const legacyKeywords = source.keywords ?? source.keyword ?? source.triggerKeywords;
  const legacyTurns = source.turns ?? source.scheduledTurns ?? source.rounds;
  return {
    roundLimit: Boolean(source.roundLimit ?? source.onRoundLimit ?? options.defaultRoundLimit),
    keywords: parseKeywordList(legacyKeywords),
    keywordSource: normalizeKeywordTriggerSource(source.keywordSource || source.source),
    turns: [...new Set(parseIntegerList(legacyTurns))].sort((a, b) => a - b)
  };
}

function normalizeModelTriggerAction(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/[-\s]+/g, "_");
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

function normalizeModelAppendTermConfig(input = {}, index = 0) {
  const source = input && typeof input === "object" ? input : {};
  const player = source.player ?? source.target ?? source.user ?? source.slot ?? "";
  return {
    id: safeText(source.id || source.key) || `append_term_${index + 1}`,
    enabled: source.enabled !== false,
    player: normalizeDiscordPlayerSlot(player),
    content: safeText(source.content || source.text || source.appendText || source.prompt)
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
  return rawTerms
    .map((item, index) => normalizeModelAppendTermConfig(item, index))
    .filter((item) => item.id);
}

function normalizeCompressionTriggerActionConfig(input = {}, index = 0, options = {}) {
  const source = input && typeof input === "object" ? input : {};
  const triggers = normalizeCompressionTriggerConfig(
    source.triggers || source.trigger || source.conditions || source.condition || source,
    { defaultRoundLimit: Boolean(options.defaultRoundLimit) }
  );
  const action = normalizeModelTriggerAction(source.action || source.processingAction || source.afterTriggerAction);
  return {
    id: safeText(source.id || source.key) || `trigger_action_${index + 1}`,
    name: safeText(source.name || source.title || source.label) || `觸發組合 ${index + 1}`,
    enabled: source.enabled !== false,
    action,
    skipReasoner: action === MODEL_TRIGGER_ACTION_CALL_API &&
      Boolean(source.skipReasoner || source.skipResponse || source.noReasoner || source.skipChat),
    triggers
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
    skipReasoner: false,
    triggers: Object.keys(legacyTriggers).length > 0
      ? legacyTriggers
      : { roundLimit: Boolean(options.defaultRoundLimit) }
  };
  const sourceActions = rawActions.length > 0 ? rawActions : [fallbackAction];
  return sourceActions
    .map((item, index) => normalizeCompressionTriggerActionConfig(item, index, {
      defaultRoundLimit: Boolean(options.defaultRoundLimit) && rawActions.length === 0
    }))
    .filter((item) => item.id);
}

function normalizeCompressionProfileState(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const compressedThroughTurnNumber = Number(source.compressedThroughTurnNumber);
  return {
    summary: safeText(source.summary),
    compressedThroughTurnNumber:
      Number.isFinite(compressedThroughTurnNumber) && compressedThroughTurnNumber > 0
        ? Math.floor(compressedThroughTurnNumber)
        : 0,
    updatedAt: safeText(source.updatedAt)
  };
}

function getDefaultCompressionProfileName(id = STANDARD_COMPRESSION_PROFILE_ID) {
  return normalizeCompressionProfileId(id) === STANDARD_COMPRESSION_PROFILE_ID
    ? "標準壓縮模型"
    : safeText(id) || "自訂壓縮模型";
}

function getDefaultModularPromptModeName(mode = "single") {
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

function normalizeDialogueContextRounds(value, fallback = DEFAULT_DIALOGUE_CONTEXT_ROUNDS) {
  const normalized = Number(value);
  const fallbackNumber = Number(fallback);
  return Number.isFinite(normalized) && normalized > 0
    ? Math.floor(normalized)
    : Number.isFinite(fallbackNumber) && fallbackNumber > 0
      ? Math.floor(fallbackNumber)
      : DEFAULT_DIALOGUE_CONTEXT_ROUNDS;
}

function createDefaultModularPromptConfig(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  return {
    version: 2,
    mode: normalizedMode,
    name: getDefaultModularPromptModeName(normalizedMode),
    dialogueContextRounds: DEFAULT_DIALOGUE_CONTEXT_ROUNDS,
    contextCompression: {
      mainRules: getContextCompressionPrompt(),
      models: [
        {
          id: "PlotProgression",
          name: "劇情狀態",
          addRules: "保存已成立的劇情進展、角色關係變化、重要場景狀態與未完成事項。只新增本次壓縮上下文中確實出現的新資訊。",
          deleteRules: "刪除已被新發展取代、已失效、已完成或明顯重複的舊劇情狀態。"
        }
      ]
    },
    reasonerHistory: {
      mainRules: "你是正式正文生成器，只能輸出角色/場景正文，不要輸出分析、JSON 或額外標題。",
      contextRules: "承接角色卡、模型內容、最近對話與世界書；結尾停在可供 {{user}} 回應或行動的節點。"
    }
  };
}

function normalizeCompressionModelConfig(input = {}, index = 0) {
  const source = input && typeof input === "object" ? input : {};
  const rawId = safeText(source.id || source.key || source.name || `CompressionModel${index + 1}`);
  const id = rawId
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "") || `CompressionModel${index + 1}`;
  return {
    id,
    name: safeText(source.name || source.title || id),
    addRules: safeText(source.addRules || source.addRule || source.rules || source["新增模型規則"]),
    deleteRules: safeText(source.deleteRules || source.deleteRule || source["刪除模型規則"])
  };
}

function normalizeContextCompressionPromptConfig(input = {}, fallbackPrompt = "", options = {}) {
  const source = input && typeof input === "object" ? input : {};
  const allowEmptyModels = Boolean(options.allowEmptyModels);
  const allowEmptyMainRules = Boolean(options.allowEmptyMainRules);
  const hasExplicitMainRules = source && typeof source === "object" && [
    "mainRules",
    "prompt",
    "contextCompressionPrompt"
  ].some((key) => Object.prototype.hasOwnProperty.call(source, key));
  const rawPrompt = safeText(
    typeof input === "string"
      ? input
      : source.mainRules ?? source.prompt ?? source.contextCompressionPrompt ?? ""
  );
  const legacyPrompt = allowEmptyMainRules && hasExplicitMainRules
    ? rawPrompt
    : safeText(rawPrompt || fallbackPrompt);
  const rawModels = Array.isArray(source.models)
    ? source.models
    : Array.isArray(source.modules)
      ? source.modules
      : [];
  const models = rawModels
    .map((item, index) => normalizeCompressionModelConfig(item, index))
    .filter((item) => item.id);
  return {
    mainRules: legacyPrompt || (allowEmptyMainRules && hasExplicitMainRules ? "" : getContextCompressionPrompt()),
    models: models.length > 0
      ? models
      : allowEmptyModels
        ? []
        : createDefaultModularPromptConfig().contextCompression.models
  };
}

function createStandardCompressionProfile(contextCompression) {
  const normalizedContextCompression = normalizeContextCompressionPromptConfig(
    contextCompression,
    getContextCompressionPrompt()
  );
  return {
    id: STANDARD_COMPRESSION_PROFILE_ID,
    name: getDefaultCompressionProfileName(STANDARD_COMPRESSION_PROFILE_ID),
    enabled: true,
    locked: true,
    triggers: normalizeCompressionTriggerConfig({ roundLimit: true }, { defaultRoundLimit: true }),
    triggerActions: normalizeCompressionTriggerActionsConfig([], {
      defaultRoundLimit: true,
      defaultName: "標準壓縮"
    }),
    appendTerms: [],
    contextCompression: normalizedContextCompression
  };
}

function normalizeCompressionProfileConfig(input = {}, index = 0, fallbackContextCompression = null) {
  const source = input && typeof input === "object" ? input : {};
  const id = normalizeCompressionProfileId(source.id || source.key || source.name || `compression_profile_${index + 1}`);
  const isStandard = id === STANDARD_COMPRESSION_PROFILE_ID;
  const contextCompression = normalizeContextCompressionPromptConfig(
    source.contextCompression || source.compression || fallbackContextCompression,
    fallbackContextCompression?.mainRules || getContextCompressionPrompt(),
    { allowEmptyModels: !isStandard, allowEmptyMainRules: !isStandard }
  );
  const triggerActions = normalizeCompressionTriggerActionsConfig(
    source.triggerActions || source.actions || source.triggerRules || [],
    {
      defaultRoundLimit: isStandard,
      defaultName: isStandard ? "標準壓縮" : "觸發組合 1",
      legacyTriggers: source.triggers || source.trigger || {}
    }
  );
  return {
    id,
    name: safeText(source.name || source.title || source.displayName) || getDefaultCompressionProfileName(id),
    enabled: isStandard ? true : source.enabled !== false,
    locked: isStandard || Boolean(source.locked),
    triggers: triggerActions[0]?.triggers || normalizeCompressionTriggerConfig(
      source.triggers || source.trigger || {},
      { defaultRoundLimit: isStandard }
    ),
    triggerActions,
    appendTerms: normalizeModelAppendTermsConfig(source.appendTerms || source.playerAppendTerms || []),
    contextCompression
  };
}

function normalizeCompressionProfilesConfig(input = {}, standardContextCompression = null) {
  const rawProfiles = Array.isArray(input)
    ? input
    : Array.isArray(input?.profiles)
      ? input.profiles
      : Array.isArray(input?.compressionProfiles)
        ? input.compressionProfiles
        : [];
  const standard = createStandardCompressionProfile(standardContextCompression);
  const profilesById = new Map([[STANDARD_COMPRESSION_PROFILE_ID, standard]]);

  rawProfiles.forEach((profile, index) => {
    const normalized = normalizeCompressionProfileConfig(profile, index, standard.contextCompression);
    profilesById.set(normalized.id, {
      ...normalized,
      ...(normalized.id === STANDARD_COMPRESSION_PROFILE_ID
        ? { enabled: true, locked: true, triggers: normalizeCompressionTriggerConfig(normalized.triggers, { defaultRoundLimit: true }) }
        : {})
    });
  });

  const normalizedStandard = profilesById.get(STANDARD_COMPRESSION_PROFILE_ID) || standard;
  profilesById.set(STANDARD_COMPRESSION_PROFILE_ID, {
    ...normalizedStandard,
    id: STANDARD_COMPRESSION_PROFILE_ID,
    name: normalizedStandard.name || standard.name,
    enabled: true,
    locked: true,
    triggers: normalizedStandard.triggerActions?.[0]?.triggers ||
      normalizeCompressionTriggerConfig(normalizedStandard.triggers, { defaultRoundLimit: true }),
    triggerActions: normalizeCompressionTriggerActionsConfig(
      normalizedStandard.triggerActions || [],
      {
        defaultRoundLimit: true,
        defaultName: "標準壓縮",
        legacyTriggers: normalizedStandard.triggers
      }
    )
  });

  return [
    profilesById.get(STANDARD_COMPRESSION_PROFILE_ID),
    ...[...profilesById.values()].filter((profile) => profile.id !== STANDARD_COMPRESSION_PROFILE_ID)
  ];
}

function normalizeModularPromptConfig(input, mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  const defaults = createDefaultModularPromptConfig(normalizedMode);
  const source = input && typeof input === "object" ? input : {};
  const contextCompression = normalizeContextCompressionPromptConfig(
    source.contextCompression || source.contextCompressionPrompt || source.compressionPrompt,
    safeText(source.contextCompressionPrompt || source.contextCompression?.prompt) ||
      defaults.contextCompression.mainRules
  );
  const compressionProfiles = normalizeCompressionProfilesConfig(
    source.compressionProfiles || source.compressionProfileConfigs || [],
    contextCompression
  );
  const standardProfile = compressionProfiles.find((profile) => profile.id === STANDARD_COMPRESSION_PROFILE_ID) ||
    createStandardCompressionProfile(contextCompression);
  const legacyDialogueContextRounds = source.dialogueContextRounds ??
    source.reasonerHistory?.dialogueContextRounds ??
    source.contextRounds ??
    source.reasonerHistory?.contextRounds;
  return {
    version: 2,
    mode: normalizedMode,
    name: safeText(source.name || source.title || source.displayName) || defaults.name,
    dialogueContextRounds: normalizeDialogueContextRounds(
      legacyDialogueContextRounds,
      defaults.dialogueContextRounds
    ),
    contextCompression: standardProfile.contextCompression,
    contextCompressionPrompt: standardProfile.contextCompression.mainRules,
    compressionProfiles,
    reasonerHistory: {
      mainRules: safeText(source.reasonerHistory?.mainRules) || defaults.reasonerHistory.mainRules,
      contextRules: safeText(source.reasonerHistory?.contextRules) || defaults.reasonerHistory.contextRules
    }
  };
}

let modularPromptConfigStore = null;

function getModularPromptConfigFilePath(mode = "single") {
  return path.join(MODULAR_PROMPTS_DIR, `${normalizeRoleCardMode(mode)}.json`);
}

function loadModularPromptConfig(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  const filePath = getModularPromptConfigFilePath(normalizedMode);
  const defaults = createDefaultModularPromptConfig(normalizedMode);
  try {
    if (!fs.existsSync(MODULAR_PROMPTS_DIR)) {
      fs.mkdirSync(MODULAR_PROMPTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `${JSON.stringify(defaults, null, 2)}\n`, "utf8");
      return defaults;
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return normalizeModularPromptConfig(parsed, normalizedMode);
  } catch {
    return defaults;
  }
}

function getModularPromptConfigStore() {
  if (!modularPromptConfigStore) {
    modularPromptConfigStore = {
      single: loadModularPromptConfig("single"),
      multi: loadModularPromptConfig("multi"),
      no_role: loadModularPromptConfig("no_role")
    };
    try {
      if (fs.existsSync(MODULAR_PROMPTS_DIR)) {
        fs.readdirSync(MODULAR_PROMPTS_DIR)
          .filter((fileName) => fileName.endsWith(".json"))
          .forEach((fileName) => {
            const mode = normalizeRoleCardMode(path.basename(fileName, ".json"));
            modularPromptConfigStore[mode] = loadModularPromptConfig(mode);
          });
      }
    } catch {
      // Ignore optional custom prompt mode discovery failures.
    }
  }
  return modularPromptConfigStore;
}

function getModularPromptConfigsPayload() {
  return cloneData(getModularPromptConfigStore(), {});
}

function getModularPromptConfig(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  return getModularPromptConfigStore()[normalizedMode] || getModularPromptConfigStore().single;
}

function saveModularPromptConfig(mode = "single", config = {}) {
  const normalizedMode = normalizeRoleCardMode(mode);
  const normalized = normalizeModularPromptConfig(config, normalizedMode);
  if (!fs.existsSync(MODULAR_PROMPTS_DIR)) {
    fs.mkdirSync(MODULAR_PROMPTS_DIR, { recursive: true });
  }
  fs.writeFileSync(getModularPromptConfigFilePath(normalizedMode), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  modularPromptConfigStore = {
    ...getModularPromptConfigStore(),
    [normalizedMode]: normalized
  };
  return normalized;
}

function deleteModularPromptConfig(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  if (["single", "multi", "no_role"].includes(normalizedMode)) {
    return { ok: false, error: "內建模式不可刪除。" };
  }
  if (state.roleCards.some((card) => normalizeRoleCardMode(card.mode) === normalizedMode)) {
    return { ok: false, error: "仍有角色卡使用此模式，請先切換那些角色卡的模式。" };
  }

  const filePath = getModularPromptConfigFilePath(normalizedMode);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  const store = getModularPromptConfigStore();
  delete store[normalizedMode];
  modularPromptConfigStore = store;
  return { ok: true, mode: normalizedMode };
}

function isMultiRoleCard(card) {
  return normalizeRoleCardMode(card?.mode) === "multi";
}

function isNoRoleCard(card) {
  return normalizeRoleCardMode(card?.mode) === "no_role";
}

function resolveUserDisplayName(userProfile, fallbackName = "") {
  const profileName = safeText(userProfile?.displayName);
  if (profileName) {
    return profileName;
  }
  const fallback = safeText(fallbackName);
  if (fallback) {
    return fallback;
  }
  return "你";
}

function injectUserPlaceholder(text, userDisplayName) {
  const source = typeof text === "string" ? text : "";
  return source.replace(/\{\{\s*user\s*\}\}/gi, userDisplayName);
}

function renderRoleCardWithUser(card, userDisplayName) {
  if (!card) {
    return null;
  }
  return {
    ...card,
    customSections: normalizeRoleCardCustomSections(card.customSections, card).map((section) => ({
      ...section,
      name: injectUserPlaceholder(section.name, userDisplayName),
      content: injectUserPlaceholder(section.content, userDisplayName)
    })),
    personality: injectUserPlaceholder(card.personality, userDisplayName),
    scene: injectUserPlaceholder(card.scene, userDisplayName),
    systemInstruction: injectUserPlaceholder(card.systemInstruction, userDisplayName),
    description: injectUserPlaceholder(card.description, userDisplayName),
    relationships: injectUserPlaceholder(card.relationships, userDisplayName),
    openingDialogue: injectUserPlaceholder(card.openingDialogue, userDisplayName),
    lorebooks: normalizeRoleCardLorebooks(card.lorebooks).map((entry) => ({
      ...entry,
      key: injectUserPlaceholder(entry.key, userDisplayName),
      keywords: splitLorebookKeywords(entry.keywords.map((keyword) => injectUserPlaceholder(keyword, userDisplayName))),
      content: injectUserPlaceholder(entry.content, userDisplayName)
    }))
  };
}

function getLorebookContextSource(state, runtimeUserName = "", purpose = "reasoner") {
  const latestUser = getLatestUserMessage(state);
  const previousAssistant = getPreviousAssistantMessage(state, latestUser?.id || "");
  const latestUserContent = latestUser
    ? getUserBaseModelContent(latestUser) || safeText(latestUser?.content)
    : "";
  const previousAssistantContent = previousAssistant
    ? safeText(previousAssistant?.content)
    : "";
  return [previousAssistantContent, latestUserContent]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();
}

function getLorebookEntryIdentity(entry) {
  return safeText(entry?.id) || safeText(entry?.key);
}

function getEffectiveLorebookDedupTurnThreshold(currentState = state) {
  const compressionState = normalizeContextCompressionState(currentState?.contextCompression);
  let threshold = compressionState.compressedThroughTurnNumber;
  const latestUser = getLatestUserMessage(currentState);
  if (!latestUser || !isContextCompressionEnabled(currentState)) {
    return threshold;
  }

  const contextLimit = Math.max(1, getDialogueContextRounds(currentState));
  const rounds = getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUser.id);
  const uncompressedRounds = rounds.filter((round) => getRoundTurnNumber(round) > threshold);
  if (uncompressedRounds.length >= contextLimit) {
    threshold = getRoundTurnNumber(uncompressedRounds[uncompressedRounds.length - 1]) || threshold;
  }
  return threshold;
}

function getAttachedLorebookEntryIdsSinceLastCompression(currentState = state, entries = []) {
  const threshold = getEffectiveLorebookDedupTurnThreshold(currentState);
  const ids = new Set();
  (Array.isArray(currentState?.conversation) ? currentState.conversation : []).forEach((message) => {
    if (!message || message.role !== "user") {
      return;
    }
    const turnNumber = getMessageTurnNumber(message);
    if (!turnNumber || turnNumber <= threshold) {
      return;
    }

    [
      message.lorebookTriggeredEntryIds,
      message.triggeredLorebookEntryIds,
      message.extra?.lorebookTriggeredEntryIds,
      message.extra?.triggeredLorebookEntryIds
    ].forEach((value) => {
      (Array.isArray(value) ? value : []).forEach((id) => {
        const normalizedId = safeText(id);
        if (normalizedId) {
          ids.add(normalizedId);
        }
      });
    });
  });
  return ids;
}

function getLorebookRuntimeEntry(state, cardId, entryId) {
  const runtime = ensureRoleCardRuntimeStateEntry(state, cardId);
  if (!runtime) {
    return null;
  }
  runtime.lorebookRuntime = normalizeRoleCardLorebookRuntimeMap(runtime.lorebookRuntime);
  if (!runtime.lorebookRuntime[entryId]) {
    runtime.lorebookRuntime[entryId] = normalizeRoleCardLorebookRuntimeEntry({});
  }
  return runtime.lorebookRuntime[entryId];
}

function resolveTriggeredLorebookEntries(state, activeRoleCard, runtimeUserName = "", purpose = "reasoner") {
  const activeCard = activeRoleCard || getActiveRoleCard(state);
  if (!activeCard?.id) {
    return [];
  }
  const resolvedUserName = resolveUserDisplayName(state?.userProfile, runtimeUserName);
  const roleCard = renderRoleCardWithUser(activeCard, resolvedUserName);
  const lorebooks = normalizeRoleCardLorebooks(roleCard?.lorebooks);
  if (lorebooks.length === 0) {
    return [];
  }

  const sourceText = getLorebookContextSource(state, runtimeUserName, purpose);
  if (!sourceText) {
    return [];
  }

  const alreadyAttachedEntryIds = getAttachedLorebookEntryIdsSinceLastCompression(state, lorebooks);
  return lorebooks.filter((entry) => {
    if (entry.enabled === false) {
      return false;
    }
    if (alreadyAttachedEntryIds.has(getLorebookEntryIdentity(entry))) {
      return false;
    }
    return entry.keywords.some((keyword) => sourceText.includes(safeText(keyword).toLowerCase()));
  });
}

function getTriggeredRoleCardLorebooks(state, activeRoleCard, runtimeUserName = "", purpose = "reasoner") {
  return resolveTriggeredLorebookEntries(state, activeRoleCard, runtimeUserName, purpose);
}

function formatTriggeredLorebooksForPrompt(state, activeRoleCard, runtimeUserName = "", purpose = "reasoner") {
  if (purpose !== "reasoner") {
    return "";
  }
  const triggeredLorebooks = getTriggeredRoleCardLorebooks(state, activeRoleCard, runtimeUserName, purpose);
  return formatLorebookEntriesForPrompt(triggeredLorebooks);
}

function formatLorebookEntriesForPrompt(entries = []) {
  const normalized = Array.isArray(entries) ? entries.filter(Boolean) : [];
  if (normalized.length === 0) {
    return "";
  }
  return [
    "【觸發世界書 Lorebooks】",
    normalized.map((entry, index) => `${index + 1}. ${entry.key}\n${entry.content}`).join("\n\n")
  ].join("\n");
}

function formatRoleCardForPrompt(roleCard, options = {}) {
  const includeOpeningDialogue = options.includeOpeningDialogue !== false;
  if (!roleCard) {
    return "";
  }

  const lines = [
    roleCard.name ? `名字:${roleCard.name}` : "",
    ...normalizeRoleCardCustomSections(roleCard.customSections, roleCard)
      .filter((section) => section.name || section.content)
      .map((section) => `${section.name || "自定義內容"}:${section.content}`)
  ].filter(Boolean);

  if (includeOpeningDialogue && roleCard.openingDialogue) {
    lines.push(`開場對話:${roleCard.openingDialogue}`);
  }

  return lines.join("\n");
}

function formatRoleCardsForPrompt(roleCards, userDisplayName = "") {
  const cards = Array.isArray(roleCards) ? roleCards.filter(Boolean) : [roleCards].filter(Boolean);
  if (cards.length === 0) {
    return "未設定";
  }
  const resolvedUserName = safeText(userDisplayName);
  return cards
    .map((card, index) => {
      const renderedCard = resolvedUserName ? renderRoleCardWithUser(card, resolvedUserName) : card;
      const cardContent = formatRoleCardForPrompt(renderedCard, { includeOpeningDialogue: false });
      return [`#${index + 1}`, cardContent].filter(Boolean).join("\n");
    })
    .join("\n\n");
}

function formatNoRoleWorldSetting(roleCard) {
  if (!roleCard) {
    return "未設定";
  }
  return [
    getRoleCardCustomSectionValue(roleCard, "詳細描述") ? `核心設定:${getRoleCardCustomSectionValue(roleCard, "詳細描述")}` : "",
    getRoleCardCustomSectionValue(roleCard, "系統指令") ? `補充規則:${getRoleCardCustomSectionValue(roleCard, "系統指令")}` : ""
  ].filter(Boolean).join("\n") || "未設定";
}

function formatNoRoleSceneSetting(roleCard) {
  if (!roleCard) {
    return "未設定";
  }
  return getRoleCardCustomSectionValue(roleCard, "場景") || "未設定";
}

function formatNoRoleAvailableCharacters(roleCard) {
  if (!roleCard) {
    return "未設定";
  }
  return [
    roleCard.name ? `卡片名稱:${roleCard.name}` : "",
    getRoleCardCustomSectionValue(roleCard, "性格") ? `人物資料:${getRoleCardCustomSectionValue(roleCard, "性格")}` : "",
    getRoleCardCustomSectionValue(roleCard, "人物關係（純文字）") ? `可出場人物/關係:${getRoleCardCustomSectionValue(roleCard, "人物關係（純文字）")}` : ""
  ].filter(Boolean).join("\n") || "未設定";
}

function formatStructuredItemsForPrompt(items, maxItems = 10) {
  const normalized = normalizeStructuredStringArray(items);
  if (normalized.length === 0) {
    return "無";
  }
  return normalized.slice(-Math.max(1, maxItems)).join("\n\n");
}

function normalizeTimeMatchText(text = "") {
  return safeText(text).normalize("NFKC").toLowerCase();
}

function findTimeTrackingWordOccurrences(normalizedText = "", word = "") {
  const normalizedWord = normalizeTimeMatchText(word);
  const occurrences = [];
  if (!normalizedText || !normalizedWord) {
    return occurrences;
  }
  let index = normalizedText.indexOf(normalizedWord);
  while (index >= 0) {
    occurrences.push({
      start: index,
      end: index + normalizedWord.length
    });
    index = normalizedText.indexOf(normalizedWord, index + Math.max(1, normalizedWord.length));
  }
  return occurrences;
}

function getTimeTrackingRangeGap(left, right) {
  if (!left || !right) {
    return Number.POSITIVE_INFINITY;
  }
  if (left.end <= right.start) {
    return right.start - left.end;
  }
  if (right.end <= left.start) {
    return left.start - right.end;
  }
  return 0;
}

function getTimeTrackingConnectorOccurrences(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  return (Array.isArray(config.connectorWords) ? config.connectorWords : [])
    .flatMap((word) => findTimeTrackingWordOccurrences(normalizedText, word));
}

function getTimeTrackingNoChangeOccurrences(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  return (Array.isArray(config.noChangeWords) ? config.noChangeWords : [])
    .flatMap((word) => findTimeTrackingWordOccurrences(normalizedText, word));
}

function isTimeTrackingConnectorBlocked(text = "", connectorRange = null, config = DEFAULT_TIME_TRACKING_CONFIG) {
  if (!connectorRange) {
    return false;
  }
  return getTimeTrackingNoChangeOccurrences(text, config)
    .some((blockedRange) =>
      getTimeTrackingRangeGap(blockedRange, connectorRange) <= TIME_TRACKING_CONNECTOR_PROXIMITY_CHARS
    );
}

function isNearTimeTrackingConnector(text = "", range = null, config = DEFAULT_TIME_TRACKING_CONFIG) {
  if (!range) {
    return false;
  }
  return getTimeTrackingConnectorOccurrences(text, config)
    .some((connectorRange) =>
      getTimeTrackingRangeGap(connectorRange, range) <= TIME_TRACKING_CONNECTOR_PROXIMITY_CHARS &&
      !isTimeTrackingConnectorBlocked(text, connectorRange, config)
    );
}

function parseChineseSmallNumber(value = "") {
  const raw = safeText(value).replace(/[兩两]/g, "二");
  if (!raw) {
    return null;
  }
  if (/^\d+$/u.test(raw)) {
    return Math.max(0, Math.floor(Number(raw)));
  }
  const digits = {
    零: 0,
    一: 1,
    二: 2,
    三: 3,
    四: 4,
    五: 5,
    六: 6,
    七: 7,
    八: 8,
    九: 9
  };
  if (Object.prototype.hasOwnProperty.call(digits, raw)) {
    return digits[raw];
  }
  const hundredParts = raw.split("百");
  if (hundredParts.length === 2) {
    const hundreds = hundredParts[0] ? parseChineseSmallNumber(hundredParts[0]) : 1;
    const rest = hundredParts[1] ? parseChineseSmallNumber(hundredParts[1]) : 0;
    return hundreds * 100 + rest;
  }
  const tenParts = raw.split("十");
  if (tenParts.length === 2) {
    const tens = tenParts[0] ? parseChineseSmallNumber(tenParts[0]) : 1;
    const ones = tenParts[1] ? parseChineseSmallNumber(tenParts[1]) : 0;
    return tens * 10 + ones;
  }
  return null;
}

function parseChineseDigitYear(value = "") {
  const raw = safeText(value)
    .replace(/[〇○Ｏ]/gu, "零")
    .replace(/\s+/g, "");
  if (/^\d{3,4}$/u.test(raw)) {
    return normalizeTimeTrackingYear(raw, 0);
  }
  const digits = {
    零: "0",
    一: "1",
    二: "2",
    三: "3",
    四: "4",
    五: "5",
    六: "6",
    七: "7",
    八: "8",
    九: "9"
  };
  if (!/^[零一二三四五六七八九]{3,4}$/u.test(raw)) {
    return null;
  }
  const parsed = Number([...raw].map((char) => digits[char]).join(""));
  return Number.isFinite(parsed) && parsed >= 1 && parsed <= 9999 ? parsed : null;
}

function findExplicitYear(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/(\d{3,4}|[零一二三四五六七八九〇○Ｏ]{3,4})\s*年/gu)];
  const candidates = matches
    .map((match) => {
      const year = parseChineseDigitYear(match[1]);
      const range = {
        start: match.index,
        end: match.index + match[0].length
      };
      return year && isNearTimeTrackingConnector(normalizedText, range, config)
        ? { year, index: match.index }
        : null;
    })
    .filter(Boolean);
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.year || null;
}

function findExplicitDayNumber(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/第\s*(\d{1,4})\s*天/gu)];
  const candidates = matches
    .map((match) => {
      const dayNumber = Math.floor(Number(match[1]));
      const range = {
        start: match.index,
        end: match.index + match[0].length
      };
      return Number.isFinite(dayNumber) &&
        dayNumber > 0 &&
        isNearTimeTrackingConnector(normalizedText, range, config)
        ? { dayNumber, index: match.index }
        : null;
    })
    .filter(Boolean);
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.dayNumber || null;
}

function findDayAfterIncrement(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/([0-9]+|[一二三四五六七八九十百兩两]+)\s*天\s*[後后]/gu)];
  const values = matches
    .filter((match) => isNearTimeTrackingConnector(normalizedText, {
      start: match.index,
      end: match.index + match[0].length
    }, config))
    .map((match) => parseChineseSmallNumber(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length > 0 ? Math.max(...values) : 0;
}

function findNextDayIncrement(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  return (Array.isArray(config.nextDayWords) ? config.nextDayWords : [])
    .flatMap((word) => findTimeTrackingWordOccurrences(normalizedText, word))
    .some((range) => isNearTimeTrackingConnector(normalizedText, range, config));
}

function findExplicitMonthDate(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, fallbackYear = getCurrentCalendarYear()) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/(?:(\d{3,4}|[零一二三四五六七八九〇○Ｏ]{3,4})\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*(?:日|號|号)/gu)];
  const candidates = [];
  for (const match of matches) {
    const range = {
      start: match.index,
      end: match.index + match[0].length
    };
    if (!isNearTimeTrackingConnector(normalizedText, range, config)) {
      continue;
    }
    const year = match[1]
      ? parseChineseDigitYear(match[1])
      : normalizeTimeTrackingYear(fallbackYear);
    const month = Math.floor(Number(match[2]));
    const date = Math.floor(Number(match[3]));
    if (year && isValidMonthDate(month, date, year)) {
      candidates.push({ year, month, date, index: match.index });
    }
  }
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0] || null;
}

function addDaysToMonthDate(year, month, date, days = 0) {
  let nextYear = normalizeTimeTrackingYear(year);
  let nextMonth = Math.floor(Number(month));
  let nextDate = Math.floor(Number(date));
  let remaining = Math.max(0, Math.floor(Number(days) || 0));
  if (!isValidMonthDate(nextMonth, nextDate, nextYear)) {
    const randomDate = createRandomValidMonthDate(nextYear);
    nextMonth = randomDate.month;
    nextDate = randomDate.date;
  }
  while (remaining > 0) {
    nextDate += 1;
    if (nextDate > getMonthDayCount(nextMonth, nextYear)) {
      nextDate = 1;
      if (nextMonth >= 12) {
        nextMonth = 1;
        nextYear += 1;
      } else {
        nextMonth += 1;
      }
    }
    remaining -= 1;
  }
  return { year: nextYear, month: nextMonth, date: nextDate };
}

function advanceTimeTrackingDays(timeTracking, days = 1) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const increment = Math.max(0, Math.floor(Number(days) || 0));
  if (increment <= 0) {
    return normalized;
  }
  const nextDate = addDaysToMonthDate(
    normalized.currentYear,
    normalized.currentMonth,
    normalized.currentDate,
    increment
  );
  return {
    ...normalized,
    currentDayNumber: normalized.currentDayNumber + increment,
    currentYear: nextDate.year,
    currentMonth: nextDate.month,
    currentDate: nextDate.date,
    updatedAt: nowIso()
  };
}

function setTimeTrackingDayNumber(timeTracking, dayNumber) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const nextDayNumber = Math.max(1, Math.floor(Number(dayNumber) || 1));
  const dayDelta = nextDayNumber - normalized.currentDayNumber;
  const nextDate = dayDelta >= 0
    ? addDaysToMonthDate(normalized.currentYear, normalized.currentMonth, normalized.currentDate, dayDelta)
    : {
        year: normalized.currentYear,
        month: normalized.currentMonth,
        date: normalized.currentDate
      };
  return {
    ...normalized,
    currentDayNumber: nextDayNumber,
    currentYear: nextDate.year,
    currentMonth: nextDate.month,
    currentDate: nextDate.date,
    updatedAt: nowIso()
  };
}

function detectTimePeriodFromText(text = "", config = DEFAULT_TIME_TRACKING_CONFIG) {
  const normalizedText = normalizeTimeMatchText(text);
  if (!normalizedText) {
    return "";
  }
  const candidates = [
    [TIME_PERIOD_MORNING, config.morningWords],
    [TIME_PERIOD_NOON, config.noonWords],
    [TIME_PERIOD_EVENING, config.eveningWords]
  ].flatMap(([period, words]) =>
    (Array.isArray(words) ? words : [])
      .map((word) => {
        const normalizedWord = normalizeTimeMatchText(word);
        return findTimeTrackingWordOccurrences(normalizedText, normalizedWord)
          .filter((range) => isNearTimeTrackingConnector(normalizedText, range, config))
          .map((range) => ({ period, index: range.start }));
      })
      .flat()
      .filter((item) => item && item.index >= 0)
  );
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.period || "";
}

function updateTimeTrackingFromText(currentState, text = "") {
  if (!currentState || typeof currentState !== "object") {
    return;
  }
  let timeTracking = normalizeTimeTrackingState(currentState.timeTracking);
  if (!timeTracking.enabled) {
    currentState.timeTracking = timeTracking;
    return;
  }
  const content = safeText(text);
  if (!content) {
    currentState.timeTracking = timeTracking;
    return;
  }
  const config = normalizeTimeTrackingConfig(timeTracking.config);
  let dayChangedByText = false;

  const explicitDate = findExplicitMonthDate(content, config, timeTracking.currentYear);
  if (explicitDate) {
    timeTracking = {
      ...timeTracking,
      currentYear: explicitDate.year,
      currentMonth: explicitDate.month,
      currentDate: explicitDate.date,
      updatedAt: nowIso()
    };
  } else {
    const explicitYear = findExplicitYear(content, config);
    if (explicitYear) {
      timeTracking = {
        ...timeTracking,
        currentYear: explicitYear,
        updatedAt: nowIso()
      };
    }
  }

  const explicitDayNumber = findExplicitDayNumber(content, config);
  if (explicitDayNumber) {
    timeTracking = setTimeTrackingDayNumber(timeTracking, explicitDayNumber);
    dayChangedByText = true;
  } else {
    const dayAfterIncrement = findDayAfterIncrement(content, config);
    if (dayAfterIncrement > 0) {
      timeTracking = advanceTimeTrackingDays(timeTracking, dayAfterIncrement);
      dayChangedByText = true;
    } else if (findNextDayIncrement(content, config)) {
      timeTracking = advanceTimeTrackingDays(timeTracking, 1);
      dayChangedByText = true;
    }
  }

  const detectedPeriod = detectTimePeriodFromText(content, config);
  if (detectedPeriod) {
    if (!dayChangedByText && timeTracking.currentPeriod === TIME_PERIOD_EVENING && detectedPeriod === TIME_PERIOD_MORNING) {
      timeTracking = advanceTimeTrackingDays(timeTracking, 1);
    }
    timeTracking = {
      ...timeTracking,
      currentPeriod: detectedPeriod,
      updatedAt: nowIso()
    };
  }

  currentState.timeTracking = normalizeTimeTrackingState(timeTracking);
}

function updateTimeTrackingFromMessage(currentState, message = {}) {
  if (!message || typeof message !== "object") {
    return;
  }
  updateTimeTrackingFromText(currentState, message.role === "user"
    ? safeText(message.content || message.baseModelContent || message.extra?.baseModelContent)
    : safeText(message.content));
}

function formatTimeTrackingPromptBlock(currentState = state) {
  if (isCharacterCardCreationAssistantActive(currentState)) {
    return "";
  }
  const timeTracking = normalizeTimeTrackingState(currentState?.timeTracking);
  if (!timeTracking.enabled) {
    return "";
  }
  const periodLabel = TIME_PERIOD_LABELS[timeTracking.currentPeriod] || TIME_PERIOD_LABELS[TIME_PERIOD_MORNING];
  return [
    `當前時間 | 數值: 第${timeTracking.currentDayNumber}天${periodLabel}${timeTracking.currentYear}年${timeTracking.currentMonth}月${timeTracking.currentDate}日`
  ].join("\n");
}

function appendUserIdentityTextToContent(content = "", currentState = state) {
  const base = safeText(content);
  const userDisplayName = resolveUserDisplayName(currentState?.userProfile);
  const identityText = injectUserPlaceholder(currentState?.userProfile?.identityText, userDisplayName);
  if (!identityText) {
    return base;
  }
  return [
    base,
    "【使用者自訂補充】",
    identityText
  ].filter(Boolean).join("\n\n");
}

function appendTriggeredLorebooksToUserContent(content = "", currentState = state, runtimeUserName = "") {
  const base = safeText(content);
  const activeRoleCard = getActiveRoleCard(currentState);
  const resolvedUserName = resolveUserDisplayName(currentState?.userProfile, runtimeUserName);
  const lorebooksBlock = formatTriggeredLorebooksForPrompt(currentState, activeRoleCard, resolvedUserName, "reasoner");
  return [base, lorebooksBlock].filter(Boolean).join("\n\n");
}

function appendTimeTrackingTextToContent(content = "", currentState = state) {
  return [safeText(content), formatTimeTrackingPromptBlock(currentState)].filter(Boolean).join("\n\n");
}

function getUserMessageDiscordPlayerSlot(message = {}) {
  return normalizeDiscordPlayerSlot(message.discordPlayerSlot || message.extra?.discordPlayerSlot);
}

function isCompressionProfileStateActivated(profileState = {}) {
  const normalized = normalizeCompressionProfileState(profileState);
  return Boolean(safeText(normalized.summary) || Number(normalized.compressedThroughTurnNumber || 0) > 0);
}

function doesModelAppendTermMatchPlayer(term = {}, playerSlot = "") {
  const normalizedTerm = normalizeModelAppendTermConfig(term);
  const normalizedPlayerSlot = normalizeDiscordPlayerSlot(playerSlot);
  if (!normalizedTerm.enabled || !normalizedTerm.content || !normalizedPlayerSlot) {
    return false;
  }
  if (normalizedTerm.player === MODEL_APPEND_PLAYER_OTHER) {
    return normalizedPlayerSlot !== "user1" && normalizedPlayerSlot !== "user2";
  }
  return normalizedTerm.player === normalizedPlayerSlot;
}

function formatActiveModelAppendTermsForUser(currentState = state, playerSlot = "") {
  const normalizedPlayerSlot = normalizeDiscordPlayerSlot(playerSlot);
  if (!normalizedPlayerSlot) {
    return "";
  }

  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  return getEnabledCompressionProfiles(currentState)
    .filter((profile) => isCompressionProfileStateActivated(getCompressionProfileState(compressionState, profile.id)))
    .flatMap((profile) => normalizeModelAppendTermsConfig(profile.appendTerms || []))
    .filter((term) => doesModelAppendTermMatchPlayer(term, normalizedPlayerSlot))
    .map((term) => term.content)
    .filter(Boolean)
    .join("\n\n");
}

function prependDiscordPlayerSlotToUserContent(content = "", playerSlot = "") {
  const normalizedPlayerSlot = normalizeDiscordPlayerSlot(playerSlot);
  if (!normalizedPlayerSlot) {
    return safeText(content);
  }
  return [
    `【目前輸入者】${normalizedPlayerSlot}`,
    safeText(content)
  ].filter(Boolean).join("\n");
}

function stripUserIdentityTextFromContent(content = "") {
  return safeText(content).replace(/\n{2,}【使用者自訂補充】[\s\S]*$/u, "").trim();
}

function getUserBaseModelContent(message) {
  const baseModelContent = safeText(message?.baseModelContent);
  if (baseModelContent) {
    return baseModelContent;
  }
  const modelContent = safeText(message?.modelContent || message?.extra?.modelContent);
  if (modelContent) {
    return stripUserIdentityTextFromContent(modelContent)
      .replace(/\n{2,}【觸發世界書 Lorebooks】[\s\S]*$/u, "")
      .trim();
  }
  return stripUserIdentityTextFromContent(message?.content);
}

function getCurrentUserModelContent(message, currentState = state, runtimeUserName = "") {
  const storedModelContent = safeText(message?.modelContent || message?.extra?.modelContent);
  if (message?.preparedModelContent === true && storedModelContent) {
    return storedModelContent;
  }
  if (storedModelContent.includes("【觸發世界書 Lorebooks】") || storedModelContent.includes("【使用者自訂補充】")) {
    return storedModelContent;
  }
  return appendUserIdentityTextToContent(
    appendTriggeredLorebooksToUserContent(
      appendTimeTrackingTextToContent(getUserBaseModelContent(message), currentState),
      currentState,
      runtimeUserName
    ),
    currentState
  );
}

function attachTriggeredLorebooksToUserMessage(message, currentState = state, runtimeUserName = "") {
  if (!message || message.role !== "user") {
    return message;
  }
  const storedModelContent = safeText(message.modelContent || message.extra?.modelContent);
  if (message.preparedModelContent === true && storedModelContent) {
    return message;
  }
  const baseModelContent = getUserBaseModelContent(message);
  const activeRoleCard = getActiveRoleCard(currentState);
  const resolvedUserName = resolveUserDisplayName(currentState?.userProfile, runtimeUserName);
  const triggeredLorebooks = getTriggeredRoleCardLorebooks(currentState, activeRoleCard, resolvedUserName, "reasoner");
  const playerSlot = getUserMessageDiscordPlayerSlot(message);
  const modelAppendTerms = formatActiveModelAppendTermsForUser(currentState, playerSlot);
  message.baseModelContent = baseModelContent;
  message.lorebookTriggeredEntryIds = triggeredLorebooks
    .map((entry) => getLorebookEntryIdentity(entry))
    .filter(Boolean);
  message.modelContent = appendUserIdentityTextToContent(
    [
      prependDiscordPlayerSlotToUserContent(baseModelContent, playerSlot),
      modelAppendTerms,
      formatTimeTrackingPromptBlock(currentState),
      formatLorebookEntriesForPrompt(triggeredLorebooks)
    ].filter(Boolean).join("\n\n"),
    currentState
  );
  message.preparedModelContent = true;
  return message;
}

function getMinimumReplyChars() {
  const raw = Number(process.env.AI_MIN_REPLY_CHARS || "");
  if (Number.isFinite(raw) && raw > 0) {
    return Math.floor(raw);
  }
  return DEFAULT_MIN_REPLY_CHARS;
}

function serializeLooseListItem(value) {
  if (typeof value === "string") {
    return safeText(value);
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const relationship = safeText(value.relationship);
    const progress = safeText(value.progress);
    if (relationship || progress) {
      return [relationship, progress].filter(Boolean).join(": ");
    }

    const simplePairs = Object.entries(value)
      .map(([key, item]) => {
        if (item === null || item === undefined) {
          return "";
        }
        if (typeof item === "string") {
          const normalized = safeText(item);
          return normalized ? `${key}: ${normalized}` : "";
        }
        if (typeof item === "number" || typeof item === "boolean") {
          return `${key}: ${String(item)}`;
        }
        return "";
      })
      .filter(Boolean);

    if (simplePairs.length > 0) {
      return simplePairs.join(" | ");
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  if (value === null || value === undefined) {
    return "";
  }
  return safeText(String(value));
}

function countVisibleCharacters(text) {
  return safeText(text).replace(/\s+/g, "").length;
}

function dedupeStringArray(items = []) {
  const seen = new Set();
  const result = [];
  normalizeStringArray(items).forEach((item) => {
    const normalized = safeText(item);
    if (!normalized || seen.has(normalized)) {
      return;
    }
    seen.add(normalized);
    result.push(normalized);
  });
  return result;
}

function countConversationTurns(currentState, latestUserMessageId = "") {
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  if (conversation.length === 0) {
    return normalizeTurnState(currentState?.turnState, currentState).totalUserTurns;
  }

  let latestUserIndex = -1;
  if (latestUserMessageId) {
    latestUserIndex = conversation.findIndex((item) => item?.id === latestUserMessageId);
    if (latestUserIndex >= 0) {
      const explicitTurnNumber = getMessageTurnNumber(conversation[latestUserIndex]);
      if (explicitTurnNumber) {
        return explicitTurnNumber;
      }
    }
  }
  if (latestUserIndex < 0) {
    const latestExplicitTurn = inferTurnCountFromConversation(conversation);
    const storedTurn = normalizeTurnState(currentState?.turnState, currentState).totalUserTurns;
    return Math.max(latestExplicitTurn, storedTurn);
  }

  let count = 0;
  for (let index = 0; index <= latestUserIndex; index += 1) {
    if (conversation[index]?.role === "user") {
      count += 1;
    }
  }
  return count;
}

function normalizeStringArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeLooseListItem(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return [serializeLooseListItem(value)].filter(Boolean);
  }
  return [];
}

function serializeStructuredText(value) {
  if (typeof value === "string") {
    return safeText(value);
  }
  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return safeText(String(value));
    }
  }
  return safeText(String(value ?? ""));
}

function normalizeStructuredStringArray(value) {
  if (!value) {
    return [];
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeStructuredText(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n\s*\r?\n+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (value && typeof value === "object") {
    return [serializeStructuredText(value)].filter(Boolean);
  }
  return [];
}

function createUiActions(state) {
  return [
    {
      key: "createRoleCard",
      label: "建立角色卡",
      enabled: true
    },
    {
      key: "editAiOutput",
      label: "編輯AI的輸出對話",
      enabled: state.conversation.some((message) => message.role === "assistant")
    }
  ];
}

function getLatestUserMessage(currentState) {
  if (!Array.isArray(currentState.conversation)) {
    return null;
  }
  for (let i = currentState.conversation.length - 1; i >= 0; i -= 1) {
    const item = currentState.conversation[i];
    if (item?.role === "user") {
      return item;
    }
  }
  return null;
}

function getPreviousAssistantMessage(currentState, latestUserMessageId = "") {
  if (!Array.isArray(currentState.conversation) || currentState.conversation.length === 0) {
    return null;
  }

  let latestUserIndex = -1;
  if (latestUserMessageId) {
    latestUserIndex = currentState.conversation.findIndex((item) => item.id === latestUserMessageId);
  }
  if (latestUserIndex < 0) {
    for (let i = currentState.conversation.length - 1; i >= 0; i -= 1) {
      if (currentState.conversation[i]?.role === "user") {
        latestUserIndex = i;
        break;
      }
    }
  }
  if (latestUserIndex <= 0) {
    return null;
  }

  for (let i = latestUserIndex - 1; i >= 0; i -= 1) {
    const item = currentState.conversation[i];
    if (item?.role === "assistant") {
      return item;
    }
  }

  return null;
}

function findLatestUserIndex(currentState, latestUserMessageId = "") {
  if (!Array.isArray(currentState.conversation) || currentState.conversation.length === 0) {
    return -1;
  }

  if (latestUserMessageId) {
    const matchedIndex = currentState.conversation.findIndex((item) => item.id === latestUserMessageId);
    if (matchedIndex >= 0) {
      return matchedIndex;
    }
  }

  for (let i = currentState.conversation.length - 1; i >= 0; i -= 1) {
    if (currentState.conversation[i]?.role === "user") {
      return i;
    }
  }

  return -1;
}

function getRoleCardOpeningDialogueText(currentState, runtimeUserName = "") {
  const resolvedUserName = resolveUserDisplayName(currentState?.userProfile, runtimeUserName);
  const activeRoleCard = getActiveRoleCard(currentState);
  const cards = Array.isArray(activeRoleCard) ? activeRoleCard.filter(Boolean) : [activeRoleCard].filter(Boolean);
  return cards
    .map((card) => safeText(renderRoleCardWithUser(card, resolvedUserName)?.openingDialogue))
    .filter(Boolean)
    .join("\n\n");
}

function getRoleCardOpeningDialogueMessage(currentState, runtimeUserName = "") {
  const openingDialogue = getRoleCardOpeningDialogueText(currentState, runtimeUserName);
  if (!openingDialogue) {
    return null;
  }
  return {
    role: "assistant",
    content: openingDialogue
  };
}

function getStoredOpeningDialogueMessage(currentState) {
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  const leadingAssistantMessages = [];

  for (const message of conversation) {
    if (!message || typeof message !== "object") {
      continue;
    }
    if (message.role === "user") {
      break;
    }
    if (message.role === "assistant" && safeText(message.content)) {
      leadingAssistantMessages.push(message);
    }
  }

  const openingMessage = leadingAssistantMessages.find((message) => message.source === "opening") ||
    leadingAssistantMessages[0];
  return openingMessage
    ? { ...openingMessage, role: "assistant", content: safeText(openingMessage.content) }
    : null;
}

function getOpeningDialogueContextMessage(currentState, runtimeUserName = "") {
  return getStoredOpeningDialogueMessage(currentState) ||
    getRoleCardOpeningDialogueMessage(currentState, runtimeUserName);
}

function messageListHasSameContent(messages = [], content = "") {
  const normalizedContent = safeText(content);
  if (!normalizedContent) {
    return false;
  }
  return (Array.isArray(messages) ? messages : [])
    .some((message) => safeText(message?.content) === normalizedContent);
}

function getRecentDialogueContextMessages(
  currentState,
  latestUserMessageId = "",
  maxRounds = 10,
  runtimeUserName = ""
) {
  const normalizedMaxRounds = Math.max(0, Number(maxRounds) || 0);
  const latestUserIndex = findLatestUserIndex(currentState, latestUserMessageId);
  if (latestUserIndex <= 0) {
    const openingDialogueMessage = getOpeningDialogueContextMessage(currentState, runtimeUserName);
    return openingDialogueMessage ? [openingDialogueMessage] : [];
  }

  const historyMessages = currentState.conversation.slice(0, latestUserIndex);
  const leadingAssistantMessages = [];
  const rounds = [];
  let pendingUser = null;

  historyMessages.forEach((message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.role === "assistant" && !pendingUser && rounds.length === 0) {
      leadingAssistantMessages.push(message);
      return;
    }
    if (message.role === "user") {
      if (pendingUser) {
        rounds.push([pendingUser]);
      }
      pendingUser = message;
      return;
    }
    if (message.role === "assistant" && pendingUser) {
      rounds.push([pendingUser, message]);
      pendingUser = null;
    }
  });

  if (pendingUser) {
    rounds.push([pendingUser]);
  }

  const selectedRounds = rounds.slice(-normalizedMaxRounds);
  const contextMessages = selectedRounds.flat();
  const openingDialogueMessage = getOpeningDialogueContextMessage(currentState, runtimeUserName);

  // Keep the context-round limit strict when the user sets it to a very small
  // number. Otherwise "補開場對話" makes the context-round setting look
  // ineffective in AI logs, because the opening line gets appended back in.
  if (normalizedMaxRounds <= 1) {
    if (contextMessages.length === 0 && leadingAssistantMessages.length > 0) {
      return leadingAssistantMessages;
    }
    return contextMessages;
  }

  if (selectedRounds.length < normalizedMaxRounds && openingDialogueMessage) {
    const firstMessage = contextMessages[0];
    const firstContent = safeText(firstMessage?.content);
    if (firstContent !== openingDialogueMessage.content) {
      return [openingDialogueMessage, ...contextMessages];
    }
  }

  return contextMessages;
}

function getRecentConversationContextMessages(currentState, latestUserMessageId = "", maxRounds = 10) {
  const latestUserIndex = findLatestUserIndex(currentState, latestUserMessageId);
  if (latestUserIndex <= 0) {
    return [];
  }

  const historyMessages = currentState.conversation.slice(0, latestUserIndex);
  const rounds = [];
  let pendingUser = null;

  historyMessages.forEach((message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.role === "user") {
      if (pendingUser) {
        rounds.push([pendingUser]);
      }
      pendingUser = message;
      return;
    }
    if (message.role === "assistant" && pendingUser) {
      rounds.push([pendingUser, message]);
      pendingUser = null;
    }
  });

  if (pendingUser) {
    rounds.push([pendingUser]);
  }

  return rounds.slice(-Math.max(0, maxRounds)).flat();
}

function getAllConversationContextMessages(currentState, latestUserMessageId = "") {
  const latestUserIndex = findLatestUserIndex(currentState, latestUserMessageId);
  if (latestUserIndex <= 0) {
    return [];
  }
  return currentState.conversation
    .slice(0, latestUserIndex)
    .filter((item) => item && typeof item === "object");
}

function getDialogueContextRounds(currentState = null) {
  const activeConfig = currentState ? getActiveModularPromptConfig(currentState) : null;
  if (activeConfig) {
    return normalizeDialogueContextRounds(
      activeConfig.dialogueContextRounds,
      normalizeConversationSettings(currentState?.conversationSettings).dialogueContextRounds
    );
  }
  return envFirstNumber(["CHAT_DIALOGUE_CONTEXT_ROUNDS", "DEEPSEEK_DIALOGUE_CONTEXT_ROUNDS"], DEFAULT_DIALOGUE_CONTEXT_ROUNDS);
}

function buildCharacterCardCreationAssistantSystemPrompt(state, runtimeUserName = "") {
	  const resolvedUserName = resolveUserDisplayName(state.userProfile, runtimeUserName);
	  return finalizePromptTemplate(getCharacterCardCreationAssistantPrompt(), {
	    user: resolvedUserName
	  }).trim();
}

function getActiveModularPromptConfig(currentState = null) {
  const activeRoleCard = getActiveRoleCard(currentState);
  return getModularPromptConfig(normalizeRoleCardMode(activeRoleCard?.mode));
}

function formatModularRoleContext(state, activeRoleCard, resolvedUserName = "", options = {}) {
  const includeLorebooks = options.includeLorebooks !== false;
  const runtimeUserName = options.runtimeUserName || resolvedUserName;
  const purpose = options.purpose || "reasoner";
  const lorebooksBlock = includeLorebooks
    ? formatTriggeredLorebooksForPrompt(state, activeRoleCard, runtimeUserName, purpose)
    : "";
  if (isNoRoleCard(activeRoleCard)) {
    const roleCard = renderRoleCardWithUser(activeRoleCard, resolvedUserName);
    return [
      "【無角色卡自定義內容】",
      formatRoleCardForPrompt(roleCard, { includeOpeningDialogue: false }) || [
        "【世界觀設定】",
        formatNoRoleWorldSetting(roleCard),
        "【場景設定】",
        formatNoRoleSceneSetting(roleCard),
        "【可出場人物資料】",
        formatNoRoleAvailableCharacters(roleCard)
      ].join("\n"),
      lorebooksBlock
    ].join("\n");
  }

  if (isMultiRoleCard(activeRoleCard)) {
    return [
      "【多角色卡列表】",
      formatRoleCardsForPrompt(activeRoleCard, resolvedUserName),
      lorebooksBlock
    ].join("\n");
  }

  const baseRoleCard = getStoredRoleCardById(state, state.activeRoleCardId);
  const originalRoleCard = renderRoleCardWithUser(baseRoleCard, resolvedUserName);
  const roleCard = renderRoleCardWithUser(activeRoleCard, resolvedUserName);
  return [
    "【原始角色卡】",
    formatRoleCardForPrompt(originalRoleCard, { includeOpeningDialogue: false }),
    "【目前角色卡】",
    formatRoleCardForPrompt(roleCard, { includeOpeningDialogue: false }),
    lorebooksBlock
  ].join("\n");
}

function buildCacheableDialogueMessages(messages = []) {
  return (Array.isArray(messages) ? messages : [])
    .map((item) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : "";
      if (!role) {
        return null;
      }
      const content = item?.requestContentPrepared === true
        ? safeText(item.content)
        : getMessageModelContent(item);
      const normalizedContent = safeText(content);
      return normalizedContent ? { role, content: normalizedContent } : null;
    })
    .filter(Boolean);
}

function getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUserMessageId = "") {
  const latestUserIndex = findLatestUserIndex(currentState, latestUserMessageId);
  if (latestUserIndex <= 0) {
    return [];
  }

  const rounds = [];
  let pendingUser = null;
  currentState.conversation.slice(0, latestUserIndex).forEach((message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.role === "user") {
      if (pendingUser) {
        rounds.push([pendingUser]);
      }
      pendingUser = message;
      return;
    }
    if (message.role === "assistant" && pendingUser) {
      rounds.push([pendingUser, message]);
      pendingUser = null;
    }
  });
  if (pendingUser) {
    rounds.push([pendingUser]);
  }
  return rounds;
}

function getRoundTurnNumber(round = []) {
  const userMessage = Array.isArray(round) ? round.find((message) => message?.role === "user") : null;
  return getMessageTurnNumber(userMessage);
}

function getLastCompletedDialogueRound(rounds = []) {
  for (let index = (Array.isArray(rounds) ? rounds.length : 0) - 1; index >= 0; index -= 1) {
    const round = rounds[index];
    if (Array.isArray(round) && round.some((message) => message?.role === "assistant")) {
      return round;
    }
  }
  return null;
}

function buildCurrentCompressionContentMessage(currentSummary = "") {
  return [
    "【目前模型內容】",
    safeText(currentSummary) || "無"
  ].join("\n");
}

function resolveContextCompressionPromptConfig(currentState = state, config = null) {
  const activeConfig = config || getActiveModularPromptConfig(currentState);
  const isProfileConfig = activeConfig &&
    typeof activeConfig === "object" &&
    (activeConfig.id || activeConfig.triggers || activeConfig.locked !== undefined) &&
    activeConfig.contextCompression;
  if (isProfileConfig) {
    const isStandardProfile = normalizeCompressionProfileId(activeConfig.id) === STANDARD_COMPRESSION_PROFILE_ID;
    return normalizeContextCompressionPromptConfig(
      activeConfig.contextCompression,
      getContextCompressionPrompt(),
      { allowEmptyModels: !isStandardProfile, allowEmptyMainRules: !isStandardProfile }
    );
  }

  const standardProfile = Array.isArray(activeConfig?.compressionProfiles)
    ? activeConfig.compressionProfiles.find((profile) => normalizeCompressionProfileId(profile?.id) === STANDARD_COMPRESSION_PROFILE_ID)
    : null;
  return normalizeContextCompressionPromptConfig(
    standardProfile?.contextCompression || activeConfig.contextCompression || activeConfig.contextCompressionPrompt,
    standardProfile?.contextCompression?.mainRules || activeConfig.contextCompressionPrompt || getContextCompressionPrompt()
  );
}

function buildContextCompressionInstructionPrompt(currentState = state, config = null) {
  const compressionConfig = resolveContextCompressionPromptConfig(currentState, config);
  const isCustomProfileConfig = config &&
    typeof config === "object" &&
    config.contextCompression &&
    normalizeCompressionProfileId(config.id) !== STANDARD_COMPRESSION_PROFILE_ID;
  const mainRules = compressionConfig.mainRules || (isCustomProfileConfig ? "" : getContextCompressionPrompt());
  if (compressionConfig.models.length === 0) {
    return [
      "【模型主要規則】",
      mainRules,
      "【輸出規則】",
      "直接輸出更新後的完整壓縮文本，禁止輸出 JSON。",
      "請把目前模型內容與本次上下文合併成可供正文長期承接的純文本。",
      "如果舊內容已被新資訊取代、完成或失效，請在輸出的完整文本中自然移除或改寫。"
    ].filter(Boolean).join("\n");
  }
  const modelRules = compressionConfig.models.map((model, index) => [
    `【模塊 ${index + 1}: ${model.name || model.id}】`,
    `id:${model.id}`,
    "新增模塊規則:",
    model.addRules || "無",
    "刪除模塊規則:",
    model.deleteRules || "無",
    `輸出欄位:model.${model.id}`,
    `刪除欄位:delete.${model.id}`
  ].join("\n")).join("\n\n");
  const outputShape = {
    model: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []])),
    delete: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []]))
  };
  return [
    "【模型主要規則】",
    mainRules,
    "【模塊規則】",
    modelRules,
    "【輸出規則】",
    "只能輸出一個合法 JSON 物件，禁止輸出 JSON 以外的任何文字。",
    "所有模型欄位都必須存在；沒有新增或刪除內容時輸出空陣列。",
    "model.<id> 只放本次需要新增保存的內容；delete.<id> 只放已失效、已完成、被新版取代或重複的舊內容。",
    "不可把本次剛新增到 model.<id> 的內容又放進 delete.<id>。",
    "後端會把 model.<id> 追加到既有模型內容，不會整體覆蓋；請避免重複輸出既有內容。",
    "JSON 格式範例:",
    JSON.stringify(outputShape, null, 2)
  ].filter(Boolean).join("\n");
}

function normalizeCompressionItemText(value) {
  if (typeof value === "string") {
    return safeText(value);
  }
  if (value && typeof value === "object") {
    return safeText(JSON.stringify(value));
  }
  return "";
}

function normalizeCompressionItemKey(value = "") {
  return safeText(value)
    .replace(/\s+/g, "")
    .replace(/[，。！？、,.!?;；:："'「」『』（）()【】\[\]]/g, "")
    .toLowerCase();
}

function tryParseJsonObject(text = "") {
  const raw = safeText(text);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/u);
    if (!match) {
      return null;
    }
    try {
      const parsed = JSON.parse(match[0]);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
}

function createEmptyCompressionStateFromConfig(config = {}) {
  const compressionConfig = normalizeContextCompressionPromptConfig(
    config,
    getContextCompressionPrompt(),
    { allowEmptyModels: Array.isArray(config?.models) && config.models.length === 0 }
  );
  return {
    model: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []])),
    delete: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []]))
  };
}

function normalizeCompressionJsonState(value = "", config = {}) {
  const base = createEmptyCompressionStateFromConfig(config);
  const parsed = typeof value === "object" && value !== null
    ? value
    : tryParseJsonObject(value);
  if (!parsed) {
    const legacy = safeText(value);
    if (legacy && legacy !== "無") {
      const firstModelId = Object.keys(base.model)[0] || "PlotProgression";
      base.model[firstModelId] = [legacy];
    }
    return base;
  }

  const sourceModel = parsed.model && typeof parsed.model === "object" ? parsed.model : {};
  const sourceDelete = parsed.delete && typeof parsed.delete === "object" ? parsed.delete : {};
  Object.keys(base.model).forEach((id) => {
    base.model[id] = (Array.isArray(sourceModel[id]) ? sourceModel[id] : [])
      .map((item) => normalizeCompressionItemText(item))
      .filter(Boolean);
    base.delete[id] = (Array.isArray(sourceDelete[id]) ? sourceDelete[id] : [])
      .map((item) => normalizeCompressionItemText(item))
      .filter(Boolean);
  });
  return base;
}

function mergeCompressionSummary(currentSummary = "", completionText = "", config = {}) {
  const compressionConfig = normalizeContextCompressionPromptConfig(
    config,
    getContextCompressionPrompt(),
    { allowEmptyModels: Array.isArray(config?.models) && config.models.length === 0 }
  );
  if (compressionConfig.models.length === 0) {
    return safeText(completionText) || safeText(currentSummary);
  }
  const current = normalizeCompressionJsonState(currentSummary, compressionConfig);
  const incoming = normalizeCompressionJsonState(completionText, compressionConfig);
  Object.keys(current.model).forEach((id) => {
    const deleteKeys = new Set((incoming.delete[id] || []).map((item) => normalizeCompressionItemKey(item)).filter(Boolean));
    if (deleteKeys.size > 0) {
      current.model[id] = current.model[id].filter((item) => !deleteKeys.has(normalizeCompressionItemKey(item)));
    }
    const seen = new Set(current.model[id].map((item) => normalizeCompressionItemKey(item)).filter(Boolean));
    (incoming.model[id] || []).forEach((item) => {
      const key = normalizeCompressionItemKey(item);
      if (!key || seen.has(key)) {
        return;
      }
      current.model[id].push(item);
      seen.add(key);
    });
    current.delete[id] = [];
  });
  return JSON.stringify(current, null, 2);
}

function formatCompressionSummaryForReasoner(currentSummary = "", currentState = state) {
  const activeConfig = getActiveModularPromptConfig(currentState);
  const compressionConfig = normalizeContextCompressionPromptConfig(
    activeConfig.contextCompression || activeConfig.contextCompressionPrompt,
    activeConfig.contextCompressionPrompt || getContextCompressionPrompt()
  );
  const normalized = normalizeCompressionJsonState(currentSummary, compressionConfig);
  return JSON.stringify({ model: normalized.model }, null, 2);
}

function formatCompressionProfileSummaryForReasoner(profile, profileState, currentState = state) {
  const compressionConfig = normalizeContextCompressionPromptConfig(
    profile.contextCompression,
    getContextCompressionPrompt(),
    {
      allowEmptyModels: profile.id !== STANDARD_COMPRESSION_PROFILE_ID,
      allowEmptyMainRules: profile.id !== STANDARD_COMPRESSION_PROFILE_ID
    }
  );
  if (compressionConfig.models.length === 0) {
    return [
      `【${profile.name || profile.id}】`,
      safeText(profileState.summary)
    ].filter(Boolean).join("\n");
  }
  const normalized = normalizeCompressionJsonState(profileState.summary, compressionConfig);
  return [
    `【${profile.name || profile.id}】`,
    JSON.stringify({ model: normalized.model }, null, 2)
  ].join("\n");
}

function formatAllCompressionSummariesForReasoner(currentState = state) {
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  return getEnabledCompressionProfiles(currentState)
    .map((profile) => {
      const profileState = getCompressionProfileState(compressionState, profile.id);
      if (!safeText(profileState.summary)) {
        return "";
      }
      return formatCompressionProfileSummaryForReasoner(profile, profileState, currentState);
    })
    .filter(Boolean)
    .join("\n\n");
}

function didContextCompressionAdvance(before, after) {
  const previous = normalizeContextCompressionState(before);
  const current = normalizeContextCompressionState(after);
  return JSON.stringify(current) !== JSON.stringify(previous);
}

function getCompressionProfileState(compressionState, profileId = STANDARD_COMPRESSION_PROFILE_ID) {
  const normalizedState = normalizeContextCompressionState(compressionState);
  const normalizedProfileId = normalizeCompressionProfileId(profileId);
  if (normalizedProfileId === STANDARD_COMPRESSION_PROFILE_ID) {
    return normalizeCompressionProfileState(normalizedState);
  }
  return normalizeCompressionProfileState(normalizedState.profiles?.[normalizedProfileId]);
}

function setCompressionProfileState(currentState, profileId = STANDARD_COMPRESSION_PROFILE_ID, profileState = {}) {
  const normalizedProfileId = normalizeCompressionProfileId(profileId);
  const normalizedState = normalizeContextCompressionState(currentState.contextCompression);
  const normalizedProfileState = normalizeCompressionProfileState(profileState);
  if (normalizedProfileId === STANDARD_COMPRESSION_PROFILE_ID) {
    currentState.contextCompression = {
      ...normalizedState,
      summary: normalizedProfileState.summary,
      compressedThroughTurnNumber: normalizedProfileState.compressedThroughTurnNumber,
      updatedAt: normalizedProfileState.updatedAt
    };
    return;
  }
  currentState.contextCompression = {
    ...normalizedState,
    profiles: {
      ...(normalizedState.profiles || {}),
      [normalizedProfileId]: normalizedProfileState
    },
    updatedAt: normalizedProfileState.updatedAt || normalizedState.updatedAt
  };
}

function getEnabledCompressionProfiles(currentState = state) {
  const activeConfig = getActiveModularPromptConfig(currentState);
  return normalizeCompressionProfilesConfig(
    activeConfig.compressionProfiles || [],
    activeConfig.contextCompression || activeConfig.contextCompressionPrompt
  ).filter((profile) => profile.id === STANDARD_COMPRESSION_PROFILE_ID || profile.enabled !== false);
}

function getEnabledCompressionTriggerActions(profile = {}) {
  return normalizeCompressionTriggerActionsConfig(profile.triggerActions || [], {
    defaultRoundLimit: profile.id === STANDARD_COMPRESSION_PROFILE_ID,
    defaultName: profile.id === STANDARD_COMPRESSION_PROFILE_ID ? "標準壓縮" : "觸發組合 1",
    legacyTriggers: profile.triggers || {}
  }).filter((item) => item.enabled !== false);
}

function getModelTriggerCompletionName(profile = {}, triggerAction = {}) {
  return safeText(triggerAction.name) || safeText(profile.name) || safeText(profile.id) || "模型";
}

function formatModelProcessingCompletionMessage(processedActions = []) {
  const names = [...new Set(
    (Array.isArray(processedActions) ? processedActions : [])
      .filter((item) => item?.skipReasoner)
      .map((item) => safeText(item.profileName) || safeText(item.actionName))
      .filter(Boolean)
  )];
  return `{${(names.length > 0 ? names : ["大模型"]).join("、")}}已經完成call api`;
}

function setLastModelProcessingResult(currentState, result = {}) {
  Object.defineProperty(currentState, "__lastModelProcessingResult", {
    value: {
      didProcess: Boolean(result.didProcess),
      skipReasoner: Boolean(result.skipReasoner),
      processedActions: Array.isArray(result.processedActions) ? result.processedActions : []
    },
    enumerable: false,
    configurable: true
  });
}

function getLastModelProcessingResult(currentState = state) {
  return currentState?.__lastModelProcessingResult || {
    didProcess: false,
    skipReasoner: false,
    processedActions: []
  };
}

function formatCompressionContextBlock(messages = []) {
  const content = (Array.isArray(messages) ? messages : [])
    .map((message, index) => {
      const role = message?.role === "assistant" ? "assistant" : "user";
      return [`#${index + 1} ${role}`, getMessageModelContent(message) || safeText(message?.content) || "（空白）"].join("\n");
    })
    .join("\n\n----------------\n\n");
  return ["【上下文】", content || "無"].join("\n");
}

function normalizeKeywordSearchText(text = "") {
  return safeText(text).normalize("NFKC").toLowerCase();
}

function normalizeKeywordExpressionText(text = "") {
  return normalizeKeywordSearchText(text)
    .replace(/[{}]/g, "")
    .trim();
}

function findKeywordOccurrences(text = "", keyword = "") {
  const normalizedText = normalizeKeywordSearchText(text);
  const normalizedKeyword = normalizeKeywordSearchText(keyword);
  const occurrences = [];
  if (!normalizedText || !normalizedKeyword) {
    return occurrences;
  }

  let index = normalizedText.indexOf(normalizedKeyword);
  while (index >= 0) {
    occurrences.push({
      start: index,
      end: index + normalizedKeyword.length
    });
    index = normalizedText.indexOf(normalizedKeyword, index + Math.max(1, normalizedKeyword.length));
  }
  return occurrences;
}

function parseKeywordExpressionGroup(group = "") {
  return safeText(group)
    .split("/")
    .map((item) => safeText(item))
    .filter(Boolean)
    .map((item) => {
      const playerMatch = item.match(/^\{\{\s*(user\d+|userx)\s*\}\}$/iu);
      if (playerMatch) {
        return {
          type: "player",
          value: normalizeDiscordPlayerSlot(playerMatch[1])
        };
      }
      return {
        type: "text",
        value: normalizeKeywordExpressionText(item)
      };
    })
    .filter((item) => item.value);
}

function getKeywordExpressionTextValues(expression = "") {
  return safeText(expression)
    .split("+")
    .flatMap((group) => parseKeywordExpressionGroup(group))
    .filter((item) => item.type === "text")
    .map((item) => item.value)
    .filter(Boolean);
}

function doesKeywordPlayerAlternativeMatch(alternative, latestUser = null) {
  const requiredSlot = normalizeDiscordPlayerSlot(alternative?.value);
  const currentSlot = getUserMessageDiscordPlayerSlot(latestUser);
  return Boolean(requiredSlot && currentSlot && requiredSlot === currentSlot);
}

function getOccurrenceGap(left, right) {
  if (!left || !right) {
    return Number.POSITIVE_INFINITY;
  }
  if (left.end <= right.start) {
    return right.start - left.end;
  }
  if (right.end <= left.start) {
    return left.start - right.end;
  }
  return 0;
}

function areKeywordOccurrencesNear(occurrences = [], maxGap = KEYWORD_PROXIMITY_CHARS) {
  for (let leftIndex = 0; leftIndex < occurrences.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < occurrences.length; rightIndex += 1) {
      if (getOccurrenceGap(occurrences[leftIndex], occurrences[rightIndex]) > maxGap) {
        return false;
      }
    }
  }
  return true;
}

function hasNearKeywordOccurrenceCombination(groupOccurrences = [], selected = [], index = 0) {
  if (index >= groupOccurrences.length) {
    return areKeywordOccurrencesNear(selected);
  }
  return groupOccurrences[index].some((occurrence) =>
    hasNearKeywordOccurrenceCombination(groupOccurrences, [...selected, occurrence], index + 1)
  );
}

function matchKeywordExpression(text = "", expression = "", latestUser = null) {
  const groups = safeText(expression)
    .split("+")
    .map((group) => parseKeywordExpressionGroup(group))
    .filter((group) => group.length > 0);
  if (groups.length === 0) {
    return false;
  }

  const matchedTextGroups = [];
  const everyGroupMatches = groups.every((group) => {
    const playerMatched = group
      .filter((alternative) => alternative.type === "player")
      .some((alternative) => doesKeywordPlayerAlternativeMatch(alternative, latestUser));
    if (playerMatched) {
      return true;
    }

    const occurrences = group
      .filter((alternative) => alternative.type === "text")
      .flatMap((alternative) => findKeywordOccurrences(text, alternative.value));
    if (occurrences.length > 0) {
      matchedTextGroups.push(occurrences);
      return true;
    }
    return false;
  });

  if (!everyGroupMatches) {
    return false;
  }
  if (!safeText(expression).includes("+") || matchedTextGroups.length <= 1) {
    return true;
  }
  return hasNearKeywordOccurrenceCombination(matchedTextGroups);
}

function matchKeywordExpressions(text = "", keywords = [], latestUser = null) {
  const expressions = (Array.isArray(keywords) ? keywords : [])
    .map((keyword) => safeText(keyword))
    .filter(Boolean);
  if (expressions.length === 0) {
    return false;
  }
  return expressions.every((expression) => matchKeywordExpression(text, expression, latestUser));
}

function textIncludesAnyKeyword(text = "", keywords = []) {
  const textValues = (Array.isArray(keywords) ? keywords : [])
    .flatMap((expression) => getKeywordExpressionTextValues(expression));
  return textValues.some((keyword) => findKeywordOccurrences(text, keyword).length > 0);
}

function getLatestUserKeywordSourceText(latestUser) {
  return latestUser
    ? getUserBaseModelContent(latestUser) || safeText(latestUser.content)
    : "";
}

function getCompressionKeywordSourceParts(currentState, latestUser) {
  const latestUserContent = getLatestUserKeywordSourceText(latestUser);
  const latestAssistantAfterUser = getLatestAssistantMessageAfterUser(currentState, latestUser);
  const latestAssistantContent = latestAssistantAfterUser
    ? getMessageModelContent(latestAssistantAfterUser)
    : "";
  return {
    user: latestUserContent,
    assistant: latestAssistantContent,
    both: [latestUserContent, latestAssistantContent].filter(Boolean).join("\n")
  };
}

function getCompressionKeywordSourceText(currentState, latestUser, source = "both") {
  const parts = getCompressionKeywordSourceParts(currentState, latestUser);
  if (source === "user") {
    return parts.user;
  }
  if (source === "assistant") {
    return parts.assistant;
  }
  return parts.both;
}

function getCompressionKeywordTriggerMatch(currentState, latestUser, triggers = {}) {
  const keywords = parseKeywordList(triggers.keywords || []);
  if (keywords.length === 0) {
    return {
      matched: false,
      matchedUser: false,
      matchedAssistant: false
    };
  }

  const source = normalizeKeywordTriggerSource(triggers.keywordSource);
  const parts = getCompressionKeywordSourceParts(currentState, latestUser);
  const matchedUser = source !== "assistant" && matchKeywordExpressions(parts.user, keywords, latestUser);
  const matchedAssistant = source !== "user" && matchKeywordExpressions(parts.assistant, keywords, latestUser);
  const matchedCombined = source === "both" && matchKeywordExpressions(parts.both, keywords, latestUser);
  const assistantHasKeyword = source !== "user" && textIncludesAnyKeyword(parts.assistant, keywords);

  return {
    matched: source === "both"
      ? matchedUser || matchedAssistant || matchedCombined
      : source === "assistant"
        ? matchedAssistant
        : matchedUser,
    matchedUser,
    matchedAssistant: matchedAssistant || (matchedCombined && assistantHasKeyword)
  };
}

function shouldTriggerCompressionProfile({
  profile,
  triggerAction = null,
  profileState,
  currentState,
  latestUser,
  uncompressedRounds,
  contextLimit
}) {
  const triggers = normalizeCompressionTriggerConfig(triggerAction?.triggers || profile.triggers, {
    defaultRoundLimit: profile.id === STANDARD_COMPRESSION_PROFILE_ID
  });
  const currentTurnNumber = Math.max(0, countConversationTurns(currentState, latestUser?.id || ""));
  const triggeredBy = [];

  if (triggers.roundLimit && uncompressedRounds.length >= contextLimit) {
    triggeredBy.push("達到正文上限輪數");
  }

  if (triggers.turns.includes(0)) {
    const alreadyStarted = safeText(profileState.summary) ||
      Number(profileState.compressedThroughTurnNumber || 0) > 0;
    if (!alreadyStarted && currentTurnNumber <= 1) {
      triggeredBy.push("開始觸發");
    }
  }

  triggers.turns
    .filter((turn) => turn > 0)
    .forEach((turn) => {
      if (currentTurnNumber >= turn && Number(profileState.compressedThroughTurnNumber || 0) < turn) {
        triggeredBy.push(`第 ${turn} 回合`);
      }
    });

  if (getCompressionKeywordTriggerMatch(currentState, latestUser, triggers).matched) {
    triggeredBy.push("觸發關鍵字");
  }

  return triggeredBy;
}

function buildMessagesToCompressForProfile({
  currentState,
  runtimeUserName,
  latestUser,
  profileState,
  uncompressedRounds,
  includeLatestUser,
  includeLatestAssistant
}) {
  const messagesToCompress = uncompressedRounds.flat();
  const openingDialogueMessage = Number(profileState.compressedThroughTurnNumber || 0) <= 0
    ? getOpeningDialogueContextMessage(currentState, runtimeUserName)
    : null;
  if (openingDialogueMessage && !messageListHasSameContent(messagesToCompress, openingDialogueMessage.content)) {
    messagesToCompress.unshift(openingDialogueMessage);
  }
  if (includeLatestUser && latestUser) {
    const latestUserContent = getCurrentUserModelContent(latestUser, currentState, runtimeUserName);
    if (latestUserContent && !messageListHasSameContent(messagesToCompress, latestUserContent)) {
      messagesToCompress.push({
        ...latestUser,
        role: "user",
        content: latestUserContent,
        requestContentPrepared: true
      });
    }
  }
  if (includeLatestAssistant) {
    const latestAssistant = getLatestAssistantMessageAfterUser(currentState, latestUser);
    const latestAssistantContent = latestAssistant ? getMessageModelContent(latestAssistant) : "";
    if (latestAssistantContent && !messageListHasSameContent(messagesToCompress, latestAssistantContent)) {
      messagesToCompress.push({
        ...latestAssistant,
        role: "assistant",
        content: latestAssistantContent
      });
    }
  }
  return messagesToCompress;
}

async function ensureContextCompressionSummary(currentState, runtimeUserName = "", options = {}) {
  const returnDetails = Boolean(options.returnDetails);
  const phase = options.phase || "before_reasoner";
  const emptyResult = (contextCompression) => {
    const result = {
      contextCompression: normalizeContextCompressionState(contextCompression),
      didProcess: false,
      skipReasoner: false,
      processedActions: []
    };
    setLastModelProcessingResult(currentState, result);
    return returnDetails ? result : result.contextCompression;
  };

  if (!isContextCompressionEnabled(currentState)) {
    return emptyResult(currentState.contextCompression);
  }
  const latestUser = getLatestUserMessage(currentState);
  if (!latestUser) {
    currentState.contextCompression = normalizeContextCompressionState(currentState.contextCompression);
    return emptyResult(currentState.contextCompression);
  }

  const contextLimit = Math.max(1, getDialogueContextRounds(currentState));
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  const rounds = getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUser.id);
  const profiles = getEnabledCompressionProfiles(currentState);
  let didCompress = false;
  const processedActions = [];

  for (const profile of profiles) {
    for (const triggerAction of getEnabledCompressionTriggerActions(profile)) {
      const currentCompressionState = normalizeContextCompressionState(currentState.contextCompression);
      const profileState = getCompressionProfileState(currentCompressionState, profile.id);
      const uncompressedRounds = rounds.filter((round) => getRoundTurnNumber(round) > profileState.compressedThroughTurnNumber);
      const triggeredBy = shouldTriggerCompressionProfile({
        profile,
        triggerAction,
        profileState,
        currentState,
        latestUser,
        uncompressedRounds,
        contextLimit
      });

      if (triggeredBy.length === 0) {
        continue;
      }

      const triggers = normalizeCompressionTriggerConfig(triggerAction.triggers || profile.triggers, {
        defaultRoundLimit: profile.id === STANDARD_COMPRESSION_PROFILE_ID
      });
      const triggeredByKeyword = triggeredBy.includes("觸發關鍵字");
      const keywordMatch = triggeredByKeyword
        ? getCompressionKeywordTriggerMatch(currentState, latestUser, triggers)
        : { matchedAssistant: false };
      const includeLatestAssistant = Boolean(keywordMatch.matchedAssistant);
      const includeLatestUser = includeLatestAssistant ||
        triggeredBy.includes("開始觸發") ||
        (triggeredByKeyword && triggers.keywordSource !== "assistant");
      const messagesToCompress = buildMessagesToCompressForProfile({
        currentState,
        runtimeUserName,
        latestUser,
        profileState,
        uncompressedRounds,
        includeLatestUser,
        includeLatestAssistant
      });
      if (messagesToCompress.length === 0) {
        continue;
      }

      const latestRoundNumber = getRoundTurnNumber(uncompressedRounds[uncompressedRounds.length - 1]) || 0;
      const latestUserTurnNumber = getMessageTurnNumber(latestUser) || countConversationTurns(currentState, latestUser.id);
      const compressedThroughTurnNumber = Math.max(
        profileState.compressedThroughTurnNumber,
        latestRoundNumber,
        includeLatestUser || triggerAction.action === MODEL_TRIGGER_ACTION_COPY_USER_INPUT ? latestUserTurnNumber : 0
      );
      const processedAction = {
        profileId: profile.id,
        profileName: profile.name || profile.id,
        actionId: triggerAction.id,
        actionName: getModelTriggerCompletionName(profile, triggerAction),
        action: triggerAction.action,
        skipReasoner: phase === "before_reasoner" && Boolean(triggerAction.skipReasoner),
        triggeredBy
      };

      if (triggerAction.action === MODEL_TRIGGER_ACTION_COPY_USER_INPUT) {
        const copiedContent = safeText(latestUser.content) ||
          getCurrentUserModelContent(latestUser, currentState, runtimeUserName);
        if (!copiedContent) {
          continue;
        }
        setCompressionProfileState(currentState, profile.id, {
          summary: copiedContent,
          compressedThroughTurnNumber,
          updatedAt: nowIso()
        });
        processedActions.push(processedAction);
        didCompress = true;
        continue;
      }

      const activeCompressionConfig = normalizeContextCompressionPromptConfig(
        profile.contextCompression,
        getContextCompressionPrompt(),
        {
          allowEmptyModels: profile.id !== STANDARD_COMPRESSION_PROFILE_ID,
          allowEmptyMainRules: profile.id !== STANDARD_COMPRESSION_PROFILE_ID
        }
      );
      options.onStatus?.("compression");
      const completion = await callChatApiCompletionRaw({
        messages: [
          {
            role: "user",
            content: [
              `【大模型】${profile.name} (${profile.id})`,
              `【觸發組合】${triggerAction.name} (${triggerAction.id})`,
              `【觸發原因】${triggeredBy.join("、")}`,
              "【模型規則】",
              buildContextCompressionInstructionPrompt(currentState, profile)
            ].join("\n")
          },
          {
            role: "user",
            content: formatCompressionContextBlock(messagesToCompress)
          },
          {
            role: "user",
            content: buildCurrentCompressionContentMessage(profileState.summary)
          }
        ],
        purpose: profile.id === STANDARD_COMPRESSION_PROFILE_ID
          ? "context_compression"
          : `context_compression:${profile.id}`
      });

      setCompressionProfileState(currentState, profile.id, {
        summary: mergeCompressionSummary(profileState.summary, completion.content, activeCompressionConfig),
        compressedThroughTurnNumber,
        updatedAt: nowIso()
      });
      processedActions.push(processedAction);
      didCompress = true;
    }
  }

  currentState.contextCompression = normalizeContextCompressionState(currentState.contextCompression);
  const result = {
    contextCompression: currentState.contextCompression,
    didProcess: processedActions.length > 0,
    skipReasoner: processedActions.some((item) => item.skipReasoner),
    processedActions
  };
  setLastModelProcessingResult(currentState, result);
  if (didCompress) {
    saveState(currentState);
  } else {
    currentState.contextCompression = compressionState;
    result.contextCompression = currentState.contextCompression;
  }
  return returnDetails ? result : currentState.contextCompression;
}

async function updateCompressionAfterAssistantMessage(currentState, runtimeUserName = "", assistantMessage = null) {
  if (isCharacterCardCreationAssistantActive(currentState)) {
    return false;
  }
  const compressionBefore = normalizeContextCompressionState(currentState.contextCompression);
  const compressionAfter = await ensureContextCompressionSummary(currentState, runtimeUserName, {
    phase: "after_assistant"
  });
  const didAdvance = didContextCompressionAdvance(compressionBefore, compressionAfter);
  if (didAdvance && assistantMessage?.extra) {
    assistantMessage.extra.compressionNotice = true;
    assistantMessage.extra.stateAfterTurnSnapshot = captureNarrativeCheckpoint(currentState);
  }
  return didAdvance;
}

function buildSimpleCompressedReasonerStaticSystemPrompt(currentState, runtimeUserName = "", config = null) {
  const resolvedUserName = resolveUserDisplayName(currentState.userProfile, runtimeUserName);
  const activeRoleCard = getActiveRoleCard(currentState);
  const activeConfig = config || getActiveModularPromptConfig(currentState);
  return [
    "【主要規則】",
    finalizePromptTemplate(activeConfig.reasonerHistory.mainRules, { user: resolvedUserName }),
    formatModularRoleContext(currentState, activeRoleCard, resolvedUserName, {
      includeIdentityHeader: false,
      includeIdentityContent: false,
      includeLorebooks: false,
      runtimeUserName,
      purpose: "reasoner"
    }),
    "【輸出規則】",
    finalizePromptTemplate(activeConfig.reasonerHistory.contextRules, { user: resolvedUserName }),
    "【處理要求】",
    "後續獨立 user message 會提供目前模型內容；最近對話會以獨立 user/assistant messages 提供。本輪 user message 可能會按順序包含：目前輸入者、這一輪 user 的內容、已啟用大模型的追加詞、統計時間、觸發世界書 Lorebooks、自訂補充。請根據主要規則、角色卡、目前模型內容、最近對話與輸出規則輸出正文。"
  ].filter(Boolean).join("\n");
}

function buildSimpleCompressedReasonerCompressionMessage(currentState) {
  const summaries = formatAllCompressionSummariesForReasoner(currentState);
  if (!summaries) {
    return "";
  }
  return [
    "【目前模型內容】",
    summaries,
    "【模型內容規則】",
    "這是更早之前的大模型內容，可能來自多個獨立大模型；可用於補足背景、角色關係、已成立事件、未完成事項、玩家資料與特殊長期記憶。",
    "模型內容的承接優先級略高於正文主要規則；若最近對話或本輪輸入與目前模型內容衝突，以最近對話與本輪輸入為準。"
  ].filter(Boolean).join("\n");
}

function buildSimpleCompressedReasonerSupportMessage(currentState, runtimeUserName = "") {
  return "";
}

function getSimpleCompressedContextMessages(currentState, runtimeUserName = "") {
  const latestUser = getLatestUserMessage(currentState);
  if (!latestUser) {
    const openingDialogueMessage = getOpeningDialogueContextMessage(currentState, runtimeUserName);
    return openingDialogueMessage ? [openingDialogueMessage] : [];
  }
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  const contextLimit = Math.max(1, getDialogueContextRounds(currentState));
  const openingDialogueMessage = getOpeningDialogueContextMessage(currentState, runtimeUserName);
  const allRounds = getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUser.id);
  const rounds = allRounds
    .filter((round) => getRoundTurnNumber(round) > compressionState.compressedThroughTurnNumber)
    .slice(-contextLimit);
  const messages = rounds.flat();
  const hasRecentAssistant = messages.some((message) => message?.role === "assistant");
  if (!hasRecentAssistant) {
    const bridgeRound = getLastCompletedDialogueRound(allRounds);
    if (bridgeRound) {
      messages.unshift(...bridgeRound);
    }
  }
  if (
    compressionState.compressedThroughTurnNumber <= 0 &&
    openingDialogueMessage &&
    !messageListHasSameContent(messages, openingDialogueMessage.content)
  ) {
    messages.unshift(openingDialogueMessage);
  }
  const latestUserContent = getCurrentUserModelContent(latestUser, currentState, runtimeUserName);
  if (latestUserContent) {
    messages.push({
      ...latestUser,
      role: "user",
      content: latestUserContent,
      requestContentPrepared: true
    });
  }
  return messages;
}

function buildSimpleCompressedReasonerMessages(currentState, runtimeUserName = "") {
  const supportMessage = buildSimpleCompressedReasonerSupportMessage(currentState, runtimeUserName);
  const compressionMessage = buildSimpleCompressedReasonerCompressionMessage(currentState);
  return [
    {
      role: "system",
      content: buildSimpleCompressedReasonerStaticSystemPrompt(currentState, runtimeUserName)
    },
    ...(compressionMessage ? [{ role: "user", content: compressionMessage }] : []),
    ...(supportMessage ? [{ role: "user", content: supportMessage }] : []),
    ...buildCacheableDialogueMessages(getSimpleCompressedContextMessages(currentState, runtimeUserName))
  ];
}

function buildModularPromptPreview(currentState, mode = "single", configInput = {}) {
  const normalizedMode = normalizeRoleCardMode(mode);
  const config = normalizeModularPromptConfig(configInput, normalizedMode);
  return {
    mode: normalizedMode,
    reasonerHistorySystemPrompt: buildSimpleCompressedReasonerStaticSystemPrompt(currentState, "", config),
    contextCompressionPrompt: buildContextCompressionInstructionPrompt(currentState, config),
    contextCompressionSystemPrompt: buildContextCompressionInstructionPrompt(currentState, config)
  };
}

function getMessageModelContent(message) {
  if (!message || typeof message !== "object") {
    return "";
  }

  if (message.role === "assistant") {
    const cleaned = finalizeAssistantOutputContent(message.content);
    return cleaned.content || safeText(message.content);
  }

  if (message.role === "user") {
    const modelContent = safeText(message.modelContent || message.extra?.modelContent);
    if (modelContent) {
      return stripUserIdentityTextFromContent(modelContent);
    }
  }

  return message.role === "user"
    ? stripUserIdentityTextFromContent(message.content)
    : safeText(message.content);
}

function getLatestAssistantContent(currentState) {
  for (let i = currentState.conversation.length - 1; i >= 0; i -= 1) {
    const item = currentState.conversation[i];
    if (item.role === "assistant") {
      return safeText(item.content);
    }
  }
  return "";
}

function getLatestAssistantMessageAfterUser(currentState, latestUser = null) {
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  const userIndex = latestUser
    ? conversation.findIndex((item) => item?.id === latestUser.id)
    : findLatestUserIndex(currentState);
  if (userIndex < 0) {
    return null;
  }
  for (let i = conversation.length - 1; i > userIndex; i -= 1) {
    if (conversation[i]?.role === "assistant") {
      return conversation[i];
    }
  }
  return null;
}

function isContinueDirectiveToken(input) {
  const normalized = safeText(input).toLowerCase().replace(/\s+/g, "");
  return (
    normalized === "繼續" ||
    normalized === "继续" ||
    normalized === "continue" ||
    normalized === "goon" ||
    normalized === "續寫" ||
    normalized === "续写" ||
    normalized === "接續" ||
    normalized === "接续"
  );
}

function parseRoleplayInput(rawInput, currentState) {
  const raw = safeText(rawInput);
  const wrappedContinueMatch = raw.match(/^[（(]\s*([^()（）]+?)\s*[）)]$/);
  const continueToken = safeText(wrappedContinueMatch?.[1]);
  const latestAssistant = getLatestAssistantContent(currentState).slice(-600);

  if (continueToken && isContinueDirectiveToken(continueToken)) {
    const baseModelContent = latestAssistant
      ? [
          "【場外指令】繼續",
          "【要求】請依照全局資訊延續上一段 AI 內容，直接往下寫，不要重覆。",
          `【上一段AI】${latestAssistant}`
        ].join("\n")
      : "【場外指令】繼續\n【要求】目前沒有上一段 AI 內容，請依照全局資訊開始回覆。";
    return {
      inputKind: "continue",
      rawInput: raw,
      modelContent: baseModelContent
    };
  }

  return {
    inputKind: "dialogue",
    rawInput: raw,
    modelContent: raw
  };
}

function buildReasonerHistoryMessages(state, runtimeUserName = "", options = {}) {
  return appendReloadFeedbackMessage(
    buildSimpleCompressedReasonerMessages(state, runtimeUserName),
    options.reloadFeedback
  );
}

function buildCharacterCardCreationAssistantMessages(state, runtimeUserName = "", options = {}) {
  const latestUser = getLatestUserMessage(state);
  const baseMessages = [
    {
      role: "system",
      content: buildCharacterCardCreationAssistantSystemPrompt(state, runtimeUserName)
    }
  ];

  if (!latestUser) {
    return appendReloadFeedbackMessage(baseMessages, options.reloadFeedback);
  }

  const contextMessages = getAllConversationContextMessages(state, latestUser.id);

  return appendReloadFeedbackMessage(
    [
      ...baseMessages,
      ...contextMessages.map((item) => ({
        role: item.role,
        content: getMessageModelContent(item)
      })),
      {
        role: "user",
        content: getCurrentUserModelContent(latestUser, state)
      }
    ],
    options.reloadFeedback
  );
}

function normalizeChatApiProvider(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/[-\s]+/g, "_");
  if (["deepseek", "openai", "gemini", "custom"].includes(normalized)) {
    return normalized;
  }
  return DEFAULT_CHAT_API_PROVIDER;
}

function getChatApiProvider() {
  return normalizeChatApiProvider(envFirstText(["CHAT_API_PROVIDER", "CONVERSATION_API_PROVIDER"], DEFAULT_CHAT_API_PROVIDER));
}

function getDefaultChatApiBaseUrl(provider = getChatApiProvider()) {
  const normalizedProvider = normalizeChatApiProvider(provider);
  if (normalizedProvider === "openai") {
    return "https://api.openai.com/v1";
  }
  if (normalizedProvider === "gemini") {
    return "https://generativelanguage.googleapis.com/v1beta/openai";
  }
  if (normalizedProvider === "custom") {
    return "";
  }
  return "https://api.deepseek.com";
}

function getChatApiBaseUrl() {
  const provider = getChatApiProvider();
  return envFirstText(
    ["CHAT_API_BASE_URL", "CONVERSATION_API_BASE_URL", "DEEPSEEK_BASE_URL"],
    getDefaultChatApiBaseUrl(provider)
  );
}

function getChatApiCompletionsUrlFromBaseUrl(baseUrl = "") {
  const normalizedBaseUrl = safeText(baseUrl).replace(/\/+$/u, "");
  if (!normalizedBaseUrl) {
    return "";
  }
  if (/\/chat\/completions$/u.test(normalizedBaseUrl)) {
    return normalizedBaseUrl;
  }
  return `${normalizedBaseUrl}/chat/completions`;
}

function getChatApiCompletionsUrl() {
  return getChatApiCompletionsUrlFromBaseUrl(getChatApiBaseUrl());
}

function isContextCompressionPurpose(purpose = "") {
  return safeText(purpose).startsWith("context_compression");
}

function getPrimaryChatApiKey() {
  const provider = getChatApiProvider();
  const providerKeys = provider === "openai"
    ? ["OPENAI_API_KEY"]
    : provider === "gemini"
      ? ["GEMINI_API_KEY"]
      : provider === "deepseek"
        ? ["DEEPSEEK_API_KEY"]
        : [];
  return envFirstText([
    "CHAT_API_KEY",
    "CONVERSATION_API_KEY",
    ...providerKeys,
    "DEEPSEEK_API_KEY"
  ]);
}

function getChatApiProcessingKeyEntries(envSource = process.env) {
  const source = envSource && typeof envSource === "object" ? envSource : {};
  const entries = Object.entries(source)
    .map(([key, value]) => {
      const match = key.match(/^CHAT_API_KEY([2-9]\d*)$/u);
      if (!match) {
        return null;
      }
      const index = Number(match[1]);
      const text = safeText(value);
      return Number.isFinite(index) && index >= 2 && text ? { index, value: text } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.index - b.index);

  if (!entries.some((entry) => entry.index === 2)) {
    const legacyKey2 = envObjectFirstText(source, [
      "CONVERSATION_API_KEY2",
      "DEEPSEEK_API_KEY2",
      "DEEPSEEK_KEY2",
      "deepseek_key2"
    ]);
    if (legacyKey2) {
      entries.unshift({ index: 2, value: legacyKey2 });
    }
  }

  return entries;
}

function getContextCompressionProfileIdFromPurpose(purpose = "") {
  const normalizedPurpose = safeText(purpose);
  if (!isContextCompressionPurpose(normalizedPurpose)) {
    return "";
  }
  const [, profileId = ""] = normalizedPurpose.split(":");
  return profileId ? normalizeCompressionProfileId(profileId) : STANDARD_COMPRESSION_PROFILE_ID;
}

function getContextCompressionProfileOrderIndex(purpose = "", currentState = state) {
  const profileId = getContextCompressionProfileIdFromPurpose(purpose);
  if (!profileId) {
    return 0;
  }
  const profiles = getEnabledCompressionProfiles(currentState);
  const index = profiles.findIndex((profile) => normalizeCompressionProfileId(profile.id) === profileId);
  return index >= 0 ? index : 0;
}

function getContextCompressionChatApiKey(purpose = "context_compression") {
  const processingKeys = getChatApiProcessingKeyEntries(process.env);
  if (processingKeys.length === 0) {
    return getPrimaryChatApiKey();
  }
  const profileIndex = getContextCompressionProfileOrderIndex(purpose);
  const keyIndex = Math.min(profileIndex, processingKeys.length - 1);
  return processingKeys[keyIndex]?.value || getPrimaryChatApiKey();
}

function getChatApiModel(purpose = "chat") {
  const settings = normalizeConversationSettings(state?.conversationSettings);
  return envFirstText(
    ["CHAT_API_MODEL", "CONVERSATION_API_MODEL", "OPENAI_MODEL", "GEMINI_MODEL", "DEEPSEEK_MODEL"],
    settings.chatOutputModel || DEFAULT_CHAT_API_MODEL
  );
}

function getChatApiKey(purpose = "chat") {
  if (isContextCompressionPurpose(purpose)) {
    return getContextCompressionChatApiKey(purpose);
  }
  return getPrimaryChatApiKey();
}

function getChatApiTemperature(purpose = "chat", temperature = null) {
  if (purpose === "character_card_creation_assistant_chat") {
    return CHARACTER_CARD_CREATION_ASSISTANT_TEMPERATURE;
  }
  if (Number.isFinite(temperature)) {
    return temperature;
  }
  const envTemperature = Number(process.env.CHAT_API_TEMPERATURE || process.env.CONVERSATION_API_TEMPERATURE || "");
  return Number.isFinite(envTemperature) ? envTemperature : CHAT_API_TEMPERATURE;
}

function getChatApiRequestTimeoutMs() {
  return envFirstNumber(
    ["CHAT_API_REQUEST_TIMEOUT_MS", "CHAT_API_TIMEOUT_MS", "CONVERSATION_API_TIMEOUT_MS", "DEEPSEEK_REQUEST_TIMEOUT_MS"],
    600000
  );
}

function getChatApiMaxTokensCap(model = "") {
  const configuredCap = envFirstNumber(["CHAT_API_MODEL_TOKEN_CAP", "CONVERSATION_API_MODEL_TOKEN_CAP"], 0);
  if (configuredCap > 0) {
    return configuredCap;
  }
  const normalizedModel = safeText(model).toLowerCase();
  if (normalizedModel === "deepseek-chat") {
    return 8192;
  }
  return 64000;
}

function shouldRetryChatApiLength(purpose = "chat") {
  return (
    purpose === "reasoner_history_chat" ||
    purpose === "chat_expand" ||
    purpose === "character_card_creation_assistant_chat"
  );
}

function buildChatApiLengthRetryMessages(messages, partialContent = "") {
  const partial = safeText(partialContent).trim();
  if (partial) {
    return [
      ...messages,
      {
        role: "user",
        content: [
          "【續寫要求】你上一則回覆因輸出長度限制被截斷。",
          "請忽略剛才那段被截斷的半成品，根據同一上下文重新生成一版完整、自然、收束的正文。",
          "不要從殘句、命令句、列表尾巴或中斷位置硬接續，不要重複提示，不要解釋，不要加標題。"
        ].join("\n")
      }
    ];
  }

  return [
    ...messages,
    {
      role: "user",
      content: [
        "【補救要求】你上一輪因輸出長度限制，未完整輸出正文。",
        "請減少鋪陳與背景思考，直接輸出完整正文，不要重複要求，不要解釋。"
      ].join("\n")
    }
  ];
}

function resolveChatApiMaxTokens({ purpose = "reasoner_history_chat", maxTokens, model = "" } = {}) {
  const resolvedModel = safeText(model) || getChatApiModel(purpose);
  const modelCap = getChatApiMaxTokensCap(resolvedModel);

  if (Number.isFinite(maxTokens) && maxTokens > 0) {
    return Math.min(Math.floor(maxTokens), modelCap);
  }

  const envMaxTokens = Number(process.env.CHAT_API_MAX_TOKENS || process.env.CONVERSATION_API_MAX_TOKENS || process.env.DEEPSEEK_MAX_TOKENS || "");
  const preferredEnvMaxTokens = envMaxTokens;
  if (
    Number.isFinite(preferredEnvMaxTokens) &&
    preferredEnvMaxTokens > 0 &&
    (
      purpose === "reasoner_history_chat" ||
      purpose === "context_compression" ||
      purpose === "chat_expand" ||
      purpose === "character_card_creation_assistant_chat"
    )
  ) {
    return Math.min(Math.floor(preferredEnvMaxTokens), modelCap);
  }

  if (
    purpose === "reasoner_history_chat" ||
    purpose === "context_compression" ||
    purpose === "chat_expand" ||
    purpose === "character_card_creation_assistant_chat"
  ) {
    return Math.min(32000, modelCap);
  }
  return Math.min(700, modelCap);
}

function extractChatApiMessageText(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          return safeText(item.text || item.content);
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object") {
    return safeText(content.text || content.content);
  }
  return "";
}

function createGenerationStoppedError() {
  const error = new Error(GENERATION_STOPPED_MESSAGE);
  error.name = "GenerationStoppedError";
  error.code = "GENERATION_STOPPED";
  return error;
}

function isGenerationStoppedError(error) {
  return error?.code === "GENERATION_STOPPED" ||
    error?.name === "GenerationStoppedError" ||
    safeText(error?.message) === GENERATION_STOPPED_MESSAGE;
}

function registerActiveGenerationRequest(entry) {
  activeGenerationRequest = entry;
}

function clearActiveGenerationRequest(entry) {
  if (activeGenerationRequest === entry) {
    activeGenerationRequest = null;
  }
}

function requestStopActiveGeneration() {
  if (!activeGenerationRequest || activeGenerationRequest.controller?.signal?.aborted) {
    return false;
  }
  activeGenerationRequest.stoppedByUser = true;
  activeGenerationRequest.controller.abort(createGenerationStoppedError());
  return true;
}

function isActiveGenerationRunning() {
  return Boolean(activeGenerationRequest && !activeGenerationRequest.controller?.signal?.aborted);
}

function createTimeoutController(timeoutMs = getChatApiRequestTimeoutMs(), options = {}) {
  const controller = new AbortController();
  const generationEntry = options.trackGeneration
    ? {
        controller,
        purpose: safeText(options.purpose),
        startedAt: nowIso(),
        stoppedByUser: false,
        timedOut: false
      }
    : null;
  if (generationEntry) {
    registerActiveGenerationRequest(generationEntry);
  }
  const timeout = setTimeout(() => {
    if (generationEntry) {
      generationEntry.timedOut = true;
    }
    controller.abort();
  }, Math.max(1000, timeoutMs));
  return {
    controller,
    timeout,
    generationEntry,
    cleanup: () => {
      clearTimeout(timeout);
      clearActiveGenerationRequest(generationEntry);
    }
  };
}

function formatFetchErrorMessage(error, generationEntry = null) {
  if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
    return GENERATION_STOPPED_MESSAGE;
  }
  if (error?.name === "AbortError") {
    return `請求逾時（${Math.round(getChatApiRequestTimeoutMs() / 1000)}秒未回應）`;
  }
  return safeText(error?.message) || "請求在回傳完成前中斷";
}

function throwIfGenerationStopped(generationEntry = null) {
  if (generationEntry?.stoppedByUser) {
    throw createGenerationStoppedError();
  }
}

function appendReloadFeedbackMessage(messages, reloadFeedback = "") {
  const feedback = safeText(reloadFeedback);
  if (!feedback) {
    return messages;
  }

  return [
    ...messages,
    {
      role: "user",
      content: [
        "【重生成改進要求】",
        feedback,
        "【說明】這是使用者對你上一版回覆不滿意的地方與希望改進的地方，不是新的劇情輸入。",
        "【要求】請基於同一輪使用者輸入重新生成更好的版本。",
        "不要解釋修改過程，不要引用這段要求，直接給出新的角色回覆。"
      ].join("\n")
    }
  ];
}

function normalizeOpeningEchoComparisonText(content = "") {
  return safeText(content)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}\s]+/gu, "");
}

function stripRoleplayActionMarkup(content = "") {
  return safeText(content)
    .replace(/[\(（][^()（）\r\n]{0,200}[\)）]/gu, "")
    .replace(/[［\[][^［\]\[\]\r\n]{0,200}[］\]]/gu, "")
    .trim();
}

function collectOpeningEchoComparisonTargets(userInput = "") {
  const rawInput = safeText(userInput);
  const targets = new Set();
  const addTarget = (value = "") => {
    const normalized = normalizeOpeningEchoComparisonText(value);
    if (normalized) {
      targets.add(normalized);
    }
  };

  addTarget(rawInput);
  addTarget(stripRoleplayActionMarkup(rawInput));

  rawInput.split(/\r?\n/u).forEach((line) => {
    addTarget(line);
    addTarget(stripRoleplayActionMarkup(line));
  });

  return targets;
}

function isOpeningEchoWrapperChar(char = "") {
  return /[\p{P}\p{S}]/u.test(char);
}

function nextCodePointIndex(text = "", index = 0) {
  const codePoint = text.codePointAt(index);
  return index + (codePoint && codePoint > 0xffff ? 2 : 1);
}

function extendOpeningEchoRemovalEnd(text = "", endIndex = 0) {
  let index = endIndex;
  while (index < text.length) {
    const char = text.slice(index, nextCodePointIndex(text, index));
    if (!isOpeningEchoWrapperChar(char)) {
      break;
    }
    index = nextCodePointIndex(text, index);
  }
  while (index < text.length) {
    const char = text.slice(index, nextCodePointIndex(text, index));
    if (!/\s/u.test(char)) {
      break;
    }
    index = nextCodePointIndex(text, index);
  }
  return index;
}

function collectOpeningEchoCandidateEnds(text = "") {
  const scanLimit = Math.min(text.length, 400);
  const candidateEnds = new Set();
  const lineBreakIndex = text.search(/\r?\n/u);
  if (lineBreakIndex >= 0 && lineBreakIndex <= scanLimit) {
    candidateEnds.add(lineBreakIndex);
  }

  const sentenceBoundaryPattern = /[。！？!?]+|\.{1,3}(?=[\s"'’”」』）】》〉〕〗〙〛]|$)|…+/gu;
  const sentenceBoundaryMatch = sentenceBoundaryPattern.exec(text.slice(0, scanLimit));
  if (sentenceBoundaryMatch) {
    candidateEnds.add(sentenceBoundaryMatch.index + sentenceBoundaryMatch[0].length);
  }

  const firstChar = text.slice(0, nextCodePointIndex(text, 0));
  const quotePairs = {
    "\"": "\"",
    "'": "'",
    "“": "”",
    "‘": "’",
    "「": "」",
    "『": "』",
    "（": "）",
    "(": ")",
    "【": "】",
    "《": "》",
    "〈": "〉"
  };
  const closingQuote = quotePairs[firstChar];
  if (closingQuote) {
    const closingQuoteIndex = text.indexOf(closingQuote, firstChar.length);
    if (closingQuoteIndex > 0 && closingQuoteIndex <= scanLimit) {
      candidateEnds.add(closingQuoteIndex + closingQuote.length);
    }
  }

  return [...candidateEnds].sort((a, b) => a - b);
}

function removeRepeatedOpeningUserEcho(content = "", userInput = "") {
  const targets = collectOpeningEchoComparisonTargets(userInput);
  const rawContent = safeText(content);
  if (targets.size === 0 || !rawContent) {
    return rawContent;
  }

  const trimmedContent = rawContent.trimStart();
  for (const candidateEnd of collectOpeningEchoCandidateEnds(trimmedContent)) {
    const candidate = trimmedContent.slice(0, candidateEnd);
    if (!targets.has(normalizeOpeningEchoComparisonText(candidate))) {
      continue;
    }
    const removalEnd = extendOpeningEchoRemovalEnd(trimmedContent, candidateEnd);
    return trimmedContent.slice(removalEnd).trimStart();
  }

  return rawContent;
}

function finalizeAssistantOutputContent(content = "", options = {}) {
  const userInput = safeText(options.userInput);
  const cleanedContent = userInput
    ? removeRepeatedOpeningUserEcho(content, userInput)
    : safeText(content);
  return {
    content: cleanedContent
  };
}

function shouldDisplayCompressionNotice(message) {
  return Boolean(message?.extra?.compressionNotice || message?.compressionNotice);
}

function formatAssistantMessageForUserDisplay(message) {
  const content = safeText(message?.content);
  if (!shouldDisplayCompressionNotice(message)) {
    return content;
  }
  if (content.startsWith(COMPRESSION_USER_NOTICE_TEXT)) {
    return content;
  }
  return [COMPRESSION_USER_NOTICE_TEXT, content].filter(Boolean).join("\n\n");
}

function hasUsageTokens(usage) {
  const normalized = normalizeAiUsage(usage);
  return Boolean(
    normalized.promptTokens !== null ||
      normalized.completionTokens !== null ||
      normalized.totalTokens !== null
  );
}

function splitTextBlocks(value = "") {
  const source = safeText(value).trim();
  if (!source) {
    return [];
  }
  return source
    .split(/\n\s*\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildContinuationMessagesForMinimumLength(state, assistantText, runtimeUserName = "") {
  const baseMessages = buildReasonerHistoryMessages(state, runtimeUserName);
  return [
    ...baseMessages,
    { role: "assistant", content: assistantText },
    {
      role: "user",
      content: [
        "【補寫要求】",
        `你上一段正式回覆仍不足${getMinimumReplyChars()}字。`,
        "請直接延續上一段情節往下寫，補足篇幅。",
        "不要重寫開頭，不要摘要，不要解釋，不要說明字數。"
      ].join("\n")
    }
  ];
}

async function ensureMinimumAssistantLength(state, assistantText, runtimeUserName = "") {
  let output = safeText(assistantText);
  const minimum = getMinimumReplyChars();
  const maxExpandAttempts = 2;

  for (let attempt = 0; attempt < maxExpandAttempts; attempt += 1) {
    if (!output || countVisibleCharacters(output) >= minimum) {
      break;
    }

    console.warn(`回覆字數不足 ${minimum} 字，開始第 ${attempt + 1} 次補寫。`);

    try {
      const continuation = await callChatApiCompletion({
        messages: buildContinuationMessagesForMinimumLength(state, output, runtimeUserName),
        purpose: "chat_expand"
      });

      const extra = safeText(continuation).trim();
      if (!extra) {
        break;
      }

      output = `${output}\n${extra}`.trim();
    } catch (error) {
      console.warn(`補寫失敗，保留原回覆：${error.message}`);
      break;
    }
  }

  if (output && countVisibleCharacters(output) < minimum) {
    console.warn(`回覆字數仍不足 ${minimum} 字，已達補寫上限。`);
  }
  return output;
}

function getMissingChatApiKeyPlaceholder(purpose = "chat") {
  if (isContextCompressionPurpose(purpose) && !getPrimaryChatApiKey()) {
    return "尚未設定 CHAT_API_KEY / 對話 API Key，這是本地回覆佔位訊息。";
  }
  return "尚未設定 CHAT_API_KEY / 對話 API Key，這是本地回覆佔位訊息。";
}

function getChatApiMaxTokensParamName() {
  return normalizeChatApiMaxTokensParamName(
    envFirstText(["CHAT_API_MAX_TOKENS_PARAM", "CONVERSATION_API_MAX_TOKENS_PARAM"], "max_tokens")
  );
}

function normalizeChatApiMaxTokensParamName(value = "") {
  return value === "max_completion_tokens" ? "max_completion_tokens" : "max_tokens";
}

function buildChatApiRequestBody({
  model,
  temperature,
  maxTokens,
  messages,
  stream = false,
  responseFormat = null,
  maxTokensParamName = getChatApiMaxTokensParamName()
}) {
  const requestBody = {
    model,
    temperature,
    messages
  };
  requestBody[normalizeChatApiMaxTokensParamName(maxTokensParamName)] = maxTokens;
  if (stream) {
    requestBody.stream = true;
    requestBody.stream_options = {
      include_usage: true
    };
  }
  if (responseFormat && typeof responseFormat === "object") {
    requestBody.response_format = responseFormat;
  }
  return requestBody;
}

function getChatApiProviderKeyAliases(provider = DEFAULT_CHAT_API_PROVIDER) {
  const normalizedProvider = normalizeChatApiProvider(provider);
  if (normalizedProvider === "openai") {
    return ["OPENAI_API_KEY"];
  }
  if (normalizedProvider === "gemini") {
    return ["GEMINI_API_KEY"];
  }
  if (normalizedProvider === "deepseek") {
    return ["DEEPSEEK_API_KEY"];
  }
  return [];
}

function resolveChatApiTestConfig(envSource = {}) {
  const provider = normalizeChatApiProvider(
    envObjectFirstText(envSource, ["CHAT_API_PROVIDER", "CONVERSATION_API_PROVIDER"], DEFAULT_CHAT_API_PROVIDER)
  );
  const baseUrl = envObjectFirstText(
    envSource,
    ["CHAT_API_BASE_URL", "CONVERSATION_API_BASE_URL", "DEEPSEEK_BASE_URL"],
    getDefaultChatApiBaseUrl(provider)
  );
  const apiKey = envObjectFirstText(
    envSource,
    [
      "CHAT_API_KEY",
      "CONVERSATION_API_KEY",
      ...getChatApiProviderKeyAliases(provider),
      "DEEPSEEK_API_KEY"
    ]
  );
  const model = envObjectFirstText(
    envSource,
    ["CHAT_API_MODEL", "CONVERSATION_API_MODEL", "OPENAI_MODEL", "GEMINI_MODEL", "DEEPSEEK_MODEL"],
    DEFAULT_CHAT_API_MODEL
  );
  const requestTimeoutMs = Math.min(
    envObjectFirstNumber(
      envSource,
      ["CHAT_API_TEST_TIMEOUT_MS", "CHAT_API_REQUEST_TIMEOUT_MS", "CHAT_API_TIMEOUT_MS", "CONVERSATION_API_TIMEOUT_MS", "DEEPSEEK_REQUEST_TIMEOUT_MS"],
      30000
    ),
    30000
  );
  const maxTokensParamName = normalizeChatApiMaxTokensParamName(
    envObjectFirstText(envSource, ["CHAT_API_MAX_TOKENS_PARAM", "CONVERSATION_API_MAX_TOKENS_PARAM"], "max_tokens")
  );
  return {
    provider,
    apiKey,
    baseUrl,
    completionsUrl: getChatApiCompletionsUrlFromBaseUrl(baseUrl),
    model,
    requestTimeoutMs,
    maxTokensParamName
  };
}

async function testChatApiConnection(envSource = {}) {
  const startedAt = Date.now();
  const config = resolveChatApiTestConfig(envSource);
  const publicConfig = {
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    maxTokensParam: config.maxTokensParamName
  };

  if (!config.apiKey) {
    return {
      ok: false,
      message: "連接失敗：未設定對話 API Key。",
      ...publicConfig
    };
  }

  if (!config.completionsUrl) {
    return {
      ok: false,
      message: "連接失敗：Base URL 未設定。custom 供應商必須填 CHAT_API_BASE_URL。",
      ...publicConfig
    };
  }

  const requestBody = buildChatApiRequestBody({
    model: config.model,
    temperature: 0,
    maxTokens: 8,
    maxTokensParamName: config.maxTokensParamName,
    messages: [
      {
        role: "user",
        content: "Connection test. Reply with OK."
      }
    ]
  });

  let response;
  const { controller, timeout } = createTimeoutController(config.requestTimeoutMs);
  try {
    response = await fetch(config.completionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      message: `連接失敗：${formatFetchErrorMessage(error)}`,
      durationMs: Date.now() - startedAt,
      ...publicConfig
    };
  }

  let text = "";
  try {
    text = await response.text();
  } catch (error) {
    clearTimeout(timeout);
    return {
      ok: false,
      message: `連接失敗：回應讀取失敗：${formatFetchErrorMessage(error)}`,
      durationMs: Date.now() - startedAt,
      ...publicConfig
    };
  }
  clearTimeout(timeout);

  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorText = safeText(payload?.error?.message || text).replace(/\s+/g, " ");
    return {
      ok: false,
      message: `連接失敗：HTTP ${response.status}${errorText ? ` ${errorText.slice(0, 220)}` : ""}`,
      status: response.status,
      durationMs: Date.now() - startedAt,
      ...publicConfig
    };
  }

  const content = extractChatApiMessageText(payload?.choices?.[0]?.message?.content).trim();
  const finishReason = safeText(payload?.choices?.[0]?.finish_reason);
  if (!content && !finishReason) {
    return {
      ok: false,
      message: "連接失敗：API 回應格式不完整。",
      status: response.status,
      durationMs: Date.now() - startedAt,
      responsePreview: safeText(text).slice(0, 220),
      ...publicConfig
    };
  }

  return {
    ok: true,
    message: `連接成功（${Date.now() - startedAt}ms）。`,
    status: response.status,
    durationMs: Date.now() - startedAt,
    responsePreview: content.slice(0, 80),
    finishReason,
    usage: normalizeAiUsage(payload?.usage),
    ...publicConfig
  };
}

async function callChatApiCompletionRaw({
  messages,
  temperature = null,
  maxTokens,
  purpose = "chat",
  retryCount = 0,
  responseFormat = null
}) {
  const apiKey = getChatApiKey(purpose);
  const model = getChatApiModel(purpose);
  const resolvedTemperature = getChatApiTemperature(purpose, temperature);
  const resolvedMaxTokens = resolveChatApiMaxTokens({ purpose, maxTokens, model });
  const requestMessages = cloneData(messages, []);
  if (!apiKey) {
    const placeholder = getMissingChatApiKeyPlaceholder(purpose);
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: placeholder,
      usage: null,
      status: "skipped",
      createdAt: nowIso()
    });
    return {
      content: placeholder,
      reasoningContent: "",
      model,
      maxTokens: resolvedMaxTokens,
      usage: null
    };
  }

  const completionsUrl = getChatApiCompletionsUrl();
  if (!completionsUrl) {
    const errorMessage = "對話 API Base URL 未設定。使用 custom 供應商時請設定 CHAT_API_BASE_URL。";
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: "",
      error: errorMessage,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(errorMessage);
  }

  const requestBody = buildChatApiRequestBody({
    model,
    temperature: resolvedTemperature,
    maxTokens: resolvedMaxTokens,
    messages,
    responseFormat
  });
  let response;
  const { controller, generationEntry, cleanup } = createTimeoutController(undefined, {
    trackGeneration: true,
    purpose
  });
  try {
    response = await fetch(completionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    cleanup();
    const message = formatFetchErrorMessage(error, generationEntry);
    if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
      throw createGenerationStoppedError();
    }
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: "",
      error: `對話 API 請求失敗: ${message}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`對話 API 請求失敗: ${message}`);
  }

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (error) {
      cleanup();
      const message = formatFetchErrorMessage(error, generationEntry);
      if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
        throw createGenerationStoppedError();
      }
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        error: `對話 API 錯誤回應讀取失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
      throw new Error(`對話 API 錯誤回應讀取失敗: ${message}`);
    }
    cleanup();
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: text,
      error: `對話 API 失敗: ${response.status} ${text}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`對話 API 失敗: ${response.status} ${text}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    cleanup();
    const message = error?.name === "AbortError" || isGenerationStoppedError(error)
      ? formatFetchErrorMessage(error, generationEntry)
      : safeText(error?.message) || "JSON 解析失敗";
    if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
      throw createGenerationStoppedError();
    }
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: "",
      error: `對話 API 回應解析失敗: ${message}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`對話 API 回應解析失敗: ${message}`);
  }
  cleanup();
  throwIfGenerationStopped(generationEntry);
  const message = payload?.choices?.[0]?.message || {};
  const finishReason = safeText(payload?.choices?.[0]?.finish_reason);
  const content = extractChatApiMessageText(message.content);
  const reasoningContent = extractChatApiMessageText(message.reasoning_content);
  const trimmed = safeText(content).trim();
  const trimmedReasoning = safeText(reasoningContent).trim();
  const usage = normalizeAiUsage(payload?.usage);

  if (
    finishReason === "length" &&
    shouldRetryChatApiLength(purpose) &&
    retryCount < CHAT_API_LENGTH_RETRY_LIMIT
  ) {
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: `${trimmed}\n\n[finish_reason:length - retrying_from_scratch]`,
      debugReasoningContent: trimmedReasoning,
      usage,
      status: "success",
      createdAt: nowIso()
    });

    const next = await callChatApiCompletionRaw({
      messages: buildChatApiLengthRetryMessages(messages, trimmed),
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      purpose,
      retryCount: retryCount + 1
    });

    return {
      content: safeText(next.content).trim(),
      reasoningContent: [trimmedReasoning, next.reasoningContent].filter(Boolean).join("\n\n").trim(),
      model: next.model || model,
      maxTokens: next.maxTokens || resolvedMaxTokens,
      usage: next.usage || usage
    };
  }

  if (finishReason === "length" && shouldRetryChatApiLength(purpose)) {
    const errorMessage = "對話 API 回覆因 finish_reason:length 截斷；重跑一次後仍未完成，已停止。";
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: `${trimmed}\n\n[finish_reason:length - stopped_after_retry]`,
      debugReasoningContent: trimmedReasoning,
      usage,
      error: errorMessage,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(errorMessage);
  }

  if (!content || typeof content !== "string") {
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: JSON.stringify(payload),
      usage,
      error: `對話 API 回傳格式不完整${finishReason ? `（finish_reason: ${finishReason}）` : ""}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(
      `對話 API 回傳格式不完整${finishReason ? `（finish_reason: ${finishReason}）` : ""}`
    );
  }
  appendAiLog({
    purpose,
    model,
    temperature: resolvedTemperature,
    maxTokens: resolvedMaxTokens,
    requestMessages,
    // reasoning_content 僅可進 debug log；預設不要顯示給前端，也不要回灌到下一輪 messages。
    responseText: trimmed,
    debugReasoningContent: trimmedReasoning,
    usage,
    status: "success",
    createdAt: nowIso()
  });
  return {
    content: trimmed,
    reasoningContent: trimmedReasoning,
    model,
    maxTokens: resolvedMaxTokens,
    usage
  };
}

async function readChatApiStreamBody(response, handlers = {}) {
  const onReasoningDelta = typeof handlers.onReasoningDelta === "function" ? handlers.onReasoningDelta : null;
  const onContentDelta = typeof handlers.onContentDelta === "function" ? handlers.onContentDelta : null;
  const decoder = new TextDecoder("utf-8");
  const reader = response.body?.getReader?.();

  if (!reader) {
    throw new Error("對話 API 串流回應不可讀取");
  }

  let buffer = "";
  let finishReason = "";
  let content = "";
  let reasoningContent = "";
  let usage = normalizeAiUsage(null);

  const processEventBlock = (block) => {
    const dataLines = block
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim());

    if (!dataLines.length) {
      return;
    }

    const payloadText = dataLines.join("\n");
    if (payloadText === "[DONE]") {
      return;
    }

    let payload;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      return;
    }

    const choice = payload?.choices?.[0] || {};
    const delta = choice?.delta || {};
    const reasoningDelta = extractChatApiMessageText(delta.reasoning_content);
    const contentDelta = extractChatApiMessageText(delta.content);
    const nextFinishReason = safeText(choice?.finish_reason);
    if (payload?.usage && hasUsageTokens(payload.usage)) {
      usage = normalizeAiUsage(payload.usage);
    }

    if (reasoningDelta) {
      reasoningContent += reasoningDelta;
      onReasoningDelta?.(reasoningDelta);
    }
    if (contentDelta) {
      content += contentDelta;
      onContentDelta?.(contentDelta);
    }
    if (nextFinishReason) {
      finishReason = nextFinishReason;
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    let separatorIndex = buffer.indexOf("\n\n");
    while (separatorIndex >= 0) {
      const block = buffer.slice(0, separatorIndex);
      buffer = buffer.slice(separatorIndex + 2);
      processEventBlock(block);
      separatorIndex = buffer.indexOf("\n\n");
    }
  }

  buffer += decoder.decode();
  if (buffer.trim()) {
    processEventBlock(buffer);
  }

  return {
    content: safeText(content),
    reasoningContent: safeText(reasoningContent),
    finishReason: safeText(finishReason),
    usage
  };
}

async function callChatApiCompletionStreamRaw({
  messages,
  temperature = null,
  maxTokens,
  purpose = "chat",
  retryCount = 0,
  suppressLog = false,
  onReasoningDelta,
  onContentDelta
}) {
  const apiKey = getChatApiKey(purpose);
  const model = getChatApiModel(purpose);
  const resolvedTemperature = getChatApiTemperature(purpose, temperature);
  const resolvedMaxTokens = resolveChatApiMaxTokens({ purpose, maxTokens, model });
  const requestMessages = cloneData(messages, []);

  if (!apiKey) {
    const placeholder = getMissingChatApiKeyPlaceholder(purpose);
    onContentDelta?.(placeholder);
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: placeholder,
        usage: null,
        status: "skipped",
        createdAt: nowIso()
      });
    }
    return {
      content: placeholder,
      reasoningContent: "",
      model,
      maxTokens: resolvedMaxTokens,
      usage: null
    };
  }

  const completionsUrl = getChatApiCompletionsUrl();
  if (!completionsUrl) {
    const errorMessage = "對話 API Base URL 未設定。使用 custom 供應商時請設定 CHAT_API_BASE_URL。";
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        error: errorMessage,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(errorMessage);
  }

  const requestBody = buildChatApiRequestBody({
    model,
    temperature: resolvedTemperature,
    maxTokens: resolvedMaxTokens,
    messages,
    stream: true
  });

  let response;
  const { controller, generationEntry, cleanup } = createTimeoutController(undefined, {
    trackGeneration: true,
    purpose
  });
  try {
    response = await fetch(completionsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    cleanup();
    const message = formatFetchErrorMessage(error, generationEntry);
    if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
      throw createGenerationStoppedError();
    }
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        usage: null,
        error: `對話 API 請求失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`對話 API 請求失敗: ${message}`);
  }

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (error) {
      cleanup();
      const message = formatFetchErrorMessage(error, generationEntry);
      if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
        throw createGenerationStoppedError();
      }
      if (!suppressLog) {
        appendAiLog({
          purpose,
          model,
          temperature: resolvedTemperature,
          maxTokens: resolvedMaxTokens,
          requestMessages,
          responseText: "",
          usage: null,
          error: `對話 API 錯誤回應讀取失敗: ${message}`,
          status: "error",
          createdAt: nowIso()
        });
      }
      throw new Error(`對話 API 錯誤回應讀取失敗: ${message}`);
    }
    cleanup();
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: text,
        usage: null,
        error: `對話 API 失敗: ${response.status} ${text}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`對話 API 失敗: ${response.status} ${text}`);
  }

  let streamed;
  try {
    streamed = await readChatApiStreamBody(response, {
      onReasoningDelta,
      onContentDelta
    });
  } catch (error) {
    cleanup();
    const message = formatFetchErrorMessage(error, generationEntry);
    if (generationEntry?.stoppedByUser || isGenerationStoppedError(error)) {
      throw createGenerationStoppedError();
    }
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        usage: null,
        error: `對話 API 串流讀取失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`對話 API 串流讀取失敗: ${message}`);
  }
  cleanup();
  throwIfGenerationStopped(generationEntry);

  if (
    streamed.finishReason === "length" &&
    shouldRetryChatApiLength(purpose) &&
    retryCount < CHAT_API_LENGTH_RETRY_LIMIT
  ) {
    let next;
    try {
      next = await callChatApiCompletionStreamRaw({
        messages: buildChatApiLengthRetryMessages(messages, streamed.content),
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        purpose,
        retryCount: retryCount + 1,
        suppressLog: true,
        onReasoningDelta,
        onContentDelta
      });
    } catch (error) {
      if (!suppressLog) {
        appendAiLog({
          purpose,
          model,
          temperature: resolvedTemperature,
          maxTokens: resolvedMaxTokens,
          requestMessages,
          responseText: `${streamed.content}\n\n[finish_reason:length - retry_failed]`,
          debugReasoningContent: streamed.reasoningContent,
          usage: streamed.usage || null,
          error: safeText(error?.message) || "重跑後仍未完成",
          status: "error",
          createdAt: nowIso()
        });
      }
      throw error;
    }

    const mergedContent = safeText(next.content).trim();
    const mergedReasoning = [streamed.reasoningContent, next.reasoningContent].filter(Boolean).join("\n\n").trim();

    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: mergedContent,
        debugReasoningContent: mergedReasoning,
        usage: next.usage || streamed.usage || null,
        status: "success",
        createdAt: nowIso()
      });
    }

    return {
      content: mergedContent,
      reasoningContent: mergedReasoning,
      model: next.model || model,
      maxTokens: next.maxTokens || resolvedMaxTokens,
      usage: next.usage || streamed.usage || null
    };
  }

  if (streamed.finishReason === "length" && shouldRetryChatApiLength(purpose)) {
    const errorMessage = "對話 API 回覆因 finish_reason:length 截斷；重跑一次後仍未完成，已停止。";
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: `${streamed.content}\n\n[finish_reason:length - stopped_after_retry]`,
        debugReasoningContent: streamed.reasoningContent,
        usage: streamed.usage || null,
        error: errorMessage,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(errorMessage);
  }

  if (!streamed.content) {
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        usage: streamed.usage || null,
        error: `對話 API 回傳格式不完整${streamed.finishReason ? `（finish_reason: ${streamed.finishReason}）` : ""}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(
      `對話 API 回傳格式不完整${streamed.finishReason ? `（finish_reason: ${streamed.finishReason}）` : ""}`
    );
  }

  if (!suppressLog) {
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: streamed.content,
      debugReasoningContent: streamed.reasoningContent,
      usage: streamed.usage || null,
      status: "success",
      createdAt: nowIso()
    });
  }

  return {
    content: streamed.content,
    reasoningContent: streamed.reasoningContent,
    model,
    maxTokens: resolvedMaxTokens,
    usage: streamed.usage || null
  };
}

async function callChatApiCompletion(options) {
  const result = await callChatApiCompletionRaw(options);
  return result.content;
}

async function callChatApiReasonerHistory(state, runtimeUserName = "", options = {}) {
  return callChatApiCompletion({
    messages: buildReasonerHistoryMessages(state, runtimeUserName, options),
    purpose: "reasoner_history_chat"
  });
}

async function callChatApiCharacterCardCreationAssistant(state, runtimeUserName = "", options = {}) {
  return callChatApiCompletion({
    messages: buildCharacterCardCreationAssistantMessages(state, runtimeUserName, options),
    purpose: "character_card_creation_assistant_chat"
  });
}

async function runAdvancedConversationTurnParallel(state, runtimeUserName = "", options = {}) {
  const processingResult = await ensureContextCompressionSummary(state, runtimeUserName, {
    ...options,
    phase: "before_reasoner",
    returnDetails: true
  });
  if (processingResult.skipReasoner) {
    return formatModelProcessingCompletionMessage(processingResult.processedActions);
  }
  return callChatApiReasonerHistory(state, runtimeUserName, options)
    .catch((error) => {
      if (isGenerationStoppedError(error)) {
        throw error;
      }
      return `模型呼叫失敗，已改用錯誤訊息回覆：${error.message}`;
    });
}

async function runReasonerHistoryConversationTurn(state, runtimeUserName = "", options = {}) {
  if (isCharacterCardCreationAssistantActive(state)) {
    try {
      return await callChatApiCharacterCardCreationAssistant(state, runtimeUserName, options);
    } catch (error) {
      if (isGenerationStoppedError(error)) {
        throw error;
      }
      return `模型呼叫失敗，已改用錯誤訊息回覆：${error.message}`;
    }
  }

  return runAdvancedConversationTurnParallel(state, runtimeUserName, options);
}

async function ensureMinimumAssistantLengthStreaming(
  state,
  assistantText,
  runtimeUserName = "",
  handlers = {}
) {
  let output = safeText(assistantText);
  let reasoningOutput = "";
  const minimum = getMinimumReplyChars();
  const maxExpandAttempts = 2;
  const onReasoningDelta = typeof handlers.onReasoningDelta === "function" ? handlers.onReasoningDelta : null;
  const onContentDelta = typeof handlers.onContentDelta === "function" ? handlers.onContentDelta : null;

  for (let attempt = 0; attempt < maxExpandAttempts; attempt += 1) {
    if (!output || countVisibleCharacters(output) >= minimum) {
      break;
    }

    const continuation = await callChatApiCompletionStreamRaw({
      messages: buildContinuationMessagesForMinimumLength(state, output, runtimeUserName),
      purpose: "chat_expand",
      onReasoningDelta: (chunk) => {
        reasoningOutput += chunk;
        onReasoningDelta?.(chunk);
      },
      onContentDelta
    });

    output = safeText([output, continuation.content].join("\n")).trim();
  }

  return {
    content: output,
    reasoningContent: reasoningOutput
  };
}

async function runConversationTurnStreaming({
  content,
  source,
  extra = {},
  onPhaseStatus,
  onReasoningDelta,
  onContentDelta
}) {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。");
    }

    const parsedInput = parseRoleplayInput(content, state);
    const storedUserContent = parsedInput.rawInput || safeText(content);
    const modelUserContent = parsedInput.modelContent || storedUserContent;
    const turnExtra = ensureDiscordPlayerAssignmentForTurn(state, extra);
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);
    if (!storedUserContent || !modelUserContent) {
      throw new Error("輸入不可空白。");
    }

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...turnExtra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    updateTimeTrackingFromMessage(state, userMessage);

    const runtimeUserName = resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "");
    attachTriggeredLorebooksToUserMessage(userMessage, state, runtimeUserName);

    let streamed;
    let compressionNotice = false;
    if (isCharacterCardCreationAssistantActive(state)) {
      onPhaseStatus?.("chat");
      streamed = await callChatApiCompletionStreamRaw({
        messages: buildCharacterCardCreationAssistantMessages(state, runtimeUserName),
        purpose: "character_card_creation_assistant_chat",
        onReasoningDelta,
        onContentDelta
      });
    } else {
      const compressionBefore = normalizeContextCompressionState(state.contextCompression);
      const processingResult = await ensureContextCompressionSummary(state, runtimeUserName, {
        onStatus: onPhaseStatus,
        phase: "before_reasoner",
        returnDetails: true
      });
      compressionNotice = didContextCompressionAdvance(compressionBefore, processingResult.contextCompression);
      if (processingResult.skipReasoner) {
        const completionText = formatModelProcessingCompletionMessage(processingResult.processedActions);
        onContentDelta?.(completionText);
        streamed = {
          content: completionText,
          reasoningContent: ""
        };
      } else {
        onPhaseStatus?.("chat");
        streamed = await callChatApiCompletionStreamRaw({
          messages: buildReasonerHistoryMessages(state, runtimeUserName),
          purpose: "reasoner_history_chat",
          onReasoningDelta,
          onContentDelta
        });
      }
    }

    let assistantText = streamed.content;
    let fullReasoning = streamed.reasoningContent;

    const modelProcessingResult = getLastModelProcessingResult(state);
    if (
      !isCharacterCardCreationAssistantActive(state) &&
      !modelProcessingResult.skipReasoner &&
      countVisibleCharacters(assistantText) < getMinimumReplyChars()
    ) {
      const expanded = await ensureMinimumAssistantLengthStreaming(state, assistantText, runtimeUserName, {
        onReasoningDelta,
        onContentDelta
      });
      assistantText = expanded.content;
      fullReasoning = [fullReasoning, expanded.reasoningContent].filter(Boolean).join("\n\n").trim();
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    updateTimeTrackingFromText(state, assistantText);
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...turnExtra,
        reasoningContent: fullReasoning,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
    if (!modelProcessingResult.skipReasoner) {
      await updateCompressionAfterAssistantMessage(state, runtimeUserName, assistantMessage);
    }
    saveState(state);

    return {
      assistantMessage
    };
  });
}

function statePayload(state) {
  return {
    ...state,
    conversation: Array.isArray(state.conversation)
      ? state.conversation.map((message) => {
          if (message?.role !== "assistant") {
            return message;
          }
          const finalized = finalizeAssistantOutputContent(message.content);
          return {
            ...message,
            content: finalized.content || safeText(message.content)
          };
        })
      : [],
    aiLogs: Array.isArray(state.aiLogs)
      ? state.aiLogs.map((entry) => normalizeAiLog(entry))
      : [],
    modularPromptConfigs: getModularPromptConfigsPayload(),
    contextCompressionPrompt: getContextCompressionPrompt(),
    characterCardCreationAssistantPrompt: getCharacterCardCreationAssistantPrompt(),
    savedSessionsMeta: listSavedSessionSummaries(state),
    uiActions: createUiActions(state),
    chatApi: {
      provider: getChatApiProvider(),
      baseUrl: getChatApiBaseUrl(),
      model: getChatApiModel("reasoner_history_chat"),
      maxTokensParam: getChatApiMaxTokensParamName()
    },
    discord: {
      enabled: Boolean(DISCORD_BOT_TOKEN),
      connected: discordConnected,
      commandPrefix: COMMAND_PREFIX,
      clientId: getDiscordClientId(),
      authorizeUrl: getDiscordAuthorizeUrl()
    }
  };
}

let state = loadState();
persistCardState(state);
let discordConnected = false;
let activeDiscordClient = null;
let restartScheduled = false;
let stateWriteQueue = Promise.resolve();

function scheduleServerRestart() {
  if (restartScheduled) {
    return false;
  }
  restartScheduled = true;

  setTimeout(() => {
    let restarted = false;
    const restart = () => {
      if (restarted) {
        return;
      }
      restarted = true;
      const child = spawn(process.execPath, process.argv.slice(1), {
        cwd: process.cwd(),
        env: process.env,
        stdio: "inherit",
        detached: true
      });
      child.unref();
      process.exit(0);
    };

    try {
      activeDiscordClient?.destroy?.();
    } catch (error) {
      console.warn(`Discord bot 關閉失敗：${safeText(error?.message) || "未知錯誤"}`);
    }

    try {
      server.close(restart);
      setTimeout(restart, 3000).unref();
    } catch {
      restart();
    }
  }, 600).unref();

  return true;
}

function withStateLock(task) {
  const runTask = async () => {
    const snapshotBeforeTask = captureRuntimeSnapshot(state);
    try {
      return await task();
    } catch (error) {
      if (isGenerationStoppedError(error)) {
        applyRuntimeSnapshot(state, snapshotBeforeTask);
        saveState(state);
      }
      throw error;
    }
  };
  const chain = stateWriteQueue.then(runTask, runTask);
  stateWriteQueue = chain.catch(() => {});
  return chain;
}

function appendConversationMessage(entry) {
  state.turnState = normalizeTurnState(state.turnState, state);
  if (entry?.role === "user") {
    const explicitTurnNumber = getMessageTurnNumber(entry);
    const nextTurnNumber = explicitTurnNumber || state.turnState.totalUserTurns + 1;
    entry.turnNumber = nextTurnNumber;
    state.turnState = {
      totalUserTurns: Math.max(state.turnState.totalUserTurns, nextTurnNumber),
      updatedAt: nowIso()
    };
  } else {
    const conversationTurnCount = inferTurnCountFromConversation(state.conversation);
    if (conversationTurnCount > state.turnState.totalUserTurns) {
      state.turnState = {
        totalUserTurns: conversationTurnCount,
        updatedAt: nowIso()
      };
    }
  }
  state.conversation.push(entry);
  if (state.conversation.length > 500) {
    state.conversation = state.conversation.slice(-500);
  }
}

function resetAiNarrativeProgress(currentState) {
  currentState.roleCardRuntimeState = {};
}

function resetGeneratedBackendContextPreservingManual(currentState) {
  currentState.contextCompression = {
    ...normalizeContextCompressionState(currentState.contextCompression),
    summary: "",
    compressedThroughTurnNumber: 0,
    profiles: {},
    updatedAt: nowIso()
  };
  resetAiNarrativeProgress(currentState);
}

function createMessageRecord({ role, content, source, extra = {} }) {
  return {
    id: newId("msg"),
    role,
    content,
    edited: false,
    source,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...extra
  };
}

function normalizeAiLog(entry) {
  const source = entry && typeof entry === "object" ? entry : {};
  return {
    id: safeText(source.id) || newId("ailog"),
    purpose: safeText(source.purpose) || "chat",
    model: safeText(source.model) || "",
    temperature: typeof source.temperature === "number" ? source.temperature : null,
    maxTokens: typeof source.maxTokens === "number" ? source.maxTokens : null,
    requestMessages: Array.isArray(source.requestMessages)
      ? source.requestMessages
          .map((item) =>
            item && typeof item === "object"
              ? {
                  role: safeText(item.role) || "user",
                  content: typeof item.content === "string" ? item.content : JSON.stringify(item.content ?? "")
                }
              : null
          )
          .filter(Boolean)
      : [],
    responseText: typeof source.responseText === "string" ? source.responseText : "",
    debugReasoningContent: typeof source.debugReasoningContent === "string" ? source.debugReasoningContent : "",
    usage: normalizeAiUsage(source.usage),
    error: safeText(source.error),
    status: safeText(source.status) || "success",
    createdAt: safeText(source.createdAt) || nowIso()
  };
}

function appendAiLog(entry) {
  if (!state || !Array.isArray(state.aiLogs)) {
    return;
  }
  const normalizedEntry = normalizeAiLog(entry);
  state.aiLogs.push(normalizedEntry);
  if (state.aiLogs.length > 200) {
    state.aiLogs = state.aiLogs.slice(-200);
  }
  saveState(state);
}

function splitForDiscord(text, maxLength = 1800) {
  const output = [];
  let input = safeText(text);

  while (input.length > maxLength) {
    output.push(input.slice(0, maxLength));
    input = input.slice(maxLength);
  }
  if (input) {
    output.push(input);
  }
  return output.length > 0 ? output : [""];
}

function detectRewriteMode(currentState) {
  const userTurnCount = countConversationTurns(currentState);
  return userTurnCount <= 1 ? "INIT" : "UPDATE";
}

function removeLatestAssistantTurnForReload(currentState) {
  if (!Array.isArray(currentState.conversation) || currentState.conversation.length === 0) {
    throw new Error("目前沒有可重生成的 AI 對話。");
  }

  const lastIndex = currentState.conversation.length - 1;
  const latestAssistant = currentState.conversation[lastIndex];
  if (!latestAssistant || latestAssistant.role !== "assistant") {
    throw new Error("目前最新一則不是 AI 回覆，無法執行重生成。");
  }
  if (latestAssistant.source === "opening") {
    throw new Error("開場訊息不能使用 /reload 重生成。");
  }

  let latestUserIndex = -1;
  for (let index = lastIndex - 1; index >= 0; index -= 1) {
    if (currentState.conversation[index]?.role === "user") {
      latestUserIndex = index;
      break;
    }
  }

  if (latestUserIndex < 0) {
    throw new Error("找不到對應的上一則使用者輸入，無法重生成。");
  }

  const [removedAssistant] = currentState.conversation.splice(lastIndex, 1);
  const latestUser = currentState.conversation[latestUserIndex];
  return {
    latestUser,
    removedAssistant
  };
}

async function regenerateLatestAssistantReply({
  source = "discord",
  extra = {},
  reloadFeedback = ""
}) {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。");
    }

    const { latestUser, removedAssistant } = removeLatestAssistantTurnForReload(state);
    const latestUserIndex = state.conversation.findIndex((item) => item?.id === latestUser?.id);
    restoreNarrativeStateForReplay(state, latestUserIndex);
    updateTimeTrackingFromMessage(state, latestUser);
    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    const options = { reloadFeedback };
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName, options);
    const modelProcessingResult = getLastModelProcessingResult(state);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state) && !modelProcessingResult.skipReasoner) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: latestUser?.content
    });
    assistantText = finalizedAssistantOutput.content;
    updateTimeTrackingFromText(state, assistantText);
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...(removedAssistant?.extra || {}),
        ...extra,
        regenerated: true,
        reloadFeedback: safeText(reloadFeedback),
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
    if (!modelProcessingResult.skipReasoner) {
      await updateCompressionAfterAssistantMessage(state, runtimeUserName, assistantMessage);
    }
    saveState(state);

    return {
      assistantMessage
    };
  });
}

async function replayConversationFromMessageNumber({
  messageNumber,
  content,
  source = "discord",
  extra = {}
}) {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。");
    }

    const normalizedMessageNumber = Math.floor(Number(messageNumber));
    if (!Number.isFinite(normalizedMessageNumber) || normalizedMessageNumber < 1) {
      throw new Error("請提供有效的訊息編號，從 1 開始。");
    }

    const storedUserContent = safeText(content);
    if (!storedUserContent) {
      throw new Error("重寫內容不可空白。");
    }

    const maxAllowed = state.conversation.length + 1;
    if (normalizedMessageNumber > maxAllowed) {
      throw new Error(`訊息編號超出範圍，目前最多只能指定到 ${maxAllowed}。`);
    }

    createSavedSessionFromCurrentState(
      state,
      `分支備份 #${normalizedMessageNumber} ${new Date().toLocaleString("zh-Hant")}`,
      { activate: false }
    );

    restoreNarrativeStateForReplay(state, normalizedMessageNumber - 1);
    state.conversation = state.conversation.slice(0, normalizedMessageNumber - 1);
    syncTurnStateFromConversation(state);
    const turnExtra = ensureDiscordPlayerAssignmentForTurn(state, extra);
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);

    const parsedInput = parseRoleplayInput(storedUserContent, state);
    const modelUserContent = parsedInput.modelContent || storedUserContent;
    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...turnExtra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        replayFromMessageNumber: normalizedMessageNumber,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    updateTimeTrackingFromMessage(state, userMessage);
    attachTriggeredLorebooksToUserMessage(
      userMessage,
      state,
      resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "")
    );

    const runtimeUserName = resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "");
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const modelProcessingResult = getLastModelProcessingResult(state);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state) && !modelProcessingResult.skipReasoner) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    updateTimeTrackingFromText(state, assistantText);
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...turnExtra,
        replayFromMessageNumber: normalizedMessageNumber,
        replayGenerated: true,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
    if (!modelProcessingResult.skipReasoner) {
      await updateCompressionAfterAssistantMessage(state, runtimeUserName, assistantMessage);
    }
    saveState(state);

    return {
      assistantMessage,
      backupSession: state.savedSessions[state.savedSessions.length - 1] || null
    };
  });
}

async function replayConversationFromDiscordMessageId({
  discordMessageId,
  content,
  source = "discord",
  extra = {}
}) {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。");
    }

    const normalizedMessageId = safeText(discordMessageId);
    const storedUserContent = safeText(content);
    if (!normalizedMessageId) {
      throw new Error("缺少 Discord 訊息 ID，無法從編輯訊息重算。");
    }
    if (!storedUserContent) {
      throw new Error("重算內容不可空白。");
    }

    const targetIndex = state.conversation.findIndex(
      (item) => item?.role === "user" && safeText(item?.discordMessageId) === normalizedMessageId
    );
    if (targetIndex < 0) {
      throw new Error("找不到對應的原始 Discord 使用者訊息，無法從該訊息重新開始。");
    }

    createSavedSessionFromCurrentState(
      state,
      `Discord編輯前備份 #${targetIndex + 1} ${new Date().toLocaleString("zh-Hant")}`,
      { activate: false }
    );

    restoreNarrativeStateForReplay(state, targetIndex);
    state.conversation = state.conversation.slice(0, targetIndex);
    syncTurnStateFromConversation(state);
    const turnExtra = ensureDiscordPlayerAssignmentForTurn(state, extra);
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);

    const parsedInput = parseRoleplayInput(storedUserContent, state);
    const modelUserContent = parsedInput.modelContent || storedUserContent;

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...turnExtra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        discordMessageId: normalizedMessageId,
        replayFromDiscordEdit: true,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    updateTimeTrackingFromMessage(state, userMessage);
    attachTriggeredLorebooksToUserMessage(
      userMessage,
      state,
      resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "")
    );

    const runtimeUserName = resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "");
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const modelProcessingResult = getLastModelProcessingResult(state);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);
    if (!isCharacterCardCreationAssistantActive(state) && !modelProcessingResult.skipReasoner) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    updateTimeTrackingFromText(state, assistantText);
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...turnExtra,
        discordMessageId: normalizedMessageId,
        replayFromDiscordEdit: true,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
    if (!modelProcessingResult.skipReasoner) {
      await updateCompressionAfterAssistantMessage(state, runtimeUserName, assistantMessage);
    }
    saveState(state);

    return {
      assistantMessage,
      backupSession: state.savedSessions[state.savedSessions.length - 1] || null
    };
  });
}

async function runConversationTurn({ content, source, extra = {} }) {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。");
    }

    const parsedInput = parseRoleplayInput(content, state);
    const storedUserContent = parsedInput.rawInput || safeText(content);
    const modelUserContent = parsedInput.modelContent || storedUserContent;
    const turnExtra = ensureDiscordPlayerAssignmentForTurn(state, extra);
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);
    if (!storedUserContent || !modelUserContent) {
      throw new Error("輸入不可空白。");
    }

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...turnExtra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    updateTimeTrackingFromMessage(state, userMessage);

    const runtimeUserName = resolveUserDisplayName(state.userProfile, turnExtra.discordUserName || "");
    attachTriggeredLorebooksToUserMessage(userMessage, state, runtimeUserName);
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const modelProcessingResult = getLastModelProcessingResult(state);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state) && !modelProcessingResult.skipReasoner) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    updateTimeTrackingFromText(state, assistantText);
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...turnExtra,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
    if (!modelProcessingResult.skipReasoner) {
      await updateCompressionAfterAssistantMessage(state, runtimeUserName, assistantMessage);
    }
    saveState(state);

    return {
      assistantMessage
    };
  });
}

function getDiscordGuidance() {
  const authorizeUrl = getDiscordAuthorizeUrl();
  return [
    "請先把 Bot 新增到你的應用程式，之後在 Discord 使用 Slash 指令。",
    authorizeUrl ? `新增 Bot：${authorizeUrl}` : "",
    "主對話：`/ai content:你的內容`，或 `/ai file:上傳txt檔`",
    "開始對話：`/ai_start`，之後該頻道可以直接輸入對話，不需要 `!ai`",
    "停止生成：`/stop`，或在已啟用頻道輸入 `/stop`",
    "玩家座位：`/player_set number:2`，或在已啟用頻道輸入 `/player_set 2`",
    "查看狀態：`/ai_status`",
    "重跑最新回覆：`/reload feedback:不滿意或要改進的地方`",
    "從指定訊息分支：`/replay message_number:訊息編號 content:新的使用者內容`",
    "自動推演多輪：`/run_time number:10 message:你的要求`",
    "存檔指令：`/session_save`、`/session_list`、`/session_load`",
    `文字指令：伺服器頻道使用 \`${COMMAND_PREFIX} 指令\`；DM 若要執行文字指令也請加 \`${COMMAND_PREFIX}\`，直接打「開始」會當作聊天內容。`,
    "網頁也可以直接在對話輸入框送出本地對話。"
  ].filter(Boolean).join("\n");
}

function getCurrentConversationTargetLabel(currentState) {
  if (isCharacterCardCreationAssistantActive(currentState)) {
    return "CharacterCardCreationAssistant";
  }
  const card = getActiveRoleCard(currentState);
  return card ? card.name : "未選擇";
}

const server = http.createServer(async (req, res) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url || "/", `http://${host}`);
    const pathname = url.pathname;
    const method = (req.method || "GET").toUpperCase();

    if (pathname === "/api/state" && method === "GET") {
      sendJson(res, 200, statePayload(state));
      return;
    }

    if (pathname === "/api/env" && method === "GET") {
      sendJson(res, 200, {
        content: readEnvFileContent(),
        restartHint: "對話 API key、Base URL、API輸出模型等多數設定會立即同步；Discord Bot Token、Port、Slash 指令註冊等啟動期設定仍建議重啟 npm start。"
      });
      return;
    }

    if (pathname === "/api/env" && method === "PUT") {
      const body = await readBody(req);
      const content = saveEnvFileContent(body?.content);
      sendJson(res, 200, {
        content,
        restartHint: "已保存 .env。對話 API key、Base URL、API輸出模型等多數設定會立即同步；Discord Bot Token、Port、Slash 指令註冊等啟動期設定仍建議重啟 npm start。"
      });
      return;
    }

    if (pathname === "/api/chat-api/test" && method === "POST") {
      const body = await readBody(req);
      const envSource = body?.env && typeof body.env === "object"
        ? body.env
        : parseEnvContent(body?.content || "");
      const result = await testChatApiConnection(envSource);
      sendJson(res, 200, result);
      return;
    }

    if (pathname === "/api/restart" && method === "POST") {
      const started = scheduleServerRestart();
      sendJson(res, 202, {
        ok: true,
        message: started ? "正在重啟伺服器，請稍候刷新頁面。" : "重啟已在進行中，請稍候刷新頁面。"
      });
      return;
    }

    if (pathname === "/api/conversation-settings" && method === "PUT") {
      const body = await readBody(req);
      state.conversationSettings = normalizeConversationSettings({
        ...state.conversationSettings,
        ...(body || {})
      });
      saveState(state);
      sendJson(res, 200, statePayload(state));
      return;
    }

    if (pathname === "/api/context-compression" && method === "GET") {
      sendJson(res, 200, {
        contextCompression: normalizeContextCompressionState(state.contextCompression),
        compressionProfiles: getEnabledCompressionProfiles(state),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/context-compression" && method === "PUT") {
      const body = await readBody(req);
      const current = normalizeContextCompressionState(state.contextCompression);
      const profileId = normalizeCompressionProfileId(body?.profileId || STANDARD_COMPRESSION_PROFILE_ID);
      const profileState = getCompressionProfileState(current, profileId);
      const updatedProfileState = {
        ...profileState,
        summary: safeText(body?.summary),
        updatedAt: nowIso()
      };
      state.contextCompression = current;
      setCompressionProfileState(state, profileId, updatedProfileState);
      saveState(state);
      sendJson(res, 200, {
        contextCompression: normalizeContextCompressionState(state.contextCompression),
        compressionProfiles: getEnabledCompressionProfiles(state),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/time-tracking" && method === "GET") {
      sendJson(res, 200, {
        timeTracking: normalizeTimeTrackingState(state.timeTracking),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/time-tracking" && method === "PUT") {
      const body = await readBody(req);
      const current = normalizeTimeTrackingState(state.timeTracking);
      const rawYear = body?.currentYear ?? current.currentYear;
      const rawMonth = body?.currentMonth ?? current.currentMonth;
      const rawDate = body?.currentDate ?? current.currentDate;
      const year = normalizeTimeTrackingYear(rawYear, current.currentYear);
      const month = Math.floor(Number(rawMonth));
      const date = Math.floor(Number(rawDate));
      const dateFields = isValidMonthDate(month, date, year)
        ? { currentYear: year, currentMonth: month, currentDate: date }
        : { currentYear: current.currentYear, currentMonth: current.currentMonth, currentDate: current.currentDate };
      state.timeTracking = normalizeTimeTrackingState({
        ...current,
        ...body,
        ...dateFields,
        config: normalizeTimeTrackingConfig(body?.config || current.config)
      });
      saveState(state);
      sendJson(res, 200, {
        timeTracking: normalizeTimeTrackingState(state.timeTracking),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/character-card-creation-assistant-prompt" && method === "GET") {
      sendJson(res, 200, {
        prompt: getCharacterCardCreationAssistantPrompt(),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/character-card-creation-assistant-prompt" && method === "PUT") {
      const body = await readBody(req);
      const prompt = saveCharacterCardCreationAssistantPrompt(body?.prompt);
      sendJson(res, 200, {
        prompt,
        state: statePayload(state)
      });
      return;
    }

    const modularPromptPreviewMatch = pathname.match(/^\/api\/modular-prompts\/([^/]+)\/preview$/);
    if (modularPromptPreviewMatch && method === "POST") {
      const body = await readBody(req);
      const mode = normalizeRoleCardMode(modularPromptPreviewMatch[1]);
      const configInput = {
        ...(body?.config || body || {}),
        ...(body?.contextCompressionPrompt !== undefined
          ? { contextCompressionPrompt: body.contextCompressionPrompt }
          : {})
      };
      sendJson(res, 200, buildModularPromptPreview(state, mode, configInput));
      return;
    }

    const modularPromptUpdateMatch = pathname.match(/^\/api\/modular-prompts\/([^/]+)$/);
    if (modularPromptUpdateMatch && method === "PUT") {
      const body = await readBody(req);
      const mode = normalizeRoleCardMode(modularPromptUpdateMatch[1]);
      const configInput = {
        ...(body?.config || body || {}),
        ...(body?.contextCompressionPrompt !== undefined
          ? { contextCompressionPrompt: body.contextCompressionPrompt }
          : {})
      };
      const config = saveModularPromptConfig(mode, configInput);
      sendJson(res, 200, {
        mode,
        config,
        state: statePayload(state)
      });
      return;
    }

    if (modularPromptUpdateMatch && method === "DELETE") {
      const result = deleteModularPromptConfig(modularPromptUpdateMatch[1]);
      if (!result.ok) {
        sendJson(res, 400, { error: result.error || "無法刪除 Prompt 模式" });
        return;
      }
      sendJson(res, 200, {
        mode: result.mode,
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/sessions" && method === "GET") {
      sendJson(res, 200, {
        activeSavedSessionId: state.activeSavedSessionId,
        sessions: listSavedSessionSummaries(state)
      });
      return;
    }

    if (pathname === "/api/sessions/save" && method === "POST") {
      const body = await readBody(req);
      const created = createSavedSessionFromCurrentState(state, body.name);
      saveState(state);
      sendJson(res, 201, {
        session: buildSavedSessionSummary(created),
        state: statePayload(state)
      });
      return;
    }

    const sessionLoadMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/load$/);
    if (sessionLoadMatch && method === "POST") {
      const sessionId = sessionLoadMatch[1];
      const body = await readBody(req);
      const loaded = loadSavedSessionIntoRuntime(state, sessionId, {
        restart: Boolean(body.restart)
      });
      if (!loaded) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, {
        session: buildSavedSessionSummary(loaded),
        state: statePayload(state)
      });
      return;
    }

    const sessionRenameMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/);
    if (sessionRenameMatch && method === "PUT") {
      const sessionId = sessionRenameMatch[1];
      const body = await readBody(req);
      const target = getSavedSessionById(state, sessionId);
      if (!target) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      const nextName = safeText(body.name);
      if (nextName) {
        target.name = nextName;
      }
      target.updatedAt = nowIso();
      saveState(state);
      sendJson(res, 200, {
        session: buildSavedSessionSummary(target),
        state: statePayload(state)
      });
      return;
    }

    const sessionArchiveMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/archive$/);
    if (sessionArchiveMatch && method === "POST") {
      const session = setSavedSessionStatus(state, sessionArchiveMatch[1], "archived");
      if (!session) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, {
        session: buildSavedSessionSummary(session),
        state: statePayload(state)
      });
      return;
    }

    const sessionDeleteMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/);
    if (sessionDeleteMatch && method === "DELETE") {
      const deleted = deleteSavedSession(state, sessionDeleteMatch[1]);
      if (!deleted) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, { state: statePayload(state) });
      return;
    }

    const sessionResumeMatch = pathname.match(/^\/api\/sessions\/([^/]+)\/resume$/);
    if (sessionResumeMatch && method === "POST") {
      const session = setSavedSessionStatus(state, sessionResumeMatch[1], "active");
      if (!session) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, {
        session: buildSavedSessionSummary(session),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/user-profile" && method === "PUT") {
      const body = await readBody(req);

      const normalized = normalizeUserProfile(body);
      state.userProfile = normalized;

      saveState(state);
      sendJson(res, 200, statePayload(state));
      return;
    }

    if (pathname === "/api/role-cards" && method === "GET") {
      sendJson(res, 200, { roleCards: state.roleCards, activeRoleCardId: state.activeRoleCardId });
      return;
    }

    if (pathname === "/api/assistant-modes/character-card-creation/start" && method === "POST") {
      const result = await withStateLock(async () => {
        state.activeRoleCardId = null;
        state.activeAssistantMode = CHARACTER_CARD_CREATION_ASSISTANT_MODE;
        state.activeSavedSessionId = null;
        state.aiSessionStarted = true;
        state.pendingOpeningBroadcast = false;
        state.lastDiscordChannelId = "";
        resetDiscordPlayerAssignments(state, "");
        resetConversationProgress(state);
        state.roleCardRuntimeState = {};
        resetGeneratedBackendContextPreservingManual(state);

        saveState(state);
        return { state: statePayload(state), status: 200 };
      });

      sendJson(res, 200, { openingMessage: null, state: result.state });
      return;
    }

    if (pathname === "/api/role-cards" && method === "POST") {
      const body = await readBody(req);
      const name = safeText(body.name);
      const mode = normalizeRoleCardMode(body.mode);
      const coverImage = safeText(body.coverImage);
      const coverPosition = normalizeCoverPosition(body.coverPosition);
      const customSections = normalizeRoleCardCustomSections(body.customSections, body);
      const openingDialogue = safeText(body.openingDialogue);
      const lorebooks = normalizeRoleCardLorebooks(body.lorebooks);
      const corruptedFields = findRoleCardCorruptedFields({
        name,
        coverImage,
        coverPosition,
        customSections: JSON.stringify(customSections),
        openingDialogue,
        lorebooks: JSON.stringify(lorebooks)
      });

      if (corruptedFields.length > 0) {
        sendJson(res, 400, {
          error: `偵測到疑似已損壞文字（${corruptedFields.join("、")}）包含「�」。請重新貼上原文後再保存。`
        });
        return;
      }

      const now = nowIso();
      const card = {
        id: newId("card"),
        name,
        mode,
        coverImage,
        coverPosition,
        customSections,
        personality: getRoleCardCustomSectionValue({ customSections }, "性格"),
        scene: getRoleCardCustomSectionValue({ customSections }, "場景"),
        systemInstruction: getRoleCardCustomSectionValue({ customSections }, "系統指令"),
        description: getRoleCardCustomSectionValue({ customSections }, "詳細描述"),
        relationships: getRoleCardCustomSectionValue({ customSections }, "人物關係（純文字）"),
        openingDialogue,
        lorebooks,
        createdAt: now,
        updatedAt: now
      };

      state.roleCards.push(card);
      saveState(state);
      const persistedCheck = verifyPersistedRoleCard(card.id, {
        name,
        coverImage,
        coverPosition,
        customSections: JSON.stringify(customSections),
        openingDialogue,
        lorebooks: JSON.stringify(lorebooks)
      });
      if (!persistedCheck.ok) {
        sendJson(res, 500, { error: persistedCheck.reason });
        return;
      }
      sendJson(res, 201, { roleCard: card, state: statePayload(state) });
      return;
    }

    const roleUpdateMatch = pathname.match(/^\/api\/role-cards\/([^/]+)$/);
    if (roleUpdateMatch && method === "PUT") {
      const cardId = roleUpdateMatch[1];
      const body = await readBody(req);
      const card = state.roleCards.find((item) => item.id === cardId);

      if (!card) {
        sendJson(res, 404, { error: "角色卡不存在" });
        return;
      }

      const name = safeText(body.name);
      const mode = normalizeRoleCardMode(body.mode);
      const coverImage = safeText(body.coverImage);
      const coverPosition = normalizeCoverPosition(body.coverPosition);
      const customSections = normalizeRoleCardCustomSections(body.customSections, body);
      const openingDialogue = safeText(body.openingDialogue);
      const lorebooks = normalizeRoleCardLorebooks(body.lorebooks);
      const corruptedFields = findRoleCardCorruptedFields({
        ...(Object.prototype.hasOwnProperty.call(body, "name") ? { name } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "coverImage") ? { coverImage } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "coverPosition") ? { coverPosition } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "customSections") ? { customSections: JSON.stringify(customSections) } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "openingDialogue") ? { openingDialogue } : {}),
        ...(Object.prototype.hasOwnProperty.call(body, "lorebooks") ? { lorebooks: JSON.stringify(lorebooks) } : {})
      });

      if (corruptedFields.length > 0) {
        sendJson(res, 400, {
          error: `偵測到疑似已損壞文字（${corruptedFields.join("、")}）包含「�」。請重新貼上原文後再保存。`
        });
        return;
      }
      if (Object.prototype.hasOwnProperty.call(body, "name")) {
        card.name = name;
      }
      if (Object.prototype.hasOwnProperty.call(body, "mode")) {
        card.mode = mode;
      }
      if (Object.prototype.hasOwnProperty.call(body, "coverImage")) {
        card.coverImage = coverImage;
      }
      if (Object.prototype.hasOwnProperty.call(body, "coverPosition")) {
        card.coverPosition = coverPosition;
      }
      if (Object.prototype.hasOwnProperty.call(body, "customSections")) {
        card.customSections = customSections;
        card.personality = getRoleCardCustomSectionValue({ customSections }, "性格");
        card.scene = getRoleCardCustomSectionValue({ customSections }, "場景");
        card.systemInstruction = getRoleCardCustomSectionValue({ customSections }, "系統指令");
        card.description = getRoleCardCustomSectionValue({ customSections }, "詳細描述");
        card.relationships = getRoleCardCustomSectionValue({ customSections }, "人物關係（純文字）");
      }
      if (typeof body.openingDialogue === "string") {
        card.openingDialogue = openingDialogue;
      }
      if (Object.prototype.hasOwnProperty.call(body, "lorebooks")) {
        card.lorebooks = lorebooks;
      }
      card.updatedAt = nowIso();

      saveState(state);
      const persistedCheck = verifyPersistedRoleCard(card.id, {
        name: card.name,
        coverImage: card.coverImage,
        coverPosition: card.coverPosition,
        customSections: JSON.stringify(normalizeRoleCardCustomSections(card.customSections, card)),
        openingDialogue: card.openingDialogue,
        lorebooks: JSON.stringify(normalizeRoleCardLorebooks(card.lorebooks))
      });
      if (!persistedCheck.ok) {
        sendJson(res, 500, { error: persistedCheck.reason });
        return;
      }
      sendJson(res, 200, { roleCard: card, state: statePayload(state) });
      return;
    }

    const roleDeleteMatch = pathname.match(/^\/api\/role-cards\/([^/]+)$/);
    if (roleDeleteMatch && method === "DELETE") {
      const deleted = deleteRoleCard(state, roleDeleteMatch[1]);
      if (!deleted) {
        sendJson(res, 404, { error: "角色卡不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, { state: statePayload(state) });
      return;
    }

    const roleStartMatch = pathname.match(/^\/api\/role-cards\/([^/]+)\/start$/);
    if (roleStartMatch && method === "POST") {
      const result = await withStateLock(async () => {
        const cardId = roleStartMatch[1];
        const card = state.roleCards.find((item) => item.id === cardId);

        if (!card) {
          return { error: "角色卡不存在", status: 404 };
        }

        state.activeRoleCardId = cardId;
        state.activeAssistantMode = null;
        state.activeSavedSessionId = null;
        state.aiSessionStarted = true;
        state.pendingOpeningBroadcast = true;
        state.lastDiscordChannelId = "";
        resetDiscordPlayerAssignments(state, "");
        resetConversationProgress(state);
        state.roleCardRuntimeState = {};
        resetGeneratedBackendContextPreservingManual(state);

        saveState(state);
        return { state: statePayload(state), status: 200 };
      });

      if (result.error) {
        sendJson(res, result.status, { error: result.error });
        return;
      }

      sendJson(res, 200, { openingMessage: null, state: result.state });
      return;
    }

    const messageEditMatch = pathname.match(/^\/api\/messages\/([^/]+)$/);
    if (messageEditMatch && method === "PUT") {
      const messageId = messageEditMatch[1];
      const body = await readBody(req);
      const newContent = safeText(body.content);

      const message = state.conversation.find((item) => item.id === messageId);
      if (!message) {
        sendJson(res, 404, { error: "訊息不存在" });
        return;
      }

      if (message.role !== "assistant") {
        sendJson(res, 400, { error: "僅允許編輯 AI 輸出對話" });
        return;
      }

      if (!newContent) {
        sendJson(res, 400, { error: "內容不可空白" });
        return;
      }

      message.content = newContent;
      message.edited = true;
      message.updatedAt = nowIso();

      saveState(state);
      sendJson(res, 200, { message, state: statePayload(state) });
      return;
    }

    if (pathname === "/api/chat/send" && method === "POST") {
      const body = await readBody(req);
      const content = safeText(body.content);
      if (!content) {
        sendJson(res, 400, { error: "輸入不可空白。" });
        return;
      }
      if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
        sendJson(res, 400, { error: "尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant。" });
        return;
      }
      const result = await runConversationTurn({
        content,
        source: "web",
        extra: {
          platform: "web"
        }
      });
      sendJson(res, 200, {
        ...result,
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/chat/stop" && method === "POST") {
      const stopped = requestStopActiveGeneration();
      sendJson(res, 200, {
        stopped,
        message: stopped ? GENERATION_STOPPED_MESSAGE : "目前沒有正在生成的對話。"
      });
      return;
    }

    if (pathname === "/api/chat/send-stream" && method === "POST") {
      sendJson(res, 403, { error: getDiscordGuidance() });
      return;
    }

    if (method === "GET") {
      const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      const normalizedPath = path.normalize(relativePath).replace(/^([.][.][/\\])+/, "");
      const basePath = path.resolve(PUBLIC_DIR);
      const filePath = path.resolve(basePath, normalizedPath);

      if (!filePath.startsWith(basePath)) {
        sendText(res, 403, "Forbidden");
        return;
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        res.writeHead(200, getStaticHeaders(filePath));
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    sendJson(res, 404, { error: "Not Found" });
  } catch (error) {
    sendJson(res, isGenerationStoppedError(error) ? 499 : 500, { error: error.message || "伺服器錯誤" });
  }
});

function shouldTreatAsStartCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "start" || normalized === "ai_start" || normalized === "開始";
}

function shouldTreatAsHelpCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "help" || normalized === "ai_help" || normalized === "幫助";
}

function shouldTreatAsStatusCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "status" || normalized === "ai_status" || normalized === "狀態";
}

function shouldTreatAsStopCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "stop" || normalized === "停止" || normalized === "中止";
}

function parseDiscordTextInput(input, options = {}) {
  const allowBareMetaCommands = options.allowBareMetaCommands !== false;
  const trimmed = safeText(input);
  if (!trimmed) {
    return { type: "meta", command: "help", args: [] };
  }

  const parts = trimmed.split(/\s+/);
  const keyword = safeText(parts[0]).replace(/^\//, "").toLowerCase();
  const args = parts.slice(1);

  if (!allowBareMetaCommands) {
    return { type: "chat", content: trimmed };
  }

  if (shouldTreatAsHelpCommand(keyword)) {
    return { type: "meta", command: "help", args };
  }
  if (shouldTreatAsStatusCommand(keyword)) {
    return { type: "meta", command: "status", args };
  }
  if (shouldTreatAsStopCommand(keyword)) {
    return { type: "meta", command: "stop", args };
  }
  if (shouldTreatAsStartCommand(keyword)) {
    return { type: "meta", command: "start", args };
  }
  if (keyword === "session_list" || (keyword === "session" && safeText(args[0]) === "list")) {
    return { type: "meta", command: "session_list", args: args.slice(keyword === "session" ? 1 : 0) };
  }
  if (keyword === "session_save" || (keyword === "session" && safeText(args[0]) === "save")) {
    return { type: "meta", command: "session_save", args: args.slice(keyword === "session" ? 1 : 0) };
  }
  if (keyword === "session_load" || (keyword === "session" && safeText(args[0]) === "load")) {
    return { type: "meta", command: "session_load", args: args.slice(keyword === "session" ? 1 : 0) };
  }
  if (keyword === "reload") {
    return { type: "meta", command: "reload", args };
  }
  if (keyword === "replay") {
    return { type: "meta", command: "replay", args };
  }
  if (keyword === "run_time") {
    return { type: "meta", command: "run_time", args };
  }
  if (keyword === "player_set") {
    return { type: "meta", command: "player_set", args };
  }

  return { type: "chat", content: trimmed };
}

function extractDiscordInput(message) {
  const raw = safeText(message.content);
  const hasTextAttachment = hasSupportedDiscordTextAttachment(message.attachments);
  if (!raw && !hasTextAttachment) {
    return null;
  }

  const isDm = !message.guildId;
  if (isDm) {
    if (raw.startsWith(COMMAND_PREFIX)) {
      return safeText(raw.slice(COMMAND_PREFIX.length));
    }
    return raw;
  }

  if (!raw && hasTextAttachment) {
    return isActiveDiscordAutoChatChannel(message) ? "" : null;
  }

  if (raw.startsWith(COMMAND_PREFIX)) {
    return safeText(raw.slice(COMMAND_PREFIX.length));
  }

  if (isActiveDiscordAutoChatChannel(message)) {
    return raw;
  }

  return null;
}

function isSupportedDiscordTextAttachment(attachment) {
  const name = safeText(attachment?.name || attachment?.filename).toLowerCase();
  const contentType = safeText(attachment?.contentType).toLowerCase();
  return (
    name.endsWith(".txt") ||
    contentType.startsWith("text/") ||
    contentType.includes("plain")
  );
}

function hasSupportedDiscordTextAttachment(attachments) {
  return Array.from(attachments?.values?.() || attachments || [])
    .some((attachment) => isSupportedDiscordTextAttachment(attachment));
}

async function readDiscordTextAttachment(attachment) {
  if (!attachment?.url) {
    return "";
  }
  if (!isSupportedDiscordTextAttachment(attachment)) {
    throw new Error("目前只支援讀取 .txt 或 text/plain 附件。");
  }
  const size = Number(attachment.size || 0);
  if (Number.isFinite(size) && size > DISCORD_TEXT_ATTACHMENT_MAX_BYTES) {
    throw new Error(`txt 附件太大，目前上限是 ${Math.round(DISCORD_TEXT_ATTACHMENT_MAX_BYTES / 1024)} KB。`);
  }

  const response = await fetch(attachment.url);
  if (!response.ok) {
    throw new Error(`txt 附件下載失敗 (${response.status})。`);
  }

  const contentLength = Number(response.headers.get("content-length") || size || 0);
  if (Number.isFinite(contentLength) && contentLength > DISCORD_TEXT_ATTACHMENT_MAX_BYTES) {
    throw new Error(`txt 附件太大，目前上限是 ${Math.round(DISCORD_TEXT_ATTACHMENT_MAX_BYTES / 1024)} KB。`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > DISCORD_TEXT_ATTACHMENT_MAX_BYTES) {
    throw new Error(`txt 附件太大，目前上限是 ${Math.round(DISCORD_TEXT_ATTACHMENT_MAX_BYTES / 1024)} KB。`);
  }
  return buffer.toString("utf8").replace(/^\uFEFF/u, "").trim();
}

async function readDiscordTextAttachments(attachments) {
  const items = Array.from(attachments?.values?.() || attachments || []);
  const textAttachments = items.filter((attachment) => isSupportedDiscordTextAttachment(attachment));
  if (textAttachments.length === 0) {
    return "";
  }
  const parts = [];
  for (const attachment of textAttachments) {
    const content = await readDiscordTextAttachment(attachment);
    if (content) {
      parts.push([
        `【Discord txt 附件: ${safeText(attachment.name || attachment.filename) || "未命名.txt"}】`,
        content
      ].join("\n"));
    }
  }
  return parts.join("\n\n");
}

async function buildDiscordInputWithTextAttachments(baseContent = "", attachments = null) {
  const base = safeText(baseContent);
  const attachmentText = await readDiscordTextAttachments(attachments);
  return [base, attachmentText].filter(Boolean).join("\n\n");
}

async function sendDiscordLongMessage(message, text) {
  const chunks = splitForDiscord(text, 1800);
  let first = true;

  for (const chunk of chunks) {
    const content = chunk || " ";
    if (first) {
      await message.reply(content);
      first = false;
      continue;
    }
    await message.channel.send(content);
  }
}

async function sendInteractionLongReply(interaction, text) {
  const chunks = splitForDiscord(text, 1800);
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply();
  }
  await interaction.editReply(chunks[0] || " ");
  for (let i = 1; i < chunks.length; i += 1) {
    await interaction.followUp(chunks[i] || " ");
  }
}

function isUnknownInteractionError(error) {
  return (
    safeText(error?.code) === "10062" ||
    safeText(error?.rawError?.code) === "10062" ||
    /Unknown interaction/i.test(safeText(error?.message))
  );
}

function shouldDeferSlashCommandEarly(commandName = "") {
  return ["ai", "ai_start", "reload", "replay", "run_time"].includes(safeText(commandName));
}

async function safeSendInteractionError(interaction, content) {
  await safeSendInteractionText(interaction, content, { ephemeral: true });
}

async function safeSendInteractionText(interaction, content, options = {}) {
  const ephemeral = Boolean(options.ephemeral);
  const payload = ephemeral
    ? { content, flags: MessageFlags.Ephemeral }
    : { content };
  try {
    if (interaction.deferred && !interaction.replied) {
      await interaction.editReply(content);
      return;
    }
    if (interaction.replied) {
      await interaction.followUp(payload);
      return;
    }
    await interaction.reply(payload);
  } catch (error) {
    if (isUnknownInteractionError(error)) {
      console.warn("Discord interaction 已過期，訊息無法送出。");
      return;
    }
    throw error;
  }
}

function startTypingIndicator(channel) {
  if (!channel || typeof channel.sendTyping !== "function") {
    return () => {};
  }
  const tick = async () => {
    try {
      await channel.sendTyping();
    } catch {
      return;
    }
  };
  void tick();
  const timer = setInterval(() => {
    void tick();
  }, 7000);
  return () => clearInterval(timer);
}

function formatSavedSessionsText(currentState) {
  const sessions = listSavedSessionSummaries(currentState);
  if (sessions.length === 0) {
    return "目前沒有任何對話存檔。";
  }

  const lines = sessions.map((item) => {
    return `${item.id} | ${item.name} | 訊息:${item.messageCount}`;
  });
  return lines.join("\n");
}

async function consumePendingOpening(channelId, fallbackUserName = "") {
  return withStateLock(async () => {
    if (!state.aiSessionStarted || !state.activeRoleCardId || !state.pendingOpeningBroadcast) {
      return "";
    }

    const card = getActiveRoleCard(state);
    if (!card) {
      return "";
    }

    const resolvedUserName = resolveUserDisplayName(state.userProfile, fallbackUserName);
    const openingDialogue = injectUserPlaceholder(card.openingDialogue, resolvedUserName);
    state.pendingOpeningBroadcast = false;
    state.lastDiscordChannelId = channelId;
    if (!safeText(state.discordPlayers?.channelId)) {
      resetDiscordPlayerAssignments(state, channelId);
    }
    updateTimeTrackingFromText(state, openingDialogue);
    appendConversationMessage(
      createMessageRecord({
        role: "assistant",
        content: openingDialogue,
        source: "opening",
        extra: {
          roleCardId: card.id,
          platform: "discord",
          discordChannelId: channelId,
          stateAfterTurnSnapshot: captureNarrativeCheckpoint(state)
        }
      })
    );
    saveState(state);
    return openingDialogue;
  });
}

async function startSessionFromDiscord(channelId, userInfo) {
  return withStateLock(async () => {
    const card = getActiveRoleCard(state);
    if (!card && !isCharacterCardCreationAssistantActive(state)) {
      return {
        ok: false,
        error: "尚未選擇角色卡或助手模式。請先到網頁建立角色卡，或啟用 CharacterCardCreationAssistant。"
      };
    }

    state.aiSessionStarted = true;
    state.pendingOpeningBroadcast = false;
    state.lastDiscordChannelId = channelId;
    resetDiscordPlayerAssignments(state, channelId);
    state.activeSavedSessionId = null;
    resetConversationProgress(state);
    state.roleCardRuntimeState = {};
    resetGeneratedBackendContextPreservingManual(state);
    if (isCharacterCardCreationAssistantActive(state)) {
      saveState(state);
      return {
        ok: true,
        openingDialogue: "CharacterCardCreationAssistant 已啟用，請直接輸入你的角色卡建立需求。",
        roleCardName: CHARACTER_CARD_CREATION_ASSISTANT_MODE
      };
    }

    const resolvedUserName = resolveUserDisplayName(state.userProfile, userInfo.userName);
    const openingDialogue = injectUserPlaceholder(card.openingDialogue, resolvedUserName);
    updateTimeTrackingFromText(state, openingDialogue);
    appendConversationMessage(
      createMessageRecord({
        role: "assistant",
        content: openingDialogue,
        source: "opening",
        extra: {
          roleCardId: card.id,
          platform: "discord",
          discordChannelId: channelId,
          discordUserId: userInfo.userId,
          discordUserName: userInfo.userName,
          stateAfterTurnSnapshot: captureNarrativeCheckpoint(state)
        }
      })
    );

    saveState(state);
    return {
      ok: true,
      openingDialogue,
      roleCardName: card.name
    };
  });
}

async function replyDiscordStatus(message) {
  const statusText = buildDiscordStatusText();
  await sendDiscordLongMessage(message, statusText);
}

function buildDiscordStatusText() {
  const activeConfig = getActiveModularPromptConfig(state);
  const playerState = normalizeDiscordPlayerState(state.discordPlayers);
  const playerLines = Object.entries(playerState.assignments)
    .map(([userId, slot]) => `${slot}: <@${userId}>`);
  const lines = [
    `Discord連線: ${discordConnected ? "已連線" : "未連線"}`,
    "主對話指令: /ai_start 後，該頻道可直接輸入對話；也可用 /ai content:你的內容",
    "玩家座位: /player_set number:2 或在啟用頻道輸入 /player_set 2",
    `AI狀態: ${state.aiSessionStarted ? "已開始" : "未開始"}`,
    `生成狀態: ${isActiveGenerationRunning() ? "生成中，可用 /stop 停止" : "閒置"}`,
    `自動對話頻道: ${state.lastDiscordChannelId ? `<#${state.lastDiscordChannelId}>` : "未指定"}`,
    `對話設定: 正式模式（API輸出模型=${getChatApiModel("reasoner_history_chat")}｜目前模式上下文=${normalizeDialogueContextRounds(activeConfig?.dialogueContextRounds)} 輪｜模型內容=${isContextCompressionEnabled(state) ? "啟用" : "停用"}）`,
    `目前模式: ${getCurrentConversationTargetLabel(state)}`,
    `待播開場: ${state.pendingOpeningBroadcast ? "是" : "否"}`,
    `玩家分配: ${playerLines.length > 0 ? playerLines.join("｜") : "尚未分配"}`,
    `存檔數: ${state.savedSessions.length}`
  ];
  return lines.join("\n");
}

function isActiveDiscordAutoChatChannel(messageOrChannelId) {
  const channelId = typeof messageOrChannelId === "string"
    ? messageOrChannelId
    : messageOrChannelId?.channelId;
  return Boolean(
    state.aiSessionStarted &&
    hasActiveConversationTarget(state) &&
    safeText(state.lastDiscordChannelId) &&
    safeText(channelId) === safeText(state.lastDiscordChannelId)
  );
}

function canProcessDiscordChatInChannel(channelId = "", guildId = "") {
  if (!safeText(guildId)) {
    return true;
  }
  const activeChannelId = safeText(state.lastDiscordChannelId);
  return !activeChannelId || activeChannelId === safeText(channelId);
}

function getNextAvailableDiscordPlayerSlot(assignments = {}) {
  const usedNumbers = new Set(
    Object.values(assignments)
      .map((slot) => safeText(slot).match(/^user(\d+)$/u)?.[1])
      .filter(Boolean)
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value) && value > 0)
  );
  let index = 1;
  while (usedNumbers.has(index)) {
    index += 1;
  }
  return `user${index}`;
}

function setDiscordPlayerAssignment(currentState, {
  channelId = "",
  userId = "",
  slot = "",
  uniqueSlot = true
} = {}) {
  const normalizedUserId = safeText(userId);
  if (!normalizedUserId) {
    return "";
  }
  const currentPlayerState = normalizeDiscordPlayerState(currentState.discordPlayers);
  const assignments = { ...currentPlayerState.assignments };
  const normalizedSlot = normalizeDiscordPlayerSlot(slot) || getNextAvailableDiscordPlayerSlot(assignments);

  if (uniqueSlot) {
    Object.entries(assignments).forEach(([assignedUserId, assignedSlot]) => {
      if (assignedUserId !== normalizedUserId && assignedSlot === normalizedSlot) {
        delete assignments[assignedUserId];
      }
    });
  }

  assignments[normalizedUserId] = normalizedSlot;
  currentState.discordPlayers = {
    channelId: safeText(channelId) || currentPlayerState.channelId || safeText(currentState.lastDiscordChannelId),
    assignments,
    updatedAt: nowIso()
  };
  return normalizedSlot;
}

function ensureDiscordPlayerAssignmentForTurn(currentState, extra = {}) {
  const guildId = safeText(extra.discordGuildId || extra.guildId);
  const channelId = safeText(extra.discordChannelId || extra.channelId);
  const userId = safeText(extra.discordUserId || extra.userId);
  if (!guildId || !channelId || !userId || !isActiveDiscordAutoChatChannel(channelId)) {
    return { ...extra };
  }

  const playerState = normalizeDiscordPlayerState(currentState.discordPlayers);
  const existingSlot = normalizeDiscordPlayerSlot(playerState.assignments[userId]);
  const discordPlayerSlot = existingSlot ||
    setDiscordPlayerAssignment(currentState, { channelId, userId });
  return {
    ...extra,
    discordPlayerSlot
  };
}

async function setDiscordPlayerSlotFromCommand({ channelId = "", guildId = "", userId = "", slot = "" } = {}) {
  return withStateLock(async () => {
    if (!safeText(guildId)) {
      return { ok: false, error: "/player_set 只在伺服器頻道中使用。" };
    }
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      return { ok: false, error: "尚未開始。請先使用 /ai_start。" };
    }
    if (!isActiveDiscordAutoChatChannel(channelId)) {
      return { ok: false, error: "這個頻道尚未啟用對話。請先在此頻道使用 /ai_start。" };
    }
    const normalizedSlot = normalizeDiscordPlayerSlot(slot);
    if (!normalizedSlot || normalizedSlot === MODEL_APPEND_PLAYER_OTHER) {
      return { ok: false, error: "請提供有效玩家編號，例如 /player_set 2。" };
    }
    const playerSlot = setDiscordPlayerAssignment(state, {
      channelId,
      userId,
      slot: normalizedSlot,
      uniqueSlot: false
    });
    saveState(state);
    return { ok: true, playerSlot };
  });
}

async function processDiscordChatTurn({
  channel,
  channelId,
  guildId = "",
  userId,
  userName,
  discordMessageId,
  userContent
}) {
  if (!canProcessDiscordChatInChannel(channelId, guildId)) {
    throw new Error("這個伺服器對話已固定在另一個頻道。要切換頻道，請在想使用的頻道輸入 /ai_start。");
  }
  const stopTyping = startTypingIndicator(channel);
  try {
    const pendingOpening = await consumePendingOpening(channelId, userName);
    const result = await runConversationTurn({
      content: userContent,
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: channelId,
        discordGuildId: guildId,
        discordUserId: userId,
        discordUserName: userName,
        discordMessageId
      }
    });

    return {
      pendingOpening,
      replyText: formatAssistantMessageForUserDisplay(result.assistantMessage)
    };
  } finally {
    stopTyping();
  }
}

async function handleDiscordChat(message, userContent) {
  if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
    await message.reply("尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant，再使用對話。");
    return;
  }
  const finalUserContent = await buildDiscordInputWithTextAttachments(userContent, message.attachments);
  if (!finalUserContent) {
    await message.reply("請輸入對話內容，或附上一個 .txt 檔。");
    return;
  }

  const turn = await processDiscordChatTurn({
    channel: message.channel,
    channelId: message.channelId,
    guildId: message.guildId,
    userId: message.author.id,
    userName: message.author.username,
    discordMessageId: message.id,
    userContent: finalUserContent
  });

  const pendingOpening = turn.pendingOpening;
  if (pendingOpening) {
    await sendDiscordLongMessage(message, pendingOpening);
  }
  await sendDiscordLongMessage(message, turn.replyText);
}

async function runSessionTextCommand(message, command, args) {
  if (command === "session_list") {
    await sendDiscordLongMessage(message, formatSavedSessionsText(state));
    return true;
  }

  if (command === "session_save") {
    const inputName = safeText(args.join(" "));
    const session = await withStateLock(async () => {
      const created = createSavedSessionFromCurrentState(state, inputName);
      saveState(state);
      return created;
    });
    await sendDiscordLongMessage(message, `已保存存檔：${session.name}\nID: ${session.id}`);
    return true;
  }

  if (command === "session_load") {
    const id = safeText(args[0]);
    if (!id) {
      await sendDiscordLongMessage(message, "請提供存檔 ID，例如：!ai session_load <id>");
      return true;
    }

    const loaded = await withStateLock(async () => {
      const found = loadSavedSessionIntoRuntime(state, id, { restart: false });
      if (!found) {
        return null;
      }
      saveState(state);
      return found;
    });
    if (!loaded) {
      await sendDiscordLongMessage(message, "找不到指定存檔 ID。");
      return true;
    }
    await sendDiscordLongMessage(
      message,
      `已從存檔點載入：${loaded.name}`
    );
    return true;
  }

  return false;
}

async function runPlayerSetTextCommand(message, args) {
  const result = await setDiscordPlayerSlotFromCommand({
    channelId: message.channelId,
    guildId: message.guildId,
    userId: message.author.id,
    slot: args[0]
  });
  await sendDiscordLongMessage(
    message,
    result.ok ? `已把你設定為 ${result.playerSlot}` : result.error
  );
}

async function runReloadTextCommand(message, args) {
  const feedback = safeText(args.join(" "));
  const stopTyping = startTypingIndicator(message.channel);
  try {
    const result = await regenerateLatestAssistantReply({
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: message.channelId,
        discordGuildId: message.guildId,
        discordUserId: message.author.id,
        discordUserName: message.author.username
      },
      reloadFeedback: feedback
    });
    await sendDiscordLongMessage(message, formatAssistantMessageForUserDisplay(result.assistantMessage));
  } finally {
    stopTyping();
  }
}

async function runReplayTextCommand(message, args) {
  const messageNumber = Number(args[0] || "");
  const content = safeText(args.slice(1).join(" "));
  const stopTyping = startTypingIndicator(message.channel);
  try {
    const result = await replayConversationFromMessageNumber({
      messageNumber,
      content,
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: message.channelId,
        discordGuildId: message.guildId,
        discordUserId: message.author.id,
        discordUserName: message.author.username
      }
    });
    await sendDiscordLongMessage(
      message,
      [
        result.backupSession
          ? `已先建立分支前備份：${result.backupSession.name} (${result.backupSession.id})`
          : "",
        formatAssistantMessageForUserDisplay(result.assistantMessage)
      ].filter(Boolean).join("\n\n")
    );
  } finally {
    stopTyping();
  }
}

function buildRunTimeTurnUserContent(message, turnNumber, totalTurns) {
  const requestText = safeText(message);
  return [
    `用戶要求你現在自行推演${totalTurns}輪,包括用戶及角色`,
    requestText ? `「${requestText}」這是用戶的要求` : "這是用戶的要求",
    `現在是第${turnNumber}輪`
  ].join("\n");
}

function formatRuntimeTurnBlock(turnNumber, assistantContent) {
  return [
    `【第${turnNumber}輪】`,
    safeText(assistantContent) || "（空白）"
  ].join("\n");
}

async function runRuntimeTurns({
  turns,
  message,
  channelId = "",
  guildId = "",
  userId = "",
  userName = "",
  source = "discord_runtime"
}) {
  const normalizedTurns = Math.floor(Number(turns));
  const runtimeRequest = safeText(message);
  if (!Number.isFinite(normalizedTurns) || normalizedTurns < 1) {
    throw new Error("請提供有效輪數，最少為 1。");
  }
  if (!runtimeRequest) {
    throw new Error("請提供 /run_time 的推演要求。");
  }
  if (normalizedTurns > 20) {
    throw new Error("單次自動推演最多 20 輪。");
  }
  if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
    throw new Error("尚未開始。請先在網頁選擇角色卡並開始對話，或使用 /ai_start。");
  }
  if (isCharacterCardCreationAssistantActive(state)) {
    throw new Error("CharacterCardCreationAssistant 不支援 /run_time 自動推演。");
  }

  const transcriptBlocks = [];
  const pendingOpening = await consumePendingOpening(channelId, userName);
  if (pendingOpening) {
    transcriptBlocks.push(["【開場】", pendingOpening].join("\n"));
  }

  for (let index = 0; index < normalizedTurns; index += 1) {
    const turnRequest = buildRunTimeTurnUserContent(runtimeRequest, index + 1, normalizedTurns);
    const result = await runConversationTurn({
      content: turnRequest,
      source,
      extra: {
        platform: "discord",
        discordChannelId: channelId,
        discordGuildId: guildId,
        discordUserId: userId,
        discordUserName: userName,
        autoRuntime: true,
        runtimeTurnIndex: index + 1
      }
    });

    transcriptBlocks.push(formatRuntimeTurnBlock(index + 1, formatAssistantMessageForUserDisplay(result.assistantMessage)));
  }

  return {
    turns: normalizedTurns,
    transcriptText: transcriptBlocks.join("\n\n")
  };
}

async function runRuntimeTextCommand(message, args) {
  const turns = Number(args[0] || "");
  const requestMessage = safeText(args.slice(1).join(" "));
  const stopTyping = startTypingIndicator(message.channel);
  try {
    const result = await runRuntimeTurns({
      turns,
      message: requestMessage,
      channelId: message.channelId,
      guildId: message.guildId,
      userId: message.author.id,
      userName: message.author.username
    });
    await sendDiscordLongMessage(message, result.transcriptText);
  } finally {
    stopTyping();
  }
}

async function registerSlashCommands(discordClient) {
  const app = discordClient.application;
  if (!app) {
    return;
  }

  try {
    await app.commands.set(DISCORD_SLASH_COMMANDS);
    console.log("Slash 指令已註冊到全域應用程式");
  } catch (error) {
    console.error("全域 Slash 指令註冊失敗：", error);
    return;
  }

  const guildId = safeText(DISCORD_GUILD_ID);
  if (!guildId) {
    return;
  }

  const clientId = getDiscordClientId();
  if (clientId && guildId === clientId) {
    console.warn(`已略過 guild Slash 指令註冊：DISCORD_GUILD_ID=${guildId} 看起來是 Bot Client ID，不是伺服器 ID。`);
    return;
  }

  try {
    const guild = await discordClient.guilds.fetch(guildId);
    await guild.commands.set(DISCORD_SLASH_COMMANDS);
    console.log(`Slash 指令已註冊到 guild: ${guildId}`);
  } catch (error) {
    if (error?.code === 10004) {
      console.warn(`已略過 guild Slash 指令註冊：找不到 DISCORD_GUILD_ID=${guildId}，請確認這是伺服器 ID 且 Bot 已加入該伺服器。`);
      return;
    }
    console.error("Guild Slash 指令註冊失敗：", error);
  }
}

async function handleSlashCommand(interaction) {
  const name = interaction.commandName;

  if (name === "ai_help") {
    await safeSendInteractionText(interaction, getDiscordGuidance(), { ephemeral: true });
    return;
  }

  if (name === "ai_status") {
    await safeSendInteractionText(interaction, buildDiscordStatusText(), { ephemeral: true });
    return;
  }

  if (name === "stop") {
    const stopped = requestStopActiveGeneration();
    await safeSendInteractionText(
      interaction,
      stopped ? GENERATION_STOPPED_MESSAGE : "目前沒有正在生成的對話。",
      { ephemeral: true }
    );
    return;
  }

  if (name === "player_set") {
    const number = interaction.options.getInteger("number");
    const result = await setDiscordPlayerSlotFromCommand({
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      userId: interaction.user.id,
      slot: String(number || "")
    });
    await safeSendInteractionText(
      interaction,
      result.ok ? `已把你設定為 ${result.playerSlot}` : result.error,
      { ephemeral: true }
    );
    return;
  }

  if (name === "reload") {
    const feedback = safeText(interaction.options.getString("feedback") || "");
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const result = await regenerateLatestAssistantReply({
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: interaction.channelId,
        discordGuildId: interaction.guildId,
        discordUserId: interaction.user.id,
        discordUserName: interaction.user.username
      },
      reloadFeedback: feedback
    });
    await sendInteractionLongReply(interaction, formatAssistantMessageForUserDisplay(result.assistantMessage));
    return;
  }

  if (name === "replay") {
    const messageNumber = interaction.options.getInteger("message_number");
    const content = safeText(interaction.options.getString("content") || "");
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const result = await replayConversationFromMessageNumber({
      messageNumber,
      content,
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: interaction.channelId,
        discordGuildId: interaction.guildId,
        discordUserId: interaction.user.id,
        discordUserName: interaction.user.username
      }
    });
    await sendInteractionLongReply(
      interaction,
      [
        result.backupSession
          ? `已先建立分支前備份：${result.backupSession.name} (${result.backupSession.id})`
          : "",
        formatAssistantMessageForUserDisplay(result.assistantMessage)
      ].filter(Boolean).join("\n\n")
    );
    return;
  }

  if (name === "run_time") {
    const turns = interaction.options.getInteger("number");
    const requestMessage = safeText(interaction.options.getString("message") || "");
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡並開始對話，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }
    if (isCharacterCardCreationAssistantActive(state)) {
      await safeSendInteractionText(
        interaction,
        "CharacterCardCreationAssistant 不支援 /run_time 自動推演。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const result = await runRuntimeTurns({
      turns,
      message: requestMessage,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      userId: interaction.user.id,
      userName: interaction.user.username
    });
    await sendInteractionLongReply(interaction, result.transcriptText);
    return;
  }

  if (name === "ai_start") {
    if (!getActiveRoleCard(state) && !isCharacterCardCreationAssistantActive(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未選擇角色卡或助手模式。請先在網頁啟用角色卡或 CharacterCardCreationAssistant。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const result = await startSessionFromDiscord(interaction.channelId, {
      userId: interaction.user.id,
      userName: interaction.user.username
    });
    if (!result.ok) {
      await interaction.editReply(result.error);
      return;
    }
    await sendInteractionLongReply(interaction, result.openingDialogue);
    return;
  }

  if (name === "session_save") {
    const inputName = safeText(interaction.options.getString("name") || "");
    const session = await withStateLock(async () => {
      const created = createSavedSessionFromCurrentState(state, inputName);
      saveState(state);
      return created;
    });
    await safeSendInteractionText(interaction, `已保存存檔：${session.name}\nID: ${session.id}`, { ephemeral: true });
    return;
  }

  if (name === "session_list") {
    await safeSendInteractionText(interaction, formatSavedSessionsText(state), { ephemeral: true });
    return;
  }

  if (name === "session_load") {
    const id = safeText(interaction.options.getString("id") || "");
    const loaded = await withStateLock(async () => {
      const found = loadSavedSessionIntoRuntime(state, id, { restart: false });
      if (!found) {
        return null;
      }
      saveState(state);
      return found;
    });
    if (!loaded) {
      await safeSendInteractionText(interaction, "找不到指定存檔 ID。", { ephemeral: true });
      return;
    }
    await safeSendInteractionText(
      interaction,
      `已從存檔點載入：${loaded.name}`,
      { ephemeral: true }
    );
    return;
  }

  if (name === "ai") {
    const content = safeText(interaction.options.getString("content") || "");
    const attachment = interaction.options.getAttachment("file");
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡或啟用 CharacterCardCreationAssistant，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const finalContent = await buildDiscordInputWithTextAttachments(content, attachment ? [attachment] : []);
    if (!finalContent) {
      await safeSendInteractionText(interaction, "請輸入對話內容，或上傳一個 .txt 檔。", { ephemeral: true });
      return;
    }
    const turn = await processDiscordChatTurn({
      channel: interaction.channel,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      userId: interaction.user.id,
      userName: interaction.user.username,
      userContent: finalContent
    });
    const combinedReply = turn.pendingOpening
      ? `${turn.pendingOpening}\n\n${turn.replyText}`
      : turn.replyText;
    await sendInteractionLongReply(interaction, combinedReply);
  }
}

function setupDiscordBot() {
  if (!DISCORD_BOT_TOKEN) {
    console.log("Discord bot 未啟用：缺少 DISCORD_BOT_TOKEN，僅啟動網頁管理端。");
    return;
  }

  const discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages
    ],
    partials: [Partials.Channel, Partials.Message]
  });
  activeDiscordClient = discordClient;

  discordClient.on("clientReady", () => {
    discordConnected = true;
    console.log(`Discord bot 已上線：${discordClient.user?.tag || "unknown"}`);
    void registerSlashCommands(discordClient);
  });

  discordClient.on("messageCreate", async (message) => {
    if (message.author.bot) {
      return;
    }

    const extractedInput = extractDiscordInput(message);
    if (extractedInput === null) {
      return;
    }

    const hasTextAttachment = hasSupportedDiscordTextAttachment(message.attachments);
    if (!extractedInput && !hasTextAttachment) {
      await message.reply(getDiscordGuidance());
      return;
    }

    try {
      const isPrefixedTextCommand = safeText(message.content).startsWith(COMMAND_PREFIX);
      const isActiveBareGuildInput = Boolean(message.guildId) &&
        !isPrefixedTextCommand &&
        isActiveDiscordAutoChatChannel(message);
      const parsedInput = extractedInput
        ? parseDiscordTextInput(extractedInput, {
            allowBareMetaCommands: isPrefixedTextCommand || safeText(extractedInput).startsWith("/")
          })
        : { type: "chat", content: "" };

      if (parsedInput.type === "meta") {
        if (parsedInput.command === "help") {
          await message.reply(getDiscordGuidance());
          return;
        }

        if (parsedInput.command === "status") {
          await replyDiscordStatus(message);
          return;
        }

        if (parsedInput.command === "stop") {
          const stopped = requestStopActiveGeneration();
          await message.reply(stopped ? GENERATION_STOPPED_MESSAGE : "目前沒有正在生成的對話。");
          return;
        }

        if (parsedInput.command === "start") {
          const result = await startSessionFromDiscord(message.channelId, {
            userId: message.author.id,
            userName: message.author.username
          });
          if (!result.ok) {
            await message.reply(result.error);
            return;
          }

          await sendDiscordLongMessage(message, result.openingDialogue);
          return;
        }

        const sessionHandled = await runSessionTextCommand(
          message,
          parsedInput.command,
          parsedInput.args || []
        );
        if (sessionHandled) {
          return;
        }

        if (parsedInput.command === "reload") {
          await runReloadTextCommand(message, parsedInput.args || []);
          return;
        }

        if (parsedInput.command === "replay") {
          await runReplayTextCommand(message, parsedInput.args || []);
          return;
        }

        if (parsedInput.command === "run_time") {
          await runRuntimeTextCommand(message, parsedInput.args || []);
          return;
        }

        if (parsedInput.command === "player_set") {
          await runPlayerSetTextCommand(message, parsedInput.args || []);
          return;
        }

        await message.reply(getDiscordGuidance());
        return;
      }

      if (!isActiveBareGuildInput && Boolean(message.guildId) && !isPrefixedTextCommand) {
        await message.reply(getDiscordGuidance());
        return;
      }

      await handleDiscordChat(message, parsedInput.content);
    } catch (error) {
      if (isGenerationStoppedError(error)) {
        await message.reply(GENERATION_STOPPED_MESSAGE);
        return;
      }
      await message.reply(`處理失敗：${error.message || "未知錯誤"}`);
    }
  });

  discordClient.on("messageUpdate", async (_, updatedMessage) => {
    const message = updatedMessage.partial ? await updatedMessage.fetch() : updatedMessage;
    if (!message || message.author?.bot) {
      return;
    }

    const extractedInput = extractDiscordInput(message);
    if (extractedInput === null || !extractedInput) {
      return;
    }

    try {
      const isPrefixedTextCommand = safeText(message.content).startsWith(COMMAND_PREFIX);
      const isActiveBareGuildInput = Boolean(message.guildId) &&
        !isPrefixedTextCommand &&
        isActiveDiscordAutoChatChannel(message);
      const parsedInput = parseDiscordTextInput(extractedInput, {
        allowBareMetaCommands: isPrefixedTextCommand || safeText(extractedInput).startsWith("/")
      });
      if (parsedInput.type !== "chat") {
        return;
      }
      if (!isActiveBareGuildInput && Boolean(message.guildId) && !isPrefixedTextCommand) {
        return;
      }

      const stopTyping = startTypingIndicator(message.channel);
      try {
        const result = await replayConversationFromDiscordMessageId({
          discordMessageId: message.id,
          content: parsedInput.content,
          source: "discord",
          extra: {
            platform: "discord",
            discordChannelId: message.channelId,
            discordGuildId: message.guildId,
            discordUserId: message.author.id,
            discordUserName: message.author.username
          }
        });

        await sendDiscordLongMessage(
          message,
          [
            [
              "```",
              result.backupSession
                ? `已先建立編輯前備份：${result.backupSession.name} (${result.backupSession.id})`
                : "",
              "已依照你編輯後的訊息，從該則對話重新開始。",
              "```"
            ].filter(Boolean).join("\n"),
            formatAssistantMessageForUserDisplay(result.assistantMessage)
          ].filter(Boolean).join("\n\n")
        );
      } finally {
        stopTyping();
      }
    } catch (error) {
      if (isGenerationStoppedError(error)) {
        await message.reply(GENERATION_STOPPED_MESSAGE);
        return;
      }
      await message.reply(`編輯後重算失敗：${error.message || "未知錯誤"}`);
    }
  });

  discordClient.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {
      if (shouldDeferSlashCommandEarly(interaction.commandName) && !interaction.deferred && !interaction.replied) {
        await interaction.deferReply();
      }
      await handleSlashCommand(interaction);
    } catch (error) {
      if (isUnknownInteractionError(error)) {
        console.warn("Discord interaction 已過期，訊息無法送出。");
        return;
      }
      if (isGenerationStoppedError(error)) {
        await safeSendInteractionError(interaction, GENERATION_STOPPED_MESSAGE);
        return;
      }
      const content = `處理失敗：${error.message || "未知錯誤"}`;
      await safeSendInteractionError(interaction, content);
    }
  });

  discordClient.on("error", (error) => {
    discordConnected = false;
    console.error("Discord bot 錯誤：", error);
  });

  discordClient.on("shardDisconnect", () => {
    discordConnected = false;
  });

  discordClient
    .login(DISCORD_BOT_TOKEN)
    .catch((error) => {
      discordConnected = false;
      console.error("Discord bot 登入失敗：", error);
    });
}

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  setupDiscordBot();
});
