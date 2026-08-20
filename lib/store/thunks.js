// Orchestrates multi-slice completion side effects (completing a session,
// recording its attempt, and — for practice — updating topic stats) as a
// single dispatch, with id-based idempotency so repeated calls from timer
// ticks, remounts, or React Strict Mode never double-record an attempt.

import { nmtSessionCompleted } from "./nmtSessionSlice";
import { attemptRecorded } from "./attemptsSlice";
import { topicStatsUpdated } from "./topicStatsSlice";

export function completeNmtSession({ resultData, attempt }) {
  return (dispatch, getState) => {
    const state = getState();
    const alreadyRecorded = state.attempts.items.some((item) => item.id === attempt.id);
    if (state.nmtSession.phase !== "result") {
      dispatch(nmtSessionCompleted({ resultData }));
    }
    if (!alreadyRecorded) {
      dispatch(attemptRecorded(attempt));
    }
  };
}

export function completePracticeSession({ attempt }) {
  return (dispatch, getState) => {
    const state = getState();
    const alreadyRecorded = state.attempts.items.some((item) => item.id === attempt.id);
    if (alreadyRecorded) return;
    dispatch(attemptRecorded(attempt));
    dispatch(topicStatsUpdated({ outcomes: attempt.outcomes }));
  };
}
