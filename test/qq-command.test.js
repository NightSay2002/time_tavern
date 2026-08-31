import assert from "node:assert/strict";
import test from "node:test";

import { buildQqHelpText, parseQqTextCommand } from "../src/qq-command.js";
import { localizeSystemText, UI_LANGUAGE_SIMPLIFIED } from "../src/ui-language.js";

test("QQ commands accept both half-width and full-width exclamation marks", () => {
  assert.deepEqual(parseQqTextCommand("!ai_start 2 3"), {
    name: "ai_start",
    known: true,
    args: ["2", "3"],
    rawArguments: "2 3"
  });
  assert.equal(parseQqTextCommand("！help")?.name, "help");
});

test("QQ start alias always maps to the current role card and first opening", () => {
  for (const value of ["!開始", "！開始", "!开始", "！开始"]) {
    const command = parseQqTextCommand(value);
    assert.equal(command?.name, "ai_start");
    assert.equal(command?.known, true);
    assert.deepEqual(command?.args, ["0", "1"]);
    assert.equal(command?.rawArguments, "0 1");
  }
});

test("QQ commands do not intercept ordinary private chat", () => {
  assert.equal(parseQqTextCommand("直接對話"), null);
  assert.equal(parseQqTextCommand("/ai_start"), null);
  assert.equal(parseQqTextCommand("前面有文字 !help"), null);
});

test("unknown QQ command-like text can be answered without reaching the model", () => {
  const parsed = parseQqTextCommand("！something");
  assert.equal(parsed?.known, false);
});

test("QQ help lists every supported private-chat command", () => {
  const help = buildQqHelpText();
  ["!help", "!開始", "!ai_start", "!ai_status", "!stop", "!close", "!archive", "!archive_return"]
    .forEach((command) => assert.equal(help.includes(command), true));
  assert.match(help, /!stop - 停止目前生成；閒置時釋放目前故事租用的 Key/u);
  assert.match(localizeSystemText(help, UI_LANGUAGE_SIMPLIFIED), /!开始 - 使用目前角色卡的第一个开场开始/u);
});
