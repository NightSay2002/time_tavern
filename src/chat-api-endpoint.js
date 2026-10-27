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

export function resolveChatApiModelForEndpoint(configuredModel = "", fallbackModel = "", completionsUrl = "", provider = "") {
  if (isDeploymentChatCompletionsUrl(completionsUrl)) {
    return "";
  }
  const model = text(configuredModel) || text(fallbackModel);
  return provider === "gemini" ? model.replace(/^models\//u, "") : model;
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

export async function listChatApiModels(config = {}, fetchImpl = fetch) {
  if (config.provider === "zhipu") {
    throw new Error("智譜官方文件未公開通用模型列表 API；請參閱官方模型總覽並手動填寫，不能將 OpenAI 相容視為支援 /models。");
  }
  if (!config.apiKey && config.provider !== "openrouter") {
    throw new Error("請先填寫目前供應商的 API Key。");
  }
  const completionsUrl = buildChatApiCompletionsUrl(config.baseUrl);
  if (isDeploymentChatCompletionsUrl(completionsUrl)) {
    throw new Error("完整 deployment 網址不提供通用模型清單，請手動填寫模型或保留空白。");
  }
  let url;
  try {
    url = new URL(completionsUrl);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      throw new Error("invalid URL");
    }
  } catch {
    throw new Error("請設定有效的 API Base URL。");
  }
  url.pathname = url.pathname.replace(/\/chat\/completions\/?$/u, "/models");
  if (config.provider === "openrouter") {
    if (config.openrouterProvider) url.searchParams.set("providers", text(config.openrouterProvider).split("/")[0]);
    if (config.imageOnly) url.searchParams.set("input_modalities", "image");
  }
  const headers = { accept: "application/json" };
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const models = new Map();
  const cursors = new Set();
  try {
    for (let page = 0; page < 20; page += 1) {
      let response;
      try {
        response = await fetchImpl(url.toString(), { headers, signal: controller.signal, redirect: "error" });
      } catch {
        throw new Error(controller.signal.aborted ? "取得模型清單逾時。" : "無法連接模型清單 API。");
      }
      if (!response.ok) {
        if (config.provider === "gemini" && response.status === 400) {
          const errorPayload = await response.json().catch(() => null);
          if (/User location is not supported/iu.test(text(errorPayload?.error?.message))) {
            throw new Error("取得模型清單失敗（HTTP 400）：Gemini 不支援目前連線地區，請檢查 API Proxy 設定與代理出口地區。");
          }
        }
        throw new Error(`取得模型清單失敗（HTTP ${response.status}）；請檢查 Key 與平台是否支援 /models，仍可手動填寫模型。`);
      }
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error("模型清單不是有效的 JSON 回應。");
      }
      if (!Array.isArray(payload?.data)) {
        throw new Error("平台未回傳標準模型清單，請手動填寫模型。");
      }
      for (const item of payload.data) {
        const id = config.provider === "gemini" ? text(item?.id).replace(/^models\//u, "") : text(item?.id);
        if (id && id.length <= 256) {
          models.set(id, {
            id, name: text(item.name || (config.provider === "gemini" ? item.display_name : "")).slice(0, 256) || id,
            ...(config.provider === "openrouter" ? {
              pricing: normalizeOpenRouterPricing(item.pricing),
              inputModalities: Array.isArray(item.architecture?.input_modalities) ? item.architecture.input_modalities.filter((value) => typeof value === "string") : [],
              contextLength: Number(item.context_length) || null
            } : {})
          });
        }
      }
      if (!payload.has_more) {
        return [...models.values()].sort((a, b) => a.id.localeCompare(b.id));
      }
      const cursor = text(payload.last_id) || text(payload.data.at(-1)?.id);
      if (!cursor || cursors.has(cursor)) {
        throw new Error("模型清單分頁異常，請稍後重試。");
      }
      cursors.add(cursor);
      url.searchParams.set("after", cursor);
    }
    throw new Error("模型清單分頁過多，請手動填寫模型。");
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeOpenRouterPricing(value = {}) {
  const prices = {};
  for (const key of ["prompt", "completion", "input_cache_read", "input_cache_write", "image", "request", "web_search", "internal_reasoning"]) {
    const raw = value?.[key];
    if ((typeof raw === "number" || typeof raw === "string") && String(raw).trim() !== "" && Number.isFinite(Number(raw)) && Number(raw) >= 0) {
      prices[key] = String(raw);
    }
  }
  return prices;
}

async function fetchOpenRouterCatalog(path, config, fetchImpl) {
  if (config.provider !== "openrouter") throw new Error("此介面僅適用 OpenRouter。");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetchImpl(`https://openrouter.ai/api/v1/${path}`, {
      headers: { accept: "application/json", ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
      signal: controller.signal, redirect: "error"
    });
    if (!response.ok) throw new Error(`OpenRouter 清單 API 回傳 HTTP ${response.status}。`);
    const payload = await response.json();
    if (!payload?.data) throw new Error("OpenRouter 清單格式不完整。");
    return payload.data;
  } catch (error) {
    if (controller.signal.aborted) throw new Error("OpenRouter 清單 API 逾時。");
    if (/^OpenRouter/u.test(error.message)) throw error;
    throw new Error("無法讀取 OpenRouter 清單 API。");
  } finally {
    clearTimeout(timeout);
  }
}

export async function listOpenRouterProviders(config = {}, fetchImpl = fetch) {
  const data = await fetchOpenRouterCatalog("providers", config, fetchImpl);
  if (!Array.isArray(data)) throw new Error("OpenRouter 供應商清單格式不完整。");
  return data.filter((item) => text(item?.slug)).map((item) => ({
    slug: text(item.slug).slice(0, 200), name: text(item.name).slice(0, 256) || text(item.slug)
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listOpenRouterModelEndpoints(config = {}, fetchImpl = fetch) {
  const model = text(config.model);
  const parts = model.split("/");
  if (parts.length !== 2 || parts.some((part) => !part || part === "." || part === "..") || model.length > 256) {
    throw new Error("請先選擇完整 OpenRouter 模型 ID（作者/模型）。");
  }
  const data = await fetchOpenRouterCatalog(`models/${parts.map(encodeURIComponent).join("/")}/endpoints`, config, fetchImpl);
  if (!Array.isArray(data.endpoints)) throw new Error("OpenRouter 端點清單格式不完整。");
  return {
    model: text(data.id) || model,
    inputModalities: Array.isArray(data.architecture?.input_modalities) ? data.architecture.input_modalities : [],
    endpoints: data.endpoints.filter((item) => text(item?.tag)).map((item) => ({
      tag: text(item.tag).slice(0, 200), providerName: text(item.provider_name).slice(0, 256),
      name: text(item.name).slice(0, 256), pricing: normalizeOpenRouterPricing(item.pricing),
      contextLength: Number(item.context_length) || null,
      maxCompletionTokens: Number(item.max_completion_tokens) || null,
      quantization: text(item.quantization), status: typeof item.status === "number" ? item.status : null
    }))
  };
}
