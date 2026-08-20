import { describe, expect, it } from "vitest";
import { QUESTION_TYPES, validateQuestions } from "./questionTypes";
import { NMT_MAX_TEST_POINTS } from "./nmtScore";
import {
  NMT_MATCHING_COUNT,
  NMT_SHORT_ANSWER_COUNT,
  NMT_SINGLE_CHOICE_COUNT,
  NMT_TASK_COUNT,
  nmtQuestions,
} from "./nmtQuestions";

describe("nmtQuestions — fixed test bank", () => {
  it("contains exactly 22 tasks", () => {
    expect(NMT_TASK_COUNT).toBe(22);
    expect(nmtQuestions).toHaveLength(22);
  });

  it("is valid against the universal question contract", () => {
    expect(validateQuestions(nmtQuestions)).toEqual({ valid: true, errors: [] });
  });

  it("has unique question ids", () => {
    const ids = nmtQuestions.map((question) => question.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("contains exactly 15 single-choice questions worth 1 point each", () => {
    const singleChoice = nmtQuestions.filter((question) => question.type === QUESTION_TYPES.SINGLE_CHOICE);
    expect(singleChoice).toHaveLength(NMT_SINGLE_CHOICE_COUNT);
    expect(singleChoice.every((question) => question.pointValue === 1)).toBe(true);
  });

  it("contains exactly 3 matching questions with 3 left-side items and 3 points each", () => {
    const matching = nmtQuestions.filter((question) => question.type === QUESTION_TYPES.MATCHING);
    expect(matching).toHaveLength(NMT_MATCHING_COUNT);
    expect(matching.every((question) => question.pointValue === 3)).toBe(true);
    expect(matching.every((question) => question.leftOptions.length === 3)).toBe(true);
  });

  it("contains exactly 4 short-answer questions worth 2 points each", () => {
    const shortAnswer = nmtQuestions.filter((question) => question.type === QUESTION_TYPES.SHORT_ANSWER);
    expect(shortAnswer).toHaveLength(NMT_SHORT_ANSWER_COUNT);
    expect(shortAnswer.every((question) => question.pointValue === 2)).toBe(true);
  });

  it("sums to the official 32-point maximum", () => {
    const total = nmtQuestions.reduce((sum, question) => sum + question.pointValue, 0);
    expect(total).toBe(NMT_MAX_TEST_POINTS);
    expect(total).toBe(32);
  });
});
