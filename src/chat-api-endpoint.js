function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isDeploymentChatCompletionsUrl(value = "") {
  try {
    const url = new URL(text(value));
    return /\/deployments\/[^/]+\/chat\/completions\/?$/u.test(url.pathname);
  } catch {
    return false;
  }
}

export function buildChatApiCompletionsUrl(baseUrl = "") {
  const normalizedBaseUrl = text(baseUrl).replace(/\/+$/u, "");
  if (!normalizedBaseUrl) {
    return "";
  }

  let url;
  try {
    url = new URL(normalizedBaseUrl);
  } catch {
    return /\/chat\/completions(?:\?|$)/u.test(normalizedBaseUrl)
      ? normalizedBaseUrl
      : `${normalizedBaseUrl}/chat/completions`;
  }

  const pathname = url.pathname.replace(/\/+$/u, "");
  if (/\/chat\/completions$/u.test(pathname)) {
    return normalizedBaseUrl;
  }

  url.pathname = `${pathname}/chat/completions`;
  return url.toString();
}

export function resolveChatApiModelForEndpoint(configuredModel = "", fallbackModel = "", completionsUrl = "") {
  if (isDeploymentChatCompletionsUrl(completionsUrl)) {
    return "";
  }
  return text(configuredModel) || text(fallbackModel);
}

export function buildChatApiRequestHeaders(apiKey = "", completionsUrl = "") {
  const headers = {
    accept: "application/json",
    "Content-Type": "application/json"
  };
  if (isDeploymentChatCompletionsUrl(completionsUrl)) {
    headers["api-key"] = text(apiKey);
  } else {
    headers.Authorization = `Bearer ${text(apiKey)}`;
  }
  return headers;
}

export function adaptChatApiRequestBody(requestBody = {}, completionsUrl = "") {
  const output = { ...requestBody };
  if (isDeploymentChatCompletionsUrl(completionsUrl)) {
    delete output.model;
  }
  return output;
}
