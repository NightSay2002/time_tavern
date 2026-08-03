function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isModelInvisibleMessage(message = {}) {
  return Boolean(message.excludeFromModel || message.imageOnly || message.extra?.excludeFromModel || message.extra?.imageOnly);
}

function getMessageTurnNumber(message = {}) {
  const value = Number(message.turnNumber ?? message.extra?.turnNumber);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

function hasSameContent(messages = [], content = "") {
  const normalizedContent = normalizeText(content);
  return Boolean(normalizedContent) && messages.some((message) => normalizeText(message?.content) === normalizedContent);
}

export function collectCompletedDialogueRoundsBeforeLatestUser(conversation = [], latestUserMessageId = "") {
  const messages = Array.isArray(conversation) ? conversation : [];
  let latestUserIndex = latestUserMessageId
    ? messages.findIndex((message) => message?.id === latestUserMessageId)
    : -1;
  if (latestUserIndex < 0) {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.role === "user") {
        latestUserIndex = index;
        break;
      }
    }
  }
  if (latestUserIndex <= 0) {
    return [];
  }

  const rounds = [];
  let pendingUser = null;
  messages.slice(0, latestUserIndex).forEach((message) => {
    if (!message || typeof message !== "object") {
      return;
    }
    if (message.role === "user") {
      if (pendingUser) {
        rounds.push([pendingUser]);
      }
      pendingUser = message;
      return;
    }
    if (message.role === "assistant" && pendingUser && !isModelInvisibleMessage(message)) {
      rounds.push([pendingUser, message]);
      pendingUser = null;
    }
  });
  if (pendingUser) {
    rounds.push([pendingUser]);
  }
  return rounds;
}

export function selectReasonerDialogueContextMessages({
  conversation = [],
  latestUserMessage = null,
  latestUserContent = "",
  openingDialogueMessage = null,
  contextLimit = 20,
  compressedThroughTurnNumber = 0
} = {}) {
  if (!latestUserMessage) {
    return openingDialogueMessage ? [openingDialogueMessage] : [];
  }

  const limit = Math.max(1, Math.floor(Number(contextLimit)) || 1);
  const compressedThrough = Math.max(0, Math.floor(Number(compressedThroughTurnNumber)) || 0);
  const allRounds = collectCompletedDialogueRoundsBeforeLatestUser(conversation, latestUserMessage.id);
  const eligibleRounds = allRounds
    .map((round, index) => ({
      messages: round,
      turnNumber: getMessageTurnNumber(round.find((message) => message?.role === "user")) || index + 1
    }))
    .filter((round) => round.turnNumber > compressedThrough);
  const selectedRounds = eligibleRounds.slice(-limit);
  const messages = selectedRounds.flatMap((round) => round.messages);

  if (!messages.some((message) => message?.role === "assistant")) {
    const bridgeRound = [...allRounds].reverse()
      .find((round) => round.some((message) => message?.role === "assistant"));
    if (bridgeRound) {
      messages.unshift(...bridgeRound);
    }
  }
  if (
    compressedThrough <= 0 &&
    openingDialogueMessage &&
    !hasSameContent(messages, openingDialogueMessage.content)
  ) {
    messages.unshift(openingDialogueMessage);
  }

  const preparedLatestUserContent = normalizeText(latestUserContent);
  if (preparedLatestUserContent) {
    messages.push({
      ...latestUserMessage,
      role: "user",
      content: preparedLatestUserContent,
      requestContentPrepared: true
    });
  }
  return messages;
}
