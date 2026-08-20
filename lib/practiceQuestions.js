// Pure practice-session question selection: filters by category and
// difficulty, and — for generated categories — repeatedly generates batches
// until the requested quantity is reached. No React or browser APIs.

import { questions as elementaryQuestions } from "./questions";
import { shuffle, toSingleChoiceQuestions } from "./generators/utils";
import { generateBasicPower, generateIntermediatePower, generateAdvancedPower } from "./generators/powers";
import { generateBasicRoot, generateIntermediateRoot, generateAdvancedRoot } from "./generators/roots";
import { generateBasicLog, generateIntermediateLog, generateAdvancedLog } from "./generators/logarithms";

export const DIFFICULTIES = Object.freeze(["basic", "intermediate", "advanced"]);
export const DIFFICULTY_FILTERS = Object.freeze(["all", ...DIFFICULTIES]);
export const QUANTITY_OPTIONS = Object.freeze([10, 20, 30]);

// Batch size per difficulty, matching each generator's existing 4 basic /
// 3 intermediate / 3 advanced distribution.
const GENERATED_BATCH_SIZE = Object.freeze({ basic: 4, intermediate: 3, advanced: 3 });

const GENERATED_SINGLE_GENERATORS = Object.freeze({
  powers: Object.freeze({
    basic: generateBasicPower,
    intermediate: generateIntermediatePower,
    advanced: generateAdvancedPower,
  }),
  roots: Object.freeze({
    basic: generateBasicRoot,
    intermediate: generateIntermediateRoot,
    advanced: generateAdvancedRoot,
  }),
  logarithms: Object.freeze({
    basic: generateBasicLog,
    intermediate: generateIntermediateLog,
    advanced: generateAdvancedLog,
  }),
});

const MAX_GENERATED_BATCHES = 200;

function isGeneratedCategory(categoryId) {
  return Object.prototype.hasOwnProperty.call(GENERATED_SINGLE_GENERATORS, categoryId);
}

// One batch of raw ({ text, answers, correct, explanation, difficulty })
// questions for a generated category at one specific difficulty.
function generateDifficultyBatch(categoryId, difficulty) {
  const generateOne = GENERATED_SINGLE_GENERATORS[categoryId][difficulty];
  const count = GENERATED_BATCH_SIZE[difficulty];
  return Array.from({ length: count }, () => generateOne());
}

// One "all difficulties" batch keeps the existing 4 basic + 3 intermediate +
// 3 advanced shape of a full generator call.
function generateAllDifficultiesBatch(categoryId) {
  return DIFFICULTIES.flatMap((difficulty) => generateDifficultyBatch(categoryId, difficulty));
}

// Repeatedly generates batches from the same category/difficulty selection
// until the pool reaches the requested quantity. Never mixes in another
// category or difficulty.
function buildGeneratedPool(categoryId, difficulty, quantity) {
  const pool = [];
  let batches = 0;
  while (pool.length < quantity && batches < MAX_GENERATED_BATCHES) {
    batches += 1;
    const batch = difficulty === "all" ? generateAllDifficultiesBatch(categoryId) : generateDifficultyBatch(categoryId, difficulty);
    pool.push(...batch);
  }
  return pool;
}

function filterElementaryPool(difficulty) {
  if (difficulty === "all") return elementaryQuestions;
  return elementaryQuestions.filter((question) => question.difficulty === difficulty);
}

// Re-numbers questions with session-scoped ids so combining multiple
// generated batches (which may reuse the same underlying index) never
// collides, and every question in a session has a unique, stable id.
function withSessionIds(categoryId, questions) {
  return questions.map((question, index) => ({ ...question, id: `practice-${categoryId}-${index + 1}` }));
}

// Selects up to `quantity` questions for one practice session, filtered to
// exactly the given category and difficulty. An unrecognized category or
// difficulty yields an empty, safely-flagged result rather than falling
// back to other content.
export function buildPracticeQuestions({ categoryId, difficulty, quantity }) {
  const isKnownDifficulty = difficulty === "all" || DIFFICULTIES.includes(difficulty);

  let selected = [];
  if (isKnownDifficulty && isGeneratedCategory(categoryId)) {
    const pool = buildGeneratedPool(categoryId, difficulty, quantity);
    const shaped = toSingleChoiceQuestions(categoryId, shuffle(pool));
    selected = shaped.slice(0, quantity);
  } else if (isKnownDifficulty && categoryId === "elementary") {
    const pool = filterElementaryPool(difficulty);
    selected = shuffle(pool).slice(0, quantity);
  }

  const questions = withSessionIds(categoryId, selected);
  return { questions, isEmpty: questions.length === 0 };
}
