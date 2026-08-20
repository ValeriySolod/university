import { describe, expect, it } from "vitest";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import nmtSessionReducer, { nmtSessionStarted } from "./nmtSessionSlice";
import practiceSettingsReducer from "./practiceSettingsSlice";
import attemptsReducer from "./attemptsSlice";
import topicStatsReducer from "./topicStatsSlice";
import { completeNmtSession, completePracticeSession } from "./thunks";

function makeTestStore() {
  return configureStore({
    reducer: combineReducers({
      nmtSession: nmtSessionReducer,
      practiceSettings: practiceSettingsReducer,
      attempts: attemptsReducer,
      topicStats: topicStatsReducer,
    }),
  });
}

function nmtAttempt(id, overrides = {}) {
  return {
    id,
    trainerType: "nmt",
    completedAt: 5000,
    category: null,
    difficulty: null,
    mode: null,
    quantity: null,
    totalPoints: 20,
    maxPoints: 32,
    durationMs: 4000,
    outcomes: [],
    ...overrides,
  };
}

function practiceAttempt(id, overrides = {}) {
  return {
    id,
    trainerType: "practice",
    completedAt: 5000,
    category: "powers",
    difficulty: "basic",
    mode: "classic",
    quantity: 2,
    totalPoints: 1,
    maxPoints: 2,
    durationMs: 3000,
    outcomes: [
      { questionId: "practice-powers-1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 },
      { questionId: "practice-powers-2", category: "powers", correct: false, earnedPoints: 0, maxPoints: 1 },
    ],
    ...overrides,
  };
}

describe("completeNmtSession", () => {
  it("transitions the session to result and records exactly one attempt", () => {
    const store = makeTestStore();
    store.dispatch(nmtSessionStarted({ sessionId: "nmt-1", startedAtMs: 0, deadlineMs: 3600000 }));

    store.dispatch(completeNmtSession({ resultData: { testPoints: 20 }, attempt: nmtAttempt("nmt-1") }));

    expect(store.getState().nmtSession.phase).toBe("result");
    expect(store.getState().nmtSession.resultData).toEqual({ testPoints: 20 });
    expect(store.getState().attempts.items).toHaveLength(1);
    expect(store.getState().attempts.items[0].id).toBe("nmt-1");
  });

  it("never duplicates the attempt across repeated dispatches (timer tick racing manual submit, remounts, Strict Mode)", () => {
    const store = makeTestStore();
    store.dispatch(nmtSessionStarted({ sessionId: "nmt-1", startedAtMs: 0, deadlineMs: 3600000 }));

    store.dispatch(completeNmtSession({ resultData: { testPoints: 20 }, attempt: nmtAttempt("nmt-1") }));
    store.dispatch(completeNmtSession({ resultData: { testPoints: 20 }, attempt: nmtAttempt("nmt-1") }));
    store.dispatch(completeNmtSession({ resultData: { testPoints: 999 }, attempt: nmtAttempt("nmt-1") }));

    expect(store.getState().attempts.items).toHaveLength(1);
    expect(store.getState().nmtSession.resultData).toEqual({ testPoints: 20 });
  });

  it("submits a restored session whose deadline has already expired, exactly once", () => {
    const store = makeTestStore();
    store.dispatch(nmtSessionStarted({ sessionId: "nmt-restored", startedAtMs: 0, deadlineMs: 100 }));

    // Simulates the hook noticing on mount that the restored deadline has
    // already passed and submitting through the normal scoring path.
    store.dispatch(completeNmtSession({ resultData: { testPoints: 5 }, attempt: nmtAttempt("nmt-restored") }));
    store.dispatch(completeNmtSession({ resultData: { testPoints: 5 }, attempt: nmtAttempt("nmt-restored") }));

    expect(store.getState().nmtSession.phase).toBe("result");
    expect(store.getState().attempts.items).toHaveLength(1);
  });
});

describe("completePracticeSession", () => {
  it("records the attempt and updates topic stats from its outcomes", () => {
    const store = makeTestStore();
    store.dispatch(completePracticeSession({ attempt: practiceAttempt("practice-1") }));

    expect(store.getState().attempts.items).toHaveLength(1);
    expect(store.getState().topicStats.byCategory.powers).toEqual({ attempted: 2, correct: 1, incorrect: 1 });
  });

  it("never double-counts topic stats for a duplicate attempt id", () => {
    const store = makeTestStore();
    store.dispatch(completePracticeSession({ attempt: practiceAttempt("practice-1") }));
    store.dispatch(completePracticeSession({ attempt: practiceAttempt("practice-1") }));

    expect(store.getState().attempts.items).toHaveLength(1);
    expect(store.getState().topicStats.byCategory.powers).toEqual({ attempted: 2, correct: 1, incorrect: 1 });
  });

  it("keeps attempts from different sessions and categories independent", () => {
    const store = makeTestStore();
    store.dispatch(completePracticeSession({ attempt: practiceAttempt("practice-1") }));
    store.dispatch(
      completePracticeSession({
        attempt: practiceAttempt("practice-2", {
          category: "roots",
          outcomes: [{ questionId: "practice-roots-1", category: "roots", correct: true, earnedPoints: 1, maxPoints: 1 }],
        }),
      })
    );

    expect(store.getState().attempts.items).toHaveLength(2);
    expect(store.getState().topicStats.byCategory.powers).toEqual({ attempted: 2, correct: 1, incorrect: 1 });
    expect(store.getState().topicStats.byCategory.roots).toEqual({ attempted: 1, correct: 1, incorrect: 0 });
  });
});
