import test from "node:test";
import assert from "node:assert/strict";
import {
  buildStoryboardExecutionPlan,
  composeStoryboardSceneSettings,
  createStoryboard,
  getStoryboardCharacterCandidates,
  getStoryboardSceneOrder,
  normalizeStoryboard,
  validateStoryboard,
  expandStoryboardPrompt
} from "../src/novelai-storyboard.js";

function fixture() {
  return normalizeStoryboard({
    id: "story_1",
    name: "測試 故事",
    includeMetadata: true,
    globalSettings: {
      prompt: "masterpiece",
      promptTemplate: "masterpiece",
      negativePrompt: "bad anatomy",
      width: 832,
      height: 1216,
      fixedPromptSnippets: [{ name: "style", prompt: "anime style" }]
    },
    nodes: [
      { id: "start", type: "start", position: { x: 0, y: 0 } },
      { id: "root", type: "scene", name: "開場", prompt: "||style||, classroom", imageCount: 1 },
      { id: "a", type: "scene", name: "分支 A", prompt: "sunset", imageCount: 2, characterSettings: { alice: { enabled: true, actionPrompt: "running", x: 0.2, y: 0.5 } } },
      { id: "b", type: "scene", name: "分支 B", prompt: "rain", imageCount: 1 },
      { id: "join", type: "scene", name: "匯合", prompt: "station", imageCount: 1, characterSettings: { alice: { enabled: true, actionPrompt: "waiting", x: 0.7, y: 0.5 } } },
      { id: "alice", type: "character", name: "Alice", prompt: "1girl, red hair", negativePrompt: "green hair" }
    ],
    edges: [
      { id: "e1", source: "start", target: "root", order: 0 },
      { id: "e2", source: "root", target: "a", order: 0 },
      { id: "e3", source: "root", target: "b", order: 1 },
      { id: "e4", source: "a", target: "join", order: 0 },
      { id: "e5", source: "b", target: "join", order: 0 },
      { id: "e6", source: "alice", target: "root", order: 0 }
    ]
  });
}

function loopFixture({ firstCount = 1, secondCount = 1, returnCount = 1 } = {}) {
  return normalizeStoryboard({
    id: "story_loop",
    name: "往返測試",
    nodes: [
      { id: "start", type: "start" },
      { id: "two", type: "scene", name: "場景 2", imageCount: firstCount },
      { id: "three", type: "scene", name: "場景 3", imageCount: secondCount },
      { id: "four", type: "scene", name: "場景 4", imageCount: 1 }
    ],
    edges: [
      { id: "start_two", type: "scene_flow", source: "start", target: "two", order: 0 },
      { id: "two_three", type: "scene_flow", source: "two", target: "three", returnCount, order: 0 },
      { id: "three_four", type: "scene_flow", source: "three", target: "four", order: 0 }
    ]
  });
}

test("new storyboard contains a fixed start and scene 1", () => {
  const storyboard = createStoryboard({ name: "New", description: "A short introduction" });
  assert.equal(storyboard.nodes.filter((node) => node.type === "start").length, 1);
  assert.equal(storyboard.nodes.filter((node) => node.type === "scene").length, 1);
  assert.equal(storyboard.edges.length, 1);
  assert.equal(storyboard.description, "A short introduction");
});

test("scene order runs ordered branches and waits before merge", () => {
  assert.deepEqual(getStoryboardSceneOrder(fixture()), ["root", "a", "b", "join"]);
});

test("characters remain candidates downstream and are enabled per scene", () => {
  const storyboard = fixture();
  const order = getStoryboardSceneOrder(storyboard);
  const candidates = getStoryboardCharacterCandidates(storyboard, order);
  assert.deepEqual(candidates.get("join"), ["alice"]);
  assert.equal(composeStoryboardSceneSettings(storyboard, "b", { sceneOrder: order, candidates }).characters.length, 0);
  const settings = composeStoryboardSceneSettings(storyboard, "join", { sceneOrder: order, candidates });
  assert.equal(settings.characters[0].prompt, "1girl,red hair,waiting");
  assert.equal(settings.characters[0].x, 0.7);
});

test("character position mode defaults to auto and preserves manual mode", () => {
  assert.equal(composeStoryboardSceneSettings(fixture(), "root").characterPositionMode, "auto");
  const storyboard = fixture();
  storyboard.globalSettings.characterPositionMode = "manual";
  assert.equal(composeStoryboardSceneSettings(storyboard, "root").characterPositionMode, "manual");
});

test("global and scene prompts are merged and fixed snippets expand", () => {
  const settings = composeStoryboardSceneSettings(fixture(), "root");
  assert.equal(settings.prompt, "masterpiece,anime style,classroom");
  assert.equal(settings.negativePrompt, "bad anatomy");
});

test("execution plan numbers all images globally and can resume", () => {
  const first = buildStoryboardExecutionPlan(fixture());
  assert.equal(first.plan.length, 5);
  assert.deepEqual(first.plan.map((item) => item.fileName), [
    "測試_故事_1.png",
    "測試_故事_2.png",
    "測試_故事_3.png",
    "測試_故事_4.png",
    "測試_故事_5.png"
  ]);
  const resumed = buildStoryboardExecutionPlan(fixture(), {
    completedCounts: { root: 1, a: 1 },
    existingOutputCount: 2
  });
  assert.equal(resumed.plan[0].sceneId, "a");
  assert.equal(resumed.plan[0].fileName, "測試_故事_3.png");
});

