import "dotenv/config";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import os from "node:os";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  ApplicationCommandOptionType,
  ApplicationIntegrationType,
  AttachmentBuilder,
  ChannelType,
  Client,
  GatewayIntentBits,
  InteractionContextType,
  MessageFlags,
  Partials,
  PermissionFlagsBits
} from "discord.js";
import {
  hasActiveAssistantTarget,
  hasActiveConversationTarget,
  runConversationTurnWorkflow
} from "./conversation-turn.js";
import {
  findRecentUserMessageIndex,
  normalizeRecentUserInputNumber
} from "./conversation-history.js";
import { getContextMessageRoundLabels } from "./context-rounds.js";
import {
  isLegacyDiscordTextCommand,
  LEGACY_DISCORD_TEXT_COMMAND_NOTICE
} from "./discord-message.js";
import {
  buildDiscordGuildWelcomeMessage,
  buildDiscordInstallUrl,
  DISCORD_USER_INSTALL_WELCOME_MESSAGE,
  getDiscordUserInstallAuthorization,
  verifyDiscordWebhookSignature
} from "./discord-onboarding.js";
import { hasKeepTimeDirective, stripKeepTimeDirective } from "./keep-time.js";
import { buildQuickSendContent, QUICK_SEND_TEMPLATES } from "./quick-send.js";
import {
  buildStoryboardExecutionPlan,
  composeStoryboardSceneSettings,
  createStoryboard,
  normalizeStoryboard,
  storyboardSummary,
  validateStoryboard
} from "./novelai-storyboard.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "..", "data");
const DEFAULTS_DIR = path.join(__dirname, "..", "defaults");
const ENV_FILE = path.join(__dirname, "..", ".env");
const BUNDLED_APP_DEFAULTS_FILE = path.join(DEFAULTS_DIR, "app-defaults.json");
const APP_DEFAULTS_FILE = path.join(DATA_DIR, "app-defaults.json");
const STATE_FILE = path.join(DATA_DIR, "app-state.json");
const CARD_STATE_FILE = path.join(DATA_DIR, "cardstate.json");
const SAVED_SESSIONS_DIR = path.join(DATA_DIR, "saved-sessions");
const NOVELAI_ALBUM_DIR = path.join(DATA_DIR, "novelai-album");
const NOVELAI_ALBUM_INDEX_FILE = path.join(NOVELAI_ALBUM_DIR, "index.json");
const BUNDLED_NOVELAI_DEFAULTS_FILE = path.join(DEFAULTS_DIR, "novelai-defaults.json");
const NOVELAI_DEFAULTS_FILE = path.join(DATA_DIR, "novelai-defaults.json");
const NOVELAI_STORYBOARDS_DIR = path.join(DATA_DIR, "novelai-storyboards");
const DEFAULT_ENV_SECRET_KEY_PATTERN = /(?:^|_)(?:SECRET|PASSWORD|PRIVATE_KEY)(?:$|_|\d)|(?:^|_)TOKEN(?:$|\d)|(?:^|_)API_KEY(?:$|\d)/iu;
const DEFAULT_ENV_EXCLUDED_KEYS = new Set([
  "DISCORD_BOT_TOKEN",
  "CHAT_API_KEY",
  "CONVERSATION_API_KEY",
  "DEEPSEEK_API_KEY",
  "OPENAI_API_KEY",
  "GEMINI_API_KEY"
]);
const CHARACTER_CARD_CREATION_ASSISTANT_MODE = "CharacterCardCreationAssistant";
let appDefaultEnvironmentValuesCache = null;
ensureLocalDefaultsFiles();
applyDefaultEnvToProcess();
const PORT = Number(process.env.PORT || 3234);
const DISCORD_BOT_TOKEN = safeText(process.env.DISCORD_BOT_TOKEN);
const DISCORD_GUILD_ID = safeText(process.env.DISCORD_GUILD_ID);
const DISCORD_PUBLIC_KEY = safeText(process.env.DISCORD_PUBLIC_KEY);
const DEFAULT_CHAT_API_PROVIDER = "deepseek";
const DEFAULT_CHAT_API_MODEL = "deepseek-v4-pro";
const DEFAULT_MIN_REPLY_CHARS = 600;
const CHAT_API_LENGTH_RETRY_LIMIT = 1;
const CHAT_API_TEMPERATURE = 0.5;
const CHARACTER_CARD_CREATION_ASSISTANT_TEMPERATURE = 0.9;
const DEFAULT_DIALOGUE_CONTEXT_ROUNDS = 20;
const DEFAULT_ASSISTANT_CARD_NAME = "寫卡助手";
const DEFAULT_ASSISTANT_CARD_DESCRIPTION = "專門協助建立角色卡、角色群組與無角色模式設定包。";
const DISCORD_TEXT_ATTACHMENT_MAX_BYTES = envNumber("DISCORD_TEXT_ATTACHMENT_MAX_BYTES", 1024 * 1024);
const DISCORD_LOGIN_RETRY_INITIAL_MS = envNumber("DISCORD_LOGIN_RETRY_INITIAL_MS", 15_000);
const DISCORD_LOGIN_RETRY_MAX_MS = envNumber("DISCORD_LOGIN_RETRY_MAX_MS", 300_000);
const DISCORD_LOGIN_RETRY_MAX_ATTEMPTS = envNumber("DISCORD_LOGIN_RETRY_MAX_ATTEMPTS", 0);
const NOVELAI_IMAGE_API_DEFAULT_BASE_URL = "https://image.novelai.net";
const NOVELAI_PRIMARY_API_DEFAULT_BASE_URL = "https://api.novelai.net";
const NOVELAI_REQUEST_TIMEOUT_MS = envNumber("NOVELAI_REQUEST_TIMEOUT_MS", 600000);
const MODEL_IMAGE_PROMPT_CONTEXT_ROUNDS = envNumber("MODEL_IMAGE_PROMPT_CONTEXT_ROUNDS", 5);
const DEFAULT_ROLE_CARD_MODE = "multi";
const STANDARD_COMPRESSION_PROFILE_ID = "standard";
const MODEL_TRIGGER_ACTION_CALL_API = "call_api";
const MODEL_TRIGGER_ACTION_COPY_USER_INPUT = "copy_user_input";
const COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY = "text_only";
const COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT = "role_and_text";
const KEYWORD_FOLLOWUP_CONTINUE_REASONER = "continue_reasoner";
const KEYWORD_FOLLOWUP_STOP_AFTER_MODEL = "stop_after_model";
const KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER = "image_parallel_reasoner";
const KEYWORD_FOLLOWUP_IMAGE_ONLY = "image_only";
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
const DEFAULT_AUTO_TIME_PERIOD_ROUNDS = 3;
const ASSISTANT_FEEDBACK_LIKE = "like";
const ASSISTANT_FEEDBACK_DISLIKE = "dislike";
const ASSISTANT_FEEDBACK_EMOJIS = {
  [ASSISTANT_FEEDBACK_LIKE]: "👍",
  [ASSISTANT_FEEDBACK_DISLIKE]: "👎"
};
const ASSISTANT_FEEDBACK_PROMPT_PREFIXES = {
  [ASSISTANT_FEEDBACK_LIKE]: "【user 喜歡你這次的正文輸出】",
  [ASSISTANT_FEEDBACK_DISLIKE]: "【user 不喜歡你這次的正文輸出】"
};
const CHAT_API_COST_PRICING = [
  { label: "DeepSeek-V4-Pro", aliases: ["deepseek-v4-pro"], currency: "CNY", inputCacheHitPerMillion: 0.025, inputCacheMissPerMillion: 3, outputPerMillion: 6 },
  { label: "DeepSeek-V4-Flash", aliases: ["deepseek-v4-flash"], currency: "CNY", inputCacheHitPerMillion: 0.02, inputCacheMissPerMillion: 1, outputPerMillion: 2 },
  { label: "Gemini 2.5 Flash-Lite", aliases: ["gemini-2.5-flash-lite", "gemini 2.5 flash-lite", "gemini-2.5-flash-lite-preview"], currency: "USD", inputCacheHitPerMillion: 0.01, inputCacheMissPerMillion: 0.10, outputPerMillion: 0.40 },
  { label: "Gemini 2.5 Flash", aliases: ["gemini-2.5-flash", "gemini 2.5 flash"], currency: "USD", inputCacheHitPerMillion: 0.03, inputCacheMissPerMillion: 0.30, outputPerMillion: 2.50 },
  { label: "Gemini 3 Flash Preview", aliases: ["gemini-3-flash-preview", "gemini 3 flash preview"], currency: "USD", inputCacheHitPerMillion: 0.05, inputCacheMissPerMillion: 0.50, outputPerMillion: 3.00 },
  { label: "Gemini 2.5 Pro >200k prompt", aliases: ["gemini-2.5-pro", "gemini 2.5 pro"], currency: "USD", minPromptTokens: 200001, inputCacheHitPerMillion: 0.25, inputCacheMissPerMillion: 2.50, outputPerMillion: 15.00 },
  { label: "Gemini 2.5 Pro <=200k prompt", aliases: ["gemini-2.5-pro", "gemini 2.5 pro"], currency: "USD", maxPromptTokens: 200000, inputCacheHitPerMillion: 0.125, inputCacheMissPerMillion: 1.25, outputPerMillion: 10.00 },
  { label: "GPT-5.4 mini", aliases: ["gpt-5.4-mini", "gpt-5.4 mini"], currency: "USD", inputCacheHitPerMillion: 0.075, inputCacheMissPerMillion: 0.75, outputPerMillion: 4.50 },
  { label: "GPT-5.4", aliases: ["gpt-5.4"], currency: "USD", inputCacheHitPerMillion: 0.25, inputCacheMissPerMillion: 2.50, outputPerMillion: 15.00 },
  { label: "GPT-5.5", aliases: ["gpt-5.5"], currency: "USD", inputCacheHitPerMillion: 0.50, inputCacheMissPerMillion: 5.00, outputPerMillion: 30.00 },
  { label: "Claude Haiku 4.5", aliases: ["claude-haiku-4.5", "claude haiku 4.5"], currency: "USD", inputCacheHitPerMillion: 0.10, inputCacheMissPerMillion: 1.00, outputPerMillion: 5.00 },
  { label: "Claude Sonnet 4.6 / 4.5", aliases: ["claude-sonnet-4.6", "claude sonnet 4.6", "claude-sonnet-4.5", "claude sonnet 4.5"], currency: "USD", inputCacheHitPerMillion: 0.30, inputCacheMissPerMillion: 3.00, outputPerMillion: 15.00 },
  { label: "Claude Opus 4.7 / 4.6 / 4.5", aliases: ["claude-opus-4.7", "claude opus 4.7", "claude-opus-4.6", "claude opus 4.6", "claude-opus-4.5", "claude opus 4.5"], currency: "USD", inputCacheHitPerMillion: 0.50, inputCacheMissPerMillion: 5.00, outputPerMillion: 25.00 }
];
const DEFAULT_TIME_TRACKING_CONFIG = {
  nextDayWords: ["下一天", "第二天", "隔天", "翌日", "次日", "明天", "明日"],
  connectorWords: ["來到", "来到", "已經", "已经", "現在", "现在", "到了", "變成", "变成", "已是"],
  noChangeWords: ["等到", "等一下", "的時候", "的时候"],
  morningWords: ["早上", "早晨", "清晨", "早餐", "早飯", "早饭", "上午", "天亮"],
  noonWords: ["中午", "下午", "午餐", "午飯", "午饭", "正午"],
  eveningWords: ["晚上", "夜晚", "晚餐", "晚飯", "晚饭", "傍晚", "深夜", "夜裡", "夜里"]
};

function envText(key, fallback) {
  const raw = Object.prototype.hasOwnProperty.call(process.env, key)
    ? safeText(process.env[key])
    : getAppDefaultEnvText(key);
  if (typeof raw !== "string" || raw.trim() === "") {
    return fallback;
  }
  return raw.replace(/\\n/g, "\n");
}

function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeJsonFile(filePath, payload) {
  const directory = path.dirname(filePath);
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
  const temporaryFile = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    fs.renameSync(temporaryFile, filePath);
  } finally {
    if (fs.existsSync(temporaryFile)) {
      fs.unlinkSync(temporaryFile);
    }
  }
}

function mergeLegacyPromptFilesIntoDefaults(input = {}) {
  const defaults = cloneData(input, {});
  const legacyPromptsDir = path.join(__dirname, "..", "prompts");
  const legacyModularPromptsDir = path.join(legacyPromptsDir, "modular");
  const modularPromptConfigs = defaults.modularPromptConfigs &&
    typeof defaults.modularPromptConfigs === "object" &&
    !Array.isArray(defaults.modularPromptConfigs)
    ? cloneData(defaults.modularPromptConfigs, {})
    : {};

  try {
    if (fs.existsSync(legacyModularPromptsDir)) {
      fs.readdirSync(legacyModularPromptsDir)
        .filter((fileName) => fileName.endsWith(".json"))
        .forEach((fileName) => {
          const config = readJsonFile(path.join(legacyModularPromptsDir, fileName));
          const mode = safeText(config?.mode || path.basename(fileName, ".json"));
          if (mode && config) {
            modularPromptConfigs[mode] = config;
          }
        });
    }
  } catch {
    // Legacy Prompt files are optional migration inputs.
  }

  if (Object.keys(modularPromptConfigs).length > 0) {
    defaults.modularPromptConfigs = modularPromptConfigs;
  }

  const assistantPromptFile = path.join(legacyPromptsDir, "CharacterCardCreationAssistant.txt");
  try {
    const prompt = fs.existsSync(assistantPromptFile)
      ? fs.readFileSync(assistantPromptFile, "utf8").trim()
      : "";
    if (prompt && Array.isArray(defaults.assistantCards)) {
      defaults.assistantCards = defaults.assistantCards.map((card) =>
        safeText(card?.id) === CHARACTER_CARD_CREATION_ASSISTANT_MODE
          ? { ...card, prompt }
          : card
      );
    }
  } catch {
    // Keep the bundled assistant Prompt when legacy migration cannot read the file.
  }

  const compressionPromptFile = path.join(legacyPromptsDir, "Context_compression.txt");
  try {
    const prompt = fs.existsSync(compressionPromptFile)
      ? fs.readFileSync(compressionPromptFile, "utf8").trim()
      : "";
    if (prompt) {
      defaults.contextCompressionPrompt = prompt;
    }
  } catch {
    // Keep the bundled compression Prompt when legacy migration cannot read the file.
  }

  return defaults;
}

function ensureLocalDefaultsFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(APP_DEFAULTS_FILE)) {
    const bundled = readJsonFile(BUNDLED_APP_DEFAULTS_FILE);
    if (bundled) {
      writeJsonFile(APP_DEFAULTS_FILE, mergeLegacyPromptFilesIntoDefaults(bundled));
    }
  }
  if (!fs.existsSync(NOVELAI_DEFAULTS_FILE)) {
    const bundled = readJsonFile(BUNDLED_NOVELAI_DEFAULTS_FILE);
    if (bundled) {
      writeJsonFile(NOVELAI_DEFAULTS_FILE, bundled);
    }
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

function isDefaultEnvSecretKey(key = "") {
  const normalizedKey = safeText(key).trim();
  if (!normalizedKey) {
    return true;
  }
  if (/^CHAT_API_KEY[2-9]\d*$/iu.test(normalizedKey)) {
    return true;
  }
  if (/^(?:CONVERSATION_API_KEY|DEEPSEEK_API_KEY|DEEPSEEK_KEY)[2-9]\d*$/iu.test(normalizedKey)) {
    return true;
  }
  if (DEFAULT_ENV_EXCLUDED_KEYS.has(normalizedKey.toUpperCase())) {
    return true;
  }
  return DEFAULT_ENV_SECRET_KEY_PATTERN.test(normalizedKey);
}

function normalizeDefaultEnvironmentValues(values = {}) {
  const source = values && typeof values === "object" && !Array.isArray(values) ? values : {};
  return Object.entries(source).reduce((acc, [key, value]) => {
    const normalizedKey = safeText(key).trim();
    const text = safeText(value);
    if (!normalizedKey || !text || isDefaultEnvSecretKey(normalizedKey)) {
      return acc;
    }
    acc[normalizedKey] = text;
    return acc;
  }, {});
}

function readRawAppDefaults() {
  return readJsonFile(APP_DEFAULTS_FILE) || readJsonFile(BUNDLED_APP_DEFAULTS_FILE);
}

function readBundledAppDefaults() {
  return readJsonFile(BUNDLED_APP_DEFAULTS_FILE);
}

function updateLocalAppDefaults(update) {
  const current = readRawAppDefaults() || {};
  const next = typeof update === "function" ? update(cloneData(current, {})) : update;
  if (!next || typeof next !== "object" || Array.isArray(next)) {
    throw new Error("本機預設格式無效。");
  }
  writeJsonFile(APP_DEFAULTS_FILE, {
    ...next,
    updatedAt: nowIso()
  });
  return readJsonFile(APP_DEFAULTS_FILE);
}

function normalizeDefaultEnvironment(source = {}) {
  const raw = source && typeof source === "object" ? source : {};
  const values = raw.values && typeof raw.values === "object"
    ? raw.values
    : raw.env && typeof raw.env === "object"
      ? raw.env
      : raw;
  return {
    values: normalizeDefaultEnvironmentValues(values),
    updatedAt: safeText(raw.updatedAt)
  };
}

function loadAppDefaultEnvironmentValues() {
  if (appDefaultEnvironmentValuesCache) {
    return appDefaultEnvironmentValuesCache;
  }
  const parsed = readRawAppDefaults();
  const environment = normalizeDefaultEnvironment(parsed?.environment || parsed?.envDefaults || parsed?.env);
  appDefaultEnvironmentValuesCache = environment.values;
  return appDefaultEnvironmentValuesCache;
}

function getAppDefaultEnvText(key = "") {
  const normalizedKey = safeText(key).trim();
  if (!normalizedKey) {
    return "";
  }
  return safeText(loadAppDefaultEnvironmentValues()[normalizedKey]);
}

function applyDefaultEnvToProcess() {
  const values = loadAppDefaultEnvironmentValues();
  Object.entries(values).forEach(([key, value]) => {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      process.env[key] = value;
    }
  });
}

function createDefaultEnvironmentPayload(content = "") {
  const parsedEnv = parseEnvContent(content);
  const mergedValues = {
    ...loadAppDefaultEnvironmentValues(),
    ...parsedEnv
  };
  return {
    values: normalizeDefaultEnvironmentValues(mergedValues),
    updatedAt: nowIso()
  };
}

function formatDefaultEnvValue(value = "") {
  const text = safeText(value);
  if (!text) {
    return "";
  }
  if (/^[^\s#"'`\\]+$/u.test(text)) {
    return text;
  }
  return JSON.stringify(text.replace(/\n/g, "\\n"));
}

function buildEnvContentFromDefaultEnvironment(values = {}) {
  const entries = Object.entries(normalizeDefaultEnvironmentValues(values))
    .sort(([a], [b]) => a.localeCompare(b));
  if (entries.length === 0) {
    return "";
  }
  return [
    "# 由本機預設載入的環境設定。",
    "# Discord Bot Token 與對話 API Key 不會寫入預設。",
    ...entries.map(([key, value]) => `${key}=${formatDefaultEnvValue(value)}`)
  ].join("\n") + "\n";
}

function readEnvFileContentForEditor() {
  const content = readEnvFileContent();
  if (safeText(content)) {
    return content;
  }
  return buildEnvContentFromDefaultEnvironment(loadAppDefaultEnvironmentValues());
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

function createDefaultAssistantCard() {
  const now = nowIso();
  return {
    id: CHARACTER_CARD_CREATION_ASSISTANT_MODE,
    name: DEFAULT_ASSISTANT_CARD_NAME,
    description: DEFAULT_ASSISTANT_CARD_DESCRIPTION,
    prompt: getCharacterCardCreationAssistantPrompt(),
    locked: true,
    createdAt: now,
    updatedAt: now
  };
}

function normalizeAssistantCard(input = {}, index = 0) {
  const source = input && typeof input === "object" ? input : {};
  const isDefault = safeText(source.id) === CHARACTER_CARD_CREATION_ASSISTANT_MODE || index === 0;
  const id = safeText(source.id) || (isDefault ? CHARACTER_CARD_CREATION_ASSISTANT_MODE : newId("assistant"));
  const fallback = createDefaultAssistantCard();
  return {
    id,
    name: safeText(source.name || source.title || source.label) || (id === CHARACTER_CARD_CREATION_ASSISTANT_MODE ? DEFAULT_ASSISTANT_CARD_NAME : `新助手 ${index + 1}`),
    description: safeText(source.description || source.intro) || (id === CHARACTER_CARD_CREATION_ASSISTANT_MODE ? DEFAULT_ASSISTANT_CARD_DESCRIPTION : "自訂助手卡。"),
    prompt: safeText(source.prompt || source.systemPrompt || source.system_prompt) || (id === CHARACTER_CARD_CREATION_ASSISTANT_MODE ? fallback.prompt : getCharacterCardCreationAssistantPrompt()),
    locked: id === CHARACTER_CARD_CREATION_ASSISTANT_MODE || source.locked === true,
    createdAt: safeText(source.createdAt) || nowIso(),
    updatedAt: safeText(source.updatedAt) || nowIso()
  };
}

function normalizeAssistantCards(value = []) {
  const cards = (Array.isArray(value) ? value : [])
    .map((item, index) => normalizeAssistantCard(item, index))
    .filter((card) => card.id);
  const byId = new Map(cards.map((card) => [card.id, card]));
  const defaultCard = normalizeAssistantCard({
    ...createDefaultAssistantCard(),
    ...(byId.get(CHARACTER_CARD_CREATION_ASSISTANT_MODE) || {})
  });
  byId.set(CHARACTER_CARD_CREATION_ASSISTANT_MODE, defaultCard);
  return [
    byId.get(CHARACTER_CARD_CREATION_ASSISTANT_MODE),
    ...Array.from(byId.values()).filter((card) => card.id !== CHARACTER_CARD_CREATION_ASSISTANT_MODE)
  ];
}

function getAssistantCards(currentState = state) {
  return normalizeAssistantCards(currentState?.assistantCards);
}

function getAssistantCardById(currentState = state, assistantId = "") {
  const normalizedId = normalizeAssistantMode(assistantId);
  if (!normalizedId) {
    return null;
  }
  return getAssistantCards(currentState).find((card) => card.id === normalizedId) || null;
}

function getActiveAssistantCard(currentState = state) {
  return getAssistantCardById(currentState, currentState?.activeAssistantMode);
}

function getActiveAssistantName(currentState = state) {
  return safeText(getActiveAssistantCard(currentState)?.name) || DEFAULT_ASSISTANT_CARD_NAME;
}

function saveCharacterCardCreationAssistantPrompt(content = "") {
  const nextPrompt = safeText(content) || getCharacterCardCreationAssistantPrompt();
  characterCardCreationAssistantPrompt = nextPrompt;
  updateLocalAppDefaults((defaults) => ({
    ...defaults,
    version: Math.max(3, Number(defaults.version || 0)),
    assistantCards: normalizeAssistantCards(defaults.assistantCards).map((card) =>
      card.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE
        ? { ...card, prompt: nextPrompt, updatedAt: nowIso() }
        : card
    )
  }));
  return characterCardCreationAssistantPrompt;
}

function renderPromptTemplate(template, variables) {
  return Object.entries(variables).reduce((output, [key, value]) => {
    const pattern = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    return output.replace(pattern, String(value ?? ""));
  }, template);
}

function envNumber(key, fallback) {
  const raw = Number(
    Object.prototype.hasOwnProperty.call(process.env, key)
      ? safeText(process.env[key])
      : getAppDefaultEnvText(key) || ""
  );
  return Number.isFinite(raw) && raw > 0 ? raw : fallback;
}

function envFirstText(keys = [], fallback = "") {
  let hasExplicitValue = false;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    hasExplicitValue = true;
    const value = safeText(process.env[key]);
    if (value) {
      return value;
    }
  }
  if (!hasExplicitValue) {
    for (const key of keys) {
      const value = getAppDefaultEnvText(key);
      if (value) {
        return value;
      }
    }
  }
  return fallback;
}

function envFirstNumber(keys = [], fallback) {
  let hasExplicitValue = false;
  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
      continue;
    }
    hasExplicitValue = true;
    const raw = Number(process.env[key] || "");
    if (Number.isFinite(raw) && raw > 0) {
      return raw;
    }
  }
  if (!hasExplicitValue) {
    for (const key of keys) {
      const raw = Number(getAppDefaultEnvText(key) || "");
      if (Number.isFinite(raw) && raw > 0) {
        return raw;
      }
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

function getDiscordPublicKey() {
  return DISCORD_PUBLIC_KEY || safeText(activeDiscordClient?.application?.verifyKey);
}

function getDiscordAuthorizeUrl() {
  return buildDiscordInstallUrl(getDiscordClientId());
}

function hasUnresolvedTemplatePlaceholder(line, preservedKeys = ["user", "chur"]) {
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

function readStoredAssistantPrompt(defaults = readRawAppDefaults()) {
  const cards = Array.isArray(defaults?.assistantCards) ? defaults.assistantCards : [];
  return safeText(cards.find((card) => safeText(card?.id) === CHARACTER_CARD_CREATION_ASSISTANT_MODE)?.prompt);
}

function readStoredContextCompressionPrompt(defaults = readRawAppDefaults()) {
  const configs = defaults?.modularPromptConfigs &&
    typeof defaults.modularPromptConfigs === "object" &&
    !Array.isArray(defaults.modularPromptConfigs)
    ? defaults.modularPromptConfigs
    : {};
  const preferredConfig = configs.multi || configs.single || Object.values(configs)[0];
  return safeText(
    defaults?.contextCompressionPrompt ||
    preferredConfig?.contextCompression?.mainRules ||
    preferredConfig?.contextCompressionPrompt
  );
}

let characterCardCreationAssistantPrompt =
  readStoredAssistantPrompt() ||
  "你是角色卡建立助手，請直接輸出正式正文。";

const COMPRESSION_USER_NOTICE_TEXT = "【( •̀ ω •́ )✧模型內容已更新】";
let contextCompressionPrompt =
  readStoredContextCompressionPrompt() ||
  "你是長篇角色互動的上下文壓縮器。請輸出可供後續正文模型承接的精簡上下文。";
const GENERATION_STOPPED_MESSAGE = "已停止正在生成的對話。";
let activeGenerationRequest = null;

const DISCORD_SLASH_COMMANDS = [
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
    description: "直接改寫倒數第幾次使用者輸入並重新生成",
    options: [
      {
        name: "num",
        description: "1 是最近一次、2 是倒數第二次使用者輸入",
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: "comment",
        description: "用來取代該次使用者輸入的新內容",
        type: ApplicationCommandOptionType.String,
        required: true
      }
    ]
  },
  {
    name: "quick_send",
    description: "快速發送常用劇情指令",
    options: [
      {
        name: "template",
        description: "選擇要發送的快捷指令",
        type: ApplicationCommandOptionType.String,
        required: true,
        choices: QUICK_SEND_TEMPLATES.map((template) => ({
          name: template.label,
          value: template.id
        }))
      },
      {
        name: "inside",
        description: "填入括號內，例如 xxxx",
        type: ApplicationCommandOptionType.String,
        required: false
      },
      {
        name: "message",
        description: "另起一行追加內容，例如 zzzzz",
        type: ApplicationCommandOptionType.String,
        required: false
      }
    ]
  }
];
const DISCORD_GLOBAL_SLASH_COMMANDS = DISCORD_SLASH_COMMANDS.map((command) => ({
  ...command,
  integrationTypes: [
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall
  ],
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.BotDM
  ]
}));

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
    autoPeriod: {
      enabled: false,
      roundsPerPeriod: DEFAULT_AUTO_TIME_PERIOD_ROUNDS,
      turnsSinceChange: 0
    },
    config: cloneData(DEFAULT_TIME_TRACKING_CONFIG, DEFAULT_TIME_TRACKING_CONFIG),
    updatedAt: nowIso()
  };
}

function loadAppDefaults() {
  const parsed = readRawAppDefaults();
  if (!parsed || typeof parsed !== "object") {
    return null;
  }
  return {
    userProfile: normalizeUserProfile(parsed.userProfile),
    roleCards: Array.isArray(parsed.roleCards) ? parsed.roleCards.map((card) => normalizeRoleCard(card)) : [],
    assistantCards: normalizeAssistantCards(parsed.assistantCards),
    roleCardRuntimeState: normalizeRoleCardRuntimeStateMap(parsed.roleCardRuntimeState),
    activeRoleCardId: safeText(parsed.activeRoleCardId) || null,
    activeAssistantMode: normalizeAssistantMode(parsed.activeAssistantMode),
    conversationSettings: normalizeConversationSettings(parsed.conversationSettings),
    contextCompression: normalizeContextCompressionState(parsed.contextCompression),
    timeTracking: normalizeTimeTrackingState(parsed.timeTracking),
    modularPromptConfigs: normalizeModularPromptConfigs(parsed.modularPromptConfigs),
    environment: normalizeDefaultEnvironment(parsed.environment || parsed.envDefaults || parsed.env),
    updatedAt: safeText(parsed.updatedAt)
  };
}

