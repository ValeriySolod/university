import { randomInt, randomChoice, buildMultipleChoice, formatOffsetExpr, toSingleChoiceQuestions } from "./utils";

const BASES = [2, 3, 5];

function generateBasicPower() {
  const base = randomChoice(BASES);
  const x = randomInt(1, 6);
  const value = base ** x;

  const distractorPool = [x + 1, x - 1, x + 2, value, base].filter((n) => n !== x);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: ${base}^x = ${value}.`,
    answers,
    correct,
    explanation: `${base}^${x} = ${value}, тому x = ${x}.`,
  };
}

function generateIntermediatePower() {
  const base = randomChoice(BASES);
  const exponentTarget = randomInt(2, 6);
  let offset = randomInt(-3, 3);
  if (offset === 0) offset = randomChoice([1, -1, 2, -2]);
  const x = exponentTarget - offset;
  const value = base ** exponentTarget;
  const exprInside = formatOffsetExpr("x", offset);

  const distractorPool = [x + 1, x - 1, x + 2, exponentTarget, -x].filter((n) => n !== x);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: ${base}^(${exprInside}) = ${value}.`,
    answers,
    correct,
    explanation: `${base}^(${exprInside}) = ${value} означає ${exprInside} = ${exponentTarget}, тому x = ${x}.`,
  };
}

function generateAdvancedPower() {
  const base = randomChoice(BASES);
  const m1 = randomInt(0, 3);
  let m2 = randomInt(0, 3);
  while (m2 === m1) m2 = randomInt(0, 3);

  const t1 = base ** m1;
  const t2 = base ** m2;
  const sum = t1 + t2;
  const product = t1 * t2;
  const roots = [m1, m2].sort((a, b) => a - b);

  const distractorPool = [m1 + 1, m2 + 1, m1 - 1, m2 - 1, sum, product].filter(
    (n) => n !== m1 && n !== m2 && n >= 0
  );
  const { answers, correct } = buildMultipleChoice({ correctValues: roots, distractorPool });

  return {
    text: `Розв'яжи рівняння: ${base}^(2x) - ${sum}×${base}^x + ${product} = 0.`,
    answers,
    correct,
    explanation: `Заміна t = ${base}^x дає t² - ${sum}t + ${product} = 0, звідки t = ${t1} або t = ${t2}. Оскільки обидва значення додатні, x = ${m1} або x = ${m2}.`,
  };
}

export function generatePowerQuestions() {
  return toSingleChoiceQuestions("powers", [
    generateBasicPower(),
    generateBasicPower(),
    generateBasicPower(),
    generateBasicPower(),
    generateIntermediatePower(),
    generateIntermediatePower(),
    generateIntermediatePower(),
    generateAdvancedPower(),
    generateAdvancedPower(),
    generateAdvancedPower(),
  ]);
}
