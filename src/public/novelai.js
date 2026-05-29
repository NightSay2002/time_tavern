const el = {
  novelAiForm: document.getElementById("novelAiForm"),
  novelAiStatus: document.getElementById("novelAiStatus"),
  novelAiRefreshStatusBtn: document.getElementById("novelAiRefreshStatusBtn"),
  novelAiModel: document.getElementById("novelAiModel"),
  novelAiModelDescription: document.getElementById("novelAiModelDescription"),
  novelAiPrompt: document.getElementById("novelAiPrompt"),
  novelAiNegativePrompt: document.getElementById("novelAiNegativePrompt"),
  novelAiWidth: document.getElementById("novelAiWidth"),
  novelAiHeight: document.getElementById("novelAiHeight"),
  novelAiSteps: document.getElementById("novelAiSteps"),
  novelAiStepsSummary: document.getElementById("novelAiStepsSummary"),
  novelAiSamples: document.getElementById("novelAiSamples"),
  novelAiScale: document.getElementById("novelAiScale"),
  novelAiGuidanceSummary: document.getElementById("novelAiGuidanceSummary"),
  novelAiCfgRescale: document.getElementById("novelAiCfgRescale"),
  novelAiSeed: document.getElementById("novelAiSeed"),
  novelAiSeedSummary: document.getElementById("novelAiSeedSummary"),
  novelAiSampler: document.getElementById("novelAiSampler"),
  novelAiSamplerSummary: document.getElementById("novelAiSamplerSummary"),
  novelAiNoiseSchedule: document.getElementById("novelAiNoiseSchedule"),
  novelAiBaseImageFile: document.getElementById("novelAiBaseImageFile"),
  novelAiBaseImage: document.getElementById("novelAiBaseImage"),
  novelAiBaseImagePreview: document.getElementById("novelAiBaseImagePreview"),
  novelAiClearBaseImageBtn: document.getElementById("novelAiClearBaseImageBtn"),
  novelAiStrength: document.getElementById("novelAiStrength"),
  novelAiNoise: document.getElementById("novelAiNoise"),
  novelAiCharacterList: document.getElementById("novelAiCharacterList"),
  novelAiAddCharacterBtn: document.getElementById("novelAiAddCharacterBtn"),
  novelAiVibeList: document.getElementById("novelAiVibeList"),
  novelAiPreciseList: document.getElementById("novelAiPreciseList"),
  novelAiSizePreset: document.getElementById("novelAiSizePreset"),
  novelAiMetadataFile: document.getElementById("novelAiMetadataFile"),
  novelAiImportMetadataBtn: document.getElementById("novelAiImportMetadataBtn"),
  novelAiMetadataStatus: document.getElementById("novelAiMetadataStatus"),
  novelAiCostPreview: document.getElementById("novelAiCostPreview"),
  novelAiGenerateBtn: document.getElementById("novelAiGenerateBtn"),
  novelAiGenerateLabel: document.getElementById("novelAiGenerateLabel"),
  novelAiOutputGrid: document.getElementById("novelAiOutputGrid"),
  novelAiHistoryGrid: document.getElementById("novelAiHistoryGrid"),
  novelAiRefreshAlbumBtn: document.getElementById("novelAiRefreshAlbumBtn"),
  novelAiStageSize: document.getElementById("novelAiStageSize"),
  novelAiDropOverlay: document.getElementById("novelAiDropOverlay"),
  novelAiDropChoiceDialog: document.getElementById("novelAiDropChoiceDialog"),
  novelAiDropChoicePreview: document.getElementById("novelAiDropChoicePreview"),
  novelAiDropChoiceText: document.getElementById("novelAiDropChoiceText"),
  toast: document.getElementById("toast")
};

let novelAiStatusPayload = null;
let novelAiCharactersDraft = [];
let novelAiVibeImages = [];
let novelAiPreciseImages = [];
let novelAiCurrentImages = [];
let novelAiPendingDropFiles = [];
let novelAiDragDepth = 0;

