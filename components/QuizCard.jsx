import MarkToggleButton from "./MarkToggleButton";

export default function QuizCard({
  hidden,
  currentQuestion,
  totalQuestions,
  question,
  answerState,
  mode,
  totalTimerText,
  questionTimerText,
  answersContainerRef,
  nextButtonRef,
  isCurrentQuestionMarked,
  onToggleCurrentQuestionMark,
  onSelectAnswer,
  onNext,
}) {
  const isAnswered = Boolean(answerState);
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const nextLabel = isLastQuestion ? "Переглянути результат" : "Наступне завдання";

  return (
    <div className="quiz-card" hidden={hidden}>
      <div className="quiz-topline">
        <div>
          <p className="eyebrow">
            Завдання {currentQuestion + 1} з {totalQuestions}
          </p>
          <h2 id="trainer-title">Обчисли значення</h2>
        </div>
        <div className="timers" aria-label="Час виконання">
          <span className="timer">
            <small>Завдання</small>
            <b>{questionTimerText}</b>
          </span>
          <span className="timer">
            <small>Загалом</small>
            <b>{totalTimerText}</b>
          </span>
        </div>
      </div>

      <div
        className="progress-track"
        role="progressbar"
        aria-label="Прогрес тренування"
        aria-valuemin={0}
        aria-valuemax={totalQuestions}
        aria-valuenow={currentQuestion}
      >
        <span style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }} />
      </div>

      <div className="question-topline">
        <p className="question">{question.text}</p>
        <MarkToggleButton marked={isCurrentQuestionMarked} onToggle={onToggleCurrentQuestionMark} />
      </div>
      <div className="answers" role="group" aria-label="Варіанти відповіді" ref={answersContainerRef}>
        {question.answers.map((answer, index) => {
          let className = "answer";
          if (isAnswered) {
            if (index === question.correctIndex) className += " correct";
            else if (index === answerState.selectedIndex) className += " incorrect";
          }
          return (
            <button
              key={index}
              type="button"
              className={className}
              disabled={isAnswered}
              onClick={() => onSelectAnswer(index)}
            >
              {answer}
            </button>
          );
        })}
      </div>
      <div className="feedback" aria-live="polite" hidden={!isAnswered}>
        {isAnswered && (
          <>
            <strong>{answerState.isCorrect ? "Правильно!" : "Майже!"}</strong>
            {question.explanation}
            {mode === "ultimate" && (
              <span className="auto-advance-note">Наступне завдання відкриється автоматично…</span>
            )}
          </>
        )}
      </div>
      <button
        className="button button-next"
        type="button"
        ref={nextButtonRef}
        hidden={!isAnswered || mode === "ultimate"}
        onClick={onNext}
      >
        {nextLabel}
      </button>
    </div>
  );
}
