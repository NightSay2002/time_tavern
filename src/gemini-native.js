const SAFETY_CATEGORIES = [
  "HARM_CATEGORY_HARASSMENT",
  "HARM_CATEGORY_HATE_SPEECH",
  "HARM_CATEGORY_SEXUALLY_EXPLICIT",
  "HARM_CATEGORY_DANGEROUS_CONTENT"
];

function messageParts(content) {
  if (typeof content === "string") return [{ text: content }];
  if (!Array.isArray(content)) throw new Error("Gemini 訊息內容格式不受支援。");
  return content.map((part) => {
    if (part?.type === "text" && typeof part.text === "string") return { text: part.text };
    if (part?.type === "image_url") {
      const url = typeof part.image_url === "string" ? part.image_url : part.image_url?.url;
      const image = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=\r\n]+)$/iu.exec(url || "");
      if (!image) throw new Error("Gemini 僅支援 PNG、JPEG、WebP 或 GIF 的內嵌圖片。");
      return { inlineData: { mimeType: image[1].toLowerCase(), data: image[2].replace(/[\r\n]/gu, "") } };
    }
    throw new Error("Gemini 訊息包含不支援的內容類型。");
  });
}

export function buildGeminiNativeRequest(url, request) {
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || endpoint.hostname !== "generativelanguage.googleapis.com" ||
      endpoint.username || endpoint.password || !/^\/v1beta\/openai\/chat\/completions\/?$/u.test(endpoint.pathname)) {
    throw new Error("Gemini 原生 API 需要 Google 官方 API 位址。");
  }
  const model = String(request.model || "").trim().replace(/^models\//u, "");
  if (!/^[A-Za-z0-9._-]+$/u.test(model)) throw new Error("Gemini 模型名稱無效。");
  const systemParts = [];
  const contents = [];
  for (const message of request.messages || []) {
    const parts = messageParts(message.content);
    if (message.role === "system" || message.role === "developer") {
      systemParts.push(...parts);
      continue;
    }
    if (message.role !== "user" && message.role !== "assistant") throw new Error("Gemini 不支援此訊息角色。");
    const role = message.role === "assistant" ? "model" : "user";
    if (contents.at(-1)?.role === role) contents.at(-1).parts.push(...parts);
    else contents.push({ role, parts });
  }
  const generationConfig = {};
  const maxTokens = request.max_completion_tokens ?? request.max_tokens;
  if (Number.isFinite(maxTokens)) generationConfig.maxOutputTokens = maxTokens;
  if (Number.isFinite(request.temperature)) generationConfig.temperature = request.temperature;
  if (request.response_format?.type === "json_object" || request.response_format?.type === "json_schema") {
    generationConfig.responseMimeType = "application/json";
    if (request.response_format?.json_schema?.schema) generationConfig.responseJsonSchema = request.response_format.json_schema.schema;
  }
  if (request.reasoning_effort) {
    if (/^gemini-2[.]5-/iu.test(model)) {
      const budget = { none: 0, low: 1024, medium: 8192, high: 24576 }[request.reasoning_effort];
      if (budget !== undefined) generationConfig.thinkingConfig = { thinkingBudget: budget };
    } else {
      generationConfig.thinkingConfig = { thinkingLevel: request.reasoning_effort.toUpperCase() };
    }
  }
  endpoint.pathname = `/v1beta/models/${encodeURIComponent(model)}:${request.stream ? "streamGenerateContent" : "generateContent"}`;
  endpoint.search = request.stream ? "?alt=sse" : "";
  return {
    url: endpoint.toString(),
    body: {
      contents,
      ...(systemParts.length ? { systemInstruction: { parts: systemParts } } : {}),
      generationConfig,
      safetySettings: SAFETY_CATEGORIES.map((category) => ({ category, threshold: "BLOCK_NONE" }))
    }
  };
}

