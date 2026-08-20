import { describe, expect, it } from "vitest";
import reducer, {
  isValidPersistedNmtSession,
  nmtAnswerSet,
  nmtCurrentIndexSet,
  nmtSessionCompleted,
  nmtSessionStarted,
  nmtSessionInitialState,
} from "./nmtSessionSlice";
import { NMT_TASK_COUNT } from "../nmtQuestions";

describe("nmtSessionSlice reducer", () => {
  it("starts with the expected defaults", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(nmtSessionInitialState);
  });

  it("atomically replaces the previous session on start (fresh start or restart)", () => {
    const dirty = {
      phase: "result",
      sessionId: "nmt-old",
      currentIndex: 5,
      answersById: { "nmt-sc-1": { selectedIndex: 0 } },
      startedAtMs: 1,
      deadlineMs: 2,
      resultData: { testPoints: 10 },
    };

    const next = reducer(dirty, nmtSessionStarted({ sessionId: "nmt-new", startedAtMs: 1000, deadlineMs: 4600000 }));

    expect(next).toEqual({
      phase: "active",
      sessionId: "nmt-new",
      currentIndex: 0,
      answersById: {},
      startedAtMs: 1000,
      deadlineMs: 4600000,
      resultData: null,
    });
  });

  it("records an answer only while the session is active", () => {
    const active = { ...nmtSessionInitialState, phase: "active" };
    const next = reducer(active, nmtAnswerSet({ questionId: "nmt-sc-1", answer: { selectedIndex: 1 } }));
    expect(next.answersById).toEqual({ "nmt-sc-1": { selectedIndex: 1 } });

    const introState = reducer(nmtSessionInitialState, nmtAnswerSet({ questionId: "nmt-sc-1", answer: { selectedIndex: 1 } }));
    expect(introState.answersById).toEqual({});
  });

  it("clamps the current index into the valid task range", () => {
    const active = { ...nmtSessionInitialState, phase: "active" };
    expect(reducer(active, nmtCurrentIndexSet(-5)).currentIndex).toBe(0);
    expect(reducer(active, nmtCurrentIndexSet(999)).currentIndex).toBe(NMT_TASK_COUNT - 1);
    expect(reducer(active, nmtCurrentIndexSet(3)).currentIndex).toBe(3);
  });

  it("completes an active session and ignores a second completion", () => {
    const active = { ...nmtSessionInitialState, phase: "active" };
    const completed = reducer(active, nmtSessionCompleted({ resultData: { testPoints: 20 } }));
    expect(completed.phase).toBe("result");
    expect(completed.resultData).toEqual({ testPoints: 20 });

    const secondAttempt = reducer(completed, nmtSessionCompleted({ resultData: { testPoints: 999 } }));
    expect(secondAttempt).toEqual(completed);
  });
});

describe("isValidPersistedNmtSession", () => {
  it("accepts the fresh initial state", () => {
    expect(isValidPersistedNmtSession(nmtSessionInitialState)).toBe(true);
  });

  it("accepts a well-formed active session", () => {
    expect(
      isValidPersistedNmtSession({
        phase: "active",
        sessionId: "nmt-1",
        currentIndex: 2,
        answersById: { "nmt-sc-1": { selectedIndex: 0 } },
        startedAtMs: 1000,
        deadlineMs: 4600000,
        resultData: null,
      })
    ).toBe(true);
  });

  it("rejects an unrecognized phase", () => {
    expect(isValidPersistedNmtSession({ ...nmtSessionInitialState, phase: "paused" })).toBe(false);
  });

  it("rejects an active session missing its deadline or session id", () => {
    expect(
      isValidPersistedNmtSession({
        phase: "active",
        sessionId: null,
        currentIndex: 0,
        answersById: {},
        startedAtMs: 1000,
        deadlineMs: 4600000,
        resultData: null,
      })
    ).toBe(false);

    expect(
      isValidPersistedNmtSession({
        phase: "active",
        sessionId: "nmt-1",
        currentIndex: 0,
        answersById: {},
        startedAtMs: 1000,
        deadlineMs: undefined,
        resultData: null,
      })
    ).toBe(false);
  });

  it("rejects a result phase without resultData, and a non-result phase with resultData", () => {
    expect(
      isValidPersistedNmtSession({
        phase: "result",
        sessionId: "nmt-1",
        currentIndex: 0,
        answersById: {},
        startedAtMs: 1000,
        deadlineMs: 4600000,
        resultData: null,
      })
    ).toBe(false);

    expect(
      isValidPersistedNmtSession({
        ...nmtSessionInitialState,
        resultData: { testPoints: 1 },
      })
    ).toBe(false);
  });

  it("rejects structurally malformed values", () => {
    expect(isValidPersistedNmtSession(null)).toBe(false);
    expect(isValidPersistedNmtSession("active")).toBe(false);
    expect(isValidPersistedNmtSession({ ...nmtSessionInitialState, answersById: [] })).toBe(false);
    expect(isValidPersistedNmtSession({ ...nmtSessionInitialState, currentIndex: -1 })).toBe(false);
  });
});
