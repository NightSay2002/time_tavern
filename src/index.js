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
const DEFAULT_DEEPSEEK_MODEL = "deepseek-reasoner";
const DEEPSEEK_REASONER_MODEL = "deepseek-reasoner";
const DEEPSEEK_CHAT_MODEL = "deepseek-chat";
const DEEPSEEK_V4_FLASH_MODEL = "deepseek-v4-flash";
const DEEPSEEK_V4_PRO_MODEL = "deepseek-v4-pro";
const DEFAULT_MIN_REPLY_CHARS = 600;
const DEEPSEEK_LENGTH_RETRY_LIMIT = 1;
const DEEPSEEK_TEMPERATURE = 0.5;
const CHARACTER_CARD_CREATION_ASSISTANT_TEMPERATURE = 0.9;
const DEEPSEEK_REQUEST_TIMEOUT_MS = envNumber("DEEPSEEK_REQUEST_TIMEOUT_MS", 600000);
const DEFAULT_DIALOGUE_CONTEXT_ROUNDS = 20;
const CHARACTER_CARD_CREATION_ASSISTANT_MODE = "CharacterCardCreationAssistant";
const DISCORD_TEXT_ATTACHMENT_MAX_BYTES = envNumber("DISCORD_TEXT_ATTACHMENT_MAX_BYTES", 1024 * 1024);

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
const COMPRESSION_USER_NOTICE_TEXT = "【( •̀ ω •́ )✧你已經歷了一次壓縮】";
let contextCompressionPrompt = envTextOrFile(
  "CONTEXT_COMPRESSION_PROMPT",
  "你是長篇角色互動的上下文壓縮器。請輸出可供後續正文模型承接的精簡上下文。",
  {
    defaultFilePath: CONTEXT_COMPRESSION_PROMPT_FILE
  }
);

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
    updatedAt: ""
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
      chatOutputModel: DEEPSEEK_REASONER_MODEL,
      dialogueContextRounds: DEFAULT_DIALOGUE_CONTEXT_ROUNDS
    },
    contextCompression: createDefaultContextCompressionState(),
    aiSessionStarted: false,
    pendingOpeningBroadcast: false,
    lastDiscordChannelId: "",
    turnState: createDefaultTurnState(),
    conversation: [],
    aiLogs: [],
    savedSessions: [],
    activeSavedSessionId: null,
    updatedAt: nowIso()
  };
}

function normalizeDeepSeekModelOption(value, fallback = DEEPSEEK_REASONER_MODEL) {
  const normalized = safeText(value).toLowerCase();
  if (normalized === DEEPSEEK_CHAT_MODEL) {
    return DEEPSEEK_CHAT_MODEL;
  }
  if (normalized === DEEPSEEK_REASONER_MODEL) {
    return DEEPSEEK_REASONER_MODEL;
  }
  if (normalized === DEEPSEEK_V4_FLASH_MODEL) {
    return DEEPSEEK_V4_FLASH_MODEL;
  }
  if (normalized === DEEPSEEK_V4_PRO_MODEL) {
    return DEEPSEEK_V4_PRO_MODEL;
  }
  return fallback;
}

function normalizeConversationSettings(input) {
  const source = input && typeof input === "object" ? input : {};
  const dialogueContextRounds = Number(source.dialogueContextRounds);
  return {
    chatOutputModel: normalizeDeepSeekModelOption(source.chatOutputModel, DEEPSEEK_REASONER_MODEL),
    dialogueContextRounds:
      Number.isFinite(dialogueContextRounds) && dialogueContextRounds > 0
        ? Math.floor(dialogueContextRounds)
        : DEFAULT_DIALOGUE_CONTEXT_ROUNDS
  };
}

