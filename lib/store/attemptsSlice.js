// Redux slice for compact, immutable completed-attempt records (both NMT
// and practice trainers). Deterministic reducers only — attempt records are
// built by pure helpers in lib/attempts.js and dispatched as payloads.

import { createSlice } from "@reduxjs/toolkit";

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

function isValidOutcome(outcome) {
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

function isValidAttemptRecord(record) {
  if (!record || typeof record !== "object") return false;
  if (typeof record.id !== "string" || record.id.length === 0) return false;
  if (record.trainerType !== "nmt" && record.trainerType !== "practice") return false;
  if (typeof record.completedAt !== "number") return false;
  if (typeof record.totalPoints !== "number" || typeof record.maxPoints !== "number") return false;
  if (typeof record.durationMs !== "number") return false;
  if (!Array.isArray(record.outcomes)) return false;
  return record.outcomes.every(isValidOutcome);
}

export function isValidPersistedAttempts(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  return value.items.every(isValidAttemptRecord);
}

export default attemptsSlice.reducer;
