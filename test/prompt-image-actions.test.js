import assert from "node:assert/strict";
import test from "node:test";

import {
  shouldSyncPromptImageActionAvailability,
  syncPromptImageActionAvailability
} from "../src/prompt-image-actions.js";

function createConfigs() {
  return {
    multi: {
      compressionProfiles: [
        {
          id: "standard",
          triggerActions: [
            { id: "normal", enabled: true, keywordFollowupAction: "continue_reasoner" },
            { id: "parallel", enabled: true, keywordFollowupAction: "image_parallel_reasoner" }
          ]
        }
      ]
    },
    image_only: {
      compressionProfiles: [
        {
          id: "standard",
          triggerActions: [
            { id: "image-only", enabled: false, keywordFollowupAction: "image_only" }
          ]
        }
      ]
    }
  };
}

test("missing NovelAI token disables every Prompt image action only", () => {
  const result = syncPromptImageActionAvailability(createConfigs(), false);
  const normal = result.configs.multi.compressionProfiles[0].triggerActions[0];
  const parallel = result.configs.multi.compressionProfiles[0].triggerActions[1];
  const imageOnly = result.configs.image_only.compressionProfiles[0].triggerActions[0];

  assert.equal(result.enabled, false);
  assert.equal(result.matchedCount, 2);
  assert.equal(result.changedCount, 1);
  assert.equal(normal.enabled, true);
  assert.equal(parallel.enabled, false);
  assert.equal(imageOnly.enabled, false);
});

test("present NovelAI token enables every Prompt image action", () => {
  const result = syncPromptImageActionAvailability(createConfigs(), true);
  const parallel = result.configs.multi.compressionProfiles[0].triggerActions[1];
  const imageOnly = result.configs.image_only.compressionProfiles[0].triggerActions[0];

  assert.equal(result.enabled, true);
  assert.equal(result.matchedCount, 2);
  assert.equal(result.changedCount, 1);
  assert.equal(parallel.enabled, true);
  assert.equal(imageOnly.enabled, true);
});

test("Prompt image actions only auto-sync when Token availability changes", () => {
  assert.equal(shouldSyncPromptImageActionAvailability(false, true), true);
  assert.equal(shouldSyncPromptImageActionAvailability(true, false), true);
  assert.equal(shouldSyncPromptImageActionAvailability(false, false), false);
  assert.equal(shouldSyncPromptImageActionAvailability(true, true), false);
});
