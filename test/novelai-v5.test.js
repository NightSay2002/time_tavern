import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const novelAiSource = fs.readFileSync(new URL("../src/public/novelai.js", import.meta.url), "utf8");

test("NovelAI UI offers both V5 models and disables unsupported controls", () => {
  assert.match(novelAiSource, /\["nai-diffusion-5-full", "NAI Diffusion V5 Full"\]/u);
  assert.match(novelAiSource, /\["nai-diffusion-5-curated", "NAI Diffusion V5 Curated"\]/u);
  assert.match(novelAiSource, /function syncNovelAiModelCapabilities\(options = \{\}\)/u);
  assert.match(novelAiSource, /el\.novelAiNoiseSchedule\.value = "karras";/u);
  assert.match(novelAiSource, /node\.classList\.toggle\("hidden", isV5\);/u);
  assert.match(novelAiSource, /button\.hidden = isV5;/u);
  assert.match(novelAiSource, /button\.disabled = isV5;/u);
  assert.match(novelAiSource, /syncNovelAiModelCapabilities\(\{ restorePrevious: false \}\);/u);
});

test("NovelAI V5 requests use version 4 without unsupported reference parameters", () => {
  assert.match(serverSource, /const isV5 = isNovelAiV5Model\(model\);/u);
  assert.match(serverSource, /const varietyPlus = !isV5 && normalizeNovelAiVarietyPlus\(source\);/u);
  assert.match(serverSource, /const activeVibeImages = !isV5/u);
  assert.match(serverSource, /const activePreciseImages = !isV5/u);
  assert.match(serverSource, /params_version: isV5\s*\? 4/u);
  assert.match(serverSource, /const noiseSchedule = isV5\s*\? "karras"/u);
  assert.match(serverSource, /if \(usesNovelAiStructuredPrompt\(model\)\)/u);
  assert.match(serverSource, /parameters\.tag_hint_qt = parameters\.qualityToggle \? 1 : 0;/u);
});
