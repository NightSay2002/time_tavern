const PROVIDER_KEY_ALIASES = {
  deepseek: ["DEEPSEEK_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  gemini: ["GEMINI_API_KEY"],
  zhipu: ["ZHIPU_API_KEY", "BIGMODEL_API_KEY"],
  openrouter: ["OPENROUTER_API_KEY"],
  custom: ["CUSTOM_API_KEY"]
};

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeProvider(value = "") {
  const provider = text(value).toLowerCase().replace(/[-\s]+/gu, "_");
  if (["zhipu", "glm", "bigmodel"].includes(provider)) {
    return "zhipu";
  }
  return Object.hasOwn(PROVIDER_KEY_ALIASES, provider) ? provider : "deepseek";
}

export function getChatApiProviderKeyAliases(provider = "deepseek") {
  return [...PROVIDER_KEY_ALIASES[normalizeProvider(provider)]];
}

export function resolveChatApiKey(envSource = {}, provider = "deepseek") {
  const source = envSource && typeof envSource === "object" ? envSource : {};
  const aliases = getChatApiProviderKeyAliases(provider);
  const activeProvider = text(source.CHAT_API_PROVIDER || source.CONVERSATION_API_PROVIDER);
  if (!activeProvider || normalizeProvider(activeProvider) === normalizeProvider(provider)) {
    aliases.push("CHAT_API_KEY", "CONVERSATION_API_KEY");
  }
  for (const key of aliases) {
    const value = text(source[key]);
    if (value) {
      return value;
    }
  }
  return "";
}
