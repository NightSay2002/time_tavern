const PROVIDER_FIELDS = {
  deepseek: {
    key: ["DEEPSEEK_API_KEY"],
    model: ["DEEPSEEK_MODEL"],
    baseUrl: ["DEEPSEEK_BASE_URL"]
  },
  openai: {
    key: ["OPENAI_API_KEY"],
    model: ["OPENAI_MODEL"],
    baseUrl: ["OPENAI_BASE_URL"]
  },
  gemini: {
    key: ["GEMINI_API_KEY"],
    model: ["GEMINI_MODEL"],
    baseUrl: ["GEMINI_BASE_URL"]
  },
  zhipu: {
    key: ["ZHIPU_API_KEY", "BIGMODEL_API_KEY"],
    model: ["ZHIPU_MODEL", "GLM_MODEL"],
    baseUrl: ["ZHIPU_BASE_URL", "BIGMODEL_BASE_URL"]
  },
  openrouter: {
    key: ["OPENROUTER_API_KEY"],
    model: ["OPENROUTER_MODEL"],
    baseUrl: ["OPENROUTER_BASE_URL"]
  },
  custom: {
    key: ["CUSTOM_API_KEY"],
    model: ["CUSTOM_MODEL"],
    baseUrl: ["CUSTOM_API_BASE_URL"]
  }
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function getOfficialChatApiBaseUrl(provider = "deepseek") {
  return {
    deepseek: "https://api.deepseek.com",
    openai: "https://api.openai.com/v1",
    gemini: "https://generativelanguage.googleapis.com/v1beta/openai",
    zhipu: "https://open.bigmodel.cn/api/paas/v4",
    openrouter: "https://openrouter.ai/api/v1"
  }[normalizeChatApiProviderSetting(provider)] || "";
}

function firstValue(source, keys) {
  for (const key of keys) {
    const value = text(source?.[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

export function normalizeChatApiProviderSetting(value = "") {
  const normalized = text(value).toLowerCase().replace(/[-\s]+/gu, "_");
  if (["zhipu", "glm", "bigmodel"].includes(normalized)) {
    return "zhipu";
  }
  return Object.hasOwn(PROVIDER_FIELDS, normalized) ? normalized : "deepseek";
}

export function canDisableChatApiReasoning(provider = "", model = "") {
  const normalizedProvider = normalizeChatApiProviderSetting(provider);
  const normalizedModel = text(model).toLowerCase();
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

export function createChatApiProviderDrafts(parsedEnv = {}) {
  const source = parsedEnv && typeof parsedEnv === "object" ? parsedEnv : {};
  const activeProvider = normalizeChatApiProviderSetting(
    source.CHAT_API_PROVIDER || source.CONVERSATION_API_PROVIDER
  );
  const drafts = Object.fromEntries(
    Object.entries(PROVIDER_FIELDS).map(([provider, fields]) => [provider, {
      key: firstValue(source, fields.key),
      model: firstValue(source, fields.model),
      baseUrl: firstValue(source, fields.baseUrl)
    }])
  );
  const activeDraft = drafts[activeProvider];
  if (!activeDraft.key) {
    activeDraft.key = firstValue(source, ["CHAT_API_KEY", "CONVERSATION_API_KEY"]);
  }
  activeDraft.model = text(source.CHAT_API_MODEL || source.CONVERSATION_API_MODEL) || activeDraft.model;
  activeDraft.baseUrl = text(source.CHAT_API_BASE_URL || source.CONVERSATION_API_BASE_URL) || activeDraft.baseUrl;
  return { activeProvider, drafts };
}

export function getChatApiProviderEnvEntries(drafts = {}) {
  return Object.entries(PROVIDER_FIELDS).flatMap(([provider, fields]) => {
    const draft = drafts?.[provider] || {};
    return [
      [fields.key[0], text(draft.key)],
      [fields.model[0], text(draft.model)],
      [fields.baseUrl[0], text(draft.baseUrl)]
    ];
  });
}

export function resolveChatApiReasoningEffort(parsedEnv = {}, provider = "deepseek") {
  const source = parsedEnv && typeof parsedEnv === "object" ? parsedEnv : {};
  const unified = text(source.CHAT_API_REASONING_EFFORT);
  if (unified) {
    return unified;
  }
  return normalizeChatApiProviderSetting(provider) === "zhipu"
    ? firstValue(source, ["GLM_REASONING_EFFORT", "ZHIPU_REASONING_EFFORT"])
    : firstValue(source, ["DEEPSEEK_REASONING_EFFORT"]);
}
