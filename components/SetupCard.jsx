import { topics } from "@/lib/topics";
import { DIFFICULTY_FILTERS, QUANTITY_OPTIONS } from "@/lib/practiceQuestions";

const DIFFICULTY_LABELS = {
  all: "Усі рівні",
  basic: "Базовий",
  intermediate: "Середній",
  advanced: "Складний",
};

export default function SetupCard({
  hidden,
  modeChoice,
  onModeChoiceChange,
  topicChoice,
  onTopicChoiceChange,
  difficultyChoice,
  onDifficultyChoiceChange,
  quantityChoice,
  onQuantityChoiceChange,
  onStart,
  emptyPoolMessage,
}) {
  return (
    <div className="setup-card" hidden={hidden}>
      <div className="field-group">
        <label htmlFor="topic">Категорія</label>
        <div className="select-wrap">
          <select id="topic" value={topicChoice} onChange={(event) => onTopicChoiceChange(event.target.value)}>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="difficulty">Складність</label>
        <div className="select-wrap">
          <select
            id="difficulty"
            value={difficultyChoice}
            onChange={(event) => onDifficultyChoiceChange(event.target.value)}
          >
            {DIFFICULTY_FILTERS.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {DIFFICULTY_LABELS[difficulty]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field-group">
        <label htmlFor="quantity">Кількість завдань</label>
        <div className="select-wrap">
          <select
            id="quantity"
            value={quantityChoice}
            onChange={(event) => onQuantityChoiceChange(Number(event.target.value))}
          >
            {QUANTITY_OPTIONS.map((quantity) => (
              <option key={quantity} value={quantity}>
                {quantity}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="task-count" aria-label="Кількість завдань">
        <span className="count-value">{quantityChoice}</span>
        <span>завдань</span>
      </div>
      <fieldset className="mode-picker">
        <legend>Режим</legend>
        <label>
          <input
            type="radio"
            name="mode"
            value="classic"
            checked={modeChoice === "classic"}
            onChange={() => onModeChoiceChange("classic")}
          />
          <span>Звичайний</span>
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="ultimate"
            checked={modeChoice === "ultimate"}
            onChange={() => onModeChoiceChange("ultimate")}
          />
          <span>Ultimate ⚡</span>
        </label>
      </fieldset>
      <button className="button button-primary" type="button" onClick={onStart}>
        Почати тренування
      </button>
      <p className="setup-empty-message" role="alert" hidden={!emptyPoolMessage}>
        {emptyPoolMessage}
      </p>
    </div>
  );
}
