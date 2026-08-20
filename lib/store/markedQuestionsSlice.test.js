import { describe, expect, it } from "vitest";
import reducer, {
  markedQuestionsInitialState,
  questionMarked,
  questionUnmarked,
  isValidPersistedMarkedQuestions,
  sanitizePersistedMarkedQuestions,
} from "./markedQuestionsSlice";

function makeItem(questionId, overrides = {}) {
  return {
    questionId,
    questionSnapshot: { id: questionId, type: "single-choice", text: "2+2?", answers: ["3", "4"], correctIndex: 1, pointValue: 1, explanation: "" },
    category: "powers",
    sourceAttemptId: null,
    markedAt: 1000,
    ...overrides,
  };
}

describe("markedQuestionsSlice reducer", () => {
  it("starts empty", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(markedQuestionsInitialState);
  });

  it("marks a question", () => {
    const next = reducer(markedQuestionsInitialState, questionMarked(makeItem("q1")));
    expect(next.items).toHaveLength(1);
    expect(next.items[0].questionId).toBe("q1");
  });

  it("deduplicates marking the same question twice", () => {
    const once = reducer(markedQuestionsInitialState, questionMarked(makeItem("q1")));
    const twice = reducer(once, questionMarked(makeItem("q1", { markedAt: 999 })));
    expect(twice.items).toHaveLength(1);
    expect(twice.items[0].markedAt).toBe(1000);
  });

  it("unmarks a question by id", () => {
    let state = reducer(markedQuestionsInitialState, questionMarked(makeItem("q1")));
    state = reducer(state, questionMarked(makeItem("q2")));
    state = reducer(state, questionUnmarked({ questionId: "q1" }));
    expect(state.items.map((item) => item.questionId)).toEqual(["q2"]);
  });

  it("unmarking a question that isn't marked is a no-op", () => {
    const state = reducer(markedQuestionsInitialState, questionUnmarked({ questionId: "missing" }));
    expect(state.items).toHaveLength(0);
  });
});

describe("isValidPersistedMarkedQuestions", () => {
  it("accepts an empty list and well-formed items", () => {
    expect(isValidPersistedMarkedQuestions(markedQuestionsInitialState)).toBe(true);
    expect(isValidPersistedMarkedQuestions({ items: [makeItem("q1"), makeItem("q2", { category: null })] })).toBe(true);
  });

  it("rejects an item missing a question snapshot", () => {
    expect(isValidPersistedMarkedQuestions({ items: [{ questionId: "q1", category: null, sourceAttemptId: null, markedAt: 1 }] })).toBe(
      false
    );
  });

  it("rejects an item with a non-numeric markedAt", () => {
    expect(isValidPersistedMarkedQuestions({ items: [makeItem("q1", { markedAt: "yesterday" })] })).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedMarkedQuestions(null)).toBe(false);
    expect(isValidPersistedMarkedQuestions({ items: "not-an-array" })).toBe(false);
  });

  it("rejects an item carrying a structurally stale/malformed question snapshot", () => {
    // Regression test: a snapshot that merely "is an object" used to pass —
    // including one missing every field a single-choice question needs.
    expect(
      isValidPersistedMarkedQuestions({ items: [makeItem("q1", { questionSnapshot: { type: "single-choice" } })] })
    ).toBe(false);
  });
});

describe("sanitizePersistedMarkedQuestions", () => {
  it("keeps well-formed items unchanged", () => {
    const items = [makeItem("q1"), makeItem("q2")];
    expect(sanitizePersistedMarkedQuestions({ items })).toEqual({ items });
  });

  it("drops only the item with a malformed questionSnapshot, keeping the rest", () => {
    const good = makeItem("q1");
    const bad = makeItem("q2", { questionSnapshot: { type: "single-choice" } });
    expect(sanitizePersistedMarkedQuestions({ items: [good, bad] })).toEqual({ items: [good] });
  });

  it("returns null for structurally unusable top-level data", () => {
    expect(sanitizePersistedMarkedQuestions(null)).toBeNull();
    expect(sanitizePersistedMarkedQuestions({ items: "not-an-array" })).toBeNull();
  });
});
