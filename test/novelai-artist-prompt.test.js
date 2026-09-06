import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
const helpers = [
  "boolSetting", "clampIntegerValue", "clampNumberValue", "trimPromptItemStart",
  "splitPromptLines", "normalizePromptItemList", "isArtistExtractionSnippet",
  "normalizeArtistExtractionName", "normalizeArtistExtractionItems", "normalizeArtistExtractionEditor",
  "normalizeRandomPromptSnippet", "randomIntInclusive", "shufflePromptItems",
  "randomNumberInRange", "randomBiasedNumberInRange", "formatPromptWeight",
  "protectNumericWeightPromptToken", "splitPromptChain",
  "applyRandomPromptWeightToToken", "applyRandomPromptWeight", "cleanExpandedPrompt",
  "expandRandomPromptSnippet"
];
const context = vm.createContext({ updateNovelAiDuplicateWarnings() {} });
for (const name of helpers) {
  const start = source.indexOf(`function ${name}(`);
  const end = source.indexOf("\nfunction ", start + 1);
  assert.ok(start >= 0 && end > start, `missing helper: ${name}`);
  vm.runInContext(source.slice(start, end), context);
}
const normalize = (name, randomText, extra = {}) =>
  context.normalizeRandomPromptSnippet({ id: "test", name, randomText, ...extra });
const variants = [
  "artist ningen_mame",
  "[artist: ningen_mame]",
  "{{artist:ningen_mame}}",
  "artist:ningen mame",
  "artist:artist ningen_mame"
];
const pasted = "[artist:kedama milk][artist:ask(askzy)],artist:wanke,[artist:wlop],";
const expected = ["artist:kedama_milk", "artist:ask(askzy)", "artist:wanke", "artist:wlop"];

test("artist variants normalize and deduplicate while keeping underscores", () => {
  for (const name of ["畫師抽取", "画师抽取"]) {
    const normalized = normalize(name, variants.join("\n"));
    assert.deepEqual(Array.from(normalized.randomItems), ["artist:ningen_mame"]);
    assert.equal(normalized.randomText, "artist:ningen_mame");
  }
});

test("adjacent wrapped artists split into four ordered lines", () => {
  const normalized = normalize("畫師抽取", pasted);
  assert.deepEqual(Array.from(normalized.randomItems), expected);
  assert.equal(normalized.randomText, expected.join("\n"));
  assert.equal(normalize("畫師抽取", normalized.randomText).randomText, normalized.randomText);
});

test("old item arrays, escaped underscores and whitespace normalize on load", () => {
  const normalized = normalize("畫師抽取", "", {
    randomItems: ["[ARTIST: Kedama  Milk]", "artist:kedama_milk", "artist:ningen\\_mame", "artist:   ", ",，[]{}"],
    squareEnabled: true, squareMax: 3
  });
  assert.deepEqual(Array.from(normalized.randomItems), ["artist:kedama_milk", "artist:ningen_mame"]);
  assert.equal(normalized.squareEnabled, true);
  assert.equal(normalized.squareMax, 3);
});

test("other random rules preserve chains, weights, duplicates and trailing spaces", () => {
  const input = "[artist:kedama milk][artist:ask(askzy)],artist:wanke,\nyear2025 \nyear2025 ";
  assert.equal(normalize("其他規則", input).randomText, input);
  assert.equal(normalize("畫師抽取備份", input).randomText, input);
});

test("sampling counts unique artists and still applies configured weighting", () => {
  const normalized = normalize("畫師抽取", variants.join("\n"), {
    min: 5, max: 5, squareEnabled: true, squareMax: 1
  });
  const expanded = context.expandRandomPromptSnippet(normalized, "||畫師抽取||");
  assert.deepEqual(Array.from(expanded.selected), ["artist:ningen_mame"]);
  assert.match(expanded.result, /^\[?artist:ningen_mame\]?$/u);
});

