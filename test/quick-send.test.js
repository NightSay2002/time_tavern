import test from "node:test";
import assert from "node:assert/strict";

import { hasKeepTimeDirective, stripKeepTimeDirective } from "../src/keep-time.js";
import { buildQuickSendContent, QUICK_SEND_TEMPLATES } from "../src/quick-send.js";
import { UI_LANGUAGE_SIMPLIFIED } from "../src/ui-language.js";

test("every quick send template accepts inside and message details", () => {
  const expected = {
    keep_time: "{{保持時間xxx}}\nzzzz",
    next_scene: "｛推進劇情到下一個場景xxx｝\nzzzz",
    time_passes: "｛時間流逝——xxx｝\nzzzz",
    continue: "｛繼續xxx｝\nzzzz"
  };

  for (const template of QUICK_SEND_TEMPLATES) {
    const result = buildQuickSendContent(template.id, "xxx", "zzzz");
    assert.equal(result.ok, true);
    assert.equal(result.content, expected[template.id]);
  }
});

test("quick send directives follow the selected simplified language", () => {
  const expected = {
    keep_time: "{{保持时间xxx}}\nzzzz",
    next_scene: "｛推进剧情到下一个场景xxx｝\nzzzz",
    time_passes: "｛时间流逝——xxx｝\nzzzz",
    continue: "｛继续xxx｝\nzzzz"
  };

  for (const template of QUICK_SEND_TEMPLATES) {
    const result = buildQuickSendContent(
      template.id,
      "xxx",
      "zzzz",
      UI_LANGUAGE_SIMPLIFIED
    );
    assert.equal(result.ok, true);
    assert.equal(result.content, expected[template.id]);
  }
});

test("keep time details remain visible to the model after applying the directive", () => {
  const content = buildQuickSendContent("keep_time", "xxx", "zzzz").content;

  assert.equal(hasKeepTimeDirective(content), true);
  assert.equal(stripKeepTimeDirective(content), "xxx\nzzzz");
  assert.equal(stripKeepTimeDirective("{{保持時間}}\nzzzz"), "zzzz");
  assert.equal(hasKeepTimeDirective("{{保持时间}}\nzzzz"), true);
  assert.equal(stripKeepTimeDirective("{{保持时间}}\nzzzz"), "zzzz");
});

test("unknown quick send templates are rejected", () => {
  assert.deepEqual(buildQuickSendContent("missing"), {
    ok: false,
    error: "未知的快速發送模板。"
  });
});
