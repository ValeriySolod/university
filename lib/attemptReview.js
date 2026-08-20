// Pure helpers for the /history page: ordering attempts, classifying an
// outcome's review status, and building immutable retry question sets from a
// past attempt or from marked questions. No React, browser APIs, or storage
// dependencies — see lib/useAttemptHistory.js for the hook that drives the
// /history UI with these.

import { QUESTION_TYPES } from "./questionTypes";

const NO_ANSWER_TEXT = "—";

// Renders a submitted or correct answer as Ukrainian-readable text for
// review, matching the question's type. Used only for display — scoring
// stays in lib/nmtScore.js.
export function formatAnswerText(question, answer) {
  if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
    const index = answer?.selectedIndex;
    return Number.isInteger(index) && question.answers[index] !== undefined ? question.answers[index] : NO_ANSWER_TEXT;
  }
  if (question.type === QUESTION_TYPES.MATCHING) {
    const mapping = answer?.mapping;
    if (!mapping || typeof mapping !== "object") return NO_ANSWER_TEXT;
    const pairs = question.leftOptions
      .filter((leftItem) => mapping[leftItem.id])
      .map((leftItem) => {
        const rightItem = question.rightOptions.find((option) => option.id === mapping[leftItem.id]);
        return `${leftItem.text} → ${rightItem ? rightItem.text : NO_ANSWER_TEXT}`;
      });
    return pairs.length > 0 ? pairs.join("; ") : NO_ANSWER_TEXT;
  }
  if (question.type === QUESTION_TYPES.SHORT_ANSWER) {
    return typeof answer?.value === "string" && answer.value.trim().length > 0 ? answer.value : NO_ANSWER_TEXT;
  }
  return NO_ANSWER_TEXT;
}

export function formatCorrectAnswerText(question) {
  if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
    return question.answers[question.correctIndex];
  }
  if (question.type === QUESTION_TYPES.MATCHING) {
    return formatAnswerText(question, { mapping: question.mapping });
  }
  if (question.type === QUESTION_TYPES.SHORT_ANSWER) {
    return question.acceptedAnswers[0];
  }
  return NO_ANSWER_TEXT;
}

// An outcome recorded before this feature shipped (persisted schema version
// 1) has no questionSnapshot, so it can still be listed but can't be
// reviewed in detail or retried.
export function outcomeHasSnapshot(outcome) {
  return outcome.questionSnapshot !== undefined && outcome.questionSnapshot !== null;
}

// Classifies one outcome for display and retry-eligibility purposes.
// "legacy" outcomes (no snapshot) are neither reviewable nor retryable.
export function classifyOutcome(outcome) {
  if (!outcomeHasSnapshot(outcome)) return "legacy";
  if (outcome.submittedAnswer === undefined || outcome.submittedAnswer === null) return "unanswered";
  if (outcome.earnedPoints === 0) return "incorrect";
  if (outcome.earnedPoints === outcome.maxPoints) return "correct";
  return "partial";
}

// Newest-first copy of the attempts list; ties (identical completedAt) break
// by id so ordering is stable and deterministic.
export function selectAttemptsNewestFirst(attempts) {
  return [...attempts].sort((a, b) => b.completedAt - a.completedAt || b.id.localeCompare(a.id));
}

// Outcomes worth retrying: reviewable (has a snapshot) and not already fully
// correct.
export function selectRetryableOutcomes(attempt) {
  return attempt.outcomes.filter((outcome) => outcomeHasSnapshot(outcome) && classifyOutcome(outcome) !== "correct");
}

function buildRetryEntriesFromOutcomes(outcomes) {
  return outcomes.map((outcome) => ({
    questionId: outcome.questionId,
    category: outcome.category,
    question: outcome.questionSnapshot,
  }));
}

// Retry set for every incorrect, partially correct, and unanswered outcome
// in one attempt.
export function buildRetrySetFromAttempt(attempt) {
  const entries = buildRetryEntriesFromOutcomes(selectRetryableOutcomes(attempt));
  return { entries, isEmpty: entries.length === 0, sourceAttemptId: attempt.id };
}

// Retry set for exactly one question from one attempt. Never substitutes
// another question: an outcome missing (wrong id) or lacking a snapshot
// (legacy attempt) yields an empty set rather than falling back to anything
// else.
export function buildRetrySetFromSingleOutcome(attempt, questionId) {
  const outcome = attempt.outcomes.find((item) => item.questionId === questionId && outcomeHasSnapshot(item));
  const entries = outcome ? buildRetryEntriesFromOutcomes([outcome]) : [];
  return { entries, isEmpty: entries.length === 0, sourceAttemptId: attempt.id };
}

// Retry set built from currently marked questions. These may span several
// (or no) source attempts, so the resulting retry attempt carries no single
// source reference.
export function buildRetrySetFromMarked(markedItems) {
  const entries = markedItems.map((item) => ({
    questionId: item.questionId,
    category: item.category,
    question: item.questionSnapshot,
  }));
  return { entries, isEmpty: entries.length === 0, sourceAttemptId: null };
}

export function formatAttemptDateTime(completedAt) {
  return new Date(completedAt).toLocaleString("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TRAINER_TYPE_LABELS = Object.freeze({
  nmt: "Повний тест (НМТ)",
  practice: "Практика",
  retry: "Повторення",
});

export function trainerTypeLabel(trainerType) {
  return TRAINER_TYPE_LABELS[trainerType] ?? trainerType;
}

const DIFFICULTY_LABELS = Object.freeze({
  all: "усі рівні",
  basic: "базовий",
  intermediate: "середній",
  advanced: "просунутий",
});

export function difficultyLabel(difficulty) {
  return DIFFICULTY_LABELS[difficulty] ?? difficulty;
}

const OUTCOME_STATUS_LABELS = Object.freeze({
  legacy: "Перегляд недоступний",
  unanswered: "Без відповіді",
  correct: "Правильно",
  partial: "Частково правильно",
  incorrect: "Неправильно",
});

export function outcomeStatusLabel(status) {
  return OUTCOME_STATUS_LABELS[status] ?? status;
}
