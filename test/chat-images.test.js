import assert from "node:assert/strict";
import test from "node:test";

import {
  buildMultimodalMessageContent,
  normalizeChatImageAttachments,
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
