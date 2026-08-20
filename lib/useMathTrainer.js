"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { questions as elementaryQuestions } from "./questions";
import { buildPracticeQuestions } from "./practiceQuestions";
import { buildPracticeAttempt, buildQuestionOutcome } from "./attempts";
import { generateAttemptId } from "./attemptId";
import {
  practiceDifficultyChoiceSet,
  practiceModeChoiceSet,
  practiceQuantityChoiceSet,
  practiceTopicChoiceSet,
} from "./store/practiceSettingsSlice";
import { completePracticeSession } from "./store/thunks";
import { useMarkedQuestions } from "./useMarkedQuestions";

const AUTO_ADVANCE_DELAY = 1400;
const EMPTY_POOL_MESSAGE = "У цій категорії немає завдань обраної складності. Обери інші фільтри.";

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useMathTrainer() {
  const dispatch = useDispatch();
  const { modeChoice, topicChoice, difficultyChoice, quantityChoice } = useSelector(
    (state) => state.practiceSettings
  );
  const { isMarked, toggleMark } = useMarkedQuestions();

  const setModeChoice = useCallback((value) => dispatch(practiceModeChoiceSet(value)), [dispatch]);
  const setTopicChoice = useCallback((value) => dispatch(practiceTopicChoiceSet(value)), [dispatch]);
  const setDifficultyChoice = useCallback((value) => dispatch(practiceDifficultyChoiceSet(value)), [dispatch]);
  const setQuantityChoice = useCallback((value) => dispatch(practiceQuantityChoiceSet(value)), [dispatch]);

  const [phase, setPhase] = useState("setup");
  const [mode, setMode] = useState("classic");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answerState, setAnswerState] = useState(null);
  const [totalTimerText, setTotalTimerText] = useState("00:00");
  const [questionTimerText, setQuestionTimerText] = useState("00:00");
  const [resultData, setResultData] = useState(null);
  const [emptyPoolMessage, setEmptyPoolMessage] = useState(null);

  // Never shown before a session actually starts (phase === "setup" renders
  // SetupCard, not QuizCard), so this can be the static, unshuffled bank —
  // avoiding server/client hydration mismatches from randomized selection.
  const questionsRef = useRef(elementaryQuestions);
  const currentQuestionRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const answerTimesRef = useRef([]);
  const outcomesRef = useRef([]);
  const questionStartedAtRef = useRef(0);
  const trainingStartedAtRef = useRef(0);
  const timerIdRef = useRef(null);
  const autoAdvanceIdRef = useRef(null);

  const attemptIdRef = useRef(null);
  const attemptCategoryRef = useRef(topicChoice);
  const attemptDifficultyRef = useRef(difficultyChoice);
  const attemptModeRef = useRef(modeChoice);

  const answersContainerRef = useRef(null);
  const nextButtonRef = useRef(null);
  const restartButtonRef = useRef(null);

  const updateTimer = useCallback(() => {
    const elapsed = Math.floor((Date.now() - trainingStartedAtRef.current) / 1000);
    setTotalTimerText(formatTime(elapsed));
    setQuestionTimerText(
      formatTime(Math.floor((performance.now() - questionStartedAtRef.current) / 1000))
    );
  }, []);

  const showQuestion = useCallback((index) => {
    currentQuestionRef.current = index;
    setCurrentQuestion(index);
    setAnswerState(null);
    questionStartedAtRef.current = performance.now();
    setQuestionTimerText("00:00");
  }, []);

  const showResult = useCallback(() => {
    clearInterval(timerIdRef.current);
    clearTimeout(autoAdvanceIdRef.current);

    const elapsed = Math.floor((Date.now() - trainingStartedAtRef.current) / 1000);
    setTotalTimerText(formatTime(elapsed));

    const correctAnswers = correctAnswersRef.current;
    const times = answerTimesRef.current;
    const total = questionsRef.current.length;
    const percent = Math.round((correctAnswers / total) * 100);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    const title =
      percent >= 80 ? "Чудовий результат!" : percent >= 60 ? "Гарний старт!" : "Практика творить дива!";
    const copy =
      percent >= 80
        ? "Ти впевнено працюєш з базовими математичними поняттями. Так тримати!"
        : "Переглянь пояснення та спробуй ще раз — наступний результат буде кращим.";

    setResultData({
      correctAnswers,
      total,
      percent,
      averageTime,
      title,
      copy,
      totalTimeText: formatTime(elapsed),
    });
    setPhase("result");

    const attempt = buildPracticeAttempt({
      id: attemptIdRef.current,
      completedAt: Date.now(),
      durationMs: elapsed * 1000,
      categoryId: attemptCategoryRef.current,
      difficulty: attemptDifficultyRef.current,
      mode: attemptModeRef.current,
      quantity: total,
      outcomes: outcomesRef.current,
    });
    dispatch(completePracticeSession({ attempt }));
  }, [dispatch]);

  const goToNextQuestion = useCallback(() => {
    const next = currentQuestionRef.current + 1;
    if (next < questionsRef.current.length) {
      showQuestion(next);
    } else {
      showResult();
    }
  }, [showQuestion, showResult]);

  const startTraining = useCallback(() => {
    const { questions, isEmpty } = buildPracticeQuestions({
      categoryId: topicChoice,
      difficulty: difficultyChoice,
      quantity: quantityChoice,
    });

    if (isEmpty) {
      setEmptyPoolMessage(EMPTY_POOL_MESSAGE);
      return;
    }

    setEmptyPoolMessage(null);
    questionsRef.current = questions;
    setMode(modeChoice);
    correctAnswersRef.current = 0;
    answerTimesRef.current = [];
    outcomesRef.current = [];
    attemptIdRef.current = generateAttemptId("practice");
    attemptCategoryRef.current = topicChoice;
    attemptDifficultyRef.current = difficultyChoice;
    attemptModeRef.current = modeChoice;
    trainingStartedAtRef.current = Date.now();
    clearInterval(timerIdRef.current);
    clearTimeout(autoAdvanceIdRef.current);
    setResultData(null);
    setPhase("quiz");
    showQuestion(0);
    timerIdRef.current = setInterval(updateTimer, 1000);
    updateTimer();
  }, [modeChoice, topicChoice, difficultyChoice, quantityChoice, showQuestion, updateTimer]);

  const selectAnswer = useCallback(
    (selectedIndex) => {
      const question = questionsRef.current[currentQuestionRef.current];
      const outcome = buildQuestionOutcome({
        question,
        answer: { selectedIndex },
        categoryId: attemptCategoryRef.current,
      });
      answerTimesRef.current.push((performance.now() - questionStartedAtRef.current) / 1000);
      if (outcome.correct) correctAnswersRef.current += 1;
      outcomesRef.current.push(outcome);

      setAnswerState({ selectedIndex, isCorrect: outcome.correct });

      if (mode === "ultimate") {
        autoAdvanceIdRef.current = setTimeout(goToNextQuestion, AUTO_ADVANCE_DELAY);
      }
    },
    [mode, goToNextQuestion]
  );

  useEffect(() => {
    if (phase === "quiz" && !answerState) {
      answersContainerRef.current?.querySelector("button")?.focus();
    }
  }, [phase, currentQuestion, answerState]);

  useEffect(() => {
    if (answerState && mode !== "ultimate") {
      nextButtonRef.current?.focus();
    }
  }, [answerState, mode]);

  useEffect(() => {
    if (phase === "result") {
      restartButtonRef.current?.focus();
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      clearInterval(timerIdRef.current);
      clearTimeout(autoAdvanceIdRef.current);
    };
  }, []);

  const activeQuestion = questionsRef.current[currentQuestion];

  const toggleCurrentQuestionMark = useCallback(() => {
    if (!activeQuestion) return;
    toggleMark({
      questionId: activeQuestion.id,
      questionSnapshot: activeQuestion,
      category: attemptCategoryRef.current,
      sourceAttemptId: null,
    });
  }, [toggleMark, activeQuestion]);

  return {
    phase,
    modeChoice,
    setModeChoice,
    topicChoice,
    setTopicChoice,
    difficultyChoice,
    setDifficultyChoice,
    quantityChoice,
    setQuantityChoice,
    mode,
    currentQuestion,
    question: activeQuestion,
    totalQuestions: questionsRef.current.length,
    answerState,
    totalTimerText,
    questionTimerText,
    resultData,
    emptyPoolMessage,
    isCurrentQuestionMarked: activeQuestion ? isMarked(activeQuestion.id) : false,
    toggleCurrentQuestionMark,
    answersContainerRef,
    nextButtonRef,
    restartButtonRef,
    startTraining,
    selectAnswer,
    goToNextQuestion,
  };
}
