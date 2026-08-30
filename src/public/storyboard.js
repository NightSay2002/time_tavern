import { strToU8, zipSync } from "./vendor/fflate.module.js";
import {
  createUiLanguageController,
  loadServerUiLanguage
} from "./ui-language.js";

const uiLanguageController = createUiLanguageController();

const MODEL_OPTIONS = [
  ["nai-diffusion-4-5-full", "NAI Diffusion V4.5 Full"],
  ["nai-diffusion-4-5-curated", "NAI Diffusion V4.5 Curated"],
  ["nai-diffusion-4-full", "NAI Diffusion V4 Full"],
  ["nai-diffusion-4-curated-preview", "NAI Diffusion V4 Curated"],
  ["nai-diffusion-3", "NAI Diffusion Anime V3"],
  ["nai-diffusion-furry-3", "NAI Diffusion Furry V3"]
];
const SAMPLER_OPTIONS = [
  ["k_euler_ancestral", "Euler Ancestral"],
  ["k_euler", "Euler"],
  ["k_dpmpp_2s_ancestral", "DPM++ 2S Ancestral"],
  ["k_dpmpp_2m", "DPM++ 2M"],
  ["k_dpmpp_2m_sde", "DPM++ 2M SDE"],
  ["k_dpmpp_sde", "DPM++ SDE"]
];
const NOISE_OPTIONS = [
  ["karras", "Karras"],
  ["exponential", "Exponential"],
  ["native", "Native"],
  ["polyexponential", "Polyexponential"]
];
const OVERRIDE_FIELDS = [
  ["model", "模型", "select"],
  ["width", "寬", "number"],
  ["height", "高", "number"],
  ["steps", "Steps", "number"],
  ["scale", "Guidance", "number"],
  ["sampler", "Sampler", "select"],
  ["noiseSchedule", "Noise Schedule", "select"],
  ["varietyPlus", "Variety+", "checkbox"],
  ["cfgRescale", "CFG Rescale", "number"],
  ["seed", "Seed", "number"]
];

const $ = (id) => document.getElementById(id);
const el = {
  status: $("storyboardNovelAiStatus"),
  refreshStatus: $("storyboardRefreshStatusBtn"),
  openPicker: $("storyboardOpenPickerBtn"),
  currentName: $("storyboardCurrentName"),
  currentDescription: $("storyboardCurrentDescription"),
  name: $("storyboardName"),
  description: $("storyboardDescription"),
  saveStatus: $("storyboardSaveStatus"),
  newBtn: $("storyboardNewBtn"),
  saveBtn: $("storyboardSaveBtn"),
  exportBtn: $("storyboardExportBtn"),
  importBtn: $("storyboardImportBtn"),
  deleteBtn: $("storyboardDeleteBtn"),
  importFile: $("storyboardImportFile"),
  includeMetadata: $("storyboardIncludeMetadata"),
  model: $("storyboardModel"),
  prompt: $("storyboardPrompt"),
  autoCharacterPosition: $("storyboardAutoCharacterPosition"),
  fixedList: $("storyboardFixedList"),
  addFixed: $("storyboardAddFixedBtn"),
  randomList: $("storyboardRandomList"),
  addRandom: $("storyboardAddRandomBtn"),
  negativePrompt: $("storyboardNegativePrompt"),
  vibeFile: $("storyboardVibeFile"),
  addVibe: $("storyboardAddVibeBtn"),
  vibeList: $("storyboardVibeList"),
  baseImageFile: $("storyboardBaseImageFile"),
  baseImagePreview: $("storyboardBaseImagePreview"),
  clearBaseImage: $("storyboardClearBaseImageBtn"),
  strength: $("storyboardStrength"),
  noise: $("storyboardNoise"),
  preciseFile: $("storyboardPreciseFile"),
  addPrecise: $("storyboardAddPreciseBtn"),
  preciseList: $("storyboardPreciseList"),
  sizePreset: $("storyboardSizePreset"),
  width: $("storyboardWidth"),
  height: $("storyboardHeight"),
  steps: $("storyboardSteps"),
  scale: $("storyboardScale"),
  varietyPlus: $("storyboardVarietyPlus"),
  seed: $("storyboardSeed"),
  sampler: $("storyboardSampler"),
  cfgRescale: $("storyboardCfgRescale"),
  noiseSchedule: $("storyboardNoiseSchedule"),
  defaultsFile: $("storyboardDefaultsFile"),
  saveDefaults: $("storyboardSaveDefaultsBtn"),
  applyDefaults: $("storyboardApplyDefaultsBtn"),
  downloadDefaults: $("storyboardDownloadDefaultsBtn"),
  injectDefaults: $("storyboardInjectDefaultsBtn"),
  canvas: $("storyboardCanvas"),
  addCharacter: $("storyboardAddCharacterBtn"),
  addScene: $("storyboardAddSceneBtn"),
  deleteNode: $("storyboardDeleteNodeBtn"),
  zoomOut: $("storyboardZoomOutBtn"),
  zoomIn: $("storyboardZoomInBtn"),
  center: $("storyboardCenterBtn"),
  start: $("storyboardStartBtn"),
  stop: $("storyboardStopBtn"),
  progress: $("storyboardProgressText"),
  selectionLabel: $("storyboardSelectionLabel"),
  inspector: $("storyboardInspector"),
  openRuns: $("storyboardOpenRunsBtn"),
  runsDialog: $("storyboardRunsDialog"),
  closeRuns: $("storyboardCloseRunsBtn"),
  runBadge: $("storyboardRunBadge"),
  refreshRuns: $("storyboardRefreshRunsBtn"),
  runList: $("storyboardRunList"),
  runDetail: $("storyboardRunDetail"),
  loopDialog: $("storyboardLoopDialog"),
  loopDialogText: $("storyboardLoopDialogText"),
  loopRepeatInput: $("storyboardLoopRepeatInput"),
  saveLoop: $("storyboardSaveLoopBtn"),
  closeLoop: $("storyboardCloseLoopBtn"),
  pickerDialog: $("storyboardPickerDialog"),
  closePicker: $("storyboardClosePickerBtn"),
  pickerGrid: $("storyboardPickerGrid"),
  pickerPrev: $("storyboardPickerPrevBtn"),
  pickerNext: $("storyboardPickerNextBtn"),
  pickerPageInfo: $("storyboardPickerPageInfo"),
  imageDialog: $("storyboardImageDialog"),
  imageDialogTitle: $("storyboardImageDialogTitle"),
  imageDialogImage: $("storyboardImageDialogImage"),
  toast: $("storyboardToast")
};

let editor;
let storyboard = null;
let storyboardList = [];
let selectedNodeId = "";
let selectedRunId = "";
let currentRun = null;
let editorToNode = new Map();
let nodeToEditor = new Map();
let suppressEditorEvents = false;
let saveTimer = null;
let saveInFlight = null;
let saveAgain = false;
let dirty = false;
let locked = false;
let stopRequested = false;
let selectedLoopEdgeId = "";
let storyboardPickerPage = 1;
const STORYBOARD_PICKER_PAGE_SIZE = 6;

function makeId(prefix = "item") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(value = "") {
  return String(value || "").replace(/[&<>'"]/gu, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", "\"": "&quot;"
  })[character]);
}

function clamp(value, fallback, min, max) {
  const parsed = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : fallback));
}

