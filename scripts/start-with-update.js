import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_FILE), "..");
const UPDATE_TIMEOUT_MS = 30_000;
const INSTALL_TIMEOUT_MS = 180_000;

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
    timeout: options.timeout ?? UPDATE_TIMEOUT_MS,
    stdio: options.inherit ? "inherit" : "pipe"
  });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(String(result.stderr || result.stdout || `${command} 執行失敗`).trim());
  }
  return String(result.stdout || "").trim();
}

export function parseGitDivergence(value = "") {
  const [ahead = 0, behind = 0] = String(value).trim().split(/\s+/u).map(Number);
  return {
    ahead: Number.isFinite(ahead) ? ahead : 0,
    behind: Number.isFinite(behind) ? behind : 0
  };
}

export function chooseUpdateAction({ clean, ahead, behind }) {
  if (!clean) return "skip-dirty";
  if (ahead > 0) return behind > 0 ? "skip-diverged" : "skip-ahead";
  if (behind > 0) return "fast-forward";
  return "current";
}

function installUpdatedDependencies(changedFiles = []) {
  const dependencyFiles = new Set(["package.json", "package-lock.json", "npm-shrinkwrap.json"]);
  if (!changedFiles.some((file) => dependencyFiles.has(file))) {
    return;
  }
  console.log("[更新] 偵測到依賴設定變更，正在執行 npm install...");
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  run(npmCommand, ["install", "--no-audit", "--no-fund"], {
    inherit: true,
    timeout: INSTALL_TIMEOUT_MS
  });
}

export function updateFromTrackedGitBranch() {
  if (["0", "false", "off"].includes(String(process.env.TIME_TAVERN_AUTO_UPDATE || "").toLowerCase())) {
    console.log("[更新] 已由 TIME_TAVERN_AUTO_UPDATE 關閉自動更新。");
    return { action: "disabled" };
  }

  try {
    if (run("git", ["rev-parse", "--is-inside-work-tree"]) !== "true") {
      return { action: "not-git" };
    }

    const upstream = run("git", ["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
    const remote = upstream.split("/", 1)[0];
    const cleanBeforeFetch = run("git", ["status", "--porcelain"]).length === 0;
    console.log(`[更新] 正在檢查 ${upstream}...`);
    run("git", ["fetch", "--prune", remote]);

    const clean = cleanBeforeFetch && run("git", ["status", "--porcelain"]).length === 0;
    const divergence = parseGitDivergence(run("git", ["rev-list", "--left-right", "--count", `HEAD...${upstream}`]));
    const action = chooseUpdateAction({ clean, ...divergence });

    if (action === "current") {
      console.log("[更新] 已是 GitHub 最新版本。");
      return { action, upstream, ...divergence };
    }
    if (action === "skip-dirty") {
      console.warn("[更新] 偵測到本機檔案改動，已跳過自動更新並保留現有內容。");
      return { action, upstream, ...divergence };
    }
    if (action === "skip-ahead" || action === "skip-diverged") {
      console.warn("[更新] 本機分支含有未推送或分岔 commit，已跳過自動更新。");
      return { action, upstream, ...divergence };
    }

    const previousHead = run("git", ["rev-parse", "HEAD"]);
    run("git", ["merge", "--ff-only", upstream]);
    const currentHead = run("git", ["rev-parse", "HEAD"]);
    const changedFiles = run("git", ["diff", "--name-only", previousHead, currentHead]).split(/\r?\n/u).filter(Boolean);
    console.log(`[更新] 已更新到 ${currentHead.slice(0, 7)}。`);
    installUpdatedDependencies(changedFiles);
    return { action, upstream, previousHead, currentHead, changedFiles, ...divergence };
  } catch (error) {
    console.warn(`[更新] 自動更新失敗，將使用目前版本啟動：${error.message}`);
    return { action: "failed", error: error.message };
  }
}

async function start() {
  updateFromTrackedGitBranch();
  await import("../src/index.js");
}

if (path.resolve(process.argv[1] || "") === SCRIPT_FILE) {
  start().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
