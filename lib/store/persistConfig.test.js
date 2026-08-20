import { describe, expect, it } from "vitest";
import { PERSISTED_STATE_VERSION, migrate, validatingStateReconciler } from "./persistConfig";
import { nmtSessionInitialState } from "./nmtSessionSlice";
import { practiceSettingsInitialState } from "./practiceSettingsSlice";
import { attemptsInitialState } from "./attemptsSlice";
import { topicStatsInitialState } from "./topicStatsSlice";

const reducedState = {
  nmtSession: nmtSessionInitialState,
  practiceSettings: practiceSettingsInitialState,
  attempts: attemptsInitialState,
  topicStats: topicStatsInitialState,
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
    };
    const result = validatingStateReconciler(inbound, {}, reducedState);
    expect(result.nmtSession).toEqual(nmtSessionInitialState);
    expect(result.practiceSettings).toEqual(inbound.practiceSettings);
  });

  it("falls back to defaults for a missing or undefined slice", () => {
    const result = validatingStateReconciler({}, {}, reducedState);
    expect(result).toEqual(reducedState);
  });

  it("falls back to defaults for entirely incompatible top-level data", () => {
    const result = validatingStateReconciler({ nmtSession: "corrupted-string" }, {}, reducedState);
    expect(result.nmtSession).toEqual(nmtSessionInitialState);
  });
});

describe("migrate", () => {
  it("keeps state when the persisted version matches the current schema", async () => {
    const state = { nmtSession: validNmtSession };
    await expect(migrate(state, PERSISTED_STATE_VERSION)).resolves.toBe(state);
  });

  it("discards state from an unknown or older schema version (no migration path yet)", async () => {
    await expect(migrate({ nmtSession: validNmtSession }, 0)).resolves.toBeUndefined();
    await expect(migrate({ nmtSession: validNmtSession }, 2)).resolves.toBeUndefined();
    await expect(migrate({ nmtSession: validNmtSession }, undefined)).resolves.toBeUndefined();
  });
});