function safeFileName(value = "storyboard") {
  return String(value || "storyboard").trim().replace(/[\\/:*?"<>|]+/gu, "_").replace(/\s+/gu, "_").slice(0, 80) || "storyboard";
}

function truncate(value = "", maxLength = 160) {
  const compact = String(value || "").replace(/\s+/gu, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, Math.max(1, maxLength - 3))}...` : compact;
}

function showToast(message, type = "") {
  el.toast.textContent = uiLanguageController.translate(message);
  el.toast.className = `toast show${type ? ` ${type}` : ""}`;
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => { el.toast.className = "toast"; }, 3200);
}

async function request(pathname, options = {}) {
  const response = await fetch(pathname, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text }; }
  if (!response.ok) {
    throw new Error(data.error || `請求失敗 (${response.status})`);
  }
  return data;
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function populateSelect(select, options) {
  select.replaceChildren(...options.map(([value, label]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }));
}

function defaultSettings(source = {}) {
  return {
    model: source.model || "nai-diffusion-4-5-full",
    prompt: source.prompt || source.promptTemplate || "",
    promptTemplate: source.promptTemplate || source.prompt || "",
    fixedPromptSnippets: Array.isArray(source.fixedPromptSnippets) ? source.fixedPromptSnippets : [],
    randomPromptSnippets: Array.isArray(source.randomPromptSnippets) ? source.randomPromptSnippets : [],
    negativePrompt: source.negativePrompt || "",
    characterPositionMode: source.characterPositionMode === "manual" ? "manual" : "auto",
    width: clamp(source.width, 832, 64, 2048),
    height: clamp(source.height, 1216, 64, 2048),
    steps: clamp(source.steps, 28, 1, 50),
    samples: 1,
    scale: clamp(source.scale, 6, 0, 20),
    varietyPlus: source.varietyPlus !== false,
    cfgRescale: clamp(source.cfgRescale, 0, 0, 1),
    seed: clamp(source.seed, -1, -1, 0xffffffff),
    sampler: source.sampler || "k_euler_ancestral",
    noiseSchedule: source.noiseSchedule || "karras",
    imageFormat: "png",
    qualityToggle: true,
    baseImage: source.baseImage || "",
    strength: clamp(source.strength, 0.7, 0, 1),
    noise: clamp(source.noise, 0, 0, 1),
    vibeTransfer: source.vibeTransfer || { enabled: true, images: [] },
    preciseReference: source.preciseReference || { enabled: true, images: [] }
  };
}

function setSaveStatus(state, message) {
  el.saveStatus.textContent = message;
  el.saveStatus.className = `storyboard-save-status${state ? ` is-${state}` : ""}`;
}

function markDirty(options = {}) {
  if (!storyboard || locked) return;
  collectGlobalSettings();
  storyboard.name = el.name.value.trim() || "未命名 Storyboard";
  storyboard.description = el.description.value.trim();
  storyboard.includeMetadata = el.includeMetadata.checked;
  renderCurrentStoryboard();
  dirty = true;
  setSaveStatus("saving", "尚未保存");
  if (options.render !== false) renderSelectedNode();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => flushSave(), 800);
}

async function flushSave() {
  window.clearTimeout(saveTimer);
  saveTimer = null;
  if (!storyboard || !dirty) return storyboard;
  if (saveInFlight) {
    saveAgain = true;
    await saveInFlight;
    return flushSave();
  }
  collectGlobalSettings();
  setSaveStatus("saving", "保存中...");
  const payload = JSON.stringify({ storyboard });
  saveInFlight = request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}`, { method: "PUT", body: payload });
  try {
    const result = await saveInFlight;
    storyboard = result.storyboard;
    storyboardList = result.storyboards || storyboardList;
    dirty = false;
    setSaveStatus("", "已保存");
    renderStoryboardPicker();
    return storyboard;
  } catch (error) {
    setSaveStatus("error", "保存失敗");
    showToast(error.message, "error");
    throw error;
  } finally {
    saveInFlight = null;
    if (saveAgain) {
      saveAgain = false;
      dirty = true;
      window.setTimeout(() => flushSave(), 0);
    }
  }
}

function collectGlobalSettings() {
  if (!storyboard) return;
  storyboard.globalSettings = defaultSettings({
    ...storyboard.globalSettings,
    model: el.model.value,
    prompt: el.prompt.value.trim(),
    promptTemplate: el.prompt.value.trim(),
    fixedPromptSnippets: collectFixedSnippets(),
    randomPromptSnippets: collectRandomSnippets(),
    negativePrompt: el.negativePrompt.value.trim(),
    characterPositionMode: el.autoCharacterPosition.checked ? "auto" : "manual",
    width: Number(el.width.value),
    height: Number(el.height.value),
    steps: Number(el.steps.value),
    scale: Number(el.scale.value),
    varietyPlus: el.varietyPlus.checked,
    cfgRescale: Number(el.cfgRescale.value),
    seed: el.seed.value === "" ? -1 : Number(el.seed.value),
    sampler: el.sampler.value,
    noiseSchedule: el.noiseSchedule.value,
    strength: Number(el.strength.value),
    noise: Number(el.noise.value)
  });
}

function applyGlobalSettings(settings = {}) {
  const value = defaultSettings(settings);
  el.model.value = value.model;
  el.prompt.value = value.promptTemplate || value.prompt;
  el.negativePrompt.value = value.negativePrompt;
  el.autoCharacterPosition.checked = value.characterPositionMode !== "manual";
  el.width.value = value.width;
  el.height.value = value.height;
  el.steps.value = value.steps;
  el.scale.value = value.scale;
  el.varietyPlus.checked = value.varietyPlus;
  el.cfgRescale.value = value.cfgRescale;
  el.seed.value = value.seed >= 0 ? value.seed : "";
  el.sampler.value = value.sampler;
  el.noiseSchedule.value = value.noiseSchedule;
  el.strength.value = value.strength;
  el.noise.value = value.noise;
  storyboard.globalSettings = value;
  renderFixedSnippets(value.fixedPromptSnippets);
  renderRandomSnippets(value.randomPromptSnippets);
  renderReferences("vibe", value.vibeTransfer?.images || []);
  renderReferences("precise", value.preciseReference?.images || []);
  renderBaseImage();
  syncSizePreset();
}

function collectFixedSnippets() {
  return [...el.fixedList.querySelectorAll(".storyboard-snippet-item")].map((item) => ({
    id: item.dataset.id || makeId("fixed"),
    name: item.querySelector('[data-field="name"]').value.trim(),
    prompt: item.querySelector('[data-field="prompt"]').value.trim()
  })).filter((item) => item.name || item.prompt);
}

function renderFixedSnippets(items = []) {
  el.fixedList.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "storyboard-snippet-item";
    card.dataset.id = item.id || makeId("fixed");
    card.innerHTML = `<div class="storyboard-snippet-header"><input data-field="name" aria-label="Fixed Prompt 名稱"><button type="button" class="nai-danger-button" data-action="remove-fixed">刪除</button></div><textarea data-field="prompt" rows="3" aria-label="Fixed Prompt"></textarea>`;
    card.querySelector('[data-field="name"]').value = item.name || `固定片段 ${index + 1}`;
    card.querySelector('[data-field="prompt"]').value = item.prompt || "";
    el.fixedList.appendChild(card);
  });
  if (!items.length) el.fixedList.innerHTML = '<p class="storyboard-empty">尚無 Fixed Prompt。</p>';
}

function collectRandomSnippets() {
  return [...el.randomList.querySelectorAll(".storyboard-snippet-item")].map((item) => ({
    id: item.dataset.id || makeId("random"),
    name: item.querySelector('[data-field="name"]').value.trim(),
    randomText: item.querySelector('[data-field="randomText"]').value,
    randomItems: item.querySelector('[data-field="randomText"]').value.split(/\r?\n/u).map((value) => value.trim()).filter(Boolean),
    min: Number(item.querySelector('[data-field="min"]').value),
    max: Number(item.querySelector('[data-field="max"]').value),
    squareEnabled: item.querySelector('[data-field="squareEnabled"]').checked,
    squareMax: Number(item.querySelector('[data-field="squareMax"]').value),
    curlyEnabled: item.querySelector('[data-field="curlyEnabled"]').checked,
    curlyMax: Number(item.querySelector('[data-field="curlyMax"]').value),
    weightEnabled: item.querySelector('[data-field="weightEnabled"]').checked,
    weightMin: Number(item.querySelector('[data-field="weightMin"]').value),
    weightMax: Number(item.querySelector('[data-field="weightMax"]').value),
    weightBias: Number(item.querySelector('[data-field="weightBias"]').value)
  })).filter((item) => item.name || item.randomItems.length);
}

function renderRandomSnippets(items = []) {
  el.randomList.innerHTML = "";
  items.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "storyboard-snippet-item";
    card.dataset.id = item.id || makeId("random");
    card.innerHTML = `<div class="storyboard-snippet-header"><input data-field="name" aria-label="Random Prompt 名稱"><button type="button" class="nai-danger-button" data-action="remove-random">刪除</button></div><textarea data-field="randomText" rows="4" aria-label="Random Prompt 項目"></textarea><div class="storyboard-two-column"><label>最少<input data-field="min" type="number" min="0" step="1"></label><label>最多<input data-field="max" type="number" min="0" step="1"></label></div><div class="storyboard-random-weight-grid"><label class="nai-switch"><input data-field="squareEnabled" type="checkbox"> 啟用 []</label><label>[] max<input data-field="squareMax" type="number" min="0" max="12" step="1"></label><label class="nai-switch"><input data-field="curlyEnabled" type="checkbox"> 啟用 {}</label><label>{} max<input data-field="curlyMax" type="number" min="0" max="12" step="1"></label><label class="nai-switch"><input data-field="weightEnabled" type="checkbox"> 數值權重</label><label>最少<input data-field="weightMin" type="number" min="0" max="5" step="0.1"></label><label>最多<input data-field="weightMax" type="number" min="0" max="5" step="0.1"></label><label>偏向<input data-field="weightBias" type="number" min="0" max="5" step="0.1"></label></div>`;
    card.querySelector('[data-field="name"]').value = item.name || `隨機片段 ${index + 1}`;
    card.querySelector('[data-field="randomText"]').value = item.randomText || (item.randomItems || []).join("\n");
    card.querySelector('[data-field="min"]').value = item.min ?? 1;
    card.querySelector('[data-field="max"]').value = item.max ?? 1;
    card.querySelector('[data-field="squareEnabled"]').checked = item.squareEnabled === true;
    card.querySelector('[data-field="squareMax"]').value = item.squareMax ?? 0;
    card.querySelector('[data-field="curlyEnabled"]').checked = item.curlyEnabled === true;
    card.querySelector('[data-field="curlyMax"]').value = item.curlyMax ?? 0;
    card.querySelector('[data-field="weightEnabled"]').checked = item.weightEnabled === true;
    card.querySelector('[data-field="weightMin"]').value = item.weightMin ?? 0;
    card.querySelector('[data-field="weightMax"]').value = item.weightMax ?? 0;
    card.querySelector('[data-field="weightBias"]').value = item.weightBias ?? 0;
    el.randomList.appendChild(card);
  });
  if (!items.length) el.randomList.innerHTML = '<p class="storyboard-empty">尚無 Random Prompt。</p>';
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("圖片讀取失敗。"));
    reader.onload = () => resolve(String(reader.result || ""));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("圖片格式無法由瀏覽器解碼。"));
    image.src = dataUrl;
  });
}

