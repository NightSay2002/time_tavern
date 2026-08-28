export function normalizeRecentUserInputNumber(value) {
  const normalized = Number(value);
  return Number.isInteger(normalized) && normalized >= 1 ? normalized : null;
}

export function findRecentUserMessageIndex(conversation = [], number = 1) {
  const normalizedNumber = normalizeRecentUserInputNumber(number);
  if (!normalizedNumber || !Array.isArray(conversation)) {
    return -1;
  }

  let userCount = 0;
  for (let index = conversation.length - 1; index >= 0; index -= 1) {
    if (conversation[index]?.role !== "user") {
      continue;
    }
    userCount += 1;
    if (userCount === normalizedNumber) {
      return index;
    }
  }
  return -1;
}

export function ensureAssistantOpeningContext(contextMessages = [], openingDialogue = "") {
  const messages = Array.isArray(contextMessages) ? contextMessages : [];
  const opening = typeof openingDialogue === "string" ? openingDialogue.trim() : "";
  if (!opening || messages.some((message) => message?.source === "opening")) {
    return messages;
  }
  return [
    {
      role: "assistant",
      content: opening,
      source: "opening"
    },
    ...messages
  ];
}
