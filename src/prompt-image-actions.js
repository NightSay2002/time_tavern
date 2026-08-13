const PROMPT_IMAGE_FOLLOWUP_ACTIONS = new Set([
  "image_parallel_reasoner",
  "image_only"
]);

export function shouldSyncPromptImageActionAvailability(previousConfigured, nextConfigured) {
  return Boolean(previousConfigured) !== Boolean(nextConfigured);
}

export function syncPromptImageActionAvailability(configsInput = {}, enabled = false) {
  const source = configsInput && typeof configsInput === "object" && !Array.isArray(configsInput)
    ? configsInput
    : {};
  let matchedCount = 0;
  let changedCount = 0;

  const configs = Object.fromEntries(Object.entries(source).map(([mode, config]) => {
    const profiles = Array.isArray(config?.compressionProfiles)
      ? config.compressionProfiles.map((profile) => ({
          ...profile,
          triggerActions: Array.isArray(profile?.triggerActions)
            ? profile.triggerActions.map((action) => {
                if (!PROMPT_IMAGE_FOLLOWUP_ACTIONS.has(action?.keywordFollowupAction)) {
                  return action;
                }
                matchedCount += 1;
                if ((action.enabled !== false) === Boolean(enabled)) {
                  return action;
                }
                changedCount += 1;
                return {
                  ...action,
                  enabled: Boolean(enabled)
                };
              })
            : profile?.triggerActions
        }))
      : config?.compressionProfiles;
    return [mode, {
      ...config,
      compressionProfiles: profiles
    }];
  }));

  return {
    configs,
    enabled: Boolean(enabled),
    matchedCount,
    changedCount
  };
}
