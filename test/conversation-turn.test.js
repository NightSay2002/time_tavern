import assert from "node:assert/strict";
import { test } from "node:test";

import { runConversationTurnWorkflow } from "../src/conversation-turn.js";

function createDeps(events, state) {
  let messageNumber = 0;
  return {
    isSessionReady: () => true,
    parseInput: (content) => {
      events.push(`parse:${content}`);
      return { rawInput: content.trim(), modelContent: `model:${content.trim()}`, inputKind: "text" };
    },
    getPendingAssistantFeedbackForNextUser: () => null,
    ensureTurnExtra: (_state, extra) => {
      events.push("turn-extra");
      return { ...extra, assigned: true };
    },
    captureCheckpoint: () => {
      events.push("checkpoint");
      return { conversationLength: state.conversation.length };
    },
    createMessageRecord: ({ role, content, source, extra }) => {
      events.push(`create:${role}`);
      messageNumber += 1;
      return { id: `${role}-${messageNumber}`, role, content, source, extra };
    },
    appendConversationMessage: (message) => {
      events.push(`append:${message.role}`);
      state.conversation.push(message);
    },
    markPendingAssistantFeedbackApplied: () => events.push("feedback"),
    updateTimeTrackingFromMessage: () => events.push("time:user"),
    resolveRuntimeUserName: () => "Tester",
    attachTriggeredLorebooksToUserMessage: (message) => {
      events.push("lorebooks");
      message.preparedModelContent = true;
    },
    generateAssistant: async () => {
      events.push("generate");
      return {
        content: "Assistant reply",
        reasoningContent: "hidden reasoning",
        compressionNotice: true,
        modelProcessingResult: { skipReasoner: false }
      };
    },
    shouldEnsureMinimumAssistantLength: () => true,
    ensureMinimumAssistantLength: async ({ assistantText }) => {
      events.push("minimum");
      return { content: `${assistantText} expanded`, reasoningContent: "expansion reasoning" };
    },
    finalizeAssistantOutputContent: (content, options) => {
      events.push(`finalize:${options.userInput}`);
      return { content: `${content} finalized` };
    },
    updateTimeTrackingAfterAssistantTurn: () => {
      events.push("time:assistant");
      return { autoTimeWarning: "time warning" };
    },
    updateCompressionAfterAssistantMessage: async () => events.push("compression:after"),
    saveState: () => events.push("save")
  };
}

test("new conversation turns keep the model-facing turn order behind one interface", async () => {
  const events = [];
  const state = { conversation: [] };
  const result = await runConversationTurnWorkflow(createDeps(events, state), {
    state,
    content: "  hello  ",
    source: "web",
    extra: { platform: "web" }
  });

  assert.equal(result.userMessage.content, "hello");
  assert.equal(result.userMessage.extra.modelContent, "model:hello");
  assert.equal(result.userMessage.extra.assigned, true);
  assert.equal(result.assistantMessage.content, "Assistant reply expanded finalized");
  assert.equal(result.assistantMessage.extra.compressionNotice, true);
  assert.equal(result.assistantMessage.extra.autoTimeWarning, "time warning");
  assert.deepEqual(
    state.conversation.map((message) => message.role),
    ["user", "assistant"]
  );
  assert.deepEqual(events, [
    "parse:  hello  ",
    "turn-extra",
    "checkpoint",
    "create:user",
    "append:user",
    "feedback",
    "time:user",
    "lorebooks",
    "generate",
    "minimum",
    "finalize:hello",
    "time:assistant",
    "checkpoint",
    "create:assistant",
    "append:assistant",
    "compression:after",
    "save"
  ]);
});

test("existing-user turns regenerate only the assistant half of a turn", async () => {
  const events = [];
  const state = {
    conversation: [
      { id: "user-1", role: "user", content: "original", extra: { modelContent: "model:original" } }
    ]
  };
  const deps = createDeps(events, state);
  delete deps.parseInput;

  const result = await runConversationTurnWorkflow(deps, {
    state,
    existingUserMessage: state.conversation[0],
    source: "discord",
    extra: { platform: "discord" },
    resolveTurnExtra: false,
    assistantExtra: { regenerated: true }
  });

  assert.equal(result.userMessage.id, "user-1");
  assert.equal(result.assistantMessage.extra.regenerated, true);
  assert.deepEqual(
    state.conversation.map((message) => message.role),
    ["user", "assistant"]
  );
  assert.equal(events.includes("parse:original"), false);
  assert.equal(events.filter((event) => event === "append:user").length, 0);
});
