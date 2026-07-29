import test from "node:test";
import assert from "node:assert/strict";

import {
  getContextMessageRoundLabels,
  stripLeadingContextRoundLabels
} from "../src/context-rounds.js";

test("user and assistant messages share one context round number", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "user" },
      { role: "assistant" }
    ]),
    ["#1 user", "#1 assistant"]
  );
});

test("twenty context rounds end at round twenty", () => {
  const messages = Array.from({ length: 20 }, () => [
    { role: "user" },
    { role: "assistant" }
  ]).flat();
  const labels = getContextMessageRoundLabels(messages);

  assert.equal(labels.length, 40);
  assert.deepEqual(labels.slice(-2), ["#20 user", "#20 assistant"]);
});

test("an opening assistant message is round zero", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "assistant" },
      { role: "user" },
      { role: "assistant" }
    ]),
    ["#0 assistant", "#1 user", "#1 assistant"]
  );
});

test("stored turn numbers remain stable in a sliced context", () => {
  assert.deepEqual(
    getContextMessageRoundLabels([
      { role: "user", turnNumber: 19 },
      { role: "assistant" },
      { role: "user", turnNumber: 20 },
      { role: "assistant" }
    ]),
    ["#19 user", "#19 assistant", "#20 user", "#20 assistant"]
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
