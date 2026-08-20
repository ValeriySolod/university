export default function RetryResult({ retryResult, onBackToList }) {
  if (!retryResult) return null;
  const { correctCount, total } = retryResult;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return (
    <div className="result-card retry-result-card">
      <div className="result-icon" aria-hidden="true">
        ★
      </div>
      <p className="eyebrow">Повторення завершено</p>
      <h2>
        {correctCount}/{total} правильних відповідей
      </h2>
      <p className="result-copy">Це повторення записано в історію окремою спробою й не змінює початковий результат.</p>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{percent}%</span>
          <span>точність</span>
        </div>
      </div>
      <button className="button button-primary" type="button" onClick={onBackToList}>
        До історії спроб
      </button>
    </div>
  );
}
