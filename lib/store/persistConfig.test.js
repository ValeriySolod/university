import { describe, expect, it } from "vitest";
import { PERSISTED_STATE_VERSION, migrate, validatingStateReconciler } from "./persistConfig";
import { nmtSessionInitialState } from "./nmtSessionSlice";
import { practiceSettingsInitialState } from "./practiceSettingsSlice";
import { attemptsInitialState } from "./attemptsSlice";
import { topicStatsInitialState } from "./topicStatsSlice";
import { markedQuestionsInitialState } from "./markedQuestionsSlice";

const reducedState = {
  nmtSession: nmtSessionInitialState,
  practiceSettings: practiceSettingsInitialState,
  attempts: attemptsInitialState,
  topicStats: topicStatsInitialState,
  markedQuestions: markedQuestionsInitialState,
};

const validNmtSession = {
  phase: "active",
  sessionId: "nmt-1",
  currentIndex: 2,
  answersById: { "nmt-sc-1": { selectedIndex: 0 } },
  startedAtMs: 1000,
  deadlineMs: 4600000,
  resultData: null,
};

describe("validatingStateReconciler", () => {
  it("keeps valid persisted slices as-is", () => {
    const inbound = {
      nmtSession: validNmtSession,
      practiceSettings: { modeChoice: "ultimate", topicChoice: "roots", difficultyChoice: "basic", quantityChoice: 20 },
      attempts: attemptsInitialState,
      topicStats: topicStatsInitialState,
      markedQuestions: markedQuestionsInitialState,
    };
    const result = validatingStateReconciler(inbound, {}, reducedState);
    expect(result.nmtSession).toEqual(validNmtSession);
    expect(result.practiceSettings).toEqual(inbound.practiceSettings);
  });

  it("falls back to fresh defaults for a structurally invalid slice, without touching the others", () => {
    const inbound = {
      nmtSession: { phase: "not-a-real-phase" },
      practiceSettings: { modeChoice: "ultimate", topicChoice: "roots", difficultyChoice: "basic", quantityChoice: 20 },
      attempts: attemptsInitialState,
      topicStats: topicStatsInitialState,
      markedQuestions: markedQuestionsInitialState,
    };
    const result = validatingStateReconciler(inbound, {}, reducedState);
    expect(result.nmtSession).toEqual(nmtSessionInitialState);
    expect(result.practiceSettings).toEqual(inbound.practiceSettings);
  });

  it("defaults a missing markedQuestions slice (e.g. rehydrating version-1 data) to its initial state", () => {
    const inbound = {
      nmtSession: nmtSessionInitialState,
      practiceSettings: practiceSettingsInitialState,
      attempts: attemptsInitialState,
      topicStats: topicStatsInitialState,
    };
    const result = validatingStateReconciler(inbound, {}, reducedState);
    expect(result.markedQuestions).toEqual(markedQuestionsInitialState);
  });

  it("falls back to defaults for a missing or undefined slice", () => {
    const result = validatingStateReconciler({}, {}, reducedState);
    expect(result).toEqual(reducedState);
  });

  it("falls back to defaults for entirely incompatible top-level data", () => {
    const result = validatingStateReconciler({ nmtSession: "corrupted-string" }, {}, reducedState);
    expect(result.nmtSession).toEqual(nmtSessionInitialState);
  });

  it("sanitizes attempts/markedQuestions item-by-item instead of discarding the whole slice", () => {
    // Regression test: one attempt outcome with a structurally stale
    // questionSnapshot used to be accepted as-is; tightening that check to
    // reject it must not take out every other attempt or bookmark too.
    const goodAttempt = {
      id: "a1",
      trainerType: "practice",
      completedAt: 1000,
      category: "powers",
      difficulty: "basic",
      mode: "classic",
      quantity: 1,
      totalPoints: 1,
      maxPoints: 1,
      durationMs: 1000,
      outcomes: [{ questionId: "q1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 }],
      sourceAttemptId: null,
    };
    const staleAttempt = {
      ...goodAttempt,
      id: "a2",
      outcomes: [
        {
          questionId: "q2",
          category: "powers",
          correct: true,
          earnedPoints: 1,
          maxPoints: 1,
          questionSnapshot: { type: "single-choice" },
        },
      ],
    };
    const inbound = {
      nmtSession: nmtSessionInitialState,
      practiceSettings: practiceSettingsInitialState,
      attempts: { items: [goodAttempt, staleAttempt] },
      topicStats: topicStatsInitialState,
      markedQuestions: markedQuestionsInitialState,
    };
    const result = validatingStateReconciler(inbound, {}, reducedState);
    expect(result.attempts.items.map((item) => item.id)).toEqual(["a1", "a2"]);
    expect(result.attempts.items[1].outcomes[0].questionSnapshot).toBeNull();
  });
});

describe("migrate", () => {
  it("keeps state when the persisted version matches the current schema", async () => {
    const state = { nmtSession: validNmtSession };
    await expect(migrate(state, PERSISTED_STATE_VERSION)).resolves.toBe(state);
  });

  it("runs the explicit version-1 migration, keeping legacy attempts available", async () => {
    const state = { nmtSession: validNmtSession, attempts: attemptsInitialState };
    await expect(migrate(state, 1)).resolves.toBe(state);
  });

  it("discards state from an unknown or unsupported schema version", async () => {
    await expect(migrate({ nmtSession: validNmtSession }, 0)).resolves.toBeUndefined();
    await expect(migrate({ nmtSession: validNmtSession }, 3)).resolves.toBeUndefined();
    await expect(migrate({ nmtSession: validNmtSession }, undefined)).resolves.toBeUndefined();
  });
});
