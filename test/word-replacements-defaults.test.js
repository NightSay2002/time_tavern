import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";
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
});
