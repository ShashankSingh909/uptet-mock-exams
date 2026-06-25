import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

for (const paper of ["paper1", "paper2"]) {
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
