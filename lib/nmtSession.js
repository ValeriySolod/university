// Pure NMT session calculations: countdown math, per-question "answered"
// checks, score-entry construction, and final result summarization. No
// React, browser APIs, or timers — see lib/useNmtSession.js for the React
// hook that drives these calculations with real time and state.

import { QUESTION_TYPES } from "./questionTypes";
import { NMT_MAX_TEST_POINTS, NMT_MIN_RATED_TEST_POINTS, convertTestPointsToRating, scoreNmtTest } from "./nmtScore";

export const NMT_SESSION_DURATION_MS = 60 * 60 * 1000;

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Absolute deadline for the session, computed once at start so delayed
// interval ticks or an inactive tab never extend the available time.
export function computeDeadline(startedAtMs, durationMs = NMT_SESSION_DURATION_MS) {
  return startedAtMs + durationMs;
}

export function computeRemainingMs(deadlineMs, nowMs) {
  return Math.max(0, deadlineMs - nowMs);
}

export function isSessionExpired(deadlineMs, nowMs) {
  return nowMs >= deadlineMs;
}

// Formats a millisecond duration as MM:SS, clamped to zero.
export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function isQuestionAnswered(question, answer) {
  if (!question || !answer) return false;

  if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
    return (
      Number.isInteger(answer.selectedIndex) &&
      answer.selectedIndex >= 0 &&
      answer.selectedIndex < question.answers.length
    );
  }

  if (question.type === QUESTION_TYPES.MATCHING) {
    if (!answer.mapping || typeof answer.mapping !== "object") return false;
    return question.leftOptions.every((leftItem) => isNonEmptyString(answer.mapping[leftItem.id]));
  }

  if (question.type === QUESTION_TYPES.SHORT_ANSWER) {
    return isNonEmptyString(answer.value);
  }

  return false;
}

export function countAnsweredQuestions(questions, answersById) {
  return questions.reduce((count, question) => (isQuestionAnswered(question, answersById[question.id]) ? count + 1 : count), 0);
}

// Builds { question, answer } entries in the shape lib/nmtScore.js expects,
// substituting an unanswered question's missing answer with undefined
// (every scorer treats a missing answer as zero points).
export function buildScoreEntries(questions, answersById) {
  return questions.map((question) => ({ question, answer: answersById[question.id] }));
}

// Summarizes a finished session: official test points, the 100–200 rating
// (or null below the rated threshold), answered/unanswered counts, and
// elapsed time.
export function buildSessionResult({ questions, answersById, startedAtMs, submittedAtMs }) {
  const entries = buildScoreEntries(questions, answersById);
  const testPoints = scoreNmtTest(entries);
  const rating = testPoints >= NMT_MIN_RATED_TEST_POINTS ? convertTestPointsToRating(testPoints) : null;
  const answeredCount = countAnsweredQuestions(questions, answersById);

  return {
    testPoints,
    maxTestPoints: NMT_MAX_TEST_POINTS,
    rating,
    answeredCount,
    unansweredCount: questions.length - answeredCount,
    totalCount: questions.length,
    elapsedMs: Math.max(0, submittedAtMs - startedAtMs),
  };
}

// Returns a guard function that runs `fn` at most once across all calls.
// Used to prevent double submission (e.g. a manual submit racing an
// automatic expiry submit).
export function createOnceGuard() {
  let called = false;
  return function runOnce(fn) {
    if (called) return false;
    called = true;
    fn();
    return true;
  };
}
