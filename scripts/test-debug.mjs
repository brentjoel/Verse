import test from "node:test";
import assert from "node:assert/strict";
import { debugRequested, fpsFromFrames } from "../lib/debug.ts";

test("debug turns on only for a bare, 1 or true flag", () => {
  assert.equal(debugRequested("?debug"), true);
  assert.equal(debugRequested("?debug=1"), true);
  assert.equal(debugRequested("?x=2&debug=true"), true);
  assert.equal(debugRequested(""), false);
  assert.equal(debugRequested("?debug=0"), false);
  assert.equal(debugRequested("?debugger"), false);
});

test("fps is measured from frame timestamps and waits for data", () => {
  assert.equal(fpsFromFrames([]), null);
  assert.equal(fpsFromFrames([5]), null);
  assert.equal(fpsFromFrames([0, 0]), null);
  assert.equal(fpsFromFrames(Array.from({ length: 61 }, (_, i) => i * (1000 / 60))), 60);
  assert.equal(fpsFromFrames([0, 50, 100]), 20);
});