function createDefaultState() {
  const appDefaults = loadAppDefaults();
  const defaultRoleCards = appDefaults?.roleCards || [];
  const defaultAssistantCards = normalizeAssistantCards(appDefaults?.assistantCards);
  const validDefaultRoleCardIds = new Set(defaultRoleCards.map((card) => card.id));
  const defaultActiveRoleCardId = defaultRoleCards.some((card) => card.id === appDefaults?.activeRoleCardId)
    ? appDefaults.activeRoleCardId
    : null;
  const defaultActiveAssistantMode = appDefaults?.activeAssistantMode || null;
  const defaultRoleCardRuntimeState = Object.fromEntries(
    Object.entries(appDefaults?.roleCardRuntimeState || {}).filter(([cardId]) => validDefaultRoleCardIds.has(cardId))
  );
  return {
    userProfile: appDefaults?.userProfile || {
      identityText: "",
      displayName: ""
    },
    roleCards: defaultRoleCards,
    assistantCards: defaultAssistantCards,
    roleCardRuntimeState: defaultRoleCardRuntimeState,
    activeRoleCardId: defaultActiveAssistantMode ? null : defaultActiveRoleCardId,
    activeAssistantMode: defaultActiveAssistantMode,
    conversationSettings: appDefaults?.conversationSettings || {
      chatOutputModel: DEFAULT_CHAT_API_MODEL,
      dialogueContextRounds: DEFAULT_DIALOGUE_CONTEXT_ROUNDS
    },
    contextCompression: appDefaults?.contextCompression || createDefaultContextCompressionState(),
    aiSessionStarted: false,
    pendingOpeningBroadcast: false,
    lastDiscordChannelId: "",
    discordPlayers: createDefaultDiscordPlayerState(),
    turnState: createDefaultTurnState(),
    timeTracking: appDefaults?.timeTracking || createDefaultTimeTrackingState(),
    modularPromptConfigs: cloneData(appDefaults?.modularPromptConfigs, normalizeModularPromptConfigs()),
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

function normalizeTimeTrackingAutoPeriodConfig(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const rawRounds = Number(
    source.roundsPerPeriod ??
    source.turnsPerPeriod ??
    source.intervalRounds ??
    source.rounds ??
    source.turns
  );
  const rawTurnsSinceChange = Number(source.turnsSinceChange ?? source.roundsSinceChange ?? source.counter);
  return {
    enabled: source.enabled === true,
    roundsPerPeriod: Number.isFinite(rawRounds) && rawRounds > 0
      ? Math.floor(rawRounds)
      : DEFAULT_AUTO_TIME_PERIOD_ROUNDS,
    turnsSinceChange: Number.isFinite(rawTurnsSinceChange) && rawTurnsSinceChange >= 0
      ? Math.floor(rawTurnsSinceChange)
      : 0
  };
}

function normalizePendingTimeTrackingTransition(input = {}, fallback = {}) {
  const source = input && typeof input === "object" ? input : {};
  const transitionSource = safeText(source.source);
  if (!["auto", "assistant_text"].includes(transitionSource)) {
    return null;
  }
  const fallbackYear = normalizeTimeTrackingYear(fallback.currentYear);
  const currentYear = normalizeTimeTrackingYear(source.currentYear, fallbackYear);
  const currentMonth = Math.floor(Number(source.currentMonth));
  const currentDate = Math.floor(Number(source.currentDate));
  if (!isValidMonthDate(currentMonth, currentDate, currentYear)) {
    return null;
  }
  const currentDayNumber = Math.floor(Number(source.currentDayNumber));
  if (!Number.isFinite(currentDayNumber) || currentDayNumber < 1) {
    return null;
  }
  return {
    source: transitionSource,
    currentDayNumber,
    currentPeriod: normalizeTimePeriod(source.currentPeriod),
    currentYear,
    currentMonth,
    currentDate,
    createdAt: safeText(source.createdAt) || nowIso()
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
  const normalized = {
    enabled: source.enabled !== false,
    currentDayNumber: Number.isFinite(currentDayNumber) && currentDayNumber > 0 ? currentDayNumber : 1,
    currentPeriod: normalizeTimePeriod(source.currentPeriod || source.period || source.timeOfDay),
    currentYear,
    currentMonth: resolvedMonth,
    currentDate: resolvedDate,
    autoPeriod: normalizeTimeTrackingAutoPeriodConfig(source.autoPeriod || source.autoTime || source.autoSwitch),
    config: normalizeTimeTrackingConfig(source.config || source.rules || source),
    updatedAt: safeText(source.updatedAt) || defaults.updatedAt
  };
  return {
    ...normalized,
    pendingTransition: normalizePendingTimeTrackingTransition(
      source.pendingTransition || source.pendingTimeTransition,
      normalized
    )
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
  const previous = normalizeTimeTrackingState(currentState.timeTracking);
  currentState.timeTracking = {
    ...createDefaultTimeTrackingState(),
    enabled: previous.enabled,
    autoPeriod: {
      ...previous.autoPeriod,
      turnsSinceChange: 0
    },
    config: previous.config,
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

function normalizeAiUsageCost(input) {
  const source = input && typeof input === "object" ? input : {};
  const amount = Number(source.amount ?? source.amountCny ?? source.amountUsd ?? source.costCny ?? source.costUsd);
  if (!Number.isFinite(amount)) {
    return null;
  }
  const inputCacheHitCost = Number(source.inputCacheHitCost ?? source.inputCacheHitCostCny ?? source.inputCacheHitCostUsd);
  const inputCacheMissCost = Number(source.inputCacheMissCost ?? source.inputCacheMissCostCny ?? source.inputCacheMissCostUsd);
  const outputCost = Number(source.outputCost ?? source.outputCostCny ?? source.outputCostUsd);
  const inputCacheHitTokens = Number(source.inputCacheHitTokens);
  const inputCacheMissTokens = Number(source.inputCacheMissTokens);
  const outputTokens = Number(source.outputTokens);
  const inputCacheHitPerMillion = Number(source.inputCacheHitPerMillion);
  const inputCacheMissPerMillion = Number(source.inputCacheMissPerMillion);
  const outputPerMillion = Number(source.outputPerMillion);
  const inferredCurrency = source.amountUsd || source.costUsd ? "USD" : source.amountCny || source.costCny ? "CNY" : "CNY";
  const currency = safeText(source.currency || inferredCurrency).toUpperCase();
  return {
    amount,
    currency,
    pricingModel: safeText(source.pricingModel),
    pricingUnit: safeText(source.pricingUnit) || "per_million_tokens",
    inputCacheHitCost: Number.isFinite(inputCacheHitCost) ? inputCacheHitCost : null,
    inputCacheMissCost: Number.isFinite(inputCacheMissCost) ? inputCacheMissCost : null,
    outputCost: Number.isFinite(outputCost) ? outputCost : null,
    inputCacheHitTokens: Number.isFinite(inputCacheHitTokens) ? inputCacheHitTokens : null,
    inputCacheMissTokens: Number.isFinite(inputCacheMissTokens) ? inputCacheMissTokens : null,
    outputTokens: Number.isFinite(outputTokens) ? outputTokens : null,
    inputCacheHitPerMillion: Number.isFinite(inputCacheHitPerMillion) ? inputCacheHitPerMillion : null,
    inputCacheMissPerMillion: Number.isFinite(inputCacheMissPerMillion) ? inputCacheMissPerMillion : null,
    outputPerMillion: Number.isFinite(outputPerMillion) ? outputPerMillion : null,
    promptCacheMissFallback: Boolean(source.promptCacheMissFallback)
  };
}

function normalizeAiUsage(input) {
  const source = input && typeof input === "object" ? input : {};
  const promptTokens = Number(source.promptTokens ?? source.prompt_tokens ?? source.input_tokens);
  const completionTokens = Number(source.completionTokens ?? source.completion_tokens ?? source.output_tokens);
  const inferredTotalTokens = Number.isFinite(promptTokens) && Number.isFinite(completionTokens)
    ? promptTokens + completionTokens
    : null;
  const totalTokens = Number(source.totalTokens ?? source.total_tokens ?? inferredTotalTokens);
  const promptCacheHitTokens = Number(
    source.promptCacheHitTokens ??
    source.prompt_cache_hit_tokens ??
    source.prompt_tokens_details?.cached_tokens ??
    source.cache_read_input_tokens ??
    source.cache_read_tokens
  );
  const promptCacheMissTokens = Number(source.promptCacheMissTokens ?? source.prompt_cache_miss_tokens);
  const cost = normalizeAiUsageCost(source.cost || source);

  return {
    promptTokens: Number.isFinite(promptTokens) ? promptTokens : null,
    completionTokens: Number.isFinite(completionTokens) ? completionTokens : null,
    totalTokens: Number.isFinite(totalTokens) ? totalTokens : null,
    promptCacheHitTokens: Number.isFinite(promptCacheHitTokens) ? promptCacheHitTokens : null,
    promptCacheMissTokens: Number.isFinite(promptCacheMissTokens) ? promptCacheMissTokens : null,
    cost
  };
}

function getAiUsagePricingForModel(model = "", promptTokens = null) {
  const normalizedModel = safeText(model).toLowerCase().replace(/[_\s]+/gu, "-");
  return CHAT_API_COST_PRICING.find((pricing) => {
    if (Number.isFinite(pricing.minPromptTokens) && (!Number.isFinite(promptTokens) || promptTokens < pricing.minPromptTokens)) {
      return false;
    }
    if (Number.isFinite(pricing.maxPromptTokens) && Number.isFinite(promptTokens) && promptTokens > pricing.maxPromptTokens) {
      return false;
    }
    const aliases = Array.isArray(pricing.aliases) ? pricing.aliases : [pricing.label];
    return aliases.some((alias) => {
      const normalizedAlias = safeText(alias).toLowerCase().replace(/[_\s]+/gu, "-");
      return normalizedAlias && normalizedModel.includes(normalizedAlias);
    });
  }) || null;
}

function calculateAiUsageCost(usage = {}, model = "") {
  if (!usage || typeof usage !== "object") {
    return null;
  }
  const promptTokens = Number.isFinite(usage.promptTokens) ? usage.promptTokens : null;
  const pricing = getAiUsagePricingForModel(model, promptTokens);
  if (!pricing) {
    return null;
  }
  const completionTokens = Number.isFinite(usage.completionTokens) ? usage.completionTokens : 0;
  const hasCacheHit = Number.isFinite(usage.promptCacheHitTokens);
  const hasCacheMiss = Number.isFinite(usage.promptCacheMissTokens);
  if (promptTokens === null && completionTokens <= 0 && !hasCacheHit && !hasCacheMiss) {
    return null;
  }

  const inputCacheHitTokens = hasCacheHit ? Math.max(0, usage.promptCacheHitTokens) : 0;
  let inputCacheMissTokens = hasCacheMiss ? Math.max(0, usage.promptCacheMissTokens) : 0;
  let promptCacheMissFallback = false;
  if (!hasCacheMiss && promptTokens !== null) {
    inputCacheMissTokens = Math.max(0, promptTokens - inputCacheHitTokens);
    promptCacheMissFallback = true;
  }

  const inputCacheHitCost = (inputCacheHitTokens / 1_000_000) * pricing.inputCacheHitPerMillion;
  const inputCacheMissCost = (inputCacheMissTokens / 1_000_000) * pricing.inputCacheMissPerMillion;
  const outputCost = (Math.max(0, completionTokens) / 1_000_000) * pricing.outputPerMillion;
  return normalizeAiUsageCost({
    amount: inputCacheHitCost + inputCacheMissCost + outputCost,
    currency: pricing.currency,
    pricingModel: pricing.label,
    pricingUnit: "per_million_tokens",
    inputCacheHitCost,
    inputCacheMissCost,
    outputCost,
    inputCacheHitTokens,
    inputCacheMissTokens,
    outputTokens: Math.max(0, completionTokens),
    inputCacheHitPerMillion: pricing.inputCacheHitPerMillion,
    inputCacheMissPerMillion: pricing.inputCacheMissPerMillion,
    outputPerMillion: pricing.outputPerMillion,
    promptCacheMissFallback
  });
}

function normalizeAssistantMode(value) {
  const normalized = safeText(value);
  if (normalized === CHARACTER_CARD_CREATION_ASSISTANT_MODE) {
    return CHARACTER_CARD_CREATION_ASSISTANT_MODE;
  }
  return /^assistant_[a-zA-Z0-9_-]+$/u.test(normalized) ? normalized : null;
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
    roleCards: Array.isArray(currentState?.roleCards)
      ? currentState.roleCards.map((card) => normalizeRoleCard(card))
      : [],
    assistantCards: normalizeAssistantCards(currentState?.assistantCards),
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
    roleCards: Array.isArray(raw.roleCards) ? raw.roleCards.map((card) => normalizeRoleCard(card)) : [],
    assistantCards: normalizeAssistantCards(raw.assistantCards),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function persistCardState(currentState) {
  ensureDataFile();
  const payload = extractCardState(currentState);
  fs.writeFileSync(CARD_STATE_FILE, JSON.stringify(payload, null, 2), "utf8");
}

function saveDefaultAppSettings(currentState) {
  const normalizedRoleCards = Array.isArray(currentState?.roleCards)
    ? currentState.roleCards.map((card) => normalizeRoleCard(card))
    : [];
  const normalizedRoleCardIds = new Set(normalizedRoleCards.map((card) => card.id));
  const activeRoleCardId = normalizedRoleCards.some((card) => card.id === safeText(currentState?.activeRoleCardId))
    ? safeText(currentState?.activeRoleCardId)
    : null;
  const environment = createDefaultEnvironmentPayload(readEnvFileContent());
  const roleCardRuntimeState = Object.fromEntries(
    Object.entries(normalizeRoleCardRuntimeStateMap(currentState?.roleCardRuntimeState))
      .filter(([cardId]) => normalizedRoleCardIds.has(cardId))
  );
  const activeAssistantMode = normalizeAssistantMode(currentState?.activeAssistantMode);
  const modularPromptConfigs = normalizeModularPromptConfigs(
    currentState?.modularPromptConfigs || getModularPromptConfigsPayload()
  );
  const payload = {
    version: 3,
    userProfile: normalizeUserProfile(currentState?.userProfile),
    roleCards: normalizedRoleCards,
    assistantCards: normalizeAssistantCards(currentState?.assistantCards),
    roleCardRuntimeState,
    activeRoleCardId: activeAssistantMode ? null : activeRoleCardId,
    activeAssistantMode,
    conversationSettings: normalizeConversationSettings(currentState?.conversationSettings),
    contextCompression: normalizeContextCompressionState(currentState?.contextCompression),
    timeTracking: normalizeTimeTrackingState(currentState?.timeTracking),
    modularPromptConfigs,
    environment,
    updatedAt: nowIso()
  };
  writeJsonFile(APP_DEFAULTS_FILE, payload);
  appDefaultEnvironmentValuesCache = environment.values;
  applyDefaultEnvToProcess();

  return {
    defaultsFile: path.relative(path.join(__dirname, ".."), APP_DEFAULTS_FILE),
    userProfile: payload.userProfile,
    roleCardCount: payload.roleCards.length,
    environmentCount: Object.keys(environment.values).length,
    modularPromptCount: Object.keys(modularPromptConfigs).length,
    updatedAt: payload.updatedAt
  };
}

function sanitizeNovelAiDefaultSettings(input = {}) {
  const source = input?.settings && typeof input.settings === "object" ? input.settings : input;
  const settings = cloneData(source && typeof source === "object" && !Array.isArray(source) ? source : {}, {});
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    return {};
  }
  settings.baseImage = typeof settings.baseImage === "string" ? settings.baseImage.trim() : "";
  settings.vibeTransfer = {
    ...(settings.vibeTransfer && typeof settings.vibeTransfer === "object" ? settings.vibeTransfer : {}),
    images: Array.isArray(settings.vibeTransfer?.images) ? settings.vibeTransfer.images : []
  };
  settings.preciseReference = {
    ...(settings.preciseReference && typeof settings.preciseReference === "object" ? settings.preciseReference : {}),
    images: Array.isArray(settings.preciseReference?.images) ? settings.preciseReference.images : []
  };
  settings.fixedPromptSnippets = Array.isArray(settings.fixedPromptSnippets) ? settings.fixedPromptSnippets : [];
  settings.randomPromptSnippets = Array.isArray(settings.randomPromptSnippets) ? settings.randomPromptSnippets : [];
  settings.characters = Array.isArray(settings.characters) ? settings.characters : [];
  return settings;
}

function readNovelAiDefaultsPayload() {
  const parsed = readJsonFile(NOVELAI_DEFAULTS_FILE) || readJsonFile(BUNDLED_NOVELAI_DEFAULTS_FILE);
  if (!parsed) {
    return {
      version: 1,
      settings: null,
      updatedAt: ""
    };
  }
  const settingsSource = parsed?.settings && typeof parsed.settings === "object" ? parsed.settings : parsed;
  return {
    version: Number(parsed?.version || 1),
    settings: sanitizeNovelAiDefaultSettings(settingsSource),
    updatedAt: safeText(parsed?.updatedAt)
  };
}

function saveNovelAiDefaultsPayload(input = {}) {
  const payload = {
    version: 1,
    settings: sanitizeNovelAiDefaultSettings(input),
    updatedAt: nowIso()
  };
  writeJsonFile(NOVELAI_DEFAULTS_FILE, payload);
  return payload;
}

function updateLocalDefaultsFromBundles() {
  const appDefaults = readBundledAppDefaults();
  const novelAiDefaults = readJsonFile(BUNDLED_NOVELAI_DEFAULTS_FILE);
  if (!appDefaults) {
    throw new Error("找不到發布預設 defaults/app-defaults.json。");
  }
  if (!novelAiDefaults) {
    throw new Error("找不到發布預設 defaults/novelai-defaults.json。");
  }

  writeJsonFile(APP_DEFAULTS_FILE, appDefaults);
  writeJsonFile(NOVELAI_DEFAULTS_FILE, novelAiDefaults);

  return {
    appDefaultsFile: path.relative(path.join(__dirname, ".."), APP_DEFAULTS_FILE),
    novelAiDefaultsFile: path.relative(path.join(__dirname, ".."), NOVELAI_DEFAULTS_FILE),
    roleCardCount: Array.isArray(appDefaults.roleCards) ? appDefaults.roleCards.length : 0,
    modularPromptCount: Object.keys(appDefaults.modularPromptConfigs || {}).length,
    updatedAt: nowIso()
  };
}

function applyDefaultAppSettings(currentState) {
  appDefaultEnvironmentValuesCache = null;
  const appDefaults = loadAppDefaults();
  if (!appDefaults) {
    throw new Error("找不到本機預設 data/app-defaults.json。");
  }

  const defaultState = createDefaultState();
  const savedSessions = Array.isArray(currentState?.savedSessions)
    ? currentState.savedSessions.map((session, index) => normalizeSavedSession(session, index))
    : [];
  currentState.userProfile = cloneData(defaultState.userProfile, { identityText: "", displayName: "" });
  currentState.roleCards = cloneData(defaultState.roleCards, []).map((card) => normalizeRoleCard(card));
  currentState.assistantCards = normalizeAssistantCards(defaultState.assistantCards);
  currentState.roleCardRuntimeState = normalizeRoleCardRuntimeStateMap(defaultState.roleCardRuntimeState);
  currentState.activeRoleCardId = defaultState.activeRoleCardId || null;
  currentState.activeAssistantMode = normalizeAssistantMode(defaultState.activeAssistantMode);
  currentState.conversationSettings = normalizeConversationSettings(defaultState.conversationSettings);
  currentState.contextCompression = normalizeContextCompressionState(defaultState.contextCompression);
  currentState.timeTracking = normalizeTimeTrackingState(defaultState.timeTracking);
  currentState.modularPromptConfigs = normalizeModularPromptConfigs(appDefaults.modularPromptConfigs);
  currentState.aiSessionStarted = false;
  currentState.pendingOpeningBroadcast = false;
  currentState.lastDiscordChannelId = "";
  currentState.discordPlayers = createDefaultDiscordPlayerState();
  currentState.turnState = createDefaultTurnState();
  currentState.conversation = [];
  currentState.aiLogs = [];
  currentState.savedSessions = savedSessions;
  currentState.activeSavedSessionId = null;
  delete currentState.conversationMode;

  const environment = normalizeDefaultEnvironment(appDefaults.environment);
  saveEnvFileContent(buildEnvContentFromDefaultEnvironment(environment.values));
  appDefaultEnvironmentValuesCache = environment.values;
  applyDefaultEnvToProcess();

  modularPromptConfigStore = cloneData(currentState.modularPromptConfigs, {});
  characterCardCreationAssistantPrompt =
    readStoredAssistantPrompt(appDefaults) ||
    getCharacterCardCreationAssistantPrompt();
  contextCompressionPrompt =
    readStoredContextCompressionPrompt(appDefaults) ||
    getContextCompressionPrompt();
  const modularPromptConfigs = getModularPromptConfigsPayload();
  saveState(currentState);

  return {
    defaultsFile: path.relative(path.join(__dirname, ".."), APP_DEFAULTS_FILE),
    roleCardCount: currentState.roleCards.length,
    environmentCount: Object.keys(environment.values).length,
    modularPromptCount: Object.keys(modularPromptConfigs).length,
    savedSessionCount: currentState.savedSessions.length,
    updatedAt: currentState.updatedAt
  };
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
          : field === "openingDialogues"
            ? JSON.stringify(normalizeRoleCardOpeningDialogues(persistedCard[field], persistedCard.openingDialogue))
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
      openingDialogues: JSON.stringify(normalizeRoleCardOpeningDialogues(persistedCard.openingDialogues, persistedCard.openingDialogue)),
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
      assistantCards: normalizeAssistantCards(parsed.assistantCards),
      roleCardRuntimeState: normalizeRoleCardRuntimeStateMap(parsed.roleCardRuntimeState),
      activeRoleCardId: safeText(parsed.activeRoleCardId) || null,
      activeAssistantMode: normalizeAssistantMode(parsed.activeAssistantMode),
      conversationSettings: normalizeConversationSettings(parsed.conversationSettings),
      contextCompression: normalizeContextCompressionState(parsed.contextCompression),
      timeTracking: normalizeTimeTrackingState(parsed.timeTracking),
      modularPromptConfigs: normalizeModularPromptConfigs(
        parsed.modularPromptConfigs || defaults.modularPromptConfigs
      ),
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
      merged.roleCards = Array.isArray(persistedCardState.roleCards)
        ? persistedCardState.roleCards.map((card) => normalizeRoleCard(card))
        : merged.roleCards;
      merged.assistantCards = normalizeAssistantCards(persistedCardState.assistantCards || merged.assistantCards);
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
    if (merged.activeAssistantMode && !getAssistantCardById(merged, merged.activeAssistantMode)) {
      merged.activeAssistantMode = null;
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
  state.assistantCards = normalizeAssistantCards(state.assistantCards);
  state.modularPromptConfigs = normalizeModularPromptConfigs(state.modularPromptConfigs);
  if (state.activeAssistantMode && !getAssistantCardById(state, state.activeAssistantMode)) {
    state.activeAssistantMode = null;
  }
  state.activeSavedSessionId = null;
  state.updatedAt = nowIso();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  persistCardState(state);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload), "utf8");
}

function createHttpEtag(content) {
  const hash = crypto.createHash("sha256").update(content).digest("base64url").slice(0, 24);
  return `W/"${hash}"`;
}

function requestMatchesEtag(req, etag) {
  const header = String(req.headers["if-none-match"] || "").trim();
  if (!header) {
    return false;
  }
  return header === "*" || header.split(",").some((value) => value.trim() === etag);
}

function sendCachedJson(req, res, payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const etag = createHttpEtag(body);
  const headers = {
    "Cache-Control": "private, no-cache",
    "Content-Type": "application/json; charset=utf-8",
    ETag: etag,
    Vary: "Accept-Encoding"
  };

  if (requestMatchesEtag(req, etag)) {
    res.writeHead(304, headers);
    res.end();
    return;
  }

  const acceptsGzip = /\bgzip\b/iu.test(String(req.headers["accept-encoding"] || ""));
  const responseBody = acceptsGzip
    ? zlib.gzipSync(body, { level: zlib.constants.Z_BEST_SPEED })
    : body;
  if (acceptsGzip) {
    headers["Content-Encoding"] = "gzip";
  }
  headers["Content-Length"] = String(responseBody.length);
  res.writeHead(200, headers);
  res.end(responseBody);
}

function sendText(res, status, text) {
  res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(text);
}

function getLocalNetworkUrls(port) {
  const urls = [];
  const interfaces = os.networkInterfaces();
  Object.values(interfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (!entry || entry.internal || entry.family !== "IPv4" || !entry.address) {
        return;
      }
      urls.push(`http://${entry.address}:${port}`);
    });
  });
  return [...new Set(urls)];
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
    assistantCards: normalizeAssistantCards(currentState.assistantCards),
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
  currentState.assistantCards = normalizeAssistantCards(source.assistantCards);
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
  const assistantCard = assistantMode
    ? getAssistantCardById(session.snapshot, assistantMode)
    : null;
  return {
    id: session.id,
    name: session.name,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    roleCardId,
    roleCardName: safeText(assistantCard?.name) || safeText(roleCard?.name) || "未指定角色卡",
    assistantMode,
    messageCount: externalData.conversation.length
  };
}

function normalizeConversationForClient(conversation = []) {
  return (Array.isArray(conversation) ? conversation : []).map((message) => {
    if (message?.role !== "assistant") {
      return message;
    }
    const finalized = finalizeAssistantOutputContent(message.content);
    return {
      ...message,
      content: finalized.content || safeText(message.content)
    };
  });
}

function buildSavedSessionDetail(session) {
  const snapshot = materializeSavedSessionSnapshot(session);
  return {
    ...buildSavedSessionSummary(session),
    conversation: normalizeConversationForClient(snapshot.conversation),
    aiLogCount: Array.isArray(snapshot.aiLogs) ? snapshot.aiLogs.length : 0
  };
}

function listSavedSessionSummaries(currentState) {
  return currentState.savedSessions.map((session) => buildSavedSessionSummary(session));
}

function getSavedSessionById(currentState, sessionId) {
  return currentState.savedSessions.find((session) => session.id === sessionId) || null;
}

function createSavedSessionFromCurrentState(currentState, nameInput = "") {
  const now = nowIso();
  const sessionId = newId("session");
  const snapshotSource = captureRuntimeSnapshot(currentState);
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

function loadSavedSessionIntoRuntime(currentState, sessionId) {
  const session = getSavedSessionById(currentState, sessionId);
  if (!session) {
    return null;
  }
  applyRuntimeSnapshot(currentState, materializeSavedSessionSnapshot(session));
  sanitizeImageGenerationCompressionState(currentState);
  currentState.activeSavedSessionId = null;
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
  currentState.activeSavedSessionId = null;
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

function startAssistantCard(currentState, assistantId) {
  const assistant = getAssistantCardById(currentState, assistantId);
  if (!assistant) {
    return null;
  }
  currentState.activeRoleCardId = null;
  currentState.activeAssistantMode = assistant.id;
  currentState.activeSavedSessionId = null;
  currentState.aiSessionStarted = true;
  currentState.pendingOpeningBroadcast = false;
  currentState.lastDiscordChannelId = "";
  resetDiscordPlayerAssignments(currentState, "");
  resetConversationProgress(currentState);
  currentState.roleCardRuntimeState = {};
  resetGeneratedBackendContextPreservingManual(currentState);
  return assistant;
}

function deleteAssistantCard(currentState, assistantId) {
  const normalizedId = normalizeAssistantMode(assistantId);
  if (!normalizedId || normalizedId === CHARACTER_CARD_CREATION_ASSISTANT_MODE) {
    return null;
  }
  currentState.assistantCards = normalizeAssistantCards(currentState.assistantCards);
  const index = currentState.assistantCards.findIndex((card) => card.id === normalizedId);
  if (index < 0) {
    return null;
  }
  const [deleted] = currentState.assistantCards.splice(index, 1);
  if (currentState.activeAssistantMode === normalizedId) {
    currentState.activeAssistantMode = null;
    currentState.aiSessionStarted = false;
    currentState.pendingOpeningBroadcast = false;
    currentState.lastDiscordChannelId = "";
    resetConversationProgress(currentState);
    resetGeneratedBackendContextPreservingManual(currentState);
  }
  return deleted;
}

function normalizePlainText(input, fallback = "") {
  if (typeof input === "string") {
    return input.trim();
  }
  if (input === null || input === undefined) {
    return fallback;
  }
  return String(input).trim();
}

function clampNumber(value, fallback, min, max) {
  const number = Number(value);
  const result = Number.isFinite(number) ? number : fallback;
  return Math.min(max, Math.max(min, result));
}

function clampInteger(value, fallback, min, max) {
  return Math.floor(clampNumber(value, fallback, min, max));
}

function stripDataUrlPrefix(value = "") {
  const text = normalizePlainText(value);
  const match = text.match(/^data:[^;]+;base64,(.+)$/iu);
  return match ? match[1] : text;
}

function parseImageDataUrl(dataUrl = "") {
  const match = normalizePlainText(dataUrl).match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/iu);
  if (!match) {
    return null;
  }
  return {
    mimeType: match[1].toLowerCase(),
    buffer: Buffer.from(match[2].replace(/\s+/g, ""), "base64")
  };
}

function getNovelAiToken() {
  return envFirstText([
    "NOVELAI_API_TOKEN",
    "NOVELAI_ACCESS_TOKEN",
    "NOVELAI_TOKEN",
    "NAI_API_TOKEN"
  ], "");
}

function getNovelAiImageApiBaseUrl() {
  return envFirstText(["NOVELAI_IMAGE_API_BASE_URL"], NOVELAI_IMAGE_API_DEFAULT_BASE_URL).replace(/\/+$/u, "");
}

function getNovelAiPrimaryApiBaseUrl() {
  return envFirstText(["NOVELAI_PRIMARY_API_BASE_URL"], NOVELAI_PRIMARY_API_DEFAULT_BASE_URL).replace(/\/+$/u, "");
}

function getNovelAiAuthHeaders() {
  const token = getNovelAiToken();
  if (!token) {
    throw new Error("尚未在環境設定加入 NOVELAI_API_TOKEN。");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Origin: "https://novelai.net",
    Referer: "https://novelai.net/"
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = NOVELAI_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

async function readNovelAiErrorResponse(response) {
  const text = await response.text().catch(() => "");
  if (!text) {
    return `NovelAI 請求失敗 (${response.status})。`;
  }
  try {
    const data = JSON.parse(text);
    return data?.message || data?.error || data?.detail || text;
  } catch {
    return text;
  }
}

async function fetchNovelAiJson(pathname, options = {}) {
  const response = await fetchWithTimeout(`${getNovelAiPrimaryApiBaseUrl()}${pathname}`, {
    method: options.method || "GET",
    headers: {
      ...getNovelAiAuthHeaders(),
      ...(options.headers || {})
    },
    body: options.body
  });
  if (!response.ok) {
    throw new Error(await readNovelAiErrorResponse(response));
  }
  return response.json();
}

async function getNovelAiStatus() {
  const configured = Boolean(getNovelAiToken());
  if (!configured) {
    return {
      configured: false,
      ok: false,
      error: "尚未設定 NOVELAI_API_TOKEN。"
    };
  }

  try {
    let subscription;
    try {
      subscription = await fetchNovelAiJson("/user/subscription");
    } catch {
      const userData = await fetchNovelAiJson("/user/data");
      subscription = userData?.subscription || userData;
    }
    const trainingStepsLeft = subscription?.trainingStepsLeft || {};
    const fixed = Number(trainingStepsLeft.fixedTrainingStepsLeft || 0);
    const purchased = Number(trainingStepsLeft.purchasedTrainingSteps || 0);
    return {
      configured: true,
      ok: true,
      remainingAnlas: (Number.isFinite(fixed) ? fixed : 0) + (Number.isFinite(purchased) ? purchased : 0),
      fixedAnlas: Number.isFinite(fixed) ? fixed : 0,
      purchasedAnlas: Number.isFinite(purchased) ? purchased : 0,
      tier: Number(subscription?.tier || 0) || 0,
      active: Boolean(subscription?.active),
      expiresAt: subscription?.expiresAt || null,
      perks: subscription?.perks || {}
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      error: error.message || "無法取得 NovelAI 餘額。"
    };
  }
}

function normalizeNovelAiCharacters(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const prompt = normalizePlainText(item?.prompt || item?.char_caption || item?.caption);
      const negativePrompt = normalizePlainText(item?.negativePrompt || item?.negative_prompt || item?.uc);
      const x = Number(item?.x ?? item?.center?.x ?? item?.centers?.[0]?.x);
      const y = Number(item?.y ?? item?.center?.y ?? item?.centers?.[0]?.y);
      return {
        id: normalizePlainText(item?.id) || `character_${index + 1}`,
        name: normalizePlainText(item?.name) || `Character ${index + 1}`,
        prompt,
        negativePrompt,
        enabled: item?.enabled !== false,
        x: Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0.5,
        y: Number.isFinite(y) ? Math.min(1, Math.max(0, y)) : 0.5
      };
    })
    .filter((item) => item.prompt || item.negativePrompt);
}

function normalizeNovelAiReferenceImages(value = [], defaults = {}) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const image = stripDataUrlPrefix(item?.image || item?.dataUrl || item?.baseImage);
      return {
        id: normalizePlainText(item?.id) || `reference_${index + 1}`,
        name: normalizePlainText(item?.name || item?.fileName) || `Reference ${index + 1}`,
        image,
        enabled: item?.enabled !== false,
        strength: clampNumber(
          item?.strength ?? item?.referenceStrength,
          defaults.strength ?? 0.6,
          defaults.strengthMin ?? 0,
          defaults.strengthMax ?? 1
        ),
        informationExtracted: clampNumber(
          item?.informationExtracted ?? item?.information_extracted,
          defaults.informationExtracted ?? 1,
          0,
          1
        ),
        fidelity: clampNumber(
          item?.fidelity,
          defaults.fidelity ?? 1,
          defaults.fidelityMin ?? -1,
          defaults.fidelityMax ?? 1
        )
      };
    })
    .filter((item) => item.image);
}

function isNovelAiV4Model(model = "") {
  return /nai-diffusion-4/u.test(normalizePlainText(model));
}

function novelAiVarietySigmaForModel(model = "") {
  return /nai-diffusion-4-5/u.test(normalizePlainText(model)) ? 58 : 19;
}

function getNovelAiVibeCacheKey(model = "", image = "", informationExtracted = 1) {
  return crypto
    .createHash("sha256")
    .update(`${normalizePlainText(model)}\0${Number(informationExtracted).toFixed(4)}\0${normalizePlainText(image)}`)
    .digest("hex");
}