async function readNovelAiBaseImage(file) {
  const dataUrl = await readFileAsDataUrl(file);
  if (/^data:image\/(?:png|jpeg);base64,/iu.test(dataUrl)) return dataUrl;
  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const context = canvas.getContext("2d");
  if (!context || !canvas.width || !canvas.height) throw new Error("Image2Image 圖片轉換失敗。");
  context.drawImage(image, 0, 0);
  return canvas.toDataURL("image/png");
}

function getReferenceImages(type) {
  const key = type === "vibe" ? "vibeTransfer" : "preciseReference";
  const collection = storyboard.globalSettings[key] || { enabled: true, images: [] };
  collection.images = Array.isArray(collection.images) ? collection.images : [];
  storyboard.globalSettings[key] = collection;
  return collection.images;
}

function renderReferences(type, items = getReferenceImages(type)) {
  const container = type === "vibe" ? el.vibeList : el.preciseList;
  container.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "storyboard-reference-item";
    card.dataset.id = item.id;
    card.innerHTML = `<div class="storyboard-reference-header"><img alt=""><span></span><label class="nai-switch"><input data-field="enabled" type="checkbox"> 啟用</label><button type="button" class="nai-danger-button" data-action="remove-reference" data-type="${type}">刪除</button></div><div class="storyboard-reference-controls"><label>Strength<input data-field="strength" type="number" min="-1" max="1" step="0.01"></label>${type === "vibe" ? '<label>Information<input data-field="informationExtracted" type="number" min="0" max="1" step="0.01"></label>' : '<label>Fidelity<input data-field="fidelity" type="number" min="-1" max="1" step="0.01"></label>'}</div>`;
    card.querySelector("img").src = item.image;
    const referenceName = card.querySelector("span");
    referenceName.dataset.uiLanguageSkip = "true";
    referenceName.textContent = item.name || "Reference";
    card.querySelector("span").title = item.name || "Reference";
    card.querySelector('[data-field="enabled"]').checked = item.enabled !== false;
    card.querySelector('[data-field="strength"]').value = item.strength ?? (type === "vibe" ? 0.6 : 1);
    const second = card.querySelector(type === "vibe" ? '[data-field="informationExtracted"]' : '[data-field="fidelity"]');
    second.value = type === "vibe" ? item.informationExtracted ?? 1 : item.fidelity ?? 1;
    container.appendChild(card);
  });
  if (!items.length) container.innerHTML = '<p class="storyboard-empty">尚未加入圖片。</p>';
}

function collectReferences(type) {
  const container = type === "vibe" ? el.vibeList : el.preciseList;
  const items = getReferenceImages(type);
  container.querySelectorAll(".storyboard-reference-item").forEach((card) => {
    const item = items.find((entry) => entry.id === card.dataset.id);
    if (!item) return;
    item.enabled = card.querySelector('[data-field="enabled"]').checked;
    item.strength = Number(card.querySelector('[data-field="strength"]').value);
    if (type === "vibe") item.informationExtracted = Number(card.querySelector('[data-field="informationExtracted"]').value);
    else item.fidelity = Number(card.querySelector('[data-field="fidelity"]').value);
  });
}

function renderBaseImage() {
  const image = storyboard?.globalSettings?.baseImage || "";
  el.baseImagePreview.innerHTML = "";
  el.baseImagePreview.classList.toggle("has-image", Boolean(image));
  if (!image) {
    el.baseImagePreview.textContent = "選擇圖片";
    return;
  }
  const img = document.createElement("img");
  img.src = image;
  img.alt = "Image2Image";
  el.baseImagePreview.appendChild(img);
}

function nodeById(nodeId) {
  return storyboard?.nodes.find((node) => node.id === nodeId) || null;
}

function nodeHtml(node) {
  const typeLabel = node.type === "start" ? "START" : node.type === "character" ? "CHARACTER" : "SCENE";
  const prompt = node.prompt
    ? `<span data-ui-language-skip>${escapeHtml(node.prompt)}</span>`
    : "未填 Prompt";
  const summary = node.type === "character"
    ? prompt
    : node.type === "scene"
      ? `${node.imageCount} 張｜${prompt}`
      : "Storyboard 起點";
  return `<div class="storyboard-node-card"><div class="storyboard-node-type">${typeLabel}</div><div class="storyboard-node-title" data-ui-language-skip title="${escapeHtml(node.name)}">${escapeHtml(node.name)}</div><div class="storyboard-node-summary">${summary}</div></div>`;
}

function drawflowNodeClass(node) {
  return `storyboard-${node.type}-node`;
}

function renderGraph() {
  if (!editor || !storyboard) return;
  suppressEditorEvents = true;
  editor.clear();
  editorToNode = new Map();
  nodeToEditor = new Map();
  storyboard.nodes.forEach((node) => {
    const inputs = node.type === "scene" ? 1 : 0;
    const outputs = 1;
    const drawId = editor.addNode(node.type, inputs, outputs, node.position.x, node.position.y, drawflowNodeClass(node), { nodeId: node.id }, nodeHtml(node));
    editorToNode.set(String(drawId), node.id);
    nodeToEditor.set(node.id, String(drawId));
  });
  storyboard.edges.slice().sort((a, b) => a.order - b.order).forEach((edge) => {
    const from = nodeToEditor.get(edge.source);
    const to = nodeToEditor.get(edge.target);
    if (from && to) editor.addConnection(from, to, "output_1", "input_1");
  });
  suppressEditorEvents = false;
  decorateConnections();
  selectedNodeId = nodeById(selectedNodeId) ? selectedNodeId : "";
  renderSelectedNode();
}

function updateNodeCard(nodeId) {
  const drawId = nodeToEditor.get(nodeId);
  const node = nodeById(nodeId);
  const content = drawId ? document.querySelector(`#node-${CSS.escape(drawId)} .drawflow_content_node`) : null;
  if (node && content) content.innerHTML = nodeHtml(node);
}

function decorateConnections() {
  window.requestAnimationFrame(() => {
    document.querySelectorAll("#storyboardCanvas .connection").forEach((connection) => connection.classList.remove("character-connection", "scene-connection"));
    storyboard.edges.filter((edge) => edge.type === "character_scene").forEach((edge) => {
      const from = nodeToEditor.get(edge.source);
      const to = nodeToEditor.get(edge.target);
      document.querySelector(`#storyboardCanvas .connection.node_out_node-${CSS.escape(from)}.node_in_node-${CSS.escape(to)}`)?.classList.add("character-connection");
    });
    storyboard.edges.filter((edge) => edge.type === "scene_flow" && nodeById(edge.source)?.type === "scene" && nodeById(edge.target)?.type === "scene").forEach((edge) => {
      const from = nodeToEditor.get(edge.source);
      const to = nodeToEditor.get(edge.target);
      const connection = document.querySelector(`#storyboardCanvas .connection.node_out_node-${CSS.escape(from)}.node_in_node-${CSS.escape(to)}`);
      connection?.classList.add("scene-connection");
      connection?.setAttribute("aria-label", `場景連線，點擊設定往返次數，目前 ${edge.returnCount || 0}`);
    });
  });
}

function createsSceneCycle(sourceId, targetId) {
  const outgoing = new Map();
  storyboard.edges.filter((edge) => edge.type === "scene_flow" && nodeById(edge.source)?.type === "scene").forEach((edge) => outgoing.set(edge.source, [...(outgoing.get(edge.source) || []), edge.target]));
  outgoing.set(sourceId, [...(outgoing.get(sourceId) || []), targetId]);
  const stack = [targetId];
  const seen = new Set();
  while (stack.length) {
    const current = stack.pop();
    if (current === sourceId) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    stack.push(...(outgoing.get(current) || []));
  }
  return false;
}

function classifyNewConnection(sourceId, targetId) {
  const source = nodeById(sourceId);
  const target = nodeById(targetId);
  if (!source || !target) return { error: "連線節點不存在。" };
  if (target.type !== "scene" || !["start", "scene", "character"].includes(source.type)) return { error: `不支援 ${source.type} → ${target.type}。` };
  if (source.id === target.id) return { error: "節點不能連到自己。" };
  if (storyboard.edges.some((edge) => edge.source === sourceId && edge.target === targetId)) return { error: "這條連線已存在。" };
  if (source.type === "character") return { type: "character_scene" };

  if (source.type === "start") return { type: "scene_flow" };
  if (!createsSceneCycle(sourceId, targetId)) return { type: "scene_flow" };
  return { error: "場景流程不可形成循環；請點擊既有場景連線設定往返次數。" };
}

