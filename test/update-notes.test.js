import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const source = app.slice(app.indexOf("const UPDATE_NOTES_SEEN_KEY"), app.indexOf("function isDialogBackdropPointer"));
const publishedNotes = JSON.parse(fs.readFileSync(new URL("../src/public/update-notes.json", import.meta.url), "utf8"));

function setup({ blockedStorage = false } = {}) {
  const element = () => ({
    children: [], attributes: {}, listeners: {},
    append(...children) { this.children.push(...children); },
    replaceChildren(...children) { this.children = children; },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, fn) { this.listeners[key] = fn; }
  });
  const el = { updateNotesList: element(), updateNotesContent: element(), updateNotesDialog: { open: false, shows: 0, showModal() { this.open = true; this.shows += 1; } } };
  let notes = structuredClone(publishedNotes);
  const storage = new Map();
  const context = vm.createContext({
    el, document: { createElement: element },
    getUiLanguageText: (value) => value, applyUiLanguage() {},
    request: async (url, options) => {
      assert.equal(url, "/update-notes.json");
      assert.equal(options.cache, "no-store");
      return notes;
    },
    localStorage: {
      getItem(key) { if (blockedStorage) throw new Error("blocked"); return storage.get(key); },
      setItem(key, value) { if (blockedStorage) throw new Error("blocked"); storage.set(key, value); }
    }
  });
  vm.runInContext(source, context);
  return { el, storage, setNotes(value) { notes = value; }, open: (auto) => context.openUpdateNotes(auto) };
}

test("published update notes use unique IDs and the agreed current title", () => {
  assert.equal(new Set(publishedNotes.map((note) => note.id)).size, publishedNotes.length);
  assert.equal(publishedNotes[0].title, "自定義:重新請求的次數");
  assert.match(publishedNotes[0].content, /默認次數為三次/u);
});

test("new notes automatically open once, manual review still opens and new IDs notify again", async () => {
  const ui = setup();
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 1);
  assert.equal(ui.el.updateNotesList.children[0].children.length, 1);
  assert.equal(ui.el.updateNotesList.children[0].children[0].textContent, publishedNotes[0].title);
  ui.el.updateNotesDialog.open = false;
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 1);
  await ui.open(false);
  assert.equal(ui.el.updateNotesDialog.shows, 2);
  ui.el.updateNotesDialog.open = false;
  ui.setNotes([{ ...publishedNotes[0], id: "next-update" }, ...publishedNotes]);
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 3);
  assert.equal(ui.el.updateNotesList.children.length, 2);
  ui.el.updateNotesList.children[1].listeners.click();
  assert.equal(ui.el.updateNotesList.children[1].attributes["aria-pressed"], "true");
});

test("blocked browser storage falls back to the page marker", async () => {
  const ui = setup({ blockedStorage: true });
  await ui.open(true);
  ui.el.updateNotesDialog.open = false;
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 1);
});

test("empty or malformed lists do not auto-open or mark a notification as seen", async () => {
  const ui = setup();
  ui.setNotes([]);
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 0);
  ui.setNotes([{ id: "broken" }]);
  await assert.rejects(ui.open(true), /更新內容格式不正確/u);
  assert.equal(ui.storage.size, 0);
});
