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
  assert.equal(publishedNotes[0].title, "現在全部共用key和可設定proxy");
  assert.equal(publishedNotes[0].content, "emmm...那個..發現了其實key不會影響命中率,所以現在全部共用吧~\n還有因為某些供應商在某些地區不提供服務,所以就弄了proxy 可在環境設定 .env裡面設定");
  assert.equal(publishedNotes.find((note) => note.id === "2026-09-18-small-optimizations").content, "進行了一些看不見的小優化");
  const previous = publishedNotes.find((note) => note.id === "2026-09-14-api-retries");
  assert.equal(previous.title, "自定義:重新請求的次數");
  assert.match(previous.content, /默認次數為三次/u);
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
  assert.equal(ui.el.updateNotesList.children.length, publishedNotes.length + 1);
  ui.el.updateNotesList.children[1].listeners.click();
  assert.equal(ui.el.updateNotesList.children[1].attributes["aria-pressed"], "true");
});

test("readers of the previous announcement see the latest update once", async () => {
  const ui = setup();
  ui.storage.set("time_tavern_update_notes_seen", "2026-09-14-api-retries");
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 1);
  assert.equal(ui.el.updateNotesList.children.length, publishedNotes.length);
  assert.equal(ui.storage.get("time_tavern_update_notes_seen"), publishedNotes[0].id);
  ui.el.updateNotesDialog.open = false;
  await ui.open(true);
  assert.equal(ui.el.updateNotesDialog.shows, 1);
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
