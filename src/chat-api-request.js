const DEEPSEEK_REASONING_EFFORTS = new Set(["none", "low", "high", "max"]);

export function normalizeChatApiMaxTokensParamName(value = "") {
  return value === "max_completion_tokens" ? "max_completion_tokens" : "max_tokens";
}

export function normalizeDeepSeekReasoningEffort(value = "") {
  const normalized = String(value || "").trim().toLowerCase();
  return DEEPSEEK_REASONING_EFFORTS.has(normalized) ? normalized : "";
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
  const normalizedEffort = normalizeDeepSeekReasoningEffort(reasoningEffort);
  const explicitDeepSeekThinking = normalizedProvider === "deepseek" && normalizedEffort;
  const requestBody = {
    model,
    messages
  };

  if (!explicitDeepSeekThinking || normalizedEffort === "none") {
    requestBody.temperature = temperature;
  }

  if (explicitDeepSeekThinking) {
    requestBody.thinking = {
      type: normalizedEffort === "none" ? "disabled" : "enabled"
    };
    if (normalizedEffort !== "none") {
      requestBody.reasoning_effort = normalizedEffort;
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
