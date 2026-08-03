import test from "node:test";
import assert from "node:assert/strict";

import {
  collectCompletedDialogueRoundsBeforeLatestUser,
  composeReasonerRequestMessages,
  hasReachedContextRoundLimit,
  selectReasonerDialogueContextMessages
} from "../src/dialogue-context.js";

function createMessage(role, turnNumber, content) {
  return {
    id: `${role}_${turnNumber}`,
    role,
    turnNumber: role === "user" ? turnNumber : undefined,
    content
  };
}

test("a new conversation grows through twenty turns without calling an API", () => {
  const openingDialogueMessage = {
    id: "opening",
    role: "assistant",
    content: "開場內容"
  };
  const conversation = [openingDialogueMessage];

  for (let turn = 1; turn <= 20; turn += 1) {
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

    const completedRounds = collectCompletedDialogueRoundsBeforeLatestUser(conversation, latestUser.id);
    const completedRoundsInContext = turn - 1;
    assert.equal(hasReachedContextRoundLimit(completedRounds, 20), false);
    assert.equal(selected.length, completedRoundsInContext * 2 + 2);
    assert.equal(selected[0].content, "開場內容");
    assert.equal(selected.at(-1).content, `使用者第 ${turn} 回合`);
    assert.equal(selected.at(-1).role, "user");
    assert.equal(selected.some((message) => /^#\d+\s/u.test(message.content)), false);

    conversation.push(createMessage("assistant", turn, `助手第 ${turn} 回合`));
  }
});

test("turn twenty-one triggers standard compression and keeps turn twenty as the bridge", () => {
  const openingDialogueMessage = { id: "opening", role: "assistant", content: "開場內容" };
  const conversation = [openingDialogueMessage];
  for (let turn = 1; turn <= 20; turn += 1) {
    conversation.push(createMessage("user", turn, `使用者第 ${turn} 回合`));
    conversation.push(createMessage("assistant", turn, `助手第 ${turn} 回合`));
  }
  const latestUser = createMessage("user", 21, "使用者第 21 回合");
  conversation.push(latestUser);
  const completedRounds = collectCompletedDialogueRoundsBeforeLatestUser(conversation, latestUser.id);
  assert.equal(completedRounds.length, 20);
  assert.equal(hasReachedContextRoundLimit(completedRounds, 20), true);

  const dialogueMessages = selectReasonerDialogueContextMessages({
    conversation,
    latestUserMessage: latestUser,
    latestUserContent: latestUser.content,
    openingDialogueMessage,
    contextLimit: 20,
    compressedThroughTurnNumber: 20
  });

  const requestMessages = composeReasonerRequestMessages({
    systemPrompt: "角色卡資料",
    compressionMessage: "壓縮內容：第 1 至 20 回合",
    dialogueMessages
  });

  assert.deepEqual(requestMessages.map((message) => [message.role, message.content]), [
    ["system", "角色卡資料"],
    ["user", "壓縮內容：第 1 至 20 回合"],
    ["user", "使用者第 20 回合"],
    ["assistant", "助手第 20 回合"],
    ["user", "使用者第 21 回合"]
  ]);
  assert.equal(requestMessages.some((message) => message.content === "開場內容"), false);
});

test("turn twenty-two continues from turn twenty-one after compression", () => {
  const openingDialogueMessage = { id: "opening", role: "assistant", content: "開場內容" };
  const conversation = [openingDialogueMessage];
  for (let turn = 1; turn <= 21; turn += 1) {
    conversation.push(createMessage("user", turn, `使用者第 ${turn} 回合`));
    conversation.push(createMessage("assistant", turn, `助手第 ${turn} 回合`));
  }
  const latestUser = createMessage("user", 22, "使用者第 22 回合");
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
    ["使用者第 21 回合", "助手第 21 回合", "使用者第 22 回合"]
  );
});
