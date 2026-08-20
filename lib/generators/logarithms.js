import {
  randomInt,
  randomChoice,
  buildMultipleChoice,
  formatOffsetExpr,
  toSubscript,
  toSingleChoiceQuestions,
} from "./utils";

const BASES = [2, 3, 5];

function generateBasicLog() {
  const base = randomChoice(BASES);
  const a = randomInt(1, 5);
  const x = base ** a;

  const distractorPool = [a, x + base, x - base, base * a].filter((n) => n !== x && n > 0);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: log${toSubscript(base)}(x) = ${a}.`,
    answers,
    correct,
    explanation: `log${toSubscript(base)}(x) = ${a} означає x = ${base}^${a} = ${x}.`,
  };
}

function generateIntermediateLog() {
  const base = randomChoice(BASES);
  const a = randomInt(1, 4);
  const c = randomInt(-6, 6) || 1;
  const power = base ** a;
  const x = power + c;
  const exprInside = formatOffsetExpr("x", -c);

  const distractorPool = [x + 1, x - 1, power, x - base].filter((n) => n !== x);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: log${toSubscript(base)}(${exprInside}) = ${a}.`,
    answers,
    correct,
    explanation: `${exprInside} = ${base}^${a} = ${power} (за ОДЗ ${exprInside} > 0), тому x = ${x}.`,
  };
}

function generateAdvancedLog() {
  const base = randomChoice([2, 3]);
  const a = randomInt(2, 4);
  const B = base ** a;

  const factorPairs = [];
  for (let r2 = 1; r2 * r2 < B; r2 += 1) {
    if (B % r2 === 0) {
      const r1 = B / r2;
      if (r1 !== r2) factorPairs.push([r1, r2]);
    }
  }
  const [r1, r2] = factorPairs.length ? randomChoice(factorPairs) : [B, 1];

  const p = randomInt(-3, 5);
  const x = p + r1;
  const q = x - r2;
  const extraneous = p + q - x;

  const exprP = formatOffsetExpr("x", -p);
  const exprQ = formatOffsetExpr("x", -q);

  const distractorPool = [x + 1, x - 1, extraneous, r1, r2, B].filter((n) => n !== x);
  const { answers, correct } = buildMultipleChoice({ correctValues: x, distractorPool });

  return {
    text: `Розв'яжи рівняння: log${toSubscript(base)}(${exprP}) + log${toSubscript(base)}(${exprQ}) = ${a}.`,
    answers,
    correct,
    explanation: `log${toSubscript(base)}[(${exprP})(${exprQ})] = ${a} означає (${exprP})(${exprQ}) = ${B}. Квадратне рівняння дає x = ${x} або x = ${extraneous}, але за ОДЗ (${exprP} > 0 і ${exprQ} > 0) підходить лише x = ${x}.`,
  };
}

export function generateLogarithmQuestions() {
  return toSingleChoiceQuestions("logarithms", [
    generateBasicLog(),
    generateBasicLog(),
    generateBasicLog(),
    generateBasicLog(),
    generateIntermediateLog(),
    generateIntermediateLog(),
    generateIntermediateLog(),
    generateAdvancedLog(),
    generateAdvancedLog(),
    generateAdvancedLog(),
  ]);
}
