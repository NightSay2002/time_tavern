const PROVIDERS = ["deepseek", "openai", "gemini", "zhipu", "openrouter", "custom"];

export function normalizePricingEndpoint(provider, endpoint = "") {
  const text = String(endpoint || "").trim();
  if (provider !== "custom") return provider === "openrouter" ? text : "";
  if (!text) return "";
  const url = new URL(text);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("自訂價格的 API 網址無效。");
  return `${url.origin}${url.pathname.replace(/\/+$/u, "")}`;
}

export function parseApiPriceOverrides(value = "") {
  let rows;
  try { rows = value ? JSON.parse(value) : []; } catch { throw new Error("API 自訂單價不是有效 JSON。"); }
  if (!Array.isArray(rows) || rows.length > 100) throw new Error("API 自訂單價最多可設定 100 組。");
  const seen = new Set();
  return rows.map((row, index) => {
    const fail = (detail) => { throw new Error(`API 自訂單價第 ${index + 1} 組：${detail}`); };
    if (!row || typeof row !== "object") return fail("資料格式無效。");
    const provider = String(row.provider || "").trim();
    const model = String(row.model || "").trim();
    const currency = String(row.currency || "").trim().toUpperCase();
    if (!PROVIDERS.includes(provider)) return fail("請選擇供應商。");
    if (model.length > 256 || String(row.endpoint || "").length > 2048) return fail("模型 ID 或端點網址過長。");
    let endpoint;
    try { endpoint = normalizePricingEndpoint(provider, row.endpoint); } catch { return fail("API 網址無效。"); }
    if (!model && provider !== "custom") return fail("請填寫精確模型 ID。");
    if (["custom", "openrouter"].includes(provider) && !endpoint) return fail("請填寫自訂完整 API 網址或 OpenRouter 端點識別碼。");
    if (!/^[A-Z]{3}$/u.test(currency)) return fail("請選擇幣種。");
    const price = (key, optional = false) => {
      const raw = row[key];
      if (optional && (raw === "" || raw === null || raw === undefined)) return null;
      if (!["number", "string"].includes(typeof raw) || String(raw).trim() === "" || !Number.isFinite(Number(raw)) || Number(raw) < 0 || Number(raw) > 1e9) return fail("單價必須是 0 至 1000000000 的數字；留空不代表免費。");
      return Number(raw);
    };
    const key = JSON.stringify([provider, model, endpoint]);
    if (seen.has(key)) return fail("同一供應商、模型及端點不可重複設定。");
    seen.add(key);
    return { provider, model, endpoint, currency, inputCacheMissPerMillion: price("inputCacheMissPerMillion"),
      inputCacheHitPerMillion: price("inputCacheHitPerMillion", true), outputPerMillion: price("outputPerMillion") };
  });
}

export function getManualApiPricing(value, provider, model, endpoint) {
  try {
    const normalizedEndpoint = normalizePricingEndpoint(provider, endpoint);
    return parseApiPriceOverrides(value).find(row => row.provider === provider && row.model === model && row.endpoint === normalizedEndpoint) || null;
  } catch {
    return null;
  }
}

export function formatApiPriceOverridesEnv(value) {
  return `'${JSON.stringify(parseApiPriceOverrides(value)).replace(/'/gu, "\\u0027")}'`;
}
