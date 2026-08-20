import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "./questionTypes";
import { nmtQuestions } from "./nmtQuestions";
import { buildSessionResult } from "./nmtSession";
import { buildNmtAttempt, buildPracticeAttempt, buildQuestionOutcome, buildQuestionOutcomes, buildRetryAttempt } from "./attempts";

const singleChoice = nmtQuestions.find((question) => question.type === QUESTION_TYPES.SINGLE_CHOICE);
const matching = nmtQuestions.find((question) => question.type === QUESTION_TYPES.MATCHING);

describe("buildQuestionOutcome", () => {
  it("scores the question against its answer, tagging the category and carrying a snapshot", () => {
    const answer = { selectedIndex: singleChoice.correctIndex };
    const outcome = buildQuestionOutcome({ question: singleChoice, answer, categoryId: "powers" });

    expect(outcome).toEqual({
      questionId: singleChoice.id,
      category: "powers",
      correct: true,
      earnedPoints: 1,
      maxPoints: 1,
      questionSnapshot: singleChoice,
      submittedAnswer: answer,
    });
  });

  it("records an unanswered question with a null submitted answer, not a missing field", () => {
    const outcome = buildQuestionOutcome({ question: singleChoice, answer: undefined });

    expect(outcome.submittedAnswer).toBeNull();
    expect(outcome.correct).toBe(false);
    expect(outcome.earnedPoints).toBe(0);
    expect(outcome.questionSnapshot).toBe(singleChoice);
    expect(outcome.category).toBeNull();
  });
});

describe("buildQuestionOutcomes", () => {
  it("scores each question against its answer, tagging the given category", () => {
    const answersById = { [singleChoice.id]: { selectedIndex: singleChoice.correctIndex } };
    const outcomes = buildQuestionOutcomes({ questions: [singleChoice], answersById, categoryId: "powers" });

    expect(outcomes).toHaveLength(1);
    expect(outcomes[0]).toMatchObject({ questionId: singleChoice.id, category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 });
  });

  it("marks an unanswered question incorrect with zero earned points", () => {
    const outcomes = buildQuestionOutcomes({ questions: [singleChoice], answersById: {} });
    expect(outcomes[0]).toMatchObject({ questionId: singleChoice.id, category: null, correct: false, earnedPoints: 0, maxPoints: 1 });
    expect(outcomes[0].submittedAnswer).toBeNull();
  });

  it("marks a matching question correct only when every point is earned", () => {
    const partialMapping = { ...matching.mapping };
    const [firstLeftId] = Object.keys(partialMapping);
    const partial = { [firstLeftId]: partialMapping[firstLeftId] };
    const outcomes = buildQuestionOutcomes({ questions: [matching], answersById: { [matching.id]: { mapping: partial } } });

    expect(outcomes[0].correct).toBe(false);
    expect(outcomes[0].earnedPoints).toBe(1);
    expect(outcomes[0].maxPoints).toBe(3);
    expect(outcomes[0].questionSnapshot).toBe(matching);
  });
});

describe("buildNmtAttempt", () => {
  it("carries the official test points/rating shape with no practice-only fields", () => {
    const answersById = {};
    const result = buildSessionResult({ questions: nmtQuestions, answersById, startedAtMs: 0, submittedAtMs: 90000 });
    const outcomes = buildQuestionOutcomes({ questions: nmtQuestions, answersById });

    const attempt = buildNmtAttempt({ id: "nmt-1", completedAt: 90000, durationMs: 90000, resultData: result, outcomes });

    expect(attempt.trainerType).toBe("nmt");
    expect(attempt.totalPoints).toBe(result.testPoints);
    expect(attempt.maxPoints).toBe(result.maxTestPoints);
    expect(attempt.category).toBeNull();
    expect(attempt.mode).toBeNull();
    expect(attempt.sourceAttemptId).toBeNull();
    expect(attempt.outcomes).toHaveLength(nmtQuestions.length);
  });
});

describe("buildPracticeAttempt", () => {
  it("sums earned/max points from outcomes and carries the session settings", () => {
    const outcomes = [
      { questionId: "practice-powers-1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 },
      { questionId: "practice-powers-2", category: "powers", correct: false, earnedPoints: 0, maxPoints: 1 },
    ];

    const attempt = buildPracticeAttempt({
      id: "practice-1",
      completedAt: 1000,
      durationMs: 5000,
      categoryId: "powers",
      difficulty: "basic",
      mode: "classic",
      quantity: 2,
      outcomes,
    });

    expect(attempt).toEqual({
      id: "practice-1",
      trainerType: "practice",
      completedAt: 1000,
      category: "powers",
      difficulty: "basic",
      mode: "classic",
      quantity: 2,
      totalPoints: 1,
      maxPoints: 2,
      durationMs: 5000,
      outcomes,
      sourceAttemptId: null,
    });
  });
});

describe("buildRetryAttempt", () => {
  it("builds a retry attempt with no rating-affecting fields and a source attempt reference", () => {
    const outcomes = [
      { questionId: "nmt-sc-1", category: null, correct: true, earnedPoints: 1, maxPoints: 1 },
      { questionId: "nmt-sc-2", category: null, correct: false, earnedPoints: 0, maxPoints: 1 },
    ];

    const attempt = buildRetryAttempt({
      id: "retry-1",
      completedAt: 2000,
      durationMs: 3000,
      sourceAttemptId: "nmt-1",
      outcomes,
    });

    expect(attempt).toEqual({
      id: "retry-1",
      trainerType: "retry",
      completedAt: 2000,
      category: null,
      difficulty: null,
      mode: null,
      quantity: 2,
      totalPoints: 1,
      maxPoints: 2,
      durationMs: 3000,
      outcomes,
      sourceAttemptId: "nmt-1",
    });
  });

  it("defaults sourceAttemptId to null for a marked-questions retry with no single source attempt", () => {
    const attempt = buildRetryAttempt({ id: "retry-2", completedAt: 1000, durationMs: 500, outcomes: [] });
    expect(attempt.sourceAttemptId).toBeNull();
  });
});
