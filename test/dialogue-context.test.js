import test from "node:test";
import assert from "node:assert/strict";

import { selectReasonerDialogueContextMessages } from "../src/dialogue-context.js";

function createMessage(role, turnNumber, content) {
  return {
    id: `${role}_${turnNumber}`,
    role,
    turnNumber: role === "user" ? turnNumber : undefined,
    content
  };
}

test("a new conversation grows every turn and keeps the latest twenty rounds without calling an API", () => {
  const openingDialogueMessage = {
    id: "opening",
    role: "assistant",
    content: "開場內容"
  };
  const conversation = [openingDialogueMessage];

  for (let turn = 1; turn <= 25; turn += 1) {
    const latestUser = createMessage("user", turn, `使用者第 ${turn} 回合`);
    conversation.push(latestUser);
    const selected = selectReasonerDialogueContextMessages({
      conversation,
      latestUserMessage: latestUser,
      latestUserContent: latestUser.content,
      openingDialogueMessage,
      contextLimit: 20,
      compressedThroughTurnNumber: 0
    });

    const completedRoundsInContext = Math.min(turn - 1, 20);
    assert.equal(selected.length, completedRoundsInContext * 2 + 2);
    assert.equal(selected[0].content, "開場內容");
    assert.equal(selected.at(-1).content, `使用者第 ${turn} 回合`);
    assert.equal(selected.at(-1).role, "user");
    assert.equal(selected.some((message) => /^#\d+\s/u.test(message.content)), false);

    conversation.push(createMessage("assistant", turn, `助手第 ${turn} 回合`));
  }
});

test("compressed rounds are replaced by one bridge round before the current user", () => {
  const openingDialogueMessage = { id: "opening", role: "assistant", content: "開場內容" };
  const conversation = [openingDialogueMessage];
  for (let turn = 1; turn <= 20; turn += 1) {
    conversation.push(createMessage("user", turn, `使用者第 ${turn} 回合`));
    conversation.push(createMessage("assistant", turn, `助手第 ${turn} 回合`));
  }
  const latestUser = createMessage("user", 21, "使用者第 21 回合");
  conversation.push(latestUser);

  const selected = selectReasonerDialogueContextMessages({
    conversation,
    latestUserMessage: latestUser,
    latestUserContent: latestUser.content,
    openingDialogueMessage,
    contextLimit: 20,
    compressedThroughTurnNumber: 20
  });

  assert.deepEqual(
    selected.map((message) => message.content),
    ["使用者第 20 回合", "助手第 20 回合", "使用者第 21 回合"]
  );
});
