import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const publishedDefaults = JSON.parse(
  fs.readFileSync(new URL("../defaults/app-defaults.json", import.meta.url), "utf8")
);

test("published defaults exclude Discord credentials and identifiers", () => {
  const environmentValues = publishedDefaults?.environment?.values || {};

  assert.equal(Object.hasOwn(environmentValues, "DISCORD_BOT_TOKEN"), false);
  assert.equal(Object.hasOwn(environmentValues, "DISCORD_CLIENT_ID"), false);
});
