import crypto from "node:crypto";
import { localizeSystemText } from "./ui-language.js";

export const DISCORD_GUILD_WELCOME_LINES = [
  "點我頭像>傳送訊息>開始私人聊天>我會對你說的任何話作出反應",
  "伺服器先加到應用程式中> 用/ai_start >我會對這頻道說的任何話作出反應"
];

export const DISCORD_USER_INSTALL_WELCOME_MESSAGE =
  "我會對你說的任何話作出反應 到網頁選角色卡 再輸入/ai_start開始";

export function buildDiscordInstallUrl(clientId = "") {
  const normalizedClientId = String(clientId || "").trim();
  return normalizedClientId
    ? `https://discord.com/oauth2/authorize?client_id=${encodeURIComponent(normalizedClientId)}`
    : "";
}

export function buildDiscordGuildWelcomeMessage(clientId = "", language) {
  return [
    ...DISCORD_GUILD_WELCOME_LINES.map((line) => localizeSystemText(line, language)),
    buildDiscordInstallUrl(clientId)
  ]
    .filter(Boolean)
    .join("\n");
}

export function getDiscordUserInstallAuthorization(payload) {
  if (
    Number(payload?.type) !== 1 ||
    payload?.event?.type !== "APPLICATION_AUTHORIZED" ||
    Number(payload?.event?.data?.integration_type) !== 1
  ) {
    return null;
  }

  const userId = String(payload.event.data.user?.id || "").trim();
  if (!/^\d{15,25}$/u.test(userId)) {
    return null;
  }

  return {
    userId,
    eventTimestamp: String(payload.event.timestamp || "").trim()
  };
}

export function verifyDiscordWebhookSignature({
  publicKey,
  signature,
  timestamp,
  rawBody
} = {}) {
  const normalizedPublicKey = String(publicKey || "").trim();
  const normalizedSignature = String(signature || "").trim();
  const normalizedTimestamp = String(timestamp || "").trim();
  if (
    !/^[a-f0-9]{64}$/iu.test(normalizedPublicKey) ||
    !/^[a-f0-9]{128}$/iu.test(normalizedSignature) ||
    !normalizedTimestamp
  ) {
    return false;
  }

  try {
    const publicKeyDer = Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"),
      Buffer.from(normalizedPublicKey, "hex")
    ]);
    const key = crypto.createPublicKey({
      key: publicKeyDer,
      format: "der",
      type: "spki"
    });
    const body = Buffer.isBuffer(rawBody)
      ? rawBody
      : Buffer.from(String(rawBody || ""), "utf8");
    return crypto.verify(
      null,
      Buffer.concat([Buffer.from(normalizedTimestamp, "utf8"), body]),
      key,
      Buffer.from(normalizedSignature, "hex")
    );
  } catch {
    return false;
  }
}
