import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const webHtml = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");

const removedCommands = ["run_time", "replay", "session_save", "session_list", "session_load"];

test("removed conversation tools are absent from Discord and web command entry points", () => {
  for (const command of removedCommands) {
    assert.doesNotMatch(serverSource, new RegExp(`name:\\s*"${command}"`));
    assert.doesNotMatch(webSource, new RegExp(`command:\\s*"/${command}"`));
  }

  assert.doesNotMatch(serverSource, /\/api\/chat\/(?:replay|run-time)/);
  assert.doesNotMatch(webSource, /\/api\/chat\/(?:replay|run-time)/);
});

test("saved sessions remain available through the web without session commands", () => {
  assert.match(serverSource, /\/api\/sessions\/save/);
  assert.match(serverSource, /sessionLoadMatch/);
  assert.match(webSource, /\/api\/sessions\/\$\{encodeURIComponent\(session\.id\)\}\/load/);
  assert.match(webHtml, /sessionPickerDialog/);
  assert.match(webHtml, /saveSessionBtn/);
  assert.match(webHtml, /selectSessionBtn/);
});

test("message editing replay remains available", () => {
  assert.match(serverSource, /replayConversationFromMessageNumber/);
  assert.match(serverSource, /replayConversationFromDiscordMessageId/);
  assert.match(serverSource, /replay-edit/);
  assert.match(webSource, /\/api\/messages\/\$\{messageId\}\/replay-edit/);
});
