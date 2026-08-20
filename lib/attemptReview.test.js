import { describe, expect, it } from "vitest";
import {
  classifyOutcome,
  outcomeHasSnapshot,
  selectAttemptsNewestFirst,
  selectRetryableOutcomes,
  buildRetrySetFromAttempt,
  buildRetrySetFromSingleOutcome,
  buildRetrySetFromMarked,
} from "./attemptReview";

const snapshot = { id: "practice-powers-1", type: "single-choice", text: "2^3?", answers: ["6", "8"], correctIndex: 1, pointValue: 1, explanation: "" };

function outcome(overrides = {}) {
  return {
    questionId: "practice-powers-1",
    category: "powers",
    correct: false,
    earnedPoints: 0,
    maxPoints: 1,
    questionSnapshot: snapshot,
    submittedAnswer: null,
    ...overrides,
  };
}

function attempt(id, overrides = {}) {
  return {
    id,
    trainerType: "practice",
    completedAt: 1000,
    category: "powers",
    difficulty: "basic",
    mode: "classic",
    quantity: 1,
    totalPoints: 0,
    maxPoints: 1,
    durationMs: 500,
    outcomes: [outcome()],
    sourceAttemptId: null,
    ...overrides,
  };
}

describe("outcomeHasSnapshot", () => {
  it("is true when a snapshot is present and false for legacy outcomes", () => {
    expect(outcomeHasSnapshot(outcome())).toBe(true);
    expect(outcomeHasSnapshot(outcome({ questionSnapshot: undefined }))).toBe(false);
    expect(outcomeHasSnapshot(outcome({ questionSnapshot: null }))).toBe(false);
  });
});

describe("classifyOutcome", () => {
  it("classifies a legacy outcome (no snapshot) regardless of other fields", () => {
    expect(classifyOutcome(outcome({ questionSnapshot: undefined, submittedAnswer: undefined }))).toBe("legacy");
  });

  it("classifies an unanswered outcome", () => {
    expect(classifyOutcome(outcome({ submittedAnswer: null }))).toBe("unanswered");
  });

  it("classifies a fully correct outcome", () => {
    expect(classifyOutcome(outcome({ submittedAnswer: { selectedIndex: 1 }, earnedPoints: 1, maxPoints: 1 }))).toBe("correct");
  });

  it("classifies an incorrect (zero-point) answered outcome", () => {
    expect(classifyOutcome(outcome({ submittedAnswer: { selectedIndex: 0 }, earnedPoints: 0, maxPoints: 1 }))).toBe("incorrect");
  });

  it("classifies a partially correct outcome (points between zero and max)", () => {
    expect(classifyOutcome(outcome({ submittedAnswer: { mapping: {} }, earnedPoints: 1, maxPoints: 3 }))).toBe("partial");
  });
});

describe("selectAttemptsNewestFirst", () => {
  it("sorts by completedAt descending", () => {
    const a = attempt("a", { completedAt: 1000 });
    const b = attempt("b", { completedAt: 3000 });
    const c = attempt("c", { completedAt: 2000 });
    expect(selectAttemptsNewestFirst([a, b, c]).map((x) => x.id)).toEqual(["b", "c", "a"]);
  });

  it("breaks ties on completedAt deterministically by id, without mutating the input", () => {
    const input = [attempt("a", { completedAt: 1000 }), attempt("z", { completedAt: 1000 })];
    const result = selectAttemptsNewestFirst(input);
    expect(result.map((x) => x.id)).toEqual(["z", "a"]);
    expect(input.map((x) => x.id)).toEqual(["a", "z"]);
  });
});

describe("selectRetryableOutcomes", () => {
  it("excludes correct and legacy outcomes", () => {
    const incorrect = outcome({ questionId: "q1", submittedAnswer: { selectedIndex: 0 }, earnedPoints: 0 });
    const correct = outcome({ questionId: "q2", submittedAnswer: { selectedIndex: 1 }, earnedPoints: 1 });
    const legacy = outcome({ questionId: "q3", questionSnapshot: undefined });
    const unanswered = outcome({ questionId: "q4", submittedAnswer: null });

    const result = selectRetryableOutcomes(attempt("a1", { outcomes: [incorrect, correct, legacy, unanswered] }));
    expect(result.map((o) => o.questionId)).toEqual(["q1", "q4"]);
  });
});

describe("buildRetrySetFromAttempt", () => {
  it("builds one entry per retryable outcome with the source attempt id", () => {
    const result = buildRetrySetFromAttempt(attempt("a1"));
    expect(result.isEmpty).toBe(false);
    expect(result.sourceAttemptId).toBe("a1");
    expect(result.entries).toEqual([{ questionId: "practice-powers-1", category: "powers", question: snapshot }]);
  });

  it("is empty when every outcome is already correct", () => {
    const correctOutcome = outcome({ submittedAnswer: { selectedIndex: 1 }, earnedPoints: 1, maxPoints: 1 });
    const result = buildRetrySetFromAttempt(attempt("a1", { outcomes: [correctOutcome] }));
    expect(result.isEmpty).toBe(true);
    expect(result.entries).toEqual([]);
  });
});

describe("buildRetrySetFromSingleOutcome", () => {
  it("builds exactly one entry for the requested question", () => {
    const result = buildRetrySetFromSingleOutcome(attempt("a1"), "practice-powers-1");
    expect(result.isEmpty).toBe(false);
    expect(result.entries).toEqual([{ questionId: "practice-powers-1", category: "powers", question: snapshot }]);
    expect(result.sourceAttemptId).toBe("a1");
  });

  it("never substitutes another question when the requested one is missing", () => {
    const result = buildRetrySetFromSingleOutcome(attempt("a1"), "does-not-exist");
    expect(result.isEmpty).toBe(true);
    expect(result.entries).toEqual([]);
  });

  it("never substitutes another question when the requested outcome is legacy (no snapshot)", () => {
    const legacy = outcome({ questionId: "q1", questionSnapshot: undefined });
    const result = buildRetrySetFromSingleOutcome(attempt("a1", { outcomes: [legacy] }), "q1");
    expect(result.isEmpty).toBe(true);
    expect(result.entries).toEqual([]);
  });
});

describe("buildRetrySetFromMarked", () => {
  it("builds one entry per marked item with no single source attempt", () => {
    const marked = [{ questionId: "q1", category: "roots", questionSnapshot: snapshot, sourceAttemptId: "a1", markedAt: 1 }];
    const result = buildRetrySetFromMarked(marked);
    expect(result.isEmpty).toBe(false);
    expect(result.sourceAttemptId).toBeNull();
    expect(result.entries).toEqual([{ questionId: "q1", category: "roots", question: snapshot }]);
  });

  it("is empty for no marked questions", () => {
    expect(buildRetrySetFromMarked([])).toEqual({ entries: [], isEmpty: true, sourceAttemptId: null });
  });
});
