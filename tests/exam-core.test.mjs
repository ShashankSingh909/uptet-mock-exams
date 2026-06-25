import test from "node:test";
import assert from "node:assert/strict";
import {
  DURATION_SECONDS,
  canManualSubmit,
  completeAttempt,
  createAttempt,
  remainingSeconds,
  resolveExpiredAttempt,
  selectAnswer,
  startNewAttempt,
} from "../src/exam-core.mjs";

const questions = [
  { number: 1, answer: "a" },
  { number: 2, answer: "b" },
  { number: 3, answer: "c" },
];

test("a new attempt starts with exactly 9000 seconds", () => {
  const attempt = createAttempt(1_000, questions.length);
  assert.equal(DURATION_SECONDS, 9000);
  assert.equal(remainingSeconds(attempt, 1_000), 9000);
});

test("reopening uses the original start timestamp", () => {
  const attempt = createAttempt(1_000, questions.length);
  assert.equal(remainingSeconds(attempt, 61_000), 8940);
  assert.equal(attempt.startedAt, 1_000);
});

test("answer selection is immutable and indexed by question number", () => {
  const attempt = createAttempt(1_000, questions.length);
  const updated = selectAnswer(attempt, 2, "b");
  assert.deepEqual(attempt.answers, {});
  assert.deepEqual(updated.answers, { 2: "b" });
});

test("manual submit is blocked until every question is answered", () => {
  let attempt = createAttempt(1_000, questions.length);
  attempt = selectAnswer(attempt, 1, "a");
  attempt = selectAnswer(attempt, 2, "b");
  assert.equal(canManualSubmit(attempt, questions.length), false);
  attempt = selectAnswer(attempt, 3, "c");
  assert.equal(canManualSubmit(attempt, questions.length), true);
});

test("manual completion scores correct, incorrect, and unanswered", () => {
  let attempt = createAttempt(1_000, questions.length);
  attempt = selectAnswer(attempt, 1, "a");
  attempt = selectAnswer(attempt, 2, "d");
  attempt = selectAnswer(attempt, 3, "c");

  const completed = completeAttempt(attempt, questions, 11_000, "manual");
  assert.deepEqual(completed.stats, {
    correct: 2,
    incorrect: 1,
    unanswered: 0,
    score: 2,
    total: 3,
    percentage: 66.67,
  });
  assert.equal(completed.timeUsedSeconds, 10);
  assert.equal(completed.reason, "manual");
});

test("timeout completion accepts unanswered questions", () => {
  let attempt = createAttempt(1_000, questions.length);
  attempt = selectAnswer(attempt, 1, "a");
  const state = { active: attempt, latest: null };

  const resolved = resolveExpiredAttempt(
    state,
    questions,
    1_000 + DURATION_SECONDS * 1000,
  );
  assert.equal(resolved.active, null);
  assert.equal(resolved.latest.reason, "timeout");
  assert.equal(resolved.latest.stats.unanswered, 2);
});

test("a newer completion replaces the latest attempt only", () => {
  let first = createAttempt(1_000, questions.length);
  first = selectAnswer(first, 1, "a");
  const firstCompleted = completeAttempt(
    first,
    questions,
    2_000,
    "timeout",
  );

  let second = createAttempt(3_000, questions.length);
  second = selectAnswer(second, 1, "a");
  second = selectAnswer(second, 2, "b");
  second = selectAnswer(second, 3, "c");
  const secondCompleted = completeAttempt(
    second,
    questions,
    4_000,
    "manual",
  );

  const state = resolveExpiredAttempt(
    { active: null, latest: firstCompleted },
    questions,
    4_000,
  );
  const replaced = { ...state, latest: secondCompleted };
  assert.equal(replaced.latest.submittedAt, 4_000);
  assert.equal(replaced.latest.stats.score, 3);
});

test("starting a new attempt preserves the latest completed review", () => {
  const latest = { submittedAt: 10_000, stats: { score: 2 } };
  const state = startNewAttempt({ active: null, latest }, 20_000, 3);
  assert.equal(state.active.startedAt, 20_000);
  assert.equal(state.latest, latest);
});
