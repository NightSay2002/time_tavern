import assert from "node:assert/strict";
import test from "node:test";

import { isAllowedDiscordUser } from "../src/discord-access.js";

test("Discord user restriction allows every user when it is not configured", () => {
  assert.equal(isAllowedDiscordUser("111111111111111111", ""), true);
});

test("Discord user restriction only allows the configured user", () => {
  const allowedUserId = "123456789012345678";

  assert.equal(isAllowedDiscordUser(allowedUserId, allowedUserId), true);
  assert.equal(isAllowedDiscordUser("987654321098765432", allowedUserId), false);
});

test("an invalid Discord user restriction fails closed", () => {
  assert.equal(isAllowedDiscordUser("123456789012345678", "not-an-id"), false);
});
