export default function MarkToggleButton({ marked, onToggle, className = "" }) {
  return (
    <button
      type="button"
      className={`mark-toggle-button${marked ? " marked" : ""} ${className}`.trim()}
      aria-pressed={marked}
      aria-label={marked ? "Зняти позначку із завдання" : "Позначити завдання"}
      onClick={onToggle}
    >
      <span aria-hidden="true">{marked ? "★" : "☆"}</span>
      <span className="mark-toggle-label">{marked ? "Позначено" : "Позначити"}</span>
    </button>
  );
}
