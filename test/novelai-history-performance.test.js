import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const novelAiSource = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
const novelAiHtml = fs.readFileSync(new URL("../src/public/novelai.html", import.meta.url), "utf8");

test("NovelAI history reads one indexed page instead of loading every full image", () => {
  assert.match(novelAiSource, /const NOVELAI_HISTORY_PAGE_SIZE = 20;/u);
  assert.match(novelAiSource, /openCursor\(null, "prev"\)/u);
  assert.doesNotMatch(novelAiSource, /\.getAll\(\)/u);
  assert.match(novelAiHtml, /id="novelAiHistoryPrevBtn"/u);
  assert.match(novelAiHtml, /id="novelAiHistoryNextBtn"/u);
});

test("NovelAI history stores blobs and renders thumbnails lazily", () => {
  assert.match(novelAiSource, /stored\.imageBlob = imageBlob;/u);
  assert.match(novelAiSource, /stored\.thumbnailBlob = await createHistoryThumbnailBlob/u);
  assert.match(novelAiSource, /image\.loading = "lazy";/u);
  assert.match(novelAiSource, /releaseHistoryImageResources\(\);/u);
  assert.match(novelAiSource, /releaseImageViewerResource\(\);/u);
});

test("NovelAI restores reference images from an IndexedDB draft", () => {
  assert.match(novelAiSource, /const NOVELAI_DB_VERSION = 2;/u);
  assert.match(novelAiSource, /const NOVELAI_REFERENCE_DRAFT_STORE = "referenceDraft";/u);
  assert.match(novelAiSource, /async function saveReferenceImageDraft/u);
  assert.match(novelAiSource, /referenceDraft = await loadReferenceImageDraft\(\);/u);
  assert.match(novelAiSource, /includeReferenceImages: hasDraft/u);
  assert.match(novelAiSource, /includeBaseImage: hasDraft/u);
});

test("NovelAI only offers metadata import for an importable dropped image", () => {
  assert.match(novelAiHtml, /data-drop-action="metadata" hidden/u);
  assert.match(novelAiSource, /async function hasImportableNovelAiMetadata/u);
  assert.match(novelAiSource, /metadataButton\.hidden = !hasMetadata;/u);
});

test("NovelAI can clear only the local history store after confirmation", () => {
  assert.match(novelAiHtml, /id="novelAiClearHistoryBtn"/u);
  assert.match(novelAiSource, /transaction\.objectStore\(NOVELAI_HISTORY_STORE\)\.clear\(\);/u);
  assert.match(novelAiSource, /window\.confirm\("確定要清空所有 NovelAI 本地歷史圖片嗎？此操作無法復原。"\)/u);
});

test("NovelAI switches between history and favorites and restores unfavorited images", () => {
  assert.match(novelAiHtml, /id="novelAiHistoryTabBtn"/u);
  assert.match(novelAiHtml, /id="novelAiFavoritesTabBtn"/u);
  assert.match(novelAiSource, /await listAlbumPage\(/u);
  assert.match(novelAiSource, /await saveHistoryItems\(\[historyItem\]\);/u);
  assert.match(novelAiSource, /method: "DELETE"/u);
  assert.match(novelAiSource, /novelAiLibraryView = "history";/u);
});
