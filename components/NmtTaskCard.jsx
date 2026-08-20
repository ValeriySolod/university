import NmtTaskNavigator from "./NmtTaskNavigator";
import NmtAnswerInput from "./NmtAnswerInput";
import MarkToggleButton from "./MarkToggleButton";

export default function NmtTaskCard({
  hidden,
  currentIndex,
  totalCount,
  question,
  answer,
  questionStatuses,
  answeredCount,
  unansweredCount,
  isLastTask,
  remainingText,
  confirmingSubmit,
  questionRegionRef,
  submitButtonRef,
  isCurrentQuestionMarked,
  onToggleCurrentQuestionMark,
  onAnswerChange,
  onGoToIndex,
  onNext,
  onPrev,
  onRequestSubmit,
  onConfirmSubmit,
  onCancelSubmit,
}) {
  return (
    <div className="quiz-card nmt-task-card" hidden={hidden}>
      <div className="quiz-topline">
        <div>
          <p className="eyebrow">
            Завдання {currentIndex + 1} з {totalCount}
          </p>
        </div>
        <div className="timers" aria-label="Час виконання">
          <span className="timer">
            <small>Залишилось</small>
            <b>{remainingText}</b>
          </span>
        </div>
      </div>

      <NmtTaskNavigator
        totalCount={totalCount}
        currentIndex={currentIndex}
        questionStatuses={questionStatuses}
        onSelect={onGoToIndex}
      />

      <div className="question-topline">
        <p className="question" tabIndex={-1} ref={questionRegionRef}>
          {question.text}
        </p>
        <MarkToggleButton marked={isCurrentQuestionMarked} onToggle={onToggleCurrentQuestionMark} />
      </div>

      <NmtAnswerInput question={question} answer={answer} onChange={(nextAnswer) => onAnswerChange(question.id, nextAnswer)} />

      <div className="nmt-nav-buttons">
        <button className="button" type="button" onClick={onPrev} disabled={currentIndex === 0}>
          Попереднє
        </button>
        {isLastTask ? (
          <button className="button button-primary" type="button" ref={submitButtonRef} onClick={onRequestSubmit}>
            Завершити тест
          </button>
        ) : (
          <button className="button button-next" type="button" onClick={onNext}>
            Наступне завдання
          </button>
        )}
      </div>

      <div className="nmt-confirm-banner" role="alertdialog" aria-live="assertive" aria-label="Підтвердження завершення" hidden={!confirmingSubmit}>
        {confirmingSubmit && (
          <>
            <p>
              У тесті залишилося {unansweredCount} завдань без відповіді з {totalCount}. Завершити тест зараз?
            </p>
            <div className="nmt-confirm-actions">
              <button className="button button-primary" type="button" onClick={onConfirmSubmit}>
                Так, завершити
              </button>
              <button className="button" type="button" onClick={onCancelSubmit}>
                Повернутися до тесту
              </button>
            </div>
          </>
        )}
      </div>

      <p className="nmt-answered-summary" aria-live="polite">
        Відповіли на {answeredCount} з {totalCount} завдань.
      </p>
    </div>
  );
}
