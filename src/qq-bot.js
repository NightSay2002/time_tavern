import WebSocket from "ws";

export const QQ_BOT_TOKEN_URL = "https://bots.qq.com/app/getAppAccessToken";
export const QQ_BOT_API_BASE_URL = "https://api.sgroup.qq.com";
export const QQ_C2C_INTENTS = 1 << 25;
export const QQ_C2C_MESSAGE_EVENT = "C2C_MESSAGE_CREATE";

const OP_DISPATCH = 0;
const OP_HEARTBEAT = 1;
const OP_IDENTIFY = 2;
const OP_RESUME = 6;
const OP_RECONNECT = 7;
const OP_INVALID_SESSION = 9;
const OP_HELLO = 10;
const FATAL_CLOSE_CODES = new Set([4001, 4002, 4010, 4011, 4012, 4013, 4014, 4914, 4915]);

function safeText(value) {
  return typeof value === "string" ? value.trim() : String(value ?? "").trim();
}

export function isAllowedQqUser(userOpenId = "", allowedUserOpenId = "") {
  const allowed = safeText(allowedUserOpenId);
  return !allowed || safeText(userOpenId) === allowed;
}

export function splitQqMessageText(value = "", maxLength = 4000) {
  const text = safeText(value);
  const limit = Math.max(1, Math.floor(Number(maxLength) || 4000));
  if (!text) {
    return [];
  }
  const chunks = [];
  for (let offset = 0; offset < text.length; offset += limit) {
    chunks.push(text.slice(offset, offset + limit));
  }
  return chunks;
}

