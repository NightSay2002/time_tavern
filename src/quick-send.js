import { localizeSystemText, UI_LANGUAGE_TRADITIONAL } from "./ui-language.js";

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export const QUICK_SEND_TEMPLATES = [
  {
    id: "keep_time",
    label: "{{保持時間}}",
    prefix: "{{保持時間",
    suffix: "}}"
  },
  {
    id: "next_scene",
    label: "｛推進劇情到下一個場景｝",
    prefix: "｛推進劇情到下一個場景",
    suffix: "｝"
  },
  {
    id: "time_passes",
    label: "｛時間流逝——｝",
    prefix: "｛時間流逝——",
    suffix: "｝"
  },
  {
    id: "continue",
    label: "｛繼續｝",
    prefix: "｛繼續",
    suffix: "｝"
  }
];

export function getQuickSendTemplate(templateId = "") {
  const normalizedId = safeText(templateId).toLowerCase();
  return QUICK_SEND_TEMPLATES.find((template) => template.id === normalizedId) || null;
}

export function buildQuickSendContent(
  templateId = "",
  inside = "",
  message = "",
  language = UI_LANGUAGE_TRADITIONAL
) {
  const template = getQuickSendTemplate(templateId);
  if (!template) {
    return { ok: false, error: "未知的快速發送模板。" };
  }

  const insideText = safeText(inside);
  const messageText = safeText(message);
  const commandText = localizeSystemText(
    `${template.prefix}${insideText}${template.suffix}`,
    language
  );
  return {
    ok: true,
    template,
    content: [commandText, messageText].filter(Boolean).join("\n")
  };
}
