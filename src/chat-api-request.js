const DEEPSEEK_REASONING_EFFORTS = new Set(["none", "low", "high", "max"]);
const GLM_REASONING_EFFORTS = new Set(["none", "low", "high", "max"]);

export function normalizeChatApiMaxTokensParamName(value = "") {
  return value === "max_completion_tokens" ? "max_completion_tokens" : "max_tokens";
}

export function normalizeDeepSeekReasoningEffort(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return DEEPSEEK_REASONING_EFFORTS.has(normalized) ? normalized : "";
}

export function normalizeGlmReasoningEffort(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return GLM_REASONING_EFFORTS.has(normalized) ? normalized : "";
}

export function canDisableChatApiReasoning(provider = "", model = "") {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  const normalizedModel = String(model || "").trim().toLowerCase();
  if (normalizedProvider === "deepseek") {
    return true;
  }
  if (normalizedProvider === "zhipu") {
    const match = normalizedModel.match(/^glm-(\d+)(?:[.]([0-9]+))?/u);
    if (!match) {
      return false;
    }
    const major = Number(match[1]);
    const minor = Number(match[2] || 0);
    return major > 4 || (major === 4 && minor >= 5);
  }
  if (normalizedProvider === "gemini") {
    return /^gemini-2[.]5-(?:flash|flash-lite)(?:-|$)/u.test(normalizedModel);
  }
  if (normalizedProvider === "openai") {
    if (/^gpt-5(?:[.]\d+)?-pro(?:-|$)/u.test(normalizedModel)) {
      return false;
    }
    const match = normalizedModel.match(/^gpt-5[.](\d+)(?:-|$)/u);
    return Boolean(match && Number(match[1]) >= 1);
  }
  return false;
}

export function canSetChatApiReasoningStrength(provider = "", model = "") {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  if (normalizedProvider === "deepseek") {
    return true;
  }
  if (normalizedProvider !== "zhipu") {
    return false;
  }
  const match = String(model || "").trim().toLowerCase().match(/^glm-(\d+)(?:[.]([0-9]+))?/u);
  if (!match) {
    return false;
  }
  const major = Number(match[1]);
  const minor = Number(match[2] || 0);
  return major > 5 || (major === 5 && minor >= 2);
}

export function resolveChatApiReasoningEffort(provider = "", value = "", model = "") {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  if (normalizedProvider === "deepseek") {
    return normalizeDeepSeekReasoningEffort(value) || "high";
  }
  if (normalizedProvider === "zhipu") {
    const normalized = normalizeGlmReasoningEffort(value);
    if (normalized === "none") {
      return canDisableChatApiReasoning(normalizedProvider, model) ? normalized : "";
    }
    return canSetChatApiReasoningStrength(normalizedProvider, model) ? normalized : "";
  }
  if (["gemini", "openai"].includes(normalizedProvider)) {
    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "none" && canDisableChatApiReasoning(normalizedProvider, model) ? "none" : "";
  }
  return "";
}

export function shouldIncludeUserCustomSupplement(reasoningEffort = "") {
  return String(reasoningEffort || "").trim().toLowerCase() !== "none";
}

export function normalizeChatApiRetryCount(value = 3) {
  if (value === null || String(value).trim() === "") return 3;
  const count = Number(value);
  return Number.isFinite(count) ? Math.min(20, Math.max(0, Math.floor(count))) : 3;
}

function waitForChatApiRetry(ms, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(signal?.reason || new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
  });
}

