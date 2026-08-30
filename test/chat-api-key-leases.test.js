import assert from "node:assert/strict";
import test from "node:test";

import {
  CHAT_API_KEY_LEASE_MS,
  claimConversationApiKeySlot,
  normalizeConversationApiKeyAssignments,
  releaseConversationApiKeySlot
} from "../src/chat-api-key-leases.js";

const NOW = Date.parse("2026-08-29T12:00:00.000Z");

test("new stories lease the first free key group for 24 hours", () => {
  const first = claimConversationApiKeySlot({}, {
    contextId: "local",
    availableSlots: [1, 2],
    forceNew: true,
    now: NOW
  });
  const second = claimConversationApiKeySlot(first.assignments, {
    contextId: "discord:2",
    availableSlots: [1, 2],
    forceNew: true,
    now: NOW + 1000
  });
  assert.equal(first.slot, 1);
  assert.equal(second.slot, 2);
});

test("an inactive key group returns to the free pool after 24 hours", () => {
  const assignments = {
    local: { slot: 1, lastUsedAt: new Date(NOW - CHAT_API_KEY_LEASE_MS - 1).toISOString() },
    "discord:2": { slot: 2, lastUsedAt: new Date(NOW - 1000).toISOString() }
  };
  const result = claimConversationApiKeySlot(assignments, {
    contextId: "discord:3",
    availableSlots: [1, 2],
    forceNew: true,
    now: NOW
  });
  assert.equal(result.ok, true);
  assert.equal(result.slot, 1);
});

test("active stories renew their lease and occupied groups are never silently shared", () => {
  const assignments = {
    local: { slot: 1, lastUsedAt: new Date(NOW - 1000).toISOString() },
    "discord:2": { slot: 2, lastUsedAt: new Date(NOW - 1000).toISOString() }
  };
  const renewed = claimConversationApiKeySlot(assignments, {
    contextId: "local",
    availableSlots: [1, 2],
    now: NOW
  });
  assert.equal(renewed.slot, 1);
  assert.equal(renewed.assignments.local.lastUsedAt, new Date(NOW).toISOString());

  const blocked = claimConversationApiKeySlot(renewed.assignments, {
    contextId: "discord:3",
    availableSlots: [1, 2],
    forceNew: true,
    now: NOW
  });
  assert.equal(blocked.ok, false);
  assert.match(blocked.error, /新增一組 Key/u);
});

test("invalid persisted leases are discarded", () => {
  assert.deepEqual(normalizeConversationApiKeyAssignments({
    local: { slot: 1, lastUsedAt: "2026-08-29T12:00:00.000Z" },
    badSlot: { slot: 0, lastUsedAt: "2026-08-29T12:00:00.000Z" },
    badTime: { slot: 2, lastUsedAt: "invalid" }
  }), {
    local: { slot: 1, lastUsedAt: "2026-08-29T12:00:00.000Z" }
  });
});

test("deleting a story releases its key group immediately", () => {
  const assignments = {
    "discord:1": { slot: 1, lastUsedAt: new Date(NOW).toISOString() },
    "discord:2": { slot: 2, lastUsedAt: new Date(NOW).toISOString() }
  };
  const released = releaseConversationApiKeySlot(assignments, "discord:1");
  const claimed = claimConversationApiKeySlot(released, {
    contextId: "discord:3",
    availableSlots: [1, 2],
    forceNew: true,
    now: NOW + 1000
  });
  assert.deepEqual(Object.keys(released), ["discord:2"]);
  assert.equal(claimed.ok, true);
  assert.equal(claimed.slot, 1);
});

test("a provider without keys requires configuration instead of borrowing a slot", () => {
  const result = claimConversationApiKeySlot({
    local: { slot: 1, lastUsedAt: new Date(NOW).toISOString() }
  }, {
    contextId: "local",
    availableSlots: [],
    now: NOW + 1000
  });

  assert.equal(result.ok, false);
  assert.match(result.error, /目前對話 API 供應商沒有已設定的 Key/u);
});
