// Redux slice for questions a learner has marked/bookmarked for later
// review or retry, kept separate from attempt records since a marked
// question can be added from an active session (before any attempt exists)
// and outlives the attempt it may have come from. Deterministic reducers
// only; each item carries its own immutable question snapshot so a retry
// built from marked questions never depends on a bank that may have changed.

import { createSlice } from "@reduxjs/toolkit";
import { validateQuestion } from "../questionTypes";

export const markedQuestionsInitialState = { items: [] };

const markedQuestionsSlice = createSlice({
  name: "markedQuestions",
  initialState: markedQuestionsInitialState,
  reducers: {
    // Idempotent by questionId, so marking an already-marked question never
    // duplicates it.
    questionMarked(state, action) {
      const item = action.payload;
      if (state.items.some((existing) => existing.questionId === item.questionId)) return;
      state.items.push(item);
    },
    questionUnmarked(state, action) {
      const { questionId } = action.payload;
      state.items = state.items.filter((item) => item.questionId !== questionId);
    },
  },
});

export const { questionMarked, questionUnmarked } = markedQuestionsSlice.actions;

// A snapshot must satisfy the universal question contract (lib/questionTypes.js),
// not merely be *some* object — a structurally stale or corrupted snapshot
// would otherwise rehydrate as a valid bookmark, then crash retry scoring
// once retried.
function isValidQuestionSnapshot(snapshot) {
  return snapshot !== null && typeof snapshot === "object" && validateQuestion(snapshot).valid;
}

function isValidMarkedItem(item) {
  return (
    item &&
    typeof item === "object" &&
    typeof item.questionId === "string" &&
    item.questionId.length > 0 &&
    isValidQuestionSnapshot(item.questionSnapshot) &&
    (item.category === null || typeof item.category === "string") &&
    (item.sourceAttemptId === null || typeof item.sourceAttemptId === "string") &&
    typeof item.markedAt === "number"
  );
}

export function isValidPersistedMarkedQuestions(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return false;
  return value.items.every(isValidMarkedItem);
}

// A marked item's entire purpose is its question snapshot — unlike an
// attempt outcome there's nothing to fall back to for one corrupted item, so
// sanitizing just drops that bookmark and keeps every other one intact,
// instead of the all-or-nothing isValidPersistedMarkedQuestions check
// discarding every bookmark over one corrupted item. Returns null only when
// the top-level shape itself is unusable (caller should fall back to the
// slice's initial state).
export function sanitizePersistedMarkedQuestions(value) {
  if (!value || typeof value !== "object" || !Array.isArray(value.items)) return null;
  return { items: value.items.filter(isValidMarkedItem) };
}

export default markedQuestionsSlice.reducer;
