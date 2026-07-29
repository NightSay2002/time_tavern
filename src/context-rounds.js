const LEADING_CONTEXT_ROUND_LABEL_PATTERN = /^#\d+\s+(?:user|assistant)\s*(?:\r?\n|$)/i;

export function stripLeadingContextRoundLabels(content = "") {
  let normalized = typeof content === "string" ? content.trim() : "";
  while (LEADING_CONTEXT_ROUND_LABEL_PATTERN.test(normalized)) {
    normalized = normalized.replace(LEADING_CONTEXT_ROUND_LABEL_PATTERN, "").trimStart();
  }
  return normalized.trim();
}

export function getContextMessageRoundLabels(messages = []) {
  let roundNumber = 0;
  return (Array.isArray(messages) ? messages : []).map((message) => {
    const role = message?.role === "assistant" ? "assistant" : "user";
    if (role === "user") {
      const storedTurnNumber = Math.floor(Number(message?.turnNumber ?? message?.extra?.turnNumber));
      roundNumber = Number.isFinite(storedTurnNumber) && storedTurnNumber > 0
        ? storedTurnNumber
        : roundNumber + 1;
    }
    return `#${roundNumber} ${role}`;
  });
}
