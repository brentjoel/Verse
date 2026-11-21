import test from "node:test";
import assert from "node:assert/strict";
import { planSkyCard, wrapText, SKY_CARD } from "../lib/sky-card.ts";

const sky = {
  stars: [{ date: "2026-11-01", x: 4, y: 18, reflections: 0 }, { date: "2026-11-02", x: 50, y: 50, reflections: 1, emotionId: "sad" }, { date: "2026-11-04", x: 96, y: 82, reflections: 3, emotionId: "hopeful" }],
  links: [{ from: "2026-11-01", to: "2026-11-02", grace: false }, { from: "2026-11-02", to: "2026-11-04", grace: true }, { from: "2026-11-02", to: "2026-12-09", grace: false }],
  graceDates: ["2026-11-03"],
};

test("stars map into the card sky and size by reflections", () => {
  const { stars, lines } = planSkyCard(sky);
  assert.equal(stars.length, 3);
  assert.deepEqual(stars.map(s => s.r), [5, 8, 11]);
  assert.equal(stars[1].x, SKY_CARD.width / 2);
  assert.equal(stars[1].emotionId, "sad");
  for (const s of stars) assert.ok(s.x >= SKY_CARD.pad && s.x <= SKY_CARD.width - SKY_CARD.pad && s.y >= SKY_CARD.skyTop && s.y <= SKY_CARD.skyTop + SKY_CARD.skyHeight);
  assert.equal(lines.length, 2, "links to unknown stars are dropped");
  assert.equal(lines[1].grace, true);
});

test("an empty sky plans nothing", () => {
  assert.deepEqual(planSkyCard({ stars: [], links: [], graceDates: [] }), { stars: [], lines: [] });
});

test("wrapText breaks on width and never drops words", () => {
  const text = "The LORD is my shepherd I shall not want";
  const lines = wrapText(text, 20, line => line.length);
  assert.ok(lines.every(line => line.length <= 20));
  assert.equal(lines.join(" "), text);
  assert.deepEqual(wrapText("   ", 20, l => l.length), []);
  assert.deepEqual(wrapText("supercalifragilistic", 5, l => l.length), ["supercalifragilistic"]);
});
