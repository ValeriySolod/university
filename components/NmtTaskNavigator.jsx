export default function NmtTaskNavigator({ totalCount, currentIndex, questionStatuses, onSelect }) {
  return (
    <nav className="nmt-task-nav" aria-label="Навігація завданнями">
      <ol>
        {Array.from({ length: totalCount }, (_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = questionStatuses[index];
          let className = "nmt-task-nav-item";
          if (isCurrent) className += " current";
          else if (isAnswered) className += " answered";
          else className += " unanswered";

          const statusLabel = isAnswered ? "відповідь надана" : "без відповіді";

          return (
            <li key={index}>
              <button
                type="button"
                className={className}
                aria-current={isCurrent ? "true" : undefined}
                aria-label={`Завдання ${index + 1}, ${statusLabel}${isCurrent ? ", поточне" : ""}`}
                onClick={() => onSelect(index)}
              >
                {index + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
