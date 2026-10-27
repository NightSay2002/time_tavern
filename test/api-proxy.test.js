import assert from "node:assert/strict";
import fs from "node:fs";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { execFile, spawnSync } from "node:child_process";
import { once } from "node:events";
import { promisify } from "node:util";
import test from "node:test";
import { fetchModelApi, getApiProxyDispatcher, resolveApiProxySettings } from "../src/api-proxy.js";

async function listen(t, server) {
  const sockets = new Set();
  server.on("connection", socket => {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    getApiProxyDispatcher({});
    for (const socket of sockets) socket.destroy();
    return new Promise(resolve => server.close(resolve));
  });
  return `${server instanceof https.Server ? "https" : "http"}://127.0.0.1:${server.address().port}`;
}

function createProxy({ token = "", tls = null, reject = false } = {}) {
  const server = tls ? https.createServer(tls) : http.createServer();
  const connections = [];
  server.on("connect", (req, downstream, head) => {
    connections.push({ target: req.url, authorization: req.headers["proxy-authorization"] });
    if (reject || (token && req.headers["proxy-authorization"] !== token)) {
      downstream.end("HTTP/1.1 407 Proxy Authentication Required\r\nContent-Length: 0\r\n\r\n");
      return;
    }
    const target = new URL(`http://${req.url}`);
    const upstream = net.connect(Number(target.port), target.hostname);
    upstream.on("connect", () => {
      downstream.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length) upstream.write(head);
      downstream.pipe(upstream);
      upstream.pipe(downstream);
    });
    upstream.on("error", () => downstream.destroy());
    downstream.on("error", () => upstream.destroy());
    downstream.on("close", () => upstream.destroy());
  });
  return { server, connections };
}

test("proxy settings accept host:port, URL credentials and separate authentication without exposing secrets", () => {
  assert.equal(resolveApiProxySettings({ API_PROXY_URL: "", API_PROXY_PASSWORD: "preserved" }), null);
  assert.deepEqual(resolveApiProxySettings({ API_PROXY_URL: "127.0.0.1:8888" }), {
    uri: "http://127.0.0.1:8888", token: undefined
  });
  const settings = resolveApiProxySettings({ API_PROXY_URL: "https://name:p%40ss@proxy.test:443" });
  assert.equal(settings.uri, "https://proxy.test");
  assert.equal(settings.token, `Basic ${Buffer.from("name:p@ss").toString("base64")}`);
  const explicit = resolveApiProxySettings({
    API_PROXY_URL: "http://old:old@proxy.test:8080", API_PROXY_USERNAME: "new", API_PROXY_PASSWORD: "space @:/ pass"
  });
  assert.equal(explicit.uri, "http://proxy.test:8080");
  assert.equal(explicit.token, `Basic ${Buffer.from("new:space @:/ pass").toString("base64")}`);
  for (const address of ["socks5://name:secret@proxy.test:1080", "http://name:secret@proxy.test/path", "http://proxy.test?secret=yes", "http://proxy.test:bad"]) {
    assert.throws(() => resolveApiProxySettings({ API_PROXY_URL: address }), error => {
      assert.equal(error.code, "INVALID_API_PROXY");
      assert.doesNotMatch(error.message, /secret|name@|proxy\.test/u);
      return true;
    });
  }
});

test("authenticated proxy tunnels API requests, reuses connections and preserves streaming", async t => {
  const seen = [];
  const target = await listen(t, http.createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    seen.push({ authorization: req.headers.authorization, proxyAuthorization: req.headers["proxy-authorization"], body });
    res.write("first");
    setTimeout(() => res.end("last"), 20);
  }));
  const token = `Basic ${Buffer.from("account:password").toString("base64")}`;
  const proxy = createProxy({ token });
  const proxyUrl = await listen(t, proxy.server);
  const env = { API_PROXY_URL: proxyUrl, API_PROXY_USERNAME: "account", API_PROXY_PASSWORD: "password" };
  assert.equal(getApiProxyDispatcher(env), getApiProxyDispatcher(env));
  const response = await fetchModelApi(target, { method: "POST", headers: { Authorization: "Bearer model-key" }, body: "request-body" }, env);
  assert.equal(response.bodyUsed, false);
  assert.equal(await response.text(), "firstlast");
  assert.equal(await (await fetchModelApi(target, {}, env)).text(), "firstlast");
  assert.ok(proxy.connections.length > 0);
  assert.ok(proxy.connections.every(item => item.authorization === token));
  assert.equal(seen[0].authorization, "Bearer model-key");
  assert.equal(seen[0].body, "request-body");
  assert.ok(seen.every(item => item.proxyAuthorization === undefined));
});

