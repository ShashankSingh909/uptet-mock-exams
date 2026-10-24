export const DURATION_SECONDS = 9000;
export const STATE_VERSION = 1;

export function createAttempt(
  now,
  questionCount = 150,
  durationSeconds = DURATION_SECONDS,
) {
  return {
    version: STATE_VERSION,
    status: "active",
    startedAt: now,
    questionCount,
    durationSeconds,
    currentQuestion: 1,
    answers: {},
    review: [],
  };
}

export function attemptDuration(attempt) {
  return attempt.durationSeconds ?? DURATION_SECONDS;
}

export function remainingSeconds(attempt, now) {
  const elapsedSeconds = Math.floor((now - attempt.startedAt) / 1000);
  return Math.max(0, attemptDuration(attempt) - elapsedSeconds);
}

export function selectAnswer(attempt, questionNumber, answer) {
  if (attempt.status !== "active") {
    throw new Error("Answers cannot be changed after submission.");
  }
  if (!["a", "b", "c", "d"].includes(answer)) {
    throw new Error(`Invalid answer: ${answer}`);
  }
  if (questionNumber < 1 || questionNumber > attempt.questionCount) {
    throw new Error(`Invalid question number: ${questionNumber}`);
  }
  return {
    ...attempt,
    answers: { ...attempt.answers, [questionNumber]: answer },
  };
}

export function setCurrentQuestion(attempt, questionNumber) {
  const bounded = Math.min(
    Math.max(Number(questionNumber) || 1, 1),
    attempt.questionCount,
  );
  return { ...attempt, currentQuestion: bounded };
}

export function toggleReview(attempt, questionNumber) {
  const review = new Set(attempt.review);
  if (review.has(questionNumber)) {
    review.delete(questionNumber);
  } else {
    review.add(questionNumber);
  }
  return { ...attempt, review: [...review].sort((a, b) => a - b) };
}

export function canManualSubmit(attempt) {
  return attempt?.status === "active";
}

export function completeAttempt(attempt, questions, now, reason) {
  if (!["manual", "timeout"].includes(reason)) {
    throw new Error(`Invalid submission reason: ${reason}`);
  }
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;

  for (const question of questions) {
    const selected = attempt.answers[question.number];
    if (!selected) {
      unanswered += 1;
    } else if (selected === question.answer) {
      correct += 1;
    } else {
      incorrect += 1;
    }
  }

  const total = questions.length;
  return {
    ...attempt,
    status: "completed",
    submittedAt: now,
    reason,
    timeUsedSeconds: Math.min(
      attemptDuration(attempt),
      Math.max(0, Math.floor((now - attempt.startedAt) / 1000)),
    ),
    stats: {
      correct,
      incorrect,
      unanswered,
      score: correct,
      total,
      percentage: Number(((correct / total) * 100).toFixed(2)),
    },
  };
}

export function resolveExpiredAttempt(state, questions, now) {
  if (!state.active || remainingSeconds(state.active, now) > 0) {
    return state;
  }
  const latest = completeAttempt(state.active, questions, now, "timeout");
  return { active: null, latest };
}

export function startNewAttempt(
  state,
  now,
  questionCount = 150,
  durationSeconds = DURATION_SECONDS,
) {
  return {
    active: createAttempt(now, questionCount, durationSeconds),
    latest: state.latest ?? null,
  };
}

export function storageKey(paperId) {
  return `uptet-exam:${paperId}:v${STATE_VERSION}`;
}

export function sanitizeState(value, questionCount = 150) {
  if (!value || typeof value !== "object") {
    return { active: null, latest: null };
  }
  const active =
    value.active?.version === STATE_VERSION &&
    value.active?.questionCount === questionCount
      ? value.active
      : null;
  const latest =
    value.latest?.version === STATE_VERSION &&
    value.latest?.questionCount === questionCount
      ? value.latest
      : null;
  return { active, latest };
}