function nextEdgeOrder(sourceId) {
  return Math.max(-1, ...storyboard.edges.filter((edge) => edge.source === sourceId).map((edge) => Number(edge.order || 0))) + 1;
}

function getCandidateCharacterIds(sceneId, memo = new Map()) {
  if (memo.has(sceneId)) return memo.get(sceneId);
  const result = new Set(storyboard.edges.filter((edge) => edge.type === "character_scene" && edge.target === sceneId).map((edge) => edge.source));
  storyboard.edges.filter((edge) => edge.type === "scene_flow" && edge.target === sceneId && nodeById(edge.source)?.type === "scene").forEach((edge) => {
    getCandidateCharacterIds(edge.source, memo).forEach((characterId) => result.add(characterId));
  });
  memo.set(sceneId, [...result]);
  return memo.get(sceneId);
}

function renderSelectedNode() {
  const node = nodeById(selectedNodeId);
  el.inspector.innerHTML = "";
  el.selectionLabel.toggleAttribute("data-ui-language-skip", Boolean(node));
  el.selectionLabel.textContent = node ? node.name : "未選擇節點";
  if (!node) {
    el.inspector.innerHTML = '<p class="storyboard-empty">在畫布選擇角色或場景以編輯內容。</p>';
    return;
  }
  if (node.type === "start") {
    el.inspector.innerHTML = '<p class="storyboard-empty">開始節點固定存在。把輸出拉到第一個或多個場景。</p>';
    renderNextScenes(node);
    return;
  }
  const name = document.createElement("label");
  name.innerHTML = '名稱<input data-node-field="name" type="text" maxlength="100">';
  name.querySelector("input").value = node.name;
  el.inspector.appendChild(name);
  if (node.type === "character") {
    const prompt = document.createElement("label");
    prompt.innerHTML = '角色 Prompt<textarea data-node-field="prompt" rows="7"></textarea>';
    prompt.querySelector("textarea").value = node.prompt || "";
    const negative = document.createElement("label");
    negative.innerHTML = 'Undesired<textarea data-node-field="negativePrompt" rows="5"></textarea>';
    negative.querySelector("textarea").value = node.negativePrompt || "";
    el.inspector.append(prompt, negative);
    return;
  }
  const prompt = document.createElement("label");
  prompt.innerHTML = '場景 Prompt<textarea data-node-field="prompt" rows="6"></textarea>';
  prompt.querySelector("textarea").value = node.prompt || "";
  const count = document.createElement("label");
  count.innerHTML = '生成張數<input data-node-field="imageCount" type="number" min="1" max="100" step="1">';
  count.querySelector("input").value = node.imageCount || 1;
  el.inspector.append(prompt, count);
  renderCharacterSettings(node);
  renderOverrides(node);
  renderNextScenes(node);
}

function renderCharacterSettings(scene) {
  const title = document.createElement("strong");
  title.textContent = "本幕角色";
  const list = document.createElement("div");
  list.className = "storyboard-character-settings";
  const candidates = getCandidateCharacterIds(scene.id);
  candidates.forEach((characterId) => {
    const character = nodeById(characterId);
    const relation = scene.characterSettings[characterId] || { enabled: false, actionPrompt: "", x: 0.5, y: 0.5 };
    const row = document.createElement("article");
    row.className = "storyboard-character-row";
    row.dataset.characterId = characterId;
    const manualPosition = storyboard.globalSettings.characterPositionMode === "manual";
    row.innerHTML = `<div class="storyboard-character-row-title"><strong data-ui-language-skip title="${escapeHtml(character?.name)}">${escapeHtml(character?.name || "角色")}</strong><label class="nai-switch"><input data-character-field="enabled" type="checkbox"> 使用</label></div><label>動作 Prompt<textarea data-character-field="actionPrompt" rows="3"></textarea></label>${manualPosition ? '<div class="storyboard-character-position"><span></span><div class="storyboard-character-position-grid"></div></div>' : '<p class="storyboard-character-auto-position">AI 自動定位</p>'}`;
    row.querySelector('[data-character-field="enabled"]').checked = relation.enabled === true;
    row.querySelector('[data-character-field="actionPrompt"]').value = relation.actionPrompt || "";
    if (manualPosition) {
      const selected = storyboardPositionCell(relation.x, relation.y);
      row.querySelector(".storyboard-character-position span").textContent = `粗略位置：${storyboardPositionLabel(relation.x, relation.y)}`;
      const grid = row.querySelector(".storyboard-character-position-grid");
      for (let gridRow = 1; gridRow <= 5; gridRow += 1) {
        for (let gridColumn = 1; gridColumn <= 5; gridColumn += 1) {
          const button = document.createElement("button");
          button.type = "button";
          button.dataset.characterPosition = "true";
          button.dataset.row = String(gridRow);
          button.dataset.col = String(gridColumn);
          button.title = storyboardPositionLabel((gridColumn - 1) / 4, (gridRow - 1) / 4);
          button.setAttribute("aria-label", button.title);
          const active = gridRow === selected.row && gridColumn === selected.col;
          button.classList.toggle("active", active);
          button.textContent = active ? "●" : "";
          grid.appendChild(button);
        }
      }
    }
    list.appendChild(row);
  });
  if (!candidates.length) list.innerHTML = '<p class="storyboard-empty">把角色節點連到這個場景或上游場景。</p>';
  el.inspector.append(title, list);
}

function storyboardPositionCell(x = 0.5, y = 0.5) {
  return {
    row: Math.min(5, Math.max(1, Math.round(Number(y) * 4) + 1)),
    col: Math.min(5, Math.max(1, Math.round(Number(x) * 4) + 1))
  };
}

function storyboardPositionLabel(x = 0.5, y = 0.5) {
  const { row, col } = storyboardPositionCell(x, y);
  const rows = ["最上", "偏上", "中央", "偏下", "最下"];
  const columns = ["最左", "偏左", "中央", "偏右", "最右"];
  return `${rows[row - 1]}・${columns[col - 1]}`;
}

function openLoopDialog(edge) {
  if (!edge || edge.type !== "scene_flow" || nodeById(edge.source)?.type !== "scene" || nodeById(edge.target)?.type !== "scene") return;
  selectedLoopEdgeId = edge.id;
  const source = nodeById(edge.source);
  const target = nodeById(edge.target);
  el.loopDialogText.dataset.uiLanguageSkip = "true";
  el.loopDialogText.textContent = `${source?.name || "場景"} → ${target?.name || "場景"}`;
  el.loopRepeatInput.value = edge.returnCount || 0;
  if (!el.loopDialog.open) el.loopDialog.showModal();
}

function overrideInputHtml(field, type, value) {
  if (field === "model") return `<select data-override-value="${field}">${MODEL_OPTIONS.map(([v, label]) => `<option value="${v}">${label}</option>`).join("")}</select>`;
  if (field === "sampler") return `<select data-override-value="${field}">${SAMPLER_OPTIONS.map(([v, label]) => `<option value="${v}">${label}</option>`).join("")}</select>`;
  if (field === "noiseSchedule") return `<select data-override-value="${field}">${NOISE_OPTIONS.map(([v, label]) => `<option value="${v}">${label}</option>`).join("")}</select>`;
  if (type === "checkbox") return `<label class="nai-switch"><input data-override-value="${field}" type="checkbox"> 啟用</label>`;
  const attrs = field === "width" || field === "height" ? 'min="64" max="2048" step="64"' : field === "steps" ? 'min="1" max="50" step="1"' : field === "scale" ? 'min="0" max="20" step="0.1"' : field === "cfgRescale" ? 'min="0" max="1" step="0.01"' : 'min="-1" step="1"';
  return `<input data-override-value="${field}" type="number" ${attrs}>`;
}

function renderOverrides(scene) {
  const title = document.createElement("strong");
  title.textContent = "場景覆寫";
  const grid = document.createElement("div");
  grid.className = "storyboard-override-grid";
  OVERRIDE_FIELDS.forEach(([field, label, type]) => {
    const row = document.createElement("div");
    row.className = "storyboard-override-row";
    row.innerHTML = `<label class="nai-switch"><input data-override-enabled="${field}" type="checkbox"> ${label}</label>${overrideInputHtml(field, type, scene.overrides.values[field])}`;
    row.querySelector(`[data-override-enabled="${field}"]`).checked = scene.overrides.enabled[field] === true;
    const input = row.querySelector(`[data-override-value="${field}"]`);
    if (type === "checkbox") input.checked = scene.overrides.values[field] !== false;
    else input.value = scene.overrides.values[field] ?? "";
    input.disabled = scene.overrides.enabled[field] !== true;
    grid.appendChild(row);
  });
  el.inspector.append(title, grid);
}

