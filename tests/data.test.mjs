import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const paper of [
  "paper1",
  "paper2",
  "paper3",
  "paper4",
  "paper5",
  "cdp1",
  "cdp2",
  "hindi1",
  "hindi2",
  "sanskrit1",
  "sst1",
]) {
  test(`${paper} contains 150 complete questions`, async () => {
    const data = JSON.parse(
      await readFile(new URL(`../data/${paper}.json`, import.meta.url), "utf8"),
    );

    assert.equal(data.durationSeconds, 9000);
    assert.equal(data.questions.length, 150);
    assert.deepEqual(
      data.questions.map((question) => question.number),
      Array.from({ length: 150 }, (_, index) => index + 1),
    );

    for (const question of data.questions) {
      assert.equal(question.options.length, 4, `question ${question.number}`);
      assert.match(question.answer, /^[abcd]$/, `question ${question.number}`);
      assert.ok(question.text.trim().length > 5, `question ${question.number}`);
      assert.ok(
        question.explanation.trim().length > 10,
        `question ${question.number}`,
      );
    }
  });
}

test("paper1 retains representative PDF source text", async () => {
  const data = JSON.parse(
    await readFile(new URL("../data/paper1.json", import.meta.url), "utf8"),
  );
  assert.match(data.questions[0].text, /औपचारिक संक्रियात्मक अवस्था/);
  assert.equal(data.questions[0].options[3].text, "11–15 वर्ष");
  assert.match(data.questions[149].explanation, /व्यापक मूल्यांकन/);
});

test("paper2 retains representative PDF source text", async () => {
  const data = JSON.parse(
    await readFile(new URL("../data/paper2.json", import.meta.url), "utf8"),
  );
  assert.match(data.questions[0].text, /जन्म से 2 वर्ष/);
  assert.match(data.questions[99].explanation, /मुहम्मद बिन तुगलक/);
  assert.match(data.questions[149].explanation, /सरदार वल्लभभाई पटेल/);
});

test("papers 3-5 retain representative PDF source text", async () => {
  const paper3 = JSON.parse(
    await readFile(new URL("../data/paper3.json", import.meta.url), "utf8"),
  );
  const paper4 = JSON.parse(
    await readFile(new URL("../data/paper4.json", import.meta.url), "utf8"),
  );
  const paper5 = JSON.parse(
    await readFile(new URL("../data/paper5.json", import.meta.url), "utf8"),
  );

  assert.match(paper3.questions[0].text, /पूर्व-संक्रियात्मक अवस्था/);
  assert.match(paper3.questions[149].text, /श्वेत क्रांति/);
  assert.match(paper4.questions[0].text, /वस्तु-स्थायित्व/);
  assert.match(paper4.questions[149].text, /रिज़र्व बैंक/);
  assert.match(paper5.questions[0].text, /एक ही पक्ष/);
  assert.match(paper5.questions[149].text, /मूल्य-शिक्षा/);
});

test("CDP papers retain representative question bank text", async () => {
  const cdp1 = JSON.parse(
    await readFile(new URL("../data/cdp1.json", import.meta.url), "utf8"),
  );
  const cdp2 = JSON.parse(
    await readFile(new URL("../data/cdp2.json", import.meta.url), "utf8"),
  );

  assert.match(cdp1.questions[0].text, /सही नहीं/);
  assert.equal(cdp1.questions[0].answer, "c");
  assert.match(cdp2.questions[0].text, /Growth spurt/);
  assert.equal(cdp2.questions[0].answer, "b");
});

test("language papers retain representative question bank text", async () => {
  const [hindi1, hindi2, sanskrit1] = await Promise.all(
    ["hindi1", "hindi2", "sanskrit1"].map(async (paper) =>
      JSON.parse(
        await readFile(new URL(`../data/${paper}.json`, import.meta.url), "utf8"),
      ),
    ),
  );

  assert.match(hindi1.questions[0].passage, /सर्वांगीण विकास/);
  assert.equal(hindi1.questions[0].answer, "c");
  assert.match(hindi2.questions[0].text, /मूल नाम/);
  assert.match(hindi2.questions[28].text, /शुद्ध वर्तनी/);
  assert.match(sanskrit1.questions[134].passage, /संस्कृतभाषा/);
  assert.equal(sanskrit1.questions[149].answer, "a");
});

test("SST papers retain representative question bank text", async () => {
  const sst1 = JSON.parse(
    await readFile(new URL("../data/sst1.json", import.meta.url), "utf8"),
  );

  assert.match(sst1.questions[0].text, /समाहर्ता/);
  assert.equal(sst1.questions[0].answer, "b");
  assert.match(sst1.questions[149].text, /दृष्टिबाधित/);
});
