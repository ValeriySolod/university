import { QUESTION_TYPES } from "../questionTypes";

const SUBSCRIPT_DIGITS = {
  0: "₀",
  1: "₁",
  2: "₂",
  3: "₃",
  4: "₄",
  5: "₅",
  6: "₆",
  7: "₇",
  8: "₈",
  9: "₉",
};

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomChoice(list) {
  return list[randomInt(0, list.length - 1)];
}

export function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function toSubscript(number) {
  return String(number)
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
    .join("");
}

export function formatNumber(value) {
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "").replace(".", ",");
}

// Builds "x", "x + 3" or "x - 3" for a given signed offset.
export function formatOffsetExpr(variable, offset) {
  if (offset === 0) return variable;
  return offset > 0 ? `${variable} + ${offset}` : `${variable} - ${Math.abs(offset)}`;
}

// Builds "x", "2x", "2x + 3" or "2x - 3" for a coefficient and a signed offset.
export function formatCoeffOffsetExpr(coefficient, variable, offset) {
  const coeffPart = coefficient === 1 ? variable : `${coefficient}${variable}`;
  if (offset === 0) return coeffPart;
  return offset > 0 ? `${coeffPart} + ${offset}` : `${coeffPart} - ${Math.abs(offset)}`;
}

// Turns one or more correct numeric values plus a pool of wrong candidates
// into a shuffled multiple-choice answer set, following the existing
// { answers: string[], correct: number } question shape. When multiple
// correct values are given (e.g. both roots of an equation), they are
// combined into a single option label like "0 і 2" so the full solution
// set must be picked as one answer.
export function buildMultipleChoice({ correctValues, distractorPool, optionCount = 4 }) {
  const correct = Array.isArray(correctValues) ? correctValues : [correctValues];
  const correctLabel = correct.map(formatNumber).join(" і ");

  const seen = new Set([correctLabel]);
  const distractors = [];
  for (const candidate of shuffle(distractorPool)) {
    const label = formatNumber(candidate);
    if (seen.has(label)) continue;
    seen.add(label);
    distractors.push(label);
    if (distractors.length >= optionCount - 1) break;
  }

  let guard = 0;
  while (distractors.length < optionCount - 1 && guard < 50) {
    guard += 1;
    const base = randomChoice(correct);
    const jitter = randomInt(1, 9) * (Math.random() < 0.5 ? -1 : 1);
    const label = formatNumber(base + jitter);
    if (seen.has(label)) continue;
    seen.add(label);
    distractors.push(label);
  }

  const options = shuffle([correctLabel, ...distractors]);

  return {
    answers: options,
    correct: options.indexOf(correctLabel),
  };
}

// Turns generator output ({ text, answers, correct, explanation }) into
// explicit single-choice questions with stable, unique ids, tagging each
// with the universal question-model fields.
export function toSingleChoiceQuestions(idPrefix, rawQuestions) {
  return rawQuestions.map(({ correct, ...question }, index) => ({
    ...question,
    id: `${idPrefix}-${index + 1}`,
    type: QUESTION_TYPES.SINGLE_CHOICE,
    correctIndex: correct,
    pointValue: 1,
  }));
}
