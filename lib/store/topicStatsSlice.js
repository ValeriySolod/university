// Redux slice for aggregate per-topic practice statistics (attempted,
// correct, incorrect counts by category). Fed exclusively from completed
// practice-attempt outcomes; deterministic reducers only.

import { createSlice } from "@reduxjs/toolkit";

export const topicStatsInitialState = { byCategory: {} };

const topicStatsSlice = createSlice({
  name: "topicStats",
  initialState: topicStatsInitialState,
  reducers: {
    topicStatsUpdated(state, action) {
      const { outcomes } = action.payload;
      outcomes.forEach((outcome) => {
        if (!outcome.category) return;
        const bucket = state.byCategory[outcome.category] || { attempted: 0, correct: 0, incorrect: 0 };
        bucket.attempted += 1;
        if (outcome.correct) bucket.correct += 1;
        else bucket.incorrect += 1;
        state.byCategory[outcome.category] = bucket;
      });
    },
  },
});

export const { topicStatsUpdated } = topicStatsSlice.actions;

function isValidBucket(bucket) {
  return (
    bucket &&
    typeof bucket === "object" &&
    Number.isInteger(bucket.attempted) &&
    Number.isInteger(bucket.correct) &&
    Number.isInteger(bucket.incorrect)
  );
}

export function isValidPersistedTopicStats(value) {
  if (!value || typeof value !== "object" || !value.byCategory || typeof value.byCategory !== "object") return false;
  return Object.values(value.byCategory).every(isValidBucket);
}

export default topicStatsSlice.reducer;
