import { useEffect, useRef, useState } from "react";
import { formatAttemptDateTime, trainerTypeLabel, difficultyLabel } from "@/lib/attemptReview";
import { formatCountdown } from "@/lib/nmtSession";
import { topics } from "@/lib/topics";

function topicLabel(categoryId) {
  return topics.find((topic) => topic.id === categoryId)?.label ?? categoryId;
}

export default function AttemptHistoryList({ attempts, onOpenAttempt, onClearHistory }) {
  const [confirmingClear, setConfirmingClear] = useState(false);
  const clearTriggerRef = useRef(null);
  const cancelClearRef = useRef(null);

  // Move focus into the alertdialog when it opens, to the safe ("Скасувати")
  // action rather than the destructive one.
  useEffect(() => {
    if (confirmingClear) {
      cancelClearRef.current?.focus();
    }
  }, [confirmingClear]);

  if (attempts.length === 0) {
    return (
      <div className="history-empty" role="status">
        <p>Тут поки немає жодної завершеної спроби. Пройди повний тест на головній сторінці або тренування на «Практиці».</p>
      </div>
    );
  }

  function handleCancelClear() {
    setConfirmingClear(false);
    // The trigger stays mounted while the dialog is open, so it's safe to
    // restore focus to it synchronously here.
    clearTriggerRef.current?.focus();
  }

  function handleConfirmClear() {
    setConfirmingClear(false);
    onClearHistory();
    // Clearing empties `attempts`, which unmounts this whole non-empty
    // branch (trigger included) — there is nothing left to restore focus to.
  }

  return (
    <>
      <div className="history-list-header">
        <button
          type="button"
          ref={clearTriggerRef}
          className="button history-clear-button"
          onClick={() => setConfirmingClear(true)}
        >
          Очистити історію
        </button>
      </div>

      <div
        className="history-clear-confirm"
        role="alertdialog"
        aria-live="assertive"
        aria-label="Підтвердження очищення історії"
        hidden={!confirmingClear}
      >
        {confirmingClear && (
          <>
            <p>Видалити всю історію спроб? Цю дію неможливо скасувати.</p>
            <div className="history-clear-actions">
              <button type="button" className="button button-primary" onClick={handleConfirmClear}>
                Так, очистити
              </button>
              <button type="button" ref={cancelClearRef} className="button" onClick={handleCancelClear}>
                Скасувати
              </button>
            </div>
          </>
        )}
      </div>

      <ol className="history-list">
        {attempts.map((attempt) => (
          <li key={attempt.id} className="history-item">
            <button type="button" className="history-item-button" onClick={() => onOpenAttempt(attempt.id)}>
              <div className="history-item-top">
                <span className="history-item-type">{trainerTypeLabel(attempt.trainerType)}</span>
                <span className="history-item-date">{formatAttemptDateTime(attempt.completedAt)}</span>
              </div>
              <div className="history-item-stats">
                <span>
                  {attempt.totalPoints}/{attempt.maxPoints} балів
                </span>
                <span>{formatCountdown(attempt.durationMs)}</span>
                {attempt.category && (
                  <span>
                    {topicLabel(attempt.category)}
                    {attempt.difficulty ? `, ${difficultyLabel(attempt.difficulty)}` : ""}
                    {attempt.quantity ? `, ${attempt.quantity} завдань` : ""}
                  </span>
                )}
              </div>
            </button>
          </li>
        ))}
      </ol>
    </>
  );
}
