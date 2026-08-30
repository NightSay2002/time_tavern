import { Converter } from "opencc-js/t2cn";
import { Converter as SimplifiedConverter } from "opencc-js/cn2t";

export const UI_LANGUAGE_TRADITIONAL = "zh-Hant";
export const UI_LANGUAGE_SIMPLIFIED = "zh-Hans";

const convertTraditionalToSimplified = Converter({ from: "twp", to: "cn" });
const convertSimplifiedToTraditional = SimplifiedConverter({ from: "cn", to: "twp" });

function convertSystemText(value = "") {
  return convertTraditionalToSimplified(value).replaceAll("存盘", "存档");
}

function convertTraditionalSystemText(value = "") {
  return convertSimplifiedToTraditional(value);
}

export function normalizeUiLanguage(value = "") {
  return value === UI_LANGUAGE_SIMPLIFIED
    ? UI_LANGUAGE_SIMPLIFIED
    : UI_LANGUAGE_TRADITIONAL;
}

export function normalizeChineseTextForMatch(value = "") {
  const normalized = String(value ?? "").trim().normalize("NFKC").toLowerCase();
  return convertTraditionalToSimplified(normalized);
}

export function localizeSystemText(value = "", language = UI_LANGUAGE_TRADITIONAL) {
  const text = String(value ?? "");
  return normalizeUiLanguage(language) === UI_LANGUAGE_SIMPLIFIED
    ? convertSystemText(text)
    : convertTraditionalSystemText(text);
}

export function localizeChatApiMessages(messages = [], language = UI_LANGUAGE_TRADITIONAL) {
  return (Array.isArray(messages) ? messages : []).map((message) => {
    if (!message || typeof message !== "object") {
      return message;
    }
    if (typeof message.content === "string") {
      return {
        ...message,
        content: localizeSystemText(message.content, language)
      };
    }
    if (!Array.isArray(message.content)) {
      return message;
    }
    return {
      ...message,
      content: message.content.map((part) => (
        part && typeof part === "object" && typeof part.text === "string"
          ? { ...part, text: localizeSystemText(part.text, language) }
          : part
      ))
    };
  });
}
