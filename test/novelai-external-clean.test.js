import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script = new URL("../novelai.js", import.meta.url);
const source = fs.readFileSync(fs.existsSync(script) ? script : new URL("../src/public/novelai.js", import.meta.url), "utf8");
const start = source.indexOf("async function prepareExternalImageDownload(");
const helper = source.slice(start, source.indexOf("\nfunction openDownloadDialog(", start));

function harness(overrides = {}) {
  const events = [];
  const canvas = { width: 10, height: 20 };
  const button = { disabled: false };
  const input = { value: "selected" };
  const scope = vm.createContext({
    el: { novelAiCleanExternalImageBtn: button, novelAiCleanExternalImageFile: input, novelAiMetadataStatus: {} },
    decodePngBlobImageData: async (_, max) => { assert.equal(max, 40000000); return { canvas, context: { putImageData() { events.push("pixels"); } }, imageData: {} }; },
    stripPngStealthImageData: () => false,
    canvasToBlob: async (_, type) => { events.push(type); return { clean: true }; },
    sanitizeDownloadFileName: (name) => name,
    triggerBlobDownload: (blob, name) => events.push({ blob, name }),
    showToast() {},
    ...overrides
  });
  vm.runInContext(helper, scope);
  return { scope, events, canvas, button, input };
}

test("external cleanup re-encodes every supported format without copying source metadata", async () => {
  for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif"]) {
    const { scope, events, canvas } = harness();
    assert.equal((await scope.prepareExternalImageDownload({ type, size: 100 })).clean, true);
    assert.deepEqual(events, ["image/png"]);
    assert.equal(canvas.width, 0);
    assert.equal(canvas.height, 0);
  }
});

test("external cleanup removes stealth pixels and fails closed for invalid input or encoding", async () => {
  const changed = harness({ stripPngStealthImageData: () => true });
  await changed.scope.prepareExternalImageDownload({ type: "image/png", size: 100 });
  assert.deepEqual(changed.events, ["pixels", "image/png"]);
  for (const file of [null, { type: "image/svg+xml" }, { type: "image/png", size: 51 * 1024 * 1024 }]) {
    await assert.rejects(harness().scope.prepareExternalImageDownload(file));
  }
  await assert.rejects(harness({ decodePngBlobImageData: async () => null }).scope.prepareExternalImageDownload({ type: "image/png" }), /不支援/u);
  const failed = harness({ canvasToBlob: async () => null });
  await assert.rejects(failed.scope.prepareExternalImageDownload({ type: "image/png" }), /無法輸出/u);
  assert.equal(failed.canvas.width, 0);
});

test("external download uses a new PNG name, resets the picker and does not download errors", async () => {
  const good = harness();
  await good.scope.downloadCleanExternalImage({ type: "image/jpeg", name: "photo.test.jpg", size: 100 });
  assert.equal(good.events.at(-1).name, "photo.test-clean.png");
  assert.equal(good.button.disabled, false);
  assert.equal(good.input.value, "");
  const bad = harness({ decodePngBlobImageData: async () => { throw new Error("invalid"); } });
  await bad.scope.downloadCleanExternalImage({ type: "image/png", name: "bad.png", size: 100 });
  assert.deepEqual(bad.events, []);
  assert.equal(bad.button.disabled, false);
  assert.equal(bad.input.value, "");
});

test("external cleanup is local-only and reachable through picker and drop actions", () => {
  assert.doesNotMatch(helper, /\b(?:fetch|request|favoriteImage|saveSettingsDraft|localStorage|indexedDB)\s*[.(]/u);
  assert.match(source, /action === "clean"/u);
  assert.match(source, /novelAiCleanExternalImageFile\.addEventListener\("change"/u);
  assert.match(source, /bitmap\.width \* bitmap\.height > maxPixels/u);
  assert.ok(source.includes("if (event?.target === el.novelAiCleanExternalImageFile) return;"));
});
