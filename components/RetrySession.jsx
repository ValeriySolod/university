import NmtAnswerInput from "./NmtAnswerInput";
import { classifyOutcome, outcomeStatusLabel } from "@/lib/attemptReview";

export default function RetrySession({ retry }) {
  const { currentEntry, index, total, answer, answerState, isLastQuestion, setAnswer, checkAnswer, nextQuestion } = retry;

  if (!currentEntry) return null;

  const question = currentEntry.question;
  const isChecked = Boolean(answerState);
  const status = isChecked ? classifyOutcome(answerState) : null;

  return (
    <div className="quiz-card retry-session-card">
      <div className="quiz-topline">
        <p className="eyebrow">
          Повторення {index + 1} з {total}
        </p>
        <h2 id="trainer-title">Повторення завдань</h2>
      </div>

      <p className="question">{question.text}</p>

      <fieldset className="retry-answer-fieldset" disabled={isChecked}>
        <legend className="visually-hidden">Відповідь</legend>
        <NmtAnswerInput question={question} answer={answer} onChange={setAnswer} />
      </fieldset>

      <div className={`feedback${status ? ` outcome-status-${status}` : ""}`} aria-live="polite" hidden={!isChecked}>
        {isChecked && (
          <>
            <strong>{outcomeStatusLabel(status)}</strong>
            {question.explanation}
          </>
        )}
      </div>

      <div className="nmt-nav-buttons">
        {!isChecked ? (
          <button className="button button-primary" type="button" onClick={checkAnswer}>
            Перевірити відповідь
          </button>
        ) : (
          <button className="button button-next" type="button" onClick={nextQuestion}>
            {isLastQuestion ? "Завершити повторення" : "Наступне завдання"}
          </button>
        )}
      </div>
    </div>
  );
}
