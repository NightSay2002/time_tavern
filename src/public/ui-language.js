import { Converter } from "/vendor/opencc-t2cn.js";
import { Converter as SimplifiedConverter } from "/vendor/opencc-cn2t.js";

export const UI_LANGUAGE_TRADITIONAL = "zh-Hant";
export const UI_LANGUAGE_SIMPLIFIED = "zh-Hans";
export const UI_LANGUAGE_STORAGE_KEY = "time_tavern_ui_language";

const TEXT_ATTRIBUTES = ["placeholder", "title", "aria-label", "alt", "value"];
const DEFAULT_TEXT_SKIP_SELECTOR = [
  "script",
  "style",
  "template",
  "input",
  "textarea",
  "pre",
  "code",
  "[data-ui-language-skip]"
].join(",");
const DEFAULT_ATTRIBUTE_SKIP_SELECTOR = [
  "script",
  "style",
  "template",
  "pre",
  "code",
  "[data-ui-language-skip]"
].join(",");
const convertTraditionalToSimplified = Converter({ from: "twp", to: "cn" });
const convertSimplifiedToTraditional = SimplifiedConverter({ from: "cn", to: "twp" });

function convertSystemText(value = "") {
  return convertTraditionalToSimplified(value).replaceAll("存盘", "存档");
}

export function normalizeUiLanguage(value = "") {
  return value === UI_LANGUAGE_SIMPLIFIED
    ? UI_LANGUAGE_SIMPLIFIED
    : UI_LANGUAGE_TRADITIONAL;
}

export function readStoredUiLanguage() {
  try {
    return normalizeUiLanguage(window.localStorage?.getItem(UI_LANGUAGE_STORAGE_KEY));
  } catch {
    return UI_LANGUAGE_TRADITIONAL;
  }
}

export function createUiLanguageController({
  initialLanguage = readStoredUiLanguage(),
  textSkipSelector = DEFAULT_TEXT_SKIP_SELECTOR,
  attributeSkipSelector = DEFAULT_ATTRIBUTE_SKIP_SELECTOR
} = {}) {
  let language = normalizeUiLanguage(initialLanguage);
  let observer = null;
  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();

  function translate(value = "") {
    const text = String(value ?? "");
    return language === UI_LANGUAGE_SIMPLIFIED
      ? convertSystemText(text)
      : convertSimplifiedToTraditional(text);
  }

  function shouldSkip(node, selector) {
    const element = node instanceof Element ? node : node?.parentElement;
    if (!element || element.closest("[data-ui-language-force]")) {
      return !element;
    }
    return Boolean(element.closest(selector));
  }

  function shouldTranslateValue(element) {
    return element?.tagName === "INPUT" &&
      ["button", "submit", "reset"].includes(String(element.type || "").toLowerCase());
  }

  function translateTextNode(node, captureOriginal = false) {
    if (!node?.nodeValue?.trim() || shouldSkip(node, textSkipSelector)) {
      return;
    }
    if (captureOriginal || !textOriginals.has(node)) {
      textOriginals.set(node, node.nodeValue);
    }
    node.nodeValue = translate(textOriginals.get(node) || "");
  }

  function translateAttributes(element, captureOriginal = false) {
    if (!(element instanceof Element) || shouldSkip(element, attributeSkipSelector)) {
      return;
    }
    let originals = attributeOriginals.get(element);
    if (!originals) {
      originals = {};
      attributeOriginals.set(element, originals);
    }
    TEXT_ATTRIBUTES.forEach((attribute) => {
      if (!element.hasAttribute(attribute) || (attribute === "value" && !shouldTranslateValue(element))) {
        return;
      }
      if (captureOriginal || originals[attribute] === undefined) {
        originals[attribute] = element.getAttribute(attribute) || "";
      }
      element.setAttribute(attribute, translate(originals[attribute]));
    });
  }

  function translateWithin(root, captureOriginal = false) {
    if (!root) {
      return;
    }
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, captureOriginal);
      return;
    }
    if (!(root instanceof Element) && root.nodeType !== Node.DOCUMENT_NODE) {
      return;
    }
    if (root instanceof Element) {
      translateAttributes(root, captureOriginal);
    }
    const elements = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (let node = elements.nextNode(); node; node = elements.nextNode()) {
      translateAttributes(node, captureOriginal);
    }
    const textNodes = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = textNodes.nextNode(); node; node = textNodes.nextNode()) {
      translateTextNode(node, captureOriginal);
    }
  }

  function observe() {
    if (language !== UI_LANGUAGE_SIMPLIFIED) {
      return;
    }
    observer?.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TEXT_ATTRIBUTES
    });
  }

  function apply() {
    observer?.disconnect();
    document.documentElement.lang = language;
    translateWithin(document.documentElement);
    observe();
  }

  function handleMutations(mutations = []) {
    observer?.disconnect();
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        translateTextNode(mutation.target, true);
      } else if (mutation.type === "attributes") {
        translateAttributes(mutation.target, true);
      } else {
        mutation.addedNodes.forEach((node) => translateWithin(node, true));
      }
    });
    observe();
  }

  function setLanguage(value, { persist = true } = {}) {
    language = normalizeUiLanguage(value);
    if (persist) {
      try {
        window.localStorage?.setItem(UI_LANGUAGE_STORAGE_KEY, language);
      } catch {
        // The current page still follows the selected language.
      }
    }
    apply();
    return language;
  }

  if ("MutationObserver" in window) {
    observer = new MutationObserver(handleMutations);
  }

  return {
    apply,
    getLanguage: () => language,
    isSimplified: () => language === UI_LANGUAGE_SIMPLIFIED,
    setLanguage,
    translate
  };
}

export async function loadServerUiLanguage(controller) {
  try {
    const response = await fetch("/api/ui-language", { cache: "no-store" });
    if (!response.ok) {
      return controller.getLanguage();
    }
    const payload = await response.json();
    return controller.setLanguage(payload.language);
  } catch {
    controller.apply();
    return controller.getLanguage();
  }
}
