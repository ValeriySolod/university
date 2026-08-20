// Redux slice for the active NMT session: the fields needed to restore an
// in-progress test after a reload (phase, current task, answers, and the
// original absolute deadline). Deterministic reducers only — no timers,
// randomness, or browser APIs; see lib/useNmtSession.js for the React hook
// that drives this slice with real time.

import { createSlice } from "@reduxjs/toolkit";
import { NMT_TASK_COUNT } from "../nmtQuestions";

const VALID_PHASES = new Set(["intro", "active", "result"]);

export const nmtSessionInitialState = {
  phase: "intro",
  sessionId: null,
  currentIndex: 0,
  answersById: {},
  startedAtMs: null,
  deadlineMs: null,
  resultData: null,
};

const nmtSessionSlice = createSlice({
  name: "nmtSession",
  initialState: nmtSessionInitialState,
  reducers: {
    // Atomically replaces any previous session state, whether starting the
    // first attempt or restarting after a completed one.
    nmtSessionStarted(state, action) {
      const { sessionId, startedAtMs, deadlineMs } = action.payload;
      state.phase = "active";
      state.sessionId = sessionId;
      state.currentIndex = 0;
      state.answersById = {};
      state.startedAtMs = startedAtMs;
      state.deadlineMs = deadlineMs;
      state.resultData = null;
    },
    nmtAnswerSet(state, action) {
      if (state.phase !== "active") return;
      const { questionId, answer } = action.payload;
      state.answersById[questionId] = answer;
    },
    nmtCurrentIndexSet(state, action) {
      if (state.phase !== "active") return;
      const index = action.payload;
      state.currentIndex = Math.min(Math.max(index, 0), NMT_TASK_COUNT - 1);
    },
    // Idempotent: a session already in "result" phase ignores further
    // completion dispatches, guarding against duplicate ticks/remounts.
    nmtSessionCompleted(state, action) {
      if (state.phase === "result") return;
      state.phase = "result";
      state.resultData = action.payload.resultData;
    },
  },
});

export const { nmtSessionStarted, nmtAnswerSet, nmtCurrentIndexSet, nmtSessionCompleted } = nmtSessionSlice.actions;

export function isValidPersistedNmtSession(value) {
  if (!value || typeof value !== "object") return false;
  if (!VALID_PHASES.has(value.phase)) return false;
  if (!Number.isInteger(value.currentIndex) || value.currentIndex < 0) return false;
  if (!value.answersById || typeof value.answersById !== "object" || Array.isArray(value.answersById)) return false;

  if (value.phase === "active" || value.phase === "result") {
    if (typeof value.sessionId !== "string" || value.sessionId.length === 0) return false;
    if (typeof value.startedAtMs !== "number") return false;
    if (typeof value.deadlineMs !== "number") return false;
  }

  if (value.phase === "result" && (!value.resultData || typeof value.resultData !== "object")) return false;
  if (value.phase !== "result" && value.resultData !== null) return false;

  return true;
}

export default nmtSessionSlice.reducer;
