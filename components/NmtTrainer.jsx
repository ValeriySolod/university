"use client";

import { useNmtSession } from "@/lib/useNmtSession";
import Hero from "./Hero";
import NmtIntroCard from "./NmtIntroCard";
import NmtTaskCard from "./NmtTaskCard";
import NmtResultCard from "./NmtResultCard";

export default function NmtTrainer() {
  const session = useNmtSession();

  return (
    <>
      {session.phase === "intro" && <Hero />}
      <section className="trainer" aria-labelledby="trainer-title">
        <NmtIntroCard hidden={session.phase !== "intro"} onStart={session.start} />

      <NmtTaskCard
        hidden={session.phase !== "active"}
        currentIndex={session.currentIndex}
        totalCount={session.totalCount}
        question={session.currentQuestion}
        answer={session.currentAnswer}
        questionStatuses={session.questionStatuses}
        answeredCount={session.answeredCount}
        unansweredCount={session.unansweredCount}
        isLastTask={session.isLastTask}
        remainingText={session.remainingText}
        confirmingSubmit={session.confirmingSubmit}
        questionRegionRef={session.questionRegionRef}
        submitButtonRef={session.submitButtonRef}
        isCurrentQuestionMarked={session.isCurrentQuestionMarked}
        onToggleCurrentQuestionMark={session.toggleCurrentQuestionMark}
        onAnswerChange={session.setAnswer}
        onGoToIndex={session.goToIndex}
        onNext={session.goNext}
        onPrev={session.goPrev}
        onRequestSubmit={session.requestSubmit}
        onConfirmSubmit={session.confirmSubmit}
        onCancelSubmit={session.cancelSubmit}
      />

        <NmtResultCard hidden={session.phase !== "result"} resultData={session.resultData} onRestart={session.start} />
      </section>
    </>
  );
}
