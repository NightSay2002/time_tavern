import test from "node:test";
import assert from "node:assert/strict";

import {
  findRecentUserMessageIndex,
  normalizeRecentUserInputNumber
} from "../src/conversation-history.js";

function message(role, content) {
  return { role, content };
}

test("reload num selects user inputs from newest to oldest", () => {
  const conversation = [
    message("assistant", "opening"),
    message("user", "user 53"),
    message("assistant", "ai 53"),
    message("user", "user 54"),
    message("assistant", "ai 54")
  ];

  assert.equal(findRecentUserMessageIndex(conversation, 1), 3);
  assert.equal(findRecentUserMessageIndex(conversation, 2), 1);
  assert.equal(findRecentUserMessageIndex(conversation, 3), -1);
});

test("repeating reload 1 targets the same logical turn after replacement", () => {
  let conversation = [
    message("user", "user 53"),
    message("assistant", "ai 53"),
    message("user", "user 54"),
    message("assistant", "ai 54")
  ];

  const firstTarget = findRecentUserMessageIndex(conversation, 1);
  conversation = [
    ...conversation.slice(0, firstTarget),
    message("user", "first replacement"),
    message("assistant", "first regenerated reply")
  ];

  const secondTarget = findRecentUserMessageIndex(conversation, 1);
  assert.equal(firstTarget, 2);
  assert.equal(secondTarget, 2);
  assert.equal(conversation[secondTarget].content, "first replacement");
});

test("reload num must be a positive integer", () => {
  assert.equal(normalizeRecentUserInputNumber(1), 1);
  assert.equal(normalizeRecentUserInputNumber("2"), 2);
  assert.equal(normalizeRecentUserInputNumber(0), null);
  assert.equal(normalizeRecentUserInputNumber(1.5), null);
  assert.equal(normalizeRecentUserInputNumber("nope"), null);
});
