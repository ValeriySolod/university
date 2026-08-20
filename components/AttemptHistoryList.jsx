import { formatAttemptDateTime, trainerTypeLabel, difficultyLabel } from "@/lib/attemptReview";
import { formatCountdown } from "@/lib/nmtSession";
import { topics } from "@/lib/topics";

function topicLabel(categoryId) {
  return topics.find((topic) => topic.id === categoryId)?.label ?? categoryId;
}

export default function AttemptHistoryList({ attempts, onOpenAttempt }) {
  if (attempts.length === 0) {
    return (
      <div className="history-empty" role="status">
        <p>Тут поки немає жодної завершеної спроби. Пройди повний тест на головній сторінці або тренування на «Практиці».</p>
      </div>
    );
  }

  return (
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
  );
}
