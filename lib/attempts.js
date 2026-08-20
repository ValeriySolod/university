// Pure helpers for building compact, immutable attempt records and their
// per-question outcome data, reusing the existing scoring in lib/nmtScore.js
// for both NMT and practice questions. No React, browser APIs, or storage
// dependencies.

import { scoreQuestion } from "./nmtScore";

// Builds one outcome entry for a single { question, answer } pair. Besides
// the compact score fields, this carries an immutable question snapshot and
// the raw submitted answer, so a later attempt review or retry never needs
// to look the question back up in a bank that may have changed or
// regenerated since the attempt was recorded.
export function buildQuestionOutcome({ question, answer, categoryId = null }) {
  const earnedPoints = scoreQuestion(question, answer);
  const maxPoints = question.pointValue;
  return {
    questionId: question.id,
    category: categoryId,
    correct: earnedPoints === maxPoints,
    earnedPoints,
    maxPoints,
    questionSnapshot: question,
    submittedAnswer: answer ?? null,
  };
}

// Builds one outcome entry per question. `categoryId` is the practice topic
// for practice sessions, or null for the NMT test (whose questions aren't
// tagged with a topic category).
export function buildQuestionOutcomes({ questions, answersById, categoryId = null }) {
  return questions.map((question) => buildQuestionOutcome({ question, answer: answersById[question.id], categoryId }));
}

export function buildNmtAttempt({ id, completedAt, durationMs, resultData, outcomes }) {
  return {
    id,
    trainerType: "nmt",
    completedAt,
    category: null,
    difficulty: null,
    mode: null,
    quantity: null,
    totalPoints: resultData.testPoints,
    maxPoints: resultData.maxTestPoints,
    durationMs,
    outcomes,
    sourceAttemptId: null,
  };
}

export function buildPracticeAttempt({ id, completedAt, durationMs, categoryId, difficulty, mode, quantity, outcomes }) {
  const totalPoints = outcomes.reduce((sum, outcome) => sum + outcome.earnedPoints, 0);
  const maxPoints = outcomes.reduce((sum, outcome) => sum + outcome.maxPoints, 0);
  return {
    id,
    trainerType: "practice",
    completedAt,
    category: categoryId,
    difficulty,
    mode,
    quantity,
    totalPoints,
    maxPoints,
    durationMs,
    outcomes,
    sourceAttemptId: null,
  };
}

// Builds a retry-session attempt: a practice-like immediate-feedback session
// built from immutable question snapshots (from a past attempt or from
// marked questions), never a filtered/generated category. Carries no NMT
// rating and, when it retries a specific past attempt, a reference back to
// it.
export function buildRetryAttempt({ id, completedAt, durationMs, sourceAttemptId = null, outcomes }) {
  const totalPoints = outcomes.reduce((sum, outcome) => sum + outcome.earnedPoints, 0);
  const maxPoints = outcomes.reduce((sum, outcome) => sum + outcome.maxPoints, 0);
  return {
    id,
    trainerType: "retry",
    completedAt,
    category: null,
    difficulty: null,
    mode: null,
    quantity: outcomes.length,
    totalPoints,
    maxPoints,
    durationMs,
    outcomes,
    sourceAttemptId,
  };
}
