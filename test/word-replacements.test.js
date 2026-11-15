import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { normalizeWordReplacements, validateWordReplacements, prepareWordReplacementMessages, restoreReplacedWords, createWordRestorer } from "../src/word-replacements.js";

const rules = { enabled: true, entries: [
  { from: "操", to: "錒", enabled: true },
  { from: "射", to: "郗", enabled: true },
  { from: "穴", to: "魃", enabled: false },
  { from: "交", to: "艨", enabled: true }
] };

test("all message text is replaced once and instruction precedes custom supplement", () => {
  const image = { type: "image_url", image_url: { url: "data:image/png;base64,abcd" } };
  const messages = [
    { role: "system", content: "操射穴交" },
    { role: "assistant", content: "射" },
    { role: "user", content: [{ type: "text", text: "操\n\n【使用者自訂補充】射" }, image] }
  ];
  const result = prepareWordReplacementMessages(messages, rules);
  assert.equal(result[0].content, "錒郗穴艨");
  assert.equal(result[1].content, "郗");
  assert.match(result[2].content[0].text, /^錒\n\n【改詞規則】/u);
  assert.match(result[2].content[0].text, /操改為錒/u);
  assert.match(result[2].content[0].text, /【使用者自訂補充】郗$/u);
  assert.deepEqual(result[2].content[1], image);
  assert.equal(messages[0].content, "操射穴交");
});

test("replacements do not cascade and longest matches take precedence", () => {
  const config = { enabled: true, entries: [{ from: "ab", to: "X" }, { from: "a", to: "b" }, { from: "b", to: "c" }] };
  const messages = prepareWordReplacementMessages([{ role: "user", content: "ab a b" }], config);
  assert.ok(messages[0].content.startsWith("X b c\n"));
  assert.equal(restoreReplacedWords("X b c", config), "ab a b");
});

test("only rules actually matched anywhere in the request appear in its instruction", () => {
  const config = { enabled: true, entries: [{ from: "ab", to: "X" }, { from: "a", to: "Y" }, { from: "unused", to: "Z" }] };
  const messages = [{ role: "system", content: "ab" }, { role: "assistant", content: "nothing" }, { role: "user", content: "hello" }];
  const result = prepareWordReplacementMessages(messages, config);
  assert.equal(result[0].content, "X");
  assert.match(result[2].content, /ab改為X/u);
  assert.doesNotMatch(result[2].content, /a改為Y|unused改為Z/u);
  assert.deepEqual(prepareWordReplacementMessages([{ role: "user", content: "nothing" }], config), [{ role: "user", content: "nothing" }]);
});

test("matched image text and messages without a user still get the applicable instruction", () => {
  const config = { enabled: true, entries: [{ from: "a", to: "X" }, { from: "b", to: "Y" }] };
  const result = prepareWordReplacementMessages([{ role: "system", content: [{ type: "text", text: "a" }, { type: "image_url", image_url: { url: "data:image/png;base64,b" } }] }], config);
  assert.equal(result[0].content[0].text, "X");
  assert.equal(result[0].content[1].image_url.url, "data:image/png;base64,b");
  assert.match(result[1].content, /a改為X/u);
  assert.doesNotMatch(result[1].content, /b改為Y/u);
});

test("streaming restores replacement words split across chunks and overlapping prefixes", () => {
  const config = { enabled: true, entries: [{ from: "一", to: "abc" }, { from: "二", to: "ab" }] };
  let output = "";
  const stream = createWordRestorer(config, (part) => { output += part; });
  for (const part of ["a", "b", "c", "a", "b", "!", "a"]) stream.push(part);
  stream.flush();
  assert.equal(output, "一二!a");
  assert.equal(output, restoreReplacedWords("abcab!a", config));
});

test("disabled rules leave requests and responses unchanged", () => {
  const messages = [{ role: "user", content: "操" }];
  assert.equal(prepareWordReplacementMessages(messages, { ...rules, enabled: false }), messages);
  assert.equal(restoreReplacedWords("錒", { ...rules, enabled: false }), "錒");
  assert.deepEqual(normalizeWordReplacements(null), { enabled: false, entries: [] });
});

test("validation prevents ambiguous duplicate replacements and empty terms", () => {
  assert.throws(() => validateWordReplacements({ entries: [{ from: "a", to: "x" }, { from: "b", to: "x" }] }), /重複/u);
  assert.throws(() => validateWordReplacements({ entries: [{ from: "", to: "x" }] }), /不能留空/u);
});

test("editor immediately marks duplicates in both columns and clears them after correction", () => {
  const source = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
  const start = source.indexOf("function updateWordReplacementValidation(");
  assert.ok(start >= 0);
  const input = value => ({ value, classList: { toggle(_name, value) { this.duplicate = value; } }, setAttribute(_name, value) { this.invalid = value; }, setCustomValidity(value) { this.validation = value; } });
  const row = (from, to, enabled) => ({ from: input(from), to: input(to), checkbox: { checked: enabled }, querySelector(selector) { return selector === ".word-replacement-from" ? this.from : selector === ".word-replacement-to" ? this.to : this.checkbox; } });
  const rows = [row(" cat ", "x", true), row("cat", "y", false), row("dog", "x", true)];
  const count = {}, error = {};
  const scope = vm.createContext({ el: { wordReplacementsList: { children: rows } }, document: { getElementById: id => id === "wordReplacementsCount" ? count : error } });
  vm.runInContext(source.slice(start, source.indexOf("\n}", start) + 2), scope);
  scope.updateWordReplacementValidation();
  assert.equal(rows[0].from.classList.duplicate, true);
  assert.equal(rows[1].from.invalid, "true");
  assert.equal(rows[0].to.invalid, "true");
  assert.equal(rows[2].to.invalid, "true");
  assert.ok(rows[0].from.validation);
  assert.equal(error.hidden, false);
  assert.equal(count.textContent, "2 / 3 條啟用");
  rows[1].from.value = "bird";
  rows[2].to.value = "z";
  scope.updateWordReplacementValidation();
  assert.equal(rows[0].from.invalid, "false");
  assert.equal(rows[0].from.validation, "");
  assert.equal(error.hidden, true);
});
