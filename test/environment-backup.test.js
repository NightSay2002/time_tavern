import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  ENV_BACKUP_FILE_NAME,
  syncEnvironmentBackup
} from "../src/environment-backup.js";

function createTestPaths() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "time-tavern-env-"));
  return {
    root,
    envFile: path.join(root, ".env"),
    dataDir: path.join(root, "data"),
    backupFile: path.join(root, "data", ENV_BACKUP_FILE_NAME)
  };
}

test("existing .env is copied exactly into data", (t) => {
  const paths = createTestPaths();
  t.after(() => fs.rmSync(paths.root, { recursive: true, force: true }));
  const content = "CHAT_API_KEY=secret-value\nPORT=3234\n";
  fs.writeFileSync(paths.envFile, content, "utf8");

  const result = syncEnvironmentBackup(paths);

  assert.equal(result.action, "backed-up");
  assert.equal(fs.readFileSync(paths.backupFile, "utf8"), content);
});

test("missing .env is restored from the data backup", (t) => {
  const paths = createTestPaths();
  t.after(() => fs.rmSync(paths.root, { recursive: true, force: true }));
  const content = "NOVELAI_API_TOKEN=persistent-token\n";
  fs.mkdirSync(paths.dataDir, { recursive: true });
  fs.writeFileSync(paths.backupFile, content, "utf8");

  const result = syncEnvironmentBackup(paths);

  assert.equal(result.action, "restored");
  assert.equal(fs.readFileSync(paths.envFile, "utf8"), content);
});

test("root .env remains authoritative when both files exist", (t) => {
  const paths = createTestPaths();
  t.after(() => fs.rmSync(paths.root, { recursive: true, force: true }));
  fs.mkdirSync(paths.dataDir, { recursive: true });
  fs.writeFileSync(paths.envFile, "PORT=4000\n", "utf8");
  fs.writeFileSync(paths.backupFile, "PORT=3234\n", "utf8");

  syncEnvironmentBackup(paths);

  assert.equal(fs.readFileSync(paths.envFile, "utf8"), "PORT=4000\n");
  assert.equal(fs.readFileSync(paths.backupFile, "utf8"), "PORT=4000\n");
});

test("missing source and backup leaves both files absent", (t) => {
  const paths = createTestPaths();
  t.after(() => fs.rmSync(paths.root, { recursive: true, force: true }));

  const result = syncEnvironmentBackup(paths);

  assert.equal(result.action, "missing");
  assert.equal(fs.existsSync(paths.envFile), false);
  assert.equal(fs.existsSync(paths.backupFile), false);
});
