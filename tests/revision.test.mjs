import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("revision importer preserves every source question and answer", async () => {
  const { parseRevision } = await import("../scripts/import_revision.mjs");
  for (const [id, count] of [["sanskrit", 60], ["sst", 180]]) {
    const markdown = await readFile(new URL(`../source/revision/${id}.md`, import.meta.url), "utf8");
    const data = parseRevision(markdown, id);
    assert.equal(data.questions.length, count);
    assert.deepEqual(data.questions.map((q) => q.number), Array.from({ length: count }, (_, i) => i + 1));
    for (const question of data.questions) {
      assert.deepEqual(question.options.map((o) => o.id), ["a", "b", "c", "d"]);
      assert.ok(question.options.every((o) => o.text.length > 0));
      assert.match(question.answer, /^[abcd]$/);
      assert.ok(question.text.length > 5);
      assert.ok(question.explanation.length > 5);
      assert.ok(question.sourceReference.length > 0);
      assert.ok(question.section.length > 0);
    }
    const file = id === "sanskrit" ? "rev-sanskrit60" : "sst-rev-mock180";
    const normalized = JSON.parse(await readFile(new URL(`../data/${file}.json`, import.meta.url), "utf8"));
    assert.deepEqual(normalized, data);
  }
});

test("revision retains source wording, topics, and references", async () => {
  const { parseRevision } = await import("../scripts/import_revision.mjs");
  const load = async (id) => parseRevision(await readFile(new URL(`../source/revision/${id}.md`, import.meta.url), "utf8"), id);
  const sanskrit = await load("sanskrit");
  const sst = await load("sst");
  assert.equal(sanskrit.questions[0].options[2].text, "मृगेन्द्रः");
  assert.equal(sanskrit.questions[0].answer, "c");
  assert.equal(sanskrit.questions[0].topic, "पर्यायवाची");
  assert.equal(new Set(sanskrit.questions.map((q) => q.section)).size, 2);
  assert.equal(new Set(sanskrit.questions.map((q) => q.topic)).size, 12);
  assert.equal(sanskrit.questions[59].answer, "b");
  assert.match(sst.questions[0].text, /तिहरा शवाधान/);
  assert.equal(sst.questions[0].options[0].text, "दमदमा");
  assert.equal(sst.questions[0].answer, "a");
  assert.match(sst.questions[0].sourceReference, /241/);
  assert.equal(new Set(sst.questions.map((q) => q.section)).size, 9);
});

test("revision importer rejects incomplete source material", async () => {
  const { parseRevision } = await import("../scripts/import_revision.mjs");
  const source = await readFile(new URL("../source/revision/sanskrit.md", import.meta.url), "utf8");
  assert.throws(() => parseRevision(source.replace(/^- \*\*60\.\*\*.*$/m, ""), "sanskrit"), /60|count/i);
  assert.throws(() => parseRevision(source.replace(/^\| 60 \| B \|.*$/m, ""), "sanskrit"), /answer|60/i);
  assert.throws(() => parseRevision(source.replace("(D) वानरः", "(E) वानरः"), "sanskrit"), /option/i);
});

test("revision pages are self-contained and linked from the home page", async () => {
  const home = await readFile(new URL("../index.html", import.meta.url), "utf8");
  for (const [id, count] of [["rev-sanskrit60", 60], ["sst-rev-mock180", 180]]) {
    assert.match(home, new RegExp(`revision-${id}\\.html`));
    const html = await readFile(new URL(`../revision-${id}.html`, import.meta.url), "utf8");
    assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel=["']stylesheet|https?:\/\//i);
    assert.doesNotMatch(html, /<script|<input/i);
    assert.equal((html.match(/class="revision-card"/g) ?? []).length, count);
    assert.equal((html.match(/class="revision-options"/g) ?? []).length, count);
    assert.equal((html.match(/<li class="correct">/g) ?? []).length, count);
    assert.equal((html.match(/href="#q-\d+"/g) ?? []).length, count);
    assert.equal((html.match(/मूल फ़ाइल का संदर्भ:/g) ?? []).length, count);
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/);
  }
});
