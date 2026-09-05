import assert from "node:assert/strict";
import test from "node:test";

import {
  appendChatImageAnalysisToModelContent,
  buildMultimodalMessageContent,
  createChatImageAnalysisFingerprint,
  getMessageImageAnalysis,
  normalizeChatImageAttachments,
  normalizeChatImageInputMode,
  sanitizeChatApiMessagesForLog
} from "../src/chat-images.js";

const tinyPng = "data:image/png;base64,iVBORw0KGgo=";

test("chat images are validated and converted to multimodal message blocks", () => {
  const images = normalizeChatImageAttachments([{
    imageUrl: tinyPng,
    fileName: "sample.png"
  }]);
  const content = buildMultimodalMessageContent("描述圖片", { images });

  assert.equal(images[0].contentType, "image/png");
  assert.equal(content[0].type, "text");
  assert.equal(content[1].type, "image_url");
  assert.equal(content[1].image_url.url, tinyPng);
});

test("chat image limits and unsupported formats are rejected", () => {
  assert.throws(
    () => normalizeChatImageAttachments([{ imageUrl: "data:image/svg+xml;base64,PHN2Zz4=" }]),
    /格式不支援/u
  );
  assert.throws(
    () => normalizeChatImageAttachments([
      { imageUrl: tinyPng },
      { imageUrl: tinyPng }
    ], { maxCount: 1 }),
    /最多上傳 1 張/u
  );
});

test("AI logs omit image base64 payloads", () => {
  const messages = [{
    role: "user",
    content: buildMultimodalMessageContent("test", {
      images: [{ imageUrl: tinyPng }]
    })
  }];
  const sanitized = sanitizeChatApiMessagesForLog(messages);

  assert.doesNotMatch(JSON.stringify(sanitized), /iVBORw0KGgo/u);
  assert.match(sanitized[0].content[1].image_url.url, /image omitted/u);
});

test("specialist analysis replaces image blocks without removing stored images", () => {
  const images = [{ imageUrl: tinyPng, fileName: "sample.png", contentType: "image/png" }];
  const fingerprint = createChatImageAnalysisFingerprint(images, "她手上是甚麼？");
  const message = {
    images,
    imageAnalysis: {
      fingerprint,
      content: "圖片中的人物手上拿著一本書。",
      provider: "openai",
      model: "vision-model"
    }
  };
  const modelContent = appendChatImageAnalysisToModelContent(
    "她手上是甚麼？",
    message.imageAnalysis.content
  );

  assert.equal(normalizeChatImageInputMode("unknown"), "main");
  assert.equal(normalizeChatImageInputMode("specialist"), "specialist");
  assert.equal(getMessageImageAnalysis(message)?.fingerprint, fingerprint);
  assert.equal(buildMultimodalMessageContent(modelContent, message), modelContent);
  assert.equal(message.images[0].imageUrl, tinyPng);
  assert.match(modelContent, /圖片處理模型辨識結果/u);
});

test("image analysis stays ahead of optional user supplements and replaces stale analysis", () => {
  const first = appendChatImageAnalysisToModelContent(
    "使用者問題\n\n【使用者自訂補充】\n補充規則",
    "第一次描述"
  );
  const second = appendChatImageAnalysisToModelContent(first, "第二次描述");

  assert.ok(second.indexOf("圖片處理模型辨識結果") < second.indexOf("使用者自訂補充"));
  assert.doesNotMatch(second, /第一次描述/u);
  assert.match(second, /第二次描述/u);
});

test("image analysis fingerprints change with text or image content", () => {
  const first = createChatImageAnalysisFingerprint([{ imageUrl: tinyPng }], "問題一");
  const second = createChatImageAnalysisFingerprint([{ imageUrl: tinyPng }], "問題二");
  const third = createChatImageAnalysisFingerprint([{ imageUrl: `${tinyPng}A` }], "問題一");

  assert.notEqual(first, second);
  assert.notEqual(first, third);
});
