export const CHAT_API_KEY_LEASE_MS = 24 * 60 * 60 * 1000;

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSlot(value) {
  const slot = Number.parseInt(value, 10);
  return Number.isInteger(slot) && slot > 0 ? slot : 0;
}

function normalizeTimestamp(value) {
  const timestamp = Date.parse(text(value));
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

export function normalizeConversationApiKeyAssignments(input = {}) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  return Object.fromEntries(Object.entries(source).flatMap(([contextId, assignment]) => {
    const normalizedContextId = text(contextId);
    const slot = normalizeSlot(assignment?.slot);
    const lastUsedAt = normalizeTimestamp(assignment?.lastUsedAt);
    return normalizedContextId && slot && lastUsedAt
      ? [[normalizedContextId, { slot, lastUsedAt }]]
      : [];
  }));
}

export function claimConversationApiKeySlot(assignmentsInput = {}, options = {}) {
  const contextId = text(options.contextId);
  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const nowIso = new Date(now).toISOString();
  const availableSlots = [...new Set((Array.isArray(options.availableSlots) ? options.availableSlots : [])
    .map((slot) => normalizeSlot(slot))
    .filter(Boolean))].sort((left, right) => left - right);
  const assignments = normalizeConversationApiKeyAssignments(assignmentsInput);
  if (!contextId || availableSlots.length === 0) {
    return { ok: false, assignments, error: "沒有已設定的對話 API Key 組。" };
  }

  const activeAfter = now - CHAT_API_KEY_LEASE_MS;
  const occupiedSlots = new Set(Object.entries(assignments).flatMap(([otherContextId, assignment]) => {
    if (otherContextId === contextId || !availableSlots.includes(assignment.slot)) {
      return [];
    }
    return Date.parse(assignment.lastUsedAt) > activeAfter ? [assignment.slot] : [];
  }));
  const current = assignments[contextId];
  if (
    !options.forceNew &&
    current &&
    availableSlots.includes(current.slot) &&
    !occupiedSlots.has(current.slot)
  ) {
    assignments[contextId] = { slot: current.slot, lastUsedAt: nowIso };
    return { ok: true, slot: current.slot, assignments };
  }

  const slot = availableSlots.find((candidate) => !occupiedSlots.has(candidate));
  if (!slot) {
    return {
      ok: false,
      assignments,
      error: "所有對話 API Key 組都在最近 24 小時內被其他故事使用，請新增一組 Key。"
    };
  }
  assignments[contextId] = { slot, lastUsedAt: nowIso };
  return { ok: true, slot, assignments };
}
