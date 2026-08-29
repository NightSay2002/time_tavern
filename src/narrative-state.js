function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function mergeTimeTrackingProgress(current = {}, historical = {}, updatedAt = "") {
  if (!isObject(historical)) {
    return { ...current };
  }
  return {
    ...historical,
    enabled: current.enabled,
    autoPeriod: {
      ...(current.autoPeriod || {}),
      turnsSinceChange: historical.autoPeriod?.turnsSinceChange ?? 0
    },
    startPoint: current.startPoint || null,
    config: current.config,
    updatedAt
  };
}

export function buildResetTimeTrackingProgress(defaultState = {}, current = {}, updatedAt = "") {
  const startPoint = isObject(current.startPoint) ? current.startPoint : null;
  return {
    ...defaultState,
    ...(startPoint || {}),
    enabled: current.enabled,
    autoPeriod: {
      ...(current.autoPeriod || {}),
      turnsSinceChange: 0
    },
    startPoint,
    config: current.config,
    pendingTransition: null,
    updatedAt
  };
}

export function mergeActiveRoleRuntimeState(current = {}, historical = {}, activeRoleCardId = "") {
  const merged = { ...current };
  if (!activeRoleCardId) {
    return merged;
  }
  if (Object.prototype.hasOwnProperty.call(historical, activeRoleCardId)) {
    merged[activeRoleCardId] = historical[activeRoleCardId];
  } else {
    delete merged[activeRoleCardId];
  }
  return merged;
}
