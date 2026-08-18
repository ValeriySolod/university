import { topics } from "@/lib/topics";

export default function SetupCard({
  hidden,
  modeChoice,
  onModeChoiceChange,
  topicChoice,
  onTopicChoiceChange,
  onStart,
  totalQuestions,
}) {
  return (
    <div className="setup-card" hidden={hidden}>
      <div className="field-group">
        <label htmlFor="topic">Тема</label>
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
      <div className="task-count" aria-label="Кількість завдань">
        <span className="count-value">{totalQuestions}</span>
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
    </div>
  );
}
