import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  buildResetTimeTrackingProgress,
  mergeActiveRoleRuntimeState,
  mergeTimeTrackingProgress
} from "../src/narrative-state.js";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const webHtml = fs.readFileSync(new URL("../src/public/index.html", import.meta.url), "utf8");

function functionSource(name, nextName) {
  const start = serverSource.indexOf(`function ${name}(`);
  const end = serverSource.indexOf(`\nfunction ${nextName}(`, start);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return serverSource.slice(start, end);
}

test("replaying an older turn restores time progress but keeps current time settings", () => {
  const current = {
    enabled: false,
    currentDayNumber: 9,
    currentPeriod: "evening",
    currentYear: 2026,
    currentMonth: 8,
    currentDate: 29,
    startPoint: {
      currentDayNumber: 4,
      currentPeriod: "morning",
      currentYear: 2026,
      currentMonth: 1,
      currentDate: 2
    },
    autoPeriod: { enabled: true, roundsPerPeriod: 12, turnsSinceChange: 7 },
    config: { periodAdvanceWords: ["時間流逝"], nextDayWords: ["隔天"] },
    pendingTransition: null,
    updatedAt: "current"
  };
  const historical = {
    enabled: true,
    currentDayNumber: 3,
    currentPeriod: "noon",
    currentYear: 2025,
    currentMonth: 2,
    currentDate: 4,
    startPoint: null,
    autoPeriod: { enabled: false, roundsPerPeriod: 3, turnsSinceChange: 2 },
    config: { periodAdvanceWords: [], nextDayWords: ["明天"] },
    pendingTransition: { source: "auto", currentPeriod: "evening" },
    updatedAt: "historical"
  };

  const restored = mergeTimeTrackingProgress(current, historical, "restored");

  assert.equal(restored.currentDayNumber, 3);
  assert.equal(restored.currentPeriod, "noon");
  assert.deepEqual(restored.pendingTransition, historical.pendingTransition);
  assert.equal(restored.enabled, false);
  assert.deepEqual(restored.startPoint, current.startPoint);
  assert.deepEqual(restored.config, current.config);
  assert.deepEqual(restored.autoPeriod, {
    enabled: true,
    roundsPerPeriod: 12,
    turnsSinceChange: 2
  });
  assert.equal(restored.updatedAt, "restored");
});

test("new conversations reset to the configured global time starting point", () => {
  const startPoint = {
    currentDayNumber: 12,
    currentPeriod: "evening",
    currentYear: 2030,
    currentMonth: 6,
    currentDate: 18
  };
  const reset = buildResetTimeTrackingProgress({
    currentDayNumber: 1,
    currentPeriod: "morning",
    currentYear: 2026,
    currentMonth: 3,
    currentDate: 9,
    autoPeriod: { enabled: false, roundsPerPeriod: 3, turnsSinceChange: 0 },
    config: {}
  }, {
    enabled: true,
    currentDayNumber: 30,
    currentPeriod: "noon",
    currentYear: 2040,
    currentMonth: 8,
    currentDate: 20,
    startPoint,
    autoPeriod: { enabled: true, roundsPerPeriod: 8, turnsSinceChange: 6 },
    config: { periodAdvanceWords: ["時間流逝"] },
    pendingTransition: { source: "auto" }
  }, "reset");

  assert.equal(reset.currentDayNumber, 12);
  assert.equal(reset.currentPeriod, "evening");
  assert.equal(reset.currentYear, 2030);
  assert.equal(reset.currentMonth, 6);
  assert.equal(reset.currentDate, 18);
  assert.deepEqual(reset.startPoint, startPoint);
  assert.deepEqual(reset.autoPeriod, { enabled: true, roundsPerPeriod: 8, turnsSinceChange: 0 });
  assert.equal(reset.pendingTransition, null);
  assert.equal(reset.updatedAt, "reset");
});

test("the time editor saves and clears a global starting point explicitly", () => {
  assert.match(webHtml, /id="setTimeTrackingStartPointBtn"/);
  assert.match(webHtml, /id="clearTimeTrackingStartPointBtn"/);
  assert.match(webSource, /startPoint: timeTrackingStartPointDraft/);
  assert.match(webSource, /timeTrackingStartPointDraft = getTimeTrackingPointFromEditor\(\)/);
  assert.match(webSource, /timeTrackingStartPointDraft = null/);
  const resetSource = functionSource("resetTimeTrackingProgress", "resetConversationProgress");
  assert.match(resetSource, /buildResetTimeTrackingProgress/);
});

test("assistant conversations never reset or restore time tracking", () => {
  const startAssistantSource = functionSource("startAssistantCard", "appendAssistantOpeningMessage");
  const deleteAssistantSource = functionSource("deleteAssistantCard", "normalizePlainText");
  const captureSource = functionSource("captureNarrativeCheckpoint", "applyNarrativeCheckpoint");
  const applySource = functionSource("applyNarrativeCheckpoint", "getMessageStateBeforeTurnSnapshot");
  const savedLoaderSource = functionSource("applySavedConversationSnapshot", "ensureSavedSessionsDir");
  const discordStartSource = functionSource("startSessionFromDiscord", "buildDiscordStatusText");
  assert.match(startAssistantSource, /resetTimeTracking: false/);
  assert.match(deleteAssistantSource, /resetTimeTracking: false/);
  assert.match(captureSource, /activeAssistantMode \? \{\} : \{ timeTracking:/);
  assert.match(applySource, /if \(!currentState\.activeAssistantMode\)/);
  assert.match(savedLoaderSource, /if \(!currentState\.activeAssistantMode\)/);
  assert.match(discordStartSource, /resetTimeTracking: !hasActiveAssistantTarget\(state\)/);
});

test("a legacy checkpoint without time state does not reset current progress or settings", () => {
  const current = {
    currentDayNumber: 6,
    currentPeriod: "morning",
    config: { periodAdvanceWords: ["下一段"] }
  };
  assert.deepEqual(mergeTimeTrackingProgress(current, null, "unused"), current);
});

test("restoring one role keeps runtime state belonging to other role cards", () => {
  const current = {
    roleA: { summary: "new A" },
    roleB: { summary: "keep B" }
  };
  const historical = {
    roleA: { summary: "old A" }
  };

  assert.deepEqual(mergeActiveRoleRuntimeState(current, historical, "roleA"), {
    roleA: { summary: "old A" },
    roleB: { summary: "keep B" }
  });
});

test("narrative checkpoints no longer capture or restore current conversation settings", () => {
  const captureSource = functionSource("captureNarrativeCheckpoint", "applyNarrativeCheckpoint");
  const applySource = functionSource("applyNarrativeCheckpoint", "getMessageStateBeforeTurnSnapshot");
  assert.doesNotMatch(captureSource, /conversationSettings/);
  assert.doesNotMatch(applySource, /currentState\.conversationSettings\s*=/);
  assert.match(applySource, /mergeTimeTrackingProgress/);
  assert.match(applySource, /mergeActiveRoleRuntimeState/);
});