function parseJson(text, fallback = {}) {
  try {
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function getSocketMessageText(raw) {
  if (typeof raw === "string") {
    return raw;
  }
  if (Buffer.isBuffer(raw)) {
    return raw.toString("utf8");
  }
  if (raw?.data !== undefined) {
    return getSocketMessageText(raw.data);
  }
  if (raw instanceof ArrayBuffer) {
    return Buffer.from(raw).toString("utf8");
  }
  return String(raw ?? "");
}

function createSocket(WebSocketImpl, url) {
  return new WebSocketImpl(url);
}

function bindSocketEvent(socket, eventName, handler) {
  if (typeof socket.on === "function") {
    socket.on(eventName, handler);
    return;
  }
  socket.addEventListener?.(eventName, handler);
}

export function createQqBotClient({
  appId,
  appSecret,
  onMessage,
  onStatus,
  fetchImpl = globalThis.fetch,
  WebSocketImpl = WebSocket,
  logger = console
} = {}) {
  const normalizedAppId = safeText(appId);
  const normalizedAppSecret = safeText(appSecret);
  if (!normalizedAppId || !normalizedAppSecret) {
    throw new Error("QQ Bot AppID 與 AppSecret 不可空白。");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("目前環境不支援 fetch，無法連線 QQ Bot API。");
  }

  let accessToken = "";
  let accessTokenExpiresAt = 0;
  let socket = null;
  let heartbeatTimer = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;
  let sessionId = "";
  let sequence = null;
  let messageSequence = 0;
  let stopped = true;
  let connected = false;
  const recentMessageIds = new Map();

  const setStatus = (nextConnected, detail = "") => {
    connected = Boolean(nextConnected);
    onStatus?.({ connected, detail: safeText(detail) });
  };

  const clearHeartbeat = () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const clearReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const nextMessageSequence = () => {
    messageSequence = (messageSequence + 1) % 65536;
    return messageSequence;
  };

  const getAccessToken = async (forceRefresh = false) => {
    if (!forceRefresh && accessToken && Date.now() < accessTokenExpiresAt - 60_000) {
      return accessToken;
    }
    const response = await fetchImpl(QQ_BOT_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appId: normalizedAppId, clientSecret: normalizedAppSecret })
    });
    const text = await response.text();
    const data = parseJson(text);
    if (!response.ok || !safeText(data.access_token)) {
      throw new Error(safeText(data.message || data.error_description) || `QQ Bot Token 請求失敗 (${response.status})。`);
    }
    accessToken = safeText(data.access_token);
    const expiresIn = Math.max(60, Number(data.expires_in) || 7200);
    accessTokenExpiresAt = Date.now() + expiresIn * 1000;
    return accessToken;
  };

  const apiRequest = async (pathname, options = {}, retryUnauthorized = true) => {
    const token = await getAccessToken();
    const response = await fetchImpl(`${QQ_BOT_API_BASE_URL}${pathname}`, {
      ...options,
      headers: {
        Authorization: `QQBot ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    const text = await response.text();
    const data = parseJson(text, text);
    if (response.status === 401 && retryUnauthorized) {
      await getAccessToken(true);
      return apiRequest(pathname, options, false);
    }
    if (!response.ok) {
      const detail = safeText(data?.message || data?.msg || data?.error_description);
      throw new Error(detail || `QQ Bot API 請求失敗 (${response.status})。`);
    }
    return data;
  };

  const sendSocketPayload = (payload) => {
    if (!socket || socket.readyState !== WebSocketImpl.OPEN) {
      return false;
    }
    socket.send(JSON.stringify(payload));
    return true;
  };

  const sendIdentifyOrResume = async () => {
    const token = await getAccessToken();
    if (sessionId && sequence !== null) {
      sendSocketPayload({
        op: OP_RESUME,
        d: {
          token: `QQBot ${token}`,
          session_id: sessionId,
          seq: sequence
        }
      });
      return;
    }
    sendSocketPayload({
      op: OP_IDENTIFY,
      d: {
        token: `QQBot ${token}`,
        intents: QQ_C2C_INTENTS,
        shard: [0, 1],
        properties: {
          "$os": process.platform || "linux",
          "$browser": "time-tavern",
          "$device": "time-tavern"
        }
      }
    });
  };

  const rememberIncomingMessage = (messageId) => {
    const id = safeText(messageId);
    if (!id || recentMessageIds.has(id)) {
      return false;
    }
    const now = Date.now();
    recentMessageIds.set(id, now);
    for (const [storedId, recordedAt] of recentMessageIds) {
      if (now - recordedAt > 10 * 60 * 1000) {
        recentMessageIds.delete(storedId);
      }
    }
    return true;
  };

  const scheduleReconnect = (detail = "") => {
    if (stopped || reconnectTimer) {
      return;
    }
    setStatus(false, detail);
    reconnectAttempt += 1;
    const delayMs = [2000, 5000, 10_000, 30_000, 60_000][Math.min(reconnectAttempt - 1, 4)];
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect().catch((error) => {
        logger.error?.(`QQ Bot 重新連線失敗：${error.message || error}`);
        scheduleReconnect(error.message || "重新連線失敗");
      });
    }, delayMs);
    reconnectTimer.unref?.();
  };

  const handleDispatch = (event) => {
    if (event.t === "READY" || event.t === "RESUMED") {
      sessionId = safeText(event.d?.session_id) || sessionId;
      reconnectAttempt = 0;
      setStatus(true, "已連線");
      return;
    }
    if (event.t !== QQ_C2C_MESSAGE_EVENT || !rememberIncomingMessage(event.d?.id)) {
      return;
    }
    Promise.resolve(onMessage?.(event.d || {})).catch((error) => {
      logger.error?.(`QQ Bot 私聊訊息處理失敗：${error.message || error}`);
    });
  };

  const handleSocketMessage = (raw) => {
    const event = parseJson(getSocketMessageText(raw), null);
    if (!event || typeof event.op !== "number") {
      return;
    }
    if (event.s !== undefined && event.s !== null) {
      sequence = event.s;
    }
    if (event.op === OP_HELLO) {
      clearHeartbeat();
      const intervalMs = Math.max(1000, Math.floor((Number(event.d?.heartbeat_interval) || 45_000) * 0.8));
      heartbeatTimer = setInterval(() => {
        sendSocketPayload({ op: OP_HEARTBEAT, d: sequence });
      }, intervalMs);
      heartbeatTimer.unref?.();
      void sendIdentifyOrResume().catch((error) => {
        logger.error?.(`QQ Bot 鑑權失敗：${error.message || error}`);
        socket?.close?.();
      });
      return;
    }
    if (event.op === OP_DISPATCH) {
      handleDispatch(event);
      return;
    }
    if (event.op === OP_RECONNECT) {
      socket?.close?.();
      return;
    }
    if (event.op === OP_INVALID_SESSION) {
      sessionId = "";
      sequence = null;
      void sendIdentifyOrResume().catch((error) => logger.error?.(`QQ Bot 重新鑑權失敗：${error.message || error}`));
    }
  };

  async function connect() {
    if (stopped) {
      return;
    }
    clearReconnect();
    clearHeartbeat();
    const gateway = await apiRequest("/gateway", { method: "GET" });
    const gatewayUrl = safeText(gateway?.url);
    if (!gatewayUrl) {
      throw new Error("QQ Bot Gateway 沒有回傳 WebSocket URL。");
    }
    socket = createSocket(WebSocketImpl, gatewayUrl);
    bindSocketEvent(socket, "message", handleSocketMessage);
    bindSocketEvent(socket, "error", (error) => {
      logger.warn?.(`QQ Bot WebSocket 錯誤：${error.message || error}`);
    });
    bindSocketEvent(socket, "close", (code, reason) => {
      clearHeartbeat();
      socket = null;
      const closeCode = Number(code?.code ?? code);
      const closeReason = safeText(reason?.reason ?? reason);
      if (FATAL_CLOSE_CODES.has(closeCode)) {
        stopped = true;
        setStatus(false, `連線已停止 (${closeCode}${closeReason ? `: ${closeReason}` : ""})`);
        logger.error?.(`QQ Bot Gateway 拒絕連線 (${closeCode})，請檢查 AppID、AppSecret 與事件權限。`);
        return;
      }
      scheduleReconnect(`連線中斷 (${closeCode || "unknown"})`);
    });
  }

  const sendText = async ({ userOpenId, content, replyToMessageId = "" } = {}) => {
    const openId = safeText(userOpenId);
    if (!openId) {
      throw new Error("缺少 QQ user_openid，無法回覆私聊。");
    }
    const chunks = splitQqMessageText(content);
    const results = [];
    for (const chunk of chunks) {
      const msgId = safeText(replyToMessageId);
      results.push(await apiRequest(`/v2/users/${encodeURIComponent(openId)}/messages`, {
        method: "POST",
        body: JSON.stringify({
          msg_type: 0,
          content: chunk,
          msg_seq: nextMessageSequence(),
          ...(msgId
            ? {
                msg_id: msgId,
                message_reference: { message_id: msgId }
              }
            : {})
        })
      }));
    }
    return results;
  };

  const sendTyping = async ({ userOpenId, replyToMessageId = "" } = {}) => {
    const openId = safeText(userOpenId);
    const msgId = safeText(replyToMessageId);
    if (!openId || !msgId) {
      return null;
    }
    return apiRequest(`/v2/users/${encodeURIComponent(openId)}/messages`, {
      method: "POST",
      body: JSON.stringify({
        msg_type: 6,
        msg_id: msgId,
        msg_seq: nextMessageSequence(),
        input_notify: { input_type: 1, input_second: 60 }
      })
    });
  };

  const sendImage = async ({ userOpenId, buffer, fileName = "image.png", replyToMessageId = "" } = {}) => {
    const openId = safeText(userOpenId);
    const imageBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer || []);
    if (!openId || imageBuffer.length === 0) {
      throw new Error("QQ 圖片回覆缺少 user_openid 或圖片資料。");
    }
    const uploaded = await apiRequest(`/v2/users/${encodeURIComponent(openId)}/files`, {
      method: "POST",
      body: JSON.stringify({
        file_type: 1,
        srv_send_msg: false,
        file_data: imageBuffer.toString("base64"),
        file_name: safeText(fileName) || "image.png"
      })
    });
    if (!safeText(uploaded?.file_info)) {
      throw new Error("QQ Bot 圖片上傳沒有回傳 file_info。");
    }
    const msgId = safeText(replyToMessageId);
    return apiRequest(`/v2/users/${encodeURIComponent(openId)}/messages`, {
      method: "POST",
      body: JSON.stringify({
        msg_type: 7,
        msg_seq: nextMessageSequence(),
        media: { file_info: uploaded.file_info },
        ...(msgId ? { msg_id: msgId } : {})
      })
    });
  };

  return {
    async start() {
      if (!stopped) {
        return;
      }
      stopped = false;
      try {
        await connect();
      } catch (error) {
        scheduleReconnect(error.message || "啟動失敗");
        throw error;
      }
    },
    stop() {
      stopped = true;
      setStatus(false, "已停止");
      clearReconnect();
      clearHeartbeat();
      const activeSocket = socket;
      socket = null;
      activeSocket?.close?.();
    },
    sendText,
    sendTyping,
    sendImage,
    isConnected() {
      return connected;
    }
  };
}
