import crypto from "node:crypto";

export const STORYBOARD_SPEC = "time_tavern_nai_storyboard";
export const STORYBOARD_VERSION = 1;
export const STORYBOARD_OVERRIDE_FIELDS = [
  "model",
  "width",
  "height",
  "steps",
  "scale",
  "sampler",
  "noiseSchedule",
  "varietyPlus",
  "cfgRescale",
  "seed"
];

function text(value = "") {
  return String(value ?? "").trim();
}

function finite(value, fallback = 0, min = -Infinity, max = Infinity) {
  const parsed = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(parsed) ? parsed : fallback));
}

function integer(value, fallback = 0, min = -Infinity, max = Infinity) {
  return Math.floor(finite(value, fallback, min, max));
}

function clone(value, fallback = {}) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return JSON.parse(JSON.stringify(fallback));
  }
}

function id(prefix = "item") {
  return `${prefix}_${crypto.randomUUID().replace(/-/gu, "").slice(0, 16)}`;
}

function cleanPrompt(value = "") {
  return String(value || "")
    .replace(/\r?\n+/gu, ",")
    .replace(/[，,]\s*[，,]+/gu, ",")
    .replace(/\s*[,，]\s*/gu, ",")
    .replace(/^,+|,+$/gu, "")
    .trim();
}

function joinPrompts(...values) {
  return cleanPrompt(values.filter((value) => text(value)).join(","));
}

function normalizePosition(source = {}, fallback = {}) {
  return {
    x: finite(source.x, fallback.x ?? 120, -100000, 100000),
    y: finite(source.y, fallback.y ?? 120, -100000, 100000)
  };
}

function normalizeCharacterSettings(value = {}) {
  return Object.fromEntries(Object.entries(value && typeof value === "object" ? value : {})
    .map(([characterId, item]) => [text(characterId), {
      enabled: item?.enabled === true,
      actionPrompt: text(item?.actionPrompt),
      x: finite(item?.x, 0.5, 0, 1),
      y: finite(item?.y, 0.5, 0, 1)
    }])
    .filter(([characterId]) => characterId));
}

function normalizeOverrides(source = {}) {
  const values = source?.values && typeof source.values === "object" ? source.values : source;
  const enabled = source?.enabled && typeof source.enabled === "object" ? source.enabled : {};
  return {
    enabled: Object.fromEntries(STORYBOARD_OVERRIDE_FIELDS.map((field) => [field, enabled[field] === true])),
    values: {
      model: text(values.model),
      width: integer(values.width, 832, 64, 2048),
      height: integer(values.height, 1216, 64, 2048),
      steps: integer(values.steps, 28, 1, 50),
      scale: finite(values.scale, 6, 0, 20),
      sampler: text(values.sampler) || "k_euler_ancestral",
      noiseSchedule: text(values.noiseSchedule) || "karras",
      varietyPlus: values.varietyPlus !== false,
      cfgRescale: finite(values.cfgRescale, 0, 0, 1),
      seed: integer(values.seed, -1, -1, 0xffffffff)
    }
  };
}

function normalizeNode(source = {}, index = 0) {
  const type = ["start", "character", "scene"].includes(source.type) ? source.type : "scene";
  const nodeId = text(source.id) || id(type);
  const position = normalizePosition(source.position || source, { x: 100 + index * 80, y: 120 + index * 50 });
  if (type === "start") {
    return { id: nodeId, type, name: "開始", position };
  }
  if (type === "character") {
    return {
      id: nodeId,
      type,
      name: text(source.name) || `角色 ${index + 1}`,
      prompt: text(source.prompt),
      negativePrompt: text(source.negativePrompt),
      position
    };
  }
  return {
    id: nodeId,
    type,
    name: text(source.name) || `場景 ${index + 1}`,
    prompt: text(source.prompt),
    imageCount: integer(source.imageCount, 1, 1, 100),
    overrides: normalizeOverrides(source.overrides),
    characterSettings: normalizeCharacterSettings(source.characterSettings),
    position
  };
}

function inferEdgeType(sourceNode, targetNode) {
  if (sourceNode?.type === "character" && targetNode?.type === "scene") {
    return "character_scene";
  }
  return "scene_flow";
}

