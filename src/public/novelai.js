import { gunzipSync } from "./vendor/fflate.module.js";
import {
  createUiLanguageController,
  loadServerUiLanguage
} from "./ui-language.js";

const uiLanguageController = createUiLanguageController();

const el = {
  novelAiForm: document.getElementById("novelAiForm"),
  novelAiStatus: document.getElementById("novelAiStatus"),
  novelAiRefreshStatusBtn: document.getElementById("novelAiRefreshStatusBtn"),
  novelAiModel: document.getElementById("novelAiModel"),
  novelAiModelDescription: document.getElementById("novelAiModelDescription"),
  novelAiVibeCard: document.getElementById("novelAiVibeCard"),
  novelAiVibeHint: document.getElementById("novelAiVibeHint"),
  novelAiPreciseCard: document.getElementById("novelAiPreciseCard"),
  novelAiPreciseHint: document.getElementById("novelAiPreciseHint"),
  novelAiPrompt: document.getElementById("novelAiPrompt"),
  novelAiFixedPromptList: document.getElementById("novelAiFixedPromptList"),
  novelAiAddFixedPromptBtn: document.getElementById("novelAiAddFixedPromptBtn"),
  novelAiRandomPromptList: document.getElementById("novelAiRandomPromptList"),
  novelAiAddRandomPromptBtn: document.getElementById("novelAiAddRandomPromptBtn"),
  novelAiNegativePrompt: document.getElementById("novelAiNegativePrompt"),
  novelAiWidth: document.getElementById("novelAiWidth"),
  novelAiHeight: document.getElementById("novelAiHeight"),
  novelAiSteps: document.getElementById("novelAiSteps"),
  novelAiStepsSummary: document.getElementById("novelAiStepsSummary"),
  novelAiSamples: document.getElementById("novelAiSamples"),
  novelAiScale: document.getElementById("novelAiScale"),
  novelAiGuidanceSummary: document.getElementById("novelAiGuidanceSummary"),
  novelAiVarietyPlus: document.getElementById("novelAiVarietyPlus"),
  novelAiVarietyField: document.getElementById("novelAiVarietyField"),
  novelAiVarietySummary: document.getElementById("novelAiVarietySummary"),
  novelAiCfgRescale: document.getElementById("novelAiCfgRescale"),
  novelAiSeed: document.getElementById("novelAiSeed"),
  novelAiSeedSummary: document.getElementById("novelAiSeedSummary"),
  novelAiSampler: document.getElementById("novelAiSampler"),
  novelAiSamplerSummary: document.getElementById("novelAiSamplerSummary"),
  novelAiNoiseSchedule: document.getElementById("novelAiNoiseSchedule"),
  novelAiNoiseScheduleField: document.getElementById("novelAiNoiseScheduleField"),
  novelAiBaseImageFile: document.getElementById("novelAiBaseImageFile"),
  novelAiBaseImage: document.getElementById("novelAiBaseImage"),
  novelAiBaseImagePreview: document.getElementById("novelAiBaseImagePreview"),
  novelAiClearBaseImageBtn: document.getElementById("novelAiClearBaseImageBtn"),
  novelAiStrength: document.getElementById("novelAiStrength"),
  novelAiNoise: document.getElementById("novelAiNoise"),
  novelAiAutoCharacterPosition: document.getElementById("novelAiAutoCharacterPosition"),
  novelAiCharacterList: document.getElementById("novelAiCharacterList"),
  novelAiAddCharacterBtn: document.getElementById("novelAiAddCharacterBtn"),
  novelAiVibeList: document.getElementById("novelAiVibeList"),
  novelAiPreciseList: document.getElementById("novelAiPreciseList"),
  novelAiSizePreset: document.getElementById("novelAiSizePreset"),
  novelAiMetadataFile: document.getElementById("novelAiMetadataFile"),
  novelAiDefaultsFile: document.getElementById("novelAiDefaultsFile"),
  novelAiImportMetadataBtn: document.getElementById("novelAiImportMetadataBtn"),
  novelAiSaveDefaultsBtn: document.getElementById("novelAiSaveDefaultsBtn"),
  novelAiApplyDefaultsBtn: document.getElementById("novelAiApplyDefaultsBtn"),
  novelAiDownloadDefaultsBtn: document.getElementById("novelAiDownloadDefaultsBtn"),
  novelAiInjectDefaultsBtn: document.getElementById("novelAiInjectDefaultsBtn"),
  novelAiMetadataStatus: document.getElementById("novelAiMetadataStatus"),
  novelAiCostPreview: document.getElementById("novelAiCostPreview"),
  novelAiLoopCount: document.getElementById("novelAiLoopCount"),
  novelAiLoopGenerateBtn: document.getElementById("novelAiLoopGenerateBtn"),
  novelAiLoopGenerateLabel: document.getElementById("novelAiLoopGenerateLabel"),
  novelAiGenerateBtn: document.getElementById("novelAiGenerateBtn"),
  novelAiGenerateLabel: document.getElementById("novelAiGenerateLabel"),
  novelAiOutputGrid: document.getElementById("novelAiOutputGrid"),
  novelAiHistoryGrid: document.getElementById("novelAiHistoryGrid"),
  novelAiHistoryTabBtn: document.getElementById("novelAiHistoryTabBtn"),
  novelAiFavoritesTabBtn: document.getElementById("novelAiFavoritesTabBtn"),
  novelAiClearHistoryBtn: document.getElementById("novelAiClearHistoryBtn"),
  novelAiRefreshAlbumBtn: document.getElementById("novelAiRefreshAlbumBtn"),
  novelAiHistoryPrevBtn: document.getElementById("novelAiHistoryPrevBtn"),
  novelAiHistoryPageInfo: document.getElementById("novelAiHistoryPageInfo"),
  novelAiHistoryNextBtn: document.getElementById("novelAiHistoryNextBtn"),
  novelAiStageSize: document.getElementById("novelAiStageSize"),
  novelAiDropOverlay: document.getElementById("novelAiDropOverlay"),
  novelAiDropChoiceDialog: document.getElementById("novelAiDropChoiceDialog"),
  novelAiDropChoicePreview: document.getElementById("novelAiDropChoicePreview"),
  novelAiDropChoiceText: document.getElementById("novelAiDropChoiceText"),
  novelAiContentDialog: document.getElementById("novelAiContentDialog"),
  novelAiContentText: document.getElementById("novelAiContentText"),
  novelAiDownloadDialog: document.getElementById("novelAiDownloadDialog"),
  novelAiImageViewerDialog: document.getElementById("novelAiImageViewerDialog"),
  novelAiImageViewerTitle: document.getElementById("novelAiImageViewerTitle"),
  novelAiImageViewerStage: document.getElementById("novelAiImageViewerStage"),
  novelAiImageViewerImage: document.getElementById("novelAiImageViewerImage"),
  toast: document.getElementById("toast")
};

let novelAiStatusPayload = null;
let novelAiCharactersDraft = [];
let novelAiVibeImages = [];
let novelAiPreciseImages = [];
let novelAiCurrentImages = [];
let novelAiHistoryItems = [];
let novelAiSelectedHistoryId = "";
let novelAiHistoryPage = 1;
let novelAiHistoryTotal = 0;
let novelAiHistoryRenderToken = 0;
let novelAiHistoryObjectUrls = [];
let novelAiMainImageObjectUrl = "";
let novelAiImageViewerObjectUrl = "";
let novelAiLibraryView = "history";
let novelAiAlbumItems = [];
let novelAiAlbumLoaded = false;
let novelAiPendingDropFiles = [];
let novelAiPendingDownloadItem = null;
let novelAiDragDepth = 0;
let novelAiFixedPromptSnippets = [];
let novelAiRandomPromptSnippets = [];
let novelAiLoopRunning = false;
let novelAiLoopStopRequested = false;
let novelAiLoopDelayTimer = null;
let novelAiImageViewerState = {
  scale: 1,
  x: 0,
  y: 0,
  dragging: false,
  pointerId: null,
  startX: 0,
  startY: 0,
  startPanX: 0,
  startPanY: 0
};

const NOVELAI_SETTINGS_STORAGE_KEY = "time_tavern_novelai_settings";
const NOVELAI_FIXED_PROMPT_STORAGE_KEY = "time_tavern_novelai_fixed_prompt_snippets";
const NOVELAI_RANDOM_PROMPT_STORAGE_KEY = "time_tavern_novelai_random_prompt_snippets";
const NOVELAI_HISTORY_DB_NAME = "time_tavern_novelai";
const NOVELAI_DB_VERSION = 2;
const NOVELAI_HISTORY_STORE = "history";
const NOVELAI_REFERENCE_DRAFT_STORE = "referenceDraft";
const NOVELAI_REFERENCE_DRAFT_ID = "current";
const NOVELAI_HISTORY_PAGE_SIZE = 20;
const NOVELAI_HISTORY_THUMBNAIL_SIZE = 192;
const NOVELAI_STANDARD_PNG_TEXT_KEYS = new Set([
  "Title",
  "Description",
  "Software",
  "Source",
  "Generation time",
  "Generation_time",
  "Comment"
]);
const NOVELAI_MODEL_OPTIONS = [
  ["nai-diffusion-5-full", "NAI Diffusion V5 Full"],
  ["nai-diffusion-5-curated", "NAI Diffusion V5 Curated"],
  ["nai-diffusion-4-5-full", "NAI Diffusion V4.5 Full"],
  ["nai-diffusion-4-5-curated", "NAI Diffusion V4.5 Curated"],
  ["nai-diffusion-4-full", "NAI Diffusion V4 Full"],
  ["nai-diffusion-4-curated-preview", "NAI Diffusion V4 Curated"],
  ["nai-diffusion-3", "NAI Diffusion Anime V3"],
  ["nai-diffusion-furry-3", "NAI Diffusion Furry V3"]
];
const NOVELAI_MODEL_DESCRIPTIONS = {
  "nai-diffusion-5-full": "最新、最完整的 V5 模型；Vibe、Precise 與 Variety+ 尚未支援。",
  "nai-diffusion-5-curated": "較乾淨聚焦的 V5 模型；Vibe、Precise 與 Variety+ 尚未支援。",
  "nai-diffusion-4-5-full": "最新、最完整的 V4.5 模型。",
  "nai-diffusion-4-5-curated": "較乾淨聚焦的 V4.5 模型。",
  "nai-diffusion-4-full": "完整 V4 動漫模型。",
  "nai-diffusion-4-curated-preview": "Curated V4 動漫模型。",
  "nai-diffusion-3": "Anime V3 模型。",
  "nai-diffusion-furry-3": "Furry V3 模型。"
};
const NOVELAI_SAMPLER_OPTIONS = [
  ["k_euler_ancestral", "Euler Ancestral"],
  ["k_euler", "Euler"],
  ["k_dpmpp_2s_ancestral", "DPM++ 2S Ancestral"],
  ["k_dpmpp_2m", "DPM++ 2M"],
  ["k_dpmpp_2m_sde", "DPM++ 2M SDE"],
  ["k_dpmpp_sde", "DPM++ SDE"]
];
const NOVELAI_NOISE_SCHEDULE_OPTIONS = [
  ["karras", "Karras"],
  ["exponential", "Exponential"],
  ["native", "Native"],
  ["polyexponential", "Polyexponential"]
];
const SIZE_PRESETS = {
  portrait: { width: 832, height: 1216 },
  landscape: { width: 1216, height: 832 }
};

function isDialogBackdropPointer(dialog, event) {
  if (!dialog || !event || !dialog.open) {
    return false;
  }
  if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) {
    return false;
  }
  const rect = dialog.getBoundingClientRect();
  return event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom;
}

function closeDialogFromBackdrop(dialog, options = {}) {
  if (!dialog?.open) {
    return;
  }
  if (typeof options.close === "function") {
    options.close(dialog);
  } else if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

function bindDialogBackdropClose(dialog, options = {}) {
  if (!dialog) {
    return;
  }
  let pointerStartedOnBackdrop = false;
  dialog.addEventListener("pointerdown", (event) => {
    if (event.button && event.button !== 0) {
      pointerStartedOnBackdrop = false;
      return;
    }
    pointerStartedOnBackdrop = isDialogBackdropPointer(dialog, event);
  });
  dialog.addEventListener("click", (event) => {
    if (!pointerStartedOnBackdrop) {
      return;
    }
    pointerStartedOnBackdrop = false;
    if (!isDialogBackdropPointer(dialog, event)) {
      return;
    }
    closeDialogFromBackdrop(dialog, options);
  });
  dialog.addEventListener("close", () => {
    pointerStartedOnBackdrop = false;
  });
}

function closeImageContentDialog() {
  if (el.novelAiContentDialog?.open && typeof el.novelAiContentDialog.close === "function") {
    el.novelAiContentDialog.close();
  } else {
    el.novelAiContentDialog?.removeAttribute("open");
  }
}

function closeImageViewerDialog() {
  if (el.novelAiImageViewerDialog?.open && typeof el.novelAiImageViewerDialog.close === "function") {
    el.novelAiImageViewerDialog.close();
  } else {
    el.novelAiImageViewerDialog?.removeAttribute("open");
  }
  releaseImageViewerResource();
}

function revokeObjectUrl(url = "") {
  if (url) {
    URL.revokeObjectURL(url);
  }
}

function releaseHistoryImageResources() {
  novelAiHistoryObjectUrls.forEach(revokeObjectUrl);
  novelAiHistoryObjectUrls = [];
}

function releaseMainImageResource() {
  revokeObjectUrl(novelAiMainImageObjectUrl);
  novelAiMainImageObjectUrl = "";
}

function releaseImageViewerResource() {
  stopImageViewerDrag();
  if (el.novelAiImageViewerImage) {
    el.novelAiImageViewerImage.removeAttribute("src");
  }
  revokeObjectUrl(novelAiImageViewerObjectUrl);
  novelAiImageViewerObjectUrl = "";
}

function createItemImageSource(item = {}, options = {}) {
  const blob = options.thumbnail && item.thumbnailBlob instanceof Blob
    ? item.thumbnailBlob
    : item.imageBlob instanceof Blob
      ? item.imageBlob
      : null;
  if (!blob) {
    return {
      src: item.dataUrl || item.imageUrl || "",
      objectUrl: ""
    };
  }
  const objectUrl = URL.createObjectURL(blob);
  return { src: objectUrl, objectUrl };
}

function applyImageViewerTransform() {
  if (!el.novelAiImageViewerImage) {
    return;
  }
  const { scale, x, y } = novelAiImageViewerState;
  el.novelAiImageViewerImage.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
}

function resetImageViewerTransform() {
  novelAiImageViewerState = {
    scale: 1,
    x: 0,
    y: 0,
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0
  };
  el.novelAiImageViewerStage?.classList.remove("is-dragging");
  applyImageViewerTransform();
}

function zoomImageViewerAt(clientX, clientY, nextScale) {
  if (!el.novelAiImageViewerStage) {
    return;
  }
  const minScale = 0.5;
  const maxScale = 8;
  const currentScale = novelAiImageViewerState.scale || 1;
  const scale = Math.min(maxScale, Math.max(minScale, nextScale));
  if (Math.abs(scale - currentScale) < 0.001) {
    return;
  }
  const rect = el.novelAiImageViewerStage.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const imagePointX = (clientX - centerX - novelAiImageViewerState.x) / currentScale;
  const imagePointY = (clientY - centerY - novelAiImageViewerState.y) / currentScale;
  novelAiImageViewerState.x = clientX - centerX - imagePointX * scale;
  novelAiImageViewerState.y = clientY - centerY - imagePointY * scale;
  novelAiImageViewerState.scale = scale;
  applyImageViewerTransform();
}

function onImageViewerWheel(event) {
  if (!el.novelAiImageViewerDialog?.open) {
    return;
  }
  event.preventDefault();
  const direction = event.deltaY < 0 ? 1 : -1;
  const factor = direction > 0 ? 1.12 : 1 / 1.12;
  zoomImageViewerAt(event.clientX, event.clientY, novelAiImageViewerState.scale * factor);
}

function onImageViewerPointerDown(event) {
  if (!el.novelAiImageViewerDialog?.open || event.button && event.button !== 0) {
    return;
  }
  event.preventDefault();
  novelAiImageViewerState.dragging = true;
  novelAiImageViewerState.pointerId = event.pointerId;
  novelAiImageViewerState.startX = event.clientX;
  novelAiImageViewerState.startY = event.clientY;
  novelAiImageViewerState.startPanX = novelAiImageViewerState.x;
  novelAiImageViewerState.startPanY = novelAiImageViewerState.y;
  el.novelAiImageViewerStage?.classList.add("is-dragging");
  el.novelAiImageViewerStage?.setPointerCapture?.(event.pointerId);
}

function onImageViewerPointerMove(event) {
  if (!novelAiImageViewerState.dragging || novelAiImageViewerState.pointerId !== event.pointerId) {
    return;
  }
  event.preventDefault();
  novelAiImageViewerState.x = novelAiImageViewerState.startPanX + event.clientX - novelAiImageViewerState.startX;
  novelAiImageViewerState.y = novelAiImageViewerState.startPanY + event.clientY - novelAiImageViewerState.startY;
  applyImageViewerTransform();
}

function stopImageViewerDrag(event = {}) {
  if (!novelAiImageViewerState.dragging) {
    return;
  }
  if (event.pointerId !== undefined && novelAiImageViewerState.pointerId !== event.pointerId) {
    return;
  }
  if (el.novelAiImageViewerStage?.hasPointerCapture?.(novelAiImageViewerState.pointerId)) {
    el.novelAiImageViewerStage.releasePointerCapture(novelAiImageViewerState.pointerId);
  }
  novelAiImageViewerState.dragging = false;
  novelAiImageViewerState.pointerId = null;
  el.novelAiImageViewerStage?.classList.remove("is-dragging");
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const data = text ? safeParseJson(text) : {};
  if (!response.ok) {
    throw new Error(data?.error || `請求失敗(${response.status})`);
  }
  return data;
}

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function showToast(message, type = "ok") {
  if (!el.toast) {
    return;
  }
  el.toast.textContent = message;
  el.toast.className = `toast show${type === "error" ? " error" : ""}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    el.toast.className = "toast";
  }, 2600);
}

function truncateText(text = "", maxLength = 140) {
  const compact = String(text || "").replace(/\s+/g, " ").trim();
  return compact.length <= maxLength ? compact : `${compact.slice(0, Math.max(1, maxLength - 3))}...`;
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeDownloadFileName(value = "novelai-image") {
  return String(value || "novelai-image")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "novelai-image";
}

function stripDataUrlPrefix(value = "") {
  return String(value || "").trim().replace(/^data:[^,]*,/iu, "").replace(/\s+/gu, "");
}

function ensureImageDataUrl(value = "", fallbackMime = "image/png") {
  const text = String(value || "").trim();
  if (!text || /^data:/iu.test(text)) {
    return text;
  }
  return `data:${fallbackMime};base64,${stripDataUrlPrefix(text)}`;
}

function isImageFile(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  return type.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)$/iu.test(name);
}

function getUploadImageMimeType(file) {
  const type = String(file?.type || "").toLowerCase();
  const name = String(file?.name || "").toLowerCase();
  if (type.startsWith("image/")) {
    return type;
  }
  if (name.endsWith(".webp")) {
    return "image/webp";
  }
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return "image/jpeg";
  }
  if (name.endsWith(".gif")) {
    return "image/gif";
  }
  if (name.endsWith(".bmp")) {
    return "image/bmp";
  }
  if (name.endsWith(".avif")) {
    return "image/avif";
  }
  if (name.endsWith(".heic")) {
    return "image/heic";
  }
  if (name.endsWith(".heif")) {
    return "image/heif";
  }
  return "image/png";
}

function ensureUploadImageDataUrl(dataUrl = "", file) {
  const text = String(dataUrl || "").trim();
  if (!text || /^data:image\//iu.test(text)) {
    return text;
  }
  return `data:${getUploadImageMimeType(file)};base64,${stripDataUrlPrefix(text)}`;
}

function triggerBlobDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fillSelect(select, options = [], fallback = "") {
  if (!select) {
    return;
  }
  const currentValue = select.value || fallback;
  select.innerHTML = "";
  options.forEach(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    select.appendChild(option);
  });
  if (currentValue && !options.some(([value]) => value === currentValue)) {
    const option = document.createElement("option");
    option.value = currentValue;
    option.textContent = currentValue;
    select.appendChild(option);
  }
  select.value = currentValue || fallback || options[0]?.[0] || "";
}

function setSelectValue(select, value = "") {
  if (!select) {
    return;
  }
  const normalized = String(value || "").trim();
  if (normalized && !Array.from(select.options).some((option) => option.value === normalized)) {
    const option = document.createElement("option");
    option.value = normalized;
    option.textContent = normalized;
    select.appendChild(option);
  }
  if (normalized) {
    select.value = normalized;
  }
}

function numberValue(field, fallback, options = {}) {
  if (!field) {
    return fallback;
  }
  const number = Number(String(field?.value ?? "").trim());
  let value = Number.isFinite(number) ? number : fallback;
  if (options.integer) {
    value = Math.floor(value);
  }
  if (Number.isFinite(options.min)) {
    value = Math.max(options.min, value);
  }
  if (Number.isFinite(options.max)) {
    value = Math.min(options.max, value);
  }
  return value;
}

function finiteNumber(value, fallback) {
  if (value === "" || value === null || value === undefined) {
    return fallback;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function clampFiniteNumber(value, fallback, min, max) {
  const number = finiteNumber(value, fallback);
  return Math.min(max, Math.max(min, number));
}

function boolSetting(value, fallback = false) {
  if (value === true || value === false) {
    return value;
  }
  if (value === "true" || value === "1" || value === 1) {
    return true;
  }
  if (value === "false" || value === "0" || value === 0) {
    return false;
  }
  return fallback;
}

function varietySigmaForModel(model = "") {
  return /nai-diffusion-4-5/u.test(String(model || "")) ? 58 : 19;
}

function isNovelAiV5Model(model = "") {
  return /nai-diffusion-5/u.test(String(model || ""));
}

function syncNovelAiModelCapabilities(options = {}) {
  const isV5 = isNovelAiV5Model(el.novelAiModel?.value);
  const restorePrevious = options.restorePrevious !== false;
  if (el.novelAiVarietyPlus) {
    if (isV5) {
      if (!el.novelAiVarietyPlus.disabled) {
        el.novelAiVarietyPlus.dataset.previousChecked = String(el.novelAiVarietyPlus.checked);
      }
      el.novelAiVarietyPlus.checked = false;
    } else if (!isV5 && el.novelAiVarietyPlus.disabled) {
      if (restorePrevious) {
        el.novelAiVarietyPlus.checked = el.novelAiVarietyPlus.dataset.previousChecked !== "false";
      }
      delete el.novelAiVarietyPlus.dataset.previousChecked;
    }
    el.novelAiVarietyPlus.disabled = isV5;
  }
  if (el.novelAiNoiseSchedule) {
    if (isV5) {
      if (!el.novelAiNoiseSchedule.disabled) {
        el.novelAiNoiseSchedule.dataset.previousValue = el.novelAiNoiseSchedule.value;
      }
      el.novelAiNoiseSchedule.value = "karras";
    } else if (!isV5 && el.novelAiNoiseSchedule.disabled) {
      if (restorePrevious) {
        setSelectValue(el.novelAiNoiseSchedule, el.novelAiNoiseSchedule.dataset.previousValue || "karras");
      }
      delete el.novelAiNoiseSchedule.dataset.previousValue;
    }
    el.novelAiNoiseSchedule.disabled = isV5;
  }
  [el.novelAiVibeCard, el.novelAiPreciseCard, el.novelAiVarietyField, el.novelAiNoiseScheduleField]
    .filter(Boolean)
    .forEach((node) => {
      node.classList.toggle("is-model-unsupported", isV5);
      node.setAttribute("aria-disabled", isV5 ? "true" : "false");
    });
  [el.novelAiVibeCard, el.novelAiPreciseCard]
    .filter(Boolean)
    .forEach((node) => {
      node.hidden = isV5;
      node.classList.toggle("hidden", isV5);
    });
  if (el.novelAiVibeHint) {
    el.novelAiVibeHint.textContent = isV5
      ? "NovelAI V5 目前尚未支援 Vibe Transfer；切回 V4 後會保留現有圖片。"
      : "拖入圖片後選擇 Vibe Transfer。每張圖片都有獨立設定。";
  }
  if (el.novelAiPreciseHint) {
    el.novelAiPreciseHint.textContent = isV5
      ? "NovelAI V5 目前尚未支援 Precise Reference；切回 V4 後會保留現有圖片。"
      : "拖入圖片後選擇 Precise Reference。每張圖片都有獨立設定。";
  }
  el.novelAiDropChoiceDialog?.querySelectorAll('[data-drop-action="vibe"], [data-drop-action="precise"]')
    .forEach((button) => {
      button.hidden = isV5;
      button.classList.toggle("hidden", isV5);
      button.disabled = isV5;
      button.title = isV5 ? "NovelAI V5 目前尚未支援此功能" : "";
    });
}

function normalizeVarietyPlus(source = {}, comment = {}) {
  const explicit = source.varietyPlus ?? source.variety_plus ?? source.variety;
  const skipCfg = source.skipCfgAboveSigma ?? source.skip_cfg_above_sigma ?? comment.skip_cfg_above_sigma;
  if (explicit !== undefined) {
    return boolSetting(explicit, true);
  }
  if (skipCfg !== undefined) {
    return skipCfg !== null && skipCfg !== "" && Number(skipCfg) > 0;
  }
  return true;
}

function makeClientId(prefix = "nai_local") {
  if (window.crypto?.randomUUID) {
    return `${prefix}_${window.crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeImageItems(value = [], prefix = "nai_img", defaults = {}) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const image = String(item?.image || item?.dataUrl || item?.baseImage || "").trim();
      return {
        id: String(item?.id || makeClientId(prefix)).trim(),
        name: String(item?.name || item?.fileName || `Image ${index + 1}`).trim(),
        image,
        enabled: item?.enabled !== false,
        strength: clampFiniteNumber(
          item?.strength ?? item?.referenceStrength,
          defaults.strength ?? 0.6,
          defaults.strengthMin ?? 0,
          defaults.strengthMax ?? 1
        ),
        informationExtracted: clampFiniteNumber(
          item?.informationExtracted ?? item?.information_extracted,
          defaults.informationExtracted ?? 1,
          0,
          1
        ),
        fidelity: clampFiniteNumber(
          item?.fidelity,
          defaults.fidelity ?? 1,
          defaults.fidelityMin ?? -1,
          defaults.fidelityMax ?? 1
        )
      };
    })
    .filter((item) => item.image);
}

