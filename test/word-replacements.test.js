import test from "node:test";
import assert from "node:assert/strict";
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
