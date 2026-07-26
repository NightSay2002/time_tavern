export const LEGACY_DISCORD_TEXT_COMMAND_NOTICE =
  "`!ai` 文字指令已移除，請使用 Discord Slash 指令，或在已啟用的對話頻道直接輸入內容。";

export function isLegacyDiscordTextCommand(input = "") {
  return /^!ai(?:\s|$)/iu.test(String(input ?? "").trimStart());
}
