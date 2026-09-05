import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

test("specialist image API is wired before the shared conversation generator", () => {
  assert.match(serverSource, /prepareUserImagesForModel: prepareUserMessageImagesForModel/u);
  assert.match(serverSource, /purpose: "image_understanding"/u);
  assert.match(serverSource, /createChatImageAnalysisFingerprint\(images, storedUserContent\)/u);
  assert.match(serverSource, /\["CHAT_IMAGE_API_REASONING_EFFORT"\]/u);
  assert.match(serverSource, /\["CHAT_IMAGE_API_TEMPERATURE"\]/u);
  assert.match(serverSource, /reasoningEffort: config\.reasoningEffort/u);
  assert.match(serverSource, /temperature: config\.temperature/u);
  assert.match(serverSource, /getChatImageInputMode\(\) === "specialist"[\s\S]*safeText\(content\)/u);
  assert.equal((serverSource.match(/const replayImageAnalysis = getChatImageInputMode\(\) === "specialist"/gu) || []).length, 2);
  assert.match(serverSource, /pathname === "\/api\/chat-image-api\/test"/u);
  assert.doesNotMatch(
    serverSource.match(/async function requestChatImageUnderstanding[\s\S]*?\n\}/u)?.[0] || "",
    /getChatApiKey\(|assignConversationApiKeyGroup\(/u
  );
});

test("environment UI exposes independent specialist settings and a real image test", () => {
  [
    "CHAT_IMAGE_INPUT_MODE",
    "CHAT_IMAGE_API_PROVIDER",
    "CHAT_IMAGE_API_BASE_URL",
    "CHAT_IMAGE_API_MODEL",
    "CHAT_IMAGE_API_REASONING_EFFORT",
    "CHAT_IMAGE_API_TEMPERATURE",
    "CHAT_IMAGE_API_KEY"
  ].forEach((key) => assert.match(webSource, new RegExp(key, "u")));
  assert.match(webSource, /testChatImageApiConnectionBtn/u);
  assert.match(webSource, /\/api\/chat-image-api\/test/u);
  assert.match(webSource, /function syncChatImageApiFields\(\)/u);
  assert.match(webSource, /input\.disabled = !specialistEnabled/u);
  assert.match(webSource, /\["CHAT_IMAGE_INPUT_MODE", "CHAT_IMAGE_API_PROVIDER", "CHAT_IMAGE_API_REASONING_EFFORT"\]\.includes\(key\)/u);
  assert.match(webSource, /const temperatureDisabled = !specialistEnabled/u);

  const imageMatch = serverSource.match(/CHAT_IMAGE_API_TEST_IMAGE = "data:image\/png;base64,([A-Za-z0-9+/=]+)"/u);
  const image = Buffer.from(imageMatch?.[1] || "", "base64");
  assert.equal(image.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(image.readUInt32BE(16), 32);
  assert.equal(image.readUInt32BE(20), 32);
  assert.equal(image[25], 6);
  assert.match(serverSource, /userContent: "這是連接測試圖片，請簡短描述。",\n\s+maxTokens: 1024/u);
});