function metadataCharacters(comment = {}, source = {}) {
  const promptCharacters = comment?.v4_prompt?.caption?.char_captions || source?.v4_prompt?.caption?.char_captions;
  const negativeCharacters = comment?.v4_negative_prompt?.caption?.char_captions || source?.v4_negative_prompt?.caption?.char_captions || [];
  if (!Array.isArray(promptCharacters)) {
    return [];
  }
  return promptCharacters.map((item, index) => ({
    name: `Character ${index + 1}`,
    prompt: item?.char_caption || "",
    negativePrompt: negativeCharacters[index]?.char_caption || "",
    centers: item?.centers || [{ x: 0.5, y: 0.5 }]
  }));
}

function normalizeCharacters(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => {
      const center = Array.isArray(item?.centers) ? item.centers[0] : item?.center;
      const x = Number(item?.x ?? center?.x);
      const y = Number(item?.y ?? center?.y);
      return {
        id: String(item?.id || `character_${index + 1}`).trim(),
        name: String(item?.name || `Character ${index + 1}`).trim(),
        prompt: String(item?.prompt || item?.char_caption || item?.caption || "").trim(),
        negativePrompt: String(item?.negativePrompt || item?.negative_prompt || item?.uc || "").trim(),
        enabled: item?.enabled !== false,
        x: Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0.5,
        y: Number.isFinite(y) ? Math.min(1, Math.max(0, y)) : 0.5
      };
    })
    .filter((item) => item.prompt || item.negativePrompt || item.name);
}

function clampIntegerValue(value, fallback = 0, min = 0, max = 99) {
  const number = Number(value);
  const resolved = Number.isFinite(number) ? Math.floor(number) : fallback;
  return Math.min(max, Math.max(min, resolved));
}

function clampNumberValue(value, fallback = 0, min = 0, max = 99) {
  const number = Number(value);
  const resolved = Number.isFinite(number) ? number : fallback;
  return Math.min(max, Math.max(min, resolved));
}

function trimPromptItemStart(value = "") {
  return String(value || "").replace(/^\s+/u, "");
}

function splitPromptLines(value = "", options = {}) {
  const preserveTrailingSpace = options.preserveTrailingSpace === true;
  return String(value || "")
    .split(/\r?\n/u)
    .map((line) => preserveTrailingSpace ? trimPromptItemStart(line) : line.trim())
    .filter((line) => line.trim());
}

function normalizePromptItemList(value = "", options = {}) {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => splitPromptLines(item, options))
      .filter(Boolean);
  }
  return splitPromptLines(value, options);
}

function normalizeFixedPromptSnippet(snippet = {}, index = 0) {
  const source = snippet && typeof snippet === "object" ? snippet : {};
  const promptItems = normalizePromptItemList(source.prompt ?? source.text ?? source.content ?? source.fixedText ?? source.fixedItems ?? "");
  return {
    id: String(source.id || makeClientId("nai_fixed")).trim(),
    name: String(source.name || source.title || source.key || `固定片段 ${index + 1}`).trim(),
    prompt: cleanExpandedPrompt(promptItems.join(","))
  };
}

function normalizeFixedPromptSnippets(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => normalizeFixedPromptSnippet(item, index))
    .filter((item) => item.name || item.prompt);
}

function legacyFixedPromptSnippetsFromRandomSnippets(snippets = []) {
  return normalizeRandomPromptSnippets(snippets)
    .flatMap((snippet) => normalizePromptItemList(snippet.legacyFixedItems).map((prompt, index, list) => ({
      id: `${snippet.id || makeClientId("nai_fixed")}_fixed_${index + 1}`,
      name: list.length > 1 ? `${snippet.name || "固定片段"} ${index + 1}` : `${snippet.name || "固定片段"} 固定`,
      prompt
    })));
}

function normalizeRandomPromptSnippet(snippet = {}, index = 0) {
  const source = snippet && typeof snippet === "object" ? snippet : {};
  const name = String(source.name || source.title || source.key || `片段 ${index + 1}`).trim();
  const min = clampIntegerValue(source.min ?? source.minPick ?? source.pickMin, 1, 0, 999);
  const max = clampIntegerValue(source.max ?? source.maxPick ?? source.pickMax, Math.max(1, min), 0, 999);
  const randomItems = normalizePromptItemList(source.randomItems ?? source.random_items ?? source.randomText ?? source.random ?? source.choices ?? "", { preserveTrailingSpace: true });
  const legacyFixedItems = normalizePromptItemList(source.fixedItems ?? source.fixed_items ?? source.fixedText ?? source.fixed ?? source.staticText ?? "");
  const weightMin = clampNumberValue(source.weightMin ?? source.numericWeightMin ?? source.promptWeightMin, 0, 0, 5);
  const weightMax = clampNumberValue(source.weightMax ?? source.numericWeightMax ?? source.promptWeightMax, weightMin, 0, 5);
  const squareMax = clampIntegerValue(source.squareMax ?? source.bracketMax ?? source.weakMax, 0, 0, 12);
  const curlyMax = clampIntegerValue(source.curlyMax ?? source.braceMax ?? source.strongMax, 0, 0, 12);
  const normalizedWeightMin = Math.min(weightMin, weightMax);
  const normalizedWeightMax = Math.max(weightMin, weightMax);
  const weightBias = clampNumberValue(
    source.weightBias ?? source.weight_bias ?? source.numericWeightBias ?? source.promptWeightBias,
    (normalizedWeightMin + normalizedWeightMax) / 2,
    normalizedWeightMin,
    normalizedWeightMax
  );
  return {
    id: String(source.id || makeClientId("nai_random")).trim(),
    name,
    legacyFixedItems,
    randomItems,
    randomText: randomItems.join("\n"),
    min: Math.min(min, max),
    max: Math.max(min, max),
    squareEnabled: boolSetting(source.squareEnabled ?? source.square_enabled ?? source.bracketEnabled ?? source.weakEnabled, squareMax > 0),
    squareMax,
    curlyEnabled: boolSetting(source.curlyEnabled ?? source.curly_enabled ?? source.braceEnabled ?? source.strongEnabled, curlyMax > 0),
    curlyMax,
    weightEnabled: boolSetting(source.weightEnabled ?? source.weight_enabled ?? source.numericWeightEnabled ?? source.promptWeightEnabled, normalizedWeightMax > 0),
    weightMin: normalizedWeightMin,
    weightMax: normalizedWeightMax,
    weightBias
  };
}

function normalizeRandomPromptSnippets(value = []) {
  return (Array.isArray(value) ? value : [])
    .map((item, index) => normalizeRandomPromptSnippet(item, index))
    .filter((item) => item.name || item.randomItems.length);
}

function normalizeRandomPromptMetadata(value = {}, fallbackSnippets = []) {
  const source = value && typeof value === "object" ? value : {};
  const snippets = normalizeRandomPromptSnippets(source.snippets || source.randomPromptSnippets || fallbackSnippets);
  const expansions = Array.isArray(source.expansions)
    ? source.expansions.map((item) => ({
      name: String(item?.name || "").trim(),
      placeholder: String(item?.placeholder || "").trim(),
      selected: normalizePromptItemList(item?.selected || "", { preserveTrailingSpace: true }),
      weightedSelected: normalizePromptItemList(item?.weightedSelected || "", { preserveTrailingSpace: true }),
      result: String(item?.result || "").trim()
    })).filter((item) => item.name || item.placeholder || item.result)
    : [];
  return {
    promptTemplate: String(source.promptTemplate || "").trim(),
    finalPrompt: String(source.finalPrompt || "").trim(),
    snippets,
    expansions
  };
}

function normalizeFixedPromptMetadata(value = {}, fallbackSnippets = []) {
  const source = value && typeof value === "object" ? value : {};
  const snippets = normalizeFixedPromptSnippets(source.snippets || source.fixedPromptSnippets || fallbackSnippets);
  const expansions = Array.isArray(source.expansions)
    ? source.expansions.map((item) => ({
      name: String(item?.name || "").trim(),
      placeholder: String(item?.placeholder || "").trim(),
      result: String(item?.result || "").trim()
    })).filter((item) => item.name || item.placeholder || item.result)
    : [];
  return {
    promptTemplate: String(source.promptTemplate || "").trim(),
    finalPrompt: String(source.finalPrompt || "").trim(),
    snippets,
    expansions
  };
}

function loadRandomPromptSnippets() {
  return normalizeRandomPromptSnippets(
    safeParseJson(window.localStorage?.getItem(NOVELAI_RANDOM_PROMPT_STORAGE_KEY) || "[]")
  );
}

function loadFixedPromptSnippets(legacyRandomSnippets = []) {
  const raw = window.localStorage?.getItem(NOVELAI_FIXED_PROMPT_STORAGE_KEY);
  if (raw !== null && raw !== undefined) {
    return normalizeFixedPromptSnippets(safeParseJson(raw || "[]"));
  }
  return normalizeFixedPromptSnippets(legacyFixedPromptSnippetsFromRandomSnippets(legacyRandomSnippets));
}

function saveFixedPromptSnippets(snippets = novelAiFixedPromptSnippets) {
  try {
    window.localStorage?.setItem(NOVELAI_FIXED_PROMPT_STORAGE_KEY, JSON.stringify(normalizeFixedPromptSnippets(snippets)));
  } catch {
    // Fixed prompt snippets are optional draft data.
  }
}

function saveRandomPromptSnippets(snippets = novelAiRandomPromptSnippets) {
  try {
    window.localStorage?.setItem(NOVELAI_RANDOM_PROMPT_STORAGE_KEY, JSON.stringify(normalizeRandomPromptSnippets(snippets)));
  } catch {
    // Random prompt snippets are optional draft data.
  }
}

function createRandomPromptSnippet(index = 0) {
  return normalizeRandomPromptSnippet({
    name: `隨機片段 ${index + 1}`,
    randomText: "",
    min: 1,
    max: 1,
    squareEnabled: false,
    squareMax: 0,
    curlyEnabled: false,
    curlyMax: 0,
    weightEnabled: false,
    weightMin: 0,
    weightMax: 0,
    weightBias: 0
  }, index);
}

function createFixedPromptSnippet(index = 0) {
  return normalizeFixedPromptSnippet({
    name: `固定片段 ${index + 1}`,
    prompt: ""
  }, index);
}

function normalizeSettings(value = {}) {
  const source = value?.settings && typeof value.settings === "object" ? value.settings : value || {};
  const comment = source?.Comment && typeof source.Comment === "object" ? source.Comment : {};
  const sourceVibe = source.vibeTransfer || source.vibe_transfer || {};
  const sourcePrecise = source.preciseReference || source.precise_reference || {};
  const sourceV4Prompt = source.v4_prompt || comment.v4_prompt || {};
  const promptCharacters = source.characters || source.characterPrompts || source.character_prompts ||
    comment.character_prompts || metadataCharacters(comment, source);
  const randomPrompt = normalizeRandomPromptMetadata(
    source.randomPrompt || source.random_prompt || comment.random_prompt,
    source.randomPromptSnippets || source.random_prompt_snippets
  );
  const fixedPrompt = normalizeFixedPromptMetadata(
    source.fixedPrompt || source.fixed_prompt || comment.fixed_prompt,
    source.fixedPromptSnippets || source.fixed_prompt_snippets
  );
  const fixedPromptSnippets = normalizeFixedPromptSnippets(
    source.fixedPromptSnippets || source.fixed_prompt_snippets || comment.fixed_prompt_snippets || fixedPrompt.snippets || []
  );
  const promptTemplate = String(source.promptTemplate || source.prompt_template || fixedPrompt.promptTemplate || randomPrompt.promptTemplate || "").trim();
  return {
    model: String(source.model || source.Software || comment.model || "nai-diffusion-4-5-full").trim(),
    prompt: String(
      source.prompt ?? source.input ?? source.Description ?? comment.prompt ??
      comment?.v4_prompt?.caption?.base_caption ?? ""
    ).trim(),
    promptTemplate,
    fixedPrompt,
    fixedPromptSnippets,
    randomPrompt,
    randomPromptSnippets: randomPrompt.snippets,
    negativePrompt: String(
      source.negativePrompt ?? source.negative_prompt ?? source.uc ?? comment.negative_prompt ?? comment.uc ??
      comment?.v4_negative_prompt?.caption?.base_caption ?? ""
    ).trim(),
    width: finiteNumber(source.width ?? comment.width, 832),
    height: finiteNumber(source.height ?? comment.height, 1216),
    steps: finiteNumber(source.steps ?? comment.steps, 28),
    samples: finiteNumber(source.samples ?? source.n_samples ?? comment.samples ?? comment.n_samples, 1),
    scale: finiteNumber(source.scale ?? comment.scale, 6),
    varietyPlus: normalizeVarietyPlus(source, comment),
    cfgRescale: finiteNumber(source.cfgRescale ?? source.cfg_rescale ?? comment.cfg_rescale, 0),
    seed: finiteNumber(source.seed ?? source.Source ?? comment.seed, -1),
    sampler: String(source.sampler || comment.sampler || "k_euler_ancestral").trim(),
    noiseSchedule: String(source.noiseSchedule || source.noise_schedule || comment.noise_schedule || "karras").trim(),
    loopCount: clampIntegerValue(source.loopCount ?? source.loop_count, 1, 0, 9999),
    characterPositionMode: source.characterPositionMode === "manual" || source.character_position_mode === "manual" || comment.character_position_mode === "manual" || sourceV4Prompt.use_coords === true
      ? "manual"
      : "auto",
    baseImage: String(source.baseImage || source.image || "").trim(),
    strength: source.strength === "" || source.strength === undefined ? 0.7 : finiteNumber(source.strength, 0.7),
    noise: source.noise === "" || source.noise === undefined ? 0 : finiteNumber(source.noise, 0),
    characters: normalizeCharacters(promptCharacters),
    vibeTransfer: {
      enabled: sourceVibe.enabled !== false,
      strength: clampFiniteNumber(sourceVibe.strength ?? source.referenceStrength, 0.6, -1, 1),
      informationExtracted: finiteNumber(sourceVibe.informationExtracted ?? sourceVibe.information_extracted ?? source.referenceInformationExtracted, 1),
      images: normalizeImageItems(sourceVibe.images || source.vibeImages || [], "nai_vibe", {
        strength: sourceVibe.strength ?? source.referenceStrength ?? 0.6,
        informationExtracted: sourceVibe.informationExtracted ?? sourceVibe.information_extracted ?? source.referenceInformationExtracted ?? 1,
        strengthMin: -1,
        strengthMax: 1
      })
    },
    preciseReference: {
      enabled: sourcePrecise.enabled !== false,
      strength: clampFiniteNumber(sourcePrecise.strength, 1, -1, 1),
      fidelity: clampFiniteNumber(sourcePrecise.fidelity, 1, -1, 1),
      images: normalizeImageItems(sourcePrecise.images || source.preciseImages || source.character_references || [], "nai_precise", {
        strength: sourcePrecise.strength ?? 1,
        fidelity: sourcePrecise.fidelity ?? 1,
        strengthMin: -1,
        strengthMax: 1,
        fidelityMin: -1,
        fidelityMax: 1
      })
    }
  };
}

function positionCellFromXY(x = 0.5, y = 0.5) {
  const col = Math.min(5, Math.max(1, Math.round(Number(x) * 4) + 1));
  const row = Math.min(5, Math.max(1, Math.round(Number(y) * 4) + 1));
  return { row, col };
}

function xyFromPositionCell(row = 3, col = 3) {
  return {
    x: (Math.min(5, Math.max(1, col)) - 1) / 4,
    y: (Math.min(5, Math.max(1, row)) - 1) / 4
  };
}

