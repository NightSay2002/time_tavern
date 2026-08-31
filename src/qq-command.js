const QQ_COMMAND_NAMES = new Set([
  "help",
  "ai_start",
  "ai_status",
  "stop",
  "close",
  "archive",
  "archive_return"
]);

function safeText(value) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

export function parseQqTextCommand(value = "") {
  const match = safeText(value).match(/^[!！]((?:[a-z][a-z0-9_]*)|開始|开始)(?:\s+([\s\S]*))?$/iu);
  if (!match) {
    return null;
  }
  const isStartAlias = ["開始", "开始"].includes(match[1]);
  const name = isStartAlias ? "ai_start" : match[1].toLowerCase();
  const rawArguments = safeText(match[2]);
  return {
    name,
    known: QQ_COMMAND_NAMES.has(name),
    args: isStartAlias ? ["0", "1"] : rawArguments ? rawArguments.split(/\s+/u) : [],
    rawArguments: isStartAlias ? "0 1" : rawArguments
  };
}

export function buildQqHelpText() {
  return [
    "QQ 私聊指令（半形 ! 與全形 ！皆可）：",
    "!help - 查看所有 QQ 指令",
    "!開始 - 使用目前角色卡的第一個開場開始，等同 !ai_start 0 1",
    "!ai_start [角色卡編號] [開場編號] - 開始或重新開始；未填編號使用目前角色",
    "!ai_status 1 - 查看目前故事狀態",
    "!ai_status 2 [頁數] - 查看角色卡編號，每頁 10 張",
    "!stop - 停止目前生成；閒置時釋放目前故事租用的 Key",
    "!close - 關閉並刪除目前 QQ 故事，已建立存檔會保留",
    "!archive 0 [名稱] - 保存目前對話",
    "!archive 1 [存檔編號] - 查看存檔，未填編號顯示最新一份",
    "!archive_return <0|1> <存檔編號> - 0 顯示開頭，1 顯示最後五回合，並從末端繼續"
  ].join("\n");
}