async function encodeNovelAiVibeImage({ model = "", image = "", informationExtracted = 1 }) {
  const normalizedImage = normalizePlainText(image);
  if (!normalizedImage) {
    return "";
  }
  const normalizedInformationExtracted = clampNumber(informationExtracted, 1, 0, 1);
  const cacheKey = getNovelAiVibeCacheKey(model, normalizedImage, normalizedInformationExtracted);
  const cached = novelAiVibeEncodeCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  const correlationId = makeNovelAiCorrelationId();
  const response = await fetchWithTimeout(`${getNovelAiImageApiBaseUrl()}/ai/encode-vibe`, {
    method: "POST",
    headers: {
      ...getNovelAiAuthHeaders(),
      "x-correlation-id": correlationId
    },
    body: JSON.stringify({
      image: normalizedImage,
      information_extracted: normalizedInformationExtracted,
      model: normalizePlainText(model) || "nai-diffusion-4-5-full"
    })
  });
  if (!response.ok) {
    throw new Error(`Vibe Transfer 編碼失敗 (${correlationId})：${await readNovelAiErrorResponse(response)}`);
  }
  const vibeToken = Buffer.from(await response.arrayBuffer()).toString("base64");
  if (!vibeToken) {
    throw new Error(`Vibe Transfer 編碼失敗 (${correlationId})：NovelAI 沒有回傳可用資料。`);
  }
  novelAiVibeEncodeCache.set(cacheKey, vibeToken);
  return vibeToken;
}

async function encodeNovelAiV4Vibes(apiPayload = {}) {
  const model = normalizePlainText(apiPayload.model);
  const parameters = apiPayload.parameters && typeof apiPayload.parameters === "object"
    ? apiPayload.parameters
    : {};
  const referenceImages = Array.isArray(parameters.reference_image_multiple)
    ? parameters.reference_image_multiple
    : [];
  if (!isNovelAiV4Model(model) || referenceImages.length === 0) {
    return apiPayload;
  }
  const informationExtracted = Array.isArray(parameters.reference_information_extracted_multiple)
    ? parameters.reference_information_extracted_multiple
    : [];
  parameters.reference_image_multiple = await Promise.all(referenceImages.map((image, index) =>
    encodeNovelAiVibeImage({
      model,
      image,
      informationExtracted: informationExtracted[index] ?? 1
    })
  ));
  delete parameters.reference_information_extracted_multiple;
  delete parameters.uncond_per_vibe;
  delete parameters.wonky_vibe_correlation;
  parameters.normalize_reference_strength_multiple = parameters.normalize_reference_strength_multiple !== false;
  apiPayload.parameters = parameters;
  return apiPayload;
}

function normalizeNovelAiBoolean(value, fallback = false) {
  if (value === true || value === false) {
    return value;
  }
  if (value === "true" || value === "1" || value === 1) {
    return true;
  }
  if (value === "false" || value === "0" || value === 0) {
    return false;
  }
  return fallback;
}

function normalizeNovelAiVarietyPlus(source = {}) {
  const explicit = source.varietyPlus ?? source.variety_plus ?? source.variety;
  const skipCfg = source.skipCfgAboveSigma ?? source.skip_cfg_above_sigma;
  if (explicit !== undefined) {
    return normalizeNovelAiBoolean(explicit, true);
  }
  if (skipCfg !== undefined) {
    return skipCfg !== null && skipCfg !== "" && Number(skipCfg) > 0;
  }
  return true;
}

function normalizeNovelAiRandomPromptMetadata(value = {}) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const cloned = cloneData(value, {});
  if (!cloned || typeof cloned !== "object" || Array.isArray(cloned)) {
    return null;
  }
  return cloned;
}

function normalizeNovelAiFixedPromptSnippets(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => ({
      id: normalizePlainText(item?.id) || `fixed_${index + 1}`,
      name: normalizePlainText(item?.name || item?.title || item?.key) || `固定片段 ${index + 1}`,
      prompt: normalizePlainText(item?.prompt || item?.text || item?.content)
    }))
    .filter((item) => item.name || item.prompt);
}

function buildNovelAiV4Condition(baseCaption = "", characters = [], options = {}) {
  const charCaptions = characters
    .filter((character) => character?.enabled !== false)
    .map((character) => {
      const caption = normalizePlainText(options.negative ? character.negativePrompt : character.prompt);
      if (!caption) {
        return null;
      }
      return {
        char_caption: caption,
        centers: [
          {
            x: Number.isFinite(character.x) ? character.x : 0.5,
            y: Number.isFinite(character.y) ? character.y : 0.5
          }
        ]
      };
    })
    .filter(Boolean);
  return {
    caption: {
      base_caption: baseCaption,
      char_captions: charCaptions
    },
    use_coords: options.negative !== true && options.useCoords === true && charCaptions.length > 0,
    use_order: options.negative !== true && charCaptions.length > 0,
    legacy_uc: false
  };
}

function normalizeNovelAiGenerationRequest(input = {}) {
  const source = input?.settings && typeof input.settings === "object" ? input.settings : input || {};
  const model = normalizePlainText(source.model) || "nai-diffusion-4-5-full";
  const prompt = normalizePlainText(source.prompt || source.input);
  const promptTemplate = normalizePlainText(source.promptTemplate || source.prompt_template);
  const fixedPrompt = source.fixedPrompt || source.fixed_prompt || null;
  const fixedPromptSnippets = normalizeNovelAiFixedPromptSnippets(source.fixedPromptSnippets || source.fixed_prompt_snippets);
  const randomPrompt = normalizeNovelAiRandomPromptMetadata(source.randomPrompt || source.random_prompt);
  const negativePrompt = normalizePlainText(source.negativePrompt || source.negative_prompt);
  const width = clampInteger(source.width, 1024, 64, 2048);
  const height = clampInteger(source.height, 1024, 64, 2048);
  const steps = clampInteger(source.steps, 28, 1, 50);
  const samples = clampInteger(source.samples ?? source.n_samples, 1, 1, 6);
  const scale = clampNumber(source.scale, 5, 0, 20);
  const varietyPlus = normalizeNovelAiVarietyPlus(source);
  const cfgRescale = clampNumber(source.cfgRescale ?? source.cfg_rescale, 0, 0, 1);
  const ucPreset = clampInteger(source.ucPreset, 0, 0, 99);
  const sampler = normalizePlainText(source.sampler) || "k_euler_ancestral";
  const noiseSchedule = normalizePlainText(source.noiseSchedule || source.noise_schedule) || "karras";
  const imageFormat = normalizePlainText(source.imageFormat || source.image_format) === "webp" ? "webp" : "png";
  const rawSeed = Number(source.seed);
  const seed = Number.isFinite(rawSeed) && rawSeed >= 0
    ? Math.floor(rawSeed) >>> 0
    : Math.floor(Math.random() * 0xffffffff) >>> 0;
  const baseImage = stripDataUrlPrefix(source.baseImage || source.image);
  const strength = clampNumber(source.strength, 0.7, 0, 1);
  const noise = clampNumber(source.noise, 0, 0, 1);
  const characters = normalizeNovelAiCharacters(source.characters || source.characterPrompts);
  const characterPositionMode = source.characterPositionMode === "manual" || source.character_position_mode === "manual" || source.useCoords === true || source.use_coords === true
    ? "manual"
    : "auto";
  const vibeSource = source.vibeTransfer || source.vibe_transfer || {};
  const preciseSource = source.preciseReference || source.precise_reference || {};
  const vibeTransfer = {
    enabled: vibeSource.enabled !== false,
    strength: clampNumber(vibeSource.strength ?? source.referenceStrength, 0.6, -1, 1),
    informationExtracted: clampNumber(
      vibeSource.informationExtracted ?? vibeSource.information_extracted ?? source.referenceInformationExtracted,
      1,
      0,
      1
    ),
    images: normalizeNovelAiReferenceImages(vibeSource.images || source.vibeImages, {
      strength: vibeSource.strength ?? source.referenceStrength ?? 0.6,
      informationExtracted: vibeSource.informationExtracted ?? vibeSource.information_extracted ?? source.referenceInformationExtracted ?? 1,
      strengthMin: -1,
      strengthMax: 1
    })
  };
  const preciseReference = {
    enabled: preciseSource.enabled !== false,
    strength: clampNumber(preciseSource.strength, 1, -1, 1),
    fidelity: clampNumber(preciseSource.fidelity, 1, -1, 1),
    images: normalizeNovelAiReferenceImages(preciseSource.images || source.preciseImages || source.character_references, {
      strength: preciseSource.strength ?? 1,
      fidelity: preciseSource.fidelity ?? 1,
      strengthMin: -1,
      strengthMax: 1,
      fidelityMin: -1,
      fidelityMax: 1
    })
  };
  const activeVibeImages = vibeTransfer.enabled ? vibeTransfer.images.filter((item) => item.enabled) : [];
  const activePreciseImages = preciseReference.enabled ? preciseReference.images.filter((item) => item.enabled) : [];
  if (activeVibeImages.length > 0 && activePreciseImages.length > 0) {
    throw new Error("Vibe Transfer 與 Precise Reference 目前不能同時使用。");
  }

  const parameters = {
    width,
    height,
    scale,
    sampler,
    steps,
    n_samples: samples,
    seed,
    ucPreset,
    qualityToggle: source.qualityToggle !== false,
    dynamic_thresholding: Boolean(source.dynamicThresholding || source.dynamic_thresholding),
    sm: Boolean(source.sm),
    sm_dyn: Boolean(source.smDyn || source.sm_dyn),
    cfg_rescale: cfgRescale,
    skip_cfg_above_sigma: varietyPlus ? novelAiVarietySigmaForModel(model) : null,
    noise_schedule: noiseSchedule,
    params_version: clampInteger(source.paramsVersion || source.params_version, isNovelAiV4Model(model) ? 3 : 1, 1, 10),
    image_format: imageFormat,
    prompt,
    negative_prompt: negativePrompt
  };

  if (baseImage) {
    parameters.image = baseImage;
    parameters.strength = strength;
    parameters.noise = noise;
  }

  if (activeVibeImages.length > 0) {
    parameters.reference_image_multiple = activeVibeImages.map((item) => item.image);
    parameters.reference_strength_multiple = activeVibeImages.map((item) => item.strength);
    parameters.reference_information_extracted_multiple = activeVibeImages.map((item) => item.informationExtracted);
    parameters.uncond_per_vibe = true;
    parameters.wonky_vibe_correlation = true;
  }

  if (activePreciseImages.length > 0) {
    parameters.character_references = activePreciseImages.map((item) => ({
      image: item.image,
      strength: item.strength,
      fidelity: item.fidelity
    }));
    parameters.character_reference_image_multiple = activePreciseImages.map((item) => item.image);
    parameters.character_reference_strength_multiple = activePreciseImages.map((item) => item.strength);
    parameters.character_reference_fidelity_multiple = activePreciseImages.map((item) => item.fidelity);
  }

  if (isNovelAiV4Model(model)) {
    parameters.v4_prompt = buildNovelAiV4Condition(prompt, characters, { useCoords: characterPositionMode === "manual" });
    parameters.v4_negative_prompt = buildNovelAiV4Condition(negativePrompt, characters, { negative: true });
  }

  const action = normalizePlainText(source.action) || (baseImage ? "img2img" : "generate");
  const apiPayload = {
    action,
    input: prompt,
    model,
    parameters
  };
  const settings = {
    model,
    prompt,
    promptTemplate,
    fixedPrompt,
    fixedPromptSnippets,
    randomPrompt,
    negativePrompt,
    width,
    height,
    steps,
    samples,
    scale,
    varietyPlus,
    cfgRescale,
    ucPreset,
    sampler,
    noiseSchedule,
    imageFormat,
    seed,
    qualityToggle: parameters.qualityToggle,
    dynamicThresholding: parameters.dynamic_thresholding,
    sm: parameters.sm,
    smDyn: parameters.sm_dyn,
    strength: baseImage ? strength : "",
    noise: baseImage ? noise : "",
    hasBaseImage: Boolean(baseImage),
    characterPositionMode,
    characters,
    vibeTransfer: {
      enabled: vibeTransfer.enabled,
      strength: vibeTransfer.strength,
      informationExtracted: vibeTransfer.informationExtracted,
      imageCount: activeVibeImages.length,
      imageSettings: activeVibeImages.map((item) => ({
        id: item.id,
        name: item.name,
        strength: item.strength,
        informationExtracted: item.informationExtracted
      }))
    },
    preciseReference: {
      enabled: preciseReference.enabled,
      strength: preciseReference.strength,
      fidelity: preciseReference.fidelity,
      imageCount: activePreciseImages.length,
      imageSettings: activePreciseImages.map((item) => ({
        id: item.id,
        name: item.name,
        strength: item.strength,
        fidelity: item.fidelity
      }))
    }
  };
  return { settings, apiPayload };
}

function makeNovelAiCorrelationId() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let value = "";
  for (let i = 0; i < 6; i += 1) {
    value += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return value;
}

function getMimeTypeFromFileName(fileName = "") {
  const lower = normalizePlainText(fileName).toLowerCase();
  if (lower.endsWith(".webp")) {
    return "image/webp";
  }
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  return "image/png";
}

function getImageExtensionFromMime(mimeType = "") {
  if (mimeType === "image/webp") {
    return "webp";
  }
  if (mimeType === "image/jpeg") {
    return "jpg";
  }
  return "png";
}

function findZipEndOfCentralDirectory(buffer) {
  for (let offset = buffer.length - 22; offset >= Math.max(0, buffer.length - 66000); offset -= 1) {
    if (buffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  return -1;
}

function extractZipEntries(buffer) {
  const eocdOffset = findZipEndOfCentralDirectory(buffer);
  if (eocdOffset < 0) {
    throw new Error("NovelAI 回傳內容不是有效 ZIP。");
  }
  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let offset = centralDirectoryOffset;
  for (let index = 0; index < totalEntries && offset + 46 <= buffer.length; index += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) {
      break;
    }
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const fileName = buffer.slice(offset + 46, offset + 46 + fileNameLength).toString("utf8");
    if (buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) {
      offset += 46 + fileNameLength + extraLength + commentLength;
      continue;
    }
    const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
    const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
    const compressed = buffer.slice(dataStart, dataStart + compressedSize);
    const data = method === 0
      ? compressed
      : method === 8
        ? zlib.inflateRawSync(compressed, { finishFlush: zlib.constants.Z_SYNC_FLUSH })
        : null;
    if (data) {
      entries.push({
        fileName,
        data: uncompressedSize && data.length !== uncompressedSize ? data.slice(0, uncompressedSize) : data
      });
    }
    offset += 46 + fileNameLength + extraLength + commentLength;
  }
  return entries;
}

let pngCrcTable = null;

function getPngCrcTable() {
  if (pngCrcTable) {
    return pngCrcTable;
  }
  pngCrcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    pngCrcTable[n] = c >>> 0;
  }
  return pngCrcTable;
}

function pngCrc32(buffer) {
  const table = getPngCrcTable();
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const body = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const chunk = Buffer.alloc(12 + body.length);
  chunk.writeUInt32BE(body.length, 0);
  typeBuffer.copy(chunk, 4);
  body.copy(chunk, 8);
  chunk.writeUInt32BE(pngCrc32(Buffer.concat([typeBuffer, body])), 8 + body.length);
  return chunk;
}

function createPngInternationalTextChunk(key, value) {
  const keyword = Buffer.from(normalizePlainText(key).replace(/\0/gu, "").slice(0, 79), "utf8");
  const text = Buffer.from(normalizePlainText(value), "utf8");
  const body = Buffer.concat([
    keyword,
    Buffer.from([0, 0, 0, 0, 0]),
    text
  ]);
  return createPngChunk("iTXt", body);
}

function findPngIendOffset(buffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < signature.length || !buffer.slice(0, signature.length).equals(signature)) {
    return -1;
  }
  let offset = 8;
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.slice(offset + 4, offset + 8).toString("ascii");
    if (type === "IEND") {
      return offset;
    }
    offset += 12 + length;
  }
  return -1;
}

function injectPngMetadata(buffer, metadata = {}) {
  const iendOffset = findPngIendOffset(buffer);
  if (iendOffset < 0) {
    return buffer;
  }
  const entries = Object.entries(metadata)
    .map(([key, value]) => [key, typeof value === "string" ? value : JSON.stringify(value)])
    .filter(([key, value]) => key && value);
  if (entries.length === 0) {
    return buffer;
  }
  const chunks = entries.map(([key, value]) => createPngInternationalTextChunk(key, value));
  return Buffer.concat([
    buffer.slice(0, iendOffset),
    ...chunks,
    buffer.slice(iendOffset)
  ]);
}

function sanitizeNovelAiRequestForMetadata(apiPayload = {}) {
  const cloned = cloneData(apiPayload, {});
  const parameters = cloned.parameters && typeof cloned.parameters === "object" ? cloned.parameters : {};
  if (parameters.image) {
    parameters.image = "[image omitted]";
  }
  [
    "reference_image_multiple",
    "character_reference_image_multiple"
  ].forEach((key) => {
    if (Array.isArray(parameters[key])) {
      parameters[key] = `[${parameters[key].length} image(s) omitted]`;
    }
  });
  if (Array.isArray(parameters.character_references)) {
    parameters.character_references = parameters.character_references.map((item) => ({
      ...item,
      image: "[image omitted]"
    }));
  }
  cloned.parameters = parameters;
  return cloned;
}

function buildNovelAiImageMetadata(settings = {}, apiPayload = {}) {
  const safeRequest = sanitizeNovelAiRequestForMetadata(apiPayload);
  const fullMetadata = {
    source: "time_tavern_novelai",
    version: 1,
    createdAt: nowIso(),
    settings,
    request: safeRequest
  };
  return {
    Title: "NovelAI Image Generation",
    Description: settings.prompt || "",
    Software: settings.model || "NovelAI",
    Source: String(settings.seed ?? ""),
    Comment: JSON.stringify({
      prompt: settings.prompt || "",
      prompt_template: settings.promptTemplate || "",
      negative_prompt: settings.negativePrompt || "",
      seed: settings.seed,
      width: settings.width,
      height: settings.height,
      steps: settings.steps,
      sampler: settings.sampler,
      scale: settings.scale,
      cfg_rescale: settings.cfgRescale,
      skip_cfg_above_sigma: settings.varietyPlus ? novelAiVarietySigmaForModel(settings.model) : null,
      ucPreset: settings.ucPreset,
      noise_schedule: settings.noiseSchedule,
      model: settings.model,
      character_position_mode: settings.characterPositionMode || "auto",
      character_prompts: settings.characters || [],
      vibe_transfer: settings.vibeTransfer || {},
      precise_reference: settings.preciseReference || {},
      fixed_prompt: settings.fixedPrompt || null,
      fixed_prompt_snippets: settings.fixedPromptSnippets || [],
      random_prompt: settings.randomPrompt || null
    }),
    NovelAIMetadata: fullMetadata
  };
}

const novelAiStoryboardRunLocks = new Map();

function isSafeStoryboardId(value = "") {
  return /^[A-Za-z0-9_-]+$/u.test(safeText(value));
}

function ensureNovelAiStoryboardsDir() {
  ensureDataFile();
  fs.mkdirSync(NOVELAI_STORYBOARDS_DIR, { recursive: true });
}

function getNovelAiStoryboardDir(storyboardId = "") {
  if (!isSafeStoryboardId(storyboardId)) {
    throw new Error("Storyboard ID 不正確。");
  }
  return path.join(NOVELAI_STORYBOARDS_DIR, storyboardId);
}

function getNovelAiStoryboardFile(storyboardId = "") {
  return path.join(getNovelAiStoryboardDir(storyboardId), "storyboard.json");
}

function getNovelAiStoryboardRunsDir(storyboardId = "") {
  return path.join(getNovelAiStoryboardDir(storyboardId), "runs");
}

function getNovelAiStoryboardRunDir(storyboardId = "", runId = "") {
  if (!isSafeStoryboardId(runId)) {
    throw new Error("Storyboard run ID 不正確。");
  }
  return path.join(getNovelAiStoryboardRunsDir(storyboardId), runId);
}

function getNovelAiStoryboardRunFile(storyboardId = "", runId = "") {
  return path.join(getNovelAiStoryboardRunDir(storyboardId, runId), "run.json");
}

function getNovelAiStoryboardRunImagesDir(storyboardId = "", runId = "") {
  return path.join(getNovelAiStoryboardRunDir(storyboardId, runId), "images");
}

function readNovelAiStoryboard(storyboardId = "") {
  const filePath = getNovelAiStoryboardFile(storyboardId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return normalizeStoryboard(JSON.parse(fs.readFileSync(filePath, "utf8")));
  } catch {
    return null;
  }
}

function writeNovelAiStoryboard(input = {}, options = {}) {
  ensureNovelAiStoryboardsDir();
  const incoming = input?.storyboard && typeof input.storyboard === "object" ? input.storyboard : input;
  let storyboard;
  if (options.create === true && !Array.isArray(incoming?.nodes)) {
    storyboard = createStoryboard({
      name: incoming?.name,
      description: incoming?.description,
      includeMetadata: incoming?.includeMetadata,
      globalSettings: incoming?.globalSettings
    });
  } else {
    storyboard = normalizeStoryboard(incoming, { newId: options.create === true });
  }
  if (options.storyboardId) {
    const existing = readNovelAiStoryboard(options.storyboardId);
    if (!existing) {
      throw new Error("Storyboard 不存在。");
    }
    storyboard.id = existing.id;
    storyboard.createdAt = existing.createdAt;
    storyboard.updatedAt = nowIso();
  }
  const validation = validateStoryboard(storyboard);
  if (validation.errors.length) {
    throw new Error(validation.errors[0]);
  }
  storyboard = validation.storyboard;
  const directory = getNovelAiStoryboardDir(storyboard.id);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(getNovelAiStoryboardFile(storyboard.id), `${JSON.stringify(storyboard, null, 2)}\n`, "utf8");
  return storyboard;
}

function listNovelAiStoryboards() {
  ensureNovelAiStoryboardsDir();
  return fs.readdirSync(NOVELAI_STORYBOARDS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isSafeStoryboardId(entry.name))
    .map((entry) => readNovelAiStoryboard(entry.name))
    .filter(Boolean)
    .map(storyboardSummary)
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

function deleteNovelAiStoryboard(storyboardId = "") {
  const storyboard = readNovelAiStoryboard(storyboardId);
  if (!storyboard) {
    return false;
  }
  fs.rmSync(getNovelAiStoryboardDir(storyboardId), { recursive: true, force: true });
  return true;
}

function normalizeStoryboardImageItem(item = {}, storyboardId = "", runId = "") {
  const imageId = safeText(item.id);
  return {
    id: imageId,
    taskKey: safeText(item.taskKey),
    sceneId: safeText(item.sceneId),
    sceneName: safeText(item.sceneName),
    sceneImageIndex: Number(item.sceneImageIndex || 0) || 0,
    roundIndex: Math.max(1, Number(item.roundIndex || 1) || 1),
    roundCount: Math.max(1, Number(item.roundCount || 1) || 1),
    outputIndex: Number(item.outputIndex || 0) || 0,
    fileName: safeText(item.fileName) || "storyboard.png",
    mimeType: safeText(item.mimeType) || "image/png",
    size: Number(item.size || 0) || 0,
    metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {},
    createdAt: safeText(item.createdAt) || nowIso(),
    imageUrl: imageId
      ? `/api/novelai/storyboards/${encodeURIComponent(storyboardId)}/runs/${encodeURIComponent(runId)}/images/${encodeURIComponent(imageId)}`
      : ""
  };
}

function normalizeStoryboardRun(input = {}, storyboardId = "") {
  const runId = safeText(input.id) || newId("nai_story_run");
  const images = (Array.isArray(input.images) ? input.images : [])
    .map((item) => normalizeStoryboardImageItem(item, storyboardId, runId));
  const validStatuses = new Set(["queued", "generating", "paused", "failed", "completed"]);
  const plan = Array.isArray(input.plan) ? cloneData(input.plan, []) : [];
  return {
    id: runId,
    storyboardId,
    storyboardName: safeText(input.storyboardName) || "Storyboard",
    status: validStatuses.has(input.status) ? input.status : "queued",
    snapshot: input.snapshot && typeof input.snapshot === "object" ? normalizeStoryboard(input.snapshot) : null,
    plan,
    nextIndex: Math.min(plan.length, Math.max(0, Number(input.nextIndex || 0) || 0)),
    images,
    pauseRequested: Boolean(input.pauseRequested),
    error: safeText(input.error),
    revisions: Array.isArray(input.revisions) ? cloneData(input.revisions, []) : [],
    createdAt: safeText(input.createdAt) || nowIso(),
    updatedAt: safeText(input.updatedAt) || nowIso()
  };
}

function readNovelAiStoryboardRun(storyboardId = "", runId = "") {
  const filePath = getNovelAiStoryboardRunFile(storyboardId, runId);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const run = normalizeStoryboardRun(JSON.parse(fs.readFileSync(filePath, "utf8")), storyboardId);
    const lockKey = `${storyboardId}:${runId}`;
    if (run.status === "generating" && !novelAiStoryboardRunLocks.has(lockKey)) {
      run.status = "failed";
      run.error = run.error || "上次生成在完成前中斷，可以套用最新版設定後續跑。";
      return writeNovelAiStoryboardRun(storyboardId, run);
    }
    return run;
  } catch {
    return null;
  }
}

function writeNovelAiStoryboardRun(storyboardId = "", run = {}) {
  const normalized = normalizeStoryboardRun({ ...run, updatedAt: nowIso() }, storyboardId);
  const runDirectory = getNovelAiStoryboardRunDir(storyboardId, normalized.id);
  fs.mkdirSync(getNovelAiStoryboardRunImagesDir(storyboardId, normalized.id), { recursive: true });
  const persisted = {
    ...normalized,
    images: normalized.images.map(({ imageUrl, ...item }) => item)
  };
  fs.writeFileSync(getNovelAiStoryboardRunFile(storyboardId, normalized.id), `${JSON.stringify(persisted, null, 2)}\n`, "utf8");
  return normalized;
}

function storyboardRunSummary(run = {}) {
  return {
    id: run.id,
    storyboardId: run.storyboardId,
    storyboardName: run.storyboardName,
    status: run.status,
    completedCount: run.images.length,
    totalCount: run.images.length + Math.max(0, run.plan.length - run.nextIndex),
    error: run.error,
    revisions: run.revisions,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt
  };
}

function listNovelAiStoryboardRuns(storyboardId = "") {
  const directory = getNovelAiStoryboardRunsDir(storyboardId);
  if (!fs.existsSync(directory)) {
    return [];
  }
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && isSafeStoryboardId(entry.name))
    .map((entry) => readNovelAiStoryboardRun(storyboardId, entry.name))
    .filter(Boolean)
    .sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
}

function getStoryboardCompletedCounts(run = {}) {
  return run.images.filter((image) => !image.taskKey).reduce((counts, image) => {
    counts[image.sceneId] = (counts[image.sceneId] || 0) + 1;
    return counts;
  }, {});
}

function getStoryboardCompletedTaskKeys(run = {}) {
  return run.images.map((image) => safeText(image.taskKey)).filter(Boolean);
}

function createNovelAiStoryboardRun(storyboardId = "") {
  const storyboard = readNovelAiStoryboard(storyboardId);
  if (!storyboard) {
    throw new Error("Storyboard 不存在。");
  }
  const active = listNovelAiStoryboardRuns(storyboardId)
    .find((run) => run.status !== "completed");
  if (active) {
    throw new Error("這個 Storyboard 已有未完成執行，請先續跑或刪除該紀錄。");
  }
  const execution = buildStoryboardExecutionPlan(storyboard);
  const run = {
    id: newId("nai_story_run"),
    storyboardId,
    storyboardName: storyboard.name,
    status: "queued",
    snapshot: execution.storyboard,
    plan: execution.plan,
    nextIndex: 0,
    images: [],
    pauseRequested: false,
    error: "",
    revisions: [],
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  return writeNovelAiStoryboardRun(storyboardId, run);
}

function deleteNovelAiStoryboardRun(storyboardId = "", runId = "") {
  const run = readNovelAiStoryboardRun(storyboardId, runId);
  if (!run || run.status === "generating") {
    return false;
  }
  fs.rmSync(getNovelAiStoryboardRunDir(storyboardId, runId), { recursive: true, force: true });
  return true;
}

function pauseNovelAiStoryboardRun(storyboardId = "", runId = "") {
  const run = readNovelAiStoryboardRun(storyboardId, runId);
  if (!run) {
    throw new Error("Storyboard 執行紀錄不存在。");
  }
  run.pauseRequested = true;
  if (run.status !== "generating" && run.status !== "completed") {
    run.status = "paused";
  }
  return writeNovelAiStoryboardRun(storyboardId, run);
}

function resumeNovelAiStoryboardRun(storyboardId = "", runId = "") {
  const run = readNovelAiStoryboardRun(storyboardId, runId);
  const latest = readNovelAiStoryboard(storyboardId);
  if (!run || !latest) {
    throw new Error("Storyboard 或執行紀錄不存在。");
  }
  if (run.status === "generating" || run.status === "completed") {
    throw new Error(run.status === "completed" ? "這次執行已完成。" : "這次執行仍在生成中。");
  }
  const execution = buildStoryboardExecutionPlan(latest, {
    completedCounts: getStoryboardCompletedCounts(run),
    completedTaskKeys: getStoryboardCompletedTaskKeys(run),
    existingOutputCount: run.images.length
  });
  run.snapshot = execution.storyboard;
  run.storyboardName = latest.name;
  run.plan = execution.plan;
  run.nextIndex = 0;
  run.pauseRequested = false;
  run.error = "";
  run.status = execution.plan.length ? "queued" : "completed";
  run.revisions.push({
    at: nowIso(),
    fromOutputIndex: run.images.length + 1,
    message: "未完成部分已套用最新版 Storyboard 設定。"
  });
  return writeNovelAiStoryboardRun(storyboardId, run);
}

async function withNovelAiStoryboardRunLock(storyboardId = "", runId = "", operation) {
  const key = `${storyboardId}:${runId}`;
  if (novelAiStoryboardRunLocks.has(key)) {
    throw new Error("這次 Storyboard 執行已有生成請求進行中。");
  }
  const task = Promise.resolve().then(operation);
  novelAiStoryboardRunLocks.set(key, task);
  try {
    return await task;
  } finally {
    novelAiStoryboardRunLocks.delete(key);
  }
}

async function generateNextNovelAiStoryboardImage(storyboardId = "", runId = "") {
  return withNovelAiStoryboardRunLock(storyboardId, runId, async () => {
    let run = readNovelAiStoryboardRun(storyboardId, runId);
    if (!run || !run.snapshot) {
      throw new Error("Storyboard 執行紀錄不存在。");
    }
    if (run.status === "completed") {
      return run;
    }
    if (run.status === "failed") {
      throw new Error("這次執行已失敗，請先套用最新版設定後續跑。");
    }
    if (run.status === "paused") {
      throw new Error("這次執行已暫停，請先按續跑。");
    }
    const task = run.plan[run.nextIndex];
    if (!task) {
      run.status = "completed";
      return writeNovelAiStoryboardRun(storyboardId, run);
    }
    run.status = "generating";
    run.error = "";
    run = writeNovelAiStoryboardRun(storyboardId, run);
    try {
      const settings = composeStoryboardSceneSettings(run.snapshot, task.sceneId);
      const result = await generateNovelAiImages({ settings });
      const generated = result.images[0];
      const parsed = parseImageDataUrl(generated?.dataUrl || "");
      if (!parsed || parsed.mimeType !== "image/png") {
        throw new Error("Storyboard 只接受 NovelAI PNG 輸出。");
      }
      const imageId = newId("nai_story_img");
      const imagePath = path.join(getNovelAiStoryboardRunImagesDir(storyboardId, runId), `${imageId}.png`);
      fs.writeFileSync(imagePath, parsed.buffer);
      const item = normalizeStoryboardImageItem({
        id: imageId,
        taskKey: task.taskKey,
        sceneId: task.sceneId,
        sceneName: task.sceneName,
        sceneImageIndex: task.sceneImageIndex,
        roundIndex: task.roundIndex,
        roundCount: task.roundCount,
        outputIndex: task.outputIndex,
        fileName: task.fileName,
        mimeType: "image/png",
        size: parsed.buffer.length,
        metadata: {
          source: "time_tavern_nai_storyboard",
          storyboardId,
          runId,
          taskKey: task.taskKey,
          sceneId: task.sceneId,
          sceneName: task.sceneName,
          roundIndex: task.roundIndex,
          roundCount: task.roundCount,
          settings: result.settings,
          request: result.request,
          generation: generated.metadata || {}
        },
        createdAt: nowIso()
      }, storyboardId, runId);
      run.images.push(item);
      run.nextIndex += 1;
      run.error = "";
      const latestRunState = readNovelAiStoryboardRun(storyboardId, runId);
      run.pauseRequested = Boolean(latestRunState?.pauseRequested || run.pauseRequested);
      run.status = run.nextIndex >= run.plan.length
        ? "completed"
        : run.pauseRequested ? "paused" : "queued";
      run.pauseRequested = false;
      return writeNovelAiStoryboardRun(storyboardId, run);
    } catch (error) {
      run.status = "failed";
      run.pauseRequested = false;
      run.error = safeText(error?.message) || "Storyboard 生成失敗。";
      writeNovelAiStoryboardRun(storyboardId, run);
      throw error;
    }
  });
}

function getNovelAiStoryboardImage(storyboardId = "", runId = "", imageId = "") {
  if (!isSafeStoryboardId(imageId)) {
    return null;
  }
  const run = readNovelAiStoryboardRun(storyboardId, runId);
  const image = run?.images.find((item) => item.id === imageId);
  if (!image) {
    return null;
  }
  const filePath = path.join(getNovelAiStoryboardRunImagesDir(storyboardId, runId), `${imageId}.png`);
  return fs.existsSync(filePath) ? { image, filePath } : null;
}

function ensureNovelAiAlbumDir() {
  ensureDataFile();
  fs.mkdirSync(NOVELAI_ALBUM_DIR, { recursive: true });
  if (!fs.existsSync(NOVELAI_ALBUM_INDEX_FILE)) {
    fs.writeFileSync(NOVELAI_ALBUM_INDEX_FILE, "[]\n", "utf8");
  }
}

function readNovelAiAlbumIndex() {
  ensureNovelAiAlbumDir();
  try {
    const parsed = JSON.parse(fs.readFileSync(NOVELAI_ALBUM_INDEX_FILE, "utf8"));
    return (Array.isArray(parsed) ? parsed : [])
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        id: safeText(item.id),
        fileName: safeText(item.fileName) || "novelai-image.png",
        mimeType: safeText(item.mimeType) || "image/png",
        size: Number(item.size || 0) || 0,
        metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {},
        createdAt: safeText(item.createdAt) || nowIso()
      }))
      .filter((item) => item.id);
  } catch {
    return [];
  }
}