test("changing or clearing proxy settings completes existing streams and takes effect on the next request", async t => {
  const target = await listen(t, http.createServer((req, res) => {
    res.write("begin");
    setTimeout(() => res.end("end"), 50);
  }));
  const first = createProxy();
  const second = createProxy();
  const firstEnv = { API_PROXY_URL: await listen(t, first.server) };
  const secondEnv = { API_PROXY_URL: await listen(t, second.server) };
  const response = await fetchModelApi(target, {}, firstEnv);
  const dispatcher = getApiProxyDispatcher(firstEnv);
  assert.notEqual(getApiProxyDispatcher(secondEnv), dispatcher);
  assert.equal(await response.text(), "beginend");
  assert.equal(await (await fetchModelApi(target, {}, secondEnv)).text(), "beginend");
  assert.ok(first.connections.length > 0 && second.connections.length > 0);
  const count = second.connections.length;
  assert.equal(getApiProxyDispatcher({}), undefined);
  assert.equal(await (await fetchModelApi(target, {}, {})).text(), "beginend");
  assert.equal(second.connections.length, count);
});

test("proxy authentication failures never fall back to direct connections and abort remains effective", async t => {
  let targetCalls = 0;
  const target = await listen(t, http.createServer((req, res) => { targetCalls += 1; res.end("direct"); }));
  const proxy = createProxy({ reject: true });
  const proxyUrl = await listen(t, proxy.server);
  await assert.rejects(fetchModelApi(target, { signal: AbortSignal.timeout(1000) }, { API_PROXY_URL: proxyUrl }));
  assert.equal(targetCalls, 0);
  const blocked = http.createServer();
  blocked.on("connect", () => {});
  const blockedUrl = await listen(t, blocked);
  await assert.rejects(fetchModelApi(target, { signal: AbortSignal.timeout(50) }, { API_PROXY_URL: blockedUrl }), { name: "TimeoutError" });
  assert.equal(targetCalls, 0);
});

test("HTTP and HTTPS proxies reach verified HTTPS endpoints without disabling certificate validation", async t => {
  if (spawnSync("openssl", ["version"]).status !== 0) return t.skip("openssl is not installed");
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "api-proxy-tls-"));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const keyFile = path.join(directory, "key.pem");
  const certFile = path.join(directory, "cert.pem");
  const certificate = spawnSync("openssl", [
    "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1", "-subj", "/CN=localhost",
    "-addext", "subjectAltName=IP:127.0.0.1,DNS:localhost", "-keyout", keyFile, "-out", certFile
  ], { encoding: "utf8" });
  assert.equal(certificate.status, 0, certificate.stderr);
  const tls = { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) };
  const target = await listen(t, https.createServer(tls, (req, res) => res.end("secure-response")));
  const plainProxy = createProxy();
  const secureProxy = createProxy({ tls });
  const plainUrl = await listen(t, plainProxy.server);
  const secureUrl = await listen(t, secureProxy.server);
  const moduleUrl = new URL("../src/api-proxy.js", import.meta.url).href;
  const script = `
    const { fetchModelApi, getApiProxyDispatcher } = await import(process.argv[1]);
    for (const proxy of process.argv.slice(3)) {
      const response = await fetchModelApi(process.argv[2], {}, { API_PROXY_URL: proxy });
      if (await response.text() !== "secure-response") throw new Error("invalid response");
    }
    await getApiProxyDispatcher({ API_PROXY_URL: process.argv.at(-1) }).close();
  `;
  await promisify(execFile)(process.execPath, ["--input-type=module", "-e", script, moduleUrl, target, plainUrl, secureUrl], {
    env: { PATH: process.env.PATH, NODE_EXTRA_CA_CERTS: certFile }, timeout: 10000
  });
  assert.ok(plainProxy.connections.length > 0 && secureProxy.connections.length > 0);
  await assert.rejects(fetchModelApi(target, { signal: AbortSignal.timeout(1000) }, { API_PROXY_URL: plainUrl }));
});
