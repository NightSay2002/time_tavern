import test from "node:test";
import assert from "node:assert/strict";

import { getContextMessageRoundLabels } from "../src/context-rounds.js";

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