function renderNextScenes(node) {
  const title = document.createElement("strong");
  title.textContent = "後續場景順序";
  const list = document.createElement("div");
  list.className = "storyboard-next-scenes";
  const edges = storyboard.edges.filter((edge) => edge.type === "scene_flow" && edge.source === node.id && nodeById(edge.target)?.type === "scene").sort((a, b) => a.order - b.order);
  edges.forEach((edge, index) => {
    const row = document.createElement("div");
    row.className = "storyboard-next-scene-row";
    row.dataset.edgeId = edge.id;
    row.innerHTML = `<span data-ui-language-skip title="${escapeHtml(nodeById(edge.target)?.name)}">${escapeHtml(nodeById(edge.target)?.name)}</span><button type="button" class="muted" data-edge-order="up" ${index === 0 ? "disabled" : ""}>↑</button><button type="button" class="muted" data-edge-order="down" ${index === edges.length - 1 ? "disabled" : ""}>↓</button>`;
    list.appendChild(row);
  });
  if (!edges.length) list.innerHTML = '<p class="storyboard-empty">尚未連到後續場景。</p>';
  el.inspector.append(title, list);
}

function reorderEdge(edgeId, direction) {
  const edge = storyboard.edges.find((item) => item.id === edgeId);
  if (!edge) return;
  const siblings = storyboard.edges.filter((item) => item.type === "scene_flow" && item.source === edge.source && nodeById(item.target)?.type === "scene").sort((a, b) => a.order - b.order);
  const index = siblings.findIndex((item) => item.id === edgeId);
  const swap = direction === "up" ? index - 1 : index + 1;
  if (swap < 0 || swap >= siblings.length) return;
  [siblings[index].order, siblings[swap].order] = [siblings[swap].order, siblings[index].order];
  renderSelectedNode();
  markDirty({ render: false });
}

function addNode(type) {
  if (locked) return;
  const count = storyboard.nodes.filter((node) => node.type === type).length + 1;
  const node = type === "character" ? {
    id: makeId("character"), type, name: `角色 ${count}`, prompt: "", negativePrompt: "", position: { x: 40, y: 80 + (count - 1) * 150 }
  } : {
    id: makeId("scene"), type, name: `場景 ${count}`, prompt: "", imageCount: 1, position: { x: 300, y: 80 + (count - 1) * 150 },
    overrides: { enabled: Object.fromEntries(OVERRIDE_FIELDS.map(([field]) => [field, false])), values: defaultOverrideValues() }, characterSettings: {}
  };
  storyboard.nodes.push(node);
  renderGraph();
  selectedNodeId = node.id;
  const drawId = nodeToEditor.get(node.id);
  document.querySelector(`#node-${CSS.escape(drawId)}`)?.classList.add("selected");
  renderSelectedNode();
  markDirty({ render: false });
}

function defaultOverrideValues() {
  const settings = defaultSettings(storyboard?.globalSettings || {});
  return Object.fromEntries(OVERRIDE_FIELDS.map(([field]) => [field, settings[field]]));
}

function removeSelectedNode() {
  const node = nodeById(selectedNodeId);
  if (!node || locked) return;
  if (node.type === "start") {
    showToast("開始節點不可刪除。", "error");
    return;
  }
  if (!window.confirm(`刪除「${node.name}」及其連線？`)) return;
  const drawId = nodeToEditor.get(node.id);
  editor.removeNodeId(`node-${drawId}`);
}

function renderCurrentStoryboard() {
  el.currentName.toggleAttribute("data-ui-language-skip", Boolean(storyboard));
  el.currentDescription.toggleAttribute("data-ui-language-skip", Boolean(storyboard?.description));
  el.currentName.textContent = storyboard?.name || "尚未選擇";
  el.currentDescription.textContent = storyboard?.description || "未填簡介";
  el.openPicker.title = storyboard ? storyboard.name : "打開 Storyboard 列表";
}

function renderStoryboardPicker() {
  renderCurrentStoryboard();
  const totalPages = Math.max(1, Math.ceil(storyboardList.length / STORYBOARD_PICKER_PAGE_SIZE));
  storyboardPickerPage = Math.min(Math.max(1, storyboardPickerPage), totalPages);
  const start = (storyboardPickerPage - 1) * STORYBOARD_PICKER_PAGE_SIZE;
  const items = storyboardList.slice(start, start + STORYBOARD_PICKER_PAGE_SIZE);
  el.pickerGrid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = `storyboard-picker-card${item.id === storyboard?.id ? " is-active" : ""}`;
    card.dataset.storyboardId = item.id;
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-";
    card.innerHTML = `<div class="storyboard-picker-preview"><strong>${item.sceneCount || 0}</strong><span>Scenes</span></div><h3 data-ui-language-skip title="${escapeHtml(item.name)}">${escapeHtml(item.name || "未命名 Storyboard")}</h3><p class="storyboard-picker-intro">簡介：<span data-ui-language-skip>${escapeHtml(truncate(item.description || "未填簡介", 180))}</span></p><p class="storyboard-picker-meta">場景 ${item.sceneCount || 0}｜節點 ${item.nodeCount || 0}<br>更新：${escapeHtml(updatedAt)}</p><div class="storyboard-picker-actions"><button type="button" data-picker-action="open">${item.id === storyboard?.id ? "目前使用" : "打開"}</button><button type="button" class="secondary" data-picker-action="export">匯出</button><button type="button" class="nai-danger-button" data-picker-action="delete">刪除</button></div>`;
    card.querySelector('[data-picker-action="open"]').disabled = item.id === storyboard?.id;
    el.pickerGrid.appendChild(card);
  });
  if (!items.length) {
    el.pickerGrid.innerHTML = '<p class="storyboard-empty">尚無 Storyboard。</p>';
  }
  el.pickerPageInfo.textContent = `第 ${storyboardPickerPage} / ${totalPages} 頁`;
  el.pickerPrev.disabled = storyboardPickerPage <= 1;
  el.pickerNext.disabled = storyboardPickerPage >= totalPages;
}

async function loadStoryboard(storyboardId) {
  if (!storyboardId) return;
  if (dirty) await flushSave();
  const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboardId)}`);
  storyboard = result.storyboard;
  selectedNodeId = "";
  selectedRunId = "";
  currentRun = null;
  el.name.value = storyboard.name;
  el.description.value = storyboard.description || "";
  el.includeMetadata.checked = storyboard.includeMetadata !== false;
  applyGlobalSettings(storyboard.globalSettings);
  renderGraph();
  renderStoryboardPicker();
  await refreshRuns();
  setSaveStatus("", "已保存");
}

async function refreshStoryboards(selectId = "") {
  const result = await request("/api/novelai/storyboards");
  storyboardList = result.storyboards || [];
  renderStoryboardPicker();
  const id = selectId || storyboard?.id || storyboardList[0]?.id;
  if (id && id !== storyboard?.id) await loadStoryboard(id);
}

async function createNewStoryboard() {
  await flushSave();
  const defaults = await loadBackendDefaults();
  const result = await request("/api/novelai/storyboards", {
    method: "POST",
    body: JSON.stringify({ name: `Storyboard ${storyboardList.length + 1}`, globalSettings: defaults })
  });
  storyboardList = result.storyboards || storyboardList;
  await loadStoryboard(result.storyboard.id);
  showToast("已建立 Storyboard");
}

async function exportStoryboard() {
  await flushSave();
  await exportStoryboardById(storyboard.id);
}

async function exportStoryboardById(storyboardId) {
  const source = storyboardId === storyboard?.id
    ? storyboard
    : (await request(`/api/novelai/storyboards/${encodeURIComponent(storyboardId)}`)).storyboard;
  const payload = { ...source, id: undefined, createdAt: undefined, updatedAt: undefined };
  triggerDownload(new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" }), `${safeFileName(source.name)}.json`);
}

async function importStoryboard(file) {
  if (!file) return;
  const payload = JSON.parse(await file.text());
  const result = await request("/api/novelai/storyboards", { method: "POST", body: JSON.stringify(payload) });
  storyboardList = result.storyboards || storyboardList;
  await loadStoryboard(result.storyboard.id);
  showToast("Storyboard 已匯入");
}

async function deleteStoryboardById(storyboardId, storyboardName) {
  if (!storyboardId || !window.confirm(`刪除「${storyboardName || "Storyboard"}」及所有執行圖片？`)) return;
  const deletingCurrent = storyboardId === storyboard?.id;
  if (deletingCurrent) await flushSave();
  const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboardId)}`, { method: "DELETE" });
  storyboardList = result.storyboards || [];
  if (deletingCurrent) {
    storyboard = null;
    if (storyboardList.length) await loadStoryboard(storyboardList[0].id);
    else await createNewStoryboard();
  } else {
    renderStoryboardPicker();
  }
}

async function deleteStoryboard() {
  if (!storyboard) return;
  await deleteStoryboardById(storyboard.id, storyboard.name);
}

function runStatusLabel(status) {
  return ({ queued: "待生成", generating: "生成中", paused: "已暫停", failed: "失敗", completed: "完成" })[status] || status;
}