function writeNovelAiAlbumIndex(items = []) {
  ensureNovelAiAlbumDir();
  fs.writeFileSync(NOVELAI_ALBUM_INDEX_FILE, `${JSON.stringify(items, null, 2)}\n`, "utf8");
}

function getNovelAiAlbumItemFilePath(item) {
  const extension = getImageExtensionFromMime(item?.mimeType || "image/png");
  return path.join(NOVELAI_ALBUM_DIR, `${safeText(item?.id)}.${extension}`);
}

function toNovelAiAlbumSummary(item) {
  return {
    ...item,
    imageUrl: `/api/novelai/album/${encodeURIComponent(item.id)}/image`
  };
}

function isSafeNovelAiAlbumId(value = "") {
  return /^[A-Za-z0-9_-]+$/u.test(safeText(value));
}

async function generateNovelAiImages(body = {}) {
  const { settings, apiPayload } = normalizeNovelAiGenerationRequest(body);
  if (!settings.prompt) {
    throw new Error("Prompt 不可空白。");
  }
  await encodeNovelAiV4Vibes(apiPayload);
  const correlationId = makeNovelAiCorrelationId();
  const response = await fetchWithTimeout(`${getNovelAiImageApiBaseUrl()}/ai/generate-image`, {
    method: "POST",
    headers: {
      ...getNovelAiAuthHeaders(),
      "x-correlation-id": correlationId
    },
    body: JSON.stringify(apiPayload)
  });
  if (!response.ok) {
    throw new Error(await readNovelAiErrorResponse(response));
  }
  const zipBuffer = Buffer.from(await response.arrayBuffer());
  const metadata = buildNovelAiImageMetadata(settings, apiPayload);
  const images = extractZipEntries(zipBuffer)
    .filter((entry) => /\.(png|webp|jpe?g)$/iu.test(entry.fileName))
    .map((entry, index) => {
      const mimeType = getMimeTypeFromFileName(entry.fileName);
      return {
        id: newId("nai_img"),
        fileName: entry.fileName || `novelai-${index + 1}.${getImageExtensionFromMime(mimeType)}`,
        mimeType,
        dataUrl: `data:${mimeType};base64,${entry.data.toString("base64")}`,
        metadata: metadata.NovelAIMetadata
      };
    });
  if (images.length === 0) {
    throw new Error("NovelAI 沒有回傳可讀取的圖片。");
  }
  return {
    images,
    settings,
    request: apiPayload,
    correlationId
  };
}

function saveNovelAiAlbumItem(body = {}) {
  const parsed = parseImageDataUrl(body.imageDataUrl || body.image || "");
  if (!parsed) {
    throw new Error("收藏圖片格式不正確。");
  }
  const id = newId("nai_fav");
  const extension = getImageExtensionFromMime(parsed.mimeType);
  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const fileName = normalizePlainText(body.fileName) || `novelai-${id}.${extension}`;
  const finalBuffer = parsed.buffer;
  const item = {
    id,
    fileName,
    mimeType: parsed.mimeType,
    size: finalBuffer.length,
    metadata,
    createdAt: nowIso()
  };
  ensureNovelAiAlbumDir();
  fs.writeFileSync(getNovelAiAlbumItemFilePath(item), finalBuffer);
  const items = [item, ...readNovelAiAlbumIndex().filter((existing) => existing.id !== id)];
  writeNovelAiAlbumIndex(items);
  return toNovelAiAlbumSummary(item);
}

function deleteNovelAiAlbumItem(id = "") {
  if (!isSafeNovelAiAlbumId(id)) {
    return false;
  }
  const items = readNovelAiAlbumIndex();
  const item = items.find((entry) => entry.id === id);
  if (!item) {
    return false;
  }
  const nextItems = items.filter((entry) => entry.id !== id);
  try {
    const filePath = getNovelAiAlbumItemFilePath(item);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // A missing image file should not keep a stale album item alive.
  }
  writeNovelAiAlbumIndex(nextItems);
  return true;
}

function readRawBody(req, maxBytes = 32 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalLength = 0;
    req.on("data", (chunk) => {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(bufferChunk);
      totalLength += bufferChunk.length;
      if (totalLength > maxBytes) {
        reject(new Error("請求內容過大"));
      }
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    req.on("error", reject);
  });
}

async function readBody(req) {
  const rawBody = await readRawBody(req);
  if (rawBody.length === 0) {
    return {};
  }
  try {
    return JSON.parse(rawBody.toString("utf8"));
  } catch {
    throw new Error("JSON 格式錯誤");
  }
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
  if (filePath.endsWith(".mp3")) {
    return "audio/mpeg";
  }
  if (filePath.endsWith(".cur")) {
    return "image/x-icon";
  }
  return "application/octet-stream";
}

