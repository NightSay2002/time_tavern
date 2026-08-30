const PROVIDER_KEY_ALIASES = {
  deepseek: ["DEEPSEEK_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  gemini: ["GEMINI_API_KEY"],
  zhipu: ["ZHIPU_API_KEY", "BIGMODEL_API_KEY"],
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

export function getChatApiKeyGroupPrimaryKeyNames(provider = "deepseek", slot = 1) {
  const groupSlot = Math.max(1, Number.parseInt(slot, 10) || 1);
  const baseNames = [
    ...getChatApiProviderKeyAliases(provider),
    "CHAT_API_KEY",
    "CONVERSATION_API_KEY"
  ];
  return groupSlot === 1
    ? baseNames
    : baseNames.map((name) => `${name}_GROUP${groupSlot}`);
}

export function resolveChatApiKeyGroupPrimaryKey(envSource = {}, provider = "deepseek", slot = 1) {
  const source = envSource && typeof envSource === "object" ? envSource : {};
  for (const key of getChatApiKeyGroupPrimaryKeyNames(provider, slot)) {
    const value = text(source[key]);
    if (value) {
      return value;
    }
  }
  return "";
}

export function listConfiguredChatApiKeyGroupSlots(envSource = {}, provider = "deepseek") {
  const source = envSource && typeof envSource === "object" ? envSource : {};
  const groupNumbers = new Set([1]);
  const baseNames = getChatApiKeyGroupPrimaryKeyNames(provider, 1);
  Object.keys(source).forEach((key) => {
    for (const baseName of baseNames) {
      const prefix = `${baseName}_GROUP`;
      if (!key.startsWith(prefix)) {
        continue;
      }
      const suffix = key.slice(prefix.length);
      if (/^[2-9]\d*$/u.test(suffix)) {
        groupNumbers.add(Number(suffix));
      }
      break;
    }
  });
  const configured = [...groupNumbers]
    .sort((left, right) => left - right)
    .filter((slot) => Boolean(resolveChatApiKeyGroupPrimaryKey(source, provider, slot)));
  return configured;
}

export function shouldResetConversationApiKeyAssignments({
  previousProvider = "deepseek",
  nextProvider = "deepseek",
  previousGroups = {},
  nextGroups = {}
} = {}) {
  if (normalizeProvider(previousProvider) !== normalizeProvider(nextProvider)) {
    return true;
  }
  return Object.entries(previousGroups || {}).some(
    ([slot, fingerprint]) => nextGroups?.[slot] !== fingerprint
  );
}
