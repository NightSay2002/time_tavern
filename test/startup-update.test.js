import test from "node:test";
import assert from "node:assert/strict";
import { chooseUpdateAction, parseGitDivergence } from "../scripts/start-with-update.js";

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