async function refreshRuns(preferredId = selectedRunId) {
  if (!storyboard) return;
  const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs`);
  const runs = result.runs || [];
  el.runBadge.textContent = String(runs.length);
  el.runList.innerHTML = "";
  runs.forEach((run) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = run.id === preferredId ? "is-active" : "secondary";
    button.dataset.runId = run.id;
    button.textContent = `${runStatusLabel(run.status)} ${run.completedCount}/${run.totalCount}`;
    button.title = new Date(run.createdAt).toLocaleString();
    el.runList.appendChild(button);
  });
  if (!runs.length) {
    el.runList.innerHTML = '<p class="storyboard-empty">尚無執行紀錄。</p>';
    el.runDetail.innerHTML = '<p class="storyboard-empty">按「開始」生成整個 Storyboard。</p>';
    return;
  }
  const runId = runs.some((run) => run.id === preferredId) ? preferredId : runs[0].id;
  await loadRun(runId);
}

async function loadRun(runId) {
  if (!runId || !storyboard) return;
  const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs/${encodeURIComponent(runId)}`);
  selectedRunId = runId;
  currentRun = result.run;
  renderRunListSelection();
  renderRunDetail();
  renderProgress();
}

function renderRunListSelection() {
  el.runList.querySelectorAll("button[data-run-id]").forEach((button) => {
    button.className = button.dataset.runId === selectedRunId ? "is-active" : "secondary";
  });
}

function renderProgress() {
  if (!currentRun) {
    el.progress.textContent = "尚未開始";
    return;
  }
  const total = currentRun.images.length + Math.max(0, currentRun.plan.length - currentRun.nextIndex);
  const task = currentRun.plan[currentRun.nextIndex];
  const round = task?.roundCount > 1 ? `｜${task.sceneName} 第 ${task.roundIndex}/${task.roundCount} 輪` : task ? `｜${task.sceneName}` : "";
  el.progress.textContent = `${runStatusLabel(currentRun.status)} ${currentRun.images.length}/${total}${round}`;
}

function renderRunDetail() {
  const run = currentRun;
  el.runDetail.innerHTML = "";
  if (!run) {
    el.runDetail.innerHTML = '<p class="storyboard-empty">選擇執行紀錄。</p>';
    return;
  }
  const summary = document.createElement("div");
  summary.className = "storyboard-run-summary";
  const total = run.images.length + Math.max(0, run.plan.length - run.nextIndex);
  summary.innerHTML = `<strong>${runStatusLabel(run.status)}｜${run.images.length}/${total}</strong><span>${new Date(run.createdAt).toLocaleString()}</span>${run.error ? `<span class="error">${escapeHtml(run.error)}</span>` : ""}`;
  const actions = document.createElement("div");
  actions.className = "storyboard-run-actions";
  if (["queued", "paused", "failed"].includes(run.status)) actions.innerHTML += `<button type="button" data-run-action="resume">${run.status === "queued" ? "繼續執行" : "套用最新版續跑"}</button>`;
  if (run.images.length) actions.innerHTML += '<button type="button" class="secondary" data-run-action="zip">下載 ZIP</button>';
  if (run.status !== "generating") actions.innerHTML += '<button type="button" class="nai-danger-button" data-run-action="delete">刪除紀錄</button>';
  const images = document.createElement("div");
  images.className = "storyboard-run-images";
  run.images.forEach((item) => {
    const card = document.createElement("article");
    card.className = "storyboard-run-image";
    const round = item.roundCount > 1 ? `｜第 ${item.roundIndex}/${item.roundCount} 輪` : "";
    card.innerHTML = `<button type="button" data-image-action="view"><img data-ui-language-skip alt="${escapeHtml(item.sceneName)}"></button><span class="storyboard-run-image-scene" data-ui-language-skip title="${escapeHtml(item.sceneName)}${escapeHtml(round)}">${escapeHtml(item.sceneName)}${escapeHtml(round)}</span><span data-ui-language-skip title="${escapeHtml(item.fileName)}">${escapeHtml(item.fileName)}</span><button type="button" class="secondary" data-image-action="download">下載</button>`;
    card.dataset.imageId = item.id;
    card.querySelector("img").src = item.imageUrl;
    images.appendChild(card);
  });
  el.runDetail.append(summary, actions, images);
}

function setLocked(value) {
  locked = Boolean(value);
  editor.editor_mode = locked ? "fixed" : "edit";
  el.canvas.classList.toggle("is-locked", locked);
  el.start.disabled = locked;
  el.stop.disabled = !locked;
  [el.addCharacter, el.addScene, el.deleteNode, el.saveBtn, el.newBtn, el.deleteBtn, el.openPicker].forEach((control) => { control.disabled = locked; });
}

async function startRun() {
  if (!storyboard || locked) return;
  await flushSave();
  try {
    const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs`, { method: "POST", body: "{}" });
    currentRun = result.run;
    selectedRunId = currentRun.id;
    stopRequested = false;
    setLocked(true);
    await processRun();
  } catch (error) {
    showToast(error.message, "error");
    await refreshRuns();
  }
}

async function processRun() {
  while (currentRun && !stopRequested && !["completed", "paused", "failed"].includes(currentRun.status)) {
    try {
      const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs/${encodeURIComponent(currentRun.id)}/next`, { method: "POST", body: "{}" });
      currentRun = result.run;
      selectedRunId = currentRun.id;
      renderRunDetail();
      renderProgress();
      await refreshRuns(currentRun.id);
    } catch (error) {
      showToast(error.message, "error");
      await loadRun(currentRun.id).catch(() => {});
      break;
    }
  }
  setLocked(false);
  if (currentRun?.status === "completed") showToast("Storyboard 已全部生成");
}

async function stopRun() {
  if (!currentRun || !locked) return;
  stopRequested = true;
  el.stop.disabled = true;
  el.progress.textContent = "正在完成目前圖片後停止...";
  try {
    const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs/${encodeURIComponent(currentRun.id)}/pause`, { method: "POST", body: "{}" });
    currentRun = result.run;
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function resumeRun() {
  if (!currentRun || locked) return;
  await flushSave();
  const result = await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs/${encodeURIComponent(currentRun.id)}/resume`, { method: "POST", body: "{}" });
  currentRun = result.run;
  stopRequested = false;
  setLocked(true);
  await processRun();
}

async function deleteRun() {
  if (!currentRun || !window.confirm("刪除這次執行和所有圖片？")) return;
  await request(`/api/novelai/storyboards/${encodeURIComponent(storyboard.id)}/runs/${encodeURIComponent(currentRun.id)}`, { method: "DELETE" });
  currentRun = null;
  selectedRunId = "";
  await refreshRuns();
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crcTable[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(chunks) {
  const output = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
  let offset = 0;
  chunks.forEach((chunk) => { output.set(chunk, offset); offset += chunk.length; });
  return output;
}

function pngChunks(bytes) {
  const result = [];
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
    const length = view.getUint32(0, false);
    const type = new TextDecoder("latin1").decode(bytes.slice(offset + 4, offset + 8));
    const end = offset + 12 + length;
    if (end > bytes.length) break;
    result.push({ type, start: offset, end });
    offset = end;
    if (type === "IEND") break;
  }
  return result;
}

function stripPngMetadata(bytes) {
  return concatBytes([bytes.slice(0, 8), ...pngChunks(bytes).filter((chunk) => !["tEXt", "iTXt", "zTXt"].includes(chunk.type)).map((chunk) => bytes.slice(chunk.start, chunk.end))]);
}

function pngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const output = new Uint8Array(12 + data.length);
  const view = new DataView(output.buffer);
  view.setUint32(0, data.length, false);
  output.set(typeBytes, 4);
  output.set(data, 8);
  view.setUint32(8 + data.length, crc32(concatBytes([typeBytes, data])), false);
  return output;
}

function addPngMetadata(bytes, item) {
  const clean = stripPngMetadata(bytes);
  const chunks = pngChunks(clean);
  const iend = chunks.find((chunk) => chunk.type === "IEND");
  if (!iend) return clean;
  const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
  const settings = metadata.settings && typeof metadata.settings === "object" ? metadata.settings : {};
  const comment = {
    prompt: settings.prompt || "",
    prompt_template: settings.promptTemplate || "",
    negative_prompt: settings.negativePrompt || "",
    seed: settings.seed,
    width: settings.width,
    height: settings.height,
    steps: settings.steps,
    sampler: settings.sampler,
    scale: settings.scale,
    cfg_rescale: settings.cfgRescale,
    noise_schedule: settings.noiseSchedule,
    model: settings.model,
    character_prompts: settings.characters || [],
    storyboard: {
      id: metadata.storyboardId || "",
      runId: metadata.runId || "",
      sceneId: metadata.sceneId || "",
      sceneName: metadata.sceneName || ""
    }
  };
  const entries = {
    Description: settings.prompt || "",
    Software: settings.model || "NovelAI",
    Source: String(settings.seed ?? ""),
    Comment: JSON.stringify(comment),
    NovelAIMetadata: JSON.stringify(metadata),
    TimeTavernNovelAIMetadata: JSON.stringify(metadata)
  };
  const metadataChunks = Object.entries(entries).map(([key, value]) => {
    const keyword = new TextEncoder().encode(key);
    const data = concatBytes([keyword, new Uint8Array([0, 0, 0, 0, 0]), new TextEncoder().encode(value)]);
    return pngChunk("iTXt", data);
  });
  return concatBytes([clean.slice(0, iend.start), ...metadataChunks, clean.slice(iend.start)]);
}

