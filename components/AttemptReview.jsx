import {
  classifyOutcome,
  outcomeHasSnapshot,
  outcomeStatusLabel,
  selectRetryableOutcomes,
  formatAnswerText,
  formatCorrectAnswerText,
  formatAttemptDateTime,
  trainerTypeLabel,
  difficultyLabel,
} from "@/lib/attemptReview";
import { formatCountdown } from "@/lib/nmtSession";
import { topics } from "@/lib/topics";
import MarkToggleButton from "./MarkToggleButton";

function topicLabel(categoryId) {
  return topics.find((topic) => topic.id === categoryId)?.label ?? categoryId;
}

function OutcomeRow({ attempt, outcome, isMarked, onToggleMark, onRetryOne }) {
  const status = classifyOutcome(outcome);
  const hasSnapshot = outcomeHasSnapshot(outcome);
  const question = outcome.questionSnapshot;

  return (
    <li className={`outcome-row outcome-status-${status}`}>
      <div className="outcome-row-top">
        <span className="outcome-status-badge">{outcomeStatusLabel(status)}</span>
        <span className="outcome-points">
          {outcome.earnedPoints}/{outcome.maxPoints} балів
        </span>
      </div>

      {hasSnapshot ? (
        <>
          <p className="outcome-question">{question.text}</p>
          <dl className="outcome-details">
            <div>
              <dt>Твоя відповідь</dt>
              <dd>{formatAnswerText(question, outcome.submittedAnswer)}</dd>
            </div>
            <div>
              <dt>Правильна відповідь</dt>
              <dd>{formatCorrectAnswerText(question)}</dd>
            </div>
          </dl>
          {question.explanation && <p className="outcome-explanation">{question.explanation}</p>}
          <div className="outcome-actions">
            <MarkToggleButton marked={isMarked} onToggle={onToggleMark} />
            {status !== "correct" && (
              <button type="button" className="button" onClick={onRetryOne}>
                Повторити це завдання
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="outcome-legacy-note">
          Перегляд і повторення недоступні для цієї застарілої спроби — дані завдання не збереглися.
        </p>
      )}
    </li>
  );
}

export default function AttemptReview({ attempt, isMarked, onToggleMark, onBack, onRetryIncorrect, onRetryOne, retryMessage }) {
  const hasRetryableOutcome = selectRetryableOutcomes(attempt).length > 0;

  return (
    <section className="attempt-review" aria-labelledby="attempt-review-title">
      <button type="button" className="button" onClick={onBack}>
        ← До списку спроб
      </button>

      <div className="attempt-review-summary">
        <h2 id="attempt-review-title">{trainerTypeLabel(attempt.trainerType)}</h2>
        <p className="attempt-review-meta">
          {formatAttemptDateTime(attempt.completedAt)} · {attempt.totalPoints}/{attempt.maxPoints} балів ·{" "}
          {formatCountdown(attempt.durationMs)}
          {attempt.category && (
            <>
              {" · "}
              {topicLabel(attempt.category)}
              {attempt.difficulty ? `, ${difficultyLabel(attempt.difficulty)}` : ""}
            </>
          )}
        </p>
        <button type="button" className="button button-primary" disabled={!hasRetryableOutcome} onClick={onRetryIncorrect}>
          Повторити помилки
        </button>
        {!hasRetryableOutcome && (
          <p className="retry-empty-message">
            {attempt.outcomes.every((outcome) => !outcomeHasSnapshot(outcome))
              ? "Це стара спроба без збережених даних завдань — повторення недоступне."
              : "У цій спробі немає завдань для повторення — усі відповіді вже правильні."}
          </p>
        )}
        {retryMessage && (
          <p className="retry-empty-message" role="alert">
            {retryMessage}
          </p>
        )}
      </div>

      <ul className="outcome-list">
        {attempt.outcomes.map((outcome) => (
          <OutcomeRow
            key={outcome.questionId}
            attempt={attempt}
            outcome={outcome}
            isMarked={isMarked(outcome.questionId)}
            onToggleMark={() =>
              onToggleMark({
                questionId: outcome.questionId,
                questionSnapshot: outcome.questionSnapshot,
                category: outcome.category,
                sourceAttemptId: attempt.id,
              })
            }
            onRetryOne={() => onRetryOne(outcome.questionId)}
          />
        ))}
      </ul>
    </section>
  );
}
