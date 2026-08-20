import { describe, expect, it } from "vitest";
import reducer, { attemptRecorded, attemptsInitialState, isValidPersistedAttempts } from "./attemptsSlice";

function makeAttempt(id, overrides = {}) {
  return {
    id,
    trainerType: "practice",
    completedAt: 1000,
    category: "powers",
    difficulty: "basic",
    mode: "classic",
    quantity: 10,
    totalPoints: 8,
    maxPoints: 10,
    durationMs: 60000,
    outcomes: [
      { questionId: "practice-powers-1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 },
    ],
    ...overrides,
  };
}

describe("attemptsSlice reducer", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(attemptsInitialState);
  });

  it("appends a new attempt", () => {
    const next = reducer(attemptsInitialState, attemptRecorded(makeAttempt("attempt-1")));
    expect(next.items).toHaveLength(1);
    expect(next.items[0].id).toBe("attempt-1");
  });

  it("ignores a duplicate attempt id (repeated submission, remounts, Strict Mode)", () => {
    const once = reducer(attemptsInitialState, attemptRecorded(makeAttempt("attempt-1")));
    const twice = reducer(once, attemptRecorded(makeAttempt("attempt-1", { totalPoints: 999 })));
    expect(twice.items).toHaveLength(1);
    expect(twice.items[0].totalPoints).toBe(8);
  });

  it("keeps distinct attempts separate", () => {
    let state = attemptsInitialState;
    state = reducer(state, attemptRecorded(makeAttempt("attempt-1")));
    state = reducer(state, attemptRecorded(makeAttempt("attempt-2")));
    expect(state.items.map((item) => item.id)).toEqual(["attempt-1", "attempt-2"]);
  });
});

describe("isValidPersistedAttempts", () => {
  it("accepts an empty list and well-formed records", () => {
    expect(isValidPersistedAttempts(attemptsInitialState)).toBe(true);
    expect(isValidPersistedAttempts({ items: [makeAttempt("a1"), makeAttempt("a2", { trainerType: "nmt" })] })).toBe(
      true
    );
  });

  it("rejects a record missing required fields", () => {
    expect(isValidPersistedAttempts({ items: [{ id: "a1" }] })).toBe(false);
  });

  it("rejects an unrecognized trainerType", () => {
    expect(isValidPersistedAttempts({ items: [makeAttempt("a1", { trainerType: "quiz" })] })).toBe(false);
  });

  it("rejects malformed outcome entries", () => {
    expect(
      isValidPersistedAttempts({
        items: [makeAttempt("a1", { outcomes: [{ questionId: "q1" }] })],
      })
    ).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedAttempts(null)).toBe(false);
    expect(isValidPersistedAttempts({ items: "not-an-array" })).toBe(false);
  });
});
