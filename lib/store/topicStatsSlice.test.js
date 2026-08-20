import { describe, expect, it } from "vitest";
import reducer, { isValidPersistedTopicStats, topicStatsInitialState, topicStatsUpdated } from "./topicStatsSlice";

describe("topicStatsSlice reducer", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(topicStatsInitialState);
  });

  it("aggregates attempted/correct/incorrect counts per category", () => {
    const outcomes = [
      { questionId: "q1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 },
      { questionId: "q2", category: "powers", correct: false, earnedPoints: 0, maxPoints: 1 },
      { questionId: "q3", category: "roots", correct: true, earnedPoints: 1, maxPoints: 1 },
    ];
    const next = reducer(topicStatsInitialState, topicStatsUpdated({ outcomes }));
    expect(next.byCategory).toEqual({
      powers: { attempted: 2, correct: 1, incorrect: 1 },
      roots: { attempted: 1, correct: 1, incorrect: 0 },
    });
  });

  it("accumulates across multiple completed sessions", () => {
    let state = topicStatsInitialState;
    state = reducer(
      state,
      topicStatsUpdated({ outcomes: [{ questionId: "q1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 }] })
    );
    state = reducer(
      state,
      topicStatsUpdated({ outcomes: [{ questionId: "q2", category: "powers", correct: false, earnedPoints: 0, maxPoints: 1 }] })
    );
    expect(state.byCategory.powers).toEqual({ attempted: 2, correct: 1, incorrect: 1 });
  });

  it("ignores outcomes without a category (e.g. NMT questions)", () => {
    const next = reducer(topicStatsInitialState, topicStatsUpdated({ outcomes: [{ questionId: "q1", category: null, correct: true, earnedPoints: 1, maxPoints: 1 }] }));
    expect(next.byCategory).toEqual({});
  });
});

describe("isValidPersistedTopicStats", () => {
  it("accepts the empty default and well-formed buckets", () => {
    expect(isValidPersistedTopicStats(topicStatsInitialState)).toBe(true);
    expect(isValidPersistedTopicStats({ byCategory: { powers: { attempted: 3, correct: 2, incorrect: 1 } } })).toBe(
      true
    );
  });

  it("rejects a bucket with non-integer or missing counts", () => {
    expect(isValidPersistedTopicStats({ byCategory: { powers: { attempted: 3.5, correct: 2, incorrect: 1 } } })).toBe(
      false
    );
    expect(isValidPersistedTopicStats({ byCategory: { powers: { attempted: 3, correct: 2 } } })).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedTopicStats(null)).toBe(false);
    expect(isValidPersistedTopicStats({ byCategory: "nope" })).toBe(false);
  });
});
