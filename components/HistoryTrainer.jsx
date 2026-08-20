"use client";

import { useAttemptHistory } from "@/lib/useAttemptHistory";
import AttemptHistoryList from "./AttemptHistoryList";
import MarkedQuestionsPanel from "./MarkedQuestionsPanel";
import AttemptReview from "./AttemptReview";
import RetrySession from "./RetrySession";
import RetryResult from "./RetryResult";

export default function HistoryTrainer() {
  const history = useAttemptHistory();

  return (
    <section className="trainer history-trainer" aria-labelledby="trainer-title">
      {history.view === "list" && (
        <>
          <MarkedQuestionsPanel
            items={history.markedQuestions.items}
            retryMessage={history.retryMessage}
            onRetryOne={history.retryMarkedQuestion}
            onUnmark={history.markedQuestions.unmark}
            onRetryAll={history.retryMarked}
          />
          <h2 id="trainer-title" className="visually-hidden">
            Історія спроб
          </h2>
          <AttemptHistoryList attempts={history.attempts} onOpenAttempt={history.openAttempt} />
        </>
      )}

      {history.view === "review" && history.selectedAttempt && (
        <AttemptReview
          attempt={history.selectedAttempt}
          isMarked={history.markedQuestions.isMarked}
          onToggleMark={history.markedQuestions.toggleMark}
          onBack={history.closeReview}
          onRetryIncorrect={() => history.retryIncorrect(history.selectedAttempt.id)}
          onRetryOne={(questionId) => history.retryQuestion(history.selectedAttempt.id, questionId)}
          retryMessage={history.retryMessage}
        />
      )}

      {history.view === "retry" && <RetrySession retry={history.retry} />}

      {history.view === "retry-result" && <RetryResult retryResult={history.retryResult} onBackToList={history.backToList} />}
    </section>
  );
}
