import { formatCountdown } from "@/lib/nmtSession";

export default function NmtResultCard({ hidden, resultData, onRestart }) {
  const data = resultData ?? {
    testPoints: 0,
    maxTestPoints: 32,
    rating: null,
    answeredCount: 0,
    unansweredCount: 22,
    totalCount: 22,
    elapsedMs: 0,
  };

  return (
    <div className="result-card nmt-result-card" hidden={hidden}>
      <div className="result-icon" aria-hidden="true">
        ★
      </div>
      <p className="eyebrow">Тест завершено</p>
      <h2>
        {data.testPoints}/{data.maxTestPoints} тестових балів
      </h2>
      {data.rating !== null ? (
        <p className="result-copy">Офіційний рейтинговий бал: {data.rating} (шкала 100–200).</p>
      ) : (
        <p className="result-copy">Рейтинговий бал недоступний: потрібно щонайменше 5 тестових балів.</p>
      )}
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">
            {data.answeredCount}/{data.totalCount}
          </span>
          <span>завдань із відповіддю</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.unansweredCount}</span>
          <span>без відповіді</span>
        </div>
        <div className="stat">
          <span className="stat-value">{formatCountdown(data.elapsedMs)}</span>
          <span>витрачений час</span>
        </div>
      </div>
      <button className="button button-primary" type="button" onClick={onRestart}>
        Пройти тест ще раз
      </button>
    </div>
  );
}