function normalizeEdges(value, nodeMap) {
  const edges = (Array.isArray(value) ? value : []).map((source, index) => {
    const from = text(source.source || source.from);
    const to = text(source.target || source.to);
    const type = ["character_scene", "scene_flow", "scene_loop"].includes(source.type)
      ? source.type
      : inferEdgeType(nodeMap.get(from), nodeMap.get(to));
    const isSceneFlow = type === "scene_flow" && nodeMap.get(from)?.type === "scene" && nodeMap.get(to)?.type === "scene";
    return {
      id: text(source.id) || id("edge"),
      type,
      source: from,
      target: to,
      order: integer(source.order, index, 0, 100000),
      ...(isSceneFlow ? { returnCount: integer(source.returnCount ?? source.return_count, 0, 0, 20) } : {}),
      ...(type === "scene_loop" ? { repeatCount: integer(source.repeatCount, 2, 2, 21) } : {})
    };
  });
  edges.filter((edge) => edge.type === "scene_loop").forEach((legacyLoop) => {
    const pairedFlow = edges.find((edge) => edge.type === "scene_flow" && edge.source === legacyLoop.target && edge.target === legacyLoop.source);
    if (pairedFlow) pairedFlow.returnCount = Math.max(pairedFlow.returnCount || 0, legacyLoop.repeatCount - 1);
  });
  return edges.filter((edge) => edge.type !== "scene_loop");
}

export function defaultStoryboardSettings(source = {}) {
  const settings = source && typeof source === "object" ? clone(source) : {};
  return {
    model: text(settings.model) || "nai-diffusion-4-5-full",
    prompt: text(settings.prompt || settings.promptTemplate),
    promptTemplate: text(settings.promptTemplate || settings.prompt),
    fixedPromptSnippets: Array.isArray(settings.fixedPromptSnippets) ? clone(settings.fixedPromptSnippets, []) : [],
    randomPromptSnippets: Array.isArray(settings.randomPromptSnippets) ? clone(settings.randomPromptSnippets, []) : [],
    negativePrompt: text(settings.negativePrompt),
    characterPositionMode: settings.characterPositionMode === "manual" ? "manual" : "auto",
    width: integer(settings.width, 832, 64, 2048),
    height: integer(settings.height, 1216, 64, 2048),
    steps: integer(settings.steps, 28, 1, 50),
    samples: 1,
    scale: finite(settings.scale, 6, 0, 20),
    varietyPlus: settings.varietyPlus !== false,
    cfgRescale: finite(settings.cfgRescale, 0, 0, 1),
    seed: integer(settings.seed, -1, -1, 0xffffffff),
    sampler: text(settings.sampler) || "k_euler_ancestral",
    noiseSchedule: text(settings.noiseSchedule) || "karras",
    imageFormat: "png",
    qualityToggle: settings.qualityToggle !== false,
    baseImage: text(settings.baseImage),
    strength: finite(settings.strength, 0.7, 0, 1),
    noise: finite(settings.noise, 0, 0, 1),
    vibeTransfer: clone(settings.vibeTransfer || { enabled: true, images: [] }),
    preciseReference: clone(settings.preciseReference || { enabled: true, images: [] })
  };
}

export function createStoryboard(source = {}) {
  const startId = id("start");
  const sceneId = id("scene");
  const now = new Date().toISOString();
  return normalizeStoryboard({
    id: source.id || id("storyboard"),
    name: source.name || "新 Storyboard",
    description: source.description || "",
    includeMetadata: source.includeMetadata !== false,
    globalSettings: defaultStoryboardSettings(source.globalSettings),
    nodes: [
      { id: startId, type: "start", position: { x: 30, y: 80 } },
      { id: sceneId, type: "scene", name: "場景 1", position: { x: 300, y: 80 } }
    ],
    edges: [{ id: id("edge"), type: "scene_flow", source: startId, target: sceneId, order: 0 }],
    createdAt: now,
    updatedAt: now
  });
}

