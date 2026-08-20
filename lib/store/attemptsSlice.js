// Redux slice for compact, immutable completed-attempt records (both NMT
// and practice trainers). Deterministic reducers only — attempt records are
// built by pure helpers in lib/attempts.js and dispatched as payloads.

import { createSlice } from "@reduxjs/toolkit";
import { validateQuestion } from "../questionTypes";

export const attemptsInitialState = { items: [] };

const attemptsSlice = createSlice({
  name: "attempts",
  initialState: attemptsInitialState,
  reducers: {
    // Idempotent by attempt id, so repeated dispatch of the same completed
    // session (double submission, remounts, Strict Mode) never duplicates.
    attemptRecorded(state, action) {
      const attempt = action.payload;
      if (state.items.some((item) => item.id === attempt.id)) return;
      state.items.push(attempt);
    },
  },
});

export const { attemptRecorded } = attemptsSlice.actions;

const VALID_TRAINER_TYPES = new Set(["nmt", "practice", "retry"]);

// A snapshot must satisfy the universal question contract (lib/questionTypes.js),
// not merely be *some* object — a structurally stale or corrupted snapshot
// (e.g. `{ type: "single-choice" }` with no `answers`) would otherwise be
// accepted, then crash formatCorrectAnswerText/scoreQuestion once opened for
// review or retry.
function isValidQuestionSnapshot(snapshot) {
  return snapshot !== null && typeof snapshot === "object" && validateQuestion(snapshot).valid;
}

// `questionSnapshot`/`submittedAnswer` are optional: attempts recorded before
// this feature (schema version 1) lack them, and must remain valid so their
// history entry still shows, even though their review/retry actions stay
// disabled (see lib/attemptReview.js's classifyOutcome/outcomeHasSnapshot).
function isValidOutcomeShape(outcome) {
  return (
    outcome &&
    typeof outcome === "object" &&
    typeof outcome.questionId === "string" &&
    outcome.questionId.length > 0 &&
    (outcome.category === null || typeof outcome.category === "string") &&
    typeof outcome.correct === "boolean" &&
    typeof outcome.earnedPoints === "number" &&
    typeof outcome.maxPoints === "number"
  );
}

function isValidOutcome(outcome) {
  return (
    isValidOutcomeShape(outcome) &&
    (outcome.questionSnapshot === undefined || outcome.questionSnapshot === null || isValidQuestionSnapshot(outcome.questionSnapshot))
  );
}

function isValidRecordShape(record) {
  if (!record || typeof record !== "object") return false;
  if (typeof record.id !== "string" || record.id.length === 0) return false;
  if (!VALID_TRAINER_TYPES.has(record.trainerType)) return false;
  if (typeof record.completedAt !== "number") return false;
  if (typeof record.totalPoints !== "number" || typeof record.maxPoints !== "number") return false;
  if (typeof record.durationMs !== "number") return false;
  if (record.sourceAttemptId !== undefined && record.sourceAttemptId !== null && typeof record.sourceAttemptId !== "string") {
    return false;
  }
  return Array.isArray(record.outcomes);
}

function isValidAttemptRecord(record) {
  return isValidRecordShape(record) && record.outcomes.every(isValidOutcome);
}

export function isValidPersistedAttempts(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  return value.items.every(isValidAttemptRecord);
}

// Falls a corrupted questionSnapshot back to "no snapshot" (the same state
// as a pre-feature legacy outcome) rather than rejecting the outcome.
function sanitizeOutcome(outcome) {
  if (!isValidOutcomeShape(outcome)) return null;
  if (outcome.questionSnapshot == null || isValidQuestionSnapshot(outcome.questionSnapshot)) return outcome;
  return { ...outcome, questionSnapshot: null };
}

// Sanitizes persisted attempts for rehydration one record/outcome at a time,
// instead of the all-or-nothing isValidPersistedAttempts check: a
// structurally broken record is dropped, and within an otherwise-valid
// record a structurally broken outcome is dropped while a merely corrupted
// questionSnapshot on an outcome is stripped (see sanitizeOutcome) — so one
// bad snapshot can never take out an entire attempt record, let alone the
// whole history. Returns null only when the top-level shape itself is
// unusable (caller should fall back to the slice's initial state).
export function sanitizePersistedAttempts(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return null;
  const items = [];
  for (const record of value.items) {
    if (!isValidRecordShape(record)) continue;
    const outcomes = record.outcomes.map(sanitizeOutcome).filter(Boolean);
    items.push({ ...record, outcomes });
  }
  return { items };
}

export default attemptsSlice.reducer;
