import { normalizeChineseTextForMatch } from "./ui-language.js";

function safeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function hasActiveAssistantTarget(state = {}) {
  return Boolean(safeText(state?.activeAssistantMode));
}

export function hasActiveConversationTarget(state = {}) {
  return Boolean(safeText(state?.activeRoleCardId) || hasActiveAssistantTarget(state));
}

export function hasTimePeriodAdvanceWord(text = "", words = []) {
  const normalizedText = normalizeChineseTextForMatch(text);
  if (!normalizedText || !Array.isArray(words)) {
    return false;
  }
  return words.some((word) => {
    const normalizedWord = normalizeChineseTextForMatch(word);
    return normalizedWord && normalizedText.includes(normalizedWord);
  });
}

function requireDependency(deps, name) {
  const dependency = deps?.[name];
  if (typeof dependency !== "function") {
    throw new Error(`conversation turn dependency missing: ${name}`);
  }
  return dependency;
}

function normalizeExpansionResult(result, fallbackContent = "") {
  if (typeof result === "string") {
    return { content: safeText(result), reasoningContent: "" };
  }
  if (result && typeof result === "object") {
    return {
      content: safeText(result.content) || safeText(fallbackContent),
      reasoningContent: safeText(result.reasoningContent)
    };
  }
  return { content: safeText(fallbackContent), reasoningContent: "" };
}

function buildAssistantExtra({
  turnExtra,
  assistantExtra,
  reasoningContent,
  compressionNotice,
  autoTimeWarning,
  stateAfterTurnSnapshot
}) {
  return {
    ...turnExtra,
    ...assistantExtra,
    ...(reasoningContent ? { reasoningContent } : {}),
    compressionNotice: Boolean(compressionNotice),
    autoTimeWarning: safeText(autoTimeWarning),
    stateAfterTurnSnapshot
  };
}

