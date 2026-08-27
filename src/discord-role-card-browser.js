import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";

const ROLE_CARD_BROWSER_PREFIX = "role_card_browser:";
const ROLE_CARD_PREVIEW_LIMIT = 1100;

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatRoleCardMode(mode) {
  const normalized = safeText(mode).toLowerCase();
  if (normalized === "multi" || normalized === "multi_role") {
    return "多角色";
  }
  if (normalized === "no_role" || normalized === "norole" || normalized === "none") {
    return "無角色";
  }
  if (normalized && normalized !== "single" && normalized !== "single_role") {
    return "自訂模式";
  }
  return "單角色";
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

export function parseDiscordRoleCardBrowserCustomId(customId = "") {
  const match = safeText(customId).match(/^role_card_browser:(\d+)$/u);
  return match ? normalizeDiscordRoleCardNumber(match[1]) : null;
}

export function buildDiscordRoleCardBrowserPayload(currentState = {}, requestedNumber = 1) {
  const cards = Array.isArray(currentState.roleCards) ? currentState.roleCards : [];
  if (!cards.length) {
    return {
      content: "目前沒有可瀏覽的角色卡。",
      components: [],
      allowedMentions: { parse: [] }
    };
  }

  const requested = normalizeDiscordRoleCardNumber(requestedNumber) || 1;
  const number = Math.min(requested, cards.length);
  const card = cards[number - 1];
  const isActive = safeText(card?.id) === safeText(currentState.activeRoleCardId);
  const preview = truncateRoleCardPreview(
    card?.description || card?.personality || card?.scene || card?.openingDialogue
  );
  const content = [
    `**角色卡 ${number} / ${cards.length}${isActive ? "（目前使用）" : ""}**`,
    `編號：${number}`,
    `名稱：${safeText(card?.name) || "未命名角色卡"}`,
    `模式：${formatRoleCardMode(card?.mode)}`,
    "",
    preview ? `**預覽**\n${preview}` : "尚無可顯示的預覽內容。",
    "",
    `使用 \`/ai_start num:${number}\` 開始這張角色卡。`
  ].join("\n");
  const controls = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${Math.max(1, number - 1)}`)
      .setLabel("上一張")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(number <= 1),
    new ButtonBuilder()
      .setCustomId(`${ROLE_CARD_BROWSER_PREFIX}${Math.min(cards.length, number + 1)}`)
      .setLabel("下一張")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(number >= cards.length)
  );

  return {
    content,
    components: [controls],
    allowedMentions: { parse: [] }
  };
}