function getStaticHeaders(filePath, stat) {
  const headers = { "Content-Type": getContentType(filePath) };
  if (/\.(?:woff2|png|gif|mp3|cur)$/i.test(filePath)) {
    headers["Cache-Control"] = "public, max-age=31536000, immutable";
  } else {
    headers["Cache-Control"] = "no-cache";
  }
  headers.ETag = `W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
  headers["Last-Modified"] = stat.mtime.toUTCString();
  return headers;
}

function isStaticFileNotModified(req, headers, stat) {
  if (req.headers["if-none-match"]) {
    return requestMatchesEtag(req, headers.ETag);
  }
  const modifiedSince = Date.parse(String(req.headers["if-modified-since"] || ""));
  return Number.isFinite(modifiedSince) && Math.trunc(stat.mtimeMs / 1000) * 1000 <= modifiedSince;
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

function getFirstMarkdownHeading(text = "") {
  const match = safeText(text).match(/^\s{0,3}#{1,6}\s+(.+)$/mu);
  return match ? match[1].replace(/#+\s*$/u, "").trim() : "";
}

function getRoleCardInputSource(input) {
  const raw = input && typeof input === "object" ? input : {};
  if (
    raw.data &&
    typeof raw.data === "object" &&
    (safeText(raw.spec).toLowerCase().includes("chara_card") || raw.data.first_mes || raw.data.character_book)
  ) {
    const embeddedTimeTavernCard = raw.data.extensions?.time_tavern_role_card ||
      raw.data.extensions?.timeTavernRoleCard;
    if (embeddedTimeTavernCard && typeof embeddedTimeTavernCard === "object") {
      return {
        ...raw.data,
        ...embeddedTimeTavernCard,
        coverImage: safeText(embeddedTimeTavernCard.coverImage || raw.data.avatar)
      };
    }
    return raw.data;
  }
  return raw;
}

function getRoleCardLorebookInput(raw = {}) {
  return raw.lorebooks ||
    raw.lorebook ||
    raw.characterBook?.entries ||
    raw.character_book?.entries ||
    [];
}

function normalizeRoleCardOpeningDialogueEntry(input, index = 0) {
  const source = typeof input === "string"
    ? { content: input }
    : input && typeof input === "object"
      ? input
      : {};
  return {
    id: safeText(source.id) || newId("opening"),
    name: safeText(source.name || source.title || source.label) || `開場 ${index + 1}`,
    content: safeText(
      source.content ??
      source.text ??
      source.value ??
      source.openingDialogue ??
      source.first_mes ??
      ""
    ),
    createdAt: safeText(source.createdAt) || nowIso(),
    updatedAt: safeText(source.updatedAt) || nowIso()
  };
}

function normalizeRoleCardOpeningDialogues(input = [], fallbackOpening = "") {
  const entries = (Array.isArray(input) ? input : [])
    .map((item, index) => normalizeRoleCardOpeningDialogueEntry(item, index))
    .filter((item) => item.content);
  const fallback = safeText(fallbackOpening);
  if (fallback && !entries.some((item) => item.content === fallback)) {
    entries.unshift(normalizeRoleCardOpeningDialogueEntry({
      id: "opening_primary",
      name: "開場 1",
      content: fallback
    }, 0));
  }
  return entries.map((entry, index) => ({
    ...entry,
    name: entry.name || `開場 ${index + 1}`
  }));
}

function resolveActiveOpeningDialogue(openingDialogues = [], activeOpeningDialogueId = "", fallbackOpening = "") {
  const entries = Array.isArray(openingDialogues) ? openingDialogues : [];
  const activeId = safeText(activeOpeningDialogueId);
  return entries.find((entry) => safeText(entry.id) === activeId)?.content ||
    entries[0]?.content ||
    safeText(fallbackOpening);
}

function normalizeRoleCardLorebookEntry(input) {
  const source = input && typeof input === "object" ? input : {};
  const content = safeText(source.content || source.text || source.內容);
  const keywords = splitLorebookKeywords(source.keywords ?? source.keyword ?? source.keys ?? source.關鍵字 ?? source["关键词"]);
  const secondaryKeywords = splitLorebookKeywords(
    source.secondaryKeywords ?? source.secondaryKeyword ?? source.secondary_keys ?? source.secondaryKeys ?? source["第二關鍵字"] ?? source["第二关键词"]
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
  const key = safeText(
    source.key ||
    source.title ||
    source.name ||
    source.comment ||
    source.標題 ||
    source.名稱 ||
    getFirstMarkdownHeading(content) ||
    keywords[0]
  );
  return {
    id: safeText(source.id) || newId("lore"),
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
      return item.key && item.content && (item.permanent || item.keywords.length > 0);
    });
}

function normalizeRoleCardCustomSection(input) {
  const raw = input && typeof input === "object" ? input : {};
  return {
    id: safeText(raw.id) || newId("section"),
    name: safeText(raw.name || raw.title || raw.key || raw.label),
    content: safeText(raw.content || raw.text || raw.value),
    enabled: raw.enabled !== false,
    includeInImagePrompt: raw.includeInImagePrompt === true ||
      raw.imagePrompt === true ||
      raw.drawPrompt === true ||
      raw.includeInDrawing === true ||
      raw.useForImagePrompt === true,
    createdAt: safeText(raw.createdAt) || nowIso(),
    updatedAt: safeText(raw.updatedAt) || nowIso()
  };
}

function buildLegacyRoleCardCustomSections(raw = {}) {
  return [
    { name: "性格", content: safeText(raw.personality) },
    { name: "場景", content: safeText(raw.scene || raw.scenario) },
    { name: "系統指令", content: safeText(raw.systemInstruction || raw.system_prompt) },
    { name: "詳細描述", content: safeText(raw.description) },
    { name: "人物關係（純文字）", content: normalizeRoleCardRelationships(raw.relationships) },
    { name: "後續指示", content: safeText(raw.post_history_instructions) },
    { name: "範例對話", content: safeText(raw.mes_example) },
    { name: "創作者備註", content: safeText(raw.creator_notes) }
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
    .find((section) => section.enabled !== false && normalizedNames.has(section.name))?.content || "";
}

function normalizeRoleCard(input) {
  const raw = getRoleCardInputSource(input);
  const customSections = normalizeRoleCardCustomSections(raw.customSections, raw);
  const fallbackOpeningDialogue = safeText(raw.openingDialogue || raw.first_mes);
  const openingDialogues = normalizeRoleCardOpeningDialogues(
    raw.openingDialogues || raw.opening_dialogues || raw.alternateGreetings || raw.alternate_greetings,
    fallbackOpeningDialogue
  );
  const activeOpeningDialogueId = safeText(raw.activeOpeningDialogueId || raw.active_opening_dialogue_id) ||
    openingDialogues[0]?.id ||
    "";
  return {
    id: safeText(raw.id) || newId("card"),
    name: safeText(raw.name),
    mode: normalizeRoleCardMode(raw.mode),
    coverImage: safeText(raw.coverImage || raw.avatar),
    coverPosition: normalizeCoverPosition(raw.coverPosition),
    customSections,
    personality: getRoleCardCustomSectionValue({ customSections }, "性格"),
    scene: getRoleCardCustomSectionValue({ customSections }, "場景"),
    systemInstruction: getRoleCardCustomSectionValue({ customSections }, "系統指令"),
    description: getRoleCardCustomSectionValue({ customSections }, "詳細描述"),
    relationships: getRoleCardCustomSectionValue({ customSections }, "人物關係（純文字）"),
    openingDialogue: resolveActiveOpeningDialogue(openingDialogues, activeOpeningDialogueId, fallbackOpeningDialogue),
    openingDialogues,
    activeOpeningDialogueId,
    lorebooks: normalizeRoleCardLorebooks(getRoleCardLorebookInput(raw)),
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
  return normalized || DEFAULT_ROLE_CARD_MODE;
}

function normalizeCompressionProfileId(value = "") {
  const normalized = safeText(value)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .replace(/^_+|_+$/g, "");
  return normalized || STANDARD_COMPRESSION_PROFILE_ID;
}

function parseIntegerList(value) {
  const normalizeListItem = (item) => item === null || item === undefined ? "" : String(item).trim();
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeListItem(item))
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

function normalizeCompressionContextScope(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/[\s-]+/g, "_");
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
  const legacyKeywords = source.keywords ?? source.keyword ?? source.triggerKeywords;
  const legacyTurns = source.turns ?? source.scheduledTurns ?? source.rounds;
  return {
    everyTurn: Boolean(source.everyTurn ?? source.eachTurn ?? source.everyRound ?? source.onEveryTurn),
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

function normalizeKeywordFollowupAction(value = "", legacySkipReasoner = false) {
  const raw = safeText(value);
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

function normalizeModelImageGenerationSettings(input = {}) {
  const source = input && typeof input === "object"
    ? input.imageGeneration || input.novelAiImage || input.imageSettings || input
    : {};
  const width = clampInteger(source.width, 832, 64, 2048);
  const height = clampInteger(source.height, 1216, 64, 2048);
  const rawSeed = safeText(source.seed);
  const seedNumber = Number(rawSeed);
  return {
    model: normalizePlainText(source.model) || "nai-diffusion-4-5-curated",
    negativePrompt: normalizePlainText(source.negativePrompt || source.negative_prompt || source.uc),
    width,
    height,
    steps: clampInteger(source.steps, 28, 1, 50),
    samples: clampInteger(source.samples ?? source.n_samples, 1, 1, 4),
    scale: clampNumber(source.scale ?? source.guidance ?? source.promptGuidance, 6, 0, 20),
    cfgRescale: clampNumber(source.cfgRescale ?? source.cfg_rescale ?? source.promptGuidanceRescale, 0, 0, 1),
    sampler: normalizePlainText(source.sampler) || "k_euler_ancestral",
    noiseSchedule: normalizePlainText(source.noiseSchedule || source.noise_schedule) || "karras",
    ucPreset: clampInteger(source.ucPreset, 0, 0, 99),
    varietyPlus: normalizeNovelAiBoolean(source.varietyPlus ?? source.skipCfgAboveSigma, false),
    imageFormat: normalizePlainText(source.imageFormat || source.image_format) === "webp" ? "webp" : "png",
    seed: rawSeed && Number.isFinite(seedNumber) && seedNumber >= 0 ? Math.floor(seedNumber) >>> 0 : ""
  };
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
  let triggers = normalizeCompressionTriggerConfig(
    source.triggers || source.trigger || source.conditions || source.condition || source,
    { defaultRoundLimit: Boolean(options.defaultRoundLimit) }
  );
  const action = normalizeModelTriggerAction(source.action || source.processingAction || source.afterTriggerAction);
  const legacySkipReasoner = Boolean(source.skipReasoner || source.skipResponse || source.noReasoner || source.skipChat);
  const keywordFollowupAction = normalizeKeywordFollowupAction(
    source.keywordFollowupAction ||
      source.keywordFollowup ||
      source.afterKeywordAction ||
      source.keywordAfterAction ||
      source["觸發關鍵字後續動作"],
    legacySkipReasoner
  );
  if (isImageOnlyKeywordFollowupAction(keywordFollowupAction)) {
    triggers = {
      ...triggers,
      keywordSource: "user"
    };
  }
  return {
    id: safeText(source.id || source.key) || `trigger_action_${index + 1}`,
    name: safeText(source.name || source.title || source.label) || `觸發組合 ${index + 1}`,
    enabled: source.enabled !== false,
    action,
    keywordFollowupAction,
    skipReasoner: action === MODEL_TRIGGER_ACTION_CALL_API &&
      (
        keywordFollowupAction === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL ||
        keywordFollowupAction === KEYWORD_FOLLOWUP_IMAGE_ONLY
      ),
    imageGeneration: normalizeModelImageGenerationSettings(source),
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
    keywordFollowupAction: KEYWORD_FOLLOWUP_CONTINUE_REASONER,
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

function hasExplicitEmptyCompressionModels(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  return (
    (Array.isArray(source.models) && source.models.length === 0) ||
    (Array.isArray(source.modules) && source.modules.length === 0)
  );
}

function createStandardCompressionProfile(contextCompression) {
  const normalizedContextCompression = normalizeContextCompressionPromptConfig(
    contextCompression,
    getContextCompressionPrompt(),
    { allowEmptyModels: hasExplicitEmptyCompressionModels(contextCompression) }
  );
  return {
    id: STANDARD_COMPRESSION_PROFILE_ID,
    name: getDefaultCompressionProfileName(STANDARD_COMPRESSION_PROFILE_ID),
    enabled: true,
    locked: true,
    contextScope: COMPRESSION_CONTEXT_SCOPE_TEXT_ONLY,
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
    {
      allowEmptyModels: !isStandard ||
        hasExplicitEmptyCompressionModels(source.contextCompression || source.compression || fallbackContextCompression),
      allowEmptyMainRules: !isStandard
    }
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
    contextScope: normalizeCompressionContextScope(
      source.contextScope || source.contextSource || source.readingScope || source.scope
    ),
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
      defaults.contextCompression.mainRules,
    { allowEmptyModels: hasExplicitEmptyCompressionModels(source.contextCompression) }
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

function normalizeModularPromptConfigs(input = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const configs = {
    single: normalizeModularPromptConfig(source.single, "single"),
    multi: normalizeModularPromptConfig(source.multi, "multi"),
    no_role: normalizeModularPromptConfig(source.no_role, "no_role")
  };
  Object.entries(source).forEach(([rawMode, config]) => {
    const mode = normalizeRoleCardMode(config?.mode || rawMode);
    configs[mode] = normalizeModularPromptConfig(config, mode);
  });
  return configs;
}

let modularPromptConfigStore = null;

function getModularPromptConfigStore() {
  if (!modularPromptConfigStore) {
    modularPromptConfigStore = normalizeModularPromptConfigs(
      state?.modularPromptConfigs || loadAppDefaults()?.modularPromptConfigs
    );
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

function persistModularPromptConfigs(configs = getModularPromptConfigStore()) {
  const normalizedConfigs = normalizeModularPromptConfigs(configs);
  state.modularPromptConfigs = cloneData(normalizedConfigs, {});
  updateLocalAppDefaults((defaults) => ({
    ...defaults,
    version: Math.max(3, Number(defaults.version || 0)),
    modularPromptConfigs: normalizedConfigs
  }));
  saveState(state);
  return normalizedConfigs;
}

function saveModularPromptConfig(mode = "single", config = {}) {
  const normalizedMode = normalizeRoleCardMode(mode);
  const normalized = normalizeModularPromptConfig(config, normalizedMode);
  modularPromptConfigStore = {
    ...getModularPromptConfigStore(),
    [normalizedMode]: normalized
  };
  persistModularPromptConfigs(modularPromptConfigStore);
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

  const store = getModularPromptConfigStore();
  delete store[normalizedMode];
  modularPromptConfigStore = persistModularPromptConfigs(store);
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

function resolveRoleCardDisplayName(roleCard, fallbackName = "") {
  return safeText(roleCard?.name) || safeText(fallbackName);
}

function createTemplateVariables(currentState = state, runtimeUserName = "", roleCard = null) {
  const activeRoleCard = roleCard || getActiveRoleCard(currentState);
  return {
    user: resolveUserDisplayName(currentState?.userProfile, runtimeUserName),
    chur: resolveRoleCardDisplayName(activeRoleCard)
  };
}

function createAssistantTemplateVariables(runtimeUserName = "") {
  return {
    user: safeText(runtimeUserName) || "{{user}}",
    chur: ""
  };
}

function injectTemplatePlaceholders(text, variables = {}) {
  const source = typeof text === "string" ? text : "";
  return renderPromptTemplate(source, variables);
}

function injectUserPlaceholder(text, userDisplayName, roleCardName = "") {
  return injectTemplatePlaceholders(text, {
    user: userDisplayName,
    chur: roleCardName
  });
}

function getWebChatDisplayConfig(currentState = state) {
  const activeRoleCard = getActiveRoleCard(currentState);
  const templateVariables = createTemplateVariables(currentState, "", activeRoleCard);
  const userNameTemplate = envFirstText(["WEB_USER_NAME_TEMPLATE", "CHAT_USER_NAME_TEMPLATE"], "{{user}}");
  const aiNameTemplate = envFirstText(["WEB_AI_NAME_TEMPLATE", "CHAT_AI_NAME_TEMPLATE"], "{{chur}}");
  const userName = injectTemplatePlaceholders(userNameTemplate, templateVariables) ||
    templateVariables.user ||
    "User";
  const aiName = injectTemplatePlaceholders(aiNameTemplate, templateVariables) ||
    templateVariables.chur ||
    "AI";
  const userAvatar = envFirstText(["WEB_USER_AVATAR_IMAGE", "WEB_USER_AVATAR_URL", "CHAT_USER_AVATAR_URL"], "");
  const aiAvatar = envFirstText(["WEB_AI_AVATAR_IMAGE", "WEB_AI_AVATAR_URL", "CHAT_AI_AVATAR_URL"], "") ||
    safeText(activeRoleCard?.coverImage);
  const backgroundImage = envFirstText(["WEB_BACKGROUND_IMAGE", "WEB_BACKGROUND_URL"], "");
  const dailyWelcomeAudio = envFirstText(["WEB_DAILY_WELCOME_AUDIO"], "/assets/audio/welcome-back.mp3");
  return {
    userName,
    aiName,
    userAvatar,
    aiAvatar,
    backgroundImage,
    dailyWelcomeAudio
  };
}

function renderRoleCardWithUser(card, userDisplayName) {
  if (!card) {
    return null;
  }
  const roleCardName = resolveRoleCardDisplayName(card);
  return {
    ...card,
    customSections: normalizeRoleCardCustomSections(card.customSections, card).map((section) => ({
      ...section,
      name: injectUserPlaceholder(section.name, userDisplayName, roleCardName),
      content: injectUserPlaceholder(section.content, userDisplayName, roleCardName)
    })),
    personality: injectUserPlaceholder(card.personality, userDisplayName, roleCardName),
    scene: injectUserPlaceholder(card.scene, userDisplayName, roleCardName),
    systemInstruction: injectUserPlaceholder(card.systemInstruction, userDisplayName, roleCardName),
    description: injectUserPlaceholder(card.description, userDisplayName, roleCardName),
    relationships: injectUserPlaceholder(card.relationships, userDisplayName, roleCardName),
    openingDialogue: injectUserPlaceholder(card.openingDialogue, userDisplayName, roleCardName),
    openingDialogues: normalizeRoleCardOpeningDialogues(card.openingDialogues, card.openingDialogue).map((entry) => ({
      ...entry,
      name: injectUserPlaceholder(entry.name, userDisplayName, roleCardName),
      content: injectUserPlaceholder(entry.content, userDisplayName, roleCardName)
    })),
    lorebooks: normalizeRoleCardLorebooks(card.lorebooks).map((entry) => ({
      ...entry,
      key: injectUserPlaceholder(entry.key, userDisplayName, roleCardName),
      keywords: splitLorebookKeywords(entry.keywords.map((keyword) => injectUserPlaceholder(keyword, userDisplayName, roleCardName))),
      secondaryKeywords: splitLorebookKeywords(
        (Array.isArray(entry.secondaryKeywords) ? entry.secondaryKeywords : [])
          .map((keyword) => injectUserPlaceholder(keyword, userDisplayName, roleCardName))
      ),
      content: injectUserPlaceholder(entry.content, userDisplayName, roleCardName)
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

function hashStringToPercent(value = "") {
  const text = safeText(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0) % 100;
}

function getLorebookProbabilitySeed(currentState = state, entry = {}) {
  const latestUser = getLatestUserMessage(currentState);
  return [
    getLorebookEntryIdentity(entry),
    getMessageTurnNumber(latestUser),
    latestUser?.id,
    safeText(latestUser?.content).slice(0, 120)
  ].filter(Boolean).join("|");
}

function passesLorebookProbability(entry = {}, currentState = state) {
  const probability = normalizeLorebookProbability(entry.probability, 100);
  if (probability >= 100) {
    return true;
  }
  if (probability <= 0) {
    return false;
  }
  return hashStringToPercent(getLorebookProbabilitySeed(currentState, entry)) < probability;
}

function doesLorebookKeywordGroupMatch(sourceText = "", keywords = []) {
  const text = safeText(sourceText).toLowerCase();
  return (Array.isArray(keywords) ? keywords : [])
    .map((keyword) => safeText(keyword).toLowerCase())
    .filter(Boolean)
    .some((keyword) => text.includes(keyword));
}

function doesLorebookEntryMatchSource(entry = {}, sourceText = "") {
  if (!doesLorebookKeywordGroupMatch(sourceText, entry.keywords)) {
    return false;
  }
  const secondaryKeywords = splitLorebookKeywords(entry.secondaryKeywords);
  if (secondaryKeywords.length === 0) {
    return true;
  }
  return doesLorebookKeywordGroupMatch(sourceText, secondaryKeywords);
}

function isPermanentLorebookEntry(entry = {}) {
  return Boolean(entry.permanent || entry.constant || entry.alwaysActive || entry.always_active);
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
    if (isPermanentLorebookEntry(entry)) {
      return false;
    }
    if (alreadyAttachedEntryIds.has(getLorebookEntryIdentity(entry))) {
      return false;
    }
    if (!doesLorebookEntryMatchSource(entry, sourceText)) {
      return false;
    }
    return passesLorebookProbability(entry, state);
  });
}

function getPermanentRoleCardLorebookEntries(state, activeRoleCard, runtimeUserName = "", purpose = "reasoner") {
  if (purpose !== "reasoner") {
    return [];
  }
  const activeCard = activeRoleCard || getActiveRoleCard(state);
  if (!activeCard?.id) {
    return [];
  }
  const resolvedUserName = resolveUserDisplayName(state?.userProfile, runtimeUserName);
  const roleCard = renderRoleCardWithUser(activeCard, resolvedUserName);
  return normalizeRoleCardLorebooks(roleCard?.lorebooks)
    .filter((entry) =>
      entry.enabled !== false &&
      isPermanentLorebookEntry(entry) &&
      safeText(entry.content) &&
      passesLorebookProbability(entry, state)
    );
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
  const permanentLorebookEntries = Array.isArray(options.permanentLorebookEntries)
    ? options.permanentLorebookEntries
    : [];
  if (!roleCard) {
    return "";
  }

  const lines = [
    roleCard.name ? `名字:${roleCard.name}` : "",
    ...normalizeRoleCardCustomSections(roleCard.customSections, roleCard)
      .filter((section) => section.enabled !== false && (section.name || section.content))
      .map((section) => `${section.name || "自定義內容"}:${section.content}`),
    ...permanentLorebookEntries
      .filter((entry) => safeText(entry.key) || safeText(entry.content))
      .map((entry) => `世界書-${entry.key || "永久啟用"}:${entry.content}`)
  ].filter(Boolean);

  if (includeOpeningDialogue && roleCard.openingDialogue) {
    lines.push(`開場對話:${roleCard.openingDialogue}`);
  }

  return lines.join("\n");
}

function formatRoleCardsForPrompt(roleCards, userDisplayName = "", options = {}) {
  const cards = Array.isArray(roleCards) ? roleCards.filter(Boolean) : [roleCards].filter(Boolean);
  if (cards.length === 0) {
    return "未設定";
  }
  const resolvedUserName = safeText(userDisplayName);
  return cards
    .map((card, index) => {
      const renderedCard = resolvedUserName ? renderRoleCardWithUser(card, resolvedUserName) : card;
      const cardContent = formatRoleCardForPrompt(renderedCard, {
        includeOpeningDialogue: false,
        permanentLorebookEntries: options.permanentLorebookEntries || []
      });
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

function isTimeTrackingRangeBlockedByNoChange(text = "", range = null, config = DEFAULT_TIME_TRACKING_CONFIG) {
  if (!range) {
    return false;
  }
  return getTimeTrackingNoChangeOccurrences(text, config)
    .some((blockedRange) =>
      getTimeTrackingRangeGap(blockedRange, range) <= TIME_TRACKING_CONNECTOR_PROXIMITY_CHARS
    );
}

function isNearTimeTrackingConnector(text = "", range = null, config = DEFAULT_TIME_TRACKING_CONFIG) {
  if (!range) {
    return false;
  }
  return getTimeTrackingConnectorOccurrences(text, config)
    .some((connectorRange) =>
      connectorRange.end <= range.start &&
      getTimeTrackingRangeGap(connectorRange, range) <= TIME_TRACKING_CONNECTOR_PROXIMITY_CHARS &&
      !isTimeTrackingConnectorBlocked(text, connectorRange, config)
    );
}

function shouldApplyTimeTrackingRange(text = "", range = null, config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
  if (!range || isTimeTrackingRangeBlockedByNoChange(text, range, config)) {
    return false;
  }
  if (options.allowBareTimeExpressions) {
    return true;
  }
  return isNearTimeTrackingConnector(text, range, config);
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

function findExplicitYear(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/(\d{3,4}|[零一二三四五六七八九〇○Ｏ]{3,4})\s*年/gu)];
  const candidates = matches
    .map((match) => {
      const year = parseChineseDigitYear(match[1]);
      const range = {
        start: match.index,
        end: match.index + match[0].length
      };
      return year && shouldApplyTimeTrackingRange(normalizedText, range, config, options)
        ? { year, index: match.index }
        : null;
    })
    .filter(Boolean);
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.year || null;
}

function findExplicitDayNumber(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
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
        shouldApplyTimeTrackingRange(normalizedText, range, config, options)
        ? { dayNumber, index: match.index }
        : null;
    })
    .filter(Boolean);
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.dayNumber || null;
}

function findDayAfterIncrement(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/([0-9]+|[一二三四五六七八九十百兩两]+)\s*天\s*[後后]/gu)];
  const values = matches
    .filter((match) => shouldApplyTimeTrackingRange(normalizedText, {
      start: match.index,
      end: match.index + match[0].length
    }, config, options))
    .map((match) => parseChineseSmallNumber(match[1]))
    .filter((value) => Number.isFinite(value) && value > 0);
  return values.length > 0 ? Math.max(...values) : 0;
}

function findNextDayIncrement(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
  const normalizedText = normalizeTimeMatchText(text);
  return (Array.isArray(config.nextDayWords) ? config.nextDayWords : [])
    .flatMap((word) => findTimeTrackingWordOccurrences(normalizedText, word))
    .some((range) => shouldApplyTimeTrackingRange(normalizedText, range, config, options));
}

function findExplicitMonthDate(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, fallbackYear = getCurrentCalendarYear(), options = {}) {
  const normalizedText = normalizeTimeMatchText(text);
  const matches = [...normalizedText.matchAll(/(?:(\d{3,4}|[零一二三四五六七八九〇○Ｏ]{3,4})\s*年\s*)?(\d{1,2})\s*月\s*(\d{1,2})\s*(?:日|號|号)/gu)];
  const candidates = [];
  for (const match of matches) {
    const range = {
      start: match.index,
      end: match.index + match[0].length
    };
    if (!shouldApplyTimeTrackingRange(normalizedText, range, config, options)) {
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

function getNextTimePeriod(period = TIME_PERIOD_MORNING) {
  const normalized = normalizeTimePeriod(period);
  if (normalized === TIME_PERIOD_MORNING) {
    return TIME_PERIOD_NOON;
  }
  if (normalized === TIME_PERIOD_NOON) {
    return TIME_PERIOD_EVENING;
  }
  return TIME_PERIOD_MORNING;
}

function getTimePeriodTransitionLabel(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const currentLabel = TIME_PERIOD_LABELS[normalized.currentPeriod] || TIME_PERIOD_LABELS[TIME_PERIOD_MORNING];
  const nextLabel = TIME_PERIOD_LABELS[getNextTimePeriod(normalized.currentPeriod)] || TIME_PERIOD_LABELS[TIME_PERIOD_NOON];
  return `${currentLabel}->${nextLabel}`;
}

function formatTimeTrackingPoint(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const periodLabel = TIME_PERIOD_LABELS[normalized.currentPeriod] || TIME_PERIOD_LABELS[TIME_PERIOD_MORNING];
  return `第${normalized.currentDayNumber}天${periodLabel}${normalized.currentYear}年${normalized.currentMonth}月${normalized.currentDate}日`;
}

function createPendingTimeTrackingTransition(targetTimeTracking = {}, source = "auto") {
  const target = normalizeTimeTrackingState(targetTimeTracking);
  return {
    source: source === "assistant_text" ? "assistant_text" : "auto",
    currentDayNumber: target.currentDayNumber,
    currentPeriod: target.currentPeriod,
    currentYear: target.currentYear,
    currentMonth: target.currentMonth,
    currentDate: target.currentDate,
    createdAt: nowIso()
  };
}

function getPendingTimeTrackingTarget(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const pendingTransition = normalizePendingTimeTrackingTransition(
    normalized.pendingTransition,
    normalized
  );
  if (!pendingTransition) {
    return null;
  }
  return normalizeTimeTrackingState({
    ...normalized,
    ...pendingTransition,
    pendingTransition: null,
    autoPeriod: {
      ...normalized.autoPeriod,
      turnsSinceChange: 0
    }
  });
}

function resetAutoTimePeriodCounter(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  return {
    ...normalized,
    autoPeriod: {
      ...normalized.autoPeriod,
      turnsSinceChange: 0
    }
  };
}

function advanceTimeTrackingPeriod(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const nextPeriod = getNextTimePeriod(normalized.currentPeriod);
  const base = normalized.currentPeriod === TIME_PERIOD_EVENING
    ? advanceTimeTrackingDays(normalized, 1)
    : normalized;
  return {
    ...base,
    currentPeriod: nextPeriod,
    autoPeriod: {
      ...normalized.autoPeriod,
      turnsSinceChange: 0
    },
    updatedAt: nowIso()
  };
}

function shouldWarnBeforeAutoTimePeriodSwitch(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const autoPeriod = normalizeTimeTrackingAutoPeriodConfig(normalized.autoPeriod);
  if (!normalized.enabled || !autoPeriod.enabled) {
    return false;
  }
  if (normalized.pendingTransition?.source === "auto") {
    return true;
  }
  return autoPeriod.turnsSinceChange >= Math.max(0, autoPeriod.roundsPerPeriod - 1);
}

function formatAutoTimePeriodWarning(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const autoPeriod = normalizeTimeTrackingAutoPeriodConfig(normalized.autoPeriod);
  if (!normalized.enabled || !autoPeriod.enabled || !shouldWarnBeforeAutoTimePeriodSwitch(normalized)) {
    return "";
  }
  const pendingTarget = getPendingTimeTrackingTarget(normalized);
  const transitionLabel = pendingTarget
    ? `${formatTimeTrackingPoint(normalized)} -> ${formatTimeTrackingPoint(pendingTarget)}`
    : getTimePeriodTransitionLabel(normalized);
  return `代碼即將自動切換時間 ${transitionLabel}，如果不想切換，請在下一次對話中加入 {{保持時間}}，會延後 ${autoPeriod.roundsPerPeriod} 回合`;
}

function formatAssistantTimeTransitionWarning(timeTracking = {}) {
  const normalized = normalizeTimeTrackingState(timeTracking);
  const pendingTarget = getPendingTimeTrackingTarget(normalized);
  if (!normalized.enabled || normalized.pendingTransition?.source !== "assistant_text" || !pendingTarget) {
    return "";
  }
  return `AI 對話即將切換時間 ${formatTimeTrackingPoint(normalized)} -> ${formatTimeTrackingPoint(pendingTarget)}，如果不想切換，請在下一次對話中加入 {{保持時間}}`;
}

function resolvePendingTimeTrackingBeforeUserTurn(currentState, userInput = "") {
  if (!currentState || typeof currentState !== "object") {
    return { applied: false, kept: false };
  }
  if (hasActiveAssistantTarget(currentState)) {
    return { applied: false, kept: false };
  }
  let timeTracking = normalizeTimeTrackingState(currentState.timeTracking);
  if (!timeTracking.enabled) {
    currentState.timeTracking = timeTracking;
    return { applied: false, kept: false };
  }

  let pendingTransition = timeTracking.pendingTransition;
  if (!pendingTransition && shouldWarnBeforeAutoTimePeriodSwitch(timeTracking)) {
    pendingTransition = createPendingTimeTrackingTransition(
      advanceTimeTrackingPeriod(timeTracking),
      "auto"
    );
    timeTracking = normalizeTimeTrackingState({
      ...timeTracking,
      pendingTransition
    });
  }
  if (!pendingTransition) {
    currentState.timeTracking = timeTracking;
    return { applied: false, kept: false };
  }

  const keepTime = hasKeepTimeDirective(userInput);
  if (keepTime) {
    currentState.timeTracking = normalizeTimeTrackingState({
      ...timeTracking,
      pendingTransition: null,
      autoPeriod: {
        ...timeTracking.autoPeriod,
        turnsSinceChange: 0
      },
      updatedAt: nowIso()
    });
    return { applied: false, kept: true };
  }

  const target = getPendingTimeTrackingTarget(timeTracking);
  currentState.timeTracking = normalizeTimeTrackingState({
    ...(target || timeTracking),
    pendingTransition: null,
    updatedAt: nowIso()
  });
  return { applied: Boolean(target), kept: false };
}

function detectTimePeriodFromText(text = "", config = DEFAULT_TIME_TRACKING_CONFIG, options = {}) {
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
          .filter((range) => shouldApplyTimeTrackingRange(normalizedText, range, config, options))
          .map((range) => ({ period, index: range.start }));
      })
      .flat()
      .filter((item) => item && item.index >= 0)
  );
  candidates.sort((left, right) => right.index - left.index);
  return candidates[0]?.period || "";
}

function updateTimeTrackingFromText(currentState, text = "", options = {}) {
  if (!currentState || typeof currentState !== "object") {
    return { changed: false };
  }
  let timeTracking = normalizeTimeTrackingState(currentState.timeTracking);
  const beforeTimeTracking = timeTracking;
  if (!timeTracking.enabled) {
    currentState.timeTracking = timeTracking;
    return { changed: false };
  }
  const content = safeText(text);
  if (!content) {
    currentState.timeTracking = timeTracking;
    return { changed: false };
  }
  const config = normalizeTimeTrackingConfig(timeTracking.config);
  const matchOptions = {
    allowBareTimeExpressions: Boolean(options.allowBareTimeExpressions)
  };
  let dayChangedByText = false;

  const explicitDate = findExplicitMonthDate(content, config, timeTracking.currentYear, matchOptions);
  if (explicitDate) {
    timeTracking = {
      ...timeTracking,
      currentYear: explicitDate.year,
      currentMonth: explicitDate.month,
      currentDate: explicitDate.date,
      updatedAt: nowIso()
    };
  } else {
    const explicitYear = findExplicitYear(content, config, matchOptions);
    if (explicitYear) {
      timeTracking = {
        ...timeTracking,
        currentYear: explicitYear,
        updatedAt: nowIso()
      };
    }
  }

  const explicitDayNumber = findExplicitDayNumber(content, config, matchOptions);
  if (explicitDayNumber) {
    timeTracking = setTimeTrackingDayNumber(timeTracking, explicitDayNumber);
    dayChangedByText = true;
  } else {
    const dayAfterIncrement = findDayAfterIncrement(content, config, matchOptions);
    if (dayAfterIncrement > 0) {
      timeTracking = advanceTimeTrackingDays(timeTracking, dayAfterIncrement);
      dayChangedByText = true;
    } else if (findNextDayIncrement(content, config, matchOptions)) {
      timeTracking = advanceTimeTrackingDays(timeTracking, 1);
      dayChangedByText = true;
    }
  }

  const detectedPeriod = detectTimePeriodFromText(content, config, matchOptions);
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

  const normalizedAfter = normalizeTimeTrackingState(timeTracking);
  const changed = beforeTimeTracking.currentDayNumber !== normalizedAfter.currentDayNumber ||
    beforeTimeTracking.currentPeriod !== normalizedAfter.currentPeriod ||
    beforeTimeTracking.currentYear !== normalizedAfter.currentYear ||
    beforeTimeTracking.currentMonth !== normalizedAfter.currentMonth ||
    beforeTimeTracking.currentDate !== normalizedAfter.currentDate;
  currentState.timeTracking = changed
    ? resetAutoTimePeriodCounter(normalizedAfter)
    : normalizedAfter;
  return { changed };
}

function updateTimeTrackingFromMessage(currentState, message = {}) {
  if (!message || typeof message !== "object" || hasActiveAssistantTarget(currentState)) {
    return;
  }
  const isOpeningOrAnyUserTimeSource = message.role === "user" || message.source === "opening";
  updateTimeTrackingFromText(currentState, message.role === "user"
    ? safeText(message.content || message.baseModelContent || message.extra?.baseModelContent)
    : safeText(message.content), {
      allowBareTimeExpressions: isOpeningOrAnyUserTimeSource
    });
}

function updateTimeTrackingAfterAssistantTurn(currentState, assistantText = "", userInput = "") {
  if (hasActiveAssistantTarget(currentState)) {
    return { autoTimeWarning: "" };
  }
  let timeTracking = normalizeTimeTrackingState(currentState?.timeTracking);
  if (!timeTracking.enabled) {
    currentState.timeTracking = timeTracking;
    return { autoTimeWarning: "" };
  }

  const assistantTextCandidate = {
    timeTracking: normalizeTimeTrackingState({
      ...timeTracking,
      pendingTransition: null
    })
  };
  const textUpdate = updateTimeTrackingFromText(assistantTextCandidate, assistantText);
  if (textUpdate.changed) {
    currentState.timeTracking = normalizeTimeTrackingState({
      ...timeTracking,
      pendingTransition: createPendingTimeTrackingTransition(
        assistantTextCandidate.timeTracking,
        "assistant_text"
      ),
      updatedAt: nowIso()
    });
    return {
      autoTimeWarning: formatAssistantTimeTransitionWarning(currentState.timeTracking)
    };
  }

  const autoPeriod = normalizeTimeTrackingAutoPeriodConfig(timeTracking.autoPeriod);
  const keepTime = hasKeepTimeDirective(userInput);
  if (!autoPeriod.enabled) {
    currentState.timeTracking = timeTracking;
    return { autoTimeWarning: "" };
  }
  if (keepTime) {
    currentState.timeTracking = normalizeTimeTrackingState({
      ...timeTracking,
      autoPeriod: {
        ...autoPeriod,
        turnsSinceChange: 0
      },
      updatedAt: nowIso()
    });
    return { autoTimeWarning: "" };
  }

  const nextCount = autoPeriod.turnsSinceChange + 1;
  const warningThreshold = Math.max(1, autoPeriod.roundsPerPeriod - 1);
  if (nextCount >= warningThreshold) {
    currentState.timeTracking = normalizeTimeTrackingState({
      ...timeTracking,
      autoPeriod: {
        ...autoPeriod,
        turnsSinceChange: nextCount
      },
      pendingTransition: createPendingTimeTrackingTransition(
        advanceTimeTrackingPeriod(timeTracking),
        "auto"
      ),
      updatedAt: nowIso()
    });
    return {
      autoTimeWarning: formatAutoTimePeriodWarning(currentState.timeTracking)
    };
  }

  currentState.timeTracking = normalizeTimeTrackingState({
    ...timeTracking,
    autoPeriod: {
      ...autoPeriod,
      turnsSinceChange: nextCount
    },
    updatedAt: nowIso()
  });
  return { autoTimeWarning: "" };
}

function formatTimeTrackingPromptBlock(currentState = state, options = {}) {
  if (hasActiveAssistantTarget(currentState)) {
    return "";
  }
  const timeTracking = normalizeTimeTrackingState(currentState?.timeTracking);
  if (!timeTracking.enabled) {
    return "";
  }
  const periodLabel = TIME_PERIOD_LABELS[timeTracking.currentPeriod] || TIME_PERIOD_LABELS[TIME_PERIOD_MORNING];
  return [
    `當前時間 | 數值: 第${timeTracking.currentDayNumber}天${periodLabel}${timeTracking.currentYear}年${timeTracking.currentMonth}月${timeTracking.currentDate}日`
  ].filter(Boolean).join("\n");
}

function appendUserIdentityTextToContent(content = "", currentState = state, runtimeUserName = "") {
  const base = safeText(content);
  const identityText = injectTemplatePlaceholders(
    currentState?.userProfile?.identityText,
    createTemplateVariables(currentState, runtimeUserName)
  );
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

function appendTimeTrackingTextToContent(content = "", currentState = state, options = {}) {
  return [safeText(content), formatTimeTrackingPromptBlock(currentState, options)].filter(Boolean).join("\n\n");
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

function formatActiveModelAppendTermsForUser(currentState = state, playerSlot = "", runtimeUserName = "") {
  const normalizedPlayerSlot = normalizeDiscordPlayerSlot(playerSlot);
  if (!normalizedPlayerSlot) {
    return "";
  }

  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  const templateVariables = createTemplateVariables(currentState, runtimeUserName);
  return getEnabledCompressionProfiles(currentState)
    .filter((profile) => isCompressionProfileStateActivated(getCompressionProfileState(compressionState, profile.id)))
    .flatMap((profile) => normalizeModelAppendTermsConfig(profile.appendTerms || []))
    .filter((term) => doesModelAppendTermMatchPlayer(term, normalizedPlayerSlot))
    .map((term) => injectTemplatePlaceholders(term.content, templateVariables))
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
      .replace(/\n{2,}當前時間 \| 數值:[^\n]*(?:\n【即將自動切換時間】[^\n]*)?/u, "")
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
      appendTimeTrackingTextToContent(getUserBaseModelContent(message), currentState, {
        suppressAutoWarning: Boolean(message?.keepTimeDirective || message?.extra?.keepTimeDirective)
      }),
      currentState,
      runtimeUserName
    ),
    currentState,
    runtimeUserName
  );
}

function attachTriggeredLorebooksToUserMessage(message, currentState = state, runtimeUserName = "") {
  if (!message || message.role !== "user") {
    return message;
  }
  if (hasActiveAssistantTarget(currentState)) {
    message.baseModelContent = getUserBaseModelContent(message);
    message.modelContent = message.baseModelContent;
    message.preparedModelContent = true;
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
  const modelAppendTerms = formatActiveModelAppendTermsForUser(currentState, playerSlot, runtimeUserName);
  message.baseModelContent = baseModelContent;
  message.lorebookTriggeredEntryIds = triggeredLorebooks
    .map((entry) => getLorebookEntryIdentity(entry))
    .filter(Boolean);
  message.modelContent = appendUserIdentityTextToContent(
    [
      prependDiscordPlayerSlotToUserContent(baseModelContent, playerSlot),
      modelAppendTerms,
      formatTimeTrackingPromptBlock(currentState, {
        suppressAutoWarning: Boolean(message.keepTimeDirective || message.extra?.keepTimeDirective)
      }),
      formatLorebookEntriesForPrompt(triggeredLorebooks)
    ].filter(Boolean).join("\n\n"),
    currentState,
    runtimeUserName
  );
  message.preparedModelContent = true;
  return message;
}

function getMinimumReplyChars() {
  const raw = envFirstNumber(["AI_MIN_REPLY_CHARS"], DEFAULT_MIN_REPLY_CHARS);
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
      enabled: state.conversation.some((message) => message.role === "assistant" && !isModelInvisibleMessage(message))
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
    if (item?.role === "assistant" && !isModelInvisibleMessage(item)) {
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
    if (message.role === "assistant" && safeText(message.content) && !isModelInvisibleMessage(message)) {
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

function getAllConversationContextMessages(currentState, latestUserMessageId = "") {
  const latestUserIndex = findLatestUserIndex(currentState, latestUserMessageId);
  if (latestUserIndex <= 0) {
    return [];
  }
  return currentState.conversation
    .slice(0, latestUserIndex)
    .filter((item) => item && typeof item === "object" && !isModelInvisibleMessage(item));
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
  const activeAssistant = getActiveAssistantCard(state);
  return finalizePromptTemplate(
    safeText(activeAssistant?.prompt) || getCharacterCardCreationAssistantPrompt(),
    createAssistantTemplateVariables(runtimeUserName)
  ).trim();
}

function getActiveModularPromptConfig(currentState = null) {
  const activeRoleCard = getActiveRoleCard(currentState);
  return getModularPromptConfig(normalizeRoleCardMode(activeRoleCard?.mode));
}

function formatModularRoleContext(state, activeRoleCard, resolvedUserName = "", options = {}) {
  const includeLorebooks = options.includeLorebooks !== false;
  const runtimeUserName = options.runtimeUserName || resolvedUserName;
  const purpose = options.purpose || "reasoner";
  const permanentLorebookEntries = getPermanentRoleCardLorebookEntries(state, activeRoleCard, runtimeUserName, purpose);
  const lorebooksBlock = includeLorebooks
    ? formatTriggeredLorebooksForPrompt(state, activeRoleCard, runtimeUserName, purpose)
    : "";
  if (isNoRoleCard(activeRoleCard)) {
    const roleCard = renderRoleCardWithUser(activeRoleCard, resolvedUserName);
    return [
      "【無角色卡自定義內容】",
      formatRoleCardForPrompt(roleCard, { includeOpeningDialogue: false, permanentLorebookEntries }) || [
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
      formatRoleCardsForPrompt(activeRoleCard, resolvedUserName, { permanentLorebookEntries }),
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
    formatRoleCardForPrompt(roleCard, { includeOpeningDialogue: false, permanentLorebookEntries }),
    lorebooksBlock
  ].join("\n");
}

function buildCacheableDialogueMessages(messages = []) {
  const messageList = Array.isArray(messages) ? messages : [];
  const labels = getContextMessageRoundLabels(messageList);
  return messageList
    .map((item, index) => {
      const role = item?.role === "assistant" ? "assistant" : item?.role === "user" ? "user" : "";
      if (!role) {
        return null;
      }
      const content = item?.requestContentPrepared === true
        ? safeText(item.content)
        : getMessageModelContent(item);
      const normalizedContent = safeText(content);
      return normalizedContent
        ? { role, content: [labels[index], normalizedContent].join("\n") }
        : null;
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
    if (message.role === "assistant" && pendingUser && !isModelInvisibleMessage(message)) {
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
      {
        allowEmptyModels: !isStandardProfile || hasExplicitEmptyCompressionModels(activeConfig.contextCompression),
        allowEmptyMainRules: !isStandardProfile
      }
    );
  }

  const standardProfile = Array.isArray(activeConfig?.compressionProfiles)
    ? activeConfig.compressionProfiles.find((profile) => normalizeCompressionProfileId(profile?.id) === STANDARD_COMPRESSION_PROFILE_ID)
    : null;
  return normalizeContextCompressionPromptConfig(
    standardProfile?.contextCompression || activeConfig.contextCompression || activeConfig.contextCompressionPrompt,
    standardProfile?.contextCompression?.mainRules || activeConfig.contextCompressionPrompt || getContextCompressionPrompt(),
    {
      allowEmptyModels: hasExplicitEmptyCompressionModels(
        standardProfile?.contextCompression || activeConfig.contextCompression
      )
    }
  );
}

function buildContextCompressionInstructionPrompt(currentState = state, config = null) {
  const compressionConfig = resolveContextCompressionPromptConfig(currentState, config);
  const templateVariables = createTemplateVariables(currentState);
  const isCustomProfileConfig = config &&
    typeof config === "object" &&
    config.contextCompression &&
    normalizeCompressionProfileId(config.id) !== STANDARD_COMPRESSION_PROFILE_ID;
  const mainRules = finalizePromptTemplate(
    compressionConfig.mainRules || (isCustomProfileConfig ? "" : getContextCompressionPrompt()),
    templateVariables
  );
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
    finalizePromptTemplate(model.addRules || "", templateVariables) || "無",
    "刪除模塊規則:",
    finalizePromptTemplate(model.deleteRules || "", templateVariables) || "無",
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

function buildCompactContextCompressionInstructionPrompt(
  currentState = state,
  runtimeUserName = "",
  config = null,
  options = {}
) {
  const compressionConfig = resolveContextCompressionPromptConfig(currentState, config);
  const templateVariables = createTemplateVariables(currentState, runtimeUserName);
  const isCustomProfileConfig = config &&
    typeof config === "object" &&
    config.contextCompression &&
    normalizeCompressionProfileId(config.id) !== STANDARD_COMPRESSION_PROFILE_ID;
  const mainRules = finalizePromptTemplate(
    compressionConfig.mainRules || (isCustomProfileConfig ? "" : getContextCompressionPrompt()),
    templateVariables
  );

  if (options.imagePrompt === true) {
    const moduleRules = compressionConfig.models
      .map((model) => [
        finalizePromptTemplate(model.addRules || "", templateVariables),
        finalizePromptTemplate(model.deleteRules || "", templateVariables)
      ].filter(Boolean).join("\n"))
      .filter(Boolean)
      .join("\n\n");
    return [
      mainRules,
      moduleRules,
      "只輸出可直接送去 NovelAI 的 Base Prompt；不要輸出標題、解釋、JSON 或 Markdown。"
    ].filter(Boolean).join("\n\n");
  }

  if (compressionConfig.models.length === 0) {
    return [
      mainRules,
      "直接輸出更新後的完整壓縮文本，禁止輸出 JSON。",
      "請把目前模型內容與本次上下文合併成可供正文長期承接的純文本。",
      "如果舊內容已被新資訊取代、完成或失效，請在輸出的完整文本中自然移除或改寫。"
    ].filter(Boolean).join("\n");
  }

  const modelRules = compressionConfig.models.map((model, index) => [
    `模塊 ${index + 1}: ${model.name || model.id}`,
    `id:${model.id}`,
    "新增模塊規則:",
    finalizePromptTemplate(model.addRules || "", templateVariables) || "無",
    "刪除模塊規則:",
    finalizePromptTemplate(model.deleteRules || "", templateVariables) || "無",
    `輸出欄位:model.${model.id}`,
    `刪除欄位:delete.${model.id}`
  ].join("\n")).join("\n\n");
  const outputShape = {
    model: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []])),
    delete: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []]))
  };
  return [
    mainRules,
    modelRules,
    "只能輸出一個合法 JSON 物件，禁止輸出 JSON 以外的任何文字。",
    "所有模型欄位都必須存在；沒有新增或刪除內容時輸出空陣列。",
    "model.<id> 只放本次需要新增保存的內容；delete.<id> 只放已失效、已完成、被新版取代或重複的舊內容。",
    "不可把本次剛新增到 model.<id> 的內容又放進 delete.<id>。",
    "後端會把 model.<id> 追加到既有模型內容，不會整體覆蓋；請避免重複輸出既有內容。",
    "JSON 格式範例:",
    JSON.stringify(outputShape, null, 2)
  ].filter(Boolean).join("\n\n");
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

function formatCompressionProfileSummaryForReasoner(profile, profileState, currentState = state) {
  if (isImageGenerationCompressionProfile(profile)) {
    return "";
  }
  const compressionConfig = normalizeContextCompressionPromptConfig(
    profile.contextCompression,
    getContextCompressionPrompt(),
    {
      allowEmptyModels: profile.id !== STANDARD_COMPRESSION_PROFILE_ID ||
        hasExplicitEmptyCompressionModels(profile.contextCompression),
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

function isImageGenerationCompressionProfile(profile = {}) {
  return getEnabledCompressionTriggerActions(profile).some((triggerAction) =>
    triggerAction.action === MODEL_TRIGGER_ACTION_CALL_API &&
    isImageKeywordFollowupAction(triggerAction.keywordFollowupAction)
  );
}

function sanitizeImageGenerationCompressionState(currentState = state) {
  if (!currentState || typeof currentState !== "object") {
    return false;
  }
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  let changed = false;
  getEnabledCompressionProfiles(currentState).forEach((profile) => {
    if (!isImageGenerationCompressionProfile(profile)) {
      return;
    }
    const profileId = normalizeCompressionProfileId(profile.id);
    const profileState = getCompressionProfileState(compressionState, profileId);
    if (!safeText(profileState.summary)) {
      return;
    }
    const cleanedState = {
      ...profileState,
      summary: "",
      updatedAt: nowIso()
    };
    setCompressionProfileState(currentState, profileId, cleanedState);
    changed = true;
  });
  if (!changed) {
    currentState.contextCompression = compressionState;
  }
  return changed;
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
      suppressAssistantMessage: Boolean(result.suppressAssistantMessage),
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
    suppressAssistantMessage: false,
    processedActions: []
  };
}

function hasPendingModelImageGeneration(result = {}) {
  return (Array.isArray(result?.processedActions) ? result.processedActions : [])
    .some((item) => item?.imageGeneration?.pending);
}

function formatCompressionContextBlock(messages = []) {
  const messageList = Array.isArray(messages) ? messages : [];
  const labels = getContextMessageRoundLabels(messageList);
  const content = messageList
    .map((message, index) => {
      return [labels[index], getMessageModelContent(message) || safeText(message?.content) || "（空白）"].join("\n");
    })
    .join("\n\n----------------\n\n");
  return ["【上下文】", content || "無"].join("\n");
}

function buildCompressionRoleCardContextMessage(currentState = state, runtimeUserName = "") {
  const resolvedUserName = resolveUserDisplayName(currentState.userProfile, runtimeUserName);
  const activeRoleCard = getActiveRoleCard(currentState);
  const roleContext = formatModularRoleContext(currentState, activeRoleCard, resolvedUserName, {
    includeLorebooks: false,
    runtimeUserName,
    purpose: "compression"
  });
  return ["【角色卡資料】", roleContext].filter(Boolean).join("\n");
}

function formatRoleCardImagePromptCustomSections(roleCard = {}, index = 0) {
  if (!roleCard) {
    return "";
  }
  const sections = normalizeRoleCardCustomSections(roleCard.customSections, roleCard)
    .filter((section) => section.enabled !== false && section.includeInImagePrompt === true)
    .filter((section) => safeText(section.name) || safeText(section.content));
  if (sections.length === 0) {
    return "";
  }
  return [
    roleCard.name ? `角色:${roleCard.name}` : `角色 ${index + 1}`,
    ...sections.map((section) => `${section.name || "自定義內容"}:${section.content}`)
  ].filter(Boolean).join("\n");
}

function buildImagePromptRoleCardContextMessage(currentState = state, runtimeUserName = "", profile = {}) {
  const resolvedUserName = resolveUserDisplayName(currentState.userProfile, runtimeUserName);
  const activeRoleCard = getActiveRoleCard(currentState);
  const cards = Array.isArray(activeRoleCard)
    ? activeRoleCard.filter(Boolean)
    : [activeRoleCard].filter(Boolean);
  const drawingBlocks = cards
    .map((card, index) => {
      const renderedCard = renderRoleCardWithUser(card, resolvedUserName);
      return formatRoleCardImagePromptCustomSections(renderedCard, index);
    })
    .filter(Boolean);

  if (drawingBlocks.length > 0) {
    return ["繪圖角色卡資料", drawingBlocks.join("\n\n")].join("\n");
  }

  return shouldCompressionProfileReadRoleCard(profile)
    ? buildCompressionRoleCardContextMessage(currentState, runtimeUserName)
    : "";
}

function shouldCompressionProfileReadRoleCard(profile = {}) {
  return normalizeCompressionContextScope(profile.contextScope) === COMPRESSION_CONTEXT_SCOPE_ROLE_AND_TEXT;
}

function buildModelTriggerApiMessages({
  currentState = state,
  runtimeUserName = "",
  profile = {},
  messagesToCompress = [],
  profileState = {}
}) {
  const roleCardContextMessage = shouldCompressionProfileReadRoleCard(profile)
    ? buildCompressionRoleCardContextMessage(currentState, runtimeUserName)
    : "";
  return [
    {
      role: "user",
      content: buildCompactContextCompressionInstructionPrompt(currentState, runtimeUserName, profile)
    },
    ...(roleCardContextMessage
      ? [{
          role: "user",
          content: roleCardContextMessage
        }]
      : []),
    {
      role: "user",
      content: formatCompressionContextBlock(messagesToCompress)
    },
    {
      role: "user",
      content: buildCurrentCompressionContentMessage(profileState.summary)
    }
  ];
}

function buildModelImagePromptInstructionPrompt(currentState = state, runtimeUserName = "", profile = {}) {
  return buildCompactContextCompressionInstructionPrompt(currentState, runtimeUserName, profile, {
    imagePrompt: true
  });
}

function buildRecentModelImageContextMessages({
  currentState = state,
  runtimeUserName = "",
  latestUser = null,
  includeLatestAssistant = false,
  contextRounds = MODEL_IMAGE_PROMPT_CONTEXT_ROUNDS
}) {
  const normalizedContextRounds = Math.max(1, Math.floor(Number(contextRounds) || MODEL_IMAGE_PROMPT_CONTEXT_ROUNDS));
  const completedRoundLimit = Math.max(0, normalizedContextRounds - (latestUser ? 1 : 0));
  const completedRounds = latestUser
    ? getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUser.id)
    : [];
  const messages = completedRounds
    .slice(completedRoundLimit > 0 ? -completedRoundLimit : completedRounds.length)
    .flat();

  if (latestUser) {
    const latestUserContent = getCurrentUserModelContent(latestUser, currentState, runtimeUserName);
    if (latestUserContent) {
      messages.push({
        role: "user",
        content: latestUserContent,
        requestContentPrepared: true
      });
    }
  }

  if (includeLatestAssistant) {
    const latestAssistant = getLatestAssistantMessageAfterUser(currentState, latestUser);
    const latestAssistantContent = latestAssistant ? getMessageModelContent(latestAssistant) : "";
    if (latestAssistantContent) {
      messages.push({
        role: "assistant",
        content: latestAssistantContent
      });
    }
  }

  return messages;
}

function buildModelImagePromptApiMessages({
  currentState = state,
  runtimeUserName = "",
  profile = {},
  includeLatestAssistant = false
}) {
  const latestUser = getLatestUserMessage(currentState);
  const roleCardContextMessage = buildImagePromptRoleCardContextMessage(currentState, runtimeUserName, profile);
  const contextMessages = buildRecentModelImageContextMessages({
    currentState,
    runtimeUserName,
    latestUser,
    includeLatestAssistant
  });
  return [
    {
      role: "system",
      content: buildModelImagePromptInstructionPrompt(currentState, runtimeUserName, profile)
    },
    ...(roleCardContextMessage
      ? [{
          role: "user",
          content: roleCardContextMessage
        }]
      : []),
    {
      role: "user",
      content: formatCompressionContextBlock(contextMessages)
    }
  ];
}

function getModelTriggerApiPurpose(profile = {}, suffix = "") {
  const basePurpose = normalizeCompressionProfileId(profile.id) === STANDARD_COMPRESSION_PROFILE_ID
    ? "context_compression"
    : `context_compression:${normalizeCompressionProfileId(profile.id)}`;
  return suffix ? `${basePurpose}:${suffix}` : basePurpose;
}

function createModelImageMessageContent(profile = {}, triggerAction = {}, status = "success", detail = "") {
  const name = getModelTriggerCompletionName(profile, triggerAction);
  if (status === "error") {
    return `【${name}】圖片生成失敗：${safeText(detail) || "未知錯誤"}`;
  }
  return `【${name}】圖片生成完成`;
}

function createModelImageMessage({
  profile = {},
  triggerAction = {},
  turnExtra = {},
  images = [],
  prompt = "",
  status = "success",
  detail = ""
}) {
  return createMessageRecord({
    role: "assistant",
    content: createModelImageMessageContent(profile, triggerAction, status, detail),
    source: "model_image",
    extra: {
      ...turnExtra,
      imageOnly: true,
      excludeFromModel: true,
      modelImageGeneration: true,
      modelImageStatus: status,
      profileId: profile.id,
      profileName: profile.name || profile.id,
      triggerActionId: triggerAction.id,
      triggerActionName: triggerAction.name || "",
      basePrompt: safeText(prompt),
      images
    }
  });
}

async function sendDiscordModelImageMessage(turnExtra = {}, imageMessage = null, generatedImages = []) {
  const channelId = safeText(turnExtra.discordChannelId || turnExtra.channelId);
  if (!channelId || !activeDiscordClient || !imageMessage) {
    return [];
  }
  try {
    const channel = await activeDiscordClient.channels.fetch(channelId);
    if (!channel || typeof channel.send !== "function") {
      return [];
    }
    const files = (Array.isArray(generatedImages) ? generatedImages : [])
      .map((image) => {
        const parsed = parseImageDataUrl(image?.dataUrl || "");
        if (!parsed) {
          return null;
        }
        return new AttachmentBuilder(parsed.buffer, {
          name: safeText(image.fileName) || `novelai-${Date.now()}.${getImageExtensionFromMime(parsed.mimeType)}`
        });
      })
      .filter(Boolean);
    const sent = await channel.send({
      content: safeText(imageMessage.content) || "圖片生成完成",
      ...(files.length > 0 ? { files } : {})
    });
    rememberDiscordReplyMessageIds(imageMessage, sent ? [sent] : []);
    return sent ? [sent] : [];
  } catch (error) {
    console.warn(`Discord 圖片訊息發送失敗：${safeText(error?.message) || error}`);
    return [];
  }
}

function saveGeneratedNovelAiImagesForMessage(generatedImages = [], prompt = "") {
  return (Array.isArray(generatedImages) ? generatedImages : []).map((image, index) => {
    const item = saveNovelAiAlbumItem({
      imageDataUrl: image.dataUrl,
      fileName: image.fileName || `model-image-${index + 1}.png`,
      metadata: image.metadata || {}
    });
    return {
      id: item.id,
      fileName: item.fileName,
      mimeType: item.mimeType,
      imageUrl: item.imageUrl,
      prompt: safeText(prompt),
      metadata: image.metadata || {}
    };
  });
}

async function buildModelImageGenerationResult({
  currentState = state,
  runtimeUserName = "",
  profile = {},
  triggerAction = {},
  includeLatestAssistant = false
}) {
  const promptCompletion = await callChatApiCompletionRaw({
    messages: buildModelImagePromptApiMessages({
      currentState,
      runtimeUserName,
      profile,
      includeLatestAssistant
    }),
    purpose: getModelTriggerApiPurpose(profile, "image_prompt")
  });
  const basePrompt = safeText(promptCompletion.content);
  if (!basePrompt) {
    throw new Error("大模型沒有輸出 Base Prompt。");
  }
  const settings = {
    ...normalizeModelImageGenerationSettings(triggerAction),
    prompt: basePrompt
  };
  const generated = await generateNovelAiImages({ settings });
  const images = saveGeneratedNovelAiImagesForMessage(generated.images, basePrompt);
  return {
    prompt: basePrompt,
    images,
    generatedImages: generated.images
  };
}

async function appendModelImageGenerationMessage(result = {}, context = {}) {
  const message = createModelImageMessage({
    profile: context.profile,
    triggerAction: context.triggerAction,
    turnExtra: context.turnExtra,
    images: result.images || [],
    prompt: result.prompt || "",
    status: result.status || "success",
    detail: result.detail || ""
  });
  appendConversationMessage(message);
  saveState(state);
  await sendDiscordModelImageMessage(context.turnExtra, message, result.generatedImages || []);
  saveState(state);
  return message;
}

async function runModelImageGenerationTask(context = {}) {
  try {
    const result = await buildModelImageGenerationResult(context);
    return appendModelImageGenerationMessage(result, context);
  } catch (error) {
    return appendModelImageGenerationMessage({
      status: "error",
      detail: error?.message || "未知錯誤",
      images: [],
      generatedImages: []
    }, context);
  }
}

function queueParallelModelImageGeneration(context = {}) {
  void buildModelImageGenerationResult(context)
    .then((result) => withStateLock(() => appendModelImageGenerationMessage(result, context)))
    .catch((error) => withStateLock(() => appendModelImageGenerationMessage({
      status: "error",
      detail: error?.message || "未知錯誤",
      images: [],
      generatedImages: []
    }, context)))
    .catch((error) => {
      console.warn(`並行圖片生成收尾失敗：${safeText(error?.message) || error}`);
    });
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

function getRecurringScheduledTurnTarget(turn, currentTurnNumber, contextLimit) {
  const normalizedTurn = Math.max(0, Math.floor(Number(turn) || 0));
  const normalizedCurrentTurn = Math.max(0, Math.floor(Number(currentTurnNumber) || 0));
  const interval = Math.max(1, Math.floor(Number(contextLimit) || 1));
  if (normalizedCurrentTurn <= 0) {
    return 0;
  }
  if (normalizedTurn === 0) {
    if (normalizedCurrentTurn < interval) {
      return 0;
    }
    return Math.floor(normalizedCurrentTurn / interval) * interval;
  }
  if (normalizedCurrentTurn < normalizedTurn) {
    return 0;
  }
  const cycles = Math.floor((normalizedCurrentTurn - normalizedTurn) / interval);
  return normalizedTurn + cycles * interval;
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
  const compressedThroughTurnNumber = Number(profileState.compressedThroughTurnNumber || 0);
  const triggeredBy = [];

  if (triggers.roundLimit && uncompressedRounds.length >= contextLimit) {
    triggeredBy.push("達到正文上限輪數");
  }

  if (
    triggers.everyTurn &&
    currentTurnNumber > 0 &&
    compressedThroughTurnNumber < currentTurnNumber
  ) {
    triggeredBy.push("每回合觸發");
  }

  if (triggers.turns.includes(0)) {
    const alreadyStarted = safeText(profileState.summary) ||
      compressedThroughTurnNumber > 0;
    if (!alreadyStarted && currentTurnNumber <= 1) {
      triggeredBy.push("開始觸發");
    }
  }

  const scheduledTurnTargets = [...new Set(
    triggers.turns
      .map((turn) => getRecurringScheduledTurnTarget(turn, currentTurnNumber, contextLimit))
      .filter((turn) => turn > 0 && compressedThroughTurnNumber < turn)
  )].sort((a, b) => a - b);
  scheduledTurnTargets.forEach((turn) => {
    triggeredBy.push(`第 ${turn} 回合`);
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
      suppressAssistantMessage: false,
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
      let triggeredBy = shouldTriggerCompressionProfile({
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
      if (phase === "after_assistant" && triggeredByKeyword && !keywordMatch.matchedAssistant) {
        triggeredBy = triggeredBy.filter((item) => item !== "觸發關鍵字");
        if (triggeredBy.length === 0) {
          continue;
        }
      }
      const includeLatestAssistant = Boolean(keywordMatch.matchedAssistant);
      const triggeredEveryTurn = triggeredBy.includes("每回合觸發");
      const keywordFollowupAction = normalizeKeywordFollowupAction(
        triggerAction.keywordFollowupAction,
        triggerAction.skipReasoner
      );
      const suppressAssistantMessage = phase === "before_reasoner" &&
        triggerAction.action === MODEL_TRIGGER_ACTION_CALL_API &&
        isImageOnlyKeywordFollowupAction(keywordFollowupAction);
      const skipReasonerAfterTrigger = suppressAssistantMessage || (
        phase === "before_reasoner" &&
        triggeredByKeyword &&
        triggerAction.action === MODEL_TRIGGER_ACTION_CALL_API &&
        keywordFollowupAction === KEYWORD_FOLLOWUP_STOP_AFTER_MODEL
      );
      const shouldRunImageFollowup = triggerAction.action === MODEL_TRIGGER_ACTION_CALL_API &&
        isImageKeywordFollowupAction(keywordFollowupAction);
      const includeLatestUser = includeLatestAssistant ||
        shouldRunImageFollowup ||
        triggeredBy.includes("開始觸發") ||
        triggeredEveryTurn ||
        (triggeredBy.includes("觸發關鍵字") && triggers.keywordSource !== "assistant");
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
        keywordFollowupAction,
        imageGeneration: shouldRunImageFollowup
          ? {
              pending: true,
              parallel: true,
              suppressAssistantMessage
            }
          : null,
        skipReasoner: skipReasonerAfterTrigger,
        suppressAssistantMessage,
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
          allowEmptyModels: profile.id !== STANDARD_COMPRESSION_PROFILE_ID ||
            hasExplicitEmptyCompressionModels(profile.contextCompression),
          allowEmptyMainRules: profile.id !== STANDARD_COMPRESSION_PROFILE_ID
        }
      );
      options.onStatus?.("compression");

      if (shouldRunImageFollowup) {
        const imageProfileState = {
          ...profileState,
          summary: ""
        };
        setCompressionProfileState(currentState, profile.id, {
          summary: "",
          compressedThroughTurnNumber,
          updatedAt: nowIso()
        });
        const imageContext = {
          currentState,
          runtimeUserName,
          profile,
          triggerAction,
          triggeredBy,
          includeLatestAssistant,
          messagesToCompress,
          profileState: imageProfileState,
          turnExtra: options.turnExtra || {}
        };
        queueParallelModelImageGeneration(imageContext);
        processedActions.push(processedAction);
        didCompress = true;
        continue;
      }

      const completion = await callChatApiCompletionRaw({
        messages: buildModelTriggerApiMessages({
          currentState,
          runtimeUserName,
          profile,
          triggerAction,
          triggeredBy,
          messagesToCompress,
          profileState
        }),
        purpose: getModelTriggerApiPurpose(profile)
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
    suppressAssistantMessage: processedActions.some((item) => item.suppressAssistantMessage),
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

async function updateCompressionAfterAssistantMessage(currentState, runtimeUserName = "", assistantMessage = null, turnExtra = {}) {
  if (hasActiveAssistantTarget(currentState)) {
    return false;
  }
  const compressionBefore = normalizeContextCompressionState(currentState.contextCompression);
  const processingResult = await ensureContextCompressionSummary(currentState, runtimeUserName, {
    phase: "after_assistant",
    turnExtra,
    returnDetails: true
  });
  const imageOnlyProcessing = Array.isArray(processingResult.processedActions) &&
    processingResult.processedActions.length > 0 &&
    processingResult.processedActions.every((item) => isImageKeywordFollowupAction(item.keywordFollowupAction));
  const didAdvance = !imageOnlyProcessing &&
    didContextCompressionAdvance(compressionBefore, processingResult.contextCompression);
  if (didAdvance && assistantMessage?.extra) {
    assistantMessage.extra.compressionNotice = true;
    assistantMessage.extra.stateAfterTurnSnapshot = captureNarrativeCheckpoint(currentState);
  }
  return {
    ...processingResult,
    didAdvance
  };
}

function buildSimpleCompressedReasonerStaticSystemPrompt(currentState, runtimeUserName = "", config = null) {
  const activeRoleCard = getActiveRoleCard(currentState);
  const resolvedUserName = resolveUserDisplayName(currentState.userProfile, runtimeUserName);
  const templateVariables = createTemplateVariables(currentState, runtimeUserName, activeRoleCard);
  const activeConfig = config || getActiveModularPromptConfig(currentState);
  return [
    "【主要規則】",
    finalizePromptTemplate(activeConfig.reasonerHistory.mainRules, templateVariables),
    formatModularRoleContext(currentState, activeRoleCard, resolvedUserName, {
      includeIdentityHeader: false,
      includeIdentityContent: false,
      includeLorebooks: false,
      runtimeUserName,
      purpose: "reasoner"
    }),
    "【輸出規則】",
    finalizePromptTemplate(activeConfig.reasonerHistory.contextRules, templateVariables),
    "【處理要求】",
    "後續獨立 user message 會提供目前模型內容；最近對話會以獨立 user/assistant messages 提供，同一回合共用相同的 #回合編號。本輪 user message 可能會按順序包含：目前輸入者、這一輪 user 的內容、已啟用大模型的追加詞、統計時間、觸發世界書 Lorebooks、自訂補充。請根據主要規則、角色卡、目前模型內容、最近對話與輸出規則輸出正文。"
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

function isModelInvisibleMessage(message = {}) {
  return Boolean(message?.excludeFromModel || message?.imageOnly || message?.extra?.excludeFromModel || message?.extra?.imageOnly);
}

function getMessageModelContent(message) {
  if (!message || typeof message !== "object") {
    return "";
  }
  if (isModelInvisibleMessage(message)) {
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
    if (item.role === "assistant" && !isModelInvisibleMessage(item)) {
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
    if (conversation[i]?.role === "assistant" && !isModelInvisibleMessage(conversation[i])) {
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
  const modelRaw = stripKeepTimeDirective(raw);
  const modelVisibleInput = modelRaw || "【場外指令】保持時間\n【要求】本輪不要因自動機制切換早中晚，其他內容照常承接上一輪。";
  const wrappedContinueMatch = modelRaw.match(/^[（(]\s*([^()（）]+?)\s*[）)]$/);
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
    modelContent: modelVisibleInput
  };
}

function buildReasonerHistoryMessages(state, runtimeUserName = "") {
  return buildSimpleCompressedReasonerMessages(state, runtimeUserName);
}

function buildCharacterCardCreationAssistantMessages(state, runtimeUserName = "") {
  const latestUser = getLatestUserMessage(state);
  const baseMessages = [
    {
      role: "system",
      content: buildCharacterCardCreationAssistantSystemPrompt(state, runtimeUserName)
    }
  ];

  if (!latestUser) {
    return baseMessages;
  }

  const contextMessages = getAllConversationContextMessages(state, latestUser.id);

  return [
    ...baseMessages,
    ...contextMessages.map((item) => ({
      role: item.role,
      content: getMessageModelContent(item)
    })),
    {
      role: "user",
      content: getUserBaseModelContent(latestUser)
    }
  ];
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

function isModelImagePromptPurpose(purpose = "") {
  return isContextCompressionPurpose(purpose) && safeText(purpose).split(":").includes("image_prompt");
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
  const temperatureKeys = ["CHAT_API_TEMPERATURE", "CONVERSATION_API_TEMPERATURE"];
  const hasExplicitTemperature = temperatureKeys.some((key) => Object.prototype.hasOwnProperty.call(process.env, key));
  const envTemperature = Number(
    safeText(process.env.CHAT_API_TEMPERATURE) ||
    safeText(process.env.CONVERSATION_API_TEMPERATURE) ||
    (!hasExplicitTemperature
      ? getAppDefaultEnvText("CHAT_API_TEMPERATURE") || getAppDefaultEnvText("CONVERSATION_API_TEMPERATURE")
      : "") ||
    ""
  );
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
    isContextCompressionPurpose(purpose) ||
    purpose === "reasoner_history_chat" ||
    purpose === "chat_expand" ||
    purpose === "character_card_creation_assistant_chat"
  );
}

function buildChatApiLengthRetryMessages(messages, partialContent = "", purpose = "chat") {
  if (isModelImagePromptPurpose(purpose)) {
    return [
      ...messages,
      {
        role: "user",
        content: [
          "上一輪因輸出長度限制未完整輸出。",
          "請重新生成一版更短、更直接的 NovelAI Base Prompt。",
          "只輸出 prompt 本文；不要輸出標題、解釋、JSON 或 Markdown。"
        ].join("\n")
      }
    ];
  }

  if (isContextCompressionPurpose(purpose)) {
    return [
      ...messages,
      {
        role: "user",
        content: [
          "上一輪因輸出長度限制未完整輸出。",
          "請根據同一上下文重新生成完整模型內容，遵守原本要求的輸出格式。",
          "不要輸出解釋，不要加額外標題。"
        ].join("\n")
      }
    ];
  }

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
  const isCompressionPurpose = isContextCompressionPurpose(purpose);

  if (Number.isFinite(maxTokens) && maxTokens > 0) {
    return Math.min(Math.floor(maxTokens), modelCap);
  }

  if (isModelImagePromptPurpose(purpose)) {
    const imagePromptMaxTokens = envFirstNumber(
      ["MODEL_IMAGE_PROMPT_MAX_TOKENS", "NOVELAI_IMAGE_PROMPT_MAX_TOKENS"],
      12000
    );
    return Math.min(Math.max(1024, Math.floor(imagePromptMaxTokens)), modelCap);
  }

  const envMaxTokens = envFirstNumber(
    ["CHAT_API_MAX_TOKENS", "CONVERSATION_API_MAX_TOKENS", "DEEPSEEK_MAX_TOKENS"],
    0
  );
  const preferredEnvMaxTokens = envMaxTokens;
  if (
    Number.isFinite(preferredEnvMaxTokens) &&
    preferredEnvMaxTokens > 0 &&
    (
      purpose === "reasoner_history_chat" ||
      isCompressionPurpose ||
      purpose === "chat_expand" ||
      purpose === "character_card_creation_assistant_chat"
    )
  ) {
    return Math.min(Math.floor(preferredEnvMaxTokens), modelCap);
  }

  if (
    purpose === "reasoner_history_chat" ||
    isCompressionPurpose ||
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

function getAssistantAutoTimeWarning(message) {
  return safeText(message?.extra?.autoTimeWarning || message?.autoTimeWarning);
}

function formatAssistantMessageForUserDisplay(message) {
  let content = safeText(message?.content);
  if (!shouldDisplayCompressionNotice(message)) {
    return [content, getAssistantAutoTimeWarning(message)].filter(Boolean).join("\n\n");
  }
  if (content.startsWith(COMPRESSION_USER_NOTICE_TEXT)) {
    return [content, getAssistantAutoTimeWarning(message)].filter(Boolean).join("\n\n");
  }
  content = [COMPRESSION_USER_NOTICE_TEXT, content].filter(Boolean).join("\n\n");
  return [content, getAssistantAutoTimeWarning(message)].filter(Boolean).join("\n\n");
}

function hasUsageTokens(usage) {
  const normalized = normalizeAiUsage(usage);
  return Boolean(
    normalized.promptTokens !== null ||
      normalized.completionTokens !== null ||
      normalized.totalTokens !== null
  );
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
      messages: buildChatApiLengthRetryMessages(messages, trimmed, purpose),
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
        messages: buildChatApiLengthRetryMessages(messages, streamed.content, purpose),
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
  if (hasActiveAssistantTarget(state)) {
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

function isConversationTurnReady(currentState) {
  return Boolean(currentState?.aiSessionStarted && hasActiveConversationTarget(currentState));
}

async function generateOneShotConversationAssistant({ state: currentState, runtimeUserName, input, turnExtra = {} }) {
  const compressionBefore = normalizeContextCompressionState(currentState.contextCompression);
  const content = await runReasonerHistoryConversationTurn(currentState, runtimeUserName, {
    turnExtra
  });
  const modelProcessingResult = getLastModelProcessingResult(currentState);
  const imageOnlyProcessing = Array.isArray(modelProcessingResult.processedActions) &&
    modelProcessingResult.processedActions.length > 0 &&
    modelProcessingResult.processedActions.every((item) => isImageKeywordFollowupAction(item.keywordFollowupAction));
  const compressionNotice = !imageOnlyProcessing &&
    !hasActiveAssistantTarget(currentState) &&
    didContextCompressionAdvance(compressionBefore, currentState.contextCompression);
  return {
    content,
    reasoningContent: "",
    compressionNotice,
    suppressAssistantMessage: Boolean(modelProcessingResult.suppressAssistantMessage),
    modelProcessingResult
  };
}

async function generateStreamingConversationAssistant({ state: currentState, runtimeUserName, turnExtra = {}, handlers = {} }) {
  const onPhaseStatus = typeof handlers.onPhaseStatus === "function" ? handlers.onPhaseStatus : null;
  const onReasoningDelta = typeof handlers.onReasoningDelta === "function" ? handlers.onReasoningDelta : null;
  const onContentDelta = typeof handlers.onContentDelta === "function" ? handlers.onContentDelta : null;

  if (hasActiveAssistantTarget(currentState)) {
    onPhaseStatus?.("chat");
    const streamed = await callChatApiCompletionStreamRaw({
      messages: buildCharacterCardCreationAssistantMessages(currentState, runtimeUserName),
      purpose: "character_card_creation_assistant_chat",
      onReasoningDelta,
      onContentDelta
    });
    return {
      ...streamed,
      compressionNotice: false,
      modelProcessingResult: getLastModelProcessingResult(currentState)
    };
  }

  const compressionBefore = normalizeContextCompressionState(currentState.contextCompression);
  const processingResult = await ensureContextCompressionSummary(currentState, runtimeUserName, {
    onStatus: onPhaseStatus,
    phase: "before_reasoner",
    returnDetails: true,
    turnExtra
  });
  const imageOnlyProcessing = Array.isArray(processingResult.processedActions) &&
    processingResult.processedActions.length > 0 &&
    processingResult.processedActions.every((item) => isImageKeywordFollowupAction(item.keywordFollowupAction));
  const compressionNotice = !imageOnlyProcessing &&
    didContextCompressionAdvance(compressionBefore, processingResult.contextCompression);
  if (processingResult.skipReasoner) {
    if (processingResult.suppressAssistantMessage) {
      return {
        content: "",
        reasoningContent: "",
        compressionNotice: false,
        suppressAssistantMessage: true,
        modelProcessingResult: processingResult
      };
    }
    const completionText = formatModelProcessingCompletionMessage(processingResult.processedActions);
    onContentDelta?.(completionText);
    return {
      content: completionText,
      reasoningContent: "",
      compressionNotice,
      modelProcessingResult: processingResult
    };
  }

  onPhaseStatus?.("chat");
  const streamed = await callChatApiCompletionStreamRaw({
    messages: buildReasonerHistoryMessages(currentState, runtimeUserName),
    purpose: "reasoner_history_chat",
    onReasoningDelta,
    onContentDelta
  });
  return {
    ...streamed,
    compressionNotice,
    modelProcessingResult: getLastModelProcessingResult(currentState)
  };
}

function createConversationTurnDeps(options = {}) {
  const streaming = Boolean(options.streaming);
  const handlers = options.handlers || {};
  return {
    isSessionReady: isConversationTurnReady,
    parseInput: parseRoleplayInput,
    getPendingAssistantFeedbackForNextUser,
    prependAssistantFeedbackPrompt,
    ensureTurnExtra: ensureDiscordPlayerAssignmentForTurn,
    captureCheckpoint: captureNarrativeCheckpoint,
    createMessageRecord,
    appendConversationMessage,
    markPendingAssistantFeedbackApplied,
    resolvePendingTimeTrackingBeforeUserTurn,
    updateTimeTrackingFromMessage,
    resolveRuntimeUserName: (currentState, turnExtra = {}) =>
      resolveUserDisplayName(currentState.userProfile, turnExtra.discordUserName || ""),
    attachTriggeredLorebooksToUserMessage,
    generateAssistant: (context) => streaming
      ? generateStreamingConversationAssistant({ ...context, handlers })
      : generateOneShotConversationAssistant(context),
    getLastModelProcessingResult,
    shouldEnsureMinimumAssistantLength: ({ state: currentState, assistantText, modelProcessingResult }) => (
      !hasActiveAssistantTarget(currentState) &&
      !modelProcessingResult.skipReasoner &&
      countVisibleCharacters(assistantText) < getMinimumReplyChars()
    ),
    ensureMinimumAssistantLength: ({ state: currentState, assistantText, runtimeUserName }) => streaming
      ? ensureMinimumAssistantLengthStreaming(currentState, assistantText, runtimeUserName, handlers)
      : ensureMinimumAssistantLength(currentState, assistantText, runtimeUserName),
    finalizeAssistantOutputContent,
    updateTimeTrackingAfterAssistantTurn,
    updateCompressionAfterAssistantMessage,
    saveState
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
    const result = await runConversationTurnWorkflow(
      createConversationTurnDeps({
        streaming: true,
        handlers: {
          onPhaseStatus,
          onReasoningDelta,
          onContentDelta
        }
      }),
      {
        state,
        content,
        source,
        extra,
        keepTimeDirective: hasKeepTimeDirective(content),
        emptyInputMessage: "輸入不可空白。",
        notReadyMessage: "尚未開始。請先在網頁選擇角色卡或啟用助手。"
      }
    );
    return {
      assistantMessage: result.assistantMessage,
      modelProcessingResult: result.modelProcessingResult
    };
  });
}

function statePayload(state) {
  const {
    savedSessions: _savedSessions,
    activeSavedSessionId: _activeSavedSessionId,
    ...publicState
  } = state;
  return {
    ...publicState,
    conversation: normalizeConversationForClient(state.conversation),
    aiLogs: Array.isArray(state.aiLogs)
      ? state.aiLogs.map((entry) => normalizeAiLog(entry))
      : [],
    modularPromptConfigs: getModularPromptConfigsPayload(),
    contextCompressionPrompt: getContextCompressionPrompt(),
    characterCardCreationAssistantPrompt: getCharacterCardCreationAssistantPrompt(),
    webDisplay: getWebChatDisplayConfig(state),
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
      clientId: getDiscordClientId(),
      authorizeUrl: getDiscordAuthorizeUrl()
    }
  };
}

let state = loadState();
if (sanitizeImageGenerationCompressionState(state)) {
  saveState(state);
} else {
  persistCardState(state);
}
let discordConnected = false;
let activeDiscordClient = null;
let discordLoginRetryTimer = null;
let restartScheduled = false;
let stateWriteQueue = Promise.resolve();
const novelAiVibeEncodeCache = new Map();

function clearDiscordLoginRetryTimer() {
  if (!discordLoginRetryTimer) {
    return;
  }
  clearTimeout(discordLoginRetryTimer);
  discordLoginRetryTimer = null;
}

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
      clearDiscordLoginRetryTimer();
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

function normalizeAssistantFeedbackType(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/\s+/g, "");
  if (normalized === ASSISTANT_FEEDBACK_LIKE || normalized === "liked" || normalized === "up" || normalized === "thumbsup" || normalized === "👍") {
    return ASSISTANT_FEEDBACK_LIKE;
  }
  if (normalized === ASSISTANT_FEEDBACK_DISLIKE || normalized === "down" || normalized === "thumbsdown" || normalized === "👎") {
    return ASSISTANT_FEEDBACK_DISLIKE;
  }
  return "";
}

function isClearAssistantFeedbackValue(value = "") {
  const normalized = safeText(value).toLowerCase().replace(/\s+/g, "");
  return ["clear", "none", "off", "cancel", "remove", "取消", "清除"].includes(normalized);
}

function getAssistantFeedbackPromptPrefix(feedbackType = "") {
  return ASSISTANT_FEEDBACK_PROMPT_PREFIXES[normalizeAssistantFeedbackType(feedbackType)] || "";
}

function stripAssistantFeedbackPromptPrefixes(content = "") {
  const prefixes = Object.values(ASSISTANT_FEEDBACK_PROMPT_PREFIXES)
    .map((prefix) => prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!prefixes) {
    return safeText(content);
  }
  const pattern = new RegExp(`^(?:\\s*(?:${prefixes})\\s*)+`, "u");
  return safeText(content).replace(pattern, "").trimStart();
}

function prependAssistantFeedbackPrompt(content = "", feedbackType = "") {
  const prefix = getAssistantFeedbackPromptPrefix(feedbackType);
  const base = stripAssistantFeedbackPromptPrefixes(content);
  return [prefix, base].filter(Boolean).join("\n");
}

function findNextUserMessageForAssistantFeedback(currentState, assistantMessage) {
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  const assistantIndex = conversation.findIndex((item) => item?.id === assistantMessage?.id);
  if (assistantIndex < 0) {
    return null;
  }
  for (let index = assistantIndex + 1; index < conversation.length; index += 1) {
    if (conversation[index]?.role === "user") {
      return conversation[index];
    }
  }
  return null;
}

function applyFeedbackPrefixToUserMessage(userMessage, feedbackType = "") {
  if (!userMessage || userMessage.role !== "user") {
    return null;
  }
  const normalizedFeedback = normalizeAssistantFeedbackType(feedbackType);
  const promptPrefix = getAssistantFeedbackPromptPrefix(normalizedFeedback);
  if (!promptPrefix) {
    return null;
  }

  const fallbackBase = getUserBaseModelContent(userMessage) || safeText(userMessage.content);
  userMessage.baseModelContent = prependAssistantFeedbackPrompt(
    safeText(userMessage.baseModelContent) || fallbackBase,
    normalizedFeedback
  );
  userMessage.modelContent = prependAssistantFeedbackPrompt(
    safeText(userMessage.modelContent || userMessage.extra?.modelContent) || userMessage.baseModelContent,
    normalizedFeedback
  );
  userMessage.assistantOutputFeedback = normalizedFeedback;
  userMessage.assistantOutputFeedbackPrompt = promptPrefix;
  userMessage.feedbackUpdatedAt = nowIso();

  if (userMessage.extra && typeof userMessage.extra === "object") {
    userMessage.extra.baseModelContent = userMessage.baseModelContent;
    userMessage.extra.modelContent = userMessage.modelContent;
    userMessage.extra.assistantOutputFeedback = normalizedFeedback;
    userMessage.extra.assistantOutputFeedbackPrompt = promptPrefix;
    userMessage.extra.feedbackUpdatedAt = userMessage.feedbackUpdatedAt;
  }

  return userMessage;
}

function clearFeedbackPrefixFromUserMessage(userMessage) {
  if (!userMessage || userMessage.role !== "user") {
    return null;
  }
  const fallbackBase = getUserBaseModelContent(userMessage) || safeText(userMessage.content);
  userMessage.baseModelContent = stripAssistantFeedbackPromptPrefixes(
    safeText(userMessage.baseModelContent) || fallbackBase
  );
  userMessage.modelContent = stripAssistantFeedbackPromptPrefixes(
    safeText(userMessage.modelContent || userMessage.extra?.modelContent) || userMessage.baseModelContent
  );
  userMessage.assistantOutputFeedback = "";
  userMessage.assistantOutputFeedbackPrompt = "";
  userMessage.feedbackUpdatedAt = nowIso();

  if (userMessage.extra && typeof userMessage.extra === "object") {
    userMessage.extra.baseModelContent = userMessage.baseModelContent;
    userMessage.extra.modelContent = userMessage.modelContent;
    userMessage.extra.assistantOutputFeedback = "";
    userMessage.extra.assistantOutputFeedbackPrompt = "";
    userMessage.extra.feedbackUpdatedAt = userMessage.feedbackUpdatedAt;
  }

  return userMessage;
}

function getPendingAssistantFeedbackForNextUser(currentState) {
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  for (let index = conversation.length - 1; index >= 0; index -= 1) {
    const message = conversation[index];
    if (!message || message.role === "user") {
      break;
    }
    if (message.role !== "assistant") {
      continue;
    }
    const feedback = normalizeAssistantFeedbackType(message.feedback);
    if (feedback && message.feedbackPendingForNextUser !== false && !safeText(message.feedbackAppliedToUserMessageId)) {
      return {
        assistantMessage: message,
        feedback,
        promptPrefix: getAssistantFeedbackPromptPrefix(feedback)
      };
    }
  }
  return null;
}

function markPendingAssistantFeedbackApplied(pendingFeedback = null, userMessage = null) {
  const assistantMessage = pendingFeedback?.assistantMessage;
  if (!assistantMessage || !userMessage) {
    return;
  }
  assistantMessage.feedbackPendingForNextUser = false;
  assistantMessage.feedbackAppliedToUserMessageId = userMessage.id;
  assistantMessage.feedbackAppliedAt = nowIso();
  assistantMessage.updatedAt = assistantMessage.feedbackAppliedAt;
}

function applyAssistantFeedbackToConversation(currentState, { assistantMessageId = "", feedback = "", source = "", userId = "", userName = "" } = {}) {
  const rawFeedback = safeText(feedback);
  const normalizedFeedback = normalizeAssistantFeedbackType(feedback);
  const conversation = Array.isArray(currentState?.conversation) ? currentState.conversation : [];
  const assistantMessage = conversation.find((item) => item?.id === assistantMessageId);
  if (!assistantMessage) {
    return { ok: false, status: 404, error: "訊息不存在" };
  }
  if (assistantMessage.role !== "assistant" || isModelInvisibleMessage(assistantMessage)) {
    return { ok: false, status: 400, error: "僅允許標記 AI 正文輸出" };
  }

  const shouldClear = isClearAssistantFeedbackValue(rawFeedback) ||
    (normalizedFeedback && normalizeAssistantFeedbackType(assistantMessage.feedback) === normalizedFeedback);
  if (shouldClear) {
    const appliedUserMessageId = safeText(assistantMessage.feedbackAppliedToUserMessageId);
    const appliedUserMessage = appliedUserMessageId
      ? conversation.find((item) => item?.id === appliedUserMessageId && item.role === "user")
      : null;
    if (appliedUserMessage) {
      clearFeedbackPrefixFromUserMessage(appliedUserMessage);
    }
    assistantMessage.feedback = "";
    assistantMessage.feedbackPrompt = "";
    assistantMessage.feedbackSource = safeText(source);
    assistantMessage.feedbackUserId = safeText(userId);
    assistantMessage.feedbackUserName = safeText(userName);
    assistantMessage.feedbackPendingForNextUser = false;
    assistantMessage.feedbackAppliedToUserMessageId = "";
    assistantMessage.feedbackAppliedAt = "";
    assistantMessage.feedbackUpdatedAt = nowIso();
    assistantMessage.updatedAt = assistantMessage.feedbackUpdatedAt;
    saveState(currentState);
    return {
      ok: true,
      assistantMessage,
      userMessage: appliedUserMessage,
      feedback: "",
      promptPrefix: "",
      pendingForNextUser: false,
      cleared: true
    };
  }

  if (!normalizedFeedback) {
    return { ok: false, status: 400, error: "未知的回饋類型。" };
  }

  const promptPrefix = getAssistantFeedbackPromptPrefix(normalizedFeedback);
  const nextUserMessage = findNextUserMessageForAssistantFeedback(currentState, assistantMessage);
  if (nextUserMessage) {
    applyFeedbackPrefixToUserMessage(nextUserMessage, normalizedFeedback);
  }
  assistantMessage.feedback = normalizedFeedback;
  assistantMessage.feedbackPrompt = promptPrefix;
  assistantMessage.feedbackSource = safeText(source);
  assistantMessage.feedbackUserId = safeText(userId);
  assistantMessage.feedbackUserName = safeText(userName);
  assistantMessage.feedbackPendingForNextUser = !nextUserMessage;
  assistantMessage.feedbackAppliedToUserMessageId = nextUserMessage?.id || "";
  assistantMessage.feedbackUpdatedAt = nowIso();
  assistantMessage.updatedAt = assistantMessage.feedbackUpdatedAt;

  saveState(currentState);
  return {
    ok: true,
    assistantMessage,
    userMessage: nextUserMessage,
    feedback: normalizedFeedback,
    promptPrefix,
    pendingForNextUser: !nextUserMessage
  };
}

function findAssistantMessageByDiscordReplyId(currentState, discordReplyMessageId = "") {
  const normalizedId = safeText(discordReplyMessageId);
  if (!normalizedId) {
    return null;
  }
  return (Array.isArray(currentState?.conversation) ? currentState.conversation : [])
    .find((item) => item?.role === "assistant" && !isModelInvisibleMessage(item) && getDiscordReplyMessageIds(item).includes(normalizedId)) || null;
}

function normalizeAiLog(entry) {
  const source = entry && typeof entry === "object" ? entry : {};
  const model = safeText(source.model) || "";
  const usage = normalizeAiUsage(source.usage);
  usage.cost = calculateAiUsageCost(usage, model) || usage.cost;
  return {
    id: safeText(source.id) || newId("ailog"),
    purpose: safeText(source.purpose) || "chat",
    model,
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
    usage,
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

async function replayConversationFromUserIndexLocked({
  targetIndex,
  content,
  source = "discord",
  extra = {},
  userExtra = {},
  assistantExtra = {}
}) {
  if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
    throw new Error("尚未開始。請先在網頁選擇角色卡或啟用助手。");
  }
  if (!Number.isInteger(targetIndex) || targetIndex < 0 || state.conversation[targetIndex]?.role !== "user") {
    throw new Error("找不到指定的使用者輸入。");
  }

  const storedUserContent = safeText(content);
  if (!storedUserContent) {
    throw new Error("改寫內容不可空白。");
  }

  const replacedUserMessage = state.conversation[targetIndex];
  const removedDiscordReplyMessageIds = state.conversation
    .slice(targetIndex + 1)
    .flatMap((item) => item?.role === "assistant" ? getDiscordReplyMessageIds(item) : []);

  restoreNarrativeStateForReplay(state, targetIndex);
  state.conversation = state.conversation.slice(0, targetIndex);
  syncTurnStateFromConversation(state);
  const result = await runConversationTurnWorkflow(
    createConversationTurnDeps(),
    {
      state,
      content: storedUserContent,
      source,
      extra,
      applyPendingAssistantFeedback: false,
      keepTimeDirective: hasKeepTimeDirective(storedUserContent),
      userExtra: {
        ...userExtra,
        rewrittenUserMessageId: safeText(replacedUserMessage?.id)
      },
      assistantExtra: {
        ...assistantExtra,
        rewrittenUserMessageId: safeText(replacedUserMessage?.id),
        replayGenerated: true
      },
      emptyInputMessage: "改寫內容不可空白。",
      notReadyMessage: "尚未開始。請先在網頁選擇角色卡或啟用助手。"
    }
  );

  return {
    assistantMessage: result.assistantMessage,
    userMessage: result.userMessage,
    modelProcessingResult: result.modelProcessingResult,
    replacedUserMessage,
    removedDiscordReplyMessageIds
  };
}

async function rewriteRecentUserInput({
  num,
  comment,
  source = "discord",
  extra = {}
}) {
  return withStateLock(async () => {
    const normalizedNumber = normalizeRecentUserInputNumber(num);
    if (!normalizedNumber) {
      throw new Error("num 必須是 1 以上的整數。");
    }

    const targetIndex = findRecentUserMessageIndex(state.conversation, normalizedNumber);
    if (targetIndex < 0) {
      const available = state.conversation.filter((item) => item?.role === "user").length;
      throw new Error(`找不到倒數第 ${normalizedNumber} 次使用者輸入，目前共有 ${available} 次。`);
    }

    return replayConversationFromUserIndexLocked({
      targetIndex,
      content: comment,
      source,
      extra,
      userExtra: {
        reloadRecentUserNumber: normalizedNumber
      },
      assistantExtra: {
        reloadRecentUserNumber: normalizedNumber
      }
    });
  });
}

async function replayConversationFromMessageNumber({
  messageNumber,
  content,
  source = "discord",
  extra = {}
}) {
  return withStateLock(async () => {
    const normalizedMessageNumber = Math.floor(Number(messageNumber));
    if (!Number.isFinite(normalizedMessageNumber) || normalizedMessageNumber < 1) {
      throw new Error("請提供有效的訊息編號，從 1 開始。");
    }
    return replayConversationFromUserIndexLocked({
      targetIndex: normalizedMessageNumber - 1,
      content,
      source,
      extra,
      userExtra: {
        replayFromMessageNumber: normalizedMessageNumber
      },
      assistantExtra: {
        replayFromMessageNumber: normalizedMessageNumber
      }
    });
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
      throw new Error("尚未開始。請先在網頁選擇角色卡或啟用助手。");
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
    const removedDiscordReplyMessageIds = state.conversation
      .slice(targetIndex + 1)
      .flatMap((item) => item?.role === "assistant" ? getDiscordReplyMessageIds(item) : []);

    restoreNarrativeStateForReplay(state, targetIndex);
    state.conversation = state.conversation.slice(0, targetIndex);
    syncTurnStateFromConversation(state);
    const result = await runConversationTurnWorkflow(
      createConversationTurnDeps(),
      {
        state,
        content: storedUserContent,
        source,
        extra,
        applyPendingAssistantFeedback: false,
        keepTimeDirective: hasKeepTimeDirective(storedUserContent),
        userExtra: {
          discordMessageId: normalizedMessageId,
          replayFromDiscordEdit: true
        },
        assistantExtra: {
          discordMessageId: normalizedMessageId,
          replayFromDiscordEdit: true
        },
        emptyInputMessage: "重算內容不可空白。",
        notReadyMessage: "尚未開始。請先在網頁選擇角色卡或啟用助手。"
      }
    );

    return {
      assistantMessage: result.assistantMessage,
      modelProcessingResult: result.modelProcessingResult,
      removedDiscordReplyMessageIds
    };
  });
}

async function runConversationTurn({ content, source, extra = {} }) {
  return withStateLock(async () => {
    const result = await runConversationTurnWorkflow(
      createConversationTurnDeps(),
      {
        state,
        content,
        source,
        extra,
        keepTimeDirective: hasKeepTimeDirective(content),
        emptyInputMessage: "輸入不可空白。",
        notReadyMessage: "尚未開始。請先在網頁選擇角色卡或啟用助手。"
      }
    );
    return {
      assistantMessage: result.assistantMessage,
      modelProcessingResult: result.modelProcessingResult
    };
  });
}

function getCurrentConversationTargetLabel(currentState) {
  if (hasActiveAssistantTarget(currentState)) {
    return getActiveAssistantName(currentState);
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

    if (pathname === "/api/discord/events" && method === "POST") {
      const discordPublicKey = getDiscordPublicKey();
      if (!discordPublicKey) {
        sendJson(res, 503, { error: "Discord Bot 尚未連線，且未設定 DISCORD_PUBLIC_KEY。" });
        return;
      }

      const rawBody = await readRawBody(req, 1024 * 1024);
      const signatureValid = verifyDiscordWebhookSignature({
        publicKey: discordPublicKey,
        signature: req.headers["x-signature-ed25519"],
        timestamp: req.headers["x-signature-timestamp"],
        rawBody
      });
      if (!signatureValid) {
        sendJson(res, 401, { error: "Discord Webhook 簽章無效。" });
        return;
      }

      let payload;
      try {
        payload = JSON.parse(rawBody.toString("utf8"));
      } catch {
        sendJson(res, 400, { error: "JSON 格式錯誤" });
        return;
      }

      res.writeHead(204, { "Content-Type": "application/json; charset=utf-8" });
      res.end();
      const authorization = getDiscordUserInstallAuthorization(payload);
      if (authorization) {
        void sendDiscordUserInstallWelcome(authorization).catch((error) => {
          console.warn(`Discord 使用者安裝歡迎私訊失敗（${authorization.userId}）：${error.message || error}`);
        });
      }
      return;
    }

    if (pathname === "/api/state" && method === "GET") {
      sendCachedJson(req, res, statePayload(state));
      return;
    }

    if (pathname === "/api/env" && method === "GET") {
      sendJson(res, 200, {
        content: readEnvFileContentForEditor(),
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

    if (pathname === "/api/novelai/status" && method === "GET") {
      sendJson(res, 200, await getNovelAiStatus());
      return;
    }

    if (pathname === "/api/novelai/storyboards" && method === "GET") {
      sendJson(res, 200, { storyboards: listNovelAiStoryboards() });
      return;
    }

    if (pathname === "/api/novelai/storyboards" && method === "POST") {
      const body = await readBody(req);
      const storyboard = writeNovelAiStoryboard(body, { create: true });
      sendJson(res, 201, { storyboard, storyboards: listNovelAiStoryboards() });
      return;
    }

    const storyboardImageMatch = pathname.match(/^\/api\/novelai\/storyboards\/([^/]+)\/runs\/([^/]+)\/images\/([^/]+)$/u);
    if (storyboardImageMatch && method === "GET") {
      const [storyboardId, runId, imageId] = storyboardImageMatch.slice(1).map(decodeURIComponent);
      const item = getNovelAiStoryboardImage(storyboardId, runId, imageId);
      if (!item) {
        sendJson(res, 404, { error: "Storyboard 圖片不存在。" });
        return;
      }
      res.writeHead(200, {
        "Content-Type": item.image.mimeType || "image/png",
        "Content-Length": item.image.size || fs.statSync(item.filePath).size,
        "Cache-Control": "no-store"
      });
      fs.createReadStream(item.filePath).pipe(res);
      return;
    }

    const storyboardRunActionMatch = pathname.match(/^\/api\/novelai\/storyboards\/([^/]+)\/runs\/([^/]+)\/(next|pause|resume)$/u);
    if (storyboardRunActionMatch && method === "POST") {
      const storyboardId = decodeURIComponent(storyboardRunActionMatch[1]);
      const runId = decodeURIComponent(storyboardRunActionMatch[2]);
      const action = storyboardRunActionMatch[3];
      const run = action === "next"
        ? await generateNextNovelAiStoryboardImage(storyboardId, runId)
        : action === "pause"
          ? pauseNovelAiStoryboardRun(storyboardId, runId)
          : resumeNovelAiStoryboardRun(storyboardId, runId);
      sendJson(res, 200, { run, summary: storyboardRunSummary(run) });
      return;
    }

    const storyboardRunMatch = pathname.match(/^\/api\/novelai\/storyboards\/([^/]+)\/runs\/([^/]+)$/u);
    if (storyboardRunMatch && method === "GET") {
      const storyboardId = decodeURIComponent(storyboardRunMatch[1]);
      const runId = decodeURIComponent(storyboardRunMatch[2]);
      const run = readNovelAiStoryboardRun(storyboardId, runId);
      if (!run) {
        sendJson(res, 404, { error: "Storyboard 執行紀錄不存在。" });
        return;
      }
      sendJson(res, 200, { run, summary: storyboardRunSummary(run) });
      return;
    }

    if (storyboardRunMatch && method === "DELETE") {
      const storyboardId = decodeURIComponent(storyboardRunMatch[1]);
      const runId = decodeURIComponent(storyboardRunMatch[2]);
      if (!deleteNovelAiStoryboardRun(storyboardId, runId)) {
        sendJson(res, 409, { error: "執行紀錄不存在或仍在生成中。" });
        return;
      }
      sendJson(res, 200, {
        runs: listNovelAiStoryboardRuns(storyboardId).map(storyboardRunSummary)
      });
      return;
    }

    const storyboardRunsMatch = pathname.match(/^\/api\/novelai\/storyboards\/([^/]+)\/runs$/u);
    if (storyboardRunsMatch && method === "GET") {
      const storyboardId = decodeURIComponent(storyboardRunsMatch[1]);
      if (!readNovelAiStoryboard(storyboardId)) {
        sendJson(res, 404, { error: "Storyboard 不存在。" });
        return;
      }
      sendJson(res, 200, {
        runs: listNovelAiStoryboardRuns(storyboardId).map(storyboardRunSummary)
      });
      return;
    }

    if (storyboardRunsMatch && method === "POST") {
      const storyboardId = decodeURIComponent(storyboardRunsMatch[1]);
      const run = createNovelAiStoryboardRun(storyboardId);
      sendJson(res, 201, { run, summary: storyboardRunSummary(run) });
      return;
    }

    const storyboardMatch = pathname.match(/^\/api\/novelai\/storyboards\/([^/]+)$/u);
    if (storyboardMatch && method === "GET") {
      const storyboardId = decodeURIComponent(storyboardMatch[1]);
      const storyboard = readNovelAiStoryboard(storyboardId);
      if (!storyboard) {
        sendJson(res, 404, { error: "Storyboard 不存在。" });
        return;
      }
      sendJson(res, 200, { storyboard });
      return;
    }

    if (storyboardMatch && method === "PUT") {
      const storyboardId = decodeURIComponent(storyboardMatch[1]);
      const body = await readBody(req);
      const storyboard = writeNovelAiStoryboard(body, { storyboardId });
      sendJson(res, 200, { storyboard, storyboards: listNovelAiStoryboards() });
      return;
    }

    if (storyboardMatch && method === "DELETE") {
      const storyboardId = decodeURIComponent(storyboardMatch[1]);
      if (!deleteNovelAiStoryboard(storyboardId)) {
        sendJson(res, 404, { error: "Storyboard 不存在。" });
        return;
      }
      sendJson(res, 200, { storyboards: listNovelAiStoryboards() });
      return;
    }

    if (pathname === "/api/novelai/defaults" && method === "GET") {
      sendJson(res, 200, {
        defaults: readNovelAiDefaultsPayload()
      });
      return;
    }

    if (pathname === "/api/novelai/defaults" && (method === "POST" || method === "PUT")) {
      const body = await readBody(req);
      sendJson(res, 200, {
        defaults: saveNovelAiDefaultsPayload(body)
      });
      return;
    }

    if (pathname === "/api/novelai/generate" && method === "POST") {
      const body = await readBody(req);
      sendJson(res, 200, await generateNovelAiImages(body));
      return;
    }

    if (pathname === "/api/novelai/album" && method === "GET") {
      sendJson(res, 200, {
        items: readNovelAiAlbumIndex().map((item) => toNovelAiAlbumSummary(item))
      });
      return;
    }

    if (pathname === "/api/novelai/album" && method === "POST") {
      const body = await readBody(req);
      sendJson(res, 201, {
        item: saveNovelAiAlbumItem(body)
      });
      return;
    }

    const novelAiAlbumImageMatch = pathname.match(/^\/api\/novelai\/album\/([^/]+)\/image$/);
    if (novelAiAlbumImageMatch && method === "GET") {
      const id = decodeURIComponent(novelAiAlbumImageMatch[1]);
      if (!isSafeNovelAiAlbumId(id)) {
        sendJson(res, 400, { error: "相簿 ID 不正確。" });
        return;
      }
      const item = readNovelAiAlbumIndex().find((entry) => entry.id === id);
      if (!item) {
        sendJson(res, 404, { error: "相簿圖片不存在。" });
        return;
      }
      const filePath = getNovelAiAlbumItemFilePath(item);
      if (!fs.existsSync(filePath)) {
        sendJson(res, 404, { error: "相簿圖片檔案不存在。" });
        return;
      }
      res.writeHead(200, {
        "Content-Type": item.mimeType || "image/png",
        "Cache-Control": "no-store"
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    const novelAiAlbumDeleteMatch = pathname.match(/^\/api\/novelai\/album\/([^/]+)$/);
    if (novelAiAlbumDeleteMatch && method === "DELETE") {
      const deleted = deleteNovelAiAlbumItem(decodeURIComponent(novelAiAlbumDeleteMatch[1]));
      if (!deleted) {
        sendJson(res, 404, { error: "相簿圖片不存在。" });
        return;
      }
      sendJson(res, 200, {
        items: readNovelAiAlbumIndex().map((item) => toNovelAiAlbumSummary(item))
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
        pendingTransition: null,
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
      state.assistantCards = getAssistantCards(state).map((card) =>
        card.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE
          ? { ...card, name: card.name || DEFAULT_ASSISTANT_CARD_NAME, prompt, updatedAt: nowIso() }
          : card
      );
      saveState(state);
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
      const loaded = loadSavedSessionIntoRuntime(state, sessionLoadMatch[1]);
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

    const sessionDetailMatch = pathname.match(/^\/api\/sessions\/([^/]+)$/);
    if (sessionDetailMatch && method === "GET") {
      const session = getSavedSessionById(state, sessionDetailMatch[1]);
      if (!session) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      sendJson(res, 200, {
        session: buildSavedSessionDetail(session)
      });
      return;
    }

    if (sessionDetailMatch && method === "DELETE") {
      const deleted = deleteSavedSession(state, sessionDetailMatch[1]);
      if (!deleted) {
        sendJson(res, 404, { error: "對話存檔不存在" });
        return;
      }
      saveState(state);
      sendJson(res, 200, { state: statePayload(state) });
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

    if (pathname === "/api/defaults/save" && method === "POST") {
      const defaults = saveDefaultAppSettings(state);
      sendJson(res, 200, {
        defaults,
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/defaults/apply" && method === "POST") {
      const defaults = applyDefaultAppSettings(state);
      sendJson(res, 200, {
        defaults,
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/defaults/update" && method === "POST") {
      const defaults = updateLocalDefaultsFromBundles();
      sendJson(res, 200, {
        defaults,
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/role-cards" && method === "GET") {
      sendJson(res, 200, { roleCards: state.roleCards, activeRoleCardId: state.activeRoleCardId });
      return;
    }

    if (pathname === "/api/assistant-modes/character-card-creation/start" && method === "POST") {
      const result = await withStateLock(async () => {
        startAssistantCard(state, CHARACTER_CARD_CREATION_ASSISTANT_MODE);
        saveState(state);
        return { state: statePayload(state), status: 200 };
      });

      sendJson(res, 200, { openingMessage: null, state: result.state });
      return;
    }

    if (pathname === "/api/assistant-cards" && method === "GET") {
      sendJson(res, 200, { assistantCards: getAssistantCards(state), activeAssistantMode: state.activeAssistantMode });
      return;
    }

    if (pathname === "/api/assistant-cards" && method === "POST") {
      const body = await readBody(req);
      const now = nowIso();
      const card = normalizeAssistantCard({
        id: newId("assistant"),
        name: safeText(body?.name) || "新助手",
        description: safeText(body?.description) || "自訂助手卡。",
        prompt: safeText(body?.prompt) || getCharacterCardCreationAssistantPrompt(),
        createdAt: now,
        updatedAt: now
      }, getAssistantCards(state).length);
      state.assistantCards = [...getAssistantCards(state), card];
      saveState(state);
      sendJson(res, 201, { assistantCard: card, state: statePayload(state) });
      return;
    }

    const assistantCardMatch = pathname.match(/^\/api\/assistant-cards\/([^/]+)$/);
    if (assistantCardMatch && method === "PUT") {
      const assistantId = assistantCardMatch[1];
      const body = await readBody(req);
      state.assistantCards = getAssistantCards(state);
      const card = state.assistantCards.find((item) => item.id === normalizeAssistantMode(assistantId));
      if (!card) {
        sendJson(res, 404, { error: "助手不存在" });
        return;
      }
      card.name = safeText(body?.name) || card.name || DEFAULT_ASSISTANT_CARD_NAME;
      card.description = safeText(body?.description) || card.description || DEFAULT_ASSISTANT_CARD_DESCRIPTION;
      card.prompt = safeText(body?.prompt) || card.prompt || getCharacterCardCreationAssistantPrompt();
      card.updatedAt = nowIso();
      if (card.id === CHARACTER_CARD_CREATION_ASSISTANT_MODE) {
        saveCharacterCardCreationAssistantPrompt(card.prompt);
      }
      saveState(state);
      sendJson(res, 200, { assistantCard: card, state: statePayload(state) });
      return;
    }

    if (assistantCardMatch && method === "DELETE") {
      const deleted = deleteAssistantCard(state, assistantCardMatch[1]);
      if (!deleted) {
        sendJson(res, 404, { error: "助手不存在或不可刪除" });
        return;
      }
      saveState(state);
      sendJson(res, 200, { state: statePayload(state) });
      return;
    }

    const assistantStartMatch = pathname.match(/^\/api\/assistant-cards\/([^/]+)\/start$/);
    if (assistantStartMatch && method === "POST") {
      const result = await withStateLock(async () => {
        const assistant = startAssistantCard(state, assistantStartMatch[1]);
        if (!assistant) {
          return { error: "助手不存在", status: 404 };
        }
        saveState(state);
        return { state: statePayload(state), status: 200 };
      });
      if (result.error) {
        sendJson(res, result.status || 400, { error: result.error });
        return;
      }
      sendJson(res, 200, { openingMessage: null, state: result.state });
      return;
    }

    if (pathname === "/api/role-cards" && method === "POST") {
      const body = await readBody(req);
      const source = getRoleCardInputSource(body);
      const name = safeText(source.name);
      const mode = normalizeRoleCardMode(source.mode);
      const coverImage = safeText(source.coverImage || source.avatar);
      const coverPosition = normalizeCoverPosition(source.coverPosition);
      const customSections = normalizeRoleCardCustomSections(source.customSections, source);
      const fallbackOpeningDialogue = safeText(source.openingDialogue || source.first_mes);
      const openingDialogues = normalizeRoleCardOpeningDialogues(
        source.openingDialogues || source.opening_dialogues || source.alternateGreetings || source.alternate_greetings,
        fallbackOpeningDialogue
      );
      const activeOpeningDialogueId = safeText(source.activeOpeningDialogueId || source.active_opening_dialogue_id) ||
        openingDialogues[0]?.id ||
        "";
      const openingDialogue = resolveActiveOpeningDialogue(openingDialogues, activeOpeningDialogueId, fallbackOpeningDialogue);
      const lorebooks = normalizeRoleCardLorebooks(getRoleCardLorebookInput(source));
      const corruptedFields = findRoleCardCorruptedFields({
        name,
        coverImage,
        coverPosition,
        customSections: JSON.stringify(customSections),
        openingDialogue,
        openingDialogues: JSON.stringify(openingDialogues),
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
        openingDialogues,
        activeOpeningDialogueId,
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
        openingDialogues: JSON.stringify(openingDialogues),
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
      const source = getRoleCardInputSource(body);
      const card = state.roleCards.find((item) => item.id === cardId);

      if (!card) {
        sendJson(res, 404, { error: "角色卡不存在" });
        return;
      }

      const hasSourceField = (field) => Object.prototype.hasOwnProperty.call(source, field);
      const hasOpeningDialogueField = hasSourceField("openingDialogue") || hasSourceField("first_mes");
      const hasOpeningDialoguesField = hasSourceField("openingDialogues") ||
        hasSourceField("opening_dialogues") ||
        hasSourceField("alternateGreetings") ||
        hasSourceField("alternate_greetings");
      const name = safeText(source.name);
      const mode = normalizeRoleCardMode(source.mode);
      const coverImage = safeText(source.coverImage || source.avatar);
      const coverPosition = normalizeCoverPosition(source.coverPosition);
      const customSections = normalizeRoleCardCustomSections(source.customSections, source);
      const fallbackOpeningDialogue = hasOpeningDialogueField
        ? safeText(source.openingDialogue || source.first_mes)
        : safeText(card.openingDialogue);
      const openingDialogues = hasOpeningDialoguesField || hasOpeningDialogueField
        ? normalizeRoleCardOpeningDialogues(
            source.openingDialogues || source.opening_dialogues || source.alternateGreetings || source.alternate_greetings,
            fallbackOpeningDialogue
          )
        : normalizeRoleCardOpeningDialogues(card.openingDialogues, card.openingDialogue);
      const activeOpeningDialogueId = safeText(source.activeOpeningDialogueId || source.active_opening_dialogue_id) ||
        card.activeOpeningDialogueId ||
        openingDialogues[0]?.id ||
        "";
      const openingDialogue = resolveActiveOpeningDialogue(openingDialogues, activeOpeningDialogueId, fallbackOpeningDialogue);
      const lorebooks = normalizeRoleCardLorebooks(getRoleCardLorebookInput(source));
      const corruptedFields = findRoleCardCorruptedFields({
        ...(hasSourceField("name") ? { name } : {}),
        ...(hasSourceField("coverImage") || hasSourceField("avatar") ? { coverImage } : {}),
        ...(hasSourceField("coverPosition") ? { coverPosition } : {}),
        ...(hasSourceField("customSections") ? { customSections: JSON.stringify(customSections) } : {}),
        ...(hasOpeningDialogueField ? { openingDialogue } : {}),
        ...(hasOpeningDialoguesField ? { openingDialogues: JSON.stringify(openingDialogues) } : {}),
        ...(hasSourceField("lorebooks") || hasSourceField("lorebook") || hasSourceField("characterBook") || hasSourceField("character_book")
          ? { lorebooks: JSON.stringify(lorebooks) }
          : {})
      });

      if (corruptedFields.length > 0) {
        sendJson(res, 400, {
          error: `偵測到疑似已損壞文字（${corruptedFields.join("、")}）包含「�」。請重新貼上原文後再保存。`
        });
        return;
      }
      if (hasSourceField("name")) {
        card.name = name;
      }
      if (hasSourceField("mode")) {
        card.mode = mode;
      }
      if (hasSourceField("coverImage") || hasSourceField("avatar")) {
        card.coverImage = coverImage;
      }
      if (hasSourceField("coverPosition")) {
        card.coverPosition = coverPosition;
      }
      if (hasSourceField("customSections")) {
        card.customSections = customSections;
        card.personality = getRoleCardCustomSectionValue({ customSections }, "性格");
        card.scene = getRoleCardCustomSectionValue({ customSections }, "場景");
        card.systemInstruction = getRoleCardCustomSectionValue({ customSections }, "系統指令");
        card.description = getRoleCardCustomSectionValue({ customSections }, "詳細描述");
        card.relationships = getRoleCardCustomSectionValue({ customSections }, "人物關係（純文字）");
      }
      if (hasOpeningDialogueField || hasOpeningDialoguesField || hasSourceField("activeOpeningDialogueId") || hasSourceField("active_opening_dialogue_id")) {
        card.openingDialogue = openingDialogue;
        card.openingDialogues = openingDialogues;
        card.activeOpeningDialogueId = activeOpeningDialogueId;
      }
      if (hasSourceField("lorebooks") || hasSourceField("lorebook") || hasSourceField("characterBook") || hasSourceField("character_book")) {
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
        openingDialogues: JSON.stringify(normalizeRoleCardOpeningDialogues(card.openingDialogues, card.openingDialogue)),
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
        const resolvedUserName = resolveUserDisplayName(state.userProfile, "");
        const openingDialogue = injectUserPlaceholder(card.openingDialogue, resolvedUserName, card.name);
        let openingMessage = null;
        state.pendingOpeningBroadcast = false;
        if (openingDialogue) {
          updateTimeTrackingFromText(state, openingDialogue, {
            allowBareTimeExpressions: true
          });
          openingMessage = createMessageRecord({
            role: "assistant",
            content: openingDialogue,
            source: "opening",
            extra: {
              roleCardId: card.id,
              platform: "web",
              stateAfterTurnSnapshot: captureNarrativeCheckpoint(state)
            }
          });
          appendConversationMessage(openingMessage);
        }

        saveState(state);
        return { openingMessage, state: statePayload(state), status: 200 };
      });

      if (result.error) {
        sendJson(res, result.status, { error: result.error });
        return;
      }

      sendJson(res, 200, { openingMessage: result.openingMessage, state: result.state });
      return;
    }

    const messageFeedbackMatch = pathname.match(/^\/api\/messages\/([^/]+)\/feedback$/);
    if (messageFeedbackMatch && method === "POST") {
      const body = await readBody(req);
      const result = applyAssistantFeedbackToConversation(state, {
        assistantMessageId: messageFeedbackMatch[1],
        feedback: body.feedback || body.type || body.value,
        source: "web"
      });
      if (!result.ok) {
        sendJson(res, result.status || 400, { error: result.error || "回饋標記失敗" });
        return;
      }
      sendJson(res, 200, {
        message: result.assistantMessage,
        userMessage: result.userMessage,
        feedback: result.feedback,
        pendingForNextUser: result.pendingForNextUser,
        cleared: Boolean(result.cleared),
        state: statePayload(state)
      });
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

    const messageReplayEditMatch = pathname.match(/^\/api\/messages\/([^/]+)\/replay-edit$/);
    if (messageReplayEditMatch && method === "POST") {
      const messageId = messageReplayEditMatch[1];
      const body = await readBody(req);
      const newContent = safeText(body.content);
      const targetIndex = state.conversation.findIndex((item) => item?.id === messageId);
      if (targetIndex < 0) {
        sendJson(res, 404, { error: "訊息不存在" });
        return;
      }
      const message = state.conversation[targetIndex];
      if (message?.role !== "user") {
        sendJson(res, 400, { error: "僅允許用這個方式編輯使用者訊息" });
        return;
      }
      if (!newContent) {
        sendJson(res, 400, { error: "內容不可空白" });
        return;
      }
      const result = await replayConversationFromMessageNumber({
        messageNumber: targetIndex + 1,
        content: newContent,
        source: "web",
        extra: {
          platform: "web",
          replayFromWebEdit: true,
          editedMessageId: messageId
        }
      });
      sendJson(res, 200, {
        ...result,
        backgroundImageGeneration: hasPendingModelImageGeneration(result.modelProcessingResult),
        state: statePayload(state)
      });
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
        sendJson(res, 400, { error: "尚未開始。請先在網頁選擇角色卡或啟用助手。" });
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
        backgroundImageGeneration: hasPendingModelImageGeneration(result.modelProcessingResult),
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

    if (pathname === "/api/chat/reload" && method === "POST") {
      const body = await readBody(req);
      const result = await rewriteRecentUserInput({
        num: body?.num,
        comment: body?.comment,
        source: "web",
        extra: {
          platform: "web"
        }
      });
      sendJson(res, 200, {
        ...result,
        backgroundImageGeneration: hasPendingModelImageGeneration(result.modelProcessingResult),
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/chat/send-stream" && method === "POST") {
      const body = await readBody(req);
      const content = safeText(body.content);
      if (!content) {
        sendJson(res, 400, { error: "輸入不可空白。" });
        return;
      }
      if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
        sendJson(res, 400, { error: "尚未開始。請先在網頁選擇角色卡或啟用助手。" });
        return;
      }

      beginNdjsonStream(res);
      writeNdjsonEvent(res, { type: "status", phase: "start" });
      try {
        const result = await runConversationTurnStreaming({
          content,
          source: "web",
          extra: {
            platform: "web"
          },
          onPhaseStatus: (phase) => writeNdjsonEvent(res, { type: "status", phase }),
          onReasoningDelta: (delta) => writeNdjsonEvent(res, { type: "reasoning_delta", delta }),
          onContentDelta: (delta) => writeNdjsonEvent(res, { type: "content_delta", delta })
        });
        writeNdjsonEvent(res, {
          type: "done",
          assistantMessage: result.assistantMessage,
          backgroundImageGeneration: hasPendingModelImageGeneration(result.modelProcessingResult),
          state: statePayload(state)
        });
      } catch (error) {
        writeNdjsonEvent(res, {
          type: "error",
          error: error.message || "伺服器錯誤"
        });
      } finally {
        res.end();
      }
      return;
    }

    if (method === "GET") {
      const relativePath = pathname === "/"
        ? "index.html"
        : pathname === "/NAI_storyboard" || pathname === "/NAI_storyboard/"
          ? "storyboard.html"
          : pathname.replace(/^\/+/, "");
      const normalizedPath = path.normalize(relativePath).replace(/^([.][.][/\\])+/, "");
      const basePath = path.resolve(PUBLIC_DIR);
      const filePath = path.resolve(basePath, normalizedPath);

      if (!filePath.startsWith(basePath)) {
        sendText(res, 403, "Forbidden");
        return;
      }

      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (!stat.isFile()) {
          sendJson(res, 404, { error: "Not Found" });
          return;
        }
        const headers = getStaticHeaders(filePath, stat);
        if (isStaticFileNotModified(req, headers, stat)) {
          res.writeHead(304, headers);
          res.end();
          return;
        }
        headers["Content-Length"] = String(stat.size);
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
        return;
      }
    }

    sendJson(res, 404, { error: "Not Found" });
  } catch (error) {
    sendJson(res, isGenerationStoppedError(error) ? 499 : 500, { error: error.message || "伺服器錯誤" });
  }
});

function extractDiscordInput(message) {
  const raw = safeText(message.content);
  const hasTextAttachment = hasSupportedDiscordTextAttachment(message.attachments);
  if (!raw && !hasTextAttachment) {
    return null;
  }

  if (!message.guildId) {
    return raw;
  }

  if (!raw && hasTextAttachment) {
    return isActiveDiscordAutoChatChannel(message) ? "" : null;
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
  const sentMessages = [];

  for (const chunk of chunks) {
    const content = chunk || " ";
    if (first) {
      const sent = await message.reply(content);
      if (sent) {
        sentMessages.push(sent);
      }
      first = false;
      continue;
    }
    const sent = await message.channel.send(content);
    if (sent) {
      sentMessages.push(sent);
    }
  }
  return sentMessages;
}

function getDiscordReplyMessageIds(record = {}) {
  const source = record && typeof record === "object" ? record : {};
  const value = source.discordReplyMessageIds || source.extra?.discordReplyMessageIds;
  return (Array.isArray(value) ? value : [])
    .map((item) => safeText(item))
    .filter(Boolean);
}

function rememberDiscordReplyMessageIds(assistantMessage = null, sentMessages = []) {
  if (!assistantMessage || assistantMessage.role !== "assistant") {
    return;
  }
  const ids = (Array.isArray(sentMessages) ? sentMessages : [])
    .map((item) => safeText(item?.id || item))
    .filter(Boolean);
  if (ids.length === 0) {
    return;
  }
  assistantMessage.discordReplyMessageIds = ids;
  assistantMessage.updatedAt = nowIso();
  const stored = state.conversation.find((item) => item?.id === assistantMessage.id);
  if (stored) {
    stored.discordReplyMessageIds = ids;
    stored.updatedAt = assistantMessage.updatedAt;
    saveState(state);
  }
}

async function addDiscordFeedbackReactions(sentMessages = []) {
  const uniqueMessages = Array.from(new Set(
    (Array.isArray(sentMessages) ? sentMessages : [])
      .filter(Boolean)
  ));
  for (const sentMessage of uniqueMessages) {
    for (const emoji of Object.values(ASSISTANT_FEEDBACK_EMOJIS)) {
      try {
        await sentMessage.react(emoji);
      } catch {
        // Missing reaction permissions should not block the正文 itself.
      }
    }
  }
}

async function rememberDiscordReplyAndFeedback(assistantMessage = null, sentMessages = []) {
  rememberDiscordReplyMessageIds(assistantMessage, sentMessages);
  await addDiscordFeedbackReactions(sentMessages);
}

async function applyDiscordReactionFeedback(reaction, user) {
  const feedback = normalizeAssistantFeedbackType(reaction?.emoji?.name || reaction?.emoji?.toString?.() || "");
  if (!feedback || user?.bot) {
    return null;
  }

  const discordMessageId = safeText(reaction?.message?.id);
  const assistantMessage = findAssistantMessageByDiscordReplyId(state, discordMessageId);
  if (!assistantMessage) {
    return null;
  }

  return applyAssistantFeedbackToConversation(state, {
    assistantMessageId: assistantMessage.id,
    feedback,
    source: "discord",
    userId: user?.id,
    userName: user?.username || user?.globalName || ""
  });
}

async function clearDiscordReactionFeedback(reaction, user) {
  const feedback = normalizeAssistantFeedbackType(reaction?.emoji?.name || reaction?.emoji?.toString?.() || "");
  if (!feedback || user?.bot) {
    return null;
  }

  const discordMessageId = safeText(reaction?.message?.id);
  const assistantMessage = findAssistantMessageByDiscordReplyId(state, discordMessageId);
  if (!assistantMessage || normalizeAssistantFeedbackType(assistantMessage.feedback) !== feedback) {
    return null;
  }
  const feedbackUserId = safeText(assistantMessage.feedbackUserId);
  if (feedbackUserId && feedbackUserId !== safeText(user?.id)) {
    return null;
  }

  return applyAssistantFeedbackToConversation(state, {
    assistantMessageId: assistantMessage.id,
    feedback: "clear",
    source: "discord",
    userId: user?.id,
    userName: user?.username || user?.globalName || ""
  });
}

async function deleteDiscordMessagesByIds(channel, messageIds = []) {
  const uniqueIds = Array.from(new Set((Array.isArray(messageIds) ? messageIds : []).map((id) => safeText(id)).filter(Boolean)));
  const deleted = [];
  for (const messageId of uniqueIds) {
    try {
      const target = await channel.messages.fetch(messageId);
      await target.delete();
      deleted.push(messageId);
    } catch {
      // Missing permissions, already-deleted messages, or old unknown messages should not block replay.
    }
  }
  return deleted;
}

function getDiscordUserAvatarUrl(user) {
  try {
    return safeText(user?.displayAvatarURL?.({ extension: "png", size: 128 }));
  } catch {
    return "";
  }
}

async function getInteractionFallbackChannel(interaction) {
  if (interaction?.channel && typeof interaction.channel.send === "function") {
    return interaction.channel;
  }
  const channelId = safeText(interaction?.channelId);
  if (!channelId || !activeDiscordClient) {
    return null;
  }
  try {
    const channel = await activeDiscordClient.channels.fetch(channelId);
    return channel && typeof channel.send === "function" ? channel : null;
  } catch {
    return null;
  }
}

function formatInteractionExpiryLog(interaction, fallbackSent = false) {
  const commandName = safeText(interaction?.commandName) || "unknown";
  const ageMs = Number(interaction?.createdTimestamp)
    ? Math.max(0, Date.now() - Number(interaction.createdTimestamp))
    : null;
  const ageText = Number.isFinite(ageMs) ? `，age=${Math.round(ageMs / 1000)}s` : "";
  return fallbackSent
    ? `Discord interaction 已過期，已改用頻道訊息補發。command=${commandName}${ageText}`
    : `Discord interaction 已過期，訊息無法送出。command=${commandName}${ageText}`;
}

async function sendInteractionChannelFallback(interaction, text) {
  const channel = await getInteractionFallbackChannel(interaction);
  if (!channel) {
    return [];
  }
  const sentMessages = [];
  const chunks = splitForDiscord(text, 1800);
  for (const chunk of chunks) {
    const sent = await channel.send(chunk || " ");
    if (sent) {
      sentMessages.push(sent);
    }
  }
  return sentMessages;
}

async function sendInteractionLongReply(interaction, text) {
  const chunks = splitForDiscord(text, 1800);
  const sentMessages = [];
  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const firstMessage = interaction.replied
      ? await interaction.followUp(chunks[0] || " ")
      : await interaction.editReply(chunks[0] || " ");
    if (firstMessage) {
      sentMessages.push(firstMessage);
    }
    for (let i = 1; i < chunks.length; i += 1) {
      const sent = await interaction.followUp(chunks[i] || " ");
      if (sent) {
        sentMessages.push(sent);
      }
    }
    return sentMessages;
  } catch (error) {
    if (!isUnknownInteractionError(error)) {
      throw error;
    }
    const remainingText = chunks.slice(sentMessages.length).join("\n");
    const fallbackMessages = await sendInteractionChannelFallback(interaction, remainingText || text);
    console.warn(formatInteractionExpiryLog(interaction, fallbackMessages.length > 0));
    return [...sentMessages, ...fallbackMessages];
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
  return ["ai_start", "reload", "quick_send"].includes(safeText(commandName));
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
      if (!ephemeral) {
        const fallbackMessages = await sendInteractionChannelFallback(interaction, content);
        console.warn(formatInteractionExpiryLog(interaction, fallbackMessages.length > 0));
        return;
      }
      console.warn(formatInteractionExpiryLog(interaction));
      return;
    }
    throw error;
  }
}

async function discardDeferredInteractionReply(interaction) {
  if ((!interaction?.deferred && !interaction?.replied) || typeof interaction.deleteReply !== "function") {
    return;
  }
  try {
    await interaction.deleteReply();
  } catch (error) {
    const code = String(error?.code || error?.rawError?.code || "");
    if (!isUnknownInteractionError(error) && code !== "10008" && code !== "10062") {
      throw error;
    }
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
    const openingDialogue = injectUserPlaceholder(card.openingDialogue, resolvedUserName, card.name);
    state.pendingOpeningBroadcast = false;
    state.lastDiscordChannelId = channelId;
    if (!safeText(state.discordPlayers?.channelId)) {
      resetDiscordPlayerAssignments(state, channelId);
    }
    updateTimeTrackingFromText(state, openingDialogue, {
      allowBareTimeExpressions: true
    });
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
    if (!card && !hasActiveAssistantTarget(state)) {
      return {
        ok: false,
        error: "尚未選擇角色卡或助手模式。請先到網頁建立角色卡，或啟用助手。"
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
    if (hasActiveAssistantTarget(state)) {
      saveState(state);
      return {
        ok: true,
        openingDialogue: `${getActiveAssistantName(state)} 已啟用，請直接輸入你的需求。`,
        roleCardName: getActiveAssistantName(state)
      };
    }

    const resolvedUserName = resolveUserDisplayName(state.userProfile, userInfo.userName);
    const openingDialogue = injectUserPlaceholder(card.openingDialogue, resolvedUserName, card.name);
    updateTimeTrackingFromText(state, openingDialogue, {
      allowBareTimeExpressions: true
    });
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

function buildDiscordStatusText() {
  const activeConfig = getActiveModularPromptConfig(state);
  const playerState = normalizeDiscordPlayerState(state.discordPlayers);
  const playerLines = Object.entries(playerState.assignments)
    .map(([userId, slot]) => `${slot}: <@${userId}>`);
  const lines = [
    `Discord連線: ${discordConnected ? "已連線" : "未連線"}`,
    "主對話: /ai_start 後，該頻道可直接輸入對話",
    "玩家座位: /player_set number:2",
    `AI狀態: ${state.aiSessionStarted ? "已開始" : "未開始"}`,
    `生成狀態: ${isActiveGenerationRunning() ? "生成中，可用 /stop 停止" : "閒置"}`,
    `自動對話頻道: ${state.lastDiscordChannelId ? `<#${state.lastDiscordChannelId}>` : "未指定"}`,
    `對話設定: 正式模式（API輸出模型=${getChatApiModel("reasoner_history_chat")}｜目前模式上下文=${normalizeDialogueContextRounds(activeConfig?.dialogueContextRounds)} 輪｜模型內容=${isContextCompressionEnabled(state) ? "啟用" : "停用"}）`,
    `目前模式: ${getCurrentConversationTargetLabel(state)}`,
    `待播開場: ${state.pendingOpeningBroadcast ? "是" : "否"}`,
    `玩家分配: ${playerLines.length > 0 ? playerLines.join("｜") : "尚未分配"}`
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
  userAvatarUrl = "",
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
        discordUserAvatarUrl: userAvatarUrl,
        discordMessageId
      }
    });

    return {
      pendingOpening,
      replyText: formatAssistantMessageForUserDisplay(result.assistantMessage),
      assistantMessage: result.assistantMessage
    };
  } finally {
    stopTyping();
  }
}

async function handleDiscordChat(message, userContent) {
  if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
    await message.reply("尚未開始。請先在網頁選擇角色卡或啟用助手，再使用對話。");
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
    userAvatarUrl: getDiscordUserAvatarUrl(message.author),
    discordMessageId: message.id,
    userContent: finalUserContent
  });

  const pendingOpening = turn.pendingOpening;
  if (pendingOpening) {
    await sendDiscordLongMessage(message, pendingOpening);
  }
  if (turn.replyText) {
    const sentMessages = await sendDiscordLongMessage(message, turn.replyText);
    await rememberDiscordReplyAndFeedback(turn.assistantMessage, sentMessages);
  }
}

async function registerSlashCommands(discordClient) {
  const app = discordClient.application;
  if (!app) {
    return;
  }

  try {
    await app.commands.set(DISCORD_GLOBAL_SLASH_COMMANDS);
    console.log("Slash 指令已註冊到全域應用程式");
  } catch (error) {
    console.error("全域 Slash 指令註冊失敗：", error);
  }

  const guildIds = new Set(
    Array.from(discordClient.guilds.cache.keys())
      .map((guildId) => safeText(guildId))
      .filter(Boolean)
  );
  const configuredGuildId = safeText(DISCORD_GUILD_ID);
  const clientId = getDiscordClientId();
  if (configuredGuildId && clientId && configuredGuildId === clientId) {
    console.warn(`已略過 guild Slash 指令註冊：DISCORD_GUILD_ID=${configuredGuildId} 看起來是 Bot Client ID，不是伺服器 ID。`);
  } else if (configuredGuildId) {
    guildIds.add(configuredGuildId);
  }

  let registeredGuilds = 0;
  for (const guildId of guildIds) {
    try {
      const guild = discordClient.guilds.cache.get(guildId) || await discordClient.guilds.fetch(guildId);
      await guild.commands.set(DISCORD_SLASH_COMMANDS);
      registeredGuilds += 1;
    } catch (error) {
      if (error?.code === 10004) {
        console.warn(`已略過 guild Slash 指令註冊：找不到 guild ${guildId}，請確認 Bot 已加入該伺服器。`);
        continue;
      }
      console.error(`Guild Slash 指令註冊失敗（${guildId}）：`, error);
    }
  }

  if (guildIds.size > 0) {
    console.log(`Slash 指令已即時同步到 ${registeredGuilds}/${guildIds.size} 個 Discord 伺服器`);
  }
}

const recentDiscordUserInstallEvents = new Map();

function rememberDiscordUserInstallEvent({ userId, eventTimestamp }) {
  const now = Date.now();
  for (const [key, recordedAt] of recentDiscordUserInstallEvents) {
    if (now - recordedAt > 24 * 60 * 60 * 1000) {
      recentDiscordUserInstallEvents.delete(key);
    }
  }
  const key = `${userId}:${eventTimestamp || "unknown"}`;
  if (recentDiscordUserInstallEvents.has(key)) {
    return false;
  }
  recentDiscordUserInstallEvents.set(key, now);
  return true;
}

async function discordBotApiRequest(pathname, options = {}) {
  const response = await fetch(`https://discord.com/api/v10${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(data?.message || `Discord API ${response.status}`);
  }
  return data;
}