function positionLabel(x = 0.5, y = 0.5) {
  const { row, col } = positionCellFromXY(x, y);
  const rows = ["最上", "偏上", "中央", "偏下", "最下"];
  const columns = ["最左", "偏左", "中央", "偏右", "最右"];
  return `${rows[row - 1]}・${columns[col - 1]}`;
}

function syncCharacterPositionMode() {
  const automatic = el.novelAiAutoCharacterPosition?.checked !== false;
  el.novelAiCharacterList?.classList.toggle("is-auto-position", automatic);
  el.novelAiCharacterList?.querySelectorAll(".nai-position-button").forEach((button) => { button.hidden = automatic; });
  if (automatic) {
    el.novelAiCharacterList?.querySelectorAll(".nai-position-grid").forEach((grid) => { grid.hidden = true; });
  }
}

function collectCharacters() {
  return Array.from(el.novelAiCharacterList?.querySelectorAll(".nai-character-card") || [])
    .map((card, index) => {
      const getValue = (name) => card.querySelector(`[data-novelai-character-field="${name}"]`)?.value || "";
      const x = Number(getValue("x"));
      const y = Number(getValue("y"));
      return {
        id: card.dataset.characterId || `character_${index + 1}`,
        name: getValue("name").trim() || `Character ${index + 1}`,
        prompt: getValue("prompt").trim(),
        negativePrompt: getValue("negativePrompt").trim(),
        enabled: card.querySelector('[data-novelai-character-field="enabled"]')?.checked !== false,
        x: Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0.5,
        y: Number.isFinite(y) ? Math.min(1, Math.max(0, y)) : 0.5
      };
    });
}

function renderCharacters(characters = novelAiCharactersDraft) {
  const items = normalizeCharacters(characters);
  novelAiCharactersDraft = items;
  el.novelAiCharacterList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = "還沒有角色 Prompt。";
    el.novelAiCharacterList.appendChild(empty);
    updateNovelAiDuplicateWarnings();
    return;
  }
  items.forEach((character, index) => {
    const card = document.createElement("section");
    card.className = "nai-character-card";
    card.dataset.characterId = character.id || `character_${index + 1}`;
    const { row, col } = positionCellFromXY(character.x, character.y);
    card.innerHTML = `
      <div class="nai-character-header">
        <label class="nai-switch"><input data-novelai-character-field="enabled" type="checkbox" /> 啟用</label>
        <input data-novelai-character-field="name" type="text" />
        <div>
          <button type="button" class="muted" data-novelai-character-action="up">↑</button>
          <button type="button" class="muted" data-novelai-character-action="down">↓</button>
          <button type="button" class="nai-danger-button" data-novelai-character-action="remove">刪除角色</button>
        </div>
      </div>
      <button type="button" class="nai-position-button" data-novelai-character-action="toggle-position">位置：${positionLabel(character.x, character.y)}</button>
      <div class="nai-position-grid" hidden></div>
      <input data-novelai-character-field="x" type="hidden" />
      <input data-novelai-character-field="y" type="hidden" />
      <label>Prompt<textarea rows="3" data-novelai-character-field="prompt"></textarea></label>
      <label>Undesired<textarea rows="2" data-novelai-character-field="negativePrompt"></textarea></label>
    `;
    const grid = card.querySelector(".nai-position-grid");
    for (let r = 1; r <= 5; r += 1) {
      for (let c = 1; c <= 5; c += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = r === row && c === col ? "●" : "";
        button.title = positionLabel((c - 1) / 4, (r - 1) / 4);
        button.setAttribute("aria-label", button.title);
        button.dataset.novelaiCharacterAction = "select-position";
        button.dataset.row = String(r);
        button.dataset.col = String(c);
        button.classList.toggle("active", r === row && c === col);
        grid.appendChild(button);
      }
    }
    card.querySelector('[data-novelai-character-field="enabled"]').checked = character.enabled !== false;
    card.querySelector('[data-novelai-character-field="name"]').value = character.name || `Character ${index + 1}`;
    card.querySelector('[data-novelai-character-field="x"]').value = character.x;
    card.querySelector('[data-novelai-character-field="y"]').value = character.y;
    card.querySelector('[data-novelai-character-field="prompt"]').value = character.prompt || "";
    card.querySelector('[data-novelai-character-field="negativePrompt"]').value = character.negativePrompt || "";
    el.novelAiCharacterList.appendChild(card);
  });
  syncCharacterPositionMode();
  updateNovelAiDuplicateWarnings();
}

function collectFixedPromptSnippets() {
  return Array.from(el.novelAiFixedPromptList?.querySelectorAll(".nai-fixed-prompt-card") || [])
    .map((card, index) => normalizeFixedPromptSnippet({
      id: card.dataset.fixedPromptId || "",
      name: card.querySelector('[data-fixed-prompt-field="name"]')?.value || "",
      prompt: card.querySelector('[data-fixed-prompt-field="prompt"]')?.value || ""
    }, index));
}

function renderFixedPromptSnippets(snippets = novelAiFixedPromptSnippets) {
  const items = normalizeFixedPromptSnippets(snippets);
  novelAiFixedPromptSnippets = items;
  if (!el.novelAiFixedPromptList) {
    return;
  }
  el.novelAiFixedPromptList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = "還沒有 Fixed Prompt 片段。";
    el.novelAiFixedPromptList.appendChild(empty);
    updateNovelAiDuplicateWarnings();
    return;
  }
  items.forEach((snippet, index) => {
    const card = document.createElement("section");
    card.className = "nai-fixed-prompt-card";
    card.dataset.fixedPromptId = snippet.id || `fixed_${index + 1}`;
    card.innerHTML = `
      <div class="nai-random-prompt-header">
        <button type="button" class="secondary" data-fixed-prompt-action="insert"></button>
        <button type="button" class="nai-danger-button" data-fixed-prompt-action="remove">刪除</button>
      </div>
      <label>名字<input type="text" data-fixed-prompt-field="name" /></label>
      <label>Prompt<textarea rows="3" data-fixed-prompt-field="prompt" placeholder="black dress, white ribbon"></textarea></label>
    `;
    const insertButton = card.querySelector('[data-fixed-prompt-action="insert"]');
    insertButton.dataset.uiLanguageSkip = "true";
    insertButton.textContent = snippet.name || uiLanguageController.translate(`固定片段 ${index + 1}`);
    card.querySelector('[data-fixed-prompt-field="name"]').value = snippet.name || "";
    card.querySelector('[data-fixed-prompt-field="prompt"]').value = snippet.prompt || "";
    el.novelAiFixedPromptList.appendChild(card);
  });
  updateNovelAiDuplicateWarnings();
}

function collectRandomPromptSnippets() {
  return Array.from(el.novelAiRandomPromptList?.querySelectorAll(".nai-random-prompt-card") || [])
    .map((card, index) => normalizeRandomPromptSnippet({
      id: card.dataset.randomPromptId || "",
      name: card.querySelector('[data-random-prompt-field="name"]')?.value || "",
      randomText: card.querySelector('[data-random-prompt-field="randomText"]')?.value || "",
      min: card.querySelector('[data-random-prompt-field="min"]')?.value || 0,
      max: card.querySelector('[data-random-prompt-field="max"]')?.value || 0,
      squareEnabled: card.querySelector('[data-random-prompt-field="squareEnabled"]')?.checked === true,
      squareMax: card.querySelector('[data-random-prompt-field="squareMax"]')?.value || 0,
      curlyEnabled: card.querySelector('[data-random-prompt-field="curlyEnabled"]')?.checked === true,
      curlyMax: card.querySelector('[data-random-prompt-field="curlyMax"]')?.value || 0,
      weightEnabled: card.querySelector('[data-random-prompt-field="weightEnabled"]')?.checked === true,
      weightMin: card.querySelector('[data-random-prompt-field="weightMin"]')?.value || 0,
      weightMax: card.querySelector('[data-random-prompt-field="weightMax"]')?.value || 0,
      weightBias: card.querySelector('[data-random-prompt-field="weightBias"]')?.value || 0
    }, index));
}

function syncRandomPromptWeightBiasControl(card) {
  const minInput = card?.querySelector?.('[data-random-prompt-field="weightMin"]');
  const maxInput = card?.querySelector?.('[data-random-prompt-field="weightMax"]');
  const biasInput = card?.querySelector?.('[data-random-prompt-field="weightBias"]');
  const biasValue = card?.querySelector?.("[data-random-prompt-bias-value]");
  if (!biasInput) {
    return;
  }
  const min = clampNumberValue(minInput?.value, 0, 0, 5);
  const max = clampNumberValue(maxInput?.value, min, 0, 5);
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const fallback = Number.isFinite(Number(biasInput.value)) ? Number(biasInput.value) : (low + high) / 2;
  const value = clampNumberValue(fallback, (low + high) / 2, low, high);
  biasInput.min = String(low);
  biasInput.max = String(high);
  biasInput.step = "0.1";
  biasInput.value = formatPromptWeight(value);
  if (biasValue) {
    biasValue.textContent = formatPromptWeight(value);
  }
}

function syncRandomPromptWeightControls(card) {
  if (!card) {
    return;
  }
  [
    ["squareEnabled", "squareMax"],
    ["curlyEnabled", "curlyMax"],
    ["weightEnabled", "weightMin"],
    ["weightEnabled", "weightMax"],
    ["weightEnabled", "weightBias"]
  ].forEach(([toggleField, inputField]) => {
    const toggle = card.querySelector(`[data-random-prompt-field="${toggleField}"]`);
    const input = card.querySelector(`[data-random-prompt-field="${inputField}"]`);
    if (input) {
      input.disabled = toggle?.checked !== true;
    }
  });
  syncRandomPromptWeightBiasControl(card);
}

function renderRandomPromptSnippets(snippets = novelAiRandomPromptSnippets) {
  const items = normalizeRandomPromptSnippets(snippets);
  novelAiRandomPromptSnippets = items;
  if (!el.novelAiRandomPromptList) {
    return;
  }
  el.novelAiRandomPromptList.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = "還沒有 Random Prompt 片段。";
    el.novelAiRandomPromptList.appendChild(empty);
    updateNovelAiDuplicateWarnings();
    return;
  }
  items.forEach((snippet, index) => {
    const card = document.createElement("section");
    card.className = "nai-random-prompt-card";
    card.dataset.randomPromptId = snippet.id || `random_${index + 1}`;
    card.innerHTML = `
      <div class="nai-random-prompt-header">
        <button type="button" class="secondary" data-random-prompt-action="insert"></button>
        <button type="button" class="nai-danger-button" data-random-prompt-action="remove">刪除</button>
      </div>
      <label>名字<input type="text" data-random-prompt-field="name" /></label>
      <div class="nai-random-prompt-entry">
        <label>隨機輸入<textarea rows="5" data-random-prompt-field="randomText" placeholder="artist:rurudo,artist:sho_(sho_lwlw)&#10;artist:onineko&#10;artist:ciloranko"></textarea></label>
      </div>
      <div class="nai-random-prompt-grid">
        <label>抽選最少<input type="number" min="0" step="1" data-random-prompt-field="min" /></label>
        <label>抽選最多<input type="number" min="0" step="1" data-random-prompt-field="max" /></label>
        <label class="nai-switch nai-random-weight-toggle"><input type="checkbox" data-random-prompt-field="squareEnabled" /> 啟用 []</label>
        <label>[] max<input type="number" min="0" max="12" step="1" data-random-prompt-field="squareMax" /></label>
        <label class="nai-switch nai-random-weight-toggle"><input type="checkbox" data-random-prompt-field="curlyEnabled" /> 啟用 {}</label>
        <label>{} max<input type="number" min="0" max="12" step="1" data-random-prompt-field="curlyMax" /></label>
        <label class="nai-switch nai-random-weight-toggle"><input type="checkbox" data-random-prompt-field="weightEnabled" /> 啟用數值權重</label>
        <label>數值權重最少<input type="number" min="0" max="5" step="0.1" data-random-prompt-field="weightMin" /></label>
        <label>數值權重最多<input type="number" min="0" max="5" step="0.1" data-random-prompt-field="weightMax" /></label>
        <label class="nai-random-bias-row">數值權重偏向 <b data-random-prompt-bias-value>0.0</b><input type="range" min="0" max="5" step="0.1" data-random-prompt-field="weightBias" /></label>
      </div>
    `;
    const insertButton = card.querySelector('[data-random-prompt-action="insert"]');
    insertButton.dataset.uiLanguageSkip = "true";
    insertButton.textContent = snippet.name || uiLanguageController.translate(`片段 ${index + 1}`);
    card.querySelector('[data-random-prompt-field="name"]').value = snippet.name || "";
    card.querySelector('[data-random-prompt-field="randomText"]').value = snippet.randomText || "";
    card.querySelector('[data-random-prompt-field="min"]').value = snippet.min;
    card.querySelector('[data-random-prompt-field="max"]').value = snippet.max;
    card.querySelector('[data-random-prompt-field="squareEnabled"]').checked = snippet.squareEnabled === true;
    card.querySelector('[data-random-prompt-field="squareMax"]').value = snippet.squareMax;
    card.querySelector('[data-random-prompt-field="curlyEnabled"]').checked = snippet.curlyEnabled === true;
    card.querySelector('[data-random-prompt-field="curlyMax"]').value = snippet.curlyMax;
    card.querySelector('[data-random-prompt-field="weightEnabled"]').checked = snippet.weightEnabled === true;
    card.querySelector('[data-random-prompt-field="weightMin"]').value = snippet.weightMin;
    card.querySelector('[data-random-prompt-field="weightMax"]').value = snippet.weightMax;
    card.querySelector('[data-random-prompt-field="weightBias"]').value = snippet.weightBias;
    syncRandomPromptWeightControls(card);
    el.novelAiRandomPromptList.appendChild(card);
  });
  updateNovelAiDuplicateWarnings();
}

function insertTextAtCursor(textarea, text = "") {
  if (!textarea) {
    return;
  }
  const start = Number.isFinite(textarea.selectionStart) ? textarea.selectionStart : textarea.value.length;
  const end = Number.isFinite(textarea.selectionEnd) ? textarea.selectionEnd : textarea.value.length;
  textarea.value = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
  const nextCursor = start + text.length;
  textarea.focus();
  textarea.setSelectionRange(nextCursor, nextCursor);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function renderBaseImagePreview(dataUrl = "") {
  const value = ensureImageDataUrl(dataUrl);
  el.novelAiBaseImage.value = value;
  el.novelAiBaseImagePreview.innerHTML = "";
  el.novelAiBaseImagePreview.classList.toggle("has-image", Boolean(value));
  if (!value) {
    el.novelAiBaseImagePreview.textContent = "點擊選擇圖片，或直接拖到頁面任何位置";
    return;
  }
  const img = document.createElement("img");
  img.src = value;
  img.alt = "Image2Image";
  el.novelAiBaseImagePreview.appendChild(img);
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "nai-base-image-remove";
  removeButton.dataset.baseImageRemove = "true";
  removeButton.setAttribute("aria-label", "移除 Image2Image 圖片");
  removeButton.textContent = "移除";
  el.novelAiBaseImagePreview.appendChild(removeButton);
}

function clearBaseImagePreview() {
  renderBaseImagePreview("");
  renderCostPreview();
  saveSettingsDraft({ includeReferenceImages: true });
}

function referenceRangeHtml(field, label, value, options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 1;
  const normalizedValue = clampFiniteNumber(value, options.defaultValue ?? 0, min, max);
  return `
    <label class="nai-reference-range">
      <span>${label}</span>
      <input data-reference-field="${field}" type="range" min="${min}" max="${max}" step="0.01" value="${normalizedValue.toFixed(2)}" />
      <input class="nai-reference-number" data-reference-field="${field}" type="number" min="${min}" max="${max}" step="0.01" value="${normalizedValue.toFixed(2)}" />
    </label>
  `;
}

function syncRangeInputVisual(input) {
  if (!input || input.type !== "range") {
    return;
  }
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const value = clampFiniteNumber(input.value, min, min, max);
  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  input.style.setProperty("--range-progress", `${Math.max(0, Math.min(100, progress))}%`);
}

function syncReferenceFieldControls(sourceInput, value) {
  const field = sourceInput?.dataset?.referenceField || "";
  const row = sourceInput?.closest?.(".nai-reference-range");
  if (!field || !row) {
    return;
  }
  row.querySelectorAll(`[data-reference-field="${field}"]`).forEach((input) => {
    input.value = Number(value).toFixed(2);
    syncRangeInputVisual(input);
  });
}

function renderReferenceList(container, images = [], emptyText = "拖入圖片加入。", type = "vibe") {
  container.innerHTML = "";
  if (!images.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }
  images.forEach((item) => {
    const card = document.createElement("article");
    card.className = "nai-reference-item";
    card.dataset.imageId = item.id;
    const controls = type === "vibe"
      ? [
        referenceRangeHtml("strength", "Reference Strength", item.strength, { min: -1, max: 1, defaultValue: 0.6 }),
        referenceRangeHtml("informationExtracted", "Information Extracted", item.informationExtracted, { min: 0, max: 1, defaultValue: 1 })
      ].join("")
      : [
        referenceRangeHtml("strength", "Strength", item.strength, { min: -1, max: 1, defaultValue: 1 }),
        referenceRangeHtml("fidelity", "Fidelity", item.fidelity, { min: -1, max: 1, defaultValue: 1 })
      ].join("");
    card.innerHTML = `
      <img alt="" />
      <label class="nai-switch"><input type="checkbox" data-reference-action="toggle" /> 啟用</label>
      <span></span>
      <button type="button" class="nai-danger-button" data-reference-action="remove">刪除圖片</button>
      <div class="nai-reference-controls">${controls}</div>
    `;
    card.querySelector("img").src = item.image;
    card.querySelector("span").textContent = item.name || "Reference";
    card.querySelector("input").checked = item.enabled !== false;
    container.appendChild(card);
  });
}

function renderAllReferences() {
  renderReferenceList(el.novelAiVibeList, novelAiVibeImages, "拖入圖片後選擇 Vibe Transfer。", "vibe");
  renderReferenceList(el.novelAiPreciseList, novelAiPreciseImages, "拖入圖片後選擇 Precise Reference。", "precise");
  updateRangeValues();
}

function getSelectedSizePreset() {
  return el.novelAiSizePreset?.value || "custom";
}

function setSelectedSizePreset(value = "custom") {
  if (el.novelAiSizePreset) {
    el.novelAiSizePreset.value = value;
  }
}

function updateSizePresetFromDimensions() {
  const width = numberValue(el.novelAiWidth, 832, { integer: true });
  const height = numberValue(el.novelAiHeight, 1216, { integer: true });
  const match = Object.entries(SIZE_PRESETS).find(([, size]) => size.width === width && size.height === height);
  setSelectedSizePreset(match?.[0] || "custom");
}

function applySizePreset(value = getSelectedSizePreset()) {
  const preset = SIZE_PRESETS[value];
  if (!preset) {
    return;
  }
  el.novelAiWidth.value = preset.width;
  el.novelAiHeight.value = preset.height;
}

function activeImageCount(images = []) {
  return images.filter((item) => item.enabled !== false && item.image).length;
}

function randomIntInclusive(min, max) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return low + Math.floor(Math.random() * (high - low + 1));
}

function shufflePromptItems(items = []) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function randomNumberInRange(min, max) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + Math.random() * (high - low);
}

function randomBiasedNumberInRange(min, max, bias) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  if (high <= low) {
    return low;
  }
  const center = clampNumberValue(bias, (low + high) / 2, low, high);
  const focusedLow = Math.max(low, center - 1);
  const focusedHigh = Math.min(high, center + 1);
  const useFullRange = Math.random() < 0.18 || focusedHigh <= focusedLow;
  return useFullRange ? randomNumberInRange(low, high) : randomNumberInRange(focusedLow, focusedHigh);
}

function formatPromptWeight(value) {
  return (Math.round(Number(value || 0) * 10) / 10).toFixed(1);
}

function protectNumericWeightPromptToken(value = "") {
  const text = String(value || "");
  return /\d$/u.test(text) ? `${text} ` : text;
}

function splitPromptChain(text = "", options = {}) {
  const preserveTrailingSpace = options.preserveTrailingSpace === true;
  return String(text || "")
    .split(/[，,]/u)
    .map((item) => preserveTrailingSpace ? trimPromptItemStart(item) : item.trim())
    .filter((item) => item.trim());
}

