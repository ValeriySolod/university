import { describe, expect, it } from "vitest";
import { QUESTION_TYPES, validateQuestion, validateQuestions } from "./questionTypes";
import { questions as elementaryQuestions } from "./questions";
import { generatePowerQuestions } from "./generators/powers";
import { generateRootQuestions } from "./generators/roots";
import { generateLogarithmQuestions } from "./generators/logarithms";

const validSingleChoice = {
  id: "sc-1",
  type: QUESTION_TYPES.SINGLE_CHOICE,
  text: "Скільки буде 2 + 2?",
  answers: ["3", "4", "5"],
  correctIndex: 1,
  pointValue: 1,
  explanation: "2 + 2 = 4.",
};

const validMatching = {
  id: "match-1",
  type: QUESTION_TYPES.MATCHING,
  text: "Встанови відповідність між функцією та її похідною.",
  leftOptions: [
    { id: "left-1", text: "x²" },
    { id: "left-2", text: "sin(x)" },
  ],
  rightOptions: [
    { id: "right-1", text: "2x" },
    { id: "right-2", text: "cos(x)" },
    { id: "right-3", text: "-sin(x)" },
  ],
  mapping: {
    "left-1": "right-1",
    "left-2": "right-2",
  },
  pointValue: 3,
  explanation: "Похідна x² дорівнює 2x, похідна sin(x) дорівнює cos(x).",
};

const validShortAnswer = {
  id: "short-1",
  type: QUESTION_TYPES.SHORT_ANSWER,
  text: "Чому дорівнює корінь квадратний з 16?",
  acceptedAnswers: ["4"],
  pointValue: 2,
  explanation: "√16 = 4.",
};

describe("validateQuestion — valid examples", () => {
  it("accepts a valid single-choice question", () => {
    expect(validateQuestion(validSingleChoice)).toEqual({ valid: true, errors: [] });
  });

  it("accepts a valid matching question", () => {
    expect(validateQuestion(validMatching)).toEqual({ valid: true, errors: [] });
  });

  it("accepts a valid short-answer question", () => {
    expect(validateQuestion(validShortAnswer)).toEqual({ valid: true, errors: [] });
  });
});

describe("validateQuestions — migrated question sets", () => {
  it("accepts the migrated elementary question set with unique ids", () => {
    const result = validateQuestions(elementaryQuestions);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it.each([
    ["powers", generatePowerQuestions],
    ["roots", generateRootQuestions],
    ["logarithms", generateLogarithmQuestions],
  ])("accepts the generated %s question set with unique ids", (_name, generate) => {
    const result = validateQuestions(generate());
    expect(result).toEqual({ valid: true, errors: [] });
  });
});

describe("validateQuestions — duplicate ids", () => {
  it("rejects a set with duplicate ids", () => {
    const result = validateQuestions([validSingleChoice, { ...validSingleChoice }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Duplicate question id"))).toBe(true);
  });
});

describe("validateQuestion — unknown type", () => {
  it("rejects a question with an unrecognized type", () => {
    const result = validateQuestion({ ...validSingleChoice, type: "essay" });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("not recognized"))).toBe(true);
  });
});

describe("validateQuestion — invalid single-choice correctIndex", () => {
  it("rejects a negative correctIndex", () => {
    const result = validateQuestion({ ...validSingleChoice, correctIndex: -1 });
    expect(result.valid).toBe(false);
  });

  it("rejects a correctIndex out of bounds", () => {
    const result = validateQuestion({ ...validSingleChoice, correctIndex: 5 });
    expect(result.valid).toBe(false);
  });
});

describe("validateQuestion — incomplete matching mapping", () => {
  it("rejects a mapping missing an entry for a left-side item", () => {
    const result = validateQuestion({
      ...validMatching,
      mapping: { "left-1": "right-1" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("missing an entry"))).toBe(true);
  });

  it("rejects a mapping pointing to an unknown right-side item", () => {
    const result = validateQuestion({
      ...validMatching,
      mapping: { "left-1": "right-1", "left-2": "right-unknown" },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("unknown right-side item"))).toBe(true);
  });
});

describe("validateQuestion — empty short-answer accepted values", () => {
  it("rejects an empty acceptedAnswers array", () => {
    const result = validateQuestion({ ...validShortAnswer, acceptedAnswers: [] });
    expect(result.valid).toBe(false);
  });

  it("rejects acceptedAnswers containing only whitespace", () => {
    const result = validateQuestion({ ...validShortAnswer, acceptedAnswers: ["   "] });
    expect(result.valid).toBe(false);
  });
});

describe("validateQuestion — invalid point values", () => {
  it("rejects a zero pointValue", () => {
    const result = validateQuestion({ ...validSingleChoice, pointValue: 0 });
    expect(result.valid).toBe(false);
  });

  it("rejects a negative pointValue", () => {
    const result = validateQuestion({ ...validSingleChoice, pointValue: -1 });
    expect(result.valid).toBe(false);
  });

  it("rejects a non-integer pointValue", () => {
    const result = validateQuestion({ ...validSingleChoice, pointValue: 1.5 });
    expect(result.valid).toBe(false);
  });
});

describe("validateQuestion — type-specific pointValue contract", () => {
  it("rejects a single-choice question with pointValue other than 1", () => {
    const result = validateQuestion({ ...validSingleChoice, pointValue: 2 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("single-choice question must have pointValue 1"))).toBe(
      true
    );
  });

  it("rejects a matching question with pointValue other than 3", () => {
    const result = validateQuestion({ ...validMatching, pointValue: 4 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("matching question must have pointValue 3"))).toBe(true);
  });

  it("rejects a short-answer question with pointValue other than 2", () => {
    const result = validateQuestion({ ...validShortAnswer, pointValue: 1 });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("short-answer question must have pointValue 2"))).toBe(
      true
    );
  });
});