test("two-scene loop repeats both scenes and continues downstream", () => {
  const execution = buildStoryboardExecutionPlan(loopFixture());
  assert.deepEqual(execution.visits.map((visit) => `${visit.sceneId}:${visit.roundIndex}`), [
    "two:1", "three:1", "two:2", "three:2", "four:1"
  ]);
  assert.deepEqual(execution.plan.map((item) => item.sceneId), ["two", "three", "two", "three", "four"]);
  assert.equal(execution.plan[2].taskKey, "two:round:2:image:1");
  assert.equal(execution.plan[2].roundCount, 2);
});

test("zero return count runs the scene line once", () => {
  const execution = buildStoryboardExecutionPlan(loopFixture({ returnCount: 0 }));
  assert.deepEqual(execution.visits.map((visit) => visit.sceneId), ["two", "three", "four"]);
  assert.ok(execution.visits.every((visit) => visit.roundCount === 1));
});

test("loop runs each scene image count again on every round", () => {
  const execution = buildStoryboardExecutionPlan(loopFixture({ firstCount: 2, secondCount: 1 }));
  assert.deepEqual(execution.plan.map((item) => `${item.sceneId}:${item.roundIndex}:${item.sceneImageIndex}`), [
    "two:1:1", "two:1:2", "three:1:1",
    "two:2:1", "two:2:2", "three:2:1",
    "four:1:1"
  ]);
});

test("loop resume skips stable task keys and keeps output numbering", () => {
  const execution = buildStoryboardExecutionPlan(loopFixture(), {
    completedTaskKeys: ["two:round:1:image:1", "three:round:1:image:1"],
    existingOutputCount: 2
  });
  assert.equal(execution.plan[0].taskKey, "two:round:2:image:1");
  assert.equal(execution.plan[0].fileName, "往返測試_3.png");
});

test("loop validation rejects branching and overlapping loops", () => {
  const branching = loopFixture();
  branching.edges.push({ id: "two_four", type: "scene_flow", source: "two", target: "four", returnCount: 0, order: 1 });
  assert.ok(validateStoryboard(branching).errors.some((message) => message.includes("一個普通後續場景")));

  const overlapping = loopFixture();
  overlapping.edges.find((edge) => edge.id === "three_four").returnCount = 1;
  assert.ok(validateStoryboard(overlapping).errors.some((message) => message.includes("另一組往返")));
});

test("return count is clamped to 0 through 20", () => {
  assert.equal(loopFixture({ returnCount: -1 }).edges.find((edge) => edge.id === "two_three").returnCount, 0);
  assert.equal(loopFixture({ returnCount: 99 }).edges.find((edge) => edge.id === "two_three").returnCount, 20);
});

test("legacy reverse loop edge migrates to the normal scene line", () => {
  const storyboard = loopFixture({ returnCount: 0 });
  storyboard.edges.push({ id: "three_two", type: "scene_loop", source: "three", target: "two", repeatCount: 2, order: 0 });
  const migrated = normalizeStoryboard(storyboard);
  assert.equal(migrated.edges.some((edge) => edge.type === "scene_loop"), false);
  assert.equal(migrated.edges.find((edge) => edge.id === "two_three").returnCount, 1);
});

test("invalid links and cycles are rejected", () => {
  const storyboard = fixture();
  storyboard.edges.push({ id: "cycle", source: "join", target: "root", order: 0, type: "scene_flow" });
  const result = validateStoryboard(storyboard, { forExecution: true });
  assert.ok(result.errors.some((message) => message.includes("循環")));
});

test("cycles are rejected even when the scene group is disconnected", () => {
  const storyboard = createStoryboard({ name: "Disconnected" });
  storyboard.nodes.push(
    { id: "loose_a", type: "scene", name: "Loose A", prompt: "", imageCount: 1, position: { x: 0, y: 0 }, overrides: { enabled: {}, values: {} }, characterSettings: {} },
    { id: "loose_b", type: "scene", name: "Loose B", prompt: "", imageCount: 1, position: { x: 0, y: 0 }, overrides: { enabled: {}, values: {} }, characterSettings: {} }
  );
  storyboard.edges.push(
    { id: "loose_1", source: "loose_a", target: "loose_b", order: 0 },
    { id: "loose_2", source: "loose_b", target: "loose_a", order: 0 }
  );
  assert.ok(validateStoryboard(storyboard).errors.some((message) => message.includes("循環")));
});

test("random prompt preserves and applies configured weight controls", () => {
  const prompt = expandStoryboardPrompt("||artist||", [], [{
    name: "artist",
    randomItems: ["artist:one"],
    min: 1,
    max: 1,
    curlyEnabled: true,
    curlyMax: 2
  }], () => 0.99);
  assert.equal(prompt, "{{artist:one}}");
});