export function normalizeStoryboard(value = {}, options = {}) {
  const source = value?.storyboard && typeof value.storyboard === "object" ? value.storyboard : value;
  const rawNodes = Array.isArray(source.nodes) ? source.nodes : [];
  let nodes = rawNodes.map(normalizeNode);
  const starts = nodes.filter((node) => node.type === "start");
  if (starts.length === 0) {
    nodes.unshift(normalizeNode({ id: id("start"), type: "start", position: { x: 30, y: 80 } }));
  } else if (starts.length > 1) {
    const keepId = starts[0].id;
    nodes = nodes.filter((node) => node.type !== "start" || node.id === keepId);
  }
  const seen = new Set();
  nodes = nodes.map((node) => {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      return node;
    }
    const nextId = id(node.type);
    seen.add(nextId);
    return { ...node, id: nextId };
  });
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const now = new Date().toISOString();
  return {
    spec: STORYBOARD_SPEC,
    version: STORYBOARD_VERSION,
    id: options.newId === true ? id("storyboard") : text(source.id) || id("storyboard"),
    name: text(source.name) || "未命名 Storyboard",
    description: text(source.description || source.intro),
    includeMetadata: source.includeMetadata !== false,
    globalSettings: defaultStoryboardSettings(source.globalSettings),
    nodes,
    edges: normalizeEdges(source.edges, nodeMap),
    createdAt: options.newId === true ? now : text(source.createdAt) || now,
    updatedAt: options.touch === true ? now : text(source.updatedAt) || now
  };
}

function edgeKey(edge) {
  return `${edge.source}\0${edge.target}`;
}

export function validateStoryboard(storyboard, options = {}) {
  const normalized = normalizeStoryboard(storyboard);
  const nodeMap = new Map(normalized.nodes.map((node) => [node.id, node]));
  const errors = [];
  const warnings = [];
  const seenEdges = new Set();
  normalized.edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) {
      errors.push(`連線 ${edge.id} 指向不存在的節點。`);
      return;
    }
    const valid = (edge.type === "scene_flow" && ["start", "scene"].includes(source.type) && target.type === "scene") ||
      (edge.type === "character_scene" && source.type === "character" && target.type === "scene");
    if (!valid) {
      errors.push(`不支援 ${source.type} → ${target.type} 連線。`);
    }
    const key = edgeKey(edge);
    if (seenEdges.has(key)) {
      errors.push(`節點「${source.name}」與「${target.name}」之間有重複連線。`);
    }
    seenEdges.add(key);
  });
  const sceneEdges = normalized.edges.filter((edge) => {
    const source = nodeMap.get(edge.source);
    return edge.type === "scene_flow" && (source?.type === "start" || source?.type === "scene") && nodeMap.get(edge.target)?.type === "scene";
  });
  const outgoing = new Map();
  sceneEdges.forEach((edge) => outgoing.set(edge.source, [...(outgoing.get(edge.source) || []), edge.target]));
  const visiting = new Set();
  const visited = new Set();
  const visitCycle = (nodeId) => {
    if (visiting.has(nodeId)) {
      return true;
    }
    if (visited.has(nodeId)) {
      return false;
    }
    visiting.add(nodeId);
    const cyclic = (outgoing.get(nodeId) || []).some(visitCycle);
    visiting.delete(nodeId);
    visited.add(nodeId);
    return cyclic;
  };
  const start = normalized.nodes.find((node) => node.type === "start");
  const hasCycle = [start, ...normalized.nodes.filter((node) => node.type === "scene")]
    .filter(Boolean)
    .some((node) => visitCycle(node.id));
  if (hasCycle) {
    errors.push("場景流程不可形成循環。");
  }
  const loopScenes = new Set();
  sceneEdges.filter((edge) => edge.returnCount > 0).forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (source?.type !== "scene" || target?.type !== "scene") return;
    const sourceOutgoing = sceneEdges.filter((item) => item.source === source.id);
    if (sourceOutgoing.length !== 1 || sourceOutgoing[0]?.target !== target.id) {
      errors.push(`往返起點「${source.name}」只能有「${target.name}」一個普通後續場景。`);
    }
    const targetIncoming = sceneEdges.filter((item) => item.target === target.id);
    if (targetIncoming.length !== 1 || targetIncoming[0]?.source !== source.id) {
      errors.push(`往返終點「${target.name}」只能由「${source.name}」普通連入。`);
    }
    if (loopScenes.has(source.id) || loopScenes.has(target.id)) {
      errors.push(`場景「${source.name}」或「${target.name}」已屬於另一組往返。`);
    }
    loopScenes.add(source.id);
    loopScenes.add(target.id);
  });
  const reachable = new Set();
  const markReachable = (nodeId) => {
    for (const target of outgoing.get(nodeId) || []) {
      if (!reachable.has(target)) {
        reachable.add(target);
        markReachable(target);
      }
    }
  };
  if (start) {
    markReachable(start.id);
  }
  const scenes = normalized.nodes.filter((node) => node.type === "scene");
  const unreachable = scenes.filter((node) => !reachable.has(node.id));
  if (unreachable.length) {
    warnings.push(`不會執行的場景：${unreachable.map((node) => node.name).join("、")}`);
  }
  if (options.forExecution === true && reachable.size === 0) {
    errors.push("開始節點必須至少連到一個場景。");
  }
  return { storyboard: normalized, errors, warnings, reachableSceneIds: [...reachable] };
}

