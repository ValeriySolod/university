import { describe, expect, it } from "vitest";
import { questions as elementaryQuestions } from "./questions";
import { buildPracticeQuestions, DIFFICULTIES, QUANTITY_OPTIONS } from "./practiceQuestions";

describe("buildPracticeQuestions — category filtering", () => {
  it("returns only elementary questions for the elementary category", () => {
    const elementaryTexts = new Set(elementaryQuestions.map((q) => q.text));
    const { questions } = buildPracticeQuestions({ categoryId: "elementary", difficulty: "all", quantity: 10 });
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((q) => elementaryTexts.has(q.text))).toBe(true);
  });

  it("returns only powers questions for the powers category", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "powers", difficulty: "all", quantity: 10 });
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => /\^/.test(q.text))).toBe(true);
  });

  it("returns only roots questions for the roots category", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "roots", difficulty: "all", quantity: 10 });
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.text.includes("√"))).toBe(true);
  });

  it("returns only logarithm questions for the logarithms category", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "logarithms", difficulty: "all", quantity: 10 });
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.text.includes("log"))).toBe(true);
  });
});

describe("buildPracticeQuestions — difficulty filtering", () => {
  it("filters the elementary bank to only the requested difficulty", () => {
    const expectedTexts = new Set(
      elementaryQuestions.filter((q) => q.difficulty === "basic").map((q) => q.text)
    );
    const { questions } = buildPracticeQuestions({ categoryId: "elementary", difficulty: "basic", quantity: 10 });
    expect(questions.length).toBe(expectedTexts.size);
    expect(questions.every((q) => expectedTexts.has(q.text))).toBe(true);
  });

  it.each(DIFFICULTIES)("generates only %s-difficulty questions for a generated category", (difficulty) => {
    const { questions } = buildPracticeQuestions({ categoryId: "roots", difficulty, quantity: 10 });
    expect(questions).toHaveLength(10);
    expect(questions.every((q) => q.difficulty === difficulty)).toBe(true);
  });
});

describe("buildPracticeQuestions — quantities", () => {
  it.each(QUANTITY_OPTIONS)("generates exactly %i questions for a generated category", (quantity) => {
    const { questions } = buildPracticeQuestions({ categoryId: "powers", difficulty: "all", quantity });
    expect(questions).toHaveLength(quantity);
  });
});

describe("buildPracticeQuestions — no backfill from another category or difficulty", () => {
  it("never mixes in another category's content", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "logarithms", difficulty: "basic", quantity: 10 });
    expect(questions.every((q) => q.text.includes("log"))).toBe(true);
    expect(questions.every((q) => !q.text.includes("√"))).toBe(true);
  });

  it("never mixes in another difficulty's content", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "logarithms", difficulty: "advanced", quantity: 10 });
    expect(questions.every((q) => q.difficulty === "advanced")).toBe(true);
  });

  it("does not backfill the elementary bank beyond its available matching pool", () => {
    const { questions } = buildPracticeQuestions({ categoryId: "elementary", difficulty: "basic", quantity: 30 });
    // Only 4 elementary questions are tagged "basic" — no other difficulty may fill the gap.
    expect(questions.length).toBe(4);
    expect(questions.every((q) => q.difficulty === "basic")).toBe(true);
  });
});

describe("buildPracticeQuestions — unique session ids across combined batches", () => {
  it("assigns unique ids even when many generated batches are combined", () => {
    // The "advanced" batch size is 3, so a quantity of 30 requires at least 10 batches.
    const { questions } = buildPracticeQuestions({ categoryId: "powers", difficulty: "advanced", quantity: 30 });
    expect(questions).toHaveLength(30);
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(30);
  });
});

describe("buildPracticeQuestions — empty pool", () => {
  it("returns an empty, flagged result for an unknown category", () => {
    const result = buildPracticeQuestions({ categoryId: "unknown-category", difficulty: "all", quantity: 10 });
    expect(result).toEqual({ questions: [], isEmpty: true });
  });

  it("returns an empty, flagged result for an unknown difficulty", () => {
    const result = buildPracticeQuestions({ categoryId: "powers", difficulty: "expert", quantity: 10 });
    expect(result).toEqual({ questions: [], isEmpty: true });
  });

  it("does not fall back to another difficulty when the requested one is unrecognized", () => {
    const result = buildPracticeQuestions({ categoryId: "elementary", difficulty: "expert", quantity: 10 });
    expect(result).toEqual({ questions: [], isEmpty: true });
  });
});
