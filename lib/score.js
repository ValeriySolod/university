export const MAX_SCORE = 200;

export function calculateScore(correctAnswers, totalQuestions) {
  if (!totalQuestions) return 0;
  return Math.round((correctAnswers / totalQuestions) * MAX_SCORE);
}
