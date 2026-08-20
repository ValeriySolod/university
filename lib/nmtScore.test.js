import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "./questionTypes";
import {
  NMT_MAX_TEST_POINTS,
  NMT_RATING_TABLE,
  convertTestPointsToRating,
  scoreMatching,
  scoreNmtTest,
  scoreQuestion,
  scoreShortAnswer,
  scoreSingleChoice,
} from "./nmtScore";

const singleChoice = {
  id: "sc-1",
  type: QUESTION_TYPES.SINGLE_CHOICE,
  text: "Скільки буде 2 + 2?",
  answers: ["3", "4", "5"],
  correctIndex: 1,
  pointValue: 1,
  explanation: "2 + 2 = 4.",
};

const matching = {
  id: "match-1",
  type: QUESTION_TYPES.MATCHING,
  text: "Встанови відповідність між функцією та її похідною.",
  leftOptions: [
    { id: "left-1", text: "x²" },
    { id: "left-2", text: "sin(x)" },
    { id: "left-3", text: "cos(x)" },
  ],
  rightOptions: [
    { id: "right-1", text: "2x" },
    { id: "right-2", text: "cos(x)" },
    { id: "right-3", text: "-sin(x)" },
  ],
  mapping: {
    "left-1": "right-1",
    "left-2": "right-2",
    "left-3": "right-3",
  },
  pointValue: 3,
  explanation: "Похідна x² дорівнює 2x, похідна sin(x) дорівнює cos(x), похідна cos(x) дорівнює -sin(x).",
};

const shortAnswer = {
  id: "short-1",
  type: QUESTION_TYPES.SHORT_ANSWER,
  text: "Чому дорівнює корінь квадратний з 16?",
  acceptedAnswers: ["4", "Чотири", "квадрат числа два"],
  pointValue: 2,
  explanation: "√16 = 4.",
};

describe("scoreSingleChoice", () => {
  it("awards 1 point for the correct selected index", () => {
    expect(scoreSingleChoice(singleChoice, { selectedIndex: 1 })).toBe(1);
  });

  it("awards 0 points for an incorrect selected index", () => {
    expect(scoreSingleChoice(singleChoice, { selectedIndex: 0 })).toBe(0);
  });

  it("awards 0 points when no answer was given", () => {
    expect(scoreSingleChoice(singleChoice, undefined)).toBe(0);
  });

  it("throws for an invalid question", () => {
    expect(() => scoreSingleChoice({ ...singleChoice, correctIndex: -1 }, { selectedIndex: 1 })).toThrow();
  });
});

describe("scoreMatching — partial credit", () => {
  it("awards 0 points when nothing is mapped correctly", () => {
    const answer = { mapping: { "left-1": "right-2", "left-2": "right-3", "left-3": "right-1" } };
    expect(scoreMatching(matching, answer)).toBe(0);
  });

  it("awards 1 point for exactly one correct mapping", () => {
    const answer = { mapping: { "left-1": "right-1", "left-2": "right-3", "left-3": "right-2" } };
    expect(scoreMatching(matching, answer)).toBe(1);
  });

  it("awards 2 points for exactly two correct mappings", () => {
    const answer = { mapping: { "left-1": "right-1", "left-2": "right-2", "left-3": "right-1" } };
    expect(scoreMatching(matching, answer)).toBe(2);
  });

  it("awards 3 points for a fully correct mapping", () => {
    const answer = { mapping: { "left-1": "right-1", "left-2": "right-2", "left-3": "right-3" } };
    expect(scoreMatching(matching, answer)).toBe(3);
  });

  it("does not award points for missing entries", () => {
    const answer = { mapping: { "left-1": "right-1" } };
    expect(scoreMatching(matching, answer)).toBe(1);
  });

  it("does not award points for extra unknown entries", () => {
    const answer = {
      mapping: { "left-1": "right-1", "left-2": "right-2", "left-3": "right-3", "left-4": "right-1" },
    };
    expect(scoreMatching(matching, answer)).toBe(3);
  });

  it("awards 0 points when no answer was given", () => {
    expect(scoreMatching(matching, undefined)).toBe(0);
  });
});