function applyRandomPromptWeightToToken(text = "", snippet = {}) {
  // Some NovelAI tags intentionally keep a trailing space, e.g. "year2025 ",
  // to avoid becoming part of the closing "::" in numeric weights.
  let output = trimPromptItemStart(text);
  if (!output.trim()) {
    return "";
  }
  const squareMax = clampIntegerValue(snippet.squareMax, 0, 0, 12);
  const curlyMax = clampIntegerValue(snippet.curlyMax, 0, 0, 12);
  const weightMin = clampNumberValue(snippet.weightMin, 0, 0, 5);
  const weightMax = clampNumberValue(snippet.weightMax, weightMin, 0, 5);
  const weightBias = clampNumberValue(snippet.weightBias, (weightMin + weightMax) / 2, Math.min(weightMin, weightMax), Math.max(weightMin, weightMax));
  const weightTypes = [
    ...(snippet.squareEnabled === true && squareMax > 0 ? ["square"] : []),
    ...(snippet.curlyEnabled === true && curlyMax > 0 ? ["curly"] : []),
    ...(snippet.weightEnabled === true && Math.max(weightMin, weightMax) > 0 ? ["numeric"] : [])
  ];
  if (!weightTypes.length) {
    return output;
  }
  const weightType = weightTypes[randomIntInclusive(0, weightTypes.length - 1)];
  if (weightType === "square") {
    const squareCount = randomIntInclusive(1, squareMax);
    output = `${"[".repeat(squareCount)}${output}${"]".repeat(squareCount)}`;
  }
  if (weightType === "curly") {
    const curlyCount = randomIntInclusive(1, curlyMax);
    output = `${"{".repeat(curlyCount)}${output}${"}".repeat(curlyCount)}`;
  }
  if (weightType === "numeric") {
    output = `${formatPromptWeight(randomBiasedNumberInRange(weightMin, weightMax, weightBias))}::${protectNumericWeightPromptToken(output)}::`;
  }
  return output;
}

function applyRandomPromptWeight(text = "", snippet = {}) {
  return splitPromptChain(text, { preserveTrailingSpace: true })
    .map((item) => applyRandomPromptWeightToToken(item, snippet))
    .join(",");
}

function cleanExpandedPrompt(prompt = "") {
  return String(prompt || "")
    .replace(/\r?\n+/gu, ",")
    .replace(/[，,]\s*[，,]+/gu, ",")
    .replace(/\s*[,，]\s*/gu, ",")
    .replace(/^,+|,+$/gu, "")
    .trim();
}

function normalizePromptDuplicateKey(value = "") {
  return String(value || "")
    .replace(/\s+/gu, " ")
    .toLowerCase()
    .trim();
}

function promptDuplicateFieldSelector() {
  return "#novelAiPrompt, #novelAiNegativePrompt, " +
    "[data-fixed-prompt-field=\"prompt\"], [data-random-prompt-field=\"randomText\"], " +
    "[data-novelai-character-field=\"prompt\"], [data-novelai-character-field=\"negativePrompt\"]";
}

function promptDuplicateSeparator(field) {
  return field?.matches?.("[data-random-prompt-field=\"randomText\"]") ? "line" : "comma";
}

function getPromptSegments(value = "", separator = "comma") {
  const text = String(value || "");
  const regex = separator === "line" ? /\r\n|\r|\n/gu : /[，,]/gu;
  const segments = [];
  let start = 0;
  let match;
  const pushSegment = (from, to) => {
    const raw = text.slice(from, to);
    const leadingLength = raw.match(/^\s*/u)?.[0]?.length || 0;
    const trailingLength = raw.match(/\s*$/u)?.[0]?.length || 0;
    const segmentStart = from + leadingLength;
    const segmentEnd = Math.max(segmentStart, to - trailingLength);
    const term = text.slice(segmentStart, segmentEnd);
    if (term) {
      segments.push({ term, start: segmentStart, end: segmentEnd });
    }
  };
  while ((match = regex.exec(text))) {
    pushSegment(start, match.index);
    start = match.index + match[0].length;
  }
  pushSegment(start, text.length);
  return segments;
}

function findDuplicatePromptSegments(field) {
  const entries = new Map();
  const segments = getPromptSegments(field?.value || "", promptDuplicateSeparator(field));
  segments.forEach((segment) => {
    const term = segment.term;
    const key = normalizePromptDuplicateKey(term);
    if (!key) {
      return;
    }
    const entry = entries.get(key) || [];
    entry.push(segment);
    entries.set(key, entry);
  });
  return Array.from(entries.values())
    .filter((items) => items.length > 1)
    .flat()
    .sort((left, right) => left.start - right.start);
}

function isPromptDuplicateField(target) {
  return Boolean(target?.matches?.(promptDuplicateFieldSelector()));
}

function getPromptDuplicateFields() {
  const dynamicFields = document.querySelectorAll(
    "[data-fixed-prompt-field=\"prompt\"], [data-random-prompt-field=\"randomText\"], " +
    "[data-novelai-character-field=\"prompt\"], [data-novelai-character-field=\"negativePrompt\"]"
  );
  return [el.novelAiPrompt, el.novelAiNegativePrompt, ...dynamicFields].filter(Boolean);
}

function ensurePromptHighlightLayer(field) {
  if (!field) {
    return null;
  }
  if (field.nextElementSibling?.classList?.contains("nai-duplicate-warning")) {
    field.nextElementSibling.remove();
  }
  let wrap = field.parentElement?.classList?.contains("nai-prompt-highlight-wrap") ? field.parentElement : null;
  if (!wrap) {
    wrap = document.createElement("span");
    wrap.className = "nai-prompt-highlight-wrap";
    field.insertAdjacentElement("beforebegin", wrap);
    wrap.appendChild(field);
  }
  let layer = wrap.querySelector(":scope > .nai-prompt-highlight");
  if (!layer) {
    layer = document.createElement("span");
    layer.className = "nai-prompt-highlight";
    layer.setAttribute("aria-hidden", "true");
    wrap.insertBefore(layer, field);
    field.addEventListener("scroll", () => syncPromptHighlightScroll(field));
  }
  return layer;
}

function syncPromptHighlightLayout(field, layer) {
  const style = window.getComputedStyle(field);
  [
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "fontFamily",
    "fontSize",
    "fontStyle",
    "fontWeight",
    "letterSpacing",
    "lineHeight",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "textAlign",
    "textIndent",
    "textTransform",
    "wordSpacing"
  ].forEach((name) => {
    layer.style[name] = style[name];
  });
}

function syncPromptHighlightScroll(field) {
  const layer = field?.parentElement?.querySelector?.(":scope > .nai-prompt-highlight");
  if (!layer) {
    return;
  }
  layer.scrollTop = field.scrollTop;
  layer.scrollLeft = field.scrollLeft;
}

function promptHighlightHtml(value = "", duplicateSegments = []) {
  const text = String(value || "");
  let cursor = 0;
  let html = "";
  duplicateSegments.forEach((segment) => {
    html += escapeHtml(text.slice(cursor, segment.start));
    html += `<mark class="nai-duplicate-token">${escapeHtml(text.slice(segment.start, segment.end))}</mark>`;
    cursor = segment.end;
  });
  html += escapeHtml(text.slice(cursor));
  return html || " ";
}

function updatePromptDuplicateHighlight(field) {
  if (!field) {
    return;
  }
  const duplicates = findDuplicatePromptSegments(field);
  const layer = ensurePromptHighlightLayer(field);
  syncPromptHighlightLayout(field, layer);
  layer.innerHTML = promptHighlightHtml(field.value || "", duplicates);
  syncPromptHighlightScroll(field);
  field.classList.toggle("has-duplicate-prompts", duplicates.length > 0);
}

function updateNovelAiDuplicateWarnings(target = null) {
  if (isPromptDuplicateField(target)) {
    updatePromptDuplicateHighlight(target);
    return;
  }
  getPromptDuplicateFields().forEach(updatePromptDuplicateHighlight);
}

function promptSnippetPlaceholder(name = "") {
  return `||${String(name || "").trim()}||`;
}

function makePromptSnippetMap(snippets = []) {
  return new Map(snippets.filter((snippet) => snippet.name).map((snippet) => [snippet.name, snippet]));
}

function expandRandomPromptSnippet(snippet = {}, placeholder = "") {
  const randomItems = normalizePromptItemList(snippet.randomItems);
  const min = Math.min(randomItems.length, clampIntegerValue(snippet.min, 0, 0, randomItems.length));
  const max = Math.min(randomItems.length, clampIntegerValue(snippet.max, min, 0, randomItems.length));
  const count = randomItems.length > 0 ? randomIntInclusive(Math.min(min, max), Math.max(min, max)) : 0;
  const selected = shufflePromptItems(randomItems).slice(0, count);
  const weightedSelected = selected.map((item) => applyRandomPromptWeight(item, snippet));
  const result = cleanExpandedPrompt(weightedSelected.filter(Boolean).join(","));
  return {
    name: snippet.name,
    placeholder,
    selected,
    weightedSelected,
    result
  };
}

function expandPromptTemplate(promptTemplate = "", fixedSnippets = [], randomSnippets = []) {
  const template = String(promptTemplate || "").trim();
  const normalizedFixedSnippets = normalizeFixedPromptSnippets(fixedSnippets);
  const normalizedRandomSnippets = normalizeRandomPromptSnippets(randomSnippets);
  const fixedMap = makePromptSnippetMap(normalizedFixedSnippets);
  const randomMap = makePromptSnippetMap(normalizedRandomSnippets);
  const fixedExpansions = [];
  const randomExpansions = [];
  const expandModernPlaceholder = (placeholder, rawName) => {
    const name = String(rawName || "").trim();
    const fixedSnippet = fixedMap.get(name);
    const randomSnippet = randomMap.get(name);
    if (fixedSnippet && randomSnippet) {
      throw new Error(`Prompt 片段名字重複：${name}，Fixed Prompt 和 Random Prompt 請不要同名。`);
    }
    if (fixedSnippet) {
      const result = cleanExpandedPrompt(fixedSnippet.prompt || "");
      fixedExpansions.push({ name, placeholder, result });
      return result;
    }
    if (randomSnippet) {
      const expansion = expandRandomPromptSnippet(randomSnippet, placeholder);
      randomExpansions.push(expansion);
      return expansion.result;
    }
    throw new Error(`Prompt 找不到片段：${name}`);
  };
  let expanded = template.replace(/\|\|\s*([^|]+?)\s*\|\|/gu, expandModernPlaceholder);

  // Legacy support: old Random Prompt placeholders used {{name}}. Only expand
  // them when the name matches a Random Prompt snippet, otherwise leave NovelAI
  // weight syntax untouched.
  expanded = expanded.replace(/\{\{\s*([^}]+?)\s*\}\}/gu, (placeholder, rawName) => {
    const name = String(rawName || "").trim();
    const snippet = randomMap.get(name);
    if (!snippet) {
      return placeholder;
    }
    const expansion = expandRandomPromptSnippet(snippet, placeholder);
    randomExpansions.push(expansion);
    return expansion.result;
  });
  const finalPrompt = cleanExpandedPrompt(expanded);
  return {
    promptTemplate: template,
    finalPrompt,
    fixedPrompt: {
      promptTemplate: template,
      finalPrompt,
      snippets: normalizedFixedSnippets,
      expansions: fixedExpansions
    },
    randomPrompt: {
      promptTemplate: template,
      finalPrompt,
      snippets: normalizedRandomSnippets,
      expansions: randomExpansions
    }
  };
}

function getFormSettings() {
  const seedValue = String(el.novelAiSeed?.value || "").trim();
  const fixedPromptSnippets = collectFixedPromptSnippets();
  const randomPromptSnippets = collectRandomPromptSnippets();
  return {
    model: el.novelAiModel?.value || "nai-diffusion-4-5-full",
    prompt: String(el.novelAiPrompt?.value || "").trim(),
    promptTemplate: String(el.novelAiPrompt?.value || "").trim(),
    fixedPromptSnippets,
    randomPromptSnippets,
    negativePrompt: String(el.novelAiNegativePrompt?.value || "").trim(),
    width: numberValue(el.novelAiWidth, 832, { integer: true, min: 64, max: 2048 }),
    height: numberValue(el.novelAiHeight, 1216, { integer: true, min: 64, max: 2048 }),
    steps: numberValue(el.novelAiSteps, 28, { integer: true, min: 1, max: 50 }),
    samples: numberValue(el.novelAiSamples, 1, { integer: true, min: 1, max: 6 }),
    scale: numberValue(el.novelAiScale, 6, { min: 0, max: 20 }),
    varietyPlus: el.novelAiVarietyPlus?.checked !== false,
    cfgRescale: numberValue(el.novelAiCfgRescale, 0, { min: 0, max: 1 }),
    seed: seedValue ? numberValue(el.novelAiSeed, -1, { integer: true, min: -1 }) : -1,
    sampler: el.novelAiSampler?.value || "k_euler_ancestral",
    noiseSchedule: el.novelAiNoiseSchedule?.value || "karras",
    loopCount: numberValue(el.novelAiLoopCount, 1, { integer: true, min: 0, max: 9999 }),
    characterPositionMode: el.novelAiAutoCharacterPosition?.checked === false ? "manual" : "auto",
    sizePreset: getSelectedSizePreset(),
    qualityToggle: true,
    baseImage: String(el.novelAiBaseImage?.value || "").trim(),
    strength: numberValue(el.novelAiStrength, 0.7, { min: 0, max: 1 }),
    noise: numberValue(el.novelAiNoise, 0, { min: 0, max: 1 }),
    characters: collectCharacters(),
    vibeTransfer: {
      enabled: true,
      images: normalizeImageItems(novelAiVibeImages, "nai_vibe", {
        strength: 0.6,
        informationExtracted: 1,
        strengthMin: -1,
        strengthMax: 1
      })
    },
    preciseReference: {
      enabled: true,
      images: normalizeImageItems(novelAiPreciseImages, "nai_precise", {
        strength: 1,
        fidelity: 1,
        strengthMin: -1,
        strengthMax: 1,
        fidelityMin: -1,
        fidelityMax: 1
      })
    }
  };
}

function getGenerationSettings() {
  const settings = getFormSettings();
  const expansion = expandPromptTemplate(settings.promptTemplate || settings.prompt, settings.fixedPromptSnippets, settings.randomPromptSnippets);
  return {
    ...settings,
    prompt: expansion.finalPrompt,
    promptTemplate: expansion.promptTemplate,
    fixedPrompt: expansion.fixedPrompt,
    randomPrompt: expansion.randomPrompt
  };
}

function setFormSettings(settings = {}, options = {}) {
  const normalized = normalizeSettings(settings);
  setSelectValue(el.novelAiModel, normalized.model);
  el.novelAiPrompt.value = normalized.promptTemplate || normalized.prompt;
  el.novelAiNegativePrompt.value = normalized.negativePrompt;
  el.novelAiWidth.value = Math.round(normalized.width || 832);
  el.novelAiHeight.value = Math.round(normalized.height || 1216);
  updateSizePresetFromDimensions();
  el.novelAiSteps.value = Math.round(normalized.steps || 28);
  el.novelAiSamples.value = Math.round(normalized.samples || 1);
  el.novelAiScale.value = normalized.scale ?? 6;
  if (el.novelAiVarietyPlus) {
    el.novelAiVarietyPlus.checked = normalized.varietyPlus !== false;
  }
  el.novelAiCfgRescale.value = normalized.cfgRescale ?? 0;
  el.novelAiSeed.value = normalized.seed >= 0 ? Math.floor(normalized.seed) : "";
  setSelectValue(el.novelAiSampler, normalized.sampler);
  setSelectValue(el.novelAiNoiseSchedule, normalized.noiseSchedule);
  syncNovelAiModelCapabilities({ restorePrevious: false });
  if (el.novelAiLoopCount) {
    el.novelAiLoopCount.value = String(normalized.loopCount ?? 1);
  }
  if (el.novelAiAutoCharacterPosition) {
    el.novelAiAutoCharacterPosition.checked = normalized.characterPositionMode !== "manual";
  }
  el.novelAiStrength.value = normalized.strength ?? 0.7;
  el.novelAiNoise.value = normalized.noise ?? 0;
  if (options.includeReferenceImages) {
    novelAiVibeImages = normalizeImageItems(normalized.vibeTransfer.images, "nai_vibe", {
      strength: 0.6,
      informationExtracted: 1,
      strengthMin: -1,
      strengthMax: 1
    });
    novelAiPreciseImages = normalizeImageItems(normalized.preciseReference.images, "nai_precise", {
      strength: 1,
      fidelity: 1,
      strengthMin: -1,
      strengthMax: 1,
      fidelityMin: -1,
      fidelityMax: 1
    });
  }
  if (options.includeBaseImage && normalized.baseImage) {
    renderBaseImagePreview(normalized.baseImage);
  } else if (options.clearBaseImage) {
    renderBaseImagePreview("");
  }
  const incomingFixedSnippets = normalizeFixedPromptSnippets(normalized.fixedPromptSnippets);
  if (incomingFixedSnippets.length > 0 || options.replaceFixedPromptSnippets) {
    novelAiFixedPromptSnippets = incomingFixedSnippets;
  }
  renderFixedPromptSnippets(novelAiFixedPromptSnippets);
  const incomingRandomSnippets = normalizeRandomPromptSnippets(normalized.randomPromptSnippets);
  if (incomingRandomSnippets.length > 0 || options.replaceRandomPromptSnippets) {
    novelAiRandomPromptSnippets = incomingRandomSnippets;
  }
  renderRandomPromptSnippets(novelAiRandomPromptSnippets);
  renderCharacters(normalized.characters);
  renderAllReferences();
  updateRangeValues();
  renderCostPreview();
  updateNovelAiDuplicateWarnings();
  if (options.save !== false) {
    saveFixedPromptSnippets();
    saveRandomPromptSnippets();
    saveSettingsDraft({
      includeReferenceImages: options.includeReferenceImages === true || options.includeBaseImage === true
    });
  }
}

function loadSettingsDraft() {
  return safeParseJson(window.localStorage?.getItem(NOVELAI_SETTINGS_STORAGE_KEY) || "{}");
}

function hasSettingsDraft(settings = {}) {
  return Boolean(settings && typeof settings === "object" && !Array.isArray(settings) && Object.keys(settings).length > 0);
}

function saveSettingsDraft(options = {}) {
  const settings = getFormSettings();
  if (options.includeReferenceImages === true) {
    void saveReferenceImageDraft(settings).catch((error) => {
      console.warn("NovelAI 參考圖片草稿保存失敗。", error);
    });
  }
  try {
    settings.baseImage = "";
    settings.vibeTransfer.images = [];
    settings.preciseReference.images = [];
    settings.fixedPromptSnippets = normalizeFixedPromptSnippets(settings.fixedPromptSnippets);
    settings.randomPromptSnippets = normalizeRandomPromptSnippets(settings.randomPromptSnippets);
    window.localStorage?.setItem(NOVELAI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    saveFixedPromptSnippets(settings.fixedPromptSnippets);
    saveRandomPromptSnippets(settings.randomPromptSnippets);
  } catch {
    // Draft saving is optional.
  }
}

async function loadNovelAiDefaults() {
  try {
    const payload = await request("/api/novelai/defaults");
    return payload?.defaults && typeof payload.defaults === "object"
      ? payload.defaults
      : { enabled: false, settings: {} };
  } catch {
    return { enabled: false, settings: {} };
  }
}

function sanitizeNovelAiDefaultSettings(settings = {}) {
  return normalizeSettings(settings);
}

function buildNovelAiDefaultsPayload(settings = getFormSettings()) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: sanitizeNovelAiDefaultSettings(settings)
  };
}

async function saveNovelAiDefaults() {
  if (!el.novelAiSaveDefaultsBtn) {
    return;
  }
  const originalText = el.novelAiSaveDefaultsBtn.textContent;
  el.novelAiSaveDefaultsBtn.disabled = true;
  el.novelAiSaveDefaultsBtn.textContent = "保存中...";
  try {
    const payload = await request("/api/novelai/defaults", {
      method: "PUT",
      body: JSON.stringify(buildNovelAiDefaultsPayload(getFormSettings()))
    });
    showToast(payload?.defaults?.updatedAt ? "已將目前 NovelAI 內容設為預設。" : "已保存 NovelAI 預設。");
  } catch (error) {
    showToast(error.message || "NovelAI 預設保存失敗。", "error");
  } finally {
    el.novelAiSaveDefaultsBtn.disabled = false;
    el.novelAiSaveDefaultsBtn.textContent = originalText;
  }
}

async function applyNovelAiDefaults() {
  try {
    const defaults = await loadNovelAiDefaults();
    const settings = defaults?.settings && typeof defaults.settings === "object" ? defaults.settings : {};
    if (!hasSettingsDraft(settings)) {
      showToast("目前沒有可套用的 NovelAI 預設。", "error");
      return;
    }
    setFormSettings(settings, {
      save: true,
      includeReferenceImages: true,
      includeBaseImage: true,
      clearBaseImage: !settings.baseImage,
      replaceFixedPromptSnippets: true,
      replaceRandomPromptSnippets: true
    });
    showToast("已套用 NovelAI 預設。");
  } catch (error) {
    showToast(error.message || "NovelAI 預設套用失敗。", "error");
  }
}

async function downloadNovelAiDefaults() {
  try {
    const defaults = await loadNovelAiDefaults();
    const payload = defaults?.settings
      ? buildNovelAiDefaultsPayload(defaults.settings)
      : buildNovelAiDefaultsPayload(getFormSettings());
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    triggerBlobDownload(blob, "novelai-defaults.json");
    showToast("已下載預設 JSON。");
  } catch (error) {
    showToast(error.message || "預設下載失敗。", "error");
  }
}

