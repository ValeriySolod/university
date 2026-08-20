import {
  randomInt,
  randomChoice,
  buildMultipleChoice,
  formatCoeffOffsetExpr,
  toSingleChoiceQuestions,
} from "./utils";

function generateBasicRoot() {
  const a = randomInt(2, 12);
  const x = a * a;

  const distractorPool = [a, x + a, x - a, 2 * a].filter((n) => n !== x && n >= 0);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: √x = ${a}.`,
    answers,
    correct,
    explanation: `Піднісши обидві частини до квадрата: x = ${a}² = ${x}.`,
  };
}

function generateIntermediateRoot() {
  const k = randomChoice([1, 2, 3]);
  const a = randomInt(2, 7);
  const target = a * a;
  const x = randomInt(1, 10);
  const c = target - k * x;
  const exprInside = formatCoeffOffsetExpr(k, "x", c);

  const distractorPool = [x + 1, x - 1, x + k, target].filter((n) => n !== x && n >= 0);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: √(${exprInside}) = ${a}.`,
    answers,
    correct,
    explanation: `Піднісши обидві частини до квадрата: ${exprInside} = ${target}, звідки x = ${x}.`,
  };
}

function generateAdvancedRoot() {
  const c = randomInt(1, 4);
  const t = randomInt(0, 5);
  const x = t * t;
  const p = c * c + 2 * c * t;

  const distractorPool = [x + 1, x - 1, p, t, p - x].filter((n) => n !== x && n >= 0);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: √(x + ${p}) - √x = ${c}.`,
    answers,
    correct,
    explanation: `√(x + ${p}) = ${c} + √x. Піднісши до квадрата й спростивши, отримуємо x = ${x}. Перевірка: обидва підкореневі вирази невід'ємні.`,
  };
}

export function generateRootQuestions() {
  return toSingleChoiceQuestions("roots", [
    generateBasicRoot(),
    generateBasicRoot(),
    generateBasicRoot(),
    generateBasicRoot(),
    generateIntermediateRoot(),
    generateIntermediateRoot(),
    generateIntermediateRoot(),
    generateAdvancedRoot(),
    generateAdvancedRoot(),
    generateAdvancedRoot(),
  ]);
}
