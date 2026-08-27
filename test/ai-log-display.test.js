import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const webSource = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");

test("AI log display does not add message indexes as context round labels", () => {
  const formatterStart = webSource.indexOf("function formatAiLogMessages(messages, contentStore = {})");
  const formatterEnd = webSource.indexOf("\nfunction renderAiLogs", formatterStart);
  const formatter = webSource.slice(formatterStart, formatterEnd);

  assert.match(formatter, /\.map\(\(message\) => formatAiLogMessage\(\{/u);
  assert.match(formatter, /content: resolveAiLogStoredText\(message, "content", contentStore\)/u);
  assert.doesNotMatch(formatter, /#\$\{index \+ 1\}/u);
});

test("AI log display removes nested context labels while retaining the first label", () => {
  assert.match(webSource, /const contextLabelMatch = content\.match\(AI_LOG_CONTEXT_ROUND_LABEL_PATTERN\);/u);
  assert.match(
    webSource,
    /while \(AI_LOG_CONTEXT_ROUND_LABEL_PATTERN\.test\(messageContent\)\)/u
  );
  assert.match(
    webSource,
    /return \[contextLabelMatch\[0\]\.trim\(\), messageContent \|\| "\(空白\)"\]\.join\("\\n"\);/u
  );
});
