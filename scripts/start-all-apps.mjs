import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, "..");
const PORTS = {
  serverDeepseek: 3234
};

const children = [];

function log(message) {
  console.log(`[launcher] ${message}`);
}

function spawnApp(label, command, args, options = {}) {
  log(`啟動 ${label}: ${command} ${args.join(" ")}`);
  const child = spawn(command, args, {
    cwd: options.cwd || ROOT_DIR,
    env: { ...process.env, ...(options.env || {}) },
    stdio: ["ignore", "pipe", "pipe"]
  });
  children.push({ label, child });

  const prefixOutput = (stream, writer) => {
    let buffer = "";
    stream.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      lines.forEach((line) => writer(`[${label}] ${line}\n`));
    });
  };

  prefixOutput(child.stdout, (line) => process.stdout.write(line));
  prefixOutput(child.stderr, (line) => process.stderr.write(line));
  child.on("exit", (code, signal) => {
    log(`${label} 已結束 (${signal || code})`);
  });
  return child;
}

function openLauncherPage() {
  if (process.env.OPEN_LAUNCHER === "0") {
    return;
  }
  const url = `http://localhost:${PORTS.serverDeepseek}/launcher.html`;
  setTimeout(() => {
    if (process.platform === "darwin") {
      spawn("open", [url], { detached: true, stdio: "ignore" }).unref();
    } else if (process.platform === "win32") {
      spawn("cmd", ["/c", "start", "", url], { detached: true, stdio: "ignore" }).unref();
    } else {
      spawn("xdg-open", [url], { detached: true, stdio: "ignore" }).unref();
    }
  }, 2500);
}

function shutdown() {
  log("正在停止所有子程序...");
  children.forEach(({ child }) => {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  });
  setTimeout(() => process.exit(0), 1000).unref();
}

async function main() {
  spawnApp("server_deepseek", "npm", ["start"], {
    cwd: ROOT_DIR,
    env: { PORT: String(PORTS.serverDeepseek) }
  });

  log("主頁面：http://localhost:3234/launcher.html");
  log("按 Ctrl+C 可停止由此腳本啟動的服務。");
  openLauncherPage();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

main().catch((error) => {
  console.error(`[launcher] 啟動失敗：${error.message}`);
  shutdown();
});
