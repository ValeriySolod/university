// Pure NMT-2026 mathematics scoring: 0–32 test points plus official
// conversion to the 100–200 rating scale. No React, browser APIs, timers,
// or storage dependencies — see lib/questionTypes.js for the question
// contract this module scores against.

import { QUESTION_TYPES, normalizeShortAnswer, validateQuestion } from "./questionTypes";

export const NMT_MAX_TEST_POINTS = 32;
export const NMT_MIN_RATED_TEST_POINTS = 5;

// Explicit official NMT-2026 mathematics lookup table. Values below the
// official threshold (0–4 test points) have no 100–200 rating.
export const NMT_RATING_TABLE = Object.freeze({
  5: 100,
  6: 108,
  7: 115,
  8: 123,
  9: 131,
  10: 134,
  11: 137,
  12: 140,
  13: 143,
  14: 145,
  15: 147,
  16: 148,
  17: 149,
  18: 150,
  19: 151,
  20: 152,
  21: 155,
  22: 159,
  23: 163,
  24: 167,
  25: 170,
  26: 173,
  27: 176,
  28: 180,
  29: 184,
  30: 189,
  31: 194,
  32: 200,
});

function assertValidQuestion(question) {
  const { valid, errors } = validateQuestion(question);
  if (!valid) {
    throw new Error(`Cannot score invalid question: ${errors.join(" ")}`);
  }
}

export function scoreSingleChoice(question, answer) {
  assertValidQuestion(question);
  if (question.type !== QUESTION_TYPES.SINGLE_CHOICE) {
    throw new Error("scoreSingleChoice requires a single-choice question.");
  }
  return answer?.selectedIndex === question.correctIndex ? 1 : 0;
}

export function scoreMatching(question, answer) {
  assertValidQuestion(question);
  if (question.type !== QUESTION_TYPES.MATCHING) {
    throw new Error("scoreMatching requires a matching question.");
  }
  const submittedMapping = answer?.mapping;
  if (!submittedMapping || typeof submittedMapping !== "object") {
    return 0;
  }
  return question.leftOptions.reduce((points, leftItem) => {
    const isCorrect = submittedMapping[leftItem.id] === question.mapping[leftItem.id];
    return isCorrect ? points + 1 : points;
  }, 0);
}

export function scoreShortAnswer(question, answer) {
  assertValidQuestion(question);
  if (question.type !== QUESTION_TYPES.SHORT_ANSWER) {
    throw new Error("scoreShortAnswer requires a short-answer question.");
  }
  if (typeof answer?.value !== "string") {
    return 0;
  }
  const normalizedAnswer = normalizeShortAnswer(answer.value);
  const isAccepted = question.acceptedAnswers.some(
    (accepted) => normalizeShortAnswer(accepted) === normalizedAnswer
  );
  return isAccepted ? 2 : 0;
}

const SCORER_BY_TYPE = Object.freeze({
  [QUESTION_TYPES.SINGLE_CHOICE]: scoreSingleChoice,
  [QUESTION_TYPES.MATCHING]: scoreMatching,
  [QUESTION_TYPES.SHORT_ANSWER]: scoreShortAnswer,
});

// Scores a single { question, answer } pair by dispatching on question type.
export function scoreQuestion(question, answer) {
  assertValidQuestion(question);
  return SCORER_BY_TYPE[question.type](question, answer);
}

// Scores an array of { question, answer } entries and returns the total
// NMT test points, capped at the official 32-point maximum.
export function scoreNmtTest(entries) {
  if (!Array.isArray(entries)) {
    throw new Error("scoreNmtTest requires an array of { question, answer } entries.");
  }
  const total = entries.reduce((sum, entry) => sum + scoreQuestion(entry.question, entry.answer), 0);
  return Math.min(total, NMT_MAX_TEST_POINTS);
}

// Converts 0–32 official NMT test points to the 100–200 rating scale using
// the explicit official lookup table. Returns null below the rated
// threshold (0–4 test points), where no rating is defined.
export function convertTestPointsToRating(testPoints) {
  if (!Number.isInteger(testPoints) || testPoints < 0 || testPoints > NMT_MAX_TEST_POINTS) {
    throw new Error(`testPoints must be an integer between 0 and ${NMT_MAX_TEST_POINTS}, got ${testPoints}.`);
  }
  if (testPoints < NMT_MIN_RATED_TEST_POINTS) {
    return null;
  }
  return NMT_RATING_TABLE[testPoints];
}
