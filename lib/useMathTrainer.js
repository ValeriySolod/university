"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { topics, DEFAULT_TOPIC_ID } from "./topics";

const AUTO_ADVANCE_DELAY = 1400;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function useMathTrainer() {
  const [phase, setPhase] = useState("setup");
  const [modeChoice, setModeChoice] = useState("classic");
  const [mode, setMode] = useState("classic");
  const [topicChoice, setTopicChoice] = useState(DEFAULT_TOPIC_ID);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answerState, setAnswerState] = useState(null);
  const [totalTimerText, setTotalTimerText] = useState("00:00");
  const [questionTimerText, setQuestionTimerText] = useState("00:00");
  const [resultData, setResultData] = useState(null);

  const questionsRef = useRef(topics.find((topic) => topic.id === DEFAULT_TOPIC_ID).generate());
  const currentQuestionRef = useRef(0);
  const correctAnswersRef = useRef(0);
  const answerTimesRef = useRef([]);
  const questionStartedAtRef = useRef(0);
  const trainingStartedAtRef = useRef(0);
  const timerIdRef = useRef(null);
  const autoAdvanceIdRef = useRef(null);

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
  }, []);

  const goToNextQuestion = useCallback(() => {
    const next = currentQuestionRef.current + 1;
    if (next < questionsRef.current.length) {
      showQuestion(next);
    } else {
      showResult();
    }
  }, [showQuestion, showResult]);

  const startTraining = useCallback(() => {
    const topic = topics.find((t) => t.id === topicChoice) ?? topics[0];
    questionsRef.current = topic.generate();
    setMode(modeChoice);
    correctAnswersRef.current = 0;
    answerTimesRef.current = [];
    trainingStartedAtRef.current = Date.now();
    clearInterval(timerIdRef.current);
    clearTimeout(autoAdvanceIdRef.current);
    setResultData(null);
    setPhase("quiz");
    showQuestion(0);
    timerIdRef.current = setInterval(updateTimer, 1000);
    updateTimer();
  }, [modeChoice, topicChoice, showQuestion, updateTimer]);

  const selectAnswer = useCallback(
    (selectedIndex) => {
      const question = questionsRef.current[currentQuestionRef.current];
      const isCorrect = selectedIndex === question.correctIndex;
      answerTimesRef.current.push((performance.now() - questionStartedAtRef.current) / 1000);
      if (isCorrect) correctAnswersRef.current += 1;

      setAnswerState({ selectedIndex, isCorrect });

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

  return {
    phase,
    modeChoice,
    setModeChoice,
    topicChoice,
    setTopicChoice,
    mode,
    currentQuestion,
    question: questionsRef.current[currentQuestion],
    totalQuestions: questionsRef.current.length,
    answerState,
    totalTimerText,
    questionTimerText,
    resultData,
    answersContainerRef,
    nextButtonRef,
    restartButtonRef,
    startTraining,
    selectAnswer,
    goToNextQuestion,
  };
}
