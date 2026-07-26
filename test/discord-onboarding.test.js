import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import {
  buildDiscordGuildWelcomeMessage,
  buildDiscordInstallUrl,
  DISCORD_USER_INSTALL_WELCOME_MESSAGE,
  getDiscordUserInstallAuthorization,
  verifyDiscordWebhookSignature
} from "../src/discord-onboarding.js";

test("Discord guild welcome uses the plain client-id install link", () => {
  assert.equal(
    buildDiscordInstallUrl("123456789012345678"),
    "https://discord.com/oauth2/authorize?client_id=123456789012345678"
  );
  assert.equal(
    buildDiscordGuildWelcomeMessage("123456789012345678"),
    [
      "點我頭像>傳送訊息>開始私人聊天>我會對你說的任何話作出反應",
      "伺服器先加到應用程式中> 用/ai_start >我會對這頻道說的任何話作出反應",
      "https://discord.com/oauth2/authorize?client_id=123456789012345678"
    ].join("\n")
  );
});

test("only a user installation authorization triggers the private welcome", () => {
  const payload = {
    type: 1,
    event: {
      type: "APPLICATION_AUTHORIZED",
      timestamp: "2026-07-26T12:00:00.000Z",
      data: {
        integration_type: 1,
        user: { id: "123456789012345678" }
      }
    }
  };
  assert.deepEqual(getDiscordUserInstallAuthorization(payload), {
    userId: "123456789012345678",
    eventTimestamp: "2026-07-26T12:00:00.000Z"
  });
  payload.event.data.integration_type = 0;
  assert.equal(getDiscordUserInstallAuthorization(payload), null);
  assert.equal(
    DISCORD_USER_INSTALL_WELCOME_MESSAGE,
    "我會對你說的任何話作出反應 到網頁選角色卡 再輸入/ai_start開始"
  );
});

test("Discord webhook signatures are verified against the raw request body", () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
  const publicKeyDer = publicKey.export({ type: "spki", format: "der" });
  const publicKeyHex = publicKeyDer.subarray(-32).toString("hex");
  const timestamp = "1785067200";
  const rawBody = Buffer.from('{"type":0}', "utf8");
  const signature = crypto.sign(
    null,
    Buffer.concat([Buffer.from(timestamp, "utf8"), rawBody]),
    privateKey
  ).toString("hex");

  assert.equal(verifyDiscordWebhookSignature({
    publicKey: publicKeyHex,
    signature,
    timestamp,
    rawBody
  }), true);
  assert.equal(verifyDiscordWebhookSignature({
    publicKey: publicKeyHex,
    signature,
    timestamp,
    rawBody: Buffer.from('{"type":1}', "utf8")
  }), false);
});
