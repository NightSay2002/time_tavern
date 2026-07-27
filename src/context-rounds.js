export function getContextMessageRoundLabels(messages = []) {
  let roundNumber = 0;
  return (Array.isArray(messages) ? messages : []).map((message) => {
    const role = message?.role === "assistant" ? "assistant" : "user";
    if (role === "user") {
      const storedTurnNumber = Math.floor(Number(message?.turnNumber ?? message?.extra?.turnNumber));
      roundNumber = Number.isFinite(storedTurnNumber) && storedTurnNumber > 0
        ? storedTurnNumber
        : roundNumber + 1;
    }
    return `#${roundNumber} ${role}`;
  });
}