const NOVELAI_SETTINGS_STORAGE_KEY = "time_tavern_novelai_settings";
const NOVELAI_HISTORY_DB_NAME = "time_tavern_novelai";
const NOVELAI_HISTORY_STORE = "history";
const NOVELAI_HISTORY_LIMIT = 80;
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
  ["nai-diffusion-4-5-full", "NAI Diffusion V4.5 Full"],
  ["nai-diffusion-4-5-curated", "NAI Diffusion V4.5 Curated"],
  ["nai-diffusion-4-full", "NAI Diffusion V4 Full"],
  ["nai-diffusion-4-curated-preview", "NAI Diffusion V4 Curated"],
  ["nai-diffusion-3", "NAI Diffusion Anime V3"],
  ["nai-diffusion-furry-3", "NAI Diffusion Furry V3"]
];
const NOVELAI_MODEL_DESCRIPTIONS = {
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

function sanitizeDownloadFileName(value = "novelai-image") {
  return String(value || "novelai-image")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 80) || "novelai-image";
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
          defaults.fidelityMax ?? 2
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

function normalizeSettings(value = {}) {
  const source = value?.settings && typeof value.settings === "object" ? value.settings : value || {};
  const comment = source?.Comment && typeof source.Comment === "object" ? source.Comment : {};
  const sourceVibe = source.vibeTransfer || source.vibe_transfer || {};
  const sourcePrecise = source.preciseReference || source.precise_reference || {};
  const promptCharacters = source.characters || source.characterPrompts || source.character_prompts ||
    comment.character_prompts || metadataCharacters(comment, source);
  return {
    model: String(source.model || source.Software || comment.model || "nai-diffusion-4-5-full").trim(),
    prompt: String(
      source.prompt ?? source.input ?? source.Description ?? comment.prompt ??
      comment?.v4_prompt?.caption?.base_caption ?? ""
    ).trim(),
    negativePrompt: String(
      source.negativePrompt ?? source.negative_prompt ?? source.uc ?? comment.negative_prompt ?? comment.uc ??
      comment?.v4_negative_prompt?.caption?.base_caption ?? ""
    ).trim(),
    width: finiteNumber(source.width ?? comment.width, 832),
    height: finiteNumber(source.height ?? comment.height, 1216),
    steps: finiteNumber(source.steps ?? comment.steps, 28),
    samples: finiteNumber(source.samples ?? source.n_samples ?? comment.samples ?? comment.n_samples, 1),
    scale: finiteNumber(source.scale ?? comment.scale, 6),
    cfgRescale: finiteNumber(source.cfgRescale ?? source.cfg_rescale ?? comment.cfg_rescale, 0),
    seed: finiteNumber(source.seed ?? source.Source ?? comment.seed, -1),
    sampler: String(source.sampler || comment.sampler || "k_euler_ancestral").trim(),
    noiseSchedule: String(source.noiseSchedule || source.noise_schedule || comment.noise_schedule || "karras").trim(),
    baseImage: String(source.baseImage || source.image || "").trim(),
    strength: source.strength === "" || source.strength === undefined ? 0.7 : finiteNumber(source.strength, 0.7),
    noise: source.noise === "" || source.noise === undefined ? 0 : finiteNumber(source.noise, 0),
    characters: normalizeCharacters(promptCharacters),
    vibeTransfer: {
      enabled: sourceVibe.enabled !== false,
      strength: finiteNumber(sourceVibe.strength ?? source.referenceStrength, 0.6),
      informationExtracted: finiteNumber(sourceVibe.informationExtracted ?? sourceVibe.information_extracted ?? source.referenceInformationExtracted, 1),
      images: normalizeImageItems(sourceVibe.images || source.vibeImages || [], "nai_vibe", {
        strength: sourceVibe.strength ?? source.referenceStrength ?? 0.6,
        informationExtracted: sourceVibe.informationExtracted ?? sourceVibe.information_extracted ?? source.referenceInformationExtracted ?? 1,
        strengthMin: 0,
        strengthMax: 1
      })
    },
    preciseReference: {
      enabled: sourcePrecise.enabled !== false,
      strength: finiteNumber(sourcePrecise.strength, 1),
      fidelity: finiteNumber(sourcePrecise.fidelity, 1),
      images: normalizeImageItems(sourcePrecise.images || source.preciseImages || source.character_references || [], "nai_precise", {
        strength: sourcePrecise.strength ?? 1,
        fidelity: sourcePrecise.fidelity ?? 1,
        strengthMin: -1,
        strengthMax: 2,
        fidelityMin: -1,
        fidelityMax: 2
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
  return `R${row} C${col}`;
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
      <button type="button" class="nai-position-button" data-novelai-character-action="toggle-position">位置 ${positionLabel(character.x, character.y)}</button>
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
        button.textContent = `${r},${c}`;
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
}

function renderBaseImagePreview(dataUrl = "") {
  const value = String(dataUrl || "").trim();
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
}

function referenceRangeHtml(field, label, value, options = {}) {
  const min = options.min ?? 0;
  const max = options.max ?? 1;
  return `
    <label class="nai-reference-range">
      <span>${label}</span>
      <input data-reference-field="${field}" type="range" min="${min}" max="${max}" step="0.01" value="${Number(value).toFixed(2)}" />
      <b>${Number(value).toFixed(2)}</b>
    </label>
  `;
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
        referenceRangeHtml("strength", "Reference Strength", item.strength, { min: 0, max: 1 }),
        referenceRangeHtml("informationExtracted", "Information Extracted", item.informationExtracted, { min: 0, max: 1 })
      ].join("")
      : [
        referenceRangeHtml("strength", "Strength", item.strength, { min: -1, max: 2 }),
        referenceRangeHtml("fidelity", "Fidelity", item.fidelity, { min: -1, max: 2 })
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

function getFormSettings() {
  const seedValue = String(el.novelAiSeed?.value || "").trim();
  return {
    model: el.novelAiModel?.value || "nai-diffusion-4-5-full",
    prompt: String(el.novelAiPrompt?.value || "").trim(),
    negativePrompt: String(el.novelAiNegativePrompt?.value || "").trim(),
    width: numberValue(el.novelAiWidth, 832, { integer: true, min: 64, max: 2048 }),
    height: numberValue(el.novelAiHeight, 1216, { integer: true, min: 64, max: 2048 }),
    steps: numberValue(el.novelAiSteps, 28, { integer: true, min: 1, max: 50 }),
    samples: numberValue(el.novelAiSamples, 1, { integer: true, min: 1, max: 6 }),
    scale: numberValue(el.novelAiScale, 6, { min: 0, max: 20 }),
    cfgRescale: numberValue(el.novelAiCfgRescale, 0, { min: 0, max: 1 }),
    seed: seedValue ? numberValue(el.novelAiSeed, -1, { integer: true, min: -1 }) : -1,
    sampler: el.novelAiSampler?.value || "k_euler_ancestral",
    noiseSchedule: el.novelAiNoiseSchedule?.value || "karras",
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
        strengthMin: 0,
        strengthMax: 1
      })
    },
    preciseReference: {
      enabled: true,
      images: normalizeImageItems(novelAiPreciseImages, "nai_precise", {
        strength: 1,
        fidelity: 1,
        strengthMin: -1,
        strengthMax: 2,
        fidelityMin: -1,
        fidelityMax: 2
      })
    }
  };
}

function setFormSettings(settings = {}, options = {}) {
  const normalized = normalizeSettings(settings);
  setSelectValue(el.novelAiModel, normalized.model);
  el.novelAiPrompt.value = normalized.prompt;
  el.novelAiNegativePrompt.value = normalized.negativePrompt;
  el.novelAiWidth.value = Math.round(normalized.width || 832);
  el.novelAiHeight.value = Math.round(normalized.height || 1216);
  updateSizePresetFromDimensions();
  el.novelAiSteps.value = Math.round(normalized.steps || 28);
  el.novelAiSamples.value = Math.round(normalized.samples || 1);
  el.novelAiScale.value = normalized.scale ?? 6;
  el.novelAiCfgRescale.value = normalized.cfgRescale ?? 0;
  el.novelAiSeed.value = normalized.seed >= 0 ? Math.floor(normalized.seed) : "";
  setSelectValue(el.novelAiSampler, normalized.sampler);
  setSelectValue(el.novelAiNoiseSchedule, normalized.noiseSchedule);
  el.novelAiStrength.value = normalized.strength ?? 0.7;
  el.novelAiNoise.value = normalized.noise ?? 0;
  if (options.includeReferenceImages) {
    novelAiVibeImages = normalizeImageItems(normalized.vibeTransfer.images, "nai_vibe");
    novelAiPreciseImages = normalizeImageItems(normalized.preciseReference.images, "nai_precise");
  }
  if (options.includeBaseImage && normalized.baseImage) {
    renderBaseImagePreview(normalized.baseImage);
  } else if (options.clearBaseImage) {
    renderBaseImagePreview("");
  }
  renderCharacters(normalized.characters);
  renderAllReferences();
  updateRangeValues();
  renderCostPreview();
  if (options.save !== false) {
    saveSettingsDraft();
  }
}

function loadSettingsDraft() {
  return safeParseJson(window.localStorage?.getItem(NOVELAI_SETTINGS_STORAGE_KEY) || "{}");
}

function saveSettingsDraft() {
  try {
    const settings = getFormSettings();
    settings.baseImage = "";
    settings.vibeTransfer.images = [];
    settings.preciseReference.images = [];
    window.localStorage?.setItem(NOVELAI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Draft saving is optional.
  }
}

function estimateAnlas(settings = getFormSettings()) {
  const megapixels = Math.max(0.05, (Number(settings.width || 832) * Number(settings.height || 1216)) / (1024 * 1024));
  const stepFactor = Math.max(0.15, Number(settings.steps || 28) / 28);
  const modelFactor = /4-5/u.test(settings.model || "") ? 1.18 : /4/u.test(settings.model || "") ? 1.08 : 1;
  const baseImageFactor = settings.baseImage ? 1.15 : 1;
  const vibeCount = settings.vibeTransfer.enabled ? activeImageCount(settings.vibeTransfer.images) : 0;
  const preciseCount = settings.preciseReference.enabled ? activeImageCount(settings.preciseReference.images) : 0;
  const extraVibe = vibeCount > 4 ? (vibeCount - 4) * 2 : 0;
  const extraPrecise = preciseCount * 5;
  return Math.max(1, Math.ceil(megapixels * stepFactor * modelFactor * baseImageFactor * 5 + extraVibe + extraPrecise));
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

function getSelectedOptionLabel(select) {
  return select?.selectedOptions?.[0]?.textContent || select?.value || "";
}

function updateStudioSummary(settings = getFormSettings()) {
  el.novelAiModelDescription.textContent = NOVELAI_MODEL_DESCRIPTIONS[settings.model] || "自訂 NovelAI 圖像模型。";
  el.novelAiStepsSummary.textContent = String(settings.steps);
  el.novelAiGuidanceSummary.textContent = String(settings.scale);
  el.novelAiSeedSummary.textContent = settings.seed >= 0 ? String(settings.seed) : "N/A";
  el.novelAiSamplerSummary.textContent = getSelectedOptionLabel(el.novelAiSampler).replace(/^k_/u, "");
  el.novelAiStageSize.textContent = `${settings.width} × ${settings.height}`;
  if (!el.novelAiGenerateBtn.disabled) {
    el.novelAiGenerateLabel.textContent = "Generate";
  }
}

function updateRangeValues() {
  document.querySelectorAll("[data-range-value-for]").forEach((node) => {
    const input = document.getElementById(node.dataset.rangeValueFor);
    node.textContent = Number(input?.value || 0).toFixed(2);
  });
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

async function readImageFileAsDataUrl(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("請選擇圖片檔案。");
  }
  return blobToDataUrl(file);
}

async function getItemDataUrl(item = {}) {
  if (item.dataUrl) {
    return item.dataUrl;
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

function openHistoryDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("瀏覽器不支援本地歷史資料庫。"));
      return;
    }
    const requestObject = window.indexedDB.open(NOVELAI_HISTORY_DB_NAME, 1);
    requestObject.onupgradeneeded = () => {
      const db = requestObject.result;
      if (!db.objectStoreNames.contains(NOVELAI_HISTORY_STORE)) {
        const store = db.createObjectStore(NOVELAI_HISTORY_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
    requestObject.onsuccess = () => resolve(requestObject.result);
    requestObject.onerror = () => reject(requestObject.error || new Error("本地歷史資料庫開啟失敗。"));
  });
}

async function listHistory(limit = NOVELAI_HISTORY_LIMIT) {
  const db = await openHistoryDb();
  try {
    const items = await idbRequest(db.transaction(NOVELAI_HISTORY_STORE, "readonly").objectStore(NOVELAI_HISTORY_STORE).getAll());
    return (Array.isArray(items) ? items : [])
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, limit);
  } finally {
    db.close();
  }
}

async function saveHistoryItems(items = []) {
  if (!items.length) {
    return;
  }
  const db = await openHistoryDb();
  try {
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readwrite");
    const store = transaction.objectStore(NOVELAI_HISTORY_STORE);
    items.forEach((item) => store.put(item));
    await idbTransactionDone(transaction);
  } finally {
    db.close();
  }
}

async function deleteHistoryItem(id = "") {
  const db = await openHistoryDb();
  try {
    const transaction = db.transaction(NOVELAI_HISTORY_STORE, "readwrite");
    transaction.objectStore(NOVELAI_HISTORY_STORE).delete(id);
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

function itemPrompt(item = {}) {
  return String(itemSettings(item).prompt || item.prompt || "").trim();
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
  if (!item) {
    renderEmpty(el.novelAiOutputGrid, "生成後會顯示在這裡。");
    return;
  }
  el.novelAiOutputGrid.innerHTML = "";
  const card = document.createElement("article");
  card.className = "novelai-image-card";
  const preview = document.createElement("div");
  preview.className = "novelai-image-preview";
  const img = document.createElement("img");
  img.src = item.dataUrl || item.imageUrl || "";
  img.alt = itemPrompt(item) || item.fileName || "NovelAI image";
  preview.appendChild(img);
  const settings = itemSettings(item);
  const meta = document.createElement("div");
  meta.className = "novelai-image-meta";
  meta.innerHTML = `
    <strong>${truncateText(itemPrompt(item) || item.fileName || "NovelAI Image", 120)}</strong>
    <span>${[settings.model || "", settings.seed !== undefined ? `Seed ${settings.seed}` : ""].filter(Boolean).join("｜")}</span>
  `;
  const actions = document.createElement("div");
  actions.className = "novelai-image-actions";
  actions.append(
    makeActionButton("還原設定", "nai-restore-action", () => {
      applyMetadataToForm(item.metadata || item.settings || {});
      showToast("已把圖片設定還原到表單");
    }),
    makeActionButton("下載", "secondary", () => downloadImage(item)),
    makeActionButton("收藏", "secondary", () => favoriteImage(item))
  );
  card.append(preview, meta, actions);
  el.novelAiOutputGrid.appendChild(card);
}

function renderHistoryList(items = []) {
  el.novelAiHistoryGrid.innerHTML = "";
  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "nai-empty-inline";
    empty.textContent = "還沒有生成歷史。";
    el.novelAiHistoryGrid.appendChild(empty);
    return;
  }
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "nai-history-item";
    card.dataset.historyId = item.id || "";
    card.innerHTML = `
      <button type="button" data-history-action="select"><img alt="" /></button>
      <div>
        <strong></strong>
        <span></span>
      </div>
      <button type="button" class="muted" data-history-action="delete">×</button>
    `;
    card.querySelector("img").src = item.dataUrl || item.imageUrl || "";
    card.querySelector("strong").textContent = truncateText(itemPrompt(item) || item.fileName || "NovelAI Image", 36);
    card.querySelector("span").textContent = item.createdAt ? new Date(item.createdAt).toLocaleString("zh-Hant") : "";
    card.querySelector('[data-history-action="select"]').addEventListener("click", () => renderMainImage(item));
    card.querySelector('[data-history-action="delete"]').addEventListener("click", async () => {
      await deleteHistoryItem(item.id);
      await renderHistory();
      showToast("已刪除本地歷史圖片");
    });
    el.novelAiHistoryGrid.appendChild(card);
  });
}

async function renderHistory() {
  try {
    renderHistoryList(await listHistory());
  } catch (error) {
    renderEmpty(el.novelAiHistoryGrid, error.message || "本地歷史讀取失敗。");
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

function buildNovelAiCompatibleComment(item = {}) {
  const existingMetadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  const settings = normalizeSettings(existingMetadata.settings || item.settings || existingMetadata);
  const request = existingMetadata.request || item.request || {};
  const parameters = request.parameters && typeof request.parameters === "object" ? request.parameters : {};
  return {
    prompt: settings.prompt || "",
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
      use_coords: true,
      use_order: true,
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
    skip_cfg_above_sigma: parameters.skip_cfg_above_sigma ?? null,
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

async function downloadImage(item = {}) {
  try {
    let blob = item.dataUrl
      ? dataUrlToBlob(item.dataUrl)
      : await fetch(item.imageUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`圖片下載失敗(${response.status})。`);
        }
        return response.blob();
      });
    const fileName = sanitizeDownloadFileName(item.fileName || `novelai-${item.id || Date.now()}.png`);
    if (blob.type === "image/png" || /\.png$/iu.test(fileName)) {
      blob = await injectPngMetadataForDownload(blob, item);
    }
    triggerBlobDownload(blob, fileName);
    showToast("已下載圖片，包含設定 metadata");
  } catch (error) {
    showToast(error.message || "圖片下載失敗", "error");
  }
}

async function favoriteImage(item = {}) {
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
    showToast(`已收藏：${payload?.item?.fileName || "NovelAI 圖片"}`);
  } catch (error) {
    showToast(error.message || "收藏失敗", "error");
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

function extractMetadataFromPng(bytes) {
  const entries = readPngMetadataEntries(bytes);
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

function applyMetadataToForm(metadata = {}) {
  setFormSettings(metadata?.settings ? metadata.settings : metadata, { save: true, includeBaseImage: false });
  el.novelAiMetadataStatus.textContent = "已讀取 metadata 並還原設定。";
}

async function importMetadataFromFile(file) {
  if (!file) {
    return;
  }
  try {
    const metadata = extractMetadataFromPng(new Uint8Array(await file.arrayBuffer()));
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

function getImageFilesFromTransfer(dataTransfer) {
  const itemFiles = Array.from(dataTransfer?.items || [])
    .filter((item) => item.kind === "file")
    .map((item) => item.getAsFile())
    .filter((file) => file?.type?.startsWith("image/"));
  if (itemFiles.length) {
    return itemFiles;
  }
  return Array.from(dataTransfer?.files || []).filter((file) => file?.type?.startsWith("image/"));
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
  saveSettingsDraft();
}

async function showDropChoiceDialog(files = []) {
  novelAiPendingDropFiles = files;
  el.novelAiDropChoicePreview.innerHTML = "";
  const firstFile = files[0];
  if (firstFile) {
    const img = document.createElement("img");
    img.src = await readImageFileAsDataUrl(firstFile);
    img.alt = firstFile.name || "Dropped image";
    el.novelAiDropChoicePreview.appendChild(img);
  }
  el.novelAiDropChoiceText.textContent = files.length > 1 ? `已接收到 ${files.length} 張圖片。` : `已接收到 ${firstFile?.name || "圖片"}。`;
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
  try {
    if (action === "vibe") {
      await addFilesToCollection(files, "vibe");
      showToast(`已加入 ${files.length} 張 Vibe Transfer 圖片`);
    } else if (action === "img2img") {
      renderBaseImagePreview(await readImageFileAsDataUrl(files[0]));
      renderCostPreview();
      saveSettingsDraft();
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
    list[index][field] = Number(fieldInput.value);
    const valueLabel = fieldInput.parentElement?.querySelector("b");
    if (valueLabel) {
      valueLabel.textContent = Number(fieldInput.value).toFixed(2);
    }
    if (type === "vibe") {
      novelAiVibeImages = [...list];
    } else {
      novelAiPreciseImages = [...list];
    }
    renderCostPreview();
    saveSettingsDraft();
    return;
  }
  const target = event.target?.closest?.("[data-reference-action]");
  if (!target) {
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
  saveSettingsDraft();
}

async function generateImages() {
  const settings = getFormSettings();
  if (!settings.prompt) {
    showToast("請先填入 Base Prompt。", "error");
    el.novelAiPrompt?.focus();
    return;
  }
  if (
    settings.vibeTransfer.enabled && activeImageCount(settings.vibeTransfer.images) &&
    settings.preciseReference.enabled && activeImageCount(settings.preciseReference.images)
  ) {
    showToast("Vibe Transfer 與 Precise Reference 目前不能同時使用。", "error");
    return;
  }
  try {
    el.novelAiGenerateBtn.disabled = true;
    el.novelAiGenerateLabel.textContent = "生成中...";
    renderEmpty(el.novelAiOutputGrid, "NovelAI 正在生成圖片...");
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
    await renderHistory();
    await refreshStatus();
    showToast(`已生成 ${generatedImages.length} 張圖片`);
  } catch (error) {
    renderMainImage(novelAiCurrentImages[0] || null);
    showToast(error.message || "NovelAI 生成失敗", "error");
  } finally {
    el.novelAiGenerateBtn.disabled = false;
    renderCostPreview();
  }
}

function bindEvents() {
  const onFormChange = (event) => {
    if (event?.target === el.novelAiSizePreset) {
      applySizePreset(event.target.value);
    } else if (event?.target === el.novelAiWidth || event?.target === el.novelAiHeight) {
      updateSizePresetFromDimensions();
    }
    novelAiCharactersDraft = collectCharacters();
    updateRangeValues();
    renderCostPreview();
    saveSettingsDraft();
  };
  el.novelAiForm.addEventListener("input", onFormChange);
  el.novelAiForm.addEventListener("change", onFormChange);
  el.novelAiForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await generateImages();
  });
  el.novelAiRefreshStatusBtn.addEventListener("click", refreshStatus);
  el.novelAiRefreshAlbumBtn.addEventListener("click", renderHistory);
  el.novelAiBaseImagePreview.addEventListener("click", () => el.novelAiBaseImageFile.click());
  el.novelAiBaseImageFile.addEventListener("change", async () => {
    try {
      const file = el.novelAiBaseImageFile.files?.[0];
      if (file) {
        renderBaseImagePreview(await readImageFileAsDataUrl(file));
        renderCostPreview();
        saveSettingsDraft();
      }
    } catch (error) {
      showToast(error.message || "Image2Image 讀取失敗", "error");
    } finally {
      el.novelAiBaseImageFile.value = "";
    }
  });
  el.novelAiClearBaseImageBtn.addEventListener("click", () => {
    renderBaseImagePreview("");
    renderCostPreview();
    saveSettingsDraft();
  });
  el.novelAiAddCharacterBtn.addEventListener("click", () => {
    const current = collectCharacters();
    current.push({ id: makeClientId("nai_char"), name: `Character ${current.length + 1}`, prompt: "", negativePrompt: "", enabled: true, x: 0.5, y: 0.5 });
    renderCharacters(current);
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
      card.querySelector(".nai-position-button").textContent = `位置 ${positionLabel(x, y)}`;
      card.querySelectorAll(".nai-position-grid button").forEach((item) => item.classList.toggle("active", item === button));
      card.querySelector(".nai-position-grid").hidden = true;
    }
    novelAiCharactersDraft = collectCharacters();
    saveSettingsDraft();
  });
  el.novelAiVibeList.addEventListener("click", (event) => handleReferenceListAction("vibe", event));
  el.novelAiVibeList.addEventListener("change", (event) => handleReferenceListAction("vibe", event));
  el.novelAiPreciseList.addEventListener("click", (event) => handleReferenceListAction("precise", event));
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
  fillSelect(el.novelAiModel, NOVELAI_MODEL_OPTIONS, "nai-diffusion-4-5-full");
  fillSelect(el.novelAiSampler, NOVELAI_SAMPLER_OPTIONS, "k_euler_ancestral");
  fillSelect(el.novelAiNoiseSchedule, NOVELAI_NOISE_SCHEDULE_OPTIONS, "karras");
  setFormSettings(loadSettingsDraft(), { save: false, clearBaseImage: true });
  renderMainImage(null);
  bindEvents();
  await Promise.allSettled([refreshStatus(), renderHistory()]);
}

boot();