export async function fetchChatApiWithRetry(url, options, {
  retries = 0,
  fetchImpl = fetch,
  wait = waitForChatApiRetry
} = {}) {
  const limit = normalizeChatApiRetryCount(retries);
  for (let attempt = 0; ; attempt += 1) {
    options.signal?.throwIfAborted();
    let response;
    let retryAfterMs = 0;
    try {
      response = await fetchImpl(url, options);
    } catch (error) {
      const code = String(error?.cause?.code || error?.code || "");
      const retryable = error?.message === "fetch failed" ||
        /^(?:ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|UND_ERR_CONNECT_TIMEOUT|UND_ERR_SOCKET)$/u.test(code);
      if (options.signal?.aborted || error?.name === "AbortError" ||
          /CERT|TLS|SSL|INVALID|UNABLE_TO_VERIFY_LEAF_SIGNATURE/iu.test(code) || !retryable || attempt >= limit) throw error;
    }
    if (response) {
      if (options.signal?.aborted || ![408, 429, 500, 502, 503, 504].includes(response.status) || attempt >= limit) return response;
      const header = response.headers.get("retry-after");
      if (header) {
        const seconds = Number(header);
        retryAfterMs = Number.isFinite(seconds) ? Math.max(0, seconds * 1000) : Math.max(0, Date.parse(header) - Date.now());
      }
      // Release failed responses before retrying; never consume a successful stream here.
      try { await response.body?.cancel(); } catch { /* The failed body may already be closed. */ }
    }
    const delay = Math.max(Math.min(1000 * 2 ** attempt, 10000), Number.isFinite(retryAfterMs) ? retryAfterMs : 0);
    await wait(Math.min(delay, 2147483647), options.signal);
  }
}

export function normalizeOpenRouterProvider(value = "") {
  const slug = String(value || "").trim().toLowerCase();
  if (slug && !/^[a-z0-9][a-z0-9._/-]{0,199}$/u.test(slug)) {
    throw new Error("OpenRouter 推理供應商識別碼無效。");
  }
  return slug;
}

export function buildChatApiRequestBody({
  provider = "",
  openrouterProvider = "",
  reasoningEffort = "",
  model,
  temperature,
  maxTokens,
  messages,
  stream = false,
  responseFormat = null,
  maxTokensParamName = "max_tokens"
}) {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  const normalizedDeepSeekEffort = normalizeDeepSeekReasoningEffort(reasoningEffort);
  const normalizedGlmEffort = normalizeGlmReasoningEffort(reasoningEffort);
  const explicitDeepSeekThinking = normalizedProvider === "deepseek" && normalizedDeepSeekEffort;
  const supportsThinkingToggle = canDisableChatApiReasoning(normalizedProvider, model);
  const supportsReasoningStrength = canSetChatApiReasoningStrength(normalizedProvider, model);
  const requestBody = {
    model,
    messages
  };
  if (normalizedProvider === "openrouter") {
    const slug = normalizeOpenRouterProvider(openrouterProvider);
    if (slug) {
      requestBody.provider = { only: [slug], order: [slug], allow_fallbacks: false };
    }
  }

  if (
    Number.isFinite(temperature) &&
    (!explicitDeepSeekThinking || normalizedDeepSeekEffort === "none")
  ) {
    requestBody.temperature = temperature;
  }

  if (explicitDeepSeekThinking) {
    requestBody.thinking = {
      type: normalizedDeepSeekEffort === "none" ? "disabled" : "enabled"
    };
    if (normalizedDeepSeekEffort !== "none") {
      requestBody.reasoning_effort = normalizedDeepSeekEffort;
    }
  }

  if (normalizedProvider === "zhipu" && supportsThinkingToggle && normalizedGlmEffort) {
    requestBody.thinking = {
      type: normalizedGlmEffort === "none" ? "disabled" : "enabled",
      ...(normalizedGlmEffort === "none" ? {} : { clear_thinking: false })
    };
    if (normalizedGlmEffort && normalizedGlmEffort !== "none" && supportsReasoningStrength) {
      requestBody.reasoning_effort = normalizedGlmEffort;
    }
  }

  if (["gemini", "openai"].includes(normalizedProvider) && reasoningEffort === "none" && supportsThinkingToggle) {
    requestBody.reasoning_effort = "none";
  }

  requestBody[normalizeChatApiMaxTokensParamName(maxTokensParamName)] = maxTokens;
  if (stream) {
    requestBody.stream = true;
    requestBody.stream_options = {
      include_usage: true
    };
  }
  if (responseFormat && typeof responseFormat === "object") {
    requestBody.response_format = responseFormat;
  }
  return requestBody;
}
