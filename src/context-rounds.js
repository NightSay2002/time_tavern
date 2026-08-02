const LEADING_CONTEXT_ROUND_LABEL_PATTERN = /^#\d+\s+(?:user|assistant)\s*(?:\r?\n|$)/i;

export function stripLeadingContextRoundLabels(content = "") {
  let normalized = typeof content === "string" ? content.trim() : "";
  while (LEADING_CONTEXT_ROUND_LABEL_PATTERN.test(normalized)) {
    normalized = normalized.replace(LEADING_CONTEXT_ROUND_LABEL_PATTERN, "").trimStart();
  }
  return normalized.trim();
}
