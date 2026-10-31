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
  "sanskrit2.html",
  "sst2.html",
  "sst3-part1.html",
  "sst3-part2.html",
  "sst3-part3.html",
  "sst3-part4.html",
  "sst3-part5.html",
  "sst4-part1.html",
  "sst4-part2.html",
  "sst4-part3.html",
  "sst4-part4.html",
  "sst4-part5.html",
  "sst-current.html",
  "sst1-part1.html",
  "sst1-part2.html",
  "sst1-part3.html",
  "sst1-part4.html",
  "sst1-part5.html",
  "sanskrit2-extra.html",
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
  "sanskrit2.html",
  "sst2.html",
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

for (const file of [
  ...[1, 2, 3, 4, 5].flatMap((part) => [
    `sst1-part${part}.html`,
    `sst3-part${part}.html`,
    `sst4-part${part}.html`,
  ]),
  "sst-current.html",
  "sanskrit2-extra.html",
]) {
  test(`${file} embeds a locked 30-question exam`, async () => {
    const html = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(html, /data-answer-mode="locked"/);
    assert.match(html, /data-question-count="30"/);
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
  assert.match(html, /sanskrit2\.html/);
  assert.match(html, /sanskrit2-extra\.html/);
  assert.doesNotMatch(html, /href="sst1\.html"/);
  assert.match(html, /sst2\.html/);
  assert.doesNotMatch(html, /href="sst3\.html"/);
  assert.doesNotMatch(html, /href="sst4\.html"/);
  assert.doesNotMatch(html, /href="sst5\.html"/);
  assert.match(html, /sst-current\.html/);
  for (let part = 1; part <= 5; part += 1) {
    assert.match(html, new RegExp(`sst1-part${part}\\.html`));
    assert.match(html, new RegExp(`sst3-part${part}\\.html`));
    assert.match(html, new RegExp(`sst4-part${part}\\.html`));
  }
});
