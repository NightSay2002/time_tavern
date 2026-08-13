import fs from "node:fs";
import path from "node:path";

export const ENV_BACKUP_FILE_NAME = "environment.env";

function writePrivateFile(filePath, content) {
  const directory = path.dirname(filePath);
  const temporaryFile = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  );
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(temporaryFile, content, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(temporaryFile, filePath);
  try {
    fs.chmodSync(filePath, 0o600);
  } catch {
    // Some filesystems do not support POSIX permissions.
  }
}

export function syncEnvironmentBackup({ envFile, dataDir }) {
  const backupFile = path.join(dataDir, ENV_BACKUP_FILE_NAME);

  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, "utf8");
    const backupIsCurrent = fs.existsSync(backupFile) &&
      fs.readFileSync(backupFile, "utf8") === content;
    if (!backupIsCurrent) {
      writePrivateFile(backupFile, content);
    }
    return {
      action: backupIsCurrent ? "current" : "backed-up",
      backupFile
    };
  }

  if (fs.existsSync(backupFile)) {
    writePrivateFile(envFile, fs.readFileSync(backupFile, "utf8"));
    return { action: "restored", backupFile };
  }

  return { action: "missing", backupFile };
}
