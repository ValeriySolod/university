// Redux slice for practice setup choices (category, difficulty, quantity,
// Classic/Ultimate mode), persisted so /practice restores the learner's
// previous selection. Deterministic reducers only.

import { createSlice } from "@reduxjs/toolkit";
import { topics, DEFAULT_TOPIC_ID } from "../topics";
import { DIFFICULTY_FILTERS, QUANTITY_OPTIONS } from "../practiceQuestions";

const VALID_MODES = new Set(["classic", "ultimate"]);
const DEFAULT_DIFFICULTY = "all";

export const practiceSettingsInitialState = {
  modeChoice: "classic",
  topicChoice: DEFAULT_TOPIC_ID,
  difficultyChoice: DEFAULT_DIFFICULTY,
  quantityChoice: QUANTITY_OPTIONS[0],
};

const practiceSettingsSlice = createSlice({
  name: "practiceSettings",
  initialState: practiceSettingsInitialState,
  reducers: {
    practiceModeChoiceSet(state, action) {
      state.modeChoice = action.payload;
    },
    practiceTopicChoiceSet(state, action) {
      state.topicChoice = action.payload;
    },
    practiceDifficultyChoiceSet(state, action) {
      state.difficultyChoice = action.payload;
    },
    practiceQuantityChoiceSet(state, action) {
      state.quantityChoice = action.payload;
    },
  },
});

export const {
  practiceModeChoiceSet,
  practiceTopicChoiceSet,
  practiceDifficultyChoiceSet,
  practiceQuantityChoiceSet,
} = practiceSettingsSlice.actions;

// Validates persisted settings against the app's current option lists, so a
// stale or corrupted selection (e.g. a removed category) falls back to
// defaults instead of restoring something /practice can no longer offer.
export function isValidPersistedPracticeSettings(value) {
  if (!value || typeof value !== "object") return false;
  if (!VALID_MODES.has(value.modeChoice)) return false;
  if (!topics.some((topic) => topic.id === value.topicChoice)) return false;
  if (!DIFFICULTY_FILTERS.includes(value.difficultyChoice)) return false;
  if (!QUANTITY_OPTIONS.includes(value.quantityChoice)) return false;
  return true;
}

export default practiceSettingsSlice.reducer;
