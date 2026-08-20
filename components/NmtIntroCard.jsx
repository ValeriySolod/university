import { NMT_MATCHING_COUNT, NMT_SHORT_ANSWER_COUNT, NMT_SINGLE_CHOICE_COUNT, NMT_TASK_COUNT } from "@/lib/nmtQuestions";
import { NMT_MAX_TEST_POINTS } from "@/lib/nmtScore";

export default function NmtIntroCard({ hidden, onStart }) {
  return (
    <div className="setup-card nmt-intro-card" hidden={hidden}>
      <div className="field-group">
        <h2 id="trainer-title">Повний тест НМТ з математики</h2>
        <p className="nmt-intro-copy">
          Тест містить <strong>22 завдання</strong> та триває <strong>60 хвилин</strong>. Максимальний бал — {NMT_MAX_TEST_POINTS}
          .
        </p>
      </div>
      <ul className="nmt-intro-breakdown" aria-label="Структура тесту">
        <li>
          <span className="count-value">{NMT_SINGLE_CHOICE_COUNT}</span>
          <span>завдань з вибором однієї відповіді, по 1 балу</span>
        </li>
        <li>
          <span className="count-value">{NMT_MATCHING_COUNT}</span>
          <span>завдання на встановлення відповідності, до 3 балів</span>
        </li>
        <li>
          <span className="count-value">{NMT_SHORT_ANSWER_COUNT}</span>
          <span>завдання з короткою відповіддю, по 2 бали</span>
        </li>
      </ul>
      <div className="task-count" aria-label="Кількість завдань">
        <span className="count-value">{NMT_TASK_COUNT}</span>
        <span>завдань · 60:00</span>
      </div>
      <button className="button button-primary" type="button" onClick={onStart}>
        Почати тест
      </button>
    </div>
  );
}