async function getDownloadBytes(item) {
  const response = await fetch(item.imageUrl);
  if (!response.ok) throw new Error("圖片讀取失敗。");
  const bytes = new Uint8Array(await response.arrayBuffer());
  return storyboard.includeMetadata ? addPngMetadata(bytes, item) : stripPngMetadata(bytes);
}

async function downloadImage(item) {
  triggerDownload(new Blob([await getDownloadBytes(item)], { type: "image/png" }), item.fileName);
}

async function downloadRunZip() {
  if (!currentRun?.images.length) return;
  el.progress.textContent = "正在建立 ZIP...";
  const entries = {};
  for (const item of currentRun.images) entries[item.fileName] = await getDownloadBytes(item);
  const zipped = zipSync(entries, { level: 6 });
  triggerDownload(new Blob([zipped], { type: "application/zip" }), `${safeFileName(currentRun.storyboardName)}.zip`);
  renderProgress();
}

async function refreshStatus() {
  try {
    const status = await request("/api/novelai/status");
    el.status.textContent = status.ok ? `Anlas: ${status.remainingAnlas ?? 0}` : status.configured ? "Anlas: 無法取得" : "NovelAI Token: 未設定";
  } catch { el.status.textContent = "Anlas: 無法取得"; }
}

async function loadBackendDefaults() {
  const result = await request("/api/novelai/defaults");
  return defaultSettings(result.defaults?.settings || {});
}

async function saveDefaults() {
  collectGlobalSettings();
  await request("/api/novelai/defaults", { method: "PUT", body: JSON.stringify({ settings: storyboard.globalSettings }) });
  showToast("已保存 NAI 預設");
}

async function applyDefaults() {
  applyGlobalSettings(await loadBackendDefaults());
  markDirty({ render: false });
  showToast("已套用 NAI 預設");
}

async function downloadDefaults() {
  const settings = await loadBackendDefaults();
  triggerDownload(new Blob([`${JSON.stringify({ settings }, null, 2)}\n`], { type: "application/json" }), "novelai-defaults.json");
}

async function injectDefaults(file) {
  if (!file) return;
  const payload = JSON.parse(await file.text());
  const result = await request("/api/novelai/defaults", { method: "PUT", body: JSON.stringify(payload) });
  applyGlobalSettings(result.defaults?.settings || payload.settings || payload);
  markDirty({ render: false });
  showToast("已注入並套用 NAI 預設");
}

function syncSizePreset() {
  const width = Number(el.width.value);
  const height = Number(el.height.value);
  el.sizePreset.value = width === 832 && height === 1216 ? "portrait" : width === 1216 && height === 832 ? "landscape" : "custom";
}

function bindEditorEvents() {
  editor.on("nodeSelected", (drawId) => {
    selectedNodeId = editorToNode.get(String(drawId)) || "";
    renderSelectedNode();
  });
  editor.on("nodeUnselected", () => { selectedNodeId = ""; renderSelectedNode(); });
  editor.on("connectionSelected", (data) => {
    const sourceId = editorToNode.get(String(data.output_id));
    const targetId = editorToNode.get(String(data.input_id));
    const edge = storyboard.edges.find((item) => item.source === sourceId && item.target === targetId);
    openLoopDialog(edge);
  });
  editor.on("nodeMoved", (drawId) => {
    if (suppressEditorEvents || locked) return;
    const node = nodeById(editorToNode.get(String(drawId)));
    const data = editor.getNodeFromId(drawId);
    if (node && data) {
      node.position = { x: data.pos_x, y: data.pos_y };
      markDirty({ render: false });
    }
  });
  editor.on("connectionCreated", (data) => {
    if (suppressEditorEvents || locked) return;
    const sourceId = editorToNode.get(String(data.output_id));
    const targetId = editorToNode.get(String(data.input_id));
    const classification = classifyNewConnection(sourceId, targetId);
    if (classification.error) {
      suppressEditorEvents = true;
      editor.removeSingleConnection(data.output_id, data.input_id, data.output_class, data.input_class);
      suppressEditorEvents = false;
      showToast(classification.error, "error");
      return;
    }
    storyboard.edges.push({
      id: makeId("edge"),
      source: sourceId,
      target: targetId,
      type: classification.type,
      order: nextEdgeOrder(sourceId),
      ...(classification.type === "scene_flow" && nodeById(sourceId)?.type === "scene" ? { returnCount: 0 } : {})
    });
    decorateConnections();
    renderSelectedNode();
    markDirty({ render: false });
  });
  editor.on("connectionRemoved", (data) => {
    if (suppressEditorEvents || locked) return;
    const sourceId = editorToNode.get(String(data.output_id));
    const targetId = editorToNode.get(String(data.input_id));
    storyboard.edges = storyboard.edges.filter((edge) => !(edge.source === sourceId && edge.target === targetId));
    renderSelectedNode();
    markDirty({ render: false });
  });
  editor.on("nodeRemoved", (drawId) => {
    if (suppressEditorEvents || locked) return;
    const nodeId = editorToNode.get(String(drawId));
    const node = nodeById(nodeId);
    if (node?.type === "start") {
      showToast("開始節點不可刪除。", "error");
      renderGraph();
      return;
    }
    storyboard.nodes = storyboard.nodes.filter((item) => item.id !== nodeId);
    storyboard.edges = storyboard.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    selectedNodeId = "";
    renderGraph();
    markDirty({ render: false });
  });
}

