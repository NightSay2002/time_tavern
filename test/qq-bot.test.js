import assert from "node:assert/strict";
import test from "node:test";

import {
  createQqBotClient,
  isAllowedQqUser,
  QQ_BOT_API_BASE_URL,
  QQ_BOT_TOKEN_URL,
  QQ_C2C_INTENTS,
  splitQqMessageText
} from "../src/qq-bot.js";

class FakeWebSocket {
  static OPEN = 1;
  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = FakeWebSocket.OPEN;
    this.handlers = new Map();
    this.sent = [];
    FakeWebSocket.instances.push(this);
  }

  on(name, handler) {
    this.handlers.set(name, handler);
  }

  emit(name, ...args) {
    this.handlers.get(name)?.(...args);
  }

  send(value) {
    this.sent.push(JSON.parse(value));
  }

  close() {
    this.readyState = 3;
  }
}

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(data);
    }
  };
}

function createQqFetchRecorder() {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (url === QQ_BOT_TOKEN_URL) {
      return jsonResponse({ access_token: "test-token", expires_in: 7200 });
    }
    if (url === `${QQ_BOT_API_BASE_URL}/gateway`) {
      return jsonResponse({ url: "wss://example.test/gateway" });
    }
    return jsonResponse({ id: `reply-${requests.length}` });
  };
  return { requests, fetchImpl };
}

const tick = () => new Promise((resolve) => setImmediate(resolve));

test("QQ access control permits all users unless an OpenID is configured", () => {
  assert.equal(isAllowedQqUser("user-a", ""), true);
  assert.equal(isAllowedQqUser("user-a", "user-a"), true);
  assert.equal(isAllowedQqUser("user-b", "user-a"), false);
});

test("QQ text replies split at the official 4000-character limit", () => {
  assert.deepEqual(splitQqMessageText("a".repeat(8001)).map((item) => item.length), [4000, 4000, 1]);
});

test("QQ Gateway identifies with the C2C intent and only emits C2C messages", async (t) => {
  FakeWebSocket.instances = [];
  const { requests, fetchImpl } = createQqFetchRecorder();
  const messages = [];
  const client = createQqBotClient({
    appId: "app-id",
    appSecret: "app-secret",
    fetchImpl,
    WebSocketImpl: FakeWebSocket,
    onMessage: (message) => messages.push(message),
    logger: { error() {}, warn() {} }
  });
  t.after(() => client.stop());

  await client.start();
  assert.equal(requests[0].url, QQ_BOT_TOKEN_URL);
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    appId: "app-id",
    clientSecret: "app-secret"
  });

  const socket = FakeWebSocket.instances[0];
  socket.emit("message", JSON.stringify({ op: 10, d: { heartbeat_interval: 60_000 } }));
  await tick();
  assert.equal(socket.sent[0].op, 2);
  assert.equal(socket.sent[0].d.intents, QQ_C2C_INTENTS);
  assert.equal(socket.sent[0].d.token, "QQBot test-token");

  socket.emit("message", JSON.stringify({ op: 0, t: "GROUP_AT_MESSAGE_CREATE", s: 1, d: { id: "group" } }));
  socket.emit("message", JSON.stringify({
    op: 0,
    t: "C2C_MESSAGE_CREATE",
    s: 2,
    d: { id: "c2c-1", content: "hello", author: { user_openid: "user-a" } }
  }));
  socket.emit("message", JSON.stringify({
    op: 0,
    t: "C2C_MESSAGE_CREATE",
    s: 3,
    d: { id: "c2c-1", content: "duplicate", author: { user_openid: "user-a" } }
  }));
  await tick();
  assert.equal(messages.length, 1);
  assert.equal(messages[0].content, "hello");
});

test("QQ C2C replies use the user endpoint, reply message id and unique sequences", async (t) => {
  FakeWebSocket.instances = [];
  const { requests, fetchImpl } = createQqFetchRecorder();
  const client = createQqBotClient({
    appId: "app-id",
    appSecret: "app-secret",
    fetchImpl,
    WebSocketImpl: FakeWebSocket,
    logger: { error() {}, warn() {} }
  });
  t.after(() => client.stop());
  await client.start();

  await client.sendText({
    userOpenId: "open/id",
    content: "x".repeat(4001),
    replyToMessageId: "incoming-1"
  });
  const messageRequests = requests.filter((item) => item.url.includes("/v2/users/"));
  assert.equal(messageRequests.length, 2);
  assert.ok(messageRequests.every((item) => item.url === `${QQ_BOT_API_BASE_URL}/v2/users/open%2Fid/messages`));
  const bodies = messageRequests.map((item) => JSON.parse(item.options.body));
  assert.deepEqual(bodies.map((body) => body.content.length), [4000, 1]);
  assert.ok(bodies.every((body) => body.msg_type === 0 && body.msg_id === "incoming-1"));
  assert.notEqual(bodies[0].msg_seq, bodies[1].msg_seq);
});
