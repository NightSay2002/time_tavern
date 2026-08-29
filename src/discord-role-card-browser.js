import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import { localizeSystemText } from "./ui-language.js";

const ROLE_CARD_BROWSER_PREFIX = "role_card_browser:";
const ROLE_CARD_PREVIEW_LIMIT = 1100;

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatRoleCardMode(mode, language) {
  const normalized = safeText(mode).toLowerCase();
  if (normalized === "multi" || normalized === "multi_role") {
    return localizeSystemText("多角色", language);
  }
  if (normalized === "no_role" || normalized === "norole" || normalized === "none") {
    return localizeSystemText("無角色", language);
  }
  if (normalized && normalized !== "single" && normalized !== "single_role") {
    return localizeSystemText("自訂模式", language);
  }
  return localizeSystemText("單角色", language);
}

function truncateRoleCardPreview(value) {
  const text = safeText(value);
  if (text.length <= ROLE_CARD_PREVIEW_LIMIT) {
    return text;
  }
  return `${text.slice(0, ROLE_CARD_PREVIEW_LIMIT - 1).trimEnd()}…`;
}

export function normalizeDiscordRoleCardNumber(value, { allowCurrent = false } = {}) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < (allowCurrent ? 0 : 1)) {
    return null;
  }
  return number;
}

export function getDiscordRoleCardByNumber(roleCards, value) {
  const number = normalizeDiscordRoleCardNumber(value);
  if (number === null) {
    return null;
  }
  return Array.isArray(roleCards) ? roleCards[number - 1] || null : null;
}

export function getInitialDiscordRoleCardNumber(currentState = {}) {
  const cards = Array.isArray(currentState.roleCards) ? currentState.roleCards : [];
  const activeIndex = cards.findIndex((card) => safeText(card?.id) === safeText(currentState.activeRoleCardId));
  return activeIndex >= 0 ? activeIndex + 1 : 1;
}

function getRoleCardOpenings(card = {}) {
  const entries = (Array.isArray(card?.openingDialogues) ? card.openingDialogues : [])
    .map((entry, index) => ({
      id: safeText(entry?.id) || `opening_${index + 1}`,
      content: safeText(entry?.content || entry?.text)
    }))
    .filter((entry) => entry.content);
  const fallback = safeText(card?.openingDialogue);
  if (fallback && !entries.some((entry) => entry.content === fallback)) {
    entries.unshift({ id: "opening_primary", content: fallback });
  }
  return entries;
}

export function getInitialDiscordOpeningNumber(currentState = {}, roleCardNumber = 1) {
  const card = getDiscordRoleCardByNumber(currentState.roleCards, roleCardNumber);
  const openings = getRoleCardOpenings(card);
  const selectedId = safeText(currentState.selectedOpeningDialogueId);
  const selectedIndex = openings.findIndex((entry) => entry.id === selectedId);
  return selectedIndex >= 0 ? selectedIndex + 1 : 1;
}

export function parseDiscordRoleCardBrowserCustomId(customId = "") {
  const match = safeText(customId).match(
    /^role_card_browser:(\d+):(\d+)(?::(?:previous_card|previous_opening|next_opening|next_card))?$/u
  );
  const cardNumber = match ? normalizeDiscordRoleCardNumber(match[1]) : null;
  const openingNumber = match ? normalizeDiscordRoleCardNumber(match[2]) : null;
  return cardNumber && openingNumber ? { cardNumber, openingNumber } : null;
}

export function buildDiscordRoleCardBrowserPayload(
  currentState = {},
  requestedNumber = 1,
  requestedOpeningNumber = 1,
  language
) {
  if (typeof requestedOpeningNumber === "string" && language === undefined) {
    language = requestedOpeningNumber;
    requestedOpeningNumber = 1;
  }
  const text = (value) => localizeSystemText(value, language);
  const cards = Array.isArray(currentState.roleCards) ? currentState.roleCards : [];
  if (!cards.length) {
    return {
      content: text("目前沒有可瀏覽的角色卡。"),
      components: [],
      allowedMentions: { parse: [] }
    };
  }

  const requested = normalizeDiscordRoleCardNumber(requestedNumber) || 1;
  const number = Math.min(requested, cards.length);
  const card = cards[number - 1];
  const isActive = safeText(card?.id) === safeText(currentState.activeRoleCardId);
  const openings = getRoleCardOpenings(card);
  const requestedOpening = normalizeDiscordRoleCardNumber(requestedOpeningNumber) || 1;
  const openingNumber = openings.length > 0 ? Math.min(requestedOpening, openings.length) : 1;
  const preview = openings.length > 0
    ? truncateRoleCardPreview(openings[openingNumber - 1]?.content)
    : "";
  const startCommand = openingNumber > 1
    ? `/ai_start num:${number} opening:${openingNumber}`
    : `/ai_start num:${number}`;
  const content = [
    `**${text("角色卡")} ${number} / ${cards.length}${isActive ? text("（目前使用）") : ""}**`,
    `${text("編號：")}${number}`,
    `${text("名稱：")}${safeText(card?.name) || text("未命名角色卡")}`,
    `${text("模式：")}${formatRoleCardMode(card?.mode, language)}`,
    "",
    preview
      ? `**${text("預覽")}（${openingNumber}/${openings.length}）：**${preview}`
      : `**${text("預覽")}（0/0）：**${text("尚無開場內容。")}`,
    "",
    `${text("使用")} \`${startCommand}\` ${text("開始這張角色卡。")}`
  ].join("\n");
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${Math.max(1, number - 1)}:1:previous_card`)
      .setLabel(text("上一張"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(number <= 1),
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${number}:${Math.max(1, openingNumber - 1)}:previous_opening`)
      .setLabel(text("上一個開場"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(openings.length <= 1 || openingNumber <= 1),
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${number}:${Math.min(Math.max(1, openings.length), openingNumber + 1)}:next_opening`)
      .setLabel(text("下一個開場"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(openings.length <= 1 || openingNumber >= openings.length),
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${Math.min(cards.length, number + 1)}:1:next_card`)
      .setLabel(text("下一張"))
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(number >= cards.length)
  );

  return {
    content,
    components: [controls],
    allowedMentions: { parse: [] }
  };
}
