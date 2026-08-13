import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: "utf8",
    ...options
  });
}

test("macOS bootstrap installs and reuses a verified project Node.js runtime", {
  skip: process.platform !== "darwin"
}, (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "time-tavern-node-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const projectRoot = path.join(root, "project");
  const distRoot = path.join(root, "dist");
  const buildRoot = path.join(root, "build");
  const releaseName = "node-v24.99.0-darwin-arm64";
  const releaseRoot = path.join(buildRoot, releaseName);
  const archiveName = `${releaseName}.tar.gz`;
  const archiveFile = path.join(distRoot, archiveName);
  fs.mkdirSync(path.join(releaseRoot, "bin"), { recursive: true });
  fs.mkdirSync(projectRoot, { recursive: true });
  fs.mkdirSync(distRoot, { recursive: true });

  const fakeNode = "#!/bin/sh\nif [ \"$1\" = \"-p\" ]; then echo 24; else echo v24.99.0; fi\n";
  fs.writeFileSync(path.join(releaseRoot, "bin", "node"), fakeNode, "utf8");
  fs.writeFileSync(path.join(releaseRoot, "bin", "npm"), "#!/bin/sh\nexit 0\n", "utf8");
  fs.chmodSync(path.join(releaseRoot, "bin", "node"), 0o755);
  fs.chmodSync(path.join(releaseRoot, "bin", "npm"), 0o755);

  const archiveResult = run("tar", ["-czf", archiveFile, "-C", buildRoot, releaseName]);
  assert.equal(archiveResult.status, 0, archiveResult.stderr);
  const archiveHash = crypto.createHash("sha256").update(fs.readFileSync(archiveFile)).digest("hex");
  fs.writeFileSync(path.join(distRoot, "SHASUMS256.txt"), `${archiveHash}  ${archiveName}\n`, "utf8");

  const bootstrapFile = path.join(REPO_ROOT, "scripts", "bootstrap-node-mac.sh");
  const environment = {
    ...process.env,
    TIME_TAVERN_NODE_ARCH: "arm64",
    TIME_TAVERN_NODE_DIST_BASE: `file://${distRoot}`
  };
  const installResult = run("zsh", [bootstrapFile, projectRoot], { env: environment });
  assert.equal(installResult.status, 0, installResult.stderr);
  assert.equal(
    fs.existsSync(path.join(projectRoot, ".runtime", "node", "bin", "node")),
    true
  );

  fs.rmSync(distRoot, { recursive: true, force: true });
  const reuseResult = run("zsh", [bootstrapFile, projectRoot], {
    env: {
      ...environment,
      TIME_TAVERN_NODE_DIST_BASE: "file:///missing-node-distribution"
    }
  });
  assert.equal(reuseResult.status, 0, reuseResult.stderr);
});

test("launchers use the project runtime bootstrap and verify downloads", () => {
  const macLauncher = fs.readFileSync(path.join(REPO_ROOT, "start-mac.command"), "utf8");
  const windowsLauncher = fs.readFileSync(path.join(REPO_ROOT, "start-win.bat"), "utf8");
  const macBootstrap = fs.readFileSync(path.join(REPO_ROOT, "scripts", "bootstrap-node-mac.sh"), "utf8");
  const windowsBootstrap = fs.readFileSync(path.join(REPO_ROOT, "scripts", "bootstrap-node-win.ps1"), "utf8");
  const gitignore = fs.readFileSync(path.join(REPO_ROOT, ".gitignore"), "utf8");

  assert.match(macLauncher, /bootstrap-node-mac\.sh/u);
  assert.match(macLauncher, /\.runtime\/node\/bin/u);
  assert.match(windowsLauncher, /bootstrap-node-win\.ps1/u);
  assert.match(windowsLauncher, /\.runtime\\node/u);
  assert.match(macBootstrap, /shasum -a 256/u);
  assert.match(windowsBootstrap, /Get-FileHash -Algorithm SHA256/u);
  assert.match(gitignore, /^\.runtime\/$/mu);
});
