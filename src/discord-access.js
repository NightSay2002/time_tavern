export function isAllowedDiscordUser(userId = "", allowedUserId = "") {
  const normalizedUserId = String(userId || "").trim();
  const configuredUserId = String(allowedUserId || "").trim();

  if (!configuredUserId) {
    return true;
  }
  if (!/^\d{15,25}$/u.test(configuredUserId)) {
    return false;
  }
  return normalizedUserId === configuredUserId;
}
