import { describe, expect, it } from "vitest";
import { QUESTION_TYPES } from "./questionTypes";
import { nmtQuestions } from "./nmtQuestions";
import {
  NMT_SESSION_DURATION_MS,
  buildScoreEntries,
  buildSessionResult,
  computeDeadline,
  computeRemainingMs,
  countAnsweredQuestions,
  createOnceGuard,
  formatCountdown,
  isQuestionAnswered,
  isSessionExpired,
} from "./nmtSession";

const singleChoice = nmtQuestions.find((question) => question.type === QUESTION_TYPES.SINGLE_CHOICE);
const matching = nmtQuestions.find((question) => question.type === QUESTION_TYPES.MATCHING);
const shortAnswer = nmtQuestions.find((question) => question.type === QUESTION_TYPES.SHORT_ANSWER);

describe("computeDeadline / computeRemainingMs / isSessionExpired", () => {
  it("computes an absolute deadline 60 minutes after the start", () => {
    const startedAtMs = 1_000_000;
    expect(computeDeadline(startedAtMs)).toBe(startedAtMs + NMT_SESSION_DURATION_MS);
    expect(NMT_SESSION_DURATION_MS).toBe(60 * 60 * 1000);
  });

  it("computes remaining time from the deadline, never negative", () => {
    const deadlineMs = 100_000;
    expect(computeRemainingMs(deadlineMs, 40_000)).toBe(60_000);
    expect(computeRemainingMs(deadlineMs, 100_000)).toBe(0);
    expect(computeRemainingMs(deadlineMs, 250_000)).toBe(0);
  });

  it("reports expiry once now reaches or passes the deadline", () => {
    const deadlineMs = 100_000;
    expect(isSessionExpired(deadlineMs, 99_999)).toBe(false);
    expect(isSessionExpired(deadlineMs, 100_000)).toBe(true);
    expect(isSessionExpired(deadlineMs, 200_000)).toBe(true);
  });

  it("bases remaining time on the absolute deadline regardless of tick drift", () => {
    const startedAtMs = 0;
    const deadlineMs = computeDeadline(startedAtMs);
    const lateTickNow = NMT_SESSION_DURATION_MS - 1000 + 5000;
    expect(computeRemainingMs(deadlineMs, lateTickNow)).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("formats a full 60-minute session as 60:00", () => {
    expect(formatCountdown(NMT_SESSION_DURATION_MS)).toBe("60:00");
  });

  it("formats zero as 00:00", () => {
    expect(formatCountdown(0)).toBe("00:00");
  });

  it("pads single-digit seconds", () => {
    expect(formatCountdown(65_000)).toBe("01:05");
  });
});

describe("isQuestionAnswered", () => {
  it("treats a single-choice question as answered only with a valid selectedIndex", () => {
    expect(isQuestionAnswered(singleChoice, undefined)).toBe(false);
    expect(isQuestionAnswered(singleChoice, { selectedIndex: 0 })).toBe(true);
    expect(isQuestionAnswered(singleChoice, { selectedIndex: -1 })).toBe(false);
  });

  it("treats a matching question as answered only when every left item is mapped", () => {
    const [firstLeft, secondLeft, thirdLeft] = matching.leftOptions;
    const rightId = matching.rightOptions[0].id;
    expect(isQuestionAnswered(matching, undefined)).toBe(false);
    expect(isQuestionAnswered(matching, { mapping: { [firstLeft.id]: rightId } })).toBe(false);
    expect(
      isQuestionAnswered(matching, {
        mapping: { [firstLeft.id]: rightId, [secondLeft.id]: rightId, [thirdLeft.id]: rightId },
      })
    ).toBe(true);
  });

  it("treats a short-answer question as answered only with non-empty text", () => {
    expect(isQuestionAnswered(shortAnswer, undefined)).toBe(false);
    expect(isQuestionAnswered(shortAnswer, { value: "   " })).toBe(false);
    expect(isQuestionAnswered(shortAnswer, { value: "9" })).toBe(true);
  });
});

describe("countAnsweredQuestions / buildScoreEntries", () => {
  it("counts only answered questions", () => {
    const answersById = { [singleChoice.id]: { selectedIndex: singleChoice.correctIndex } };
    expect(countAnsweredQuestions(nmtQuestions, answersById)).toBe(1);
  });

  it("builds a { question, answer } entry per question, including unanswered ones", () => {
    const answersById = { [singleChoice.id]: { selectedIndex: singleChoice.correctIndex } };
    const entries = buildScoreEntries(nmtQuestions, answersById);
    expect(entries).toHaveLength(nmtQuestions.length);
    const singleChoiceEntry = entries.find((entry) => entry.question.id === singleChoice.id);
    expect(singleChoiceEntry.answer).toEqual({ selectedIndex: singleChoice.correctIndex });
    const unansweredEntry = entries.find((entry) => entry.question.id === matching.id);
    expect(unansweredEntry.answer).toBeUndefined();
  });

  it("builds correct answer-entry shapes for all three question types", () => {
    const matchingAnswer = { mapping: { ...matching.mapping } };
    const shortAnswerValue = { value: shortAnswer.acceptedAnswers[0] };
    const answersById = {
      [singleChoice.id]: { selectedIndex: singleChoice.correctIndex },
      [matching.id]: matchingAnswer,
      [shortAnswer.id]: shortAnswerValue,
    };
    const entries = buildScoreEntries(nmtQuestions, answersById);
    expect(entries.find((e) => e.question.id === singleChoice.id).answer).toEqual({
      selectedIndex: singleChoice.correctIndex,
    });
    expect(entries.find((e) => e.question.id === matching.id).answer).toEqual(matchingAnswer);
    expect(entries.find((e) => e.question.id === shortAnswer.id).answer).toEqual(shortAnswerValue);
  });
});

describe("buildSessionResult", () => {
  it("scores a fully correct submission at the 32-point maximum with a rating", () => {
    const answersById = {};
    nmtQuestions.forEach((question) => {
      if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
        answersById[question.id] = { selectedIndex: question.correctIndex };
      } else if (question.type === QUESTION_TYPES.MATCHING) {
        answersById[question.id] = { mapping: { ...question.mapping } };
      } else {
        answersById[question.id] = { value: question.acceptedAnswers[0] };
      }
    });

    const result = buildSessionResult({
      questions: nmtQuestions,
      answersById,
      startedAtMs: 0,
      submittedAtMs: 90_000,
    });

    expect(result.testPoints).toBe(32);
    expect(result.maxTestPoints).toBe(32);
    expect(result.rating).toBe(200);
    expect(result.answeredCount).toBe(22);
    expect(result.unansweredCount).toBe(0);
    expect(result.totalCount).toBe(22);
    expect(result.elapsedMs).toBe(90_000);
  });

  it("reports no rating below the 5-point threshold", () => {
    const result = buildSessionResult({
      questions: nmtQuestions,
      answersById: {},
      startedAtMs: 0,
      submittedAtMs: 1000,
    });

    expect(result.testPoints).toBe(0);
    expect(result.rating).toBeNull();
    expect(result.answeredCount).toBe(0);
    expect(result.unansweredCount).toBe(22);
  });

  it("never reports a negative elapsed time even if timestamps are out of order", () => {
    const result = buildSessionResult({
      questions: nmtQuestions,
      answersById: {},
      startedAtMs: 5000,
      submittedAtMs: 1000,
    });
    expect(result.elapsedMs).toBe(0);
  });
});

describe("createOnceGuard", () => {
  it("runs the guarded function only once across multiple calls", () => {
    let callCount = 0;
    const guard = createOnceGuard();

    const firstRun = guard(() => {
      callCount += 1;
    });
    const secondRun = guard(() => {
      callCount += 1;
    });

    expect(firstRun).toBe(true);
    expect(secondRun).toBe(false);
    expect(callCount).toBe(1);
  });

  it("prevents an automatic-expiry submit from double-submitting alongside a manual submit", () => {
    const submissions = [];
    const guard = createOnceGuard();

    // Simulates a manual submit racing an automatic expiry submit.
    guard(() => submissions.push("manual"));
    guard(() => submissions.push("auto-expiry"));

    expect(submissions).toEqual(["manual"]);
  });
});
