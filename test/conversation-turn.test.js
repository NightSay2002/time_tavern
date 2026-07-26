import test from "node:test";
import assert from "node:assert/strict";

import {
  hasActiveAssistantTarget,
  hasActiveConversationTarget,
  runConversationTurnWorkflow
} from "../src/conversation-turn.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createWorkflowDeps(events = []) {
  return {
    isSessionReady: () => true,
    parseInput: (content) => ({ rawInput: content, modelContent: content, inputKind: "dialogue" }),
    ensureTurnExtra: () => ({}),
    captureCheckpoint: (state) => ({ timeTracking: clone(state.timeTracking) }),
    createMessageRecord: ({ role, content, source, extra }) => ({ role, content, source, ...extra }),
    appendConversationMessage: (message) => events.push({ type: "append", message }),
    resolvePendingTimeTrackingBeforeUserTurn: (state, content) => {
      events.push({ type: "resolve", period: state.timeTracking.currentPeriod });
      if (!state.timeTracking.pendingTransition) {
        return;
      }
      if (content.includes("{保持時間}")) {
        state.timeTracking.pendingTransition = null;
        state.timeTracking.autoPeriod.turnsSinceChange = 0;
        return;
      }
      state.timeTracking.currentPeriod = state.timeTracking.pendingTransition.currentPeriod;
      state.timeTracking.pendingTransition = null;
      state.timeTracking.autoPeriod.turnsSinceChange = 0;
    },
    updateTimeTrackingFromMessage: (state) => {
      events.push({ type: "update-user-time", period: state.timeTracking.currentPeriod });
    },
    resolveRuntimeUserName: () => "tester",
    attachTriggeredLorebooksToUserMessage: (_message, state) => {
      events.push({ type: "prepare-model", period: state.timeTracking.currentPeriod });
    },
    generateAssistant: ({ state }) => {
      events.push({ type: "generate", period: state.timeTracking.currentPeriod });
      return { content: "assistant reply", modelProcessingResult: { skipReasoner: true } };
    },
    shouldEnsureMinimumAssistantLength: () => false,
    finalizeAssistantOutputContent: (content) => ({ content }),
    updateTimeTrackingAfterAssistantTurn: () => ({ autoTimeWarning: "即將切換時間" }),
    saveState: () => events.push({ type: "save" })
  };
}

function createPendingState() {
  return {
    timeTracking: {
      currentPeriod: "morning",
      autoPeriod: { turnsSinceChange: 2 },
      pendingTransition: { currentPeriod: "noon" }
    }
  };
}

test("custom assistants count as active conversation targets", () => {
  const state = {
    aiSessionStarted: true,
    activeRoleCardId: null,
    activeAssistantMode: "assistant_custom_123"
  };

  assert.equal(hasActiveAssistantTarget(state), true);
  assert.equal(hasActiveConversationTarget(state), true);
  assert.equal(hasActiveConversationTarget({ activeAssistantMode: "  " }), false);
});

test("applies a pending time transition before generating the current reply", async () => {
  const events = [];
  const state = createPendingState();
  const result = await runConversationTurnWorkflow(createWorkflowDeps(events), {
    state,
    content: "繼續對話",
    source: "web"
  });

  assert.equal(result.userMessage.stateBeforeTurnSnapshot.timeTracking.currentPeriod, "morning");
  assert.equal(result.userMessage.stateBeforeTurnSnapshot.timeTracking.pendingTransition.currentPeriod, "noon");
  assert.equal(state.timeTracking.currentPeriod, "noon");
  assert.equal(state.timeTracking.pendingTransition, null);
  assert.deepEqual(
    events.filter((event) => ["resolve", "update-user-time", "prepare-model", "generate"].includes(event.type)),
    [
      { type: "resolve", period: "morning" },
      { type: "update-user-time", period: "noon" },
      { type: "prepare-model", period: "noon" },
      { type: "generate", period: "noon" }
    ]
  );
  assert.equal(result.assistantMessage.autoTimeWarning, "即將切換時間");
});

test("keeps the current time when the current user turn contains the keep directive", async () => {
  const events = [];
  const state = createPendingState();
  await runConversationTurnWorkflow(createWorkflowDeps(events), {
    state,
    content: "{保持時間}",
    source: "web",
    keepTimeDirective: true
  });

  assert.equal(state.timeTracking.currentPeriod, "morning");
  assert.equal(state.timeTracking.pendingTransition, null);
  assert.equal(state.timeTracking.autoPeriod.turnsSinceChange, 0);
  assert.equal(events.find((event) => event.type === "generate")?.period, "morning");
});
