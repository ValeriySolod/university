export default function MarkedQuestionsPanel({ items, retryMessage, onRetryOne, onUnmark, onRetryAll }) {
  return (
    <section className="marked-panel" aria-labelledby="marked-panel-title">
      <div className="marked-panel-header">
        <h2 id="marked-panel-title">Позначені завдання</h2>
        <button type="button" className="button button-primary" disabled={items.length === 0} onClick={onRetryAll}>
          Повторити позначені
        </button>
      </div>

      {retryMessage && (
        <p className="retry-empty-message" role="alert">
          {retryMessage}
        </p>
      )}

      {items.length === 0 ? (
        <p className="marked-panel-empty" role="status">
          Немає позначених завдань. Познач завдання під час тесту, практики або перегляду спроби, щоб повернутися до нього пізніше.
        </p>
      ) : (
        <ul className="marked-panel-list">
          {items.map((item) => (
            <li key={item.questionId} className="marked-panel-item">
              <p className="marked-panel-item-text">{item.questionSnapshot.text}</p>
              <div className="marked-panel-item-actions">
                <button type="button" className="button" onClick={() => onRetryOne(item.questionId)}>
                  Повторити
                </button>
                <button type="button" className="button" onClick={() => onUnmark(item.questionId)}>
                  Зняти позначку
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
