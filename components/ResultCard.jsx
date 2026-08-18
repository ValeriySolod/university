export default function ResultCard({ hidden, resultData, restartButtonRef, onRestart }) {
  const data = resultData ?? {
    correctAnswers: 0,
    total: 10,
    percent: 0,
    score: 0,
    averageTime: 0,
    title: "Чудовий результат!",
    copy: "",
    totalTimeText: "00:00",
  };
  const averageTimeText = Number.isFinite(data.averageTime)
    ? data.averageTime.toFixed(1).replace(".", ",")
    : "0,0";

  return (
    <div className="result-card" hidden={hidden}>
      <div className="result-icon" aria-hidden="true">
        ★
      </div>
      <p className="eyebrow">Тренування завершено</p>
      <h2>{data.title}</h2>
      <p className="result-copy">{data.copy}</p>
      <div className="stats-grid">
        <div className="stat">
          <span className="stat-value">{data.score}/200</span>
          <span>підсумковий бал</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {data.correctAnswers}/{data.total}
          </span>
          <span>правильних відповідей</span>
        </div>
        <div className="stat">
          <span className="stat-value">{averageTimeText} с</span>
          <span>середній час відповіді</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.percent}%</span>
          <span>точність</span>
        </div>
        <div className="stat">
          <span className="stat-value">{data.totalTimeText}</span>
          <span>загальний час</span>
        </div>
      </div>
      <button className="button button-primary" type="button" ref={restartButtonRef} onClick={onRestart}>
        Спробувати ще раз
      </button>
    </div>
  );
}
