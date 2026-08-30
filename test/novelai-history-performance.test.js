import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const novelAiSource = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");
const novelAiHtml = fs.readFileSync(new URL("../src/public/novelai.html", import.meta.url), "utf8");

function functionSource(name, nextName) {
  const asyncStart = novelAiSource.indexOf(`async function ${name}(`);
  const start = asyncStart >= 0 ? asyncStart : novelAiSource.indexOf(`function ${name}(`);
  const asyncEnd = novelAiSource.indexOf(`\nasync function ${nextName}(`, start);
  const end = asyncEnd >= 0
    ? asyncEnd
    : novelAiSource.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return novelAiSource.slice(start, end);
}

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

test("favorite changes preserve the current library view and page", () => {
  const favoriteSource = functionSource("favoriteImage", "unfavoriteImage");
  const unfavoriteSource = functionSource("unfavoriteImage", "readPngChunkType");

  assert.doesNotMatch(favoriteSource, /novelAiHistoryPage\s*=\s*1/u);
  assert.doesNotMatch(unfavoriteSource, /novelAiHistoryPage\s*=\s*1/u);
  assert.doesNotMatch(unfavoriteSource, /novelAiLibraryView\s*=/u);
  assert.match(favoriteSource, /await renderHistory\(\)/u);
  assert.match(unfavoriteSource, /await renderHistory\(\)/u);
});

test("keyboard history navigation loads the adjacent page at an edge", () => {
  const navigationSource = functionSource("moveHistorySelection", "canUseHistoryKeyboard");

  assert.match(navigationSource, /async function moveHistorySelection/u);
  assert.match(navigationSource, /const nextPage = novelAiHistoryPage \+ step/u);
  assert.match(navigationSource, /novelAiHistoryPage = nextPage/u);
  assert.match(navigationSource, /await renderHistory\(\)/u);
  assert.match(navigationSource, /selectHistoryItem\(nextItem/u);
});

test("new image generation preserves the current library view and page", () => {
  const generationSource = functionSource("runNovelAiGenerationOnce", "generateImages");

  assert.match(generationSource, /await saveHistoryItems\(generatedImages\)/u);
  assert.doesNotMatch(generationSource, /novelAiHistoryPage\s*=\s*1/u);
  assert.doesNotMatch(generationSource, /novelAiLibraryView\s*=/u);
  assert.match(generationSource, /await renderHistory\(\)/u);
});
