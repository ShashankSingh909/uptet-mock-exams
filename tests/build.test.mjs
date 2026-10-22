import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const file of [
  "index.html",
  "paper1.html",
  "paper2.html",
  "paper3.html",
  "paper4.html",
  "paper5.html",
  "cdp1.html",
  "cdp2.html",
  "hindi1.html",
  "hindi2.html",
  "sanskrit1.html",
]) {
  test(`${file} is self-contained`, async () => {
    const html = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /<!doctype html>/i);
    assert.doesNotMatch(html, /<script[^>]+src=/i);
    assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet/i);
    assert.doesNotMatch(html, /https?:\/\//i);
  });
}

for (const file of [
  "paper1.html",
  "paper2.html",
  "paper3.html",
  "paper4.html",
  "paper5.html",
  "cdp1.html",
  "cdp2.html",
  "hindi1.html",
  "hindi2.html",
  "sanskrit1.html",
]) {
  test(`${file} embeds a locked 150-question exam`, async () => {
    const html = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /data-answer-mode="locked"/);
    assert.match(html, /data-question-count="150"/);
    assert.match(html, /id="submit-exam"[^>]+disabled/);
    assert.match(html, /id="paper-data"[^>]+type="application\/octet-stream"/);
    assert.doesNotMatch(html, /class="correct-answer"/);
    assert.doesNotMatch(html, /class="explanation"/);
  });
}

test("the selector does not contain exam state initialization", async () => {
  const html = await readFile(
    new URL("../index.html", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(html, /localStorage\.(setItem|getItem)/);
  assert.match(html, /paper1\.html/);
  assert.match(html, /paper2\.html/);
  assert.match(html, /paper3\.html/);
  assert.match(html, /paper4\.html/);
  assert.match(html, /paper5\.html/);
  assert.match(html, /cdp1\.html/);
  assert.match(html, /cdp2\.html/);
  assert.match(html, /hindi1\.html/);
  assert.match(html, /hindi2\.html/);
  assert.match(html, /sanskrit1\.html/);
});
