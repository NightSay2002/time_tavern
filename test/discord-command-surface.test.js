import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  isLegacyDiscordTextCommand,
  LEGACY_DISCORD_TEXT_COMMAND_NOTICE
} from "../src/discord-message.js";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const envExample = fs.readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const details = fs.readFileSync(new URL("../docs/DETAILS.md", import.meta.url), "utf8");

function getTopLevelNames(source, declaration) {
  const block = source.match(new RegExp(`const ${declaration} = \\[([\\s\\S]*?)\\n\\];`, "u"))?.[1] || "";
  return Array.from(block.matchAll(/^ {4}name:\s*"([^"]+)"/gmu), (match) => match[1]);
}

test("Discord exposes exactly the six supported Slash commands", () => {
  assert.deepEqual(getTopLevelNames(serverSource, "DISCORD_SLASH_COMMANDS"), [
    "ai_start",
    "ai_status",
    "stop",
    "player_set",
    "reload",
    "quick_send"
  ]);
  assert.doesNotMatch(serverSource, /interaction\.commandName\s*===?\s*"ai(?:_help)?"/u);
  assert.match(serverSource, /name:\s*"ai_start",[\s\S]*?name:\s*"num",[\s\S]*?minValue:\s*0/u);
  assert.match(serverSource, /name:\s*"ai_status",[\s\S]*?目前狀態[\s\S]*?瀏覽角色卡/u);
  assert.match(serverSource, /handleDiscordRoleCardBrowserButton\(interaction\)/u);
});

test("web exposes exactly four slash command menu entries", () => {
  const block = webSource.match(/const CHAT_COMMAND_MENU_ITEMS = \[([\s\S]*?)\n\];/u)?.[1] || "";
  const commands = Array.from(block.matchAll(/^\s+command:\s*"([^"]+)"/gmu), (match) => match[1])
    .filter((command) => command.startsWith("/"));
  assert.deepEqual(commands, ["/ai_start", "/ai_status", "/stop", "/reload"]);
  assert.doesNotMatch(webSource, /command === "ai_help"|command === "help"/u);
});

test("legacy !ai text commands are rejected without matching similar chat text", () => {
  assert.equal(isLegacyDiscordTextCommand("!ai"), true);
  assert.equal(isLegacyDiscordTextCommand("!AI help"), true);
  assert.equal(isLegacyDiscordTextCommand("  !ai status"), true);
  assert.equal(isLegacyDiscordTextCommand("!air"), false);
  assert.equal(isLegacyDiscordTextCommand("hello !ai"), false);
  assert.match(LEGACY_DISCORD_TEXT_COMMAND_NOTICE, /文字指令已移除/u);
  assert.match(
    serverSource,
    /if \(isLegacyDiscordTextCommand\(message\.content\)\) \{\s+await message\.reply\(LEGACY_DISCORD_TEXT_COMMAND_NOTICE\);/u
  );
  assert.match(serverSource, /await handleDiscordChat\(message, extractedInput\);/u);
});

test("configurable Discord text command prefixes are no longer exposed", () => {
  for (const source of [serverSource, webSource, envExample, details]) {
    assert.doesNotMatch(source, /COMMAND_PREFIX/u);
  }
});
