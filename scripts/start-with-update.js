import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const SCRIPT_FILE = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_FILE), "..");
const DATA_DIR = path.join(REPO_ROOT, "data");
const BUNDLED_APP_DEFAULTS_FILE = path.join(REPO_ROOT, "defaults", "app-defaults.json");
const LOCAL_APP_DEFAULTS_FILE = path.join(DATA_DIR, "app-defaults.json");
const BUNDLED_NOVELAI_DEFAULTS_FILE = path.join(REPO_ROOT, "defaults", "novelai-defaults.json");
const LOCAL_NOVELAI_DEFAULTS_FILE = path.join(DATA_DIR, "novelai-defaults.json");
const LEGACY_PROMPTS_DIR = path.join(REPO_ROOT, "prompts");
const UPDATE_TIMEOUT_MS = 30_000;
const INSTALL_TIMEOUT_MS = 180_000;

dotenv.config({ path: path.join(REPO_ROOT, ".env") });

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

export function parseGitStatusEntries(value = "") {
  return String(value)
    .split(/\r?\n/u)
    .filter((line) => line.length >= 4)
    .map((line) => {
      const rawPath = line.slice(3).trim();
      return {
        indexStatus: line[0],
        worktreeStatus: line[1],
        path: rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath
      };
    });
}

export function isLegacyMutablePath(filePath = "") {
  const normalized = String(filePath).replaceAll("\\", "/");
  return normalized === "defaults/app-defaults.json" ||
    normalized === "defaults/novelai-defaults.json" ||
    normalized === "prompts" ||
    normalized.startsWith("prompts/");
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporaryFile = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(temporaryFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    fs.renameSync(temporaryFile, filePath);
  } finally {
    if (fs.existsSync(temporaryFile)) {
      fs.unlinkSync(temporaryFile);
    }
  }
}

function mergeLegacyPrompts(defaultsInput = {}) {
  const defaults = structuredClone(defaultsInput);
  const modularDirectory = path.join(LEGACY_PROMPTS_DIR, "modular");
  const modularPromptConfigs = defaults.modularPromptConfigs &&
    typeof defaults.modularPromptConfigs === "object" &&
    !Array.isArray(defaults.modularPromptConfigs)
    ? structuredClone(defaults.modularPromptConfigs)
    : {};

  if (fs.existsSync(modularDirectory)) {
    fs.readdirSync(modularDirectory)
      .filter((fileName) => fileName.endsWith(".json"))
      .forEach((fileName) => {
        const config = readJson(path.join(modularDirectory, fileName));
        const mode = String(config?.mode || path.basename(fileName, ".json")).trim();
        if (mode && config) {
          modularPromptConfigs[mode] = config;
        }
      });
  }
  if (Object.keys(modularPromptConfigs).length > 0) {
    defaults.modularPromptConfigs = modularPromptConfigs;
  }

  const assistantPromptFile = path.join(LEGACY_PROMPTS_DIR, "CharacterCardCreationAssistant.txt");
  if (fs.existsSync(assistantPromptFile) && Array.isArray(defaults.assistantCards)) {
    const prompt = fs.readFileSync(assistantPromptFile, "utf8").trim();
    if (prompt) {
      defaults.assistantCards = defaults.assistantCards.map((card) =>
        card?.id === "CharacterCardCreationAssistant" ? { ...card, prompt } : card
      );
    }
  }

  const compressionPromptFile = path.join(LEGACY_PROMPTS_DIR, "Context_compression.txt");
  if (fs.existsSync(compressionPromptFile)) {
    const prompt = fs.readFileSync(compressionPromptFile, "utf8").trim();
    if (prompt) {
      defaults.contextCompressionPrompt = prompt;
    }
  }
  return defaults;
}

function ensureLocalDefaultsSnapshot() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LOCAL_APP_DEFAULTS_FILE)) {
    const bundled = readJson(BUNDLED_APP_DEFAULTS_FILE);
    if (bundled) {
      writeJson(LOCAL_APP_DEFAULTS_FILE, mergeLegacyPrompts(bundled));
    }
  }
  if (!fs.existsSync(LOCAL_NOVELAI_DEFAULTS_FILE)) {
    const bundled = readJson(BUNDLED_NOVELAI_DEFAULTS_FILE);
    if (bundled) {
      writeJson(LOCAL_NOVELAI_DEFAULTS_FILE, bundled);
    }
  }
}

function migrateLegacyMutableChanges() {
  ensureLocalDefaultsSnapshot();
  const entries = parseGitStatusEntries(
    run("git", ["status", "--porcelain", "--untracked-files=no"])
  ).filter((entry) => isLegacyMutablePath(entry.path));
  if (entries.length === 0) {
    return [];
  }
  if (entries.some((entry) => entry.indexStatus !== " ")) {
    console.warn("[更新] 預設或舊 Prompt 有已暫存的 Git 改動，為避免覆蓋已跳過自動遷移。");
    return [];
  }

  const changedPaths = entries.map((entry) => entry.path);
  const appDefaultsChanged = changedPaths.includes("defaults/app-defaults.json");
  const promptsChanged = changedPaths.some((filePath) => filePath === "prompts" || filePath.startsWith("prompts/"));
  if (appDefaultsChanged || promptsChanged) {
    const base = appDefaultsChanged
      ? readJson(BUNDLED_APP_DEFAULTS_FILE)
      : readJson(LOCAL_APP_DEFAULTS_FILE) || readJson(BUNDLED_APP_DEFAULTS_FILE);
    if (!base) {
      throw new Error("無法讀取舊版主功能預設，未變更 Git 工作區。");
    }
    writeJson(LOCAL_APP_DEFAULTS_FILE, mergeLegacyPrompts(base));
  }

  if (changedPaths.includes("defaults/novelai-defaults.json")) {
    const defaults = readJson(BUNDLED_NOVELAI_DEFAULTS_FILE);
    if (!defaults) {
      throw new Error("無法讀取舊版 NovelAI 預設，未變更 Git 工作區。");
    }
    writeJson(LOCAL_NOVELAI_DEFAULTS_FILE, defaults);
  }

  run("git", ["restore", "--worktree", "--", ...changedPaths]);
  console.log(`[更新] 已保留 ${changedPaths.length} 個使用者預設改動到 data/，並清理舊版追蹤檔。`);
  return changedPaths;
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

    migrateLegacyMutableChanges();
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
