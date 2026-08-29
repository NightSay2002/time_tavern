import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { stripLeadingContextRoundLabels } from "../src/context-rounds.js";
import {
  isModelInvisibleMessage,
  selectReasonerDialogueContextMessages
} from "../src/dialogue-context.js";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const stylesSource = fs.readFileSync(new URL("../src/public/styles.css", import.meta.url), "utf8");

test("recent dialogue keeps API roles separate from message content", () => {
  const functionStart = serverSource.indexOf("function buildCacheableDialogueMessages(messages = [])");
  const functionEnd = serverSource.indexOf("\nfunction getCompletedDialogueRoundsBeforeLatestUser", functionStart);
  const functionSource = serverSource.slice(functionStart, functionEnd);

  assert.match(functionSource, /\? \{ role, content: buildMultimodalMessageContent\(normalizedContent, item\) \}/u);
  assert.doesNotMatch(functionSource, /#\$\{|labels\[|getContextMessageRoundLabels/u);
});

test("combined compression context uses roles without numeric labels", () => {
  const functionStart = serverSource.indexOf("function formatCompressionContextBlock(messages = [])");
  const functionEnd = serverSource.indexOf("\nfunction buildCompressionRoleCardContextMessage", functionStart);
  const functionSource = serverSource.slice(functionStart, functionEnd);

  assert.match(functionSource, /message\?\.role === "assistant" \? "\[assistant\]" : "\[user\]"/u);
  assert.doesNotMatch(functionSource, /getContextMessageRoundLabels|#\$\{/u);
});

test("existing context round labels are removed before rebuilding context", () => {
  assert.equal(
    stripLeadingContextRoundLabels([
      "#5 assistant",
      "#2 assistant",
      "#1 assistant",
      "正文內容"
    ].join("\n")),
    "正文內容"
  );
});

test("ordinary headings in message content are preserved", () => {
  assert.equal(
    stripLeadingContextRoundLabels("# 第一章\n正文內容"),
    "# 第一章\n正文內容"
  );
});

test("model failure notices stay visible in history but are excluded from AI context", () => {
  const invalidUser = {
    id: "invalid-user",
    role: "user",
    content: "失敗的輸入",
    excludeFromModel: true,
    invalidConversation: true
  };
  const failure = {
    id: "error-1",
    role: "assistant",
    content: "模型呼叫失敗，已改用錯誤訊息回覆：所有 Key 忙碌"
  };
  const latestUser = { id: "user-2", role: "user", content: "繼續" };
  const messages = selectReasonerDialogueContextMessages({
    conversation: [
      { id: "user-1", role: "user", content: "前一則輸入", turnNumber: 1 },
      invalidUser,
      failure,
      latestUser
    ],
    latestUserMessage: latestUser,
    latestUserContent: latestUser.content,
    contextLimit: 20
  });

  assert.equal(isModelInvisibleMessage(failure), true);
  assert.equal(isModelInvisibleMessage(invalidUser), true);
  assert.equal(messages.some((message) => message.id === invalidUser.id), false);
  assert.equal(messages.some((message) => message.id === failure.id), false);
  assert.equal(messages.some((message) => message.content === "前一則輸入"), true);
  assert.equal(messages.at(-1).content, "繼續");
});

test("web marks failed turns as invalid until a later success clears them", () => {
  assert.match(serverSource, /markTrailingFailedConversationTurnsInvalid/u);
  assert.match(serverSource, /clearInvalidConversationMessages/u);
  assert.match(webSource, /invalidBadge\.textContent = "無效對話"/u);
  assert.match(stylesSource, /\.discord-message\.invalid-conversation/u);
});