async function injectNovelAiDefaultsFromFile(file) {
  if (!file) {
    return;
  }
  try {
    const parsed = JSON.parse(await file.text());
    const source = parsed?.settings && typeof parsed.settings === "object" ? parsed.settings : parsed;
    const payload = buildNovelAiDefaultsPayload(source);
    const saved = await request("/api/novelai/defaults", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    const settings = saved?.defaults?.settings && typeof saved.defaults.settings === "object"
      ? saved.defaults.settings
      : payload.settings;
    setFormSettings(settings, {
      save: true,
      includeReferenceImages: true,
      includeBaseImage: true,
      clearBaseImage: !settings.baseImage,
      replaceFixedPromptSnippets: true,
      replaceRandomPromptSnippets: true
    });
    showToast("已注入並啟用 NovelAI 預設。");
  } catch (error) {
    showToast(error.message || "預設 JSON 注入失敗。", "error");
  } finally {
    if (el.novelAiDefaultsFile) {
      el.novelAiDefaultsFile.value = "";
    }
  }
}

function estimateAnlas(settings = getFormSettings()) {
  const normalMegapixels = (832 * 1216) / (1024 * 1024);
  const megapixels = Math.max(0.05, (Number(settings.width || 832) * Number(settings.height || 1216)) / (1024 * 1024));
  const stepFactor = Math.max(0.15, Number(settings.steps || 28) / 28);
  const modelFactor = 1;
  const baseImageFactor = settings.baseImage ? 1.15 : 1;
  const sampleCount = Math.max(1, Number(settings.samples || 1));
  const vibeCount = settings.vibeTransfer.enabled ? activeImageCount(settings.vibeTransfer.images) : 0;
  const preciseCount = settings.preciseReference.enabled ? activeImageCount(settings.preciseReference.images) : 0;
  const extraVibe = vibeCount > 4 ? (vibeCount - 4) * 2 : 0;
  const extraPrecise = preciseCount * 5;
  return Math.max(1, Math.ceil((20 * (megapixels / normalMegapixels) * stepFactor * modelFactor * baseImageFactor + extraVibe + extraPrecise) * sampleCount));
}

function renderCostPreview() {
  const settings = getFormSettings();
  const estimate = estimateAnlas(settings);
  const remaining = Number(novelAiStatusPayload?.remainingAnlas);
  const remainingText = Number.isFinite(remaining) ? `｜目前剩餘 ${remaining} Anlas` : "";
  el.novelAiCostPreview.textContent = `約 ${estimate} Anlas`;
  el.novelAiCostPreview.title = `預估消耗：約 ${estimate} Anlas${remainingText}。實際以 NovelAI 扣除為準。`;
  updateStudioSummary(settings);
}

function renderGenerationControls(state = "idle") {
  if (!el.novelAiGenerateBtn || !el.novelAiLoopGenerateBtn) {
    return;
  }
  const singleRunning = state === "single";
  const loopRunning = state === "loop";
  el.novelAiGenerateBtn.disabled = singleRunning || loopRunning;
  el.novelAiLoopGenerateBtn.disabled = singleRunning;
  el.novelAiGenerateLabel.textContent = singleRunning ? "生成中..." : "Generate";
  el.novelAiLoopGenerateLabel.textContent = loopRunning ? "Stop Loop" : "Loop Generate";
}

function getSelectedOptionLabel(select) {
  return select?.selectedOptions?.[0]?.textContent || select?.value || "";
}

function updateStudioSummary(settings = getFormSettings()) {
  el.novelAiModelDescription.textContent = NOVELAI_MODEL_DESCRIPTIONS[settings.model] || "自訂 NovelAI 圖像模型。";
  el.novelAiStepsSummary.textContent = String(settings.steps);
  el.novelAiGuidanceSummary.textContent = String(settings.scale);
  el.novelAiVarietySummary.textContent = isNovelAiV5Model(settings.model) ? "N/A" : settings.varietyPlus ? "On" : "Off";
  el.novelAiSeedSummary.textContent = settings.seed >= 0 ? String(settings.seed) : "N/A";
  el.novelAiSamplerSummary.textContent = getSelectedOptionLabel(el.novelAiSampler).replace(/^k_/u, "");
  el.novelAiStageSize.textContent = `${settings.width} × ${settings.height}`;
  if (!el.novelAiGenerateBtn.disabled && !novelAiLoopRunning) {
    renderGenerationControls("idle");
  }
}

function updateRangeValues() {
  document.querySelectorAll("[data-range-value-for]").forEach((node) => {
    const input = document.getElementById(node.dataset.rangeValueFor);
    node.textContent = Number(input?.value || 0).toFixed(2);
  });
  document.querySelectorAll('input[type="range"]').forEach((input) => syncRangeInputVisual(input));
}

function formatStatus(payload = novelAiStatusPayload) {
  if (!payload?.configured) {
    return "Anlas: -";
  }
  if (!payload.ok) {
    return "Anlas: ?";
  }
  return `Anlas: ${Number(payload.remainingAnlas || 0)}`;
}

async function refreshStatus() {
  el.novelAiStatus.textContent = "正在讀取 NovelAI 餘額...";
  try {
    novelAiStatusPayload = await request("/api/novelai/status");
    el.novelAiStatus.textContent = formatStatus(novelAiStatusPayload);
    el.novelAiStatus.title = novelAiStatusPayload?.ok
      ? [
        `固定 ${Number(novelAiStatusPayload.fixedAnlas || 0)}`,
        `已購買 ${Number(novelAiStatusPayload.purchasedAnlas || 0)}`,
        novelAiStatusPayload.tier ? `Tier ${novelAiStatusPayload.tier}` : ""
      ].filter(Boolean).join("｜")
      : novelAiStatusPayload?.error || "尚未設定 NOVELAI_API_TOKEN。";
    renderCostPreview();
  } catch (error) {
    el.novelAiStatus.textContent = "Anlas: ?";
    el.novelAiStatus.title = error.message || "NovelAI 餘額讀取失敗。";
  }
}

function dataUrlToBlob(dataUrl = "") {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/u);
  if (!match) {
    throw new Error("圖片資料格式不正確。");
  }
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: match[1] || "application/octet-stream" });
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("圖片讀取失敗。"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(blob);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("此圖片格式無法在瀏覽器轉換，請改用 PNG、JPG 或 WebP。"));
    img.src = dataUrl;
  });
}

async function convertImageDataUrlToPng(dataUrl) {
  const image = await loadImageFromDataUrl(dataUrl);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) {
    throw new Error("圖片尺寸讀取失敗。");
  }
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("瀏覽器無法轉換圖片。");
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}

async function normalizeImageForNovelAi(file) {
  const dataUrl = ensureUploadImageDataUrl(await blobToDataUrl(file), file);
  if (/^data:image\/(?:png|jpe?g);base64,/iu.test(dataUrl)) {
    return dataUrl;
  }
  return convertImageDataUrlToPng(dataUrl);
}

async function readImageFileAsDataUrl(file, options = {}) {
  if (!isImageFile(file)) {
    throw new Error("請選擇圖片檔案。");
  }
  if (options.normalizeForNovelAi) {
    return normalizeImageForNovelAi(file);
  }
  return blobToDataUrl(file);
}

async function getItemDataUrl(item = {}) {
  if (item.dataUrl) {
    return item.dataUrl;
  }
  if (item.imageBlob instanceof Blob) {
    return blobToDataUrl(item.imageBlob);
  }
  if (!item.imageUrl) {
    throw new Error("找不到圖片資料。");
  }
  const response = await fetch(item.imageUrl);
  if (!response.ok) {
    throw new Error(`圖片讀取失敗(${response.status})。`);
  }
  return blobToDataUrl(await response.blob());
}

async function getItemBlob(item = {}) {
  if (item.imageBlob instanceof Blob) {
    return item.imageBlob;
  }
  if (item.dataUrl) {
    return dataUrlToBlob(item.dataUrl);
  }
  if (!item.imageUrl) {
    throw new Error("找不到圖片資料。");
  }
  const response = await fetch(item.imageUrl);
  if (!response.ok) {
    throw new Error(`圖片讀取失敗(${response.status})。`);
  }
  return response.blob();
}

function idbRequest(requestObject) {
  return new Promise((resolve, reject) => {
    requestObject.onsuccess = () => resolve(requestObject.result);
    requestObject.onerror = () => reject(requestObject.error || new Error("IndexedDB 操作失敗。"));
  });
}

function idbTransactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("IndexedDB 寫入失敗。"));
    transaction.onabort = () => reject(transaction.error || new Error("IndexedDB 操作已取消。"));
  });
}

function openNovelAiDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("瀏覽器不支援 NovelAI 本地資料庫。"));
      return;
    }
    const requestObject = window.indexedDB.open(NOVELAI_HISTORY_DB_NAME, NOVELAI_DB_VERSION);
    requestObject.onupgradeneeded = () => {
      const db = requestObject.result;
      let historyStore = null;
      if (!db.objectStoreNames.contains(NOVELAI_HISTORY_STORE)) {
        historyStore = db.createObjectStore(NOVELAI_HISTORY_STORE, { keyPath: "id" });
      } else {
        historyStore = requestObject.transaction.objectStore(NOVELAI_HISTORY_STORE);
      }
      if (!historyStore.indexNames.contains("createdAt")) {
        historyStore.createIndex("createdAt", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(NOVELAI_REFERENCE_DRAFT_STORE)) {
        db.createObjectStore(NOVELAI_REFERENCE_DRAFT_STORE, { keyPath: "id" });
      }
    };
    requestObject.onsuccess = () => resolve(requestObject.result);
    requestObject.onerror = () => reject(requestObject.error || new Error("NovelAI 本地資料庫開啟失敗。"));
  });
}

function createReferenceImageDraft(settings = {}) {
  return {
    id: NOVELAI_REFERENCE_DRAFT_ID,
    baseImage: String(settings.baseImage || "").trim(),
    vibeTransfer: {
      images: normalizeImageItems(settings.vibeTransfer?.images, "nai_vibe", {
        strength: 0.6,
        informationExtracted: 1,
        strengthMin: -1,
        strengthMax: 1
      })
    },
    preciseReference: {
      images: normalizeImageItems(settings.preciseReference?.images, "nai_precise", {
        strength: 1,
        fidelity: 1,
        strengthMin: -1,
        strengthMax: 1,
        fidelityMin: -1,
        fidelityMax: 1
      })
    },
    updatedAt: new Date().toISOString()
  };
}

async function saveReferenceImageDraft(settings = {}) {
  const draft = createReferenceImageDraft(settings);
  const db = await openNovelAiDb();
  try {
    const transaction = db.transaction(NOVELAI_REFERENCE_DRAFT_STORE, "readwrite");
    transaction.objectStore(NOVELAI_REFERENCE_DRAFT_STORE).put(draft);
    await idbTransactionDone(transaction);
  } finally {
    db.close();
  }
}

async function loadReferenceImageDraft() {
  const db = await openNovelAiDb();
  try {
    const store = db.transaction(NOVELAI_REFERENCE_DRAFT_STORE, "readonly")
      .objectStore(NOVELAI_REFERENCE_DRAFT_STORE);
    return await idbRequest(store.get(NOVELAI_REFERENCE_DRAFT_ID));
  } finally {
    db.close();
  }
}

async function listHistoryPage(page = 1, pageSize = NOVELAI_HISTORY_PAGE_SIZE) {
  const db = await openNovelAiDb();
  try {
    const countStore = db.transaction(NOVELAI_HISTORY_STORE, "readonly").objectStore(NOVELAI_HISTORY_STORE);
    const total = await idbRequest(countStore.count());
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(totalPages, Math.max(1, Math.floor(Number(page) || 1)));
    const offset = (currentPage - 1) * pageSize;
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readonly");
    const store = transaction.objectStore(NOVELAI_HISTORY_STORE);
    const source = store.index("createdAt");
    const items = await new Promise((resolve, reject) => {
      const results = [];
      let advanced = offset === 0;
      const requestObject = source.openCursor(null, "prev");
      requestObject.onsuccess = () => {
        const cursor = requestObject.result;
        if (!cursor || results.length >= pageSize) {
          resolve(results);
          return;
        }
        if (!advanced) {
          advanced = true;
          cursor.advance(offset);
          return;
        }
        results.push(cursor.value);
        cursor.continue();
      };
      requestObject.onerror = () => reject(requestObject.error || new Error("本地歷史讀取失敗。"));
    });
    return { items, total, totalPages, page: currentPage };
  } finally {
    db.close();
  }
}

function normalizeAlbumItem(item = {}) {
  return {
    ...item,
    metadata: item.metadata && typeof item.metadata === "object" ? item.metadata : {},
    imageUrl: String(item.imageUrl || "").trim(),
    isFavorite: true
  };
}

async function listAlbumPage(page = 1, pageSize = NOVELAI_HISTORY_PAGE_SIZE, options = {}) {
  if (options.reload === true || !novelAiAlbumLoaded) {
    const payload = await request("/api/novelai/album");
    novelAiAlbumItems = (Array.isArray(payload?.items) ? payload.items : []).map(normalizeAlbumItem);
    novelAiAlbumLoaded = true;
  }
  const total = novelAiAlbumItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(totalPages, Math.max(1, Math.floor(Number(page) || 1)));
  const offset = (currentPage - 1) * pageSize;
  return {
    items: novelAiAlbumItems.slice(offset, offset + pageSize),
    total,
    totalPages,
    page: currentPage
  };
}

function canvasToBlob(canvas, type = "image/webp", quality = 0.82) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function createHistoryThumbnailBlob(imageBlob) {
  if (!(imageBlob instanceof Blob) || typeof createImageBitmap !== "function") {
    return null;
  }
  let bitmap = null;
  try {
    bitmap = await createImageBitmap(imageBlob);
    const scale = Math.min(1, NOVELAI_HISTORY_THUMBNAIL_SIZE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) {
      return null;
    }
    context.drawImage(bitmap, 0, 0, width, height);
    return await canvasToBlob(canvas);
  } catch {
    return null;
  } finally {
    bitmap?.close?.();
  }
}

async function prepareHistoryItemForStorage(item = {}) {
  const stored = { ...item };
  if (!(stored.imageBlob instanceof Blob) && stored.dataUrl) {
    const imageBlob = dataUrlToBlob(stored.dataUrl);
    if (imageBlob) {
      stored.imageBlob = imageBlob;
      delete stored.dataUrl;
    }
  }
  if (stored.imageBlob instanceof Blob && !(stored.thumbnailBlob instanceof Blob)) {
    stored.thumbnailBlob = await createHistoryThumbnailBlob(stored.imageBlob);
  }
  return stored;
}

async function saveHistoryItems(items = []) {
  if (!items.length) {
    return;
  }
  const storedItems = [];
  for (const item of items) {
    storedItems.push(await prepareHistoryItemForStorage(item));
  }
  const db = await openNovelAiDb();
  try {
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(NOVELAI_HISTORY_STORE);
    storedItems.forEach((item) => store.put(item));
    await idbTransactionDone(transaction);
  } finally {
    db.close();
  }
}

async function deleteHistoryItem(id = "") {
  const db = await openNovelAiDb();
  try {
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readwrite");
    transaction.objectStore(NOVELAI_HISTORY_STORE).delete(id);
    await idbTransactionDone(transaction);
  } finally {
    db.close();
  }
}

async function clearHistoryItems() {
  const db = await openNovelAiDb();
  try {
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readwrite");
    transaction.objectStore(NOVELAI_HISTORY_STORE).clear();
    await idbTransactionDone(transaction);
  } finally {
    db.close();
  }
}

function renderEmpty(container, text = "尚未有圖片。") {
  container.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "novelai-empty-card";
  empty.textContent = text;
  container.appendChild(empty);
}

function itemSettings(item = {}) {
  return item.metadata?.settings || item.settings || item.metadata || {};
}

function itemRequest(item = {}) {
  return item.metadata?.request || item.request || {};
}

function itemPrompt(item = {}) {
  return String(itemSettings(item).prompt || item.prompt || "").trim();
}

function formatPromptExpansionLines(expansions = []) {
  return (Array.isArray(expansions) ? expansions : [])
    .map((item) => {
      const name = String(item?.name || item?.placeholder || "").trim();
      const result = String(item?.result || "").trim();
      const picked = normalizePromptItemList(item?.weightedSelected || item?.selected || "", { preserveTrailingSpace: true }).join(", ");
      const details = [result, picked && picked !== result ? `抽選：${picked}` : ""].filter(Boolean).join("\n  ");
      return [name ? `- ${name}` : "-", details ? `  ${details}` : ""].filter(Boolean).join("\n");
    })
    .filter(Boolean);
}

function formatImageContent(item = {}) {
  const settings = itemSettings(item);
  const request = itemRequest(item);
  const prompt = settings.prompt || itemPrompt(item) || "";
  const promptTemplate = settings.promptTemplate || "";
  const negativePrompt = settings.negativePrompt || settings.uc || "";
  const lines = [
    "【Prompt】",
    prompt || "（空白）"
  ];
  if (promptTemplate && promptTemplate !== prompt) {
    lines.push("", "【Prompt Template】", promptTemplate);
  }
  if (negativePrompt) {
    lines.push("", "【Undesired Content】", negativePrompt);
  }
  const settingSummary = [
    `模型: ${settings.model || request.model || "N/A"}`,
    `尺寸: ${settings.width || "?"} x ${settings.height || "?"}`,
    `Seed: ${settings.seed ?? "N/A"}`,
    `Steps: ${settings.steps ?? "N/A"}`,
    `Guidance: ${settings.scale ?? "N/A"}`,
    `Sampler: ${settings.sampler || "N/A"}`,
    `Noise Schedule: ${settings.noiseSchedule || "N/A"}`
  ];
  lines.push("", "【設定】", ...settingSummary);
  const characters = (settings.characters || []).filter((character) => character?.enabled !== false && (character.prompt || character.negativePrompt));
  if (characters.length) {
    lines.push("", "【Character Prompts】");
    characters.forEach((character, index) => {
      lines.push(
        `#${index + 1} ${character.name || "Character"}`,
        character.prompt ? `Prompt: ${character.prompt}` : "",
        character.negativePrompt ? `Undesired: ${character.negativePrompt}` : ""
      );
    });
  }
  const fixedLines = formatPromptExpansionLines(settings.fixedPrompt?.expansions);
  if (fixedLines.length) {
    lines.push("", "【Fixed Prompt 展開】", ...fixedLines);
  }
  const randomLines = formatPromptExpansionLines(settings.randomPrompt?.expansions);
  if (randomLines.length) {
    lines.push("", "【Random Prompt 抽選】", ...randomLines);
  }
  return lines.join("\n").replace(/\n{3,}/gu, "\n\n").trim();
}

function openImageContentDialog(item = {}) {
  if (!el.novelAiContentDialog || !el.novelAiContentText) {
    showToast(formatImageContent(item));
    return;
  }
  el.novelAiContentText.value = formatImageContent(item);
  if (typeof el.novelAiContentDialog.showModal === "function") {
    el.novelAiContentDialog.showModal();
  } else {
    el.novelAiContentDialog.setAttribute("open", "open");
  }
}

function openImageViewerDialog(item = {}) {
  releaseImageViewerResource();
  const imageSource = createItemImageSource(item);
  const imageSrc = imageSource.src;
  if (!imageSrc) {
    showToast("沒有可檢視的圖片。", "error");
    return;
  }
  if (!el.novelAiImageViewerDialog || !el.novelAiImageViewerImage) {
    window.open(imageSrc, "_blank", "noopener,noreferrer");
    return;
  }
  novelAiImageViewerObjectUrl = imageSource.objectUrl;
  const title = itemPrompt(item) || item.fileName || "NovelAI Image";
  el.novelAiImageViewerImage.dataset.uiLanguageSkip = "true";
  el.novelAiImageViewerImage.src = imageSrc;
  el.novelAiImageViewerImage.alt = title;
  resetImageViewerTransform();
  if (el.novelAiImageViewerTitle) {
    el.novelAiImageViewerTitle.dataset.uiLanguageSkip = "true";
    el.novelAiImageViewerTitle.textContent = truncateText(title, 80);
  }
  if (typeof el.novelAiImageViewerDialog.showModal === "function") {
    el.novelAiImageViewerDialog.showModal();
  } else {
    el.novelAiImageViewerDialog.setAttribute("open", "open");
  }
}

function makeActionButton(text, className, handler) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = text;
  button.addEventListener("click", handler);
  return button;
}