function sortedEdges(edges = []) {
  return [...edges].sort((left, right) => left.order - right.order || left.id.localeCompare(right.id));
}

export function getStoryboardSceneOrder(storyboard) {
  const validation = validateStoryboard(storyboard, { forExecution: true });
  if (validation.errors.length) {
    throw new Error(validation.errors[0]);
  }
  const normalized = validation.storyboard;
  const nodeMap = new Map(normalized.nodes.map((node) => [node.id, node]));
  const start = normalized.nodes.find((node) => node.type === "start");
  const flowEdges = normalized.edges.filter((edge) => {
    const source = nodeMap.get(edge.source);
    return edge.type === "scene_flow" && (source?.type === "start" || source?.type === "scene") && nodeMap.get(edge.target)?.type === "scene";
  });
  const outgoing = new Map();
  const incoming = new Map();
  flowEdges.forEach((edge) => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) || []), edge]);
    if (nodeMap.get(edge.source)?.type === "scene") {
      incoming.set(edge.target, [...(incoming.get(edge.target) || []), edge.source]);
    }
  });
  const reachable = new Set(validation.reachableSceneIds);
  const visited = new Set();
  const order = [];
  const pending = new Set();
  const visit = (sceneId) => {
    if (visited.has(sceneId) || !reachable.has(sceneId)) {
      return;
    }
    const parents = (incoming.get(sceneId) || []).filter((parentId) => reachable.has(parentId));
    if (parents.some((parentId) => !visited.has(parentId))) {
      pending.add(sceneId);
      return;
    }
    pending.delete(sceneId);
    visited.add(sceneId);
    order.push(sceneId);
    sortedEdges(outgoing.get(sceneId)).forEach((edge) => visit(edge.target));
  };
  sortedEdges(outgoing.get(start.id)).forEach((edge) => visit(edge.target));
  let progressed = true;
  while (pending.size && progressed) {
    const before = visited.size;
    [...pending].forEach(visit);
    progressed = visited.size > before;
  }
  if (visited.size !== reachable.size) {
    throw new Error("無法建立完整場景執行順序。");
  }
  return order;
}

export function getStoryboardCharacterCandidates(storyboard, sceneOrder = getStoryboardSceneOrder(storyboard)) {
  const normalized = normalizeStoryboard(storyboard);
  const nodeMap = new Map(normalized.nodes.map((node) => [node.id, node]));
  const parents = new Map();
  const direct = new Map();
  normalized.edges.forEach((edge) => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (edge.type === "scene_flow" && source?.type === "scene" && target?.type === "scene") {
      parents.set(target.id, [...(parents.get(target.id) || []), source.id]);
    }
    if (edge.type === "character_scene" && source?.type === "character" && target?.type === "scene") {
      direct.set(target.id, [...(direct.get(target.id) || []), source.id]);
    }
  });
  const result = new Map();
  sceneOrder.forEach((sceneId) => {
    const candidates = new Set(direct.get(sceneId) || []);
    (parents.get(sceneId) || []).forEach((parentId) => {
      for (const characterId of result.get(parentId) || []) {
        candidates.add(characterId);
      }
    });
    result.set(sceneId, [...candidates]);
  });
  return result;
}

function normalizePromptItems(value = "") {
  const values = Array.isArray(value) ? value : String(value || "").split(/\r?\n/u);
  return values.flatMap((item) => String(item || "").split(/\r?\n/u)).map((item) => item.trim()).filter(Boolean);
}

function randomInt(min, max, random = Math.random) {
  const low = Math.ceil(Math.min(min, max));
  const high = Math.floor(Math.max(min, max));
  return low + Math.floor(random() * (high - low + 1));
}

function shuffled(items = [], random = Math.random) {
  const output = [...items];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [output[index], output[swap]] = [output[swap], output[index]];
  }
  return output;
}

