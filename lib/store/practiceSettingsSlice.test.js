import { describe, expect, it } from "vitest";
import reducer, {
  isValidPersistedPracticeSettings,
  practiceDifficultyChoiceSet,
  practiceModeChoiceSet,
  practiceQuantityChoiceSet,
  practiceTopicChoiceSet,
  practiceSettingsInitialState,
} from "./practiceSettingsSlice";

describe("practiceSettingsSlice reducer", () => {
  it("starts with the expected defaults", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(practiceSettingsInitialState);
  });

  it("updates each setting independently", () => {
    let state = practiceSettingsInitialState;
    state = reducer(state, practiceModeChoiceSet("ultimate"));
    state = reducer(state, practiceTopicChoiceSet("powers"));
    state = reducer(state, practiceDifficultyChoiceSet("advanced"));
    state = reducer(state, practiceQuantityChoiceSet(30));

    expect(state).toEqual({
      modeChoice: "ultimate",
      topicChoice: "powers",
      difficultyChoice: "advanced",
      quantityChoice: 30,
    });
  });
});

describe("isValidPersistedPracticeSettings", () => {
  it("accepts the defaults and any current valid combination", () => {
    expect(isValidPersistedPracticeSettings(practiceSettingsInitialState)).toBe(true);
    expect(
      isValidPersistedPracticeSettings({
        modeChoice: "ultimate",
        topicChoice: "roots",
        difficultyChoice: "basic",
        quantityChoice: 20,
      })
    ).toBe(true);
  });

  it("rejects an unknown category, difficulty, quantity, or mode", () => {
    expect(isValidPersistedPracticeSettings({ ...practiceSettingsInitialState, topicChoice: "removed-topic" })).toBe(
      false
    );
    expect(isValidPersistedPracticeSettings({ ...practiceSettingsInitialState, difficultyChoice: "extreme" })).toBe(
      false
    );
    expect(isValidPersistedPracticeSettings({ ...practiceSettingsInitialState, quantityChoice: 15 })).toBe(false);
    expect(isValidPersistedPracticeSettings({ ...practiceSettingsInitialState, modeChoice: "hard" })).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedPracticeSettings(null)).toBe(false);
    expect(isValidPersistedPracticeSettings("classic")).toBe(false);
    expect(isValidPersistedPracticeSettings({})).toBe(false);
  });
});
