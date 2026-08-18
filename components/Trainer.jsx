"use client";

import { useMathTrainer } from "@/lib/useMathTrainer";
import SetupCard from "./SetupCard";
import QuizCard from "./QuizCard";
import ResultCard from "./ResultCard";

export default function Trainer() {
  const trainer = useMathTrainer();

  return (
    <section className="trainer" aria-labelledby="trainer-title">
      <SetupCard
        hidden={trainer.phase !== "setup"}
        modeChoice={trainer.modeChoice}
        onModeChoiceChange={trainer.setModeChoice}
        topicChoice={trainer.topicChoice}
        onTopicChoiceChange={trainer.setTopicChoice}
        onStart={trainer.startTraining}
        totalQuestions={trainer.totalQuestions}
      />

      <QuizCard
        hidden={trainer.phase !== "quiz"}
        currentQuestion={trainer.currentQuestion}
        totalQuestions={trainer.totalQuestions}
        question={trainer.question}
        answerState={trainer.answerState}
        mode={trainer.mode}
        totalTimerText={trainer.totalTimerText}
        questionTimerText={trainer.questionTimerText}
        answersContainerRef={trainer.answersContainerRef}
        nextButtonRef={trainer.nextButtonRef}
        onSelectAnswer={trainer.selectAnswer}
        onNext={trainer.goToNextQuestion}
      />

      <ResultCard
        hidden={trainer.phase !== "result"}
        resultData={trainer.resultData}
        restartButtonRef={trainer.restartButtonRef}
        onRestart={trainer.startTraining}
      />
    </section>
  );
}
