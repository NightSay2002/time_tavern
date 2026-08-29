import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import { localizeSystemText, normalizeUiLanguage, UI_LANGUAGE_SIMPLIFIED } from "./ui-language.js";

const ARCHIVE_BROWSER_PREFIX = "archive_browser:";
const ARCHIVE_REPLAY_PREFIX = "archive_replay:";
const ARCHIVE_REPLAY_PAGE_SIZE = 5;
const ARCHIVE_PREVIEW_LIMIT = 900;

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function truncateText(value, maxLength = ARCHIVE_PREVIEW_LIMIT) {
  const text = safeText(value);
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, Math.max(1, maxLength - 1)).trimEnd()}…`;
}

function isInvisibleArchiveMessage(message = {}) {
  return Boolean(
    message?.source === "model_image" ||
    message?.excludeFromModel ||
    message?.imageOnly ||
    message?.extra?.excludeFromModel ||
    message?.extra?.imageOnly
  );
}

function getArchiveTurnNumber(message = {}, fallback = 1) {
  const value = Number(message?.turnNumber ?? message?.extra?.turnNumber);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function formatArchiveMessage(label, message = {}, language) {
  const content = safeText(message?.content) || localizeSystemText("（空白訊息）", language);
  return `**${localizeSystemText(label, language)}**\n${content}`;
}

function formatArchiveRound(round = {}, fallbackTurnNumber = 1, language) {
  const turnNumber = getArchiveTurnNumber(round.user, fallbackTurnNumber);
  const blocks = [formatArchiveMessage(`使用者｜第 ${turnNumber} 回合`, round.user, language)];
  if (round.assistant) {
    blocks.push(formatArchiveMessage("AI", round.assistant, language));
  }
  return blocks.join("\n\n");
}

export function getDiscordArchiveSessionsNewestFirst(sessions = []) {
  return Array.isArray(sessions) ? [...sessions].reverse() : [];
}

export function getDiscordArchiveByNumber(sessions = [], value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    return null;
  }
  const ordered = getDiscordArchiveSessionsNewestFirst(sessions);
  const session = ordered[number - 1];
  return session ? { session, number, total: ordered.length } : null;
}

export function buildDiscordArchiveTranscript(conversation = []) {
  const openings = [];
  const rounds = [];
  let pendingUser = null;

  for (const message of Array.isArray(conversation) ? conversation : []) {
    if (!message || typeof message !== "object" || isInvisibleArchiveMessage(message)) {
      continue;
    }
    if (message.role === "user") {
      if (pendingUser) {
        rounds.push({ user: pendingUser, assistant: null });
      }
      pendingUser = message;
      continue;
    }
    if (message.role !== "assistant") {
      continue;
    }
    if (pendingUser) {
      rounds.push({ user: pendingUser, assistant: message });
      pendingUser = null;
      continue;
    }
    if (message.source === "opening") {
      openings.push(message);
    }
  }

  if (pendingUser) {
    rounds.push({ user: pendingUser, assistant: null });
  }
  return { openings, rounds };
}

export function buildDiscordArchiveReplayPage(conversation = [], startOffset = 0, language) {
  const transcript = buildDiscordArchiveTranscript(conversation);
  const offset = Math.max(0, Number.parseInt(startOffset, 10) || 0);
  const pageRounds = transcript.rounds.slice(offset, offset + ARCHIVE_REPLAY_PAGE_SIZE);
  const blocks = [];
  if (offset === 0) {
    transcript.openings.forEach((message) => {
      blocks.push(formatArchiveMessage("開場白", message, language));
    });
  }
  pageRounds.forEach((round, index) => {
    blocks.push(formatArchiveRound(round, offset + index + 1, language));
  });
  const nextOffset = offset + pageRounds.length;
  return {
    text: blocks.join("\n\n---\n\n") || localizeSystemText("這個存檔沒有可回放的文字對話。", language),
    nextOffset,
    hasMore: nextOffset < transcript.rounds.length,
    totalRounds: transcript.rounds.length
  };
}

export function buildDiscordArchiveLatestPage(conversation = [], language) {
  const transcript = buildDiscordArchiveTranscript(conversation);
  if (transcript.rounds.length === 0) {
    return buildDiscordArchiveReplayPage(conversation, 0, language);
  }
  const startOffset = Math.max(0, transcript.rounds.length - ARCHIVE_REPLAY_PAGE_SIZE);
  const pageRounds = transcript.rounds.slice(startOffset);
  return {
    text: pageRounds
      .map((round, index) => formatArchiveRound(round, startOffset + index + 1, language))
      .join("\n\n---\n\n"),
    nextOffset: transcript.rounds.length,
    hasMore: false,
    totalRounds: transcript.rounds.length
  };
}

export function parseDiscordArchiveBrowserCustomId(customId = "") {
  const text = safeText(customId);
  return text.startsWith(ARCHIVE_BROWSER_PREFIX)
    ? safeText(text.slice(ARCHIVE_BROWSER_PREFIX.length)) || null
    : null;
}

export function parseDiscordArchiveReplayCustomId(customId = "") {
  const text = safeText(customId);
  return text.startsWith(ARCHIVE_REPLAY_PREFIX)
    ? safeText(text.slice(ARCHIVE_REPLAY_PREFIX.length)) || null
    : null;
}

export function buildDiscordArchiveContinueComponents(token = "", language) {
  const normalizedToken = safeText(token);
  if (!normalizedToken) {
    return [];
  }
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`${ARCHIVE_REPLAY_PREFIX}${normalizedToken}`)
        .setLabel(localizeSystemText("繼續", language))
        .setStyle(ButtonStyle.Primary)
    )
  ];
}

export function buildDiscordArchiveBrowserPayload({
  sessions = [],
  sessionId = "",
  conversation = [],
  language
} = {}) {
  const text = (value) => localizeSystemText(value, language);
  const ordered = getDiscordArchiveSessionsNewestFirst(sessions);
  if (!ordered.length) {
    return {
      content: text("目前沒有對話存檔。"),
      components: [],
      allowedMentions: { parse: [] }
    };
  }

  const requestedId = safeText(sessionId);
  const index = Math.max(0, ordered.findIndex((session) => safeText(session?.id) === requestedId));
  const session = ordered[index];
  const transcript = buildDiscordArchiveTranscript(conversation);
  const lastRound = transcript.rounds.at(-1);
  const lastDialogue = lastRound
    ? truncateText(formatArchiveRound(lastRound, transcript.rounds.length, language))
    : transcript.openings.length > 0
      ? truncateText(formatArchiveMessage("開場白", transcript.openings.at(-1), language))
      : text("尚無可顯示的對話。");
  const updatedAt = safeText(session?.updatedAt || session?.createdAt);
  const updatedText = updatedAt
    ? new Date(updatedAt).toLocaleString(
      normalizeUiLanguage(language) === UI_LANGUAGE_SIMPLIFIED ? "zh-CN" : "zh-Hant"
    )
    : text("未知時間");
  const number = index + 1;
  const content = [
    `**${text("對話存檔")} ${number} / ${ordered.length}**`,
    `${text("編號：")}${number}`,
    `${text("名稱：")}${safeText(session?.name) || text("未命名存檔")}`,
    `${text("角色：")}${safeText(session?.roleCardName) || text("未指定角色卡")}`,
    `${text("更新：")}${updatedText}`,
    "",
    `**${text("最後的對話")}**`,
    lastDialogue,
    "",
    `${text("使用")} \`/archive_return mode:0 num:${number}\` ${text("從頭回放，或使用")} \`mode:1\` ${text("從末端繼續。")}`
  ].join("\n");
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${ARCHIVE_BROWSER_PREFIX}${ordered[Math.max(0, index - 1)].id}`)
      .setLabel(text("上一個"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index <= 0),
    new ButtonBuilder()
      .setCustomId(`${ARCHIVE_BROWSER_PREFIX}${ordered[Math.min(ordered.length - 1, index + 1)].id}`)
      .setLabel(text("下一個"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index >= ordered.length - 1)
  );

  return {
    content,
    components: [controls],
    allowedMentions: { parse: [] }
  };
}