function renderMainImage(item = null) {
  releaseMainImageResource();
  if (!item) {
    novelAiSelectedHistoryId = "";
    updateActiveHistoryItem();
    renderEmpty(el.novelAiOutputGrid, "生成後會顯示在這裡。");
    return;
  }
  if (item.id) {
    novelAiSelectedHistoryId = item.id;
    updateActiveHistoryItem();
  }
  el.novelAiOutputGrid.innerHTML = "";
  const card = document.createElement("article");
  card.className = "novelai-image-card";
  const preview = document.createElement("div");
  preview.className = "novelai-image-preview";
  const img = document.createElement("img");
  const imageSource = createItemImageSource(item);
  novelAiMainImageObjectUrl = imageSource.objectUrl;
  img.src = imageSource.src;
  img.dataset.uiLanguageSkip = "true";
  img.alt = itemPrompt(item) || item.fileName || "NovelAI image";
  img.decoding = "async";
  preview.appendChild(img);
  preview.title = "點擊放大檢視";
  preview.addEventListener("click", () => openImageViewerDialog(item));
  const settings = itemSettings(item);
  const meta = document.createElement("div");
  meta.className = "novelai-image-meta";
  meta.innerHTML = `
    <strong data-ui-language-skip></strong>
    <span></span>
  `;
  meta.querySelector("strong").textContent = truncateText(itemPrompt(item) || item.fileName || "NovelAI Image", 120);
  meta.querySelector("span").textContent = [
    settings.model || "",
    settings.seed !== undefined ? `Seed ${settings.seed}` : ""
  ].filter(Boolean).join("｜");
  const actions = document.createElement("div");
  actions.className = "novelai-image-actions";
  const favoriteAction = makeActionButton(
    item.isFavorite ? "取消收藏" : "收藏",
    "secondary nai-favorite-action",
    async () => {
      favoriteAction.disabled = true;
      const changed = item.isFavorite
        ? await unfavoriteImage(item)
        : await favoriteImage(item);
      if (!changed && favoriteAction.isConnected) {
        favoriteAction.disabled = false;
      }
    }
  );
  actions.append(
    makeActionButton("放大", "secondary nai-view-action", () => openImageViewerDialog(item)),
    makeActionButton("內容", "secondary nai-content-action", () => openImageContentDialog(item)),
    favoriteAction,
    makeActionButton("還原設定", "nai-restore-action", () => {
      applyMetadataToForm(item.metadata || item.settings || {});
      showToast("已把圖片設定還原到表單");
    }),
    makeActionButton("下載", "secondary", () => openDownloadDialog(item))
  );
  card.append(preview, meta, actions);
  el.novelAiOutputGrid.appendChild(card);
}

function updateActiveHistoryItem(options = {}) {
  const { scroll = false } = options;
  let activeCard = null;
  el.novelAiHistoryGrid?.querySelectorAll?.(".nai-history-item").forEach((card) => {
    const active = Boolean(novelAiSelectedHistoryId) && card.dataset.historyId === novelAiSelectedHistoryId;
    card.classList.toggle("active", active);
    card.querySelector('[data-history-action="select"]')?.setAttribute("aria-current", active ? "true" : "false");
    if (active) {
      activeCard = card;
    }
  });
  if (scroll && activeCard) {
    activeCard.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

function selectHistoryItem(item = null, options = {}) {
  if (!item) {
    return;
  }
  renderMainImage(item);
  updateActiveHistoryItem(options);
}

function moveHistorySelection(direction = 1) {
  if (!novelAiHistoryItems.length) {
    return;
  }
  const currentIndex = novelAiHistoryItems.findIndex((item) => item.id === novelAiSelectedHistoryId);
  const fallbackIndex = direction > 0 ? -1 : novelAiHistoryItems.length;
  const nextIndex = Math.min(novelAiHistoryItems.length - 1, Math.max(0, (currentIndex >= 0 ? currentIndex : fallbackIndex) + direction));
  if (nextIndex >= 0 && nextIndex < novelAiHistoryItems.length) {
    selectHistoryItem(novelAiHistoryItems[nextIndex], { scroll: true });
  }
}

function canUseHistoryKeyboard(event = {}) {
  if (!["ArrowUp", "ArrowDown"].includes(event.key)) {
    return false;
  }
  if (document.querySelector("dialog[open]")) {
    return false;
  }
  const target = event.target;
  if (target?.closest?.("textarea, input, select, [contenteditable=\"true\"]")) {
    return false;
  }
  return novelAiHistoryItems.length > 0;
}

function onHistoryKeyboardNavigation(event) {
  if (!canUseHistoryKeyboard(event)) {
    return;
  }
  event.preventDefault();
  moveHistorySelection(event.key === "ArrowUp" ? -1 : 1);
}

function renderHistoryList(items = []) {
  novelAiHistoryItems = Array.isArray(items) ? items : [];
  releaseHistoryImageResources();
  el.novelAiHistoryGrid.innerHTML = "";
  if (!novelAiHistoryItems.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = novelAiLibraryView === "favorites" ? "還沒有收藏圖片。" : "還沒有生成歷史。";
    el.novelAiHistoryGrid.appendChild(empty);
    return;
  }
  novelAiHistoryItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "nai-history-item";
    card.dataset.historyId = item.id || "";
    card.innerHTML = `
      <button type="button" data-history-action="select"><img alt="" /></button>
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button type="button" class="muted nai-history-item-action" data-history-action="remove"></button>
    `;
    const image = card.querySelector("img");
    const imageSource = createItemImageSource(item, { thumbnail: true });
    if (imageSource.objectUrl) {
      novelAiHistoryObjectUrls.push(imageSource.objectUrl);
    }
    image.src = imageSource.src;
    image.loading = "lazy";
    image.decoding = "async";
    image.fetchPriority = "low";
    const historyTitle = card.querySelector("strong");
    historyTitle.dataset.uiLanguageSkip = "true";
    historyTitle.textContent = truncateText(itemPrompt(item) || item.fileName || "NovelAI Image", 36);
    card.querySelector("span").textContent = item.createdAt ? new Date(item.createdAt).toLocaleString("zh-Hant") : "";
    card.querySelector('[data-history-action="select"]').addEventListener("click", () => selectHistoryItem(item, { scroll: true }));
    const removeButton = card.querySelector('[data-history-action="remove"]');
    const isFavorite = novelAiLibraryView === "favorites";
    removeButton.textContent = isFavorite ? "取消" : "×";
    removeButton.setAttribute("aria-label", isFavorite ? "取消收藏" : "刪除歷史圖片");
    removeButton.title = isFavorite ? "取消收藏並移回歷史" : "刪除歷史圖片";
    removeButton.addEventListener("click", async () => {
      removeButton.disabled = true;
      if (isFavorite) {
        const changed = await unfavoriteImage(item);
        if (!changed && removeButton.isConnected) {
          removeButton.disabled = false;
        }
        return;
      }
      await deleteHistoryItem(item.id);
      if (novelAiSelectedHistoryId === item.id) {
        renderMainImage(null);
      }
      await renderHistory();
      showToast("已刪除本地歷史圖片");
    });
    el.novelAiHistoryGrid.appendChild(card);
  });
  updateActiveHistoryItem();
}

function renderHistoryPagination() {
  const totalPages = Math.max(1, Math.ceil(novelAiHistoryTotal / NOVELAI_HISTORY_PAGE_SIZE));
  const showingFavorites = novelAiLibraryView === "favorites";
  el.novelAiHistoryTabBtn?.classList.toggle("active", !showingFavorites);
  el.novelAiHistoryTabBtn?.setAttribute("aria-selected", showingFavorites ? "false" : "true");
  el.novelAiFavoritesTabBtn?.classList.toggle("active", showingFavorites);
  el.novelAiFavoritesTabBtn?.setAttribute("aria-selected", showingFavorites ? "true" : "false");
  el.novelAiHistoryGrid?.setAttribute(
    "aria-labelledby",
    showingFavorites ? "novelAiFavoritesTabBtn" : "novelAiHistoryTabBtn"
  );
  if (el.novelAiHistoryPageInfo) {
    el.novelAiHistoryPageInfo.textContent = novelAiHistoryTotal
      ? `${novelAiHistoryPage} / ${totalPages} · ${novelAiHistoryTotal} 張`
      : "0 張";
  }
  if (el.novelAiHistoryPrevBtn) {
    el.novelAiHistoryPrevBtn.disabled = novelAiHistoryPage <= 1;
  }
  if (el.novelAiHistoryNextBtn) {
    el.novelAiHistoryNextBtn.disabled = novelAiHistoryPage >= totalPages;
  }
  if (el.novelAiClearHistoryBtn) {
    el.novelAiClearHistoryBtn.hidden = showingFavorites;
    el.novelAiClearHistoryBtn.disabled = showingFavorites || novelAiHistoryTotal === 0;
  }
}

async function renderHistory(options = {}) {
  const renderToken = ++novelAiHistoryRenderToken;
  renderHistoryPagination();
  try {
    const result = novelAiLibraryView === "favorites"
      ? await listAlbumPage(novelAiHistoryPage, NOVELAI_HISTORY_PAGE_SIZE, {
        reload: options.reloadAlbum === true
      })
      : await listHistoryPage(novelAiHistoryPage);
    if (renderToken !== novelAiHistoryRenderToken) {
      return;
    }
    novelAiHistoryPage = result.page;
    novelAiHistoryTotal = result.total;
    renderHistoryList(result.items);
    renderHistoryPagination();
  } catch (error) {
    if (renderToken !== novelAiHistoryRenderToken) {
      return;
    }
    novelAiHistoryTotal = 0;
    renderEmpty(
      el.novelAiHistoryGrid,
      error.message || (novelAiLibraryView === "favorites" ? "收藏讀取失敗。" : "本地歷史讀取失敗。")
    );
    renderHistoryPagination();
  }
}

async function setNovelAiLibraryView(view = "history") {
  if (!["history", "favorites"].includes(view)) {
    return;
  }
  novelAiLibraryView = view;
  novelAiHistoryPage = 1;
  renderHistoryPagination();
  await renderHistory();
  el.novelAiHistoryGrid?.scrollTo?.({ top: 0 });
}

async function clearHistoryFromUi() {
  if (novelAiLibraryView !== "history" || !novelAiHistoryTotal) {
    return;
  }
  const confirmed = window.confirm("確定要清空所有 NovelAI 本地歷史圖片嗎？此操作無法復原。");
  if (!confirmed) {
    return;
  }
  el.novelAiClearHistoryBtn.disabled = true;
  try {
    await clearHistoryItems();
    novelAiHistoryPage = 1;
    novelAiHistoryTotal = 0;
    novelAiSelectedHistoryId = "";
    await renderHistory();
    showToast("已清空本地歷史圖片");
  } catch (error) {
    showToast(error.message || "本地歷史清空失敗。", "error");
  } finally {
    el.novelAiClearHistoryBtn.disabled = novelAiHistoryTotal === 0;
  }
}

let pngCrcTable = null;

function getPngCrcTable() {
  if (pngCrcTable) {
    return pngCrcTable;
  }
  pngCrcTable = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let crc = index;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    pngCrcTable[index] = crc >>> 0;
  }
  return pngCrcTable;
}

function pngCrc32(bytes) {
  const table = getPngCrcTable();
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts = []) {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    output.set(part, offset);
    offset += part.length;
  });
  return output;
}

function asciiJsonText(value = "") {
  return String(value).replace(/[^\x20-\x7e]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}

function stringifyPngMetadataValue(value, ascii = false) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return ascii ? asciiJsonText(text || "") : String(text || "");
}

function createPngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length, false);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, pngCrc32(concatBytes([typeBytes, data])), false);
  return chunk;
}

function normalizedPngKeyword(key = "") {
  return String(key || "").replace(/\0/g, "").slice(0, 79);
}

function createPngTextChunk(key, value) {
  const keyword = new TextEncoder().encode(normalizedPngKeyword(key));
  const text = new TextEncoder().encode(stringifyPngMetadataValue(value, true).replace(/\0/g, ""));
  return createPngChunk("tEXt", concatBytes([keyword, new Uint8Array([0]), text]));
}

function createPngInternationalTextChunk(key, value) {
  const keyword = new TextEncoder().encode(normalizedPngKeyword(key));
  const text = new TextEncoder().encode(stringifyPngMetadataValue(value));
  return createPngChunk("iTXt", concatBytes([keyword, new Uint8Array([0, 0, 0, 0, 0]), text]));
}

function findPngIendOffset(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((value, index) => bytes[index] === value)) {
    return -1;
  }
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
    const type = readPngChunkType(bytes, offset + 4);
    if (type === "IEND") {
      return offset;
    }
    offset += 12 + length;
  }
  return -1;
}

function readPngTextEntry(type, data) {
  if (type === "tEXt") {
    return readPngTextChunk(data);
  }
  if (type === "iTXt") {
    return readPngInternationalTextChunk(data);
  }
  return null;
}

function parsePngChunks(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((value, index) => bytes[index] === value)) {
    return [];
  }
  const chunks = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) {
      break;
    }
    const type = readPngChunkType(bytes, offset + 4);
    const data = bytes.slice(dataStart, dataEnd);
    chunks.push({
      type,
      start: offset,
      end: dataEnd + 4,
      entry: readPngTextEntry(type, data)
    });
    offset = dataEnd + 4;
    if (type === "IEND") {
      break;
    }
  }
  return chunks;
}

function looksLikeNovelAiNativeComment(value = "") {
  const parsed = parseMetadataText(value);
  return Boolean(
    parsed && typeof parsed === "object" &&
    (parsed.signed_hash || parsed.request_type || parsed.v4_prompt || parsed.v4_negative_prompt)
  );
}

function cleanNativeNovelAiPngMetadata(bytes) {
  const chunks = parsePngChunks(bytes);
  const nativeCommentIndex = chunks.findIndex((chunk) => (
    chunk.entry?.key === "Comment" && looksLikeNovelAiNativeComment(chunk.entry.value)
  ));
  if (nativeCommentIndex < 0) {
    return null;
  }
  const seenStandardKeys = new Set();
  const output = [bytes.slice(0, 8)];
  chunks.forEach((chunk, index) => {
    const key = chunk.entry?.key || "";
    if (key === "NovelAIMetadata" || key === "TimeTavernNovelAIMetadata") {
      return;
    }
    if (NOVELAI_STANDARD_PNG_TEXT_KEYS.has(key)) {
      if (key === "Comment") {
        if (index !== nativeCommentIndex || seenStandardKeys.has(key)) {
          return;
        }
        seenStandardKeys.add(key);
      } else {
        if (seenStandardKeys.has(key)) {
          return;
        }
        seenStandardKeys.add(key);
      }
    }
    output.push(bytes.slice(chunk.start, chunk.end));
  });
  return concatBytes(output);
}

function stripPngTextMetadata(bytes) {
  const chunks = parsePngChunks(bytes);
  if (!chunks.length) {
    return bytes;
  }
  const output = [bytes.slice(0, 8)];
  chunks.forEach((chunk) => {
    if (chunk.type === "tEXt" || chunk.type === "iTXt" || chunk.type === "zTXt") {
      return;
    }
    output.push(bytes.slice(chunk.start, chunk.end));
  });
  return concatBytes(output);
}

const NOVELAI_STEALTH_SIGNATURES = new Set([
  "stealth_pnginfo",
  "stealth_pngcomp",
  "stealth_rgbinfo",
  "stealth_rgbcomp"
]);

const MAX_NOVELAI_STEALTH_BYTES = 16 * 1024 * 1024;

function createPngStealthBitReader(imageData, channels = []) {
  const width = Number(imageData?.width) || 0;
  const height = Number(imageData?.height) || 0;
  const pixels = imageData?.data;
  const availableBits = width * height * channels.length;
  let bitOffset = 0;

  function readBit() {
    if (!pixels || bitOffset >= availableBits) {
      return null;
    }
    const pixelIndex = Math.floor(bitOffset / channels.length);
    const channel = channels[bitOffset % channels.length];
    const x = Math.floor(pixelIndex / height);
    const y = pixelIndex % height;
    bitOffset += 1;
    return pixels[(y * width + x) * 4 + channel] & 1;
  }

  function readBytes(byteCount) {
    const output = new Uint8Array(byteCount);
    for (let byteIndex = 0; byteIndex < byteCount; byteIndex += 1) {
      for (let bitIndex = 0; bitIndex < 8; bitIndex += 1) {
        const bit = readBit();
        if (bit === null) {
          return null;
        }
        output[byteIndex] = (output[byteIndex] << 1) | bit;
      }
    }
    return output;
  }

  function readPayload(bitLength) {
    const output = new Uint8Array(Math.ceil(bitLength / 8));
    for (let bitIndex = 0; bitIndex < bitLength; bitIndex += 1) {
      const bit = readBit();
      if (bit === null) {
        return null;
      }
      output[Math.floor(bitIndex / 8)] |= bit << (7 - (bitIndex % 8));
    }
    return output;
  }

  return {
    availableBits,
    get bitOffset() {
      return bitOffset;
    },
    readBytes,
    readPayload
  };
}

function readPngStealthSignature(imageData, channels = []) {
  const signatureBytes = createPngStealthBitReader(imageData, channels).readBytes(15);
  return signatureBytes ? String.fromCharCode(...signatureBytes) : "";
}

function readPngStealthData(imageData, channels = []) {
  const reader = createPngStealthBitReader(imageData, channels);
  const signatureBytes = reader.readBytes(15);
  const signature = signatureBytes ? String.fromCharCode(...signatureBytes) : "";
  if (!NOVELAI_STEALTH_SIGNATURES.has(signature)) {
    return null;
  }
  const lengthBytes = reader.readBytes(4);
  if (!lengthBytes) {
    return null;
  }
  const bitLength = (
    (lengthBytes[0] << 24) |
    (lengthBytes[1] << 16) |
    (lengthBytes[2] << 8) |
    lengthBytes[3]
  ) >>> 0;
  if (
    bitLength <= 0 ||
    bitLength > MAX_NOVELAI_STEALTH_BYTES * 8 ||
    bitLength > reader.availableBits - reader.bitOffset
  ) {
    return null;
  }
  const payload = reader.readPayload(bitLength);
  return payload ? { signature, payload } : null;
}

function stripPngStealthImageData(imageData) {
  const alphaSignature = readPngStealthSignature(imageData, [3]);
  const rgbSignature = readPngStealthSignature(imageData, [0, 1, 2]);
  const channels = new Set();
  if (NOVELAI_STEALTH_SIGNATURES.has(alphaSignature) && alphaSignature.startsWith("stealth_png")) {
    channels.add(3);
  }
  if (NOVELAI_STEALTH_SIGNATURES.has(rgbSignature) && rgbSignature.startsWith("stealth_rgb")) {
    channels.add(0);
    channels.add(1);
    channels.add(2);
  }
  if (!channels.size) {
    return false;
  }
  for (let pixelOffset = 0; pixelOffset < imageData.data.length; pixelOffset += 4) {
    channels.forEach((channel) => {
      imageData.data[pixelOffset + channel] |= 1;
    });
  }
  return true;
}

async function decodePngBlobImageData(blob) {
  if (typeof createImageBitmap !== "function") {
    return null;
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob, { premultiplyAlpha: "none", colorSpaceConversion: "none" });
  } catch {
    bitmap = await createImageBitmap(blob);
  }
  try {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("瀏覽器無法讀取圖片像素資料。");
    }
    context.drawImage(bitmap, 0, 0);
    return { canvas, context, imageData: context.getImageData(0, 0, canvas.width, canvas.height) };
  } finally {
    bitmap?.close?.();
  }
}

async function stripPngStealthMetadata(blob) {
  const decoded = await decodePngBlobImageData(blob);
  if (!decoded || !stripPngStealthImageData(decoded.imageData)) {
    return blob;
  }
  decoded.context.putImageData(decoded.imageData, 0, 0);
  const cleanedBlob = await canvasToBlob(decoded.canvas, "image/png");
  if (!cleanedBlob) {
    throw new Error("瀏覽器無法輸出已清除資料的圖片。");
  }
  return cleanedBlob;
}

async function readPngStealthMetadataText(blob) {
  const decoded = await decodePngBlobImageData(blob);
  if (!decoded) {
    return "";
  }
  const encoded = readPngStealthData(decoded.imageData, [3]) || readPngStealthData(decoded.imageData, [0, 1, 2]);
  if (!encoded) {
    return "";
  }
  const payload = encoded.signature.endsWith("comp") ? gunzipSync(encoded.payload) : encoded.payload;
  return new TextDecoder().decode(payload);
}