function normalizeContextCompressionState(input) {
  const source = input && typeof input === "object" ? input : {};
  const compressedThroughTurnNumber = Number(source.compressedThroughTurnNumber);
  return {
    enabled: true,
    summary: safeText(source.summary),
    compressedThroughTurnNumber:
      Number.isFinite(compressedThroughTurnNumber) && compressedThroughTurnNumber > 0
        ? Math.floor(compressedThroughTurnNumber)
        : 0,
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

function resetConversationProgress(currentState) {
  if (!currentState || typeof currentState !== "object") {
    return;
  }
  currentState.conversation = [];
  currentState.turnState = createDefaultTurnState();
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
      aiSessionStarted: Boolean(parsed.aiSessionStarted),
      pendingOpeningBroadcast: Boolean(parsed.pendingOpeningBroadcast),
      lastDiscordChannelId: safeText(parsed.lastDiscordChannelId),
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
    aiSessionStarted: Boolean(currentState.aiSessionStarted),
    pendingOpeningBroadcast: Boolean(currentState.pendingOpeningBroadcast),
    lastDiscordChannelId: safeText(currentState.lastDiscordChannelId),
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
  if (!currentState.roleCards.some((card) => card.id === currentState.activeRoleCardId)) {
    currentState.activeRoleCardId = null;
  }
  currentState.aiSessionStarted = Boolean(source.aiSessionStarted);
  currentState.pendingOpeningBroadcast = Boolean(source.pendingOpeningBroadcast);
  currentState.lastDiscordChannelId = safeText(source.lastDiscordChannelId);
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

function createDefaultModularPromptConfig(mode = "single") {
  const normalizedMode = normalizeRoleCardMode(mode);
  return {
    version: 2,
    mode: normalizedMode,
    name: getDefaultModularPromptModeName(normalizedMode),
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
      contextRules: "承接角色卡、壓縮內容、最近對話與世界書；結尾停在可供 {{user}} 回應或行動的節點。"
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

function normalizeContextCompressionPromptConfig(input = {}, fallbackPrompt = "") {
  const source = input && typeof input === "object" ? input : {};
  const legacyPrompt = safeText(
    typeof input === "string"
      ? input
      : source.mainRules || source.prompt || source.contextCompressionPrompt || fallbackPrompt
  );
  const rawModels = Array.isArray(source.models)
    ? source.models
    : Array.isArray(source.modules)
      ? source.modules
      : [];
  const models = rawModels
    .map((item, index) => normalizeCompressionModelConfig(item, index))
    .filter((item) => item.id);
  return {
    mainRules: legacyPrompt || getContextCompressionPrompt(),
    models: models.length > 0
      ? models
      : createDefaultModularPromptConfig().contextCompression.models
  };
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
  return {
    version: 2,
    mode: normalizedMode,
    name: safeText(source.name || source.title || source.displayName) || defaults.name,
    contextCompression,
    contextCompressionPrompt: contextCompression.mainRules,
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
  if (storedModelContent.includes("【觸發世界書 Lorebooks】") || storedModelContent.includes("【使用者自訂補充】")) {
    return storedModelContent;
  }
  return appendUserIdentityTextToContent(
    appendTriggeredLorebooksToUserContent(getUserBaseModelContent(message), currentState, runtimeUserName),
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
  message.baseModelContent = baseModelContent;
  message.lorebookTriggeredEntryIds = triggeredLorebooks
    .map((entry) => getLorebookEntryIdentity(entry))
    .filter(Boolean);
  message.modelContent = appendUserIdentityTextToContent(
    [baseModelContent, formatLorebookEntriesForPrompt(triggeredLorebooks)].filter(Boolean).join("\n\n"),
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
  // number. Otherwise "補開場對話" makes DEEPSEEK_DIALOGUE_CONTEXT_ROUNDS=1 look
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
  if (currentState?.conversationSettings) {
    return normalizeConversationSettings(currentState.conversationSettings).dialogueContextRounds;
  }
  return envNumber("DEEPSEEK_DIALOGUE_CONTEXT_ROUNDS", DEFAULT_DIALOGUE_CONTEXT_ROUNDS);
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
    "【目前壓縮內容】",
    safeText(currentSummary) || "無"
  ].join("\n");
}

function buildContextCompressionInstructionPrompt(currentState = state, config = null) {
  const activeConfig = config || getActiveModularPromptConfig(currentState);
  const compressionConfig = normalizeContextCompressionPromptConfig(
    activeConfig.contextCompression || activeConfig.contextCompressionPrompt,
    activeConfig.contextCompressionPrompt || getContextCompressionPrompt()
  );
  const modelRules = compressionConfig.models.map((model, index) => [
    `【模型 ${index + 1}: ${model.name || model.id}】`,
    `id:${model.id}`,
    "新增模型規則:",
    model.addRules || "無",
    "刪除模型規則:",
    model.deleteRules || "無",
    `輸出欄位:model.${model.id}`,
    `刪除欄位:delete.${model.id}`
  ].join("\n")).join("\n\n");
  const outputShape = {
    model: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []])),
    delete: Object.fromEntries(compressionConfig.models.map((model) => [model.id, []]))
  };
  return [
    "【主要規則】",
    compressionConfig.mainRules || getContextCompressionPrompt(),
    "【模型規則】",
    modelRules,
    "【輸出規則】",
    "只能輸出一個合法 JSON 物件，禁止輸出 JSON 以外的任何文字。",
    "所有模型欄位都必須存在；沒有新增或刪除內容時輸出空陣列。",
    "model.<id> 只放本次需要新增保存的內容；delete.<id> 只放已失效、已完成、被新版取代或重複的舊內容。",
    "不可把本次剛新增到 model.<id> 的內容又放進 delete.<id>。",
    "後端會把 model.<id> 追加到既有壓縮內容，不會整體覆蓋；請避免重複輸出既有內容。",
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
  const compressionConfig = normalizeContextCompressionPromptConfig(config);
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
  const current = normalizeCompressionJsonState(currentSummary, config);
  const incoming = normalizeCompressionJsonState(completionText, config);
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

function didContextCompressionAdvance(before, after) {
  const previous = normalizeContextCompressionState(before);
  const current = normalizeContextCompressionState(after);
  return current.compressedThroughTurnNumber > previous.compressedThroughTurnNumber;
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

async function ensureContextCompressionSummary(currentState, runtimeUserName = "", options = {}) {
  if (!isContextCompressionEnabled(currentState)) {
    return normalizeContextCompressionState(currentState.contextCompression);
  }
  const latestUser = getLatestUserMessage(currentState);
  if (!latestUser) {
    currentState.contextCompression = normalizeContextCompressionState(currentState.contextCompression);
    return currentState.contextCompression;
  }

  const contextLimit = Math.max(1, getDialogueContextRounds(currentState));
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  const rounds = getCompletedDialogueRoundsBeforeLatestUser(currentState, latestUser.id);
  const uncompressedRounds = rounds.filter((round) => getRoundTurnNumber(round) > compressionState.compressedThroughTurnNumber);
  if (uncompressedRounds.length < contextLimit) {
    currentState.contextCompression = compressionState;
    return compressionState;
  }

  const messagesToCompress = uncompressedRounds.flat();
  const openingDialogueMessage = compressionState.compressedThroughTurnNumber <= 0
    ? getOpeningDialogueContextMessage(currentState, runtimeUserName)
    : null;
  if (openingDialogueMessage && !messageListHasSameContent(messagesToCompress, openingDialogueMessage.content)) {
    messagesToCompress.unshift(openingDialogueMessage);
  }
  const compressedThroughTurnNumber = getRoundTurnNumber(uncompressedRounds[uncompressedRounds.length - 1]) ||
    compressionState.compressedThroughTurnNumber;
  const activeCompressionConfig = normalizeContextCompressionPromptConfig(
    getActiveModularPromptConfig(currentState).contextCompression ||
      getActiveModularPromptConfig(currentState).contextCompressionPrompt,
    getContextCompressionPrompt()
  );
  options.onStatus?.("compression");
  const completion = await callDeepSeekCompletionRaw({
    messages: [
      {
        role: "user",
        content: ["【壓縮規則】", buildContextCompressionInstructionPrompt(currentState)].join("\n")
      },
      {
        role: "user",
        content: formatCompressionContextBlock(messagesToCompress)
      },
      {
        role: "user",
        content: buildCurrentCompressionContentMessage(compressionState.summary)
      }
    ],
    purpose: "context_compression"
  });

  currentState.contextCompression = {
    enabled: true,
    summary: mergeCompressionSummary(compressionState.summary, completion.content, activeCompressionConfig),
    compressedThroughTurnNumber,
    updatedAt: nowIso()
  };
  saveState(currentState);
  return currentState.contextCompression;
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
    "後續獨立 user message 會提供目前壓縮內容；最近對話會以獨立 user/assistant messages 提供。本輪 user message 會按順序包含：這一輪 user 的內容、觸發世界書 Lorebooks、自訂補充。請根據主要規則、角色卡、目前壓縮內容、最近對話與輸出規則輸出正文。"
  ].filter(Boolean).join("\n");
}

function buildSimpleCompressedReasonerCompressionMessage(currentState) {
  const compressionState = normalizeContextCompressionState(currentState.contextCompression);
  if (!compressionState.summary) {
    return "";
  }
  return [
    "【目前壓縮內容】",
    formatCompressionSummaryForReasoner(compressionState.summary, currentState),
    "【壓縮規則】",
    "這是更早之前的壓縮上下文，只用於補足背景、角色關係、已成立事件與未完成事項。",
    "正文承接時優先依照最近對話與本輪輸入；若最近對話與目前壓縮內容衝突，以最近對話為準。"
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

function getDeepSeekModel(purpose = "chat") {
  const settings = normalizeConversationSettings(state?.conversationSettings);
  if (
    purpose === "reasoner_history_chat" ||
    purpose === "context_compression" ||
    purpose === "chat_expand" ||
    purpose === "character_card_creation_assistant_chat"
  ) {
    return settings.chatOutputModel;
  }
  return DEFAULT_DEEPSEEK_MODEL;
}

function getDeepSeekApiKey(purpose = "chat") {
  if (purpose === "context_compression") {
    return safeText(process.env.deepseek_key2) ||
      safeText(process.env.DEEPSEEK_KEY2) ||
      safeText(process.env.DEEPSEEK_API_KEY2) ||
      safeText(process.env.DEEPSEEK_API_KEY);
  }
  return safeText(process.env.DEEPSEEK_API_KEY);
}

function getDeepSeekTemperature(purpose = "chat", temperature = null) {
  if (purpose === "character_card_creation_assistant_chat") {
    return CHARACTER_CARD_CREATION_ASSISTANT_TEMPERATURE;
  }
  if (Number.isFinite(temperature)) {
    return temperature;
  }
  return DEEPSEEK_TEMPERATURE;
}

function getDeepSeekMaxTokensCap(model = "") {
  const normalizedModel = safeText(model).toLowerCase();
  if (normalizedModel === "deepseek-chat") {
    return 8192;
  }
  return 64000;
}

function shouldRetryDeepSeekLength(purpose = "chat") {
  return (
    purpose === "reasoner_history_chat" ||
    purpose === "chat_expand" ||
    purpose === "character_card_creation_assistant_chat"
  );
}

function buildDeepSeekLengthRetryMessages(messages, partialContent = "") {
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

function resolveDeepSeekMaxTokens({ purpose = "reasoner_history_chat", maxTokens, model = "" } = {}) {
  const resolvedModel = safeText(model) || getDeepSeekModel(purpose);
  const modelCap = getDeepSeekMaxTokensCap(resolvedModel);

  if (Number.isFinite(maxTokens) && maxTokens > 0) {
    return Math.min(Math.floor(maxTokens), modelCap);
  }

  const envMaxTokens = Number(process.env.DEEPSEEK_MAX_TOKENS || "");
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

function extractDeepSeekMessageText(content) {
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

function createTimeoutController(timeoutMs = DEEPSEEK_REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Math.max(1000, timeoutMs));
  return { controller, timeout };
}

function formatFetchErrorMessage(error) {
  if (error?.name === "AbortError") {
    return `請求逾時（${Math.round(DEEPSEEK_REQUEST_TIMEOUT_MS / 1000)}秒未回應）`;
  }
  return safeText(error?.message) || "請求在回傳完成前中斷";
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
      const continuation = await callDeepSeekCompletion({
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

async function callDeepSeekCompletionRaw({
  messages,
  temperature = null,
  maxTokens,
  purpose = "chat",
  retryCount = 0,
  responseFormat = null
}) {
  const apiKey = getDeepSeekApiKey(purpose);
  const baseUrl = safeText(process.env.DEEPSEEK_BASE_URL) || "https://api.deepseek.com";
  const model = getDeepSeekModel(purpose);
  const resolvedTemperature = getDeepSeekTemperature(purpose, temperature);
  const resolvedMaxTokens = resolveDeepSeekMaxTokens({ purpose, maxTokens, model });
  const requestMessages = cloneData(messages, []);
  if (!apiKey) {
    const placeholder = purpose === "context_compression" && !safeText(process.env.DEEPSEEK_API_KEY)
      ? "尚未設定 DEEPSEEK_API_KEY 或 deepseek_key2，這是本地回覆佔位訊息。"
      : "尚未設定 DEEPSEEK_API_KEY，這是本地回覆佔位訊息。";
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

  const requestBody = {
    model,
    temperature: resolvedTemperature,
    max_tokens: resolvedMaxTokens,
    messages
  };
  if (responseFormat && typeof responseFormat === "object") {
    requestBody.response_format = responseFormat;
  }
  let response;
  const { controller, timeout } = createTimeoutController();
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    clearTimeout(timeout);
    const message = formatFetchErrorMessage(error);
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: "",
      error: `DeepSeek API 請求失敗: ${message}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`DeepSeek API 請求失敗: ${message}`);
  }

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (error) {
      clearTimeout(timeout);
      const message = formatFetchErrorMessage(error);
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        error: `DeepSeek API 錯誤回應讀取失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
      throw new Error(`DeepSeek API 錯誤回應讀取失敗: ${message}`);
    }
    clearTimeout(timeout);
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: text,
      error: `DeepSeek API 失敗: ${response.status} ${text}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`DeepSeek API 失敗: ${response.status} ${text}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    clearTimeout(timeout);
    const message = error?.name === "AbortError"
      ? formatFetchErrorMessage(error)
      : safeText(error?.message) || "JSON 解析失敗";
    appendAiLog({
      purpose,
      model,
      temperature: resolvedTemperature,
      maxTokens: resolvedMaxTokens,
      requestMessages,
      responseText: "",
      error: `DeepSeek API 回應解析失敗: ${message}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(`DeepSeek API 回應解析失敗: ${message}`);
  }
  clearTimeout(timeout);
  const message = payload?.choices?.[0]?.message || {};
  const finishReason = safeText(payload?.choices?.[0]?.finish_reason);
  const content = extractDeepSeekMessageText(message.content);
  const reasoningContent = extractDeepSeekMessageText(message.reasoning_content);
  const trimmed = safeText(content).trim();
  const trimmedReasoning = safeText(reasoningContent).trim();
  const usage = normalizeAiUsage(payload?.usage);

  if (
    finishReason === "length" &&
    shouldRetryDeepSeekLength(purpose) &&
    retryCount < DEEPSEEK_LENGTH_RETRY_LIMIT
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

    const next = await callDeepSeekCompletionRaw({
      messages: buildDeepSeekLengthRetryMessages(messages, trimmed),
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

  if (finishReason === "length" && shouldRetryDeepSeekLength(purpose)) {
    const errorMessage = "DeepSeek 回覆因 finish_reason:length 截斷；重跑一次後仍未完成，已停止。";
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
      error: `DeepSeek API 回傳格式不完整${finishReason ? `（finish_reason: ${finishReason}）` : ""}`,
      status: "error",
      createdAt: nowIso()
    });
    throw new Error(
      `DeepSeek API 回傳格式不完整${finishReason ? `（finish_reason: ${finishReason}）` : ""}`
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

async function readDeepSeekStreamBody(response, handlers = {}) {
  const onReasoningDelta = typeof handlers.onReasoningDelta === "function" ? handlers.onReasoningDelta : null;
  const onContentDelta = typeof handlers.onContentDelta === "function" ? handlers.onContentDelta : null;
  const decoder = new TextDecoder("utf-8");
  const reader = response.body?.getReader?.();

  if (!reader) {
    throw new Error("DeepSeek 串流回應不可讀取");
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
    const reasoningDelta = extractDeepSeekMessageText(delta.reasoning_content);
    const contentDelta = extractDeepSeekMessageText(delta.content);
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

async function callDeepSeekCompletionStreamRaw({
  messages,
  temperature = null,
  maxTokens,
  purpose = "chat",
  retryCount = 0,
  suppressLog = false,
  onReasoningDelta,
  onContentDelta
}) {
  const apiKey = getDeepSeekApiKey(purpose);
  const baseUrl = safeText(process.env.DEEPSEEK_BASE_URL) || "https://api.deepseek.com";
  const model = getDeepSeekModel(purpose);
  const resolvedTemperature = getDeepSeekTemperature(purpose, temperature);
  const resolvedMaxTokens = resolveDeepSeekMaxTokens({ purpose, maxTokens, model });
  const requestMessages = cloneData(messages, []);

  if (!apiKey) {
    const placeholder = purpose === "context_compression" && !safeText(process.env.DEEPSEEK_API_KEY)
      ? "尚未設定 DEEPSEEK_API_KEY 或 deepseek_key2，這是本地回覆佔位訊息。"
      : "尚未設定 DEEPSEEK_API_KEY，這是本地回覆佔位訊息。";
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

  const requestBody = {
    model,
    temperature: resolvedTemperature,
    max_tokens: resolvedMaxTokens,
    messages,
    stream: true,
    stream_options: {
      include_usage: true
    }
  };

  let response;
  const { controller, timeout } = createTimeoutController();
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify(requestBody)
    });
  } catch (error) {
    clearTimeout(timeout);
    const message = formatFetchErrorMessage(error);
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        usage: null,
        error: `DeepSeek API 請求失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`DeepSeek API 請求失敗: ${message}`);
  }

  if (!response.ok) {
    let text = "";
    try {
      text = await response.text();
    } catch (error) {
      clearTimeout(timeout);
      const message = formatFetchErrorMessage(error);
      if (!suppressLog) {
        appendAiLog({
          purpose,
          model,
          temperature: resolvedTemperature,
          maxTokens: resolvedMaxTokens,
          requestMessages,
          responseText: "",
          usage: null,
          error: `DeepSeek API 錯誤回應讀取失敗: ${message}`,
          status: "error",
          createdAt: nowIso()
        });
      }
      throw new Error(`DeepSeek API 錯誤回應讀取失敗: ${message}`);
    }
    clearTimeout(timeout);
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: text,
        usage: null,
        error: `DeepSeek API 失敗: ${response.status} ${text}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`DeepSeek API 失敗: ${response.status} ${text}`);
  }

  let streamed;
  try {
    streamed = await readDeepSeekStreamBody(response, {
      onReasoningDelta,
      onContentDelta
    });
  } catch (error) {
    clearTimeout(timeout);
    const message = formatFetchErrorMessage(error);
    if (!suppressLog) {
      appendAiLog({
        purpose,
        model,
        temperature: resolvedTemperature,
        maxTokens: resolvedMaxTokens,
        requestMessages,
        responseText: "",
        usage: null,
        error: `DeepSeek 串流讀取失敗: ${message}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(`DeepSeek 串流讀取失敗: ${message}`);
  }
  clearTimeout(timeout);

  if (
    streamed.finishReason === "length" &&
    shouldRetryDeepSeekLength(purpose) &&
    retryCount < DEEPSEEK_LENGTH_RETRY_LIMIT
  ) {
    let next;
    try {
      next = await callDeepSeekCompletionStreamRaw({
        messages: buildDeepSeekLengthRetryMessages(messages, streamed.content),
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

  if (streamed.finishReason === "length" && shouldRetryDeepSeekLength(purpose)) {
    const errorMessage = "DeepSeek 回覆因 finish_reason:length 截斷；重跑一次後仍未完成，已停止。";
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
        error: `DeepSeek API 回傳格式不完整${streamed.finishReason ? `（finish_reason: ${streamed.finishReason}）` : ""}`,
        status: "error",
        createdAt: nowIso()
      });
    }
    throw new Error(
      `DeepSeek API 回傳格式不完整${streamed.finishReason ? `（finish_reason: ${streamed.finishReason}）` : ""}`
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

async function callDeepSeekCompletion(options) {
  const result = await callDeepSeekCompletionRaw(options);
  return result.content;
}

async function callDeepSeekReasonerHistory(state, runtimeUserName = "", options = {}) {
  return callDeepSeekCompletion({
    messages: buildReasonerHistoryMessages(state, runtimeUserName, options),
    purpose: "reasoner_history_chat"
  });
}

async function callDeepSeekCharacterCardCreationAssistant(state, runtimeUserName = "", options = {}) {
  return callDeepSeekCompletion({
    messages: buildCharacterCardCreationAssistantMessages(state, runtimeUserName, options),
    purpose: "character_card_creation_assistant_chat"
  });
}

async function runAdvancedConversationTurnParallel(state, runtimeUserName = "", options = {}) {
  await ensureContextCompressionSummary(state, runtimeUserName);
  return callDeepSeekReasonerHistory(state, runtimeUserName, options)
    .catch((error) => `模型呼叫失敗，已改用錯誤訊息回覆：${error.message}`);
}

async function runReasonerHistoryConversationTurn(state, runtimeUserName = "", options = {}) {
  if (isCharacterCardCreationAssistantActive(state)) {
    try {
      return await callDeepSeekCharacterCardCreationAssistant(state, runtimeUserName, options);
    } catch (error) {
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

    const continuation = await callDeepSeekCompletionStreamRaw({
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
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);
    if (!storedUserContent || !modelUserContent) {
      throw new Error("輸入不可空白。");
    }

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...extra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);

    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    attachTriggeredLorebooksToUserMessage(userMessage, state, runtimeUserName);

    let streamed;
    let compressionNotice = false;
    if (isCharacterCardCreationAssistantActive(state)) {
      onPhaseStatus?.("chat");
      streamed = await callDeepSeekCompletionStreamRaw({
        messages: buildCharacterCardCreationAssistantMessages(state, runtimeUserName),
        purpose: "character_card_creation_assistant_chat",
        onReasoningDelta,
        onContentDelta
      });
    } else {
      const compressionBefore = normalizeContextCompressionState(state.contextCompression);
      const compressionAfter = await ensureContextCompressionSummary(state, runtimeUserName, {
        onStatus: onPhaseStatus
      });
      compressionNotice = didContextCompressionAdvance(compressionBefore, compressionAfter);
      onPhaseStatus?.("chat");
      streamed = await callDeepSeekCompletionStreamRaw({
        messages: buildReasonerHistoryMessages(state, runtimeUserName),
        purpose: "reasoner_history_chat",
        onReasoningDelta,
        onContentDelta
      });
    }

    let assistantText = streamed.content;
    let fullReasoning = streamed.reasoningContent;

    if (!isCharacterCardCreationAssistantActive(state) && countVisibleCharacters(assistantText) < getMinimumReplyChars()) {
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
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...extra,
        reasoningContent: fullReasoning,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
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
  const chain = stateWriteQueue.then(task, task);
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
    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    const options = { reloadFeedback };
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName, options);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state)) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: latestUser?.content
    });
    assistantText = finalizedAssistantOutput.content;
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
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);

    const parsedInput = parseRoleplayInput(storedUserContent, state);
    const modelUserContent = parsedInput.modelContent || storedUserContent;
    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...extra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        replayFromMessageNumber: normalizedMessageNumber,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    attachTriggeredLorebooksToUserMessage(
      userMessage,
      state,
      resolveUserDisplayName(state.userProfile, extra.discordUserName || "")
    );

    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state)) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...extra,
        replayFromMessageNumber: normalizedMessageNumber,
        replayGenerated: true,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
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
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);

    const parsedInput = parseRoleplayInput(storedUserContent, state);
    const modelUserContent = parsedInput.modelContent || storedUserContent;

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...extra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        discordMessageId: normalizedMessageId,
        replayFromDiscordEdit: true,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);
    attachTriggeredLorebooksToUserMessage(
      userMessage,
      state,
      resolveUserDisplayName(state.userProfile, extra.discordUserName || "")
    );

    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);
    if (!isCharacterCardCreationAssistantActive(state)) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...extra,
        discordMessageId: normalizedMessageId,
        replayFromDiscordEdit: true,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
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
    const stateBeforeTurnSnapshot = captureNarrativeCheckpoint(state);
    if (!storedUserContent || !modelUserContent) {
      throw new Error("輸入不可空白。");
    }

    const userMessage = createMessageRecord({
      role: "user",
      content: storedUserContent,
      source,
      extra: {
        ...extra,
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        stateBeforeTurnSnapshot
      }
    });
    appendConversationMessage(userMessage);

    const runtimeUserName = resolveUserDisplayName(state.userProfile, extra.discordUserName || "");
    attachTriggeredLorebooksToUserMessage(userMessage, state, runtimeUserName);
    const compressionBefore = normalizeContextCompressionState(state.contextCompression);
    let assistantText = await runReasonerHistoryConversationTurn(state, runtimeUserName);
    const compressionNotice = !isCharacterCardCreationAssistantActive(state)
      && didContextCompressionAdvance(compressionBefore, state.contextCompression);

    if (!isCharacterCardCreationAssistantActive(state)) {
      assistantText = await ensureMinimumAssistantLength(state, assistantText, runtimeUserName);
    }
    const finalizedAssistantOutput = finalizeAssistantOutputContent(assistantText, {
      userInput: storedUserContent
    });
    assistantText = finalizedAssistantOutput.content;
    const stateAfterTurnSnapshot = captureNarrativeCheckpoint(state);

    const assistantMessage = createMessageRecord({
      role: "assistant",
      content: assistantText,
      source,
      extra: {
        ...extra,
        compressionNotice,
        stateAfterTurnSnapshot
      }
    });
    appendConversationMessage(assistantMessage);
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
    "開始對話：`/ai_start`",
    "查看狀態：`/ai_status`",
    "重跑最新回覆：`/reload feedback:不滿意或要改進的地方`",
    "從指定訊息分支：`/replay message_number:訊息編號 content:新的使用者內容`",
    "自動推演多輪：`/run_time number:10 message:你的要求`",
    "存檔指令：`/session_save`、`/session_list`、`/session_load`",
    `文字指令：伺服器頻道使用 \`${COMMAND_PREFIX} 指令\`；DM 若要執行文字指令也請加 \`${COMMAND_PREFIX}\`，直接打「開始」會當作聊天內容。`,
    `網頁目前只負責角色卡與後台欄位編輯。`
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
        restartHint: "DeepSeek API key 等多數設定會立即同步；Discord Bot Token、Port、Slash 指令註冊等啟動期設定仍建議重啟 npm start。"
      });
      return;
    }

    if (pathname === "/api/env" && method === "PUT") {
      const body = await readBody(req);
      const content = saveEnvFileContent(body?.content);
      sendJson(res, 200, {
        content,
        restartHint: "已保存 .env。DeepSeek API key 等多數設定會立即同步；Discord Bot Token、Port、Slash 指令註冊等啟動期設定仍建議重啟 npm start。"
      });
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
        state: statePayload(state)
      });
      return;
    }

    if (pathname === "/api/context-compression" && method === "PUT") {
      const body = await readBody(req);
      const current = normalizeContextCompressionState(state.contextCompression);
      state.contextCompression = {
        ...current,
        summary: safeText(body?.summary),
        updatedAt: nowIso()
      };
      saveState(state);
      sendJson(res, 200, {
        contextCompression: normalizeContextCompressionState(state.contextCompression),
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
      sendJson(res, 403, { error: getDiscordGuidance() });
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
    sendJson(res, 500, { error: error.message || "伺服器錯誤" });
  }
});

function shouldTreatAsStartCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "start" || normalized === "開始";
}

function shouldTreatAsHelpCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "help" || normalized === "幫助";
}

function shouldTreatAsStatusCommand(input) {
  const normalized = safeText(input).toLowerCase();
  return normalized === "status" || normalized === "狀態";
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
    return "";
  }

  if (!raw.startsWith(COMMAND_PREFIX)) {
    return null;
  }

  return safeText(raw.slice(COMMAND_PREFIX.length));
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
  const testModels = normalizeConversationSettings(state.conversationSettings);
  const lines = [
    `Discord連線: ${discordConnected ? "已連線" : "未連線"}`,
    "主對話指令: /ai content:你的內容",
    `AI狀態: ${state.aiSessionStarted ? "已開始" : "未開始"}`,
    `對話設定: 正式模式（正文輸出=${testModels.chatOutputModel}｜正文上下文=${testModels.dialogueContextRounds}｜壓縮模式=${isContextCompressionEnabled(state) ? "啟用" : "停用"}）`,
    `目前模式: ${getCurrentConversationTargetLabel(state)}`,
    `待播開場: ${state.pendingOpeningBroadcast ? "是" : "否"}`,
    `存檔數: ${state.savedSessions.length}`
  ];
  return lines.join("\n");
}

async function processDiscordChatTurn({
  channel,
  channelId,
  userId,
  userName,
  discordMessageId,
  userContent
}) {
  const stopTyping = startTypingIndicator(channel);
  try {
    const pendingOpening = await consumePendingOpening(channelId, userName);
    const result = await runConversationTurn({
      content: userContent,
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: channelId,
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

async function runReloadTextCommand(message, args) {
  const feedback = safeText(args.join(" "));
  const stopTyping = startTypingIndicator(message.channel);
  try {
    const result = await regenerateLatestAssistantReply({
      source: "discord",
      extra: {
        platform: "discord",
        discordChannelId: message.channelId,
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
      const parsedInput = extractedInput
        ? parseDiscordTextInput(extractedInput, {
            allowBareMetaCommands: Boolean(message.guildId) || safeText(message.content).startsWith(COMMAND_PREFIX)
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

        await message.reply(getDiscordGuidance());
        return;
      }

      await handleDiscordChat(message, parsedInput.content);
    } catch (error) {
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
      const parsedInput = parseDiscordTextInput(extractedInput, {
        allowBareMetaCommands: Boolean(message.guildId) || safeText(message.content).startsWith(COMMAND_PREFIX)
      });
      if (parsedInput.type !== "chat") {
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
