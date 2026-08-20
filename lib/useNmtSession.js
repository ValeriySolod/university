"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

const TICK_INTERVAL_MS = 250;

export function useNmtSession() {
  const [phase, setPhase] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersVersion, setAnswersVersion] = useState(0);
  const [remainingMs, setRemainingMs] = useState(NMT_SESSION_DURATION_MS);
  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [resultData, setResultData] = useState(null);

  const answersRef = useRef({});
  const startedAtRef = useRef(0);
  const deadlineRef = useRef(0);
  const intervalRef = useRef(null);
  const submitGuardRef = useRef(createOnceGuard());

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
        answersById: answersRef.current,
        startedAtMs: startedAtRef.current,
        submittedAtMs,
      });
      setResultData(result);
      setConfirmingSubmit(false);
      setPhase("result");
    });
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const remaining = computeRemainingMs(deadlineRef.current, now);
    setRemainingMs(remaining);
    if (isSessionExpired(deadlineRef.current, now)) {
      submit();
    }
  }, [submit]);

  const start = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    submitGuardRef.current = createOnceGuard();
    answersRef.current = {};
    startedAtRef.current = Date.now();
    deadlineRef.current = computeDeadline(startedAtRef.current);
    setAnswersVersion((v) => v + 1);
    setCurrentIndex(0);
    setConfirmingSubmit(false);
    setResultData(null);
    setRemainingMs(NMT_SESSION_DURATION_MS);
    setPhase("active");
    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
  }, [tick]);

  const setAnswer = useCallback((questionId, answer) => {
    answersRef.current = { ...answersRef.current, [questionId]: answer };
    setAnswersVersion((v) => v + 1);
  }, []);

  const goToIndex = useCallback((index) => {
    setCurrentIndex(Math.min(Math.max(index, 0), NMT_TASK_COUNT - 1));
  }, []);

  const goNext = useCallback(() => {
    setCurrentIndex((index) => Math.min(index + 1, NMT_TASK_COUNT - 1));
  }, []);

  const goPrev = useCallback(() => {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }, []);

  const requestSubmit = useCallback(() => {
    const unanswered = NMT_TASK_COUNT - countAnsweredQuestions(nmtQuestions, answersRef.current);
    if (unanswered > 0) {
      setConfirmingSubmit(true);
      return;
    }
    submit();
  }, [submit]);

  const cancelSubmit = useCallback(() => {
    setConfirmingSubmit(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "active") {
      questionRegionRef.current?.focus();
    }
  }, [phase, currentIndex]);

  const answers = answersRef.current;
  const questionStatuses = nmtQuestions.map((question) => isQuestionAnswered(question, answers[question.id]));
  const answeredCount = questionStatuses.filter(Boolean).length;
  const currentQuestion = nmtQuestions[currentIndex];

  return {
    phase,
    questions: nmtQuestions,
    totalCount: NMT_TASK_COUNT,
    currentIndex,
    currentQuestion,
    currentAnswer: answers[currentQuestion.id],
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
