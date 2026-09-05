import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const publishedDefaults = JSON.parse(
  fs.readFileSync(new URL("../defaults/app-defaults.json", import.meta.url), "utf8")
);
const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

test("published defaults exclude bot credentials and identifiers", () => {
  const environmentValues = publishedDefaults?.environment?.values || {};

  assert.equal(Object.hasOwn(environmentValues, "DISCORD_BOT_TOKEN"), false);
  assert.equal(Object.hasOwn(environmentValues, "DISCORD_CLIENT_ID"), false);
  assert.equal(Object.hasOwn(environmentValues, "DISCORD_ALLOWED_USER_ID"), false);
  assert.equal(Object.hasOwn(environmentValues, "QQ_BOT_APP_ID"), false);
  assert.equal(Object.hasOwn(environmentValues, "QQ_BOT_APP_SECRET"), false);
  assert.equal(Object.hasOwn(environmentValues, "QQ_ALLOWED_USER_OPENID"), false);
  assert.equal(Object.hasOwn(environmentValues, "CHAT_IMAGE_API_KEY"), false);
  assert.deepEqual(
    Object.keys(environmentValues).filter((key) => /(?:^|_)API_KEY$/u.test(key)),
    []
  );
  assert.deepEqual(
    Object.keys(environmentValues).filter((key) => /API_KEY_GROUP/iu.test(key)),
    []
  );
});

test("global settings files exclude secrets and preserve local credentials on import", () => {
  const exportBlock = serverSource.match(/function createGlobalSettingsExport[\s\S]*?\n\}\n\nfunction sanitizeNovelAiDefaultSettings/u)?.[0] || "";
  const importEnvironmentBlock = serverSource.match(/function buildImportedEnvironmentContent[\s\S]*?\n\}\n\nfunction readEnvFileContentForEditor/u)?.[0] || "";

  assert.match(exportBlock, /createDefaultEnvironmentPayload\(readEnvFileContent\(\)\)/u);
  assert.doesNotMatch(exportBlock, /(?:^|\n)\s*(?:savedSessions|conversation|aiLogs):/u);
  assert.match(importEnvironmentBlock, /isDefaultEnvSecretKey\(key\)/u);
  assert.match(importEnvironmentBlock, /\.\.\.preservedSecrets/u);
  assert.match(serverSource, /DEFAULT_ENV_SECRET_KEY_PATTERN[^\n]*API_KEY/u);
});
