import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { stripLeadingContextRoundLabels } from "../src/context-rounds.js";

const serverSource = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");

test("recent dialogue keeps API roles separate from message content", () => {
  const functionStart = serverSource.indexOf("function buildCacheableDialogueMessages(messages = [])");
  const functionEnd = serverSource.indexOf("\nfunction getCompletedDialogueRoundsBeforeLatestUser", functionStart);
  const functionSource = serverSource.slice(functionStart, functionEnd);

  assert.match(functionSource, /\? \{ role, content: normalizedContent \}/u);
  assert.doesNotMatch(functionSource, /#\$\{|labels\[|getContextMessageRoundLabels/u);
});

test("combined compression context uses roles without numeric labels", () => {
  const functionStart = serverSource.indexOf("function formatCompressionContextBlock(messages = [])");
  const functionEnd = serverSource.indexOf("\nfunction buildCompressionRoleCardContextMessage", functionStart);
  const functionSource = serverSource.slice(functionStart, functionEnd);

  assert.match(functionSource, /message\?\.role === "assistant" \? "\[assistant\]" : "\[user\]"/u);
  assert.doesNotMatch(functionSource, /getContextMessageRoundLabels|#\$\{/u);
});

test("existing context round labels are removed before rebuilding context", () => {
  assert.equal(
    stripLeadingContextRoundLabels([
      "#5 assistant",
      "#2 assistant",
      "#1 assistant",
      "正文內容"
    ].join("\n")),
    "正文內容"
  );
});

test("ordinary headings in message content are preserved", () => {
  assert.equal(
    stripLeadingContextRoundLabels("# 第一章\n正文內容"),
    "# 第一章\n正文內容"
  );
});
