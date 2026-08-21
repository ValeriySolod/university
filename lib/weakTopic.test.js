import { describe, expect, it } from "vitest";
import { planWeakTopicSession, selectWeakestCategory } from "./weakTopic";

describe("selectWeakestCategory", () => {
  it("returns null when there are no statistics at all", () => {
    expect(selectWeakestCategory({})).toBeNull();
    expect(selectWeakestCategory(undefined)).toBeNull();
  });

  it("ignores categories that are not in lib/topics.js", () => {
    expect(
      selectWeakestCategory({
        "not-a-real-topic": { attempted: 10, correct: 0, incorrect: 10 },
      })
    ).toBeNull();
  });

  it("ignores categories with zero errors even if attempted", () => {
    expect(
      selectWeakestCategory({
        powers: { attempted: 10, correct: 10, incorrect: 0 },
      })
    ).toBeNull();
  });

  it("ignores categories that were never attempted", () => {
    expect(
      selectWeakestCategory({
        powers: { attempted: 0, correct: 0, incorrect: 0 },
      })
    ).toBeNull();
  });

  it("ranks by highest error rate first", () => {
    const result = selectWeakestCategory({
      powers: { attempted: 10, correct: 8, incorrect: 2 }, // 20%
      roots: { attempted: 10, correct: 5, incorrect: 5 }, // 50%
      logarithms: { attempted: 10, correct: 9, incorrect: 1 }, // 10%
    });
    expect(result).toBe("roots");
  });

  it("breaks error-rate ties by highest incorrect count", () => {
    const result = selectWeakestCategory({
      powers: { attempted: 4, correct: 2, incorrect: 2 }, // 50%, 2 incorrect
      roots: { attempted: 10, correct: 5, incorrect: 5 }, // 50%, 5 incorrect
    });
    expect(result).toBe("roots");
  });

  it("breaks remaining ties by lib/topics.js order", () => {
    // powers appears before roots in lib/topics.js.
    const result = selectWeakestCategory({
      roots: { attempted: 10, correct: 5, incorrect: 5 },
      powers: { attempted: 10, correct: 5, incorrect: 5 },
    });
    expect(result).toBe("powers");
  });

  it("skips ineligible categories in favor of an eligible weaker one", () => {
    const result = selectWeakestCategory({
      elementary: { attempted: 10, correct: 10, incorrect: 0 },
      "unknown-legacy-category": { attempted: 10, correct: 0, incorrect: 10 },
      logarithms: { attempted: 5, correct: 3, incorrect: 2 },
    });
    expect(result).toBe("logarithms");
  });
});

describe("planWeakTopicSession", () => {
  it("reports not eligible when no weak category exists yet", () => {
    const plan = planWeakTopicSession({ byCategory: {}, difficulty: "all", quantity: 10, mode: "classic" });
    expect(plan).toEqual({ eligible: false });
  });

  it("starts the session for the selected weakest category and preserves difficulty/quantity/mode", () => {
    const byCategory = {
      powers: { attempted: 10, correct: 8, incorrect: 2 }, // 20%
      roots: { attempted: 10, correct: 5, incorrect: 5 }, // 50% — the weakest
    };

    const plan = planWeakTopicSession({ byCategory, difficulty: "advanced", quantity: 20, mode: "ultimate" });

    expect(plan.eligible).toBe(true);
    expect(plan.categoryId).toBe("roots");
    expect(plan.difficulty).toBe("advanced");
    expect(plan.quantity).toBe(20);
    expect(plan.mode).toBe("ultimate");
    expect(plan.isEmpty).toBe(false);
    expect(plan.questions).toHaveLength(20);
    // Never backfills from another category or difficulty.
    expect(plan.questions.every((question) => question.difficulty === "advanced")).toBe(true);
  });

  it("flags an empty pool instead of backfilling when the selected difficulty is unrecognized", () => {
    const byCategory = { elementary: { attempted: 10, correct: 4, incorrect: 6 } };

    const plan = planWeakTopicSession({ byCategory, difficulty: "not-a-real-difficulty", quantity: 10, mode: "classic" });

    expect(plan.eligible).toBe(true);
    expect(plan.categoryId).toBe("elementary");
    expect(plan.isEmpty).toBe(true);
    expect(plan.questions).toHaveLength(0);
  });
});