function buildNovelAiCompatibleComment(item = {}) {
  const existingMetadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  const settings = normalizeSettings(existingMetadata.settings || item.settings || existingMetadata);
  const request = existingMetadata.request || item.request || {};
  const parameters = request.parameters && typeof request.parameters === "object" ? request.parameters : {};
  return {
    prompt: settings.prompt || "",
    prompt_template: settings.promptTemplate || "",
    steps: settings.steps,
    height: settings.height,
    width: settings.width,
    scale: settings.scale,
    uncond_scale: parameters.uncond_scale ?? 0,
    cfg_rescale: settings.cfgRescale,
    seed: settings.seed,
    n_samples: settings.samples,
    noise_schedule: settings.noiseSchedule,
    legacy_v3_extend: parameters.legacy_v3_extend ?? false,
    reference_information_extracted_multiple: parameters.reference_information_extracted_multiple || [],
    reference_strength_multiple: parameters.reference_strength_multiple || [],
    extra_passthrough_testing: parameters.extra_passthrough_testing || {
      prompt: null,
      uc: null,
      hide_debug_overlay: false,
      r: 0,
      eta: 1,
      negative_momentum: 0
    },
    v4_prompt: parameters.v4_prompt || {
      caption: {
        base_caption: settings.prompt || "",
        char_captions: (settings.characters || []).filter((character) => character.enabled !== false).map((character) => ({
          char_caption: character.prompt || "",
          centers: [{ x: character.x ?? 0.5, y: character.y ?? 0.5 }]
        }))
      },
      use_coords: settings.characterPositionMode === "manual" && (settings.characters || []).some((character) => character.enabled !== false),
      use_order: (settings.characters || []).some((character) => character.enabled !== false),
      legacy_uc: false
    },
    v4_negative_prompt: parameters.v4_negative_prompt || {
      caption: {
        base_caption: settings.negativePrompt || "",
        char_captions: (settings.characters || []).filter((character) => character.enabled !== false).map((character) => ({
          char_caption: character.negativePrompt || "",
          centers: [{ x: character.x ?? 0.5, y: character.y ?? 0.5 }]
        }))
      },
      use_coords: false,
      use_order: false,
      legacy_uc: false
    },
    sampler: settings.sampler,
    controlnet_strength: parameters.controlnet_strength ?? null,
    controlnet_model: parameters.controlnet_model ?? null,
    dynamic_thresholding: parameters.dynamic_thresholding ?? false,
    dynamic_thresholding_percentile: parameters.dynamic_thresholding_percentile ?? 0.999,
    dynamic_thresholding_mimic_scale: parameters.dynamic_thresholding_mimic_scale ?? 10,
    sm: parameters.sm ?? false,
    sm_dyn: parameters.sm_dyn ?? false,
    skip_cfg_above_sigma: parameters.skip_cfg_above_sigma ?? (settings.varietyPlus ? varietySigmaForModel(settings.model) : null),
    skip_cfg_below_sigma: parameters.skip_cfg_below_sigma ?? 0,
    lora_unet_weights: parameters.lora_unet_weights ?? null,
    lora_clip_weights: parameters.lora_clip_weights ?? null,
    deliberate_euler_ancestral_bug: parameters.deliberate_euler_ancestral_bug ?? false,
    prefer_brownian: parameters.prefer_brownian ?? true,
    cfg_sched_eligibility: parameters.cfg_sched_eligibility ?? "enable_for_post_summer_samplers",
    explike_fine_detail: parameters.explike_fine_detail ?? false,
    minimize_sigma_inf: parameters.minimize_sigma_inf ?? false,
    uncond_per_vibe: parameters.uncond_per_vibe ?? true,
    wonky_vibe_correlation: parameters.wonky_vibe_correlation ?? true,
    stream: parameters.stream ?? "msgpack",
    version: 1,
    uc: settings.negativePrompt || "",
    fixed_prompt: settings.fixedPrompt || null,
    fixed_prompt_snippets: settings.fixedPromptSnippets || [],
    random_prompt: settings.randomPrompt || null,
    request_type: parameters.request_type || "PromptGenerateRequest"
  };
}

function buildDownloadMetadata(item = {}) {
  const existingMetadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  const settings = normalizeSettings(existingMetadata.settings || item.settings || existingMetadata);
  const request = existingMetadata.request || item.request || {};
  const fullMetadata = {
    ...existingMetadata,
    source: existingMetadata.source || "time_tavern_novelai",
    version: existingMetadata.version || 1,
    createdAt: existingMetadata.createdAt || item.createdAt || new Date().toISOString(),
    settings,
    request
  };
  return {
    Title: "NovelAI generated image",
    Description: settings.prompt || itemPrompt(item) || "",
    Software: "NovelAI",
    Source: String(request?.model || settings.model || "NovelAI"),
    Comment: buildNovelAiCompatibleComment(item),
    TimeTavernNovelAIMetadata: fullMetadata
  };
}

function injectPngMetadataForDownload(blob, item = {}) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    const iendOffset = findPngIendOffset(bytes);
    if (iendOffset < 0) {
      return blob;
    }
    const cleanedNativePng = cleanNativeNovelAiPngMetadata(bytes);
    if (cleanedNativePng) {
      return new Blob([cleanedNativePng], { type: "image/png" });
    }
    const metadata = buildDownloadMetadata(item);
    const chunks = Object.entries(metadata)
      .filter(([key, value]) => key && value !== undefined && value !== null && value !== "")
      .flatMap(([key, value]) => [
        createPngTextChunk(key, value),
        createPngInternationalTextChunk(key, value)
      ]);
    const output = concatBytes([
      bytes.slice(0, iendOffset),
      ...chunks,
      bytes.slice(iendOffset)
    ]);
    return new Blob([output], { type: "image/png" });
  });
}

async function stripPngMetadataForDownload(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (findPngIendOffset(bytes) < 0) {
    return blob;
  }
  const chunkCleanedBlob = new Blob([stripPngTextMetadata(bytes)], { type: "image/png" });
  return stripPngStealthMetadata(chunkCleanedBlob);
}

function openDownloadDialog(item = {}) {
  novelAiPendingDownloadItem = item;
  if (typeof el.novelAiDownloadDialog?.showModal === "function") {
    el.novelAiDownloadDialog.showModal();
  } else {
    el.novelAiDownloadDialog?.setAttribute("open", "open");
  }
}

function closeDownloadDialog() {
  if (el.novelAiDownloadDialog?.open && typeof el.novelAiDownloadDialog.close === "function") {
    el.novelAiDownloadDialog.close();
  } else {
    el.novelAiDownloadDialog?.removeAttribute("open");
  }
  novelAiPendingDownloadItem = null;
}

async function handleDownloadChoice(mode = "cancel") {
  const item = novelAiPendingDownloadItem;
  closeDownloadDialog();
  if (!item || mode === "cancel") {
    return;
  }
  await downloadImage(item, { includeMetadata: mode === "metadata" });
}

async function downloadImage(item = {}, options = {}) {
  const includeMetadata = options.includeMetadata !== false;
  try {
    let blob = item.dataUrl
      ? dataUrlToBlob(item.dataUrl)
      : item.imageBlob instanceof Blob
        ? item.imageBlob
      : await fetch(item.imageUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`圖片下載失敗(${response.status})。`);
        }
        return response.blob();
      });
    const fileName = sanitizeDownloadFileName(item.fileName || `novelai-${item.id || Date.now()}.png`);
    if (blob.type === "image/png" || /\.png$/iu.test(fileName)) {
      blob = includeMetadata
        ? await injectPngMetadataForDownload(blob, item)
        : await stripPngMetadataForDownload(blob);
    }
    triggerBlobDownload(blob, fileName);
    showToast(includeMetadata ? "已下載圖片，包含設定 metadata" : "已下載純圖片");
  } catch (error) {
    showToast(error.message || "圖片下載失敗", "error");
  }
}

async function favoriteImage(item = {}) {
  let albumItem = null;
  try {
    const payload = await request("/api/novelai/album", {
      method: "POST",
      body: JSON.stringify({
        imageDataUrl: await getItemDataUrl(item),
        fileName: item.fileName || `novelai-${item.id || Date.now()}.png`,
        metadata: item.metadata || {
          settings: item.settings || itemSettings(item),
          request: item.request || {}
        }
      })
    });
    albumItem = normalizeAlbumItem(payload?.item || {});
    try {
      if (item.id) {
        await deleteHistoryItem(item.id);
      }
    } catch (error) {
      await request(`/api/novelai/album/${encodeURIComponent(albumItem.id)}`, { method: "DELETE" }).catch(() => {});
      throw error;
    }
    if (novelAiAlbumLoaded) {
      novelAiAlbumItems = [albumItem, ...novelAiAlbumItems.filter((entry) => entry.id !== albumItem.id)];
    }
    novelAiHistoryPage = 1;
    await renderHistory();
    renderMainImage(albumItem);
    showToast(`已收藏：${albumItem.fileName || "NovelAI 圖片"}`);
    return true;
  } catch (error) {
    showToast(error.message || "收藏失敗", "error");
    return false;
  }
}

async function unfavoriteImage(item = {}) {
  let historyItem = null;
  try {
    historyItem = {
      ...item,
      id: makeClientId("nai_img"),
      imageBlob: await getItemBlob(item),
      imageUrl: "",
      dataUrl: "",
      thumbnailBlob: null,
      isFavorite: false,
      createdAt: new Date().toISOString()
    };
    await saveHistoryItems([historyItem]);
    try {
      await request(`/api/novelai/album/${encodeURIComponent(item.id)}`, { method: "DELETE" });
    } catch (error) {
      await deleteHistoryItem(historyItem.id).catch(() => {});
      throw error;
    }
    novelAiAlbumItems = novelAiAlbumItems.filter((entry) => entry.id !== item.id);
    novelAiLibraryView = "history";
    novelAiHistoryPage = 1;
    await renderHistory();
    renderMainImage(historyItem);
    showToast("已取消收藏並移回歷史");
    return true;
  } catch (error) {
    showToast(error.message || "取消收藏失敗", "error");
    return false;
  }
}

function readPngChunkType(bytes, offset) {
  return String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
}

function readPngTextChunk(data) {
  const separatorIndex = data.indexOf(0);
  if (separatorIndex <= 0) {
    return null;
  }
  return {
    key: new TextDecoder("latin1").decode(data.slice(0, separatorIndex)),
    value: new TextDecoder("latin1").decode(data.slice(separatorIndex + 1))
  };
}

function readPngInternationalTextChunk(data) {
  const keywordEnd = data.indexOf(0);
  if (keywordEnd <= 0 || keywordEnd + 3 >= data.length || data[keywordEnd + 1] === 1) {
    return null;
  }
  let cursor = keywordEnd + 3;
  while (cursor < data.length && data[cursor] !== 0) {
    cursor += 1;
  }
  cursor += 1;
  while (cursor < data.length && data[cursor] !== 0) {
    cursor += 1;
  }
  cursor += 1;
  if (cursor >= data.length) {
    return null;
  }
  return {
    key: new TextDecoder().decode(data.slice(0, keywordEnd)),
    value: new TextDecoder().decode(data.slice(cursor))
  };
}

function readPngMetadataEntries(bytes) {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (!signature.every((value, index) => bytes[index] === value)) {
    return {};
  }
  const entries = {};
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
    const type = readPngChunkType(bytes, offset + 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd > bytes.length) {
      break;
    }
    const data = bytes.slice(dataStart, dataEnd);
    const entry = type === "tEXt" ? readPngTextChunk(data) : type === "iTXt" ? readPngInternationalTextChunk(data) : null;
    if (entry?.key) {
      entries[entry.key] = entry.value;
    }
    offset = dataEnd + 4;
  }
  return entries;
}

function parseMetadataText(value = "") {
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractMetadataFromEntries(entries = {}) {
  const embedded = parseMetadataText(entries.NovelAIMetadata);
  if (embedded && typeof embedded === "object") {
    return embedded;
  }
  const comment = parseMetadataText(entries.Comment) || {};
  const commentLooksNovelAi = Boolean(
    comment.prompt || comment.uc || comment.negative_prompt || comment.seed !== undefined ||
    comment.steps !== undefined || comment.sampler || comment.v4_prompt || comment.v4_negative_prompt
  );
  const softwareLooksNovelAi = /novelai|nai-diffusion|nai diffusion/iu.test(String(entries.Software || comment.model || ""));
  if (!commentLooksNovelAi && !softwareLooksNovelAi) {
    return null;
  }
  return {
    source: "novelai_png_metadata",
    version: 1,
    settings: normalizeSettings({
      ...comment,
      Comment: comment,
      prompt: comment.prompt || entries.Description || comment?.v4_prompt?.caption?.base_caption || "",
      negativePrompt: comment.uc || comment.negative_prompt || comment?.v4_negative_prompt?.caption?.base_caption || "",
      model: comment.model || entries.Software || "",
      seed: comment.seed ?? entries.Source ?? ""
    }),
    raw: entries
  };
}

function extractMetadataFromPng(bytes) {
  return extractMetadataFromEntries(readPngMetadataEntries(bytes));
}

function extractMetadataFromStealthText(value = "") {
  const parsed = parseMetadataText(value);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return null;
  }
  const hasPngEntryShape = ["NovelAIMetadata", "Comment", "Description", "Software", "Source"]
    .some((key) => Object.hasOwn(parsed, key));
  if (hasPngEntryShape) {
    return extractMetadataFromEntries(parsed);
  }
  return extractMetadataFromEntries({
    Comment: JSON.stringify(parsed),
    Description: parsed.prompt || parsed?.v4_prompt?.caption?.base_caption || "",
    Software: parsed.Software || parsed.software || parsed.model || "NovelAI",
    Source: parsed.seed ?? ""
  });
}

async function extractMetadataFromPngFile(file) {
  const chunkMetadata = extractMetadataFromPng(new Uint8Array(await file.arrayBuffer()));
  if (chunkMetadata) {
    return chunkMetadata;
  }
  return extractMetadataFromStealthText(await readPngStealthMetadataText(file));
}

function applyMetadataToForm(metadata = {}) {
  setFormSettings(metadata?.settings ? metadata.settings : metadata, { save: true, includeBaseImage: false });
  el.novelAiMetadataStatus.textContent = "已讀取 metadata 並還原設定。";
}

async function importMetadataFromFile(file) {
  if (!file) {
    return;
  }
  try {
    const metadata = await extractMetadataFromPngFile(file);
    if (!metadata) {
      throw new Error("這張圖片沒有可讀取的 NovelAI PNG metadata。");
    }
    applyMetadataToForm(metadata);
    showToast("已還原 NovelAI 圖片設定");
  } catch (error) {
    el.novelAiMetadataStatus.textContent = error.message || "Metadata 讀取失敗。";
    showToast(error.message || "Metadata 讀取失敗", "error");
  } finally {
    el.novelAiMetadataFile.value = "";
  }
}

async function hasImportableNovelAiMetadata(file) {
  if (!file) {
    return false;
  }
  try {
    return Boolean(await extractMetadataFromPngFile(file));
  } catch {
    return false;
  }
}

function getImageFilesFromTransfer(dataTransfer) {
  const itemFiles = Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file) => isImageFile(file));
  if (itemFiles.length) {
    return itemFiles;
  }
  return Array.from(dataTransfer?.files || []).filter((file) => isImageFile(file));
}

function transferHasImage(dataTransfer) {
  const types = Array.from(dataTransfer?.types || []);
  const items = Array.from(dataTransfer?.items || []);
  return getImageFilesFromTransfer(dataTransfer).length > 0 ||
    types.includes("Files") ||
    items.some((item) => item.kind === "file" && (!item.type || item.type.startsWith("image/")));
}

function setDropActive(active) {
  document.body.classList.toggle("is-novelai-drop-active", Boolean(active));
  el.novelAiDropOverlay?.setAttribute("aria-hidden", active ? "false" : "true");
}

function renderDropChoiceText(files = []) {
  const firstFile = files[0];
  el.novelAiDropChoiceText.replaceChildren();
  const summary = document.createElement("span");
  summary.textContent = files.length > 1 ? `已接收到 ${files.length} 張圖片` : "已接收到";
  el.novelAiDropChoiceText.appendChild(summary);
  const name = document.createElement("span");
  name.className = "nai-drop-choice-name";
  name.title = files.length > 1 ? files.map((file) => file?.name || "圖片").join("\n") : firstFile?.name || "圖片";
  name.textContent = files.length > 1 ? `${firstFile?.name || "圖片"} 等 ${files.length} 張` : firstFile?.name || "圖片";
  el.novelAiDropChoiceText.appendChild(name);
}

async function addFilesToCollection(files = [], target = "vibe") {
  const images = await Promise.all(files.map(async (file, index) => ({
    id: makeClientId(target === "vibe" ? "nai_vibe" : "nai_precise"),
    name: file.name || `Image ${index + 1}`,
    image: await readImageFileAsDataUrl(file),
    enabled: true,
    strength: target === "vibe" ? 0.6 : 1,
    informationExtracted: 1,
    fidelity: 1
  })));
  if (target === "vibe") {
    novelAiVibeImages = [...novelAiVibeImages, ...images];
  } else {
    novelAiPreciseImages = [...novelAiPreciseImages, ...images];
  }
  renderAllReferences();
  renderCostPreview();
  saveSettingsDraft({ includeReferenceImages: true });
}

async function showDropChoiceDialog(files = []) {
  novelAiPendingDropFiles = files;
  el.novelAiDropChoicePreview.innerHTML = "";
  const firstFile = files[0];
  const metadataButton = el.novelAiDropChoiceDialog.querySelector('[data-drop-action="metadata"]');
  if (metadataButton) {
    metadataButton.hidden = true;
  }
  if (firstFile) {
    const [previewDataUrl, hasMetadata] = await Promise.all([
      readImageFileAsDataUrl(firstFile),
      hasImportableNovelAiMetadata(firstFile)
    ]);
    const img = document.createElement("img");
    img.src = previewDataUrl;
    img.alt = firstFile.name || "Dropped image";
    el.novelAiDropChoicePreview.appendChild(img);
    if (metadataButton) {
      metadataButton.hidden = !hasMetadata;
    }
  }
  renderDropChoiceText(files);
  if (typeof el.novelAiDropChoiceDialog.showModal === "function") {
    el.novelAiDropChoiceDialog.showModal();
  } else {
    el.novelAiDropChoiceDialog.setAttribute("open", "");
  }
}

function closeDropChoiceDialog() {
  if (el.novelAiDropChoiceDialog.open && typeof el.novelAiDropChoiceDialog.close === "function") {
    el.novelAiDropChoiceDialog.close();
  } else {
    el.novelAiDropChoiceDialog.removeAttribute("open");
  }
  novelAiPendingDropFiles = [];
}

async function handleDropChoice(action = "cancel") {
  const files = novelAiPendingDropFiles;
  if (!files.length || action === "cancel") {
    closeDropChoiceDialog();
    return;
  }
  if (isNovelAiV5Model(el.novelAiModel?.value) && ["vibe", "precise"].includes(action)) {
    showToast("NovelAI V5 目前尚未支援這種參考圖。", "error");
    closeDropChoiceDialog();
    return;
  }
  try {
    if (action === "vibe") {
      await addFilesToCollection(files, "vibe");
      showToast(`已加入 ${files.length} 張 Vibe Transfer 圖片`);
    } else if (action === "img2img") {
      renderBaseImagePreview(await readImageFileAsDataUrl(files[0], { normalizeForNovelAi: true }));
      renderCostPreview();
      saveSettingsDraft({ includeReferenceImages: true });
      showToast("已設定 Image2Image 圖片");
    } else if (action === "precise") {
      await addFilesToCollection(files, "precise");
      showToast(`已加入 ${files.length} 張 Precise Reference 圖片`);
    } else if (action === "metadata") {
      await importMetadataFromFile(files[0]);
    }
  } catch (error) {
    showToast(error.message || "圖片處理失敗", "error");
  } finally {
    closeDropChoiceDialog();
  }
}

function handleReferenceListAction(type, event) {
  const fieldInput = event.target?.closest?.("[data-reference-field]");
  if (fieldInput) {
    const card = fieldInput.closest(".nai-reference-item");
    const id = card?.dataset.imageId || "";
    const list = type === "vibe" ? novelAiVibeImages : novelAiPreciseImages;
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) {
      return;
    }
    const field = fieldInput.dataset.referenceField;
    const fallback = Number(list[index][field] ?? 0);
    const parsedValue = Number(fieldInput.value);
    if (!Number.isFinite(parsedValue)) {
      if (event.type === "change") {
        syncReferenceFieldControls(fieldInput, fallback);
      }
      return;
    }
    const min = Number(fieldInput.min || -Infinity);
    const max = Number(fieldInput.max || Infinity);
    const value = clampFiniteNumber(parsedValue, fallback, min, max);
    list[index][field] = value;
    if (fieldInput.type === "range" || event.type === "change") {
      syncReferenceFieldControls(fieldInput, value);
    } else {
      const range = fieldInput.closest(".nai-reference-range")?.querySelector('input[type="range"]');
      if (range) {
        range.value = value.toFixed(2);
        syncRangeInputVisual(range);
      }
    }
    if (type === "vibe") {
      novelAiVibeImages = [...list];
    } else {
      novelAiPreciseImages = [...list];
    }
    renderCostPreview();
    saveSettingsDraft({ includeReferenceImages: event.type === "change" });
    return;
  }
  const target = event.target?.closest?.("[data-reference-action]");
  if (!target) {
    return;
  }
  if (event.type !== "click") {
    return;
  }
  const card = target.closest(".nai-reference-item");
  const id = card?.dataset.imageId || "";
  const list = type === "vibe" ? novelAiVibeImages : novelAiPreciseImages;
  const index = list.findIndex((item) => item.id === id);
  if (index < 0) {
    return;
  }
  if (target.dataset.referenceAction === "remove") {
    list.splice(index, 1);
  } else if (target.dataset.referenceAction === "toggle") {
    list[index].enabled = target.checked;
  }
  if (type === "vibe") {
    novelAiVibeImages = [...list];
  } else {
    novelAiPreciseImages = [...list];
  }
  renderAllReferences();
  renderCostPreview();
  saveSettingsDraft({ includeReferenceImages: true });
}

function getRandomDelayMs(min = 1000, max = 5000) {
  return randomIntInclusive(min, max);
}

function waitForLoopDelay(ms) {
  return new Promise((resolve) => {
    novelAiLoopDelayTimer = window.setTimeout(() => {
      novelAiLoopDelayTimer = null;
      resolve();
    }, Math.max(0, ms));
  });
}

