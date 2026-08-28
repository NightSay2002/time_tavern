const DEEPSEEK_REASONING_EFFORTS = new Set(["none", "low", "high", "max"]);
const GLM_REASONING_EFFORTS = new Set(["low", "high", "max"]);

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

export function resolveChatApiReasoningEffort(provider = "", value = "") {
  const normalizedProvider = String(provider || "").trim().toLowerCase();
  if (normalizedProvider === "deepseek") {
    return normalizeDeepSeekReasoningEffort(value) || "high";
  }
  if (normalizedProvider === "zhipu") {
    return normalizeGlmReasoningEffort(value);
  }
  return "";
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
  const isGlm53 = normalizedProvider === "zhipu" && /^glm-5\.3(?:-|$)/iu.test(String(model || "").trim());
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

  if (isGlm53) {
    requestBody.thinking = {
      type: "enabled",
      clear_thinking: false
    };
    if (normalizedGlmEffort) {
      requestBody.reasoning_effort = normalizedGlmEffort;
    }
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