test("editor formats its text only for artist extraction rules", () => {
  const name = { value: "其他規則" };
  const field = { value: pasted };
  const card = { querySelector: (selector) => selector.includes('"name"') ? name : field };
  context.normalizeArtistExtractionEditor(card);
  assert.equal(field.value, pasted);
  name.value = "畫師抽取";
  context.normalizeArtistExtractionEditor(card);
  assert.equal(field.value, expected.join("\n"));
});
test("colon-prefixed and bare artist names deduplicate", () => {
  assert.equal(normalize("畫師抽取", ":kazutake_hazano,\nkazutake hazano").randomText, "artist:kazutake_hazano");
  assert.equal(normalize("画师抽取", "artist::kazutake_hazano").randomText, "artist:kazutake_hazano");
});

function makeEditor(value, cursor = value.length) {
  const field = {
    value, selectionStart: cursor, selectionEnd: cursor, selectionDirection: "none", scrollTop: 70,
    setRangeText(text, start, end) {
      this.value = this.value.slice(0, start) + text + this.value.slice(end);
    },
    setSelectionRange(start, end, direction) {
      this.selectionStart = start;
      this.selectionEnd = end;
      this.selectionDirection = direction;
    }
  };
  const card = { querySelector: (selector) => selector.includes('"name"') ? { value: "畫師抽取" } : field };
  return { field, card };
}

test("first letter receives artist prefix and caret stays ready for continued typing", () => {
  const { field, card } = makeEditor("artist:wlop\na\nartist:ask(askzy)", 13);
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:wlop\nartist:a\nartist:ask(askzy)");
  assert.equal(field.selectionStart, 20);
  assert.equal(field.selectionEnd, 20);
  field.value = field.value.slice(0, 20) + "b" + field.value.slice(20);
  field.selectionStart = field.selectionEnd = 21;
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:wlop\nartist:ab\nartist:ask(askzy)");
  assert.equal(field.selectionStart, 21);
  assert.equal(field.scrollTop, 70);
});

test("live formatting preserves newlines, partial duplicates and spaces as underscores", () => {
  const { field, card } = makeEditor("artist:a\n");
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:a\n");
  field.value += "a";
  field.selectionStart = field.selectionEnd = field.value.length;
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:a\nartist:a");
  field.value += " ";
  field.selectionStart = field.selectionEnd = field.value.length;
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:a\nartist:a_");
  assert.equal(field.selectionStart, field.value.length);
});

test("editing a middle line keeps both selection and surrounding lines", () => {
  const { field, card } = makeEditor("artist:wlop\n:kazutake hazano\nartist:ask(askzy)", 22);
  field.selectionEnd = 32;
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:wlop\n:kazutake hazano\nartist:ask(askzy)");
  // A selection spanning lines is left to the normal text editor.
  field.selectionStart = field.selectionEnd = 22;
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:wlop\nartist:kazutake_hazano\nartist:ask(askzy)");
  assert.equal(field.selectionStart, 28);
});
test("numeric artist weights normalize away and deduplicate", () => {
  const input = "0.9::kazutake_hazano::,\n0.9::artist:kazutake_hazano::,";
  for (const name of ["畫師抽取", "画师抽取"]) {
    assert.equal(normalize(name, input).randomText, "artist:kazutake_hazano");
  }
  assert.equal(normalize("其他規則", input).randomText, input);
});

test("weighted wrappers, repeated prefixes and numeric artist names remain distinct", () => {
  const normalized = normalize("畫師抽取", "", {
    randomItems: [
      "[1.2::artist:kazutake hazano::]",
      "{{-0.9::kazutake_hazano::}}",
      "artist:.9::artist:kazutake_hazano::",
      "+2::artist:7010::",
      "artist:7010",
      "0.9::",
      "0.9::[artist:wlop]::"
    ]
  });
  assert.deepEqual(Array.from(normalized.randomItems), ["artist:kazutake_hazano", "artist:7010", "artist:wlop"]);
});

test("editor removes completed weights and leaves the caret at the name", () => {
  const { field, card } = makeEditor("0.9::artist:kazutake_hazano::");
  context.normalizeArtistExtractionEditor(card, { editing: true });
  assert.equal(field.value, "artist:kazutake_hazano");
  assert.equal(field.selectionStart, field.value.length);
  field.value += ",\n0.9::kazutake_hazano::,";
  context.normalizeArtistExtractionEditor(card);
  assert.equal(field.value, "artist:kazutake_hazano");
});
