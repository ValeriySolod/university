"use client";

// Single stateful hook powering the /history page: attempt listing,
// opening one attempt for review, and running/recording a retry session
// built from immutable question snapshots. Mirrors the one-hook-per-page
// shape of lib/useNmtSession.js and lib/useMathTrainer.js. All non-trivial
// logic (ordering, classification, retry-set construction, scoring) is
// delegated to lib/attemptReview.js and lib/nmtScore.js — nothing here
// duplicates scoring rules.

import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAttemptsNewestFirst,
  buildRetrySetFromAttempt,
  buildRetrySetFromSingleOutcome,
  buildRetrySetFromMarked,
} from "./attemptReview";
import { buildQuestionOutcome, buildRetryAttempt } from "./attempts";
import { generateAttemptId } from "./attemptId";
import { completeRetrySession } from "./store/thunks";
import { useMarkedQuestions } from "./useMarkedQuestions";

const NO_RETRYABLE_ATTEMPT_MESSAGE = "У цій спробі немає завдань для повторення — усі відповіді вже правильні або перегляд недоступний.";
const NO_MARKED_QUESTIONS_MESSAGE = "Немає позначених завдань для повторення.";

export function useAttemptHistory() {
  const dispatch = useDispatch();
  const attemptItems = useSelector((state) => state.attempts.items);
  const attempts = useMemo(() => selectAttemptsNewestFirst(attemptItems), [attemptItems]);
  const markedQuestions = useMarkedQuestions();

  const [view, setView] = useState("list");
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [retryMessage, setRetryMessage] = useState(null);

  const [retryEntries, setRetryEntries] = useState([]);
  const [retrySourceAttemptId, setRetrySourceAttemptId] = useState(null);
  const [retryIndex, setRetryIndex] = useState(0);
  const [retryAnswer, setRetryAnswer] = useState(undefined);
  const [retryAnswerState, setRetryAnswerState] = useState(null);
  const [retryOutcomes, setRetryOutcomes] = useState([]);
  const [retryResult, setRetryResult] = useState(null);

  const retryStartedAtRef = useRef(0);
  const retryAttemptIdRef = useRef(null);

  const selectedAttempt = useMemo(
    () => attempts.find((attempt) => attempt.id === selectedAttemptId) ?? null,
    [attempts, selectedAttemptId]
  );

  const openAttempt = useCallback((attemptId) => {
    setSelectedAttemptId(attemptId);
    setRetryMessage(null);
    setView("review");
  }, []);

  const closeReview = useCallback(() => {
    setSelectedAttemptId(null);
    setRetryMessage(null);
    setView("list");
  }, []);

  const startRetry = useCallback(({ entries, isEmpty, sourceAttemptId }, emptyMessage) => {
    if (isEmpty) {
      setRetryMessage(emptyMessage);
      return;
    }
    setRetryMessage(null);
    setRetryEntries(entries);
    setRetrySourceAttemptId(sourceAttemptId);
    setRetryIndex(0);
    setRetryAnswer(undefined);
    setRetryAnswerState(null);
    setRetryOutcomes([]);
    setRetryResult(null);
    retryStartedAtRef.current = Date.now();
    retryAttemptIdRef.current = generateAttemptId("retry");
    setView("retry");
  }, []);

  const retryIncorrect = useCallback(
    (attemptId) => {
      const attempt = attempts.find((item) => item.id === attemptId);
      if (!attempt) return;
      startRetry(buildRetrySetFromAttempt(attempt), NO_RETRYABLE_ATTEMPT_MESSAGE);
    },
    [attempts, startRetry]
  );

  const retryQuestion = useCallback(
    (attemptId, questionId) => {
      const attempt = attempts.find((item) => item.id === attemptId);
      if (!attempt) return;
      startRetry(buildRetrySetFromSingleOutcome(attempt, questionId), NO_RETRYABLE_ATTEMPT_MESSAGE);
    },
    [attempts, startRetry]
  );

  const retryMarked = useCallback(() => {
    startRetry(buildRetrySetFromMarked(markedQuestions.items), NO_MARKED_QUESTIONS_MESSAGE);
  }, [markedQuestions.items, startRetry]);

  const retryMarkedQuestion = useCallback(
    (questionId) => {
      const item = markedQuestions.items.find((markedItem) => markedItem.questionId === questionId);
      startRetry(buildRetrySetFromMarked(item ? [item] : []), NO_MARKED_QUESTIONS_MESSAGE);
    },
    [markedQuestions.items, startRetry]
  );

  const currentRetryEntry = retryEntries[retryIndex] ?? null;
  const isLastRetryQuestion = retryIndex === retryEntries.length - 1;

  const setAnswer = useCallback((answer) => {
    setRetryAnswer(answer);
  }, []);

  const checkAnswer = useCallback(() => {
    if (!currentRetryEntry) return;
    const outcome = buildQuestionOutcome({
      question: currentRetryEntry.question,
      answer: retryAnswer,
      categoryId: currentRetryEntry.category,
    });
    setRetryOutcomes((prev) => [...prev, outcome]);
    setRetryAnswerState(outcome);
  }, [currentRetryEntry, retryAnswer]);

  const finishRetry = useCallback(
    (outcomes) => {
      const attempt = buildRetryAttempt({
        id: retryAttemptIdRef.current,
        completedAt: Date.now(),
        durationMs: Math.max(0, Date.now() - retryStartedAtRef.current),
        sourceAttemptId: retrySourceAttemptId,
        outcomes,
      });
      dispatch(completeRetrySession({ attempt }));
      const correctCount = outcomes.filter((outcome) => outcome.correct).length;
      setRetryResult({ attempt, correctCount, total: outcomes.length });
      setView("retry-result");
    },
    [dispatch, retrySourceAttemptId]
  );

  const nextQuestion = useCallback(() => {
    if (isLastRetryQuestion) {
      finishRetry(retryOutcomes);
      return;
    }
    setRetryIndex((index) => index + 1);
    setRetryAnswer(undefined);
    setRetryAnswerState(null);
  }, [isLastRetryQuestion, finishRetry, retryOutcomes]);

  const backToList = useCallback(() => {
    setRetryEntries([]);
    setRetrySourceAttemptId(null);
    setRetryResult(null);
    setSelectedAttemptId(null);
    setRetryMessage(null);
    setView("list");
  }, []);

  return {
    attempts,
    view,
    selectedAttempt,
    retryMessage,
    markedQuestions,
    openAttempt,
    closeReview,
    retryIncorrect,
    retryQuestion,
    retryMarked,
    retryMarkedQuestion,
    retry: {
      entries: retryEntries,
      currentEntry: currentRetryEntry,
      index: retryIndex,
      total: retryEntries.length,
      isLastQuestion: isLastRetryQuestion,
      answer: retryAnswer,
      answerState: retryAnswerState,
      setAnswer,
      checkAnswer,
      nextQuestion,
    },
    retryResult,
    backToList,
  };
}
