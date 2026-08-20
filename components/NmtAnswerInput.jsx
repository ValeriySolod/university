import { QUESTION_TYPES } from "@/lib/questionTypes";

function SingleChoiceAnswer({ question, answer, onChange }) {
  return (
    <div className="answers nmt-answers" role="radiogroup" aria-label="Варіанти відповіді">
      {question.answers.map((option, index) => (
        <button
          key={index}
          type="button"
          role="radio"
          aria-checked={answer?.selectedIndex === index}
          className={`answer${answer?.selectedIndex === index ? " selected" : ""}`}
          onClick={() => onChange({ selectedIndex: index })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function MatchingAnswer({ question, answer, onChange }) {
  const mapping = answer?.mapping ?? {};

  const handleSelect = (leftId, rightId) => {
    onChange({ mapping: { ...mapping, [leftId]: rightId } });
  };

  return (
    <div className="nmt-matching">
      {question.leftOptions.map((leftItem) => {
        const selectId = `${question.id}-${leftItem.id}`;
        return (
          <div className="nmt-matching-row" key={leftItem.id}>
            <label htmlFor={selectId}>{leftItem.text}</label>
            <select id={selectId} value={mapping[leftItem.id] ?? ""} onChange={(event) => handleSelect(leftItem.id, event.target.value)}>
              <option value="" disabled>
                Оберіть відповідність
              </option>
              {question.rightOptions.map((rightItem) => (
                <option key={rightItem.id} value={rightItem.id}>
                  {rightItem.text}
                </option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );
}

function ShortAnswerInput({ question, answer, onChange }) {
  const inputId = `${question.id}-input`;
  return (
    <div className="nmt-short-answer">
      <label htmlFor={inputId}>Відповідь</label>
      <input
        id={inputId}
        type="text"
        autoComplete="off"
        value={answer?.value ?? ""}
        onChange={(event) => onChange({ value: event.target.value })}
      />
    </div>
  );
}

export default function NmtAnswerInput({ question, answer, onChange }) {
  if (question.type === QUESTION_TYPES.SINGLE_CHOICE) {
    return <SingleChoiceAnswer question={question} answer={answer} onChange={onChange} />;
  }
  if (question.type === QUESTION_TYPES.MATCHING) {
    return <MatchingAnswer question={question} answer={answer} onChange={onChange} />;
  }
  if (question.type === QUESTION_TYPES.SHORT_ANSWER) {
    return <ShortAnswerInput question={question} answer={answer} onChange={onChange} />;
  }
  return null;
}
