import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseUpdateAction,
  getProjectStatusEntries,
  isLegacyMutablePath,
  isProjectUpdatePath,
  parseGitDivergence,
  parseGitStatusEntries
} from "../scripts/start-with-update.js";

test("git divergence output is parsed as ahead and behind counts", () => {
  assert.deepEqual(parseGitDivergence("2\t5"), { ahead: 2, behind: 5 });
});

test("startup updater only fast-forwards a clean branch that is behind", () => {
  assert.equal(chooseUpdateAction({ clean: true, ahead: 0, behind: 2 }), "fast-forward");
  assert.equal(chooseUpdateAction({ clean: true, ahead: 0, behind: 0 }), "current");
  assert.equal(chooseUpdateAction({ clean: false, ahead: 0, behind: 2 }), "skip-dirty");
  assert.equal(chooseUpdateAction({ clean: true, ahead: 1, behind: 0 }), "skip-ahead");
  assert.equal(chooseUpdateAction({ clean: true, ahead: 1, behind: 1 }), "skip-diverged");
});

test("legacy user-owned defaults are recognized separately from code changes", () => {
  assert.equal(isLegacyMutablePath("defaults/app-defaults.json"), true);
  assert.equal(isLegacyMutablePath("defaults/novelai-defaults.json"), true);
  assert.equal(isLegacyMutablePath("prompts/modular/multi.json"), true);
  assert.equal(isLegacyMutablePath("src/index.js"), false);
});

test("git porcelain entries preserve index and worktree status", () => {
  assert.deepEqual(
    parseGitStatusEntries(" M defaults/app-defaults.json\nM  src/index.js\n"),
    [
      { indexStatus: " ", worktreeStatus: "M", path: "defaults/app-defaults.json" },
      { indexStatus: "M", worktreeStatus: " ", path: "src/index.js" }
    ]
  );
});

test("startup update scope ignores server manager runtime files", () => {
  assert.equal(isProjectUpdatePath(".server-manager/logs/deepseek-bot.log"), false);
  assert.equal(isProjectUpdatePath(".server-manager/runtime.json"), false);
  assert.equal(isProjectUpdatePath("src/index.js"), true);
  assert.equal(isProjectUpdatePath("docs/DETAILS.md"), true);
  assert.equal(isProjectUpdatePath("new-project-file.js"), true);

  assert.deepEqual(
    getProjectStatusEntries(
      " M .server-manager/logs/deepseek-bot.log\n" +
      "?? .server-manager/runtime.json\n" +
      " M src/index.js\n" +
      "?? new-project-file.js\n"
    ),
    [
      { indexStatus: " ", worktreeStatus: "M", path: "src/index.js" },
      { indexStatus: "?", worktreeStatus: "?", path: "new-project-file.js" }
    ]
  );
});