function bindEvents() {
  el.newBtn.addEventListener("click", () => createNewStoryboard().catch((error) => showToast(error.message, "error")));
  el.saveBtn.addEventListener("click", () => { dirty = true; flushSave().then(() => showToast("已保存 Storyboard")).catch(() => {}); });
  el.exportBtn.addEventListener("click", () => exportStoryboard().catch((error) => showToast(error.message, "error")));
  el.importBtn.addEventListener("click", () => el.importFile.click());
  el.importFile.addEventListener("change", () => importStoryboard(el.importFile.files?.[0]).catch((error) => showToast(error.message, "error")).finally(() => { el.importFile.value = ""; }));
  el.deleteBtn.addEventListener("click", () => deleteStoryboard().catch((error) => showToast(error.message, "error")));
  el.openPicker.addEventListener("click", () => {
    storyboardPickerPage = 1;
    renderStoryboardPicker();
    el.pickerDialog.showModal();
  });
  el.closePicker.addEventListener("click", () => el.pickerDialog.close());
  el.pickerPrev.addEventListener("click", () => { storyboardPickerPage -= 1; renderStoryboardPicker(); });
  el.pickerNext.addEventListener("click", () => { storyboardPickerPage += 1; renderStoryboardPicker(); });
  el.pickerGrid.addEventListener("click", async (event) => {
    const action = event.target.closest("[data-picker-action]")?.dataset.pickerAction;
    const card = event.target.closest("[data-storyboard-id]");
    const item = storyboardList.find((entry) => entry.id === card?.dataset.storyboardId);
    if (!action || !item) return;
    try {
      if (action === "open") {
        await loadStoryboard(item.id);
        el.pickerDialog.close();
      } else if (action === "export") {
        await exportStoryboardById(item.id);
      } else if (action === "delete") {
        await deleteStoryboardById(item.id, item.name);
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });
  el.addCharacter.addEventListener("click", () => addNode("character"));
  el.addScene.addEventListener("click", () => addNode("scene"));
  el.deleteNode.addEventListener("click", removeSelectedNode);
  el.zoomIn.addEventListener("click", () => editor.zoom_in());
  el.zoomOut.addEventListener("click", () => editor.zoom_out());
  el.center.addEventListener("click", () => { editor.zoom_reset(); editor.canvas_x = 0; editor.canvas_y = 0; editor.precanvas.style.transform = `translate(0px, 0px) scale(${editor.zoom})`; });
  el.start.addEventListener("click", () => startRun());
  el.stop.addEventListener("click", () => stopRun());
  el.refreshStatus.addEventListener("click", refreshStatus);
  el.refreshRuns.addEventListener("click", () => refreshRuns());
  el.openRuns.addEventListener("click", async () => {
    try {
      await refreshRuns();
      el.runsDialog.showModal();
    } catch (error) {
      showToast(error.message, "error");
    }
  });
  el.closeRuns.addEventListener("click", () => el.runsDialog.close());
  el.runsDialog.addEventListener("click", (event) => {
    if (event.target === el.runsDialog) el.runsDialog.close();
  });
  el.closeLoop.addEventListener("click", () => el.loopDialog.close());
  el.loopDialog.addEventListener("close", () => { selectedLoopEdgeId = ""; });
  el.loopDialog.addEventListener("click", (event) => {
    if (event.target === el.loopDialog) el.loopDialog.close();
  });
  el.saveLoop.addEventListener("click", () => {
    const edge = storyboard.edges.find((item) => item.id === selectedLoopEdgeId && item.type === "scene_flow");
    if (!edge) return;
    edge.returnCount = Math.floor(clamp(el.loopRepeatInput.value, edge.returnCount || 0, 0, 20));
    el.loopRepeatInput.value = edge.returnCount;
    renderSelectedNode();
    markDirty({ render: false });
    decorateConnections();
    el.loopDialog.close();
    showToast(edge.returnCount > 0 ? `往返次數已設為 ${edge.returnCount}` : "這條連線不往返");
  });
  el.runList.addEventListener("click", (event) => { const button = event.target.closest("[data-run-id]"); if (button) loadRun(button.dataset.runId).catch((error) => showToast(error.message, "error")); });
  el.runDetail.addEventListener("click", async (event) => {
    const runAction = event.target.closest("[data-run-action]")?.dataset.runAction;
    if (runAction === "resume") return resumeRun().catch((error) => { setLocked(false); showToast(error.message, "error"); });
    if (runAction === "zip") return downloadRunZip().catch((error) => showToast(error.message, "error"));
    if (runAction === "delete") return deleteRun().catch((error) => showToast(error.message, "error"));
    const card = event.target.closest(".storyboard-run-image");
    const image = currentRun?.images.find((item) => item.id === card?.dataset.imageId);
    if (!image) return;
    if (event.target.closest('[data-image-action="download"]')) return downloadImage(image).catch((error) => showToast(error.message, "error"));
    if (event.target.closest('[data-image-action="view"]')) {
      el.imageDialogTitle.textContent = image.fileName;
      el.imageDialogImage.src = image.imageUrl;
      el.imageDialog.showModal();
    }
  });
  el.inspector.addEventListener("input", (event) => {
    if (locked) return;
    const node = nodeById(selectedNodeId);
    if (!node) return;
    const field = event.target.dataset.nodeField;
    if (field) {
      node[field] = field === "imageCount" ? Math.floor(clamp(event.target.value, 1, 1, 100)) : event.target.value;
      updateNodeCard(node.id);
      el.selectionLabel.dataset.uiLanguageSkip = "true";
      el.selectionLabel.textContent = node.name;
      markDirty({ render: false });
      return;
    }
    const characterField = event.target.dataset.characterField;
    if (characterField) {
      const row = event.target.closest("[data-character-id]");
      node.characterSettings[row.dataset.characterId] ||= { enabled: false, actionPrompt: "", x: 0.5, y: 0.5 };
      node.characterSettings[row.dataset.characterId][characterField] = event.target.type === "checkbox" ? event.target.checked : characterField === "x" || characterField === "y" ? clamp(event.target.value, 0.5, 0, 1) : event.target.value;
      markDirty({ render: false });
      return;
    }
    const enabledField = event.target.dataset.overrideEnabled;
    if (enabledField) {
      node.overrides.enabled[enabledField] = event.target.checked;
      event.target.closest(".storyboard-override-row").querySelector(`[data-override-value="${enabledField}"]`).disabled = !event.target.checked;
      markDirty({ render: false });
      return;
    }
    const valueField = event.target.dataset.overrideValue;
    if (valueField) {
      node.overrides.values[valueField] = event.target.type === "checkbox" ? event.target.checked : event.target.type === "number" ? Number(event.target.value) : event.target.value;
      markDirty({ render: false });
    }
  });
  el.inspector.addEventListener("click", (event) => {
    const positionButton = event.target.closest("[data-character-position]");
    if (positionButton && !locked) {
      const row = positionButton.closest("[data-character-id]");
      const node = nodeById(selectedNodeId);
      if (!row || !node) return;
      const relation = node.characterSettings[row.dataset.characterId] ||= { enabled: false, actionPrompt: "", x: 0.5, y: 0.5 };
      relation.x = (Number(positionButton.dataset.col) - 1) / 4;
      relation.y = (Number(positionButton.dataset.row) - 1) / 4;
      row.querySelectorAll("[data-character-position]").forEach((button) => {
        const active = button === positionButton;
        button.classList.toggle("active", active);
        button.textContent = active ? "●" : "";
      });
      row.querySelector(".storyboard-character-position span").textContent = `粗略位置：${storyboardPositionLabel(relation.x, relation.y)}`;
      markDirty({ render: false });
      return;
    }
    const orderButton = event.target.closest("[data-edge-order]");
    if (orderButton) {
      reorderEdge(orderButton.closest("[data-edge-id]").dataset.edgeId, orderButton.dataset.edgeOrder);
      return;
    }
  });
  document.querySelector(".storyboard-settings-panel").addEventListener("input", (event) => {
    if (locked || !storyboard || event.target.type === "file") return;
    collectReferences("vibe"); collectReferences("precise"); markDirty({ render: false });
    if (event.target === el.autoCharacterPosition) renderSelectedNode();
  });
  el.name.addEventListener("input", () => { storyboard.name = el.name.value; markDirty({ render: false }); });
  el.addFixed.addEventListener("click", () => { const items = collectFixedSnippets(); items.push({ id: makeId("fixed"), name: `固定片段 ${items.length + 1}`, prompt: "" }); renderFixedSnippets(items); markDirty({ render: false }); });
  el.addRandom.addEventListener("click", () => { const items = collectRandomSnippets(); items.push({ id: makeId("random"), name: `隨機片段 ${items.length + 1}`, randomText: "", min: 1, max: 1 }); renderRandomSnippets(items); markDirty({ render: false }); });
  document.querySelector(".storyboard-settings-panel").addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action === "remove-fixed" || action === "remove-random") { event.target.closest(".storyboard-snippet-item").remove(); markDirty({ render: false }); }
    if (action === "remove-reference") { const items = getReferenceImages(event.target.dataset.type); const id = event.target.closest(".storyboard-reference-item").dataset.id; const index = items.findIndex((item) => item.id === id); if (index >= 0) items.splice(index, 1); renderReferences(event.target.dataset.type); markDirty({ render: false }); }
  });
  async function addReferenceFiles(type, files) {
    const items = getReferenceImages(type);
    for (const file of files) items.push({ id: makeId(type), name: file.name, image: await readFileAsDataUrl(file), enabled: true, strength: type === "vibe" ? 0.6 : 1, informationExtracted: 1, fidelity: 1 });
    renderReferences(type); markDirty({ render: false });
  }
  el.addVibe.addEventListener("click", () => el.vibeFile.click());
  el.addPrecise.addEventListener("click", () => el.preciseFile.click());
  el.vibeFile.addEventListener("change", () => addReferenceFiles("vibe", [...el.vibeFile.files]).catch((error) => showToast(error.message, "error")).finally(() => { el.vibeFile.value = ""; }));
  el.preciseFile.addEventListener("change", () => addReferenceFiles("precise", [...el.preciseFile.files]).catch((error) => showToast(error.message, "error")).finally(() => { el.preciseFile.value = ""; }));
  el.baseImagePreview.addEventListener("click", () => el.baseImageFile.click());
  el.baseImageFile.addEventListener("change", async () => { const file = el.baseImageFile.files?.[0]; if (file) { storyboard.globalSettings.baseImage = await readNovelAiBaseImage(file); renderBaseImage(); markDirty({ render: false }); } el.baseImageFile.value = ""; });
  el.clearBaseImage.addEventListener("click", () => { storyboard.globalSettings.baseImage = ""; renderBaseImage(); markDirty({ render: false }); });
  el.sizePreset.addEventListener("change", () => { if (el.sizePreset.value === "portrait") { el.width.value = 832; el.height.value = 1216; } if (el.sizePreset.value === "landscape") { el.width.value = 1216; el.height.value = 832; } markDirty({ render: false }); });
  el.width.addEventListener("change", syncSizePreset); el.height.addEventListener("change", syncSizePreset);
  el.saveDefaults.addEventListener("click", () => saveDefaults().catch((error) => showToast(error.message, "error")));
  el.applyDefaults.addEventListener("click", () => applyDefaults().catch((error) => showToast(error.message, "error")));
  el.downloadDefaults.addEventListener("click", () => downloadDefaults().catch((error) => showToast(error.message, "error")));
  el.injectDefaults.addEventListener("click", () => el.defaultsFile.click());
  el.defaultsFile.addEventListener("change", () => injectDefaults(el.defaultsFile.files?.[0]).catch((error) => showToast(error.message, "error")).finally(() => { el.defaultsFile.value = ""; }));
  window.addEventListener("beforeunload", (event) => { if (dirty || saveInFlight) { event.preventDefault(); event.returnValue = ""; } });
}

async function init() {
  await loadServerUiLanguage(uiLanguageController);
  populateSelect(el.model, MODEL_OPTIONS);
  populateSelect(el.sampler, SAMPLER_OPTIONS);
  populateSelect(el.noiseSchedule, NOISE_OPTIONS);
  if (!window.Drawflow) throw new Error("Drawflow 載入失敗。");
  editor = new window.Drawflow(el.canvas);
  editor.useuuid = true;
  editor.reroute = true;
  editor.zoom_min = 0.35;
  editor.zoom_max = 1.6;
  editor.start();
  bindEditorEvents();
  bindEvents();
  await Promise.all([refreshStatus(), refreshStoryboards()]);
  if (!storyboardList.length) await createNewStoryboard();
  uiLanguageController.apply();
}

init().catch((error) => {
  showToast(error.message || "Storyboard 初始化失敗", "error");
  el.progress.textContent = error.message || "初始化失敗";
});
