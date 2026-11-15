import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../src/public/app.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/public/styles.css", import.meta.url), "utf8");

test("mobile navigation and chat share the visual viewport offset", () => {
  assert.match(css, /\.mobile-info-toggle\s*\{[^}]*top:\s*calc\(var\(--app-mobile-viewport-offset-top,\s*0px\)\s*\+\s*8px\)/su);
  assert.match(css, /\.mobile-info-drawer\s*\{[^}]*top:\s*var\(--app-mobile-viewport-offset-top,\s*0px\)/su);
  assert.match(css, /transform:\s*translateY\(var\(--app-mobile-viewport-offset-top,\s*0px\)\)/u);
  const start = app.indexOf("function getMobileViewportOffsetTop(");
  assert.ok(start >= 0);
  const scope = vm.createContext({ window: { visualViewport: { offsetTop: 72.4 } } });
  vm.runInContext(app.slice(start, app.indexOf("\n}", start) + 2), scope);
  assert.equal(scope.getMobileViewportOffsetTop(), 72);
  scope.window.visualViewport.offsetTop = -10;
  assert.equal(scope.getMobileViewportOffsetTop(), 0);
  scope.window.visualViewport = undefined;
  assert.equal(scope.getMobileViewportOffsetTop(), 0);
});
