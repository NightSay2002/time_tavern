const SUPPORTED_IMAGE_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeImageContentType(value = "") {
  const normalized = safeText(value).toLowerCase();
  return normalized === "image/jpg" ? "image/jpeg" : normalized;
}

function getDataUrlParts(value = "") {
  const match = safeText(value).match(/^data:([^;,]+);base64,([a-z\d+/=\s]+)$/iu);
  if (!match) {
    return null;
  }
  const contentType = normalizeImageContentType(match[1]);
  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    return null;
  }
  const base64 = match[2].replace(/\s+/gu, "");
  const buffer = Buffer.from(base64, "base64");
  if (!base64 || buffer.length === 0 || buffer.toString("base64").replace(/=+$/u, "") !== base64.replace(/=+$/u, "")) {
    return null;
  }
  return { contentType, base64, size: buffer.length };
}

export function isSupportedChatImageAttachment(attachment = {}) {
  const contentType = normalizeImageContentType(attachment?.contentType || attachment?.content_type);
  const name = safeText(attachment?.name || attachment?.filename || attachment?.fileName).toLowerCase();
  return SUPPORTED_IMAGE_TYPES.has(contentType) || /\.(?:gif|jpe?g|png|webp)$/iu.test(name);
}

export function normalizeChatImageAttachments(images = [], {
  maxCount = 4,
  maxBytes = 5 * 1024 * 1024
} = {}) {
  const source = Array.isArray(images) ? images : [];
  const countLimit = Math.max(1, Math.floor(Number(maxCount) || 4));
  const byteLimit = Math.max(1, Math.floor(Number(maxBytes) || 5 * 1024 * 1024));
  if (source.length > countLimit) {
    throw new Error(`每次最多上傳 ${countLimit} 張圖片。`);
  }

  return source.map((item, index) => {
    const imageUrl = safeText(item?.imageUrl || item?.dataUrl || item?.url);
    const parsed = getDataUrlParts(imageUrl);
    if (!parsed) {
      throw new Error(`第 ${index + 1} 張圖片格式不支援，請使用 PNG、JPEG、WebP 或 GIF。`);
    }
    if (parsed.size > byteLimit) {
      throw new Error(`第 ${index + 1} 張圖片超過 ${Math.ceil(byteLimit / 1024 / 1024)} MB 上限。`);
    }
    return {
      imageUrl: `data:${parsed.contentType};base64,${parsed.base64}`,
      fileName: safeText(item?.fileName || item?.name || item?.filename).slice(0, 180) || `image-${index + 1}`,
      contentType: parsed.contentType,
      size: parsed.size
    };
  });
}

export function getMessageChatImages(message = {}) {
  const source = message?.images || message?.extra?.images || [];
  return Array.isArray(source) ? source.filter((item) => safeText(item?.imageUrl || item?.dataUrl || item?.url)) : [];
}

export function buildMultimodalMessageContent(content = "", message = {}) {
  const text = safeText(content);
  const images = getMessageChatImages(message);
  if (images.length === 0) {
    return text;
  }
  return [
    ...(text ? [{ type: "text", text }] : []),
    ...images.map((image) => ({
      type: "image_url",
      image_url: {
        url: safeText(image.imageUrl || image.dataUrl || image.url)
      }
    }))
  ];
}

export function sanitizeChatApiMessagesForLog(messages = []) {
  return (Array.isArray(messages) ? messages : []).map((message) => ({
    ...message,
    content: Array.isArray(message?.content)
      ? message.content.map((part) => {
          if (part?.type !== "image_url") {
            return part;
          }
          const url = safeText(part?.image_url?.url);
          const parsed = getDataUrlParts(url);
          return {
            ...part,
            image_url: {
              ...part.image_url,
              url: parsed
                ? `[${parsed.contentType} image omitted, ${parsed.size} bytes]`
                : "[image omitted]"
            }
          };
        })
      : message?.content
  }));
}
