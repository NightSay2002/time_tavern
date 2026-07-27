export function getContextMessageRoundLabels(messages = []) {
  let roundNumber = 0;
  return (Array.isArray(messages) ? messages : []).map((message) => {
    const role = message?.role === "assistant" ? "assistant" : "user";
    if (role === "user") {
      roundNumber += 1;
    }
    return `#${roundNumber} ${role}`;
  });
}