describe("scoreShortAnswer — normalized matching", () => {
  it("awards 2 points for an exact accepted answer", () => {
    expect(scoreShortAnswer(shortAnswer, { value: "4" })).toBe(2);
  });

  it("awards 2 points for a case- and whitespace-normalized variant", () => {
    expect(scoreShortAnswer(shortAnswer, { value: "  ЧОТИРИ  " })).toBe(2);
  });

  it("awards 2 points for a variant with collapsed inner whitespace", () => {
    expect(scoreShortAnswer(shortAnswer, { value: "  квадрат   числа    два  " })).toBe(2);
  });

  it("awards 0 points for a value not among accepted answers", () => {
    expect(scoreShortAnswer(shortAnswer, { value: "5" })).toBe(0);
  });

  it("awards 0 points when no answer was given", () => {
    expect(scoreShortAnswer(shortAnswer, undefined)).toBe(0);
  });
});

describe("scoreQuestion — dispatch by type", () => {
  it("dispatches single-choice questions to scoreSingleChoice", () => {
    expect(scoreQuestion(singleChoice, { selectedIndex: 1 })).toBe(1);
  });

  it("dispatches matching questions to scoreMatching", () => {
    expect(
      scoreQuestion(matching, { mapping: { "left-1": "right-1", "left-2": "right-2", "left-3": "right-3" } })
    ).toBe(3);
  });

  it("dispatches short-answer questions to scoreShortAnswer", () => {
    expect(scoreQuestion(shortAnswer, { value: "4" })).toBe(2);
  });

  it("throws for an invalid question instead of silently scoring it", () => {
    expect(() => scoreQuestion({ ...singleChoice, type: "essay" }, { selectedIndex: 1 })).toThrow();
  });
});

describe("scoreNmtTest — aggregation", () => {
  it("sums points across mixed question types", () => {
    const entries = [
      { question: singleChoice, answer: { selectedIndex: 1 } },
      { question: matching, answer: { mapping: { "left-1": "right-1", "left-2": "right-2" } } },
      { question: shortAnswer, answer: { value: "4" } },
    ];
    expect(scoreNmtTest(entries)).toBe(1 + 2 + 2);
  });

  it("returns 0 for an empty entry list", () => {
    expect(scoreNmtTest([])).toBe(0);
  });

  it("never exceeds the 32-point maximum", () => {
    const fifteenCorrectSingleChoice = Array.from({ length: 15 }, (_, index) => ({
      question: { ...singleChoice, id: `sc-${index}` },
      answer: { selectedIndex: 1 },
    }));
    const threeCorrectMatching = Array.from({ length: 3 }, (_, index) => ({
      question: { ...matching, id: `match-${index}` },
      answer: { mapping: { "left-1": "right-1", "left-2": "right-2", "left-3": "right-3" } },
    }));
    const fourCorrectShortAnswer = Array.from({ length: 4 }, (_, index) => ({
      question: { ...shortAnswer, id: `short-${index}` },
      answer: { value: "4" },
    }));
    const entries = [...fifteenCorrectSingleChoice, ...threeCorrectMatching, ...fourCorrectShortAnswer];
    expect(scoreNmtTest(entries)).toBe(NMT_MAX_TEST_POINTS);
  });

  it("throws when given a non-array", () => {
    expect(() => scoreNmtTest("not an array")).toThrow();
  });

  it("rejects invalid questions instead of silently scoring them", () => {
    const entries = [{ question: { ...singleChoice, correctIndex: 99 }, answer: { selectedIndex: 1 } }];
    expect(() => scoreNmtTest(entries)).toThrow();
  });
});

describe("convertTestPointsToRating — official lookup table", () => {
  it.each(Object.entries(NMT_RATING_TABLE))("maps %s test points to rating %s", (testPoints, rating) => {
    expect(convertTestPointsToRating(Number(testPoints))).toBe(rating);
  });

  it.each([0, 1, 2, 3, 4])("returns null for %s test points, below the rated threshold", (testPoints) => {
    expect(convertTestPointsToRating(testPoints)).toBeNull();
  });

  it("throws for a non-integer input", () => {
    expect(() => convertTestPointsToRating(5.5)).toThrow();
  });

  it("throws for a negative input", () => {
    expect(() => convertTestPointsToRating(-1)).toThrow();
  });

  it("throws for an input greater than 32", () => {
    expect(() => convertTestPointsToRating(33)).toThrow();
  });
});