function convertGeminiResponse(payload, stream = false) {
  if (payload?.error) throw new Error(`Gemini 回應失敗：${payload.error.message || "未知錯誤"}`);
  const candidate = payload?.candidates?.[0];
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  const content = parts.filter((part) => !part.thought && typeof part.text === "string").map((part) => part.text).join("");
  const reasoning = parts.filter((part) => part.thought && typeof part.text === "string").map((part) => part.text).join("");
  const reason = candidate?.finishReason || payload?.promptFeedback?.blockReason || "";
  const finishReason = ({ STOP: "stop", MAX_TOKENS: "length" })[reason] || reason || null;
  const rawUsage = payload?.usageMetadata;
  let usage;
  if (rawUsage) {
    const visible = rawUsage.candidatesTokenCount;
    const thoughts = rawUsage.thoughtsTokenCount;
    const inferredOutput = Number.isFinite(rawUsage.totalTokenCount) && Number.isFinite(rawUsage.promptTokenCount)
      ? rawUsage.totalTokenCount - rawUsage.promptTokenCount - (rawUsage.toolUsePromptTokenCount || 0) : null;
    usage = {
      prompt_tokens: rawUsage.promptTokenCount,
      completion_tokens: Number.isFinite(visible) ? visible + (Number.isFinite(thoughts) ? thoughts : 0)
        : Number.isFinite(inferredOutput) && inferredOutput >= 0 ? inferredOutput : undefined,
      total_tokens: rawUsage.totalTokenCount,
      prompt_tokens_details: { cached_tokens: rawUsage.cachedContentTokenCount },
      completion_tokens_details: { reasoning_tokens: thoughts }
    };
  }
  const message = { content, ...(reasoning ? { reasoning_content: reasoning } : {}) };
  return {
    choices: candidate || finishReason ? [{ [stream ? "delta" : "message"]: message, finish_reason: finishReason }] : [],
    ...(usage ? { usage } : {})
  };
}

function convertGeminiStream(body) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let upstreamEnded = false;
  let finished = false;
  return new ReadableStream({
    async pull(controller) {
      try {
        while (true) {
          const boundary = /\r?\n\r?\n/u.exec(buffer);
          if (boundary) {
            const block = buffer.slice(0, boundary.index);
            buffer = buffer.slice(boundary.index + boundary[0].length);
            const data = block.split(/\r?\n/u).filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trim()).join("\n");
            if (!data || data === "[DONE]") continue;
            const converted = convertGeminiResponse(JSON.parse(data), true);
            const finishReason = converted.choices[0]?.finish_reason;
            if (finishReason && finishReason !== "FINISH_REASON_UNSPECIFIED") finished = true;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(converted)}\n\n`));
            return;
          }
          if (upstreamEnded) {
            if (buffer.trim()) {
              buffer += "\n\n";
              continue;
            }
            if (!finished) throw new Error("Gemini 串流在回傳結束原因前中斷。");
            controller.close();
            return;
          }
          const { done, value } = await reader.read();
          if (done) {
            buffer += decoder.decode();
            upstreamEnded = true;
          } else {
            buffer += decoder.decode(value, { stream: true });
          }
        }
      } catch (error) {
        try { await reader.cancel(error); } catch { /* The upstream stream may already be closed. */ }
        controller.error(error);
      }
    },
    cancel(reason) { return reader.cancel(reason); }
  });
}

export async function fetchGeminiNative(url, options, fetchImpl) {
  const request = JSON.parse(options.body);
  const native = buildGeminiNativeRequest(url, request);
  const headers = { ...options.headers };
  const authorization = headers.Authorization || headers.authorization || "";
  delete headers.Authorization;
  delete headers.authorization;
  headers["x-goog-api-key"] = authorization.replace(/^Bearer\s+/iu, "");
  const response = await fetchImpl(native.url, { ...options, headers, body: JSON.stringify(native.body) });
  if (!response.ok) return response;
  if (request.stream) {
    if (!response.body) throw new Error("Gemini 串流回應不可讀取。");
    return new Response(convertGeminiStream(response.body), { status: response.status, headers: { "content-type": "text/event-stream" } });
  }
  const payload = await response.json();
  return new Response(JSON.stringify(convertGeminiResponse(payload)), { status: response.status, headers: { "content-type": "application/json" } });
}
