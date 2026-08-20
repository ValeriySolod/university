// Universal question model shared by every trainer question, regardless of
// source (static list or generator). Pure module: no React or browser APIs.

export const QUESTION_TYPES = Object.freeze({
  SINGLE_CHOICE: "single-choice",
  MATCHING: "matching",
  SHORT_ANSWER: "short-answer",
});

const VALID_TYPES = new Set(Object.values(QUESTION_TYPES));

// Official NMT-2026 mathematics point values per question type:
// 15 single-choice x 1 + 3 matching x 3 + 4 short-answer x 2 = 32.
const POINT_VALUE_BY_TYPE = Object.freeze({
  [QUESTION_TYPES.SINGLE_CHOICE]: 1,
  [QUESTION_TYPES.MATCHING]: 3,
  [QUESTION_TYPES.SHORT_ANSWER]: 2,
});

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

// Normalizes a short-answer value for comparison: trims, collapses inner
// whitespace, and lowercases. Used both to store accepted answers and to
// check a learner's input once short-answer rendering exists.
export function normalizeShortAnswer(value) {
  return String(value).trim().replace(/\s+/g, " ").toLowerCase();
}

function validateCommonFields(question, errors) {
  if (!question || typeof question !== "object") {
    errors.push("Question must be an object.");
    return;
  }
  if (!isNonEmptyString(question.id)) {
    errors.push("Question must have a non-empty id.");
  }
  if (!VALID_TYPES.has(question.type)) {
    errors.push(`Question type "${question.type}" is not recognized.`);
  }
  if (!isNonEmptyString(question.text)) {
    errors.push("Question must have a non-empty text.");
  }
  if (!isPositiveInteger(question.pointValue)) {
    errors.push("Question must have a positive integer pointValue.");
  } else if (VALID_TYPES.has(question.type)) {
    const expectedPointValue = POINT_VALUE_BY_TYPE[question.type];
    if (question.pointValue !== expectedPointValue) {
      errors.push(
        `${question.type} question must have pointValue ${expectedPointValue}, got ${question.pointValue}.`
      );
    }
  }
  if (typeof question.explanation !== "string") {
    errors.push("Question must have an explanation string.");
  }
}

function validateSingleChoice(question, errors) {
  if (!Array.isArray(question.answers) || question.answers.length === 0) {
    errors.push("single-choice question must have a non-empty answers array.");
  } else if (!question.answers.every(isNonEmptyString)) {
    errors.push("single-choice answers must be non-empty strings.");
  }

  if (
    !Number.isInteger(question.correctIndex) ||
    !Array.isArray(question.answers) ||
    question.correctIndex < 0 ||
    question.correctIndex >= question.answers.length
  ) {
    errors.push("single-choice correctIndex must be a valid zero-based index into answers.");
  }
}

function validateMatching(question, errors) {
  const { leftOptions, rightOptions, mapping } = question;

  const validSide = (side, name) => {
    if (!Array.isArray(side) || side.length === 0) {
      errors.push(`matching question must have a non-empty ${name} array.`);
      return false;
    }
    const ok = side.every((item) => item && isNonEmptyString(item.id) && isNonEmptyString(item.text));
    if (!ok) {
      errors.push(`matching ${name} items must each have a non-empty id and text.`);
      return false;
    }
    const ids = side.map((item) => item.id);
    if (new Set(ids).size !== ids.length) {
      errors.push(`matching ${name} items must have unique ids.`);
      return false;
    }
    return true;
  };

  const leftOk = validSide(leftOptions, "leftOptions");
  const rightOk = validSide(rightOptions, "rightOptions");

  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) {
    errors.push("matching question must have a mapping object.");
    return;
  }

  if (!leftOk || !rightOk) return;

  const rightIds = new Set(rightOptions.map((item) => item.id));
  const mappingKeys = Object.keys(mapping);

  for (const leftItem of leftOptions) {
    if (!(leftItem.id in mapping)) {
      errors.push(`matching mapping is missing an entry for left-side item "${leftItem.id}".`);
      continue;
    }
    if (!rightIds.has(mapping[leftItem.id])) {
      errors.push(`matching mapping for "${leftItem.id}" points to an unknown right-side item.`);
    }
  }

  if (mappingKeys.length !== leftOptions.length) {
    errors.push("matching mapping must map every left-side item exactly once.");
  }
}

function validateShortAnswer(question, errors) {
  if (!Array.isArray(question.acceptedAnswers) || question.acceptedAnswers.length === 0) {
    errors.push("short-answer question must have a non-empty acceptedAnswers array.");
    return;
  }
  const allNonEmpty = question.acceptedAnswers.every(
    (answer) => isNonEmptyString(answer) && normalizeShortAnswer(answer).length > 0
  );
  if (!allNonEmpty) {
    errors.push("short-answer acceptedAnswers must be non-empty normalized strings.");
  }
}

// Validates a single question against the common contract plus the rules
// for its declared type. Returns { valid, errors }.
export function validateQuestion(question) {
  const errors = [];
  validateCommonFields(question, errors);

  const type = question?.type;
  if (VALID_TYPES.has(type)) {
    if (type === QUESTION_TYPES.SINGLE_CHOICE) validateSingleChoice(question, errors);
    else if (type === QUESTION_TYPES.MATCHING) validateMatching(question, errors);
    else if (type === QUESTION_TYPES.SHORT_ANSWER) validateShortAnswer(question, errors);
  }

  return { valid: errors.length === 0, errors };
}

// Validates a list of questions, including cross-question rules such as
// duplicate id detection. Returns { valid, errors }.
export function validateQuestions(questions) {
  if (!Array.isArray(questions)) {
    return { valid: false, errors: ["Questions must be an array."] };
  }

  const errors = [];
  const seenIds = new Set();

  questions.forEach((question, index) => {
    const result = validateQuestion(question);
    result.errors.forEach((error) => errors.push(`[${index}] ${error}`));

    if (isNonEmptyString(question?.id)) {
      if (seenIds.has(question.id)) {
        errors.push(`[${index}] Duplicate question id "${question.id}".`);
      }
      seenIds.add(question.id);
    }
  });

  return { valid: errors.length === 0, errors };
}
