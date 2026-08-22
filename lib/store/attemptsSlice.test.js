import { describe, expect, it } from "vitest";
import reducer, {
  attemptRecorded,
  attemptsCleared,
  attemptsInitialState,
  isValidPersistedAttempts,
  sanitizePersistedAttempts,
} from "./attemptsSlice";

const validSnapshot = {
  id: "practice-powers-1",
  type: "single-choice",
  text: "2^3?",
  answers: ["6", "8"],
  correctIndex: 1,
  pointValue: 1,
  explanation: "",
};

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

  it("clears all attempt records from a populated state", () => {
    let state = attemptsInitialState;
    state = reducer(state, attemptRecorded(makeAttempt("attempt-1")));
    state = reducer(state, attemptRecorded(makeAttempt("attempt-2")));
    const cleared = reducer(state, attemptsCleared());
    expect(cleared).toEqual(attemptsInitialState);
  });

  it("clearing an already-empty state is idempotent", () => {
    const cleared = reducer(attemptsInitialState, attemptsCleared());
    expect(cleared).toEqual(attemptsInitialState);
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

  it("accepts the retry trainerType with a string sourceAttemptId", () => {
    expect(
      isValidPersistedAttempts({
        items: [makeAttempt("a1", { trainerType: "retry", category: null, difficulty: null, mode: null, sourceAttemptId: "practice-1" })],
      })
    ).toBe(true);
  });

  it("rejects malformed outcome entries", () => {
    expect(
      isValidPersistedAttempts({
        items: [makeAttempt("a1", { outcomes: [{ questionId: "q1" }] })],
      })
    ).toBe(false);
  });

  it("accepts a legacy outcome with no questionSnapshot/submittedAnswer", () => {
    expect(
      isValidPersistedAttempts({
        items: [
          makeAttempt("a1", {
            outcomes: [{ questionId: "practice-powers-1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 }],
          }),
        ],
      })
    ).toBe(true);
  });

  it("accepts an outcome carrying a question snapshot and submitted answer", () => {
    expect(
      isValidPersistedAttempts({
        items: [
          makeAttempt("a1", {
            outcomes: [
              {
                questionId: "practice-powers-1",
                category: "powers",
                correct: true,
                earnedPoints: 1,
                maxPoints: 1,
                questionSnapshot: validSnapshot,
                submittedAnswer: { selectedIndex: 0 },
              },
            ],
          }),
        ],
      })
    ).toBe(true);
  });

  it("rejects a non-string, non-null sourceAttemptId", () => {
    expect(isValidPersistedAttempts({ items: [makeAttempt("a1", { sourceAttemptId: 123 })] })).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedAttempts(null)).toBe(false);
    expect(isValidPersistedAttempts({ items: "not-an-array" })).toBe(false);
  });

  it("rejects an outcome carrying a structurally stale/malformed question snapshot", () => {
    // Regression test: a snapshot that merely "is an object" used to pass —
    // including one missing every field a single-choice question needs.
    expect(
      isValidPersistedAttempts({
        items: [
          makeAttempt("a1", {
            outcomes: [
              {
                questionId: "practice-powers-1",
                category: "powers",
                correct: true,
                earnedPoints: 1,
                maxPoints: 1,
                questionSnapshot: { type: "single-choice" },
              },
            ],
          }),
        ],
      })
    ).toBe(false);
  });
});

describe("sanitizePersistedAttempts", () => {
  it("keeps well-formed records/outcomes unchanged", () => {
    const attempt = makeAttempt("a1", {
      outcomes: [
        {
          questionId: "practice-powers-1",
          category: "powers",
          correct: true,
          earnedPoints: 1,
          maxPoints: 1,
          questionSnapshot: validSnapshot,
          submittedAnswer: { selectedIndex: 1 },
        },
      ],
    });
    expect(sanitizePersistedAttempts({ items: [attempt] })).toEqual({ items: [attempt] });
  });

  it("strips a malformed questionSnapshot to legacy (no snapshot) instead of dropping the outcome or record", () => {
    const attempt = makeAttempt("a1", {
      outcomes: [
        {
          questionId: "practice-powers-1",
          category: "powers",
          correct: true,
          earnedPoints: 1,
          maxPoints: 1,
          questionSnapshot: { type: "single-choice" },
        },
      ],
    });
    const result = sanitizePersistedAttempts({ items: [attempt] });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].outcomes).toHaveLength(1);
    expect(result.items[0].outcomes[0].questionSnapshot).toBeNull();
  });

  it("drops only the structurally broken record, keeping other valid records", () => {
    const good = makeAttempt("a1");
    const bad = { id: "a2" };
    expect(sanitizePersistedAttempts({ items: [good, bad] })).toEqual({ items: [good] });
  });

  it("drops only the structurally broken outcome, keeping the rest of its record", () => {
    const goodOutcome = { questionId: "q1", category: null, correct: true, earnedPoints: 1, maxPoints: 1 };
    const brokenOutcome = { questionId: "q2" };
    const attempt = makeAttempt("a1", { outcomes: [goodOutcome, brokenOutcome] });
    const result = sanitizePersistedAttempts({ items: [attempt] });
    expect(result.items[0].outcomes).toEqual([goodOutcome]);
  });

  it("returns null for structurally unusable top-level data", () => {
    expect(sanitizePersistedAttempts(null)).toBeNull();
    expect(sanitizePersistedAttempts({ items: "not-an-array" })).toBeNull();
  });
});
