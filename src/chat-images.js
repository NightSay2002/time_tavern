import crypto from "node:crypto";

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

export function normalizeChatImageInputMode(value = "") {
  return safeText(value).toLowerCase() === "specialist" ? "specialist" : "main";
}

export function getMessageImageAnalysis(message = {}) {
  const source = message?.imageAnalysis || message?.extra?.imageAnalysis;
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return null;
  }
  const content = safeText(source.content);
  const fingerprint = safeText(source.fingerprint);
  if (!content || !fingerprint) {
    return null;
  }
  return {
    content,
    fingerprint,
    provider: safeText(source.provider),
    model: safeText(source.model),
    createdAt: safeText(source.createdAt)
  };
}

export function createChatImageAnalysisFingerprint(images = [], userContent = "") {
  const hash = crypto.createHash("sha256");
  const updatePart = (value = "") => {
    const text = safeText(value);
    hash.update(`${Buffer.byteLength(text, "utf8")}:`);
    hash.update(text);
  };
  updatePart(userContent);
  (Array.isArray(images) ? images : []).forEach((image) => {
    updatePart(image?.imageUrl || image?.dataUrl || image?.url);
    updatePart(normalizeImageContentType(image?.contentType || image?.content_type));
  });
  return hash.digest("hex");
}

export function appendChatImageAnalysisToModelContent(content = "", analysisContent = "") {
  const base = safeText(content).replace(
    /\n*【圖片處理模型辨識結果】\n[\s\S]*?(?=\n\n【使用者自訂補充】|$)/u,
    ""
  ).trim();
  const analysis = safeText(analysisContent);
  if (!analysis) {
    return base;
  }
  const block = `【圖片處理模型辨識結果】\n${analysis}`;
  const supplementMarker = "【使用者自訂補充】";
  const supplementIndex = base.indexOf(supplementMarker);
  if (supplementIndex < 0) {
    return [base, block].filter(Boolean).join("\n\n");
  }
  return [
    base.slice(0, supplementIndex).trim(),
    block,
    base.slice(supplementIndex).trim()
  ].filter(Boolean).join("\n\n");
}

export function buildMultimodalMessageContent(content = "", message = {}) {
  const text = safeText(content);
  const images = getMessageChatImages(message);
  if (images.length === 0 || getMessageImageAnalysis(message)) {
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
