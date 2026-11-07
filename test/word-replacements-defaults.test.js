import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("..", import.meta.url));
const defaults = JSON.parse(fs.readFileSync(path.join(root, "defaults/app-defaults.json"), "utf8"));

test("fresh startup and global settings import preserve author word rules and prompts", { timeout: 30000 }, async (t) => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "tavern-defaults-test-"));
  fs.cpSync(path.join(root, "src"), path.join(directory, "src"), { recursive: true });
  fs.cpSync(path.join(root, "defaults"), path.join(directory, "defaults"), {
    recursive: true, filter: (file) => !file.endsWith("gemini-argon-preset.json")
  });
  fs.copyFileSync(path.join(root, "package.json"), path.join(directory, "package.json"));
  fs.symlinkSync(path.join(root, "node_modules"), path.join(directory, "node_modules"), "dir");
  const listener = net.createServer();
  await new Promise((resolve, reject) => { listener.once("error", reject); listener.listen(0, "127.0.0.1", resolve); });
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  const server = spawn(process.execPath, ["src/index.js"], {
    cwd: directory, env: { PATH: process.env.PATH, HOME: directory, PORT: String(port), NODE_ENV: "test" },
    stdio: ["ignore", "pipe", "pipe"]
  });
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      server.kill("SIGTERM");
      await once(server, "exit");
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (server.exitCode !== null) throw new Error(`Test server exited: ${server.exitCode}`);
    try { ready = (await fetch(`${base}/api/word-replacements`)).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.equal(ready, true, "test server must start");
  const get = async (url) => (await fetch(`${base}${url}`)).json();
  const send = async (url, method, body) => {
    const response = await fetch(`${base}${url}`, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    assert.equal(response.ok, true, `${url}: ${response.status}`);
    return response.json();
  };
  assert.deepEqual((await get("/api/word-replacements")).wordReplacements, defaults.wordReplacements);
  const exported = (await get("/api/defaults/export")).defaults;
  assert.deepEqual(exported.wordReplacements, defaults.wordReplacements);
  assert.deepEqual(exported.modularPromptConfigs, defaults.modularPromptConfigs);
  const changed = { enabled: true, entries: [{ from: "測試原詞", to: "測試替換", enabled: true }] };
  await send("/api/word-replacements", "PUT", changed);
  const legacy = { ...exported };
  delete legacy.wordReplacements;
  await send("/api/defaults/import", "POST", { defaults: legacy });
  assert.deepEqual((await get("/api/word-replacements")).wordReplacements, changed);
  await send("/api/defaults/author", "POST", {});
  assert.deepEqual((await get("/api/word-replacements")).wordReplacements, defaults.wordReplacements);
  assert.deepEqual((await get("/api/defaults/export")).defaults.modularPromptConfigs, defaults.modularPromptConfigs);

  const calls = [];
  const upstream = http.createServer((req, res) => {
    const parts = [];
    req.on("data", chunk => parts.push(chunk));
    req.on("end", () => {
      calls.push({ method: req.method, url: req.url, auth: req.headers.authorization, body: Buffer.concat(parts).toString() });
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify(req.method === "GET" ? { data: [{ id: "fake-model" }] } : { choices: [{ message: { content: "OK" }, finish_reason: "stop" }] }));
    });
  });
  await new Promise((resolve, reject) => { upstream.once("error", reject); upstream.listen(0, "127.0.0.1", resolve); });
  t.after(() => new Promise(resolve => upstream.close(resolve)));
  const env = { CHAT_MODEL_API_PROVIDER: "custom", CHAT_MODEL_API_BASE_URL: `http://127.0.0.1:${upstream.address().port}/v1`, CHAT_MODEL_API_MODEL: "fake-model", CHAT_MODEL_API_KEY: "isolated-model-key", CHAT_API_KEY: "unrelated-main-key" };
  const catalog = await send("/api/chat-model-api/models", "POST", { env });
  assert.equal(catalog.ok, true);
  assert.equal(catalog.models[0].id, "fake-model");
  const connection = await send("/api/chat-model-api/test", "POST", { env });
  assert.equal(connection.ok, true);
  assert.deepEqual(calls.map(call => [call.method, call.url, call.auth]), [["GET", "/v1/models", "Bearer isolated-model-key"], ["POST", "/v1/chat/completions", "Bearer isolated-model-key"]]);
  assert.equal(JSON.parse(calls[1].body).model, "fake-model");
  const missingKey = await send("/api/chat-model-api/test", "POST", { env: { ...env, CHAT_MODEL_API_KEY: "" } });
  assert.equal(missingKey.ok, false);
  assert.equal(calls.length, 2);
  await send("/api/env", "PUT", { content: "CHAT_MODEL_API_MODE=specialist\nCHAT_MODEL_API_PROVIDER=custom\nCHAT_MODEL_API_KEY=isolated-model-key\n" });
  const exportAfterSettings = (await get("/api/defaults/export")).defaults;
  assert.equal(JSON.stringify(exportAfterSettings).includes("isolated-model-key"), false);
  assert.equal(exportAfterSettings.environment.values.CHAT_MODEL_API_KEY, undefined);
});