async function sendDiscordUserInstallWelcome(authorization) {
  if (!DISCORD_BOT_TOKEN || !rememberDiscordUserInstallEvent(authorization)) {
    return;
  }
  const dmChannel = await discordBotApiRequest("/users/@me/channels", {
    method: "POST",
    body: JSON.stringify({ recipient_id: authorization.userId })
  });
  if (!dmChannel?.id) {
    throw new Error("Discord 未回傳私人頻道 ID。");
  }
  await discordBotApiRequest(`/channels/${dmChannel.id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: DISCORD_USER_INSTALL_WELCOME_MESSAGE })
  });
}

function canSendDiscordGuildWelcome(channel, member) {
  if (
    !channel ||
    !member ||
    ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type) ||
    typeof channel.send !== "function"
  ) {
    return false;
  }
  const permissions = channel.permissionsFor(member);
  return Boolean(
    permissions?.has(PermissionFlagsBits.ViewChannel) &&
    permissions.has(PermissionFlagsBits.SendMessages)
  );
}

async function findDiscordGuildWelcomeChannel(guild) {
  const member = guild.members.me || await guild.members.fetchMe();
  if (canSendDiscordGuildWelcome(guild.systemChannel, member)) {
    return guild.systemChannel;
  }
  const channels = await guild.channels.fetch();
  return Array.from(channels.values())
    .filter((channel) => canSendDiscordGuildWelcome(channel, member))
    .sort((left, right) => (left.rawPosition || 0) - (right.rawPosition || 0))[0] || null;
}

async function welcomeNewDiscordGuild(guild) {
  try {
    await guild.commands.set(DISCORD_SLASH_COMMANDS);
  } catch (error) {
    console.warn(`新 Discord 伺服器 Slash 指令同步失敗（${guild.id}）：${error.message || error}`);
  }

  const channel = await findDiscordGuildWelcomeChannel(guild);
  if (!channel) {
    console.warn(`Discord Bot 已加入伺服器 ${guild.id}，但找不到可發送歡迎訊息的文字頻道。`);
    return;
  }
  await channel.send(buildDiscordGuildWelcomeMessage(getDiscordClientId()));
}

async function handleSlashCommand(interaction) {
  const name = interaction.commandName;

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
    const num = interaction.options.getInteger("num");
    const comment = safeText(interaction.options.getString("comment") || "");
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡或啟用助手，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const result = await rewriteRecentUserInput({
      num,
      comment,
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: interaction.channelId,
        discordGuildId: interaction.guildId,
        discordUserId: interaction.user.id,
        discordUserName: interaction.user.username
      }
    });
    await deleteDiscordMessagesByIds(interaction.channel, result.removedDiscordReplyMessageIds || []);
    const replyText = formatAssistantMessageForUserDisplay(result.assistantMessage);
    if (replyText) {
      const sentMessages = await sendInteractionLongReply(interaction, replyText);
      await rememberDiscordReplyAndFeedback(result.assistantMessage, sentMessages);
    } else {
      await discardDeferredInteractionReply(interaction);
    }
    return;
  }

  if (name === "quick_send") {
    const templateId = interaction.options.getString("template") || "";
    const inside = interaction.options.getString("inside") || "";
    const message = interaction.options.getString("message") || "";
    const built = buildQuickSendContent(templateId, inside, message);
    if (!built.ok) {
      await safeSendInteractionText(interaction, built.error, { ephemeral: true });
      return;
    }
    if (!state.aiSessionStarted || !hasActiveConversationTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未開始。請先在網頁選擇角色卡或啟用助手，或使用 /ai_start。",
        { ephemeral: true }
      );
      return;
    }

    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferReply();
    }
    const turn = await processDiscordChatTurn({
      channel: interaction.channel,
      channelId: interaction.channelId,
      guildId: interaction.guildId,
      userId: interaction.user.id,
      userName: interaction.user.username,
      userContent: built.content
    });
    const combinedReply = [turn.pendingOpening, turn.replyText].filter(Boolean).join("\n\n");
    if (combinedReply) {
      const sentMessages = await sendInteractionLongReply(interaction, combinedReply);
      await rememberDiscordReplyAndFeedback(turn.assistantMessage, sentMessages);
    } else {
      await discardDeferredInteractionReply(interaction);
    }
    return;
  }

  if (name === "ai_start") {
    if (!getActiveRoleCard(state) && !hasActiveAssistantTarget(state)) {
      await safeSendInteractionText(
        interaction,
        "尚未選擇角色卡或助手模式。請先在網頁啟用角色卡或助手。",
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

}

function getDiscordErrorCodes(error) {
  return [
    error?.code,
    error?.cause?.code,
    error?.rawError?.code,
    error?.status,
    error?.statusCode,
    error?.rawError?.status
  ].filter((value) => value !== undefined && value !== null && value !== "").map((value) => String(value));
}

function getDiscordErrorText(error) {
  return [
    error?.name,
    error?.message,
    error?.cause?.name,
    error?.cause?.message,
    error?.rawError?.message
  ].filter(Boolean).join(" ");
}

function isRetryableDiscordLoginError(error) {
  const codes = getDiscordErrorCodes(error);
  const text = getDiscordErrorText(error);
  if (
    codes.some((code) => /^(401|403|TokenInvalid|DISALLOWED_INTENTS)$/iu.test(code)) ||
    /invalid token|unauthori[sz]ed|forbidden|disallowed intents|privileged intent/iu.test(text)
  ) {
    return false;
  }

  const status = Number(error?.status ?? error?.statusCode ?? error?.rawError?.status);
  if (Number.isFinite(status) && status >= 500) {
    return true;
  }

  return codes.some((code) =>
    /^(UND_ERR_|ETIMEDOUT|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|EHOSTUNREACH|ENETUNREACH)/iu.test(code)
  ) || /timeout|timed out|network|fetch failed|socket|temporarily unavailable|aborted/iu.test(text);
}

function getDiscordLoginRetryDelayMs(attempt) {
  const initial = Number.isFinite(DISCORD_LOGIN_RETRY_INITIAL_MS) && DISCORD_LOGIN_RETRY_INITIAL_MS > 0
    ? DISCORD_LOGIN_RETRY_INITIAL_MS
    : 15_000;
  const max = Number.isFinite(DISCORD_LOGIN_RETRY_MAX_MS) && DISCORD_LOGIN_RETRY_MAX_MS > 0
    ? Math.max(initial, DISCORD_LOGIN_RETRY_MAX_MS)
    : 300_000;
  const exponent = Math.max(0, Math.min(Math.floor(Number(attempt || 1)) - 1, 8));
  return Math.min(max, initial * (2 ** exponent));
}

function formatDiscordRetryDelay(ms) {
  const seconds = Math.max(1, Math.round(Number(ms || 0) / 1000));
  if (seconds < 60) {
    return `${seconds} 秒`;
  }
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return restSeconds ? `${minutes} 分 ${restSeconds} 秒` : `${minutes} 分鐘`;
}

function startDiscordLoginWithRetry(discordClient) {
  let attempt = 0;
  const maxAttempts = Math.max(0, Math.floor(Number(DISCORD_LOGIN_RETRY_MAX_ATTEMPTS || 0)));

  const login = async () => {
    if (activeDiscordClient !== discordClient || discordClient.isReady?.()) {
      return;
    }
    attempt += 1;
    try {
      await discordClient.login(DISCORD_BOT_TOKEN);
    } catch (error) {
      discordConnected = false;
      const retryable = isRetryableDiscordLoginError(error);
      const reachedAttemptLimit = maxAttempts > 0 && attempt >= maxAttempts;
      console.error(`Discord bot 登入失敗（第 ${attempt} 次）：`, error);
      if (!retryable) {
        console.error("Discord bot 登入錯誤看起來不是暫時性網路問題，已停止自動重試。請檢查 Bot Token、Intents 或權限設定。");
        return;
      }
      if (reachedAttemptLimit) {
        console.error(`Discord bot 登入重試已達上限 ${maxAttempts} 次，已停止自動重試。`);
        return;
      }

      const delayMs = getDiscordLoginRetryDelayMs(attempt);
      console.warn(`Discord bot 會在 ${formatDiscordRetryDelay(delayMs)} 後重試登入。`);
      clearDiscordLoginRetryTimer();
      discordLoginRetryTimer = setTimeout(login, delayMs);
      discordLoginRetryTimer.unref?.();
    }
  };

  void login();
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
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageReactions
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User]
  });
  activeDiscordClient = discordClient;

  discordClient.on("clientReady", async () => {
    clearDiscordLoginRetryTimer();
    try {
      await discordClient.application?.fetch();
    } catch (error) {
      console.warn(`Discord 應用程式資料讀取失敗，Webhook 可能需要 DISCORD_PUBLIC_KEY 備援：${error.message || error}`);
    }
    discordConnected = true;
    console.log(`Discord bot 已上線：${discordClient.user?.tag || "unknown"}`);
    void registerSlashCommands(discordClient);
  });

  discordClient.on("guildCreate", (guild) => {
    void welcomeNewDiscordGuild(guild).catch((error) => {
      console.warn(`Discord 新伺服器歡迎訊息發送失敗（${guild.id}）：${error.message || error}`);
    });
  });

  discordClient.on("messageCreate", async (message) => {
    if (message.author.bot) {
      return;
    }

    if (isLegacyDiscordTextCommand(message.content)) {
      await message.reply(LEGACY_DISCORD_TEXT_COMMAND_NOTICE);
      return;
    }

    const extractedInput = extractDiscordInput(message);
    if (extractedInput === null) {
      return;
    }

    try {
      await handleDiscordChat(message, extractedInput);
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

    if (isLegacyDiscordTextCommand(message.content)) {
      return;
    }

    const extractedInput = extractDiscordInput(message);
    if (extractedInput === null || !extractedInput) {
      return;
    }

    try {
      const stopTyping = startTypingIndicator(message.channel);
      try {
        const result = await replayConversationFromDiscordMessageId({
          discordMessageId: message.id,
          content: extractedInput,
          source: "discord",
          extra: {
            platform: "discord",
            discordChannelId: message.channelId,
            discordGuildId: message.guildId,
            discordUserId: message.author.id,
            discordUserName: message.author.username,
            discordUserAvatarUrl: getDiscordUserAvatarUrl(message.author)
          }
        });

        await deleteDiscordMessagesByIds(message.channel, result.removedDiscordReplyMessageIds || []);
        if (!result.assistantMessage) {
          return;
        }
        const sentMessages = await sendDiscordLongMessage(
          message,
          [
            [
              "```",
              "已依照你編輯後的訊息，從該則對話重新開始。",
              "```"
            ].filter(Boolean).join("\n"),
            formatAssistantMessageForUserDisplay(result.assistantMessage)
          ].filter(Boolean).join("\n\n")
        );
        await rememberDiscordReplyAndFeedback(result.assistantMessage, sentMessages);
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

  discordClient.on("messageReactionAdd", async (reaction, user) => {
    try {
      const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
      const fullUser = user?.partial ? await user.fetch() : user;
      if (fullUser?.bot) {
        return;
      }
      await applyDiscordReactionFeedback(fullReaction, fullUser);
    } catch (error) {
      console.warn(`Discord 回饋反應處理失敗：${error.message || error}`);
    }
  });

  discordClient.on("messageReactionRemove", async (reaction, user) => {
    try {
      const fullReaction = reaction.partial ? await reaction.fetch() : reaction;
      const fullUser = user?.partial ? await user.fetch() : user;
      if (fullUser?.bot) {
        return;
      }
      await clearDiscordReactionFeedback(fullReaction, fullUser);
    } catch (error) {
      console.warn(`Discord 回饋反應取消處理失敗：${error.message || error}`);
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

  startDiscordLoginWithRetry(discordClient);
}

server.listen(PORT, () => {
  const localUrl = `http://localhost:${PORT}`;
  const networkUrls = getLocalNetworkUrls(PORT);
  const lines = [
    "Server running:",
    `- Local: ${localUrl}`,
    ...networkUrls.map((url) => `- IP: ${url}`)
  ];
  console.log(lines.join("\n"));
  setupDiscordBot();
});
