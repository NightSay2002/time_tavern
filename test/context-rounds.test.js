import test from "node:test";
import assert from "node:assert/strict";

import {
  getContextMessageRoundLabels,
  stripLeadingContextRoundLabels
} from "../src/context-rounds.js";

test("context messages use sequential numbers", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "user" },
      { role: "assistant" },
      { role: "user" },
      { role: "assistant" }
    ]),
    ["#1 user", "#2 assistant", "#3 user", "#4 assistant"]
  );
});

test("twenty context rounds contain forty sequential message numbers", () => {
  const messages = Array.from({ length: 20 }, () => [
    { role: "user" },
    { role: "assistant" }
  ]).flat();
  const labels = getContextMessageRoundLabels(messages);

  assert.equal(labels.length, 40);
  assert.deepEqual(labels.slice(-2), ["#39 user", "#40 assistant"]);
});

test("an opening assistant message starts at one", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "assistant" },
      { role: "user" },
      { role: "assistant" }
    ]),
    ["#1 assistant", "#2 user", "#3 assistant"]
  );
});

test("a sliced context restarts sequential numbering at one", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "user", turnNumber: 19 },
      { role: "assistant" },
      { role: "user", turnNumber: 20 },
      { role: "assistant" }
    ]),
    ["#1 user", "#2 assistant", "#3 user", "#4 assistant"]
  );
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