function stopLoopGenerate() {
  novelAiLoopStopRequested = true;
  if (novelAiLoopDelayTimer) {
    window.clearTimeout(novelAiLoopDelayTimer);
    novelAiLoopDelayTimer = null;
  }
}

function getValidatedGenerationSettings() {
  let settings;
  try {
    settings = getGenerationSettings();
  } catch (error) {
    showToast(error.message || "Random Prompt 展開失敗", "error");
    return null;
  }
  if (!settings.prompt) {
    showToast("請先填入 Base Prompt。", "error");
    el.novelAiPrompt?.focus();
    return null;
  }
  if (
    !isNovelAiV5Model(settings.model) &&
    settings.vibeTransfer.enabled && activeImageCount(settings.vibeTransfer.images) &&
    settings.preciseReference.enabled && activeImageCount(settings.preciseReference.images)
  ) {
    showToast("Vibe Transfer 與 Precise Reference 目前不能同時使用。", "error");
    return null;
  }
  return settings;
}

async function runNovelAiGenerationOnce(options = {}) {
  const {
    busyMessage = "NovelAI 正在生成圖片...",
    showSuccessToast = true
  } = options;
  const settings = getValidatedGenerationSettings();
  if (!settings) {
    return { ok: false, skipped: true, count: 0 };
  }
  try {
    renderEmpty(el.novelAiOutputGrid, busyMessage);
    saveSettingsDraft();
    const payload = await request("/api/novelai/generate", {
      method: "POST",
      body: JSON.stringify({ settings })
    });
    const createdAt = new Date().toISOString();
    const generatedImages = (payload.images || []).map((image, index) => ({
      ...image,
      id: image.id || makeClientId("nai_img"),
      createdAt,
      fileName: image.fileName || `novelai-${index + 1}.png`,
      settings: payload.settings || settings,
      request: payload.request || {},
      metadata: image.metadata || {
        source: "time_tavern_novelai",
        settings: payload.settings || settings,
        request: payload.request || {}
      }
    }));
    novelAiCurrentImages = generatedImages;
    renderMainImage(generatedImages[0] || null);
    await saveHistoryItems(generatedImages);
    novelAiLibraryView = "history";
    novelAiHistoryPage = 1;
    await renderHistory();
    await refreshStatus();
    if (showSuccessToast) {
      showToast(`已生成 ${generatedImages.length} 張圖片`);
    }
    return { ok: true, skipped: false, count: generatedImages.length };
  } catch (error) {
    renderMainImage(novelAiCurrentImages[0] || null);
    showToast(error.message || "NovelAI 生成失敗", "error");
    return { ok: false, skipped: false, count: 0, error };
  }
}

async function generateImages() {
  if (novelAiLoopRunning) {
    return;
  }
  renderGenerationControls("single");
  try {
    await runNovelAiGenerationOnce();
  } finally {
    renderGenerationControls("idle");
    renderCostPreview();
  }
}

async function loopGenerateImages() {
  if (novelAiLoopRunning) {
    stopLoopGenerate();
    showToast("Loop Generate 會在目前這張完成後停止。");
    return;
  }
  const requestedCount = numberValue(el.novelAiLoopCount, 1, { integer: true, min: 0, max: 9999 });
  const infinite = requestedCount === 0;
  let completed = 0;
  novelAiLoopRunning = true;
  novelAiLoopStopRequested = false;
  renderGenerationControls("loop");
  showToast(infinite ? "Loop Generate 已開始：會一直生成到停止。" : `Loop Generate 已開始：共 ${requestedCount} 張。`);
  try {
    while (!novelAiLoopStopRequested && (infinite || completed < requestedCount)) {
      const nextIndex = completed + 1;
      const totalText = infinite ? "∞" : String(requestedCount);
      const result = await runNovelAiGenerationOnce({
        busyMessage: `Loop Generate 第 ${nextIndex}/${totalText} 張，NovelAI 正在生成圖片...`,
        showSuccessToast: false
      });
      if (!result.ok) {
        break;
      }
      completed += 1;
      if (novelAiLoopStopRequested || (!infinite && completed >= requestedCount)) {
        break;
      }
      await waitForLoopDelay(getRandomDelayMs(1000, 5000));
    }
  } finally {
    const stopped = novelAiLoopStopRequested;
    stopLoopGenerate();
    novelAiLoopRunning = false;
    novelAiLoopStopRequested = false;
    renderGenerationControls("idle");
    renderCostPreview();
    if (completed > 0) {
      showToast(stopped ? `Loop Generate 已停止，已完成 ${completed} 張。` : `Loop Generate 已完成 ${completed} 張。`);
    }
  }
}

function bindEvents() {
  const onFormChange = (event) => {
    if (event?.target === el.novelAiModel) {
      syncNovelAiModelCapabilities();
    } else if (event?.target === el.novelAiSizePreset) {
      applySizePreset(event.target.value);
    } else if (event?.target === el.novelAiWidth || event?.target === el.novelAiHeight) {
      updateSizePresetFromDimensions();
    } else if (event?.target === el.novelAiAutoCharacterPosition) {
      syncCharacterPositionMode();
    }
    novelAiCharactersDraft = collectCharacters();
    updateRangeValues();
    renderCostPreview();
    updateNovelAiDuplicateWarnings(event?.target);
    saveSettingsDraft();
  };
  el.novelAiForm.addEventListener("input", onFormChange);
  el.novelAiForm.addEventListener("change", onFormChange);
  el.novelAiForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await generateImages();
  });
  el.novelAiLoopGenerateBtn.addEventListener("click", loopGenerateImages);
  el.novelAiSaveDefaultsBtn?.addEventListener("click", saveNovelAiDefaults);
  el.novelAiApplyDefaultsBtn?.addEventListener("click", applyNovelAiDefaults);
  el.novelAiDownloadDefaultsBtn?.addEventListener("click", downloadNovelAiDefaults);
  el.novelAiInjectDefaultsBtn?.addEventListener("click", () => el.novelAiDefaultsFile?.click());
  el.novelAiDefaultsFile?.addEventListener("change", async () => {
    await injectNovelAiDefaultsFromFile(el.novelAiDefaultsFile.files?.[0]);
  });
  el.novelAiRefreshStatusBtn.addEventListener("click", refreshStatus);
  el.novelAiRefreshAlbumBtn.addEventListener("click", async () => {
    novelAiHistoryPage = 1;
    await renderHistory({ reloadAlbum: novelAiLibraryView === "favorites" });
  });
  el.novelAiHistoryTabBtn?.addEventListener("click", () => setNovelAiLibraryView("history"));
  el.novelAiFavoritesTabBtn?.addEventListener("click", () => setNovelAiLibraryView("favorites"));
  el.novelAiClearHistoryBtn?.addEventListener("click", clearHistoryFromUi);
  el.novelAiHistoryPrevBtn?.addEventListener("click", async () => {
    if (novelAiHistoryPage <= 1) {
      return;
    }
    novelAiHistoryPage -= 1;
    await renderHistory();
    el.novelAiHistoryGrid?.scrollTo?.({ top: 0 });
  });
  el.novelAiHistoryNextBtn?.addEventListener("click", async () => {
    const totalPages = Math.max(1, Math.ceil(novelAiHistoryTotal / NOVELAI_HISTORY_PAGE_SIZE));
    if (novelAiHistoryPage >= totalPages) {
      return;
    }
    novelAiHistoryPage += 1;
    await renderHistory();
    el.novelAiHistoryGrid?.scrollTo?.({ top: 0 });
  });
  window.addEventListener("pagehide", () => {
    releaseHistoryImageResources();
    releaseMainImageResource();
    releaseImageViewerResource();
  });
  window.addEventListener("keydown", onHistoryKeyboardNavigation);
  el.novelAiBaseImagePreview.addEventListener("click", (event) => {
    if (event.target?.closest?.("[data-base-image-remove]")) {
      event.preventDefault();
      event.stopPropagation();
      clearBaseImagePreview();
      showToast("已移除 Image2Image 圖片");
      return;
    }
    el.novelAiBaseImageFile.click();
  });
  el.novelAiBaseImagePreview.addEventListener("keydown", (event) => {
    if (event.target?.closest?.("[data-base-image-remove]")) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      el.novelAiBaseImageFile.click();
    }
  });
  el.novelAiBaseImageFile.addEventListener("change", async () => {
    try {
      const file = el.novelAiBaseImageFile.files?.[0];
      if (file) {
        renderBaseImagePreview(await readImageFileAsDataUrl(file, { normalizeForNovelAi: true }));
        renderCostPreview();
        saveSettingsDraft({ includeReferenceImages: true });
      }
    } catch (error) {
      showToast(error.message || "Image2Image 讀取失敗", "error");
    } finally {
      el.novelAiBaseImageFile.value = "";
    }
  });
  el.novelAiClearBaseImageBtn.addEventListener("click", () => {
    clearBaseImagePreview();
  });
  el.novelAiAddCharacterBtn.addEventListener("click", () => {
    const current = collectCharacters();
    current.push({ id: makeClientId("nai_char"), name: `Character ${current.length + 1}`, prompt: "", negativePrompt: "", enabled: true, x: 0.5, y: 0.5 });
    renderCharacters(current);
    saveSettingsDraft();
  });
  el.novelAiAddFixedPromptBtn.addEventListener("click", () => {
    const current = collectFixedPromptSnippets();
    current.push(createFixedPromptSnippet(current.length));
    renderFixedPromptSnippets(current);
    saveSettingsDraft();
  });
  el.novelAiFixedPromptList.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-fixed-prompt-action]");
    if (!button) {
      return;
    }
    const card = button.closest(".nai-fixed-prompt-card");
    const cards = Array.from(el.novelAiFixedPromptList.querySelectorAll(".nai-fixed-prompt-card"));
    const current = collectFixedPromptSnippets();
    const index = cards.indexOf(card);
    if (index < 0) {
      return;
    }
    if (button.dataset.fixedPromptAction === "remove") {
      current.splice(index, 1);
      renderFixedPromptSnippets(current);
    } else if (button.dataset.fixedPromptAction === "insert") {
      const snippet = current[index] || {};
      const name = snippet.name || `固定片段 ${index + 1}`;
      if (!snippet.prompt) {
        showToast("這個 Fixed Prompt 還沒有內容。", "error");
        return;
      }
      insertTextAtCursor(el.novelAiPrompt, promptSnippetPlaceholder(name));
    }
    saveSettingsDraft();
  });
  el.novelAiFixedPromptList.addEventListener("input", (event) => {
    const target = event?.target?.closest?.("[data-fixed-prompt-field]");
    if (target?.dataset.fixedPromptField === "name") {
      const card = target.closest(".nai-fixed-prompt-card");
      const insertButton = card?.querySelector('[data-fixed-prompt-action="insert"]');
      if (insertButton) {
        insertButton.textContent = target.value.trim() || "未命名片段";
      }
    }
    novelAiFixedPromptSnippets = collectFixedPromptSnippets();
    saveSettingsDraft();
  });
  el.novelAiAddRandomPromptBtn.addEventListener("click", () => {
    const current = collectRandomPromptSnippets();
    current.push(createRandomPromptSnippet(current.length));
    renderRandomPromptSnippets(current);
    saveSettingsDraft();
  });
  el.novelAiRandomPromptList.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-random-prompt-action]");
    if (!button) {
      return;
    }
    const card = button.closest(".nai-random-prompt-card");
    const cards = Array.from(el.novelAiRandomPromptList.querySelectorAll(".nai-random-prompt-card"));
    const current = collectRandomPromptSnippets();
    const index = cards.indexOf(card);
    if (index < 0) {
      return;
    }
    const action = button.dataset.randomPromptAction;
    if (action === "remove") {
      current.splice(index, 1);
      renderRandomPromptSnippets(current);
    } else if (action === "insert") {
      const name = current[index]?.name || `片段 ${index + 1}`;
      insertTextAtCursor(el.novelAiPrompt, promptSnippetPlaceholder(name));
    }
    saveSettingsDraft();
  });
  el.novelAiRandomPromptList.addEventListener("input", (event) => {
    const target = event?.target?.closest?.("[data-random-prompt-field]");
    if (target?.dataset.randomPromptField === "name") {
      const card = target.closest(".nai-random-prompt-card");
      const insertButton = card?.querySelector('[data-random-prompt-action="insert"]');
      if (insertButton) {
        insertButton.textContent = target.value.trim() || "未命名片段";
      }
    }
    if (["weightMin", "weightMax", "weightBias"].includes(target?.dataset.randomPromptField)) {
      syncRandomPromptWeightBiasControl(target.closest(".nai-random-prompt-card"));
    }
    novelAiRandomPromptSnippets = collectRandomPromptSnippets();
    saveSettingsDraft();
  });
  el.novelAiRandomPromptList.addEventListener("change", (event) => {
    const target = event?.target?.closest?.("[data-random-prompt-field]");
    if (!target) {
      return;
    }
    if (["squareEnabled", "curlyEnabled", "weightEnabled", "weightMin", "weightMax", "weightBias"].includes(target.dataset.randomPromptField)) {
      syncRandomPromptWeightControls(target.closest(".nai-random-prompt-card"));
    }
    novelAiRandomPromptSnippets = collectRandomPromptSnippets();
    saveSettingsDraft();
  });
  el.novelAiCharacterList.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-novelai-character-action]");
    if (!button) {
      return;
    }
    const action = button.dataset.novelaiCharacterAction;
    const card = button.closest(".nai-character-card");
    const cards = Array.from(el.novelAiCharacterList.querySelectorAll(".nai-character-card"));
    const current = collectCharacters();
    const index = cards.indexOf(card);
    if (action === "remove") {
      current.splice(index, 1);
      renderCharacters(current);
    } else if (action === "up" && index > 0) {
      [current[index - 1], current[index]] = [current[index], current[index - 1]];
      renderCharacters(current);
    } else if (action === "down" && index >= 0 && index < current.length - 1) {
      [current[index + 1], current[index]] = [current[index], current[index + 1]];
      renderCharacters(current);
    } else if (action === "toggle-position") {
      card.querySelector(".nai-position-grid").hidden = !card.querySelector(".nai-position-grid").hidden;
    } else if (action === "select-position") {
      const { x, y } = xyFromPositionCell(Number(button.dataset.row), Number(button.dataset.col));
      card.querySelector('[data-novelai-character-field="x"]').value = x;
      card.querySelector('[data-novelai-character-field="y"]').value = y;
      card.querySelector(".nai-position-button").textContent = `位置：${positionLabel(x, y)}`;
      card.querySelectorAll(".nai-position-grid button").forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.textContent = active ? "●" : "";
      });
      card.querySelector(".nai-position-grid").hidden = true;
    }
    novelAiCharactersDraft = collectCharacters();
    saveSettingsDraft();
  });
  el.novelAiVibeList.addEventListener("click", (event) => handleReferenceListAction("vibe", event));
  el.novelAiVibeList.addEventListener("input", (event) => handleReferenceListAction("vibe", event));
  el.novelAiVibeList.addEventListener("change", (event) => handleReferenceListAction("vibe", event));
  el.novelAiPreciseList.addEventListener("click", (event) => handleReferenceListAction("precise", event));
  el.novelAiPreciseList.addEventListener("input", (event) => handleReferenceListAction("precise", event));
  el.novelAiPreciseList.addEventListener("change", (event) => handleReferenceListAction("precise", event));
  el.novelAiImportMetadataBtn.addEventListener("click", () => el.novelAiMetadataFile.click());
  el.novelAiMetadataFile.addEventListener("change", async () => {
    await importMetadataFromFile(el.novelAiMetadataFile.files?.[0]);
  });
  el.novelAiDropChoiceDialog.addEventListener("click", async (event) => {
    const button = event.target?.closest?.("[data-drop-action]");
    if (button) {
      await handleDropChoice(button.dataset.dropAction);
    }
  });
  el.novelAiDownloadDialog?.addEventListener("click", async (event) => {
    const button = event.target?.closest?.("[data-download-mode]");
    if (button) {
      await handleDownloadChoice(button.dataset.downloadMode);
    }
  });
  bindDialogBackdropClose(el.novelAiDropChoiceDialog, { close: closeDropChoiceDialog });
  bindDialogBackdropClose(el.novelAiContentDialog, { close: closeImageContentDialog });
  bindDialogBackdropClose(el.novelAiDownloadDialog, { close: closeDownloadDialog });
  bindDialogBackdropClose(el.novelAiImageViewerDialog, { close: closeImageViewerDialog });
  el.novelAiImageViewerDialog?.addEventListener("close", releaseImageViewerResource);
  if (el.novelAiImageViewerStage) {
    el.novelAiImageViewerStage.addEventListener("wheel", onImageViewerWheel, { passive: false });
    el.novelAiImageViewerStage.addEventListener("pointerdown", onImageViewerPointerDown);
    el.novelAiImageViewerStage.addEventListener("pointermove", onImageViewerPointerMove);
    el.novelAiImageViewerStage.addEventListener("pointerup", stopImageViewerDrag);
    el.novelAiImageViewerStage.addEventListener("pointercancel", stopImageViewerDrag);
    el.novelAiImageViewerStage.addEventListener("lostpointercapture", stopImageViewerDrag);
    el.novelAiImageViewerStage.addEventListener("dblclick", resetImageViewerTransform);
  }
  const onGlobalDragEnter = (event) => {
    if (!transferHasImage(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    novelAiDragDepth += 1;
    setDropActive(true);
  };
  const onGlobalDragOver = (event) => {
    if (!transferHasImage(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    setDropActive(true);
  };
  const onGlobalDragLeave = (event) => {
    if (!transferHasImage(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    novelAiDragDepth = Math.max(0, novelAiDragDepth - 1);
    if (novelAiDragDepth === 0) {
      setDropActive(false);
    }
  };
  const onGlobalDrop = async (event) => {
    const files = getImageFilesFromTransfer(event.dataTransfer);
    if (!transferHasImage(event.dataTransfer)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    novelAiDragDepth = 0;
    setDropActive(false);
    if (!files.length) {
      showToast("請拖入圖片檔案。", "error");
      return;
    }
    await showDropChoiceDialog(files);
  };
  window.addEventListener("dragenter", onGlobalDragEnter, true);
  window.addEventListener("dragover", onGlobalDragOver, true);
  window.addEventListener("dragleave", onGlobalDragLeave, true);
  window.addEventListener("drop", onGlobalDrop, true);
  document.addEventListener("paste", async (event) => {
    const files = getImageFilesFromTransfer(event.clipboardData);
    if (!files.length) {
      return;
    }
    event.preventDefault();
    await showDropChoiceDialog(files);
  });
}

async function boot() {
  await loadServerUiLanguage(uiLanguageController);
  fillSelect(el.novelAiModel, NOVELAI_MODEL_OPTIONS, "nai-diffusion-4-5-full");
  fillSelect(el.novelAiSampler, NOVELAI_SAMPLER_OPTIONS, "k_euler_ancestral");
  fillSelect(el.novelAiNoiseSchedule, NOVELAI_NOISE_SCHEDULE_OPTIONS, "karras");
  const draftSettings = loadSettingsDraft();
  const hasDraft = hasSettingsDraft(draftSettings);
  let referenceDraft = null;
  if (hasDraft) {
    try {
      referenceDraft = await loadReferenceImageDraft();
    } catch (error) {
      console.warn("NovelAI 參考圖片草稿讀取失敗。", error);
    }
  }
  const defaultPayload = hasDraft ? { settings: {} } : await loadNovelAiDefaults();
  const defaultSettings = !hasDraft ? (defaultPayload.settings || {}) : {};
  const initialSettings = hasDraft && referenceDraft
    ? {
      ...draftSettings,
      baseImage: referenceDraft.baseImage || "",
      vibeTransfer: {
        ...(draftSettings.vibeTransfer || {}),
        images: referenceDraft.vibeTransfer?.images || []
      },
      preciseReference: {
        ...(draftSettings.preciseReference || {}),
        images: referenceDraft.preciseReference?.images || []
      }
    }
    : hasDraft
      ? draftSettings
      : defaultSettings;
  if (hasDraft) {
    novelAiRandomPromptSnippets = loadRandomPromptSnippets();
    novelAiFixedPromptSnippets = loadFixedPromptSnippets(novelAiRandomPromptSnippets);
  } else {
    const normalizedDefaults = normalizeSettings(defaultSettings);
    novelAiFixedPromptSnippets = normalizeFixedPromptSnippets(normalizedDefaults.fixedPromptSnippets);
    novelAiRandomPromptSnippets = normalizeRandomPromptSnippets(normalizedDefaults.randomPromptSnippets);
  }
  setFormSettings(initialSettings, {
    save: false,
    includeReferenceImages: hasDraft,
    includeBaseImage: hasDraft,
    clearBaseImage: !hasDraft || !initialSettings.baseImage,
    replaceFixedPromptSnippets: !hasDraft,
    replaceRandomPromptSnippets: !hasDraft
  });
  renderFixedPromptSnippets(novelAiFixedPromptSnippets);
  renderRandomPromptSnippets(novelAiRandomPromptSnippets);
  renderMainImage(null);
  bindEvents();
  await Promise.allSettled([refreshStatus(), renderHistory()]);
}

boot();