function randomNumber(min, max, random = Math.random) {
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  return low + random() * (high - low);
}

function weightedPromptItem(value = "", snippet = {}, random = Math.random) {
  let output = String(value || "").trim();
  if (!output) return "";
  const squareMax = integer(snippet.squareMax, 0, 0, 12);
  const curlyMax = integer(snippet.curlyMax, 0, 0, 12);
  const weightMin = finite(snippet.weightMin, 0, 0, 5);
  const weightMax = finite(snippet.weightMax, weightMin, weightMin, 5);
  const types = [
    ...(snippet.squareEnabled === true && squareMax > 0 ? ["square"] : []),
    ...(snippet.curlyEnabled === true && curlyMax > 0 ? ["curly"] : []),
    ...(snippet.weightEnabled === true && weightMax > 0 ? ["numeric"] : [])
  ];
  if (!types.length) return output;
  const type = types[randomInt(0, types.length - 1, random)];
  if (type === "square") {
    const count = randomInt(1, squareMax, random);
    return `${"[".repeat(count)}${output}${"]".repeat(count)}`;
  }
  if (type === "curly") {
    const count = randomInt(1, curlyMax, random);
    return `${"{".repeat(count)}${output}${"}".repeat(count)}`;
  }
  const bias = finite(snippet.weightBias, (weightMin + weightMax) / 2, weightMin, weightMax);
  const focusedMin = Math.max(weightMin, bias - 1);
  const focusedMax = Math.min(weightMax, bias + 1);
  const useFullRange = random() < 0.18 || focusedMax <= focusedMin;
  const weight = randomNumber(useFullRange ? weightMin : focusedMin, useFullRange ? weightMax : focusedMax, random);
  const formatted = (Math.round(weight * 10) / 10).toFixed(1);
  return `${formatted}::${/\d$/u.test(output) ? `${output} ` : output}::`;
}

export function expandStoryboardPrompt(template = "", fixedSnippets = [], randomSnippets = [], random = Math.random) {
  const fixed = new Map((Array.isArray(fixedSnippets) ? fixedSnippets : []).map((item) => [text(item?.name), cleanPrompt(item?.prompt)]));
  const randomMap = new Map((Array.isArray(randomSnippets) ? randomSnippets : []).map((item) => [text(item?.name), item]));
  const expand = (placeholder, rawName) => {
    const name = text(rawName);
    if (fixed.has(name) && randomMap.has(name)) {
      throw new Error(`Prompt 片段名字重複：${name}`);
    }
    if (fixed.has(name)) {
      return fixed.get(name);
    }
    const snippet = randomMap.get(name);
    if (!snippet) {
      throw new Error(`Prompt 找不到片段：${name}`);
    }
    const items = normalizePromptItems(snippet.randomItems || snippet.randomText || snippet.choices);
    const min = integer(snippet.min, 1, 0, items.length);
    const max = integer(snippet.max, Math.max(1, min), min, items.length);
    return shuffled(items, random)
      .slice(0, randomInt(min, max, random))
      .map((item) => weightedPromptItem(item, snippet, random))
      .join(",");
  };
  let expanded = String(template || "").replace(/\|\|\s*([^|]+?)\s*\|\|/gu, expand);
  expanded = expanded.replace(/\{\{\s*([^}]+?)\s*\}\}/gu, (placeholder, name) => randomMap.has(text(name)) ? expand(placeholder, name) : placeholder);
  return cleanPrompt(expanded);
}

