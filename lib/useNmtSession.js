"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { nmtQuestions, NMT_TASK_COUNT } from "./nmtQuestions";
import {
  NMT_SESSION_DURATION_MS,
  buildSessionResult,
  computeDeadline,
  computeRemainingMs,
  countAnsweredQuestions,
  createOnceGuard,
  formatCountdown,
  isQuestionAnswered,
  isSessionExpired,
} from "./nmtSession";
import { buildNmtAttempt, buildQuestionOutcomes } from "./attempts";
import { generateAttemptId } from "./attemptId";
import { nmtAnswerSet, nmtCurrentIndexSet, nmtSessionStarted } from "./store/nmtSessionSlice";
import { completeNmtSession } from "./store/thunks";

const TICK_INTERVAL_MS = 250;

export function useNmtSession() {
  const dispatch = useDispatch();
  const { phase, currentIndex, answersById, startedAtMs, deadlineMs, resultData, sessionId } = useSelector(
    (state) => state.nmtSession
  );

  const [remainingMs, setRemainingMs] = useState(() =>
    deadlineMs ? computeRemainingMs(deadlineMs, Date.now()) : NMT_SESSION_DURATION_MS
  );
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);

  const intervalRef = useRef(null);
  const submitGuardRef = useRef(createOnceGuard());
  const tickRef = useRef(() => {});

  const questionRegionRef = useRef(null);
  const submitButtonRef = useRef(null);

  const submit = useCallback(() => {
    submitGuardRef.current(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const submittedAtMs = Date.now();
      const result = buildSessionResult({
        questions: nmtQuestions,
        answersById,
        startedAtMs,
        submittedAtMs,
      });
      const outcomes = buildQuestionOutcomes({ questions: nmtQuestions, answersById, categoryId: null });
      const attempt = buildNmtAttempt({
        id: sessionId ?? generateAttemptId("nmt"),
        completedAt: submittedAtMs,
        durationMs: result.elapsedMs,
        resultData: result,
        outcomes,
      });
      setConfirmingSubmit(false);
      dispatch(completeNmtSession({ resultData: result, attempt }));
    });
  }, [dispatch, answersById, startedAtMs, sessionId]);

  const tick = useCallback(() => {
    if (!deadlineMs) return;
    const now = Date.now();
    const remaining = computeRemainingMs(deadlineMs, now);
    setRemainingMs(remaining);
    if (isSessionExpired(deadlineMs, now)) {
      submit();
    }
  }, [deadlineMs, submit]);

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const start = useCallback(() => {
    submitGuardRef.current = createOnceGuard();
    const startedAtMsNow = Date.now();
    const deadlineMsNow = computeDeadline(startedAtMsNow);
    dispatch(
      nmtSessionStarted({
        sessionId: generateAttemptId("nmt"),
        startedAtMs: startedAtMsNow,
        deadlineMs: deadlineMsNow,
      })
    );
    setConfirmingSubmit(false);
    setRemainingMs(NMT_SESSION_DURATION_MS);
  }, [dispatch]);

  const setAnswer = useCallback(
    (questionId, answer) => {
      dispatch(nmtAnswerSet({ questionId, answer }));
    },
    [dispatch]
  );

  const goToIndex = useCallback(
    (index) => {
      dispatch(nmtCurrentIndexSet(Math.min(Math.max(index, 0), NMT_TASK_COUNT - 1)));
    },
    [dispatch]
  );

  const goNext = useCallback(() => {
    dispatch(nmtCurrentIndexSet(Math.min(currentIndex + 1, NMT_TASK_COUNT - 1)));
  }, [dispatch, currentIndex]);

  const goPrev = useCallback(() => {
    dispatch(nmtCurrentIndexSet(Math.max(currentIndex - 1, 0)));
  }, [dispatch, currentIndex]);

  const requestSubmit = useCallback(() => {
    const unanswered = NMT_TASK_COUNT - countAnsweredQuestions(nmtQuestions, answersById);
    if (unanswered > 0) {
      setConfirmingSubmit(true);
      return;
    }
    submit();
  }, [answersById, submit]);

  const cancelSubmit = useCallback(() => {
    setConfirmingSubmit(false);
  }, []);

  // Drives the countdown for an active session, whether it was just started
  // this session or restored from persisted state after a reload. A restored
  // session whose absolute deadline has already passed is submitted once
  // through the normal scoring path rather than resuming a countdown.
  useEffect(() => {
    if (phase !== "active") return undefined;

    if (deadlineMs && isSessionExpired(deadlineMs, Date.now())) {
      submit();
      return undefined;
    }

    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => tickRef.current(), TICK_INTERVAL_MS);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // Only re-run when the session transitions phase; deadlineMs/submit are
    // read from the latest closure via tickRef and are stable for the
    // lifetime of one active session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === "active") {
      questionRegionRef.current?.focus();
    }
  }, [phase, currentIndex]);

  const questionStatuses = nmtQuestions.map((question) => isQuestionAnswered(question, answersById[question.id]));
  const answeredCount = questionStatuses.filter(Boolean).length;
  const currentQuestion = nmtQuestions[currentIndex];

  return {
    phase,
    questions: nmtQuestions,
    totalCount: NMT_TASK_COUNT,
    currentIndex,
    currentQuestion,
    currentAnswer: answersById[currentQuestion.id],
    questionStatuses,
    answeredCount,
    unansweredCount: NMT_TASK_COUNT - answeredCount,
    isLastTask: currentIndex === NMT_TASK_COUNT - 1,
    remainingMs,
    remainingText: formatCountdown(remainingMs),
    confirmingSubmit,
    resultData,
    questionRegionRef,
    submitButtonRef,
    start,
    setAnswer,
    goToIndex,
    goNext,
    goPrev,
    requestSubmit,
    confirmSubmit: submit,
    cancelSubmit,
  };
}
