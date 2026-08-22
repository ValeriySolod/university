"use client";

import { useAttemptHistory } from "@/lib/useAttemptHistory";
import AttemptHistoryList from "./AttemptHistoryList";
import MarkedQuestionsPanel from "./MarkedQuestionsPanel";
import AttemptReview from "./AttemptReview";
import RetrySession from "./RetrySession";
import RetryResult from "./RetryResult";

// The outer region's aria-labelledby must always resolve to a heading that
// is actually mounted for the current view — each view renders a different
// heading (or none, before this map added one), so the id is looked up per
// view rather than hardcoded to the list view's "trainer-title".
const REGION_LABEL_ID_BY_VIEW = Object.freeze({
  list: "trainer-title",
  review: "attempt-review-title",
  retry: "trainer-title",
  "retry-result": "retry-result-title",
});

export default function HistoryTrainer() {
  const history = useAttemptHistory();

  return (
    <section className="trainer history-trainer" aria-labelledby={REGION_LABEL_ID_BY_VIEW[history.view]}>
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
          <AttemptHistoryList attempts={history.attempts} onOpenAttempt={history.openAttempt} onClearHistory={history.clearHistory} />
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