export async function runConversationTurnWorkflow(deps = {}, input = {}) {
  const currentState = input.state;
  const isSessionReady = requireDependency(deps, "isSessionReady");
  if (!isSessionReady(currentState)) {
    throw new Error(input.notReadyMessage || "conversation turn is not ready");
  }

  const existingUserMessage = input.existingUserMessage || null;
  const parsedInput = existingUserMessage
    ? {
        rawInput: safeText(existingUserMessage.content),
        modelContent: safeText(existingUserMessage.modelContent || existingUserMessage.extra?.modelContent),
        inputKind: existingUserMessage.extra?.inputKind || existingUserMessage.inputKind || "text"
      }
    : requireDependency(deps, "parseInput")(input.content, currentState);

  const storedUserContent = existingUserMessage
    ? safeText(existingUserMessage.content)
    : safeText(parsedInput.rawInput) || safeText(input.content);
  let modelUserContent = safeText(parsedInput.modelContent) || storedUserContent;

  const applyPendingFeedback = input.applyPendingAssistantFeedback !== false && !existingUserMessage;
  const pendingAssistantFeedback = applyPendingFeedback && typeof deps.getPendingAssistantFeedbackForNextUser === "function"
    ? deps.getPendingAssistantFeedbackForNextUser(currentState)
    : null;
  if (pendingAssistantFeedback && typeof deps.prependAssistantFeedbackPrompt === "function") {
    modelUserContent = deps.prependAssistantFeedbackPrompt(modelUserContent, pendingAssistantFeedback.feedback);
  }

  const ensureTurnExtra = requireDependency(deps, "ensureTurnExtra");
  const turnExtra = input.resolveTurnExtra === false
    ? { ...(input.extra || {}) }
    : ensureTurnExtra(currentState, input.extra || {});
  const captureCheckpoint = requireDependency(deps, "captureCheckpoint");

  let userMessage = existingUserMessage;
  if (!userMessage) {
    if (!storedUserContent || !modelUserContent) {
      throw new Error(input.emptyInputMessage || "input cannot be empty");
    }
    const stateBeforeTurnSnapshot = captureCheckpoint(currentState);
    userMessage = requireDependency(deps, "createMessageRecord")({
      role: "user",
      content: storedUserContent,
      source: input.source,
      extra: {
        ...turnExtra,
        ...(input.userExtra || {}),
        inputKind: parsedInput.inputKind,
        baseModelContent: modelUserContent,
        modelContent: modelUserContent,
        assistantOutputFeedback: pendingAssistantFeedback?.feedback || "",
        assistantOutputFeedbackPrompt: pendingAssistantFeedback?.promptPrefix || "",
        assistantOutputFeedbackFromMessageId: pendingAssistantFeedback?.assistantMessage?.id || "",
        keepTimeDirective: Boolean(input.keepTimeDirective),
        stateBeforeTurnSnapshot
      }
    });
    requireDependency(deps, "appendConversationMessage")(userMessage);
    deps.markPendingAssistantFeedbackApplied?.(pendingAssistantFeedback, userMessage);
  }

  const advancedTimePeriod = deps.advanceTimeTrackingFromUserInput?.(currentState, storedUserContent) === true;
  if (!advancedTimePeriod) {
    deps.resolvePendingTimeTrackingBeforeUserTurn?.(currentState, storedUserContent);
    deps.updateTimeTrackingFromMessage?.(currentState, userMessage);
  }

  const runtimeUserName = requireDependency(deps, "resolveRuntimeUserName")(currentState, turnExtra, input);
  deps.attachTriggeredLorebooksToUserMessage?.(userMessage, currentState, runtimeUserName);

  const generation = await requireDependency(deps, "generateAssistant")({
    state: currentState,
    runtimeUserName,
    userMessage,
    storedUserContent,
    input,
    turnExtra
  });
  let modelProcessingResult = generation?.modelProcessingResult || deps.getLastModelProcessingResult?.(currentState) || {};
  let assistantText = safeText(generation?.content);
  let fullReasoning = safeText(generation?.reasoningContent);

  if (generation?.suppressAssistantMessage) {
    requireDependency(deps, "saveState")(currentState);
    return {
      userMessage,
      assistantMessage: null,
      modelProcessingResult
    };
  }

  const shouldEnsureMinimum = typeof deps.shouldEnsureMinimumAssistantLength === "function"
    ? deps.shouldEnsureMinimumAssistantLength({
        state: currentState,
        assistantText,
        runtimeUserName,
        modelProcessingResult,
        input
      })
    : true;
  if (shouldEnsureMinimum) {
    const expanded = normalizeExpansionResult(
      await requireDependency(deps, "ensureMinimumAssistantLength")({
        state: currentState,
        assistantText,
        runtimeUserName,
        input
      }),
      assistantText
    );
    assistantText = expanded.content;
    fullReasoning = [fullReasoning, expanded.reasoningContent].filter(Boolean).join("\n\n").trim();
  }

  const finalizedAssistantOutput = requireDependency(deps, "finalizeAssistantOutputContent")(assistantText, {
    userInput: storedUserContent
  });
  assistantText = safeText(finalizedAssistantOutput?.content) || assistantText;

  const timeTrackingUpdate = deps.updateTimeTrackingAfterAssistantTurn?.(
    currentState,
    assistantText,
    storedUserContent
  ) || {};
  const stateAfterTurnSnapshot = captureCheckpoint(currentState);
  const assistantMessage = requireDependency(deps, "createMessageRecord")({
    role: "assistant",
    content: assistantText,
    source: input.source,
    extra: buildAssistantExtra({
      turnExtra,
      assistantExtra: input.assistantExtra || {},
      reasoningContent: fullReasoning,
      compressionNotice: generation?.compressionNotice,
      autoTimeWarning: timeTrackingUpdate.autoTimeWarning,
      stateAfterTurnSnapshot
    })
  });

  requireDependency(deps, "appendConversationMessage")(assistantMessage);
  if (!modelProcessingResult.skipReasoner) {
    const afterProcessingResult = await deps.updateCompressionAfterAssistantMessage?.(currentState, runtimeUserName, assistantMessage, turnExtra);
    if (afterProcessingResult?.didProcess) {
      modelProcessingResult = afterProcessingResult;
    }
  }
  requireDependency(deps, "saveState")(currentState);

  return {
    userMessage,
    assistantMessage,
    modelProcessingResult
  };
}
