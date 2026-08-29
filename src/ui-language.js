import { Converter } from "opencc-js/t2cn";

export const UI_LANGUAGE_TRADITIONAL = "zh-Hant";
export const UI_LANGUAGE_SIMPLIFIED = "zh-Hans";

const convertTraditionalToSimplified = Converter({ from: "twp", to: "cn" });

function convertSystemText(value = "") {
  return convertTraditionalToSimplified(value).replaceAll("存盘", "存档");
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
    : text;
}
