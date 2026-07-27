import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

test("model image follow-up only exposes and runs the parallel mode", () => {
  assert.doesNotMatch(webSource, /建立圖片，然後繼續觸發正文/u);
  assert.match(webSource, /建立圖片（並行運作），同時繼續正文/u);
  assert.doesNotMatch(serverSource, /const KEYWORD_FOLLOWUP_IMAGE_THEN_REASONER/u);
  assert.doesNotMatch(webSource, /const KEYWORD_FOLLOWUP_IMAGE_THEN_REASONER/u);
  assert.match(serverSource, /queueParallelModelImageGeneration\(imageContext\);/u);
  assert.doesNotMatch(serverSource, /await runModelImageGenerationTask\(imageContext\);/u);
});

test("legacy sequential image settings migrate to parallel mode", () => {
  for (const source of [serverSource, webSource]) {
    assert.match(source, /normalized === "image_then_reasoner"/u);
    assert.match(
      source,
      /normalized === "image_continue"[\s\S]*?return KEYWORD_FOLLOWUP_IMAGE_PARALLEL_REASONER;/u
    );
  }
});
