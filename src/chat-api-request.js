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

export function buildChatApiRequestBody({
  provider = "",
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

  if (!explicitDeepSeekThinking || normalizedDeepSeekEffort === "none") {
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
