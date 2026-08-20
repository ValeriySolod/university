// Pure helpers for building compact, immutable attempt records and their
// per-question outcome data, reusing the existing scoring in lib/nmtScore.js
// for both NMT and practice questions. No React, browser APIs, or storage
// dependencies.

import { scoreQuestion } from "./nmtScore";

// Builds one { questionId, category, correct, earnedPoints, maxPoints }
// entry per question. `categoryId` is the practice topic for practice
// sessions, or null for the NMT test (whose questions aren't tagged with a
// topic category).
export function buildQuestionOutcomes({ questions, answersById, categoryId = null }) {
  return questions.map((question) => {
    const answer = answersById[question.id];
    const earnedPoints = scoreQuestion(question, answer);
    const maxPoints = question.pointValue;
    return {
      questionId: question.id,
      category: categoryId,
      correct: earnedPoints === maxPoints,
      earnedPoints,
      maxPoints,
    };
  });
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
  };
}