export function composeStoryboardSceneSettings(storyboard, sceneId, options = {}) {
  const normalized = normalizeStoryboard(storyboard);
  const nodeMap = new Map(normalized.nodes.map((node) => [node.id, node]));
  const scene = nodeMap.get(sceneId);
  if (!scene || scene.type !== "scene") {
    throw new Error("場景不存在。");
  }
  const order = options.sceneOrder || getStoryboardSceneOrder(normalized);
  const candidates = options.candidates || getStoryboardCharacterCandidates(normalized, order);
  const settings = defaultStoryboardSettings(normalized.globalSettings);
  STORYBOARD_OVERRIDE_FIELDS.forEach((field) => {
    if (scene.overrides.enabled[field] === true) {
      settings[field] = scene.overrides.values[field];
    }
  });
  settings.samples = 1;
  settings.imageFormat = "png";
  const promptTemplate = joinPrompts(settings.promptTemplate || settings.prompt, scene.prompt);
  const finalPrompt = expandStoryboardPrompt(
    promptTemplate,
    settings.fixedPromptSnippets,
    settings.randomPromptSnippets,
    options.random
  );
  settings.promptTemplate = promptTemplate;
  settings.prompt = finalPrompt;
  settings.characters = (candidates.get(sceneId) || []).map((characterId) => {
    const character = nodeMap.get(characterId);
    const relation = scene.characterSettings[characterId];
    if (!character || character.type !== "character" || relation?.enabled !== true) {
      return null;
    }
    return {
      id: character.id,
      name: character.name,
      prompt: joinPrompts(character.prompt, relation.actionPrompt),
      negativePrompt: character.negativePrompt,
      enabled: true,
      x: finite(relation.x, 0.5, 0, 1),
      y: finite(relation.y, 0.5, 0, 1)
    };
  }).filter(Boolean);
  return settings;
}

export function sanitizeStoryboardFileName(value = "storyboard") {
  return text(value || "storyboard")
    .replace(/[\\/:*?"<>|]+/gu, "_")
    .replace(/\s+/gu, "_")
    .slice(0, 80) || "storyboard";
}

export function buildStoryboardExecutionPlan(storyboard, options = {}) {
  const normalized = normalizeStoryboard(storyboard);
  const sceneOrder = getStoryboardSceneOrder(normalized);
  const completedCounts = options.completedCounts && typeof options.completedCounts === "object" ? options.completedCounts : {};
  const remainingLegacyCounts = Object.fromEntries(Object.entries(completedCounts).map(([sceneId, count]) => [sceneId, integer(count, 0, 0, 1000000)]));
  const completedTaskKeys = new Set(Array.isArray(options.completedTaskKeys) ? options.completedTaskKeys.map(text).filter(Boolean) : []);
  const existingOutputCount = integer(options.existingOutputCount, 0, 0, 1000000);
  let outputIndex = existingOutputCount;
  const plan = [];
  const loopsByFirstScene = new Map(normalized.edges
    .filter((edge) => edge.type === "scene_flow" && edge.returnCount > 0)
    .map((edge) => [edge.source, edge]));
  const loopSecondScenes = new Set([...loopsByFirstScene.values()].map((edge) => edge.target));
  const visits = [];
  sceneOrder.forEach((sceneId) => {
    if (loopSecondScenes.has(sceneId)) return;
    const loop = loopsByFirstScene.get(sceneId);
    if (!loop) {
      visits.push({ sceneId, roundIndex: 1, roundCount: 1 });
      return;
    }
    const roundCount = loop.returnCount + 1;
    for (let roundIndex = 1; roundIndex <= roundCount; roundIndex += 1) {
      visits.push({ sceneId, roundIndex, roundCount });
      visits.push({ sceneId: loop.target, roundIndex, roundCount });
    }
  });
  visits.forEach(({ sceneId, roundIndex, roundCount }) => {
    const scene = normalized.nodes.find((node) => node.id === sceneId);
    for (let sceneImageIndex = 1; sceneImageIndex <= scene.imageCount; sceneImageIndex += 1) {
      const taskKey = `${sceneId}:round:${roundIndex}:image:${sceneImageIndex}`;
      if (completedTaskKeys.has(taskKey)) continue;
      if ((remainingLegacyCounts[sceneId] || 0) > 0) {
        remainingLegacyCounts[sceneId] -= 1;
        continue;
      }
      outputIndex += 1;
      plan.push({
        taskKey,
        sceneId,
        sceneName: scene.name,
        sceneImageIndex,
        roundIndex,
        roundCount,
        outputIndex,
        fileName: `${sanitizeStoryboardFileName(normalized.name)}_${outputIndex}.png`
      });
    }
  });
  return { storyboard: normalized, sceneOrder, visits, plan };
}

export function storyboardSummary(storyboard) {
  const normalized = normalizeStoryboard(storyboard);
  return {
    id: normalized.id,
    name: normalized.name,
    description: normalized.description,
    includeMetadata: normalized.includeMetadata,
    nodeCount: normalized.nodes.length,
    sceneCount: normalized.nodes.filter((node) => node.type === "scene").length,
    updatedAt: normalized.updatedAt
  };
}
