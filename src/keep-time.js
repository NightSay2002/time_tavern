const KEEP_TIME_DIRECTIVE_PATTERN = /[｛{]{1,2}\s*保持時間([^｝}]*)[｝}]{1,2}/u;
const KEEP_TIME_DIRECTIVE_REPLACE_PATTERN = /[｛{]{1,2}\s*保持時間([^｝}]*)[｝}]{1,2}/gu;

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hasKeepTimeDirective(text = "") {
  return KEEP_TIME_DIRECTIVE_PATTERN.test(safeText(text));
}

export function stripKeepTimeDirective(text = "") {
  return safeText(text)
    .replace(KEEP_TIME_DIRECTIVE_REPLACE_PATTERN, (_directive, detail = "") => safeText(detail))
    .trim();
}
