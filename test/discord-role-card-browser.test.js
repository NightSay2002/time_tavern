import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDiscordRoleCardBrowserPayload,
  getDiscordRoleCardByNumber,
  getInitialDiscordRoleCardNumber,
  normalizeDiscordRoleCardNumber,
  parseDiscordRoleCardBrowserCustomId
} from "../src/discord-role-card-browser.js";

const roleCards = [
  { id: "card-a", name: "角色 A", mode: "single", description: "第一張卡" },
  { id: "card-b", name: "角色 B", mode: "multi", description: "第二張卡" },
  { id: "card-c", name: "角色 C", mode: "no_role", description: "第三張卡" },
  { id: "card-d", name: "角色 D", mode: "custom_mode", description: "第四張卡" }
];

test("Discord role card numbers use zero only for the current target", () => {
  assert.equal(normalizeDiscordRoleCardNumber(0, { allowCurrent: true }), 0);
  assert.equal(normalizeDiscordRoleCardNumber(0), null);
  assert.equal(normalizeDiscordRoleCardNumber(-1, { allowCurrent: true }), null);
  assert.equal(normalizeDiscordRoleCardNumber(1.5, { allowCurrent: true }), null);
  assert.equal(getDiscordRoleCardByNumber(roleCards, 2)?.id, "card-b");
  assert.equal(getDiscordRoleCardByNumber(roleCards, 5), null);
});

test("Discord role card browser opens on the active card", () => {
  assert.equal(getInitialDiscordRoleCardNumber({ roleCards, activeRoleCardId: "card-b" }), 2);
  assert.equal(getInitialDiscordRoleCardNumber({ roleCards, activeRoleCardId: "missing" }), 1);
});

test("Discord role card browser provides two bounded page buttons", () => {
  const payload = buildDiscordRoleCardBrowserPayload({ roleCards, activeRoleCardId: "card-b" }, 2);
  const buttons = payload.components[0].toJSON().components;

  assert.match(payload.content, /角色卡 2 \/ 4（目前使用）/u);
  assert.match(payload.content, /名稱：角色 B/u);
  assert.match(payload.content, /模式：多角色/u);
  assert.match(payload.content, /\/ai_start num:2/u);
  assert.equal(buttons.length, 2);
  assert.equal(buttons[0].custom_id, "role_card_browser:1");
  assert.equal(buttons[1].custom_id, "role_card_browser:3");
  assert.equal(buttons[0].disabled, false);
  assert.equal(buttons[1].disabled, false);
  assert.equal(parseDiscordRoleCardBrowserCustomId(buttons[1].custom_id), 3);
  assert.equal(parseDiscordRoleCardBrowserCustomId("other:3"), null);
});

test("Discord role card browser handles empty and final pages", () => {
  const empty = buildDiscordRoleCardBrowserPayload({ roleCards: [] }, 1);
  assert.match(empty.content, /沒有可瀏覽的角色卡/u);
  assert.deepEqual(empty.components, []);

  const final = buildDiscordRoleCardBrowserPayload({ roleCards }, 99);
  const buttons = final.components[0].toJSON().components;
  assert.match(final.content, /角色卡 4 \/ 4/u);
  assert.match(final.content, /模式：自訂模式/u);
  assert.equal(buttons[1].disabled, true);
});

test("Discord role card browser supports current and legacy role modes", () => {
  const legacyMulti = buildDiscordRoleCardBrowserPayload({
    roleCards: [{ id: "legacy-multi", name: "舊多角色卡", mode: "multi_role" }]
  });
  const legacySingle = buildDiscordRoleCardBrowserPayload({
    roleCards: [{ id: "legacy-single", name: "舊單角色卡", mode: "single_role" }]
  });

  assert.match(legacyMulti.content, /模式：多角色/u);
  assert.match(legacySingle.content, /模式：單角色/u);
});
