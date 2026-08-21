// Pure helpers: pick the weakest eligible practice category from persisted
// topic statistics (lib/store/topicStatsSlice.js) and, from it, plan a
// normal practice session. Kept outside React so ranking/selection logic
// stays out of components (app/practice, components/SetupCard.jsx) and out
// of the trainer hook itself, per the project's "thin pages" convention.

import { topics } from "./topics";
import { buildPracticeQuestions } from "./practiceQuestions";

const KNOWN_TOPIC_IDS = topics.map((topic) => topic.id);

function isEligibleBucket(bucket) {
  return !!bucket && bucket.attempted > 0 && bucket.incorrect > 0;
}

// Ranks eligible categories by highest error rate, then highest incorrect
// count, then their position in lib/topics.js, so the result is always a
// single deterministic category id (or null when nothing qualifies yet).
// Categories absent from lib/topics.js (e.g. stale/removed ids left over in
// persisted state) are never considered.
export function selectWeakestCategory(byCategory) {
  const eligible = KNOWN_TOPIC_IDS.map((categoryId, topicOrder) => ({
    categoryId,
    topicOrder,
    bucket: byCategory ? byCategory[categoryId] : undefined,
  })).filter(({ bucket }) => isEligibleBucket(bucket));

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    const errorRateA = a.bucket.incorrect / a.bucket.attempted;
    const errorRateB = b.bucket.incorrect / b.bucket.attempted;
    if (errorRateB !== errorRateA) return errorRateB - errorRateA;
    if (b.bucket.incorrect !== a.bucket.incorrect) return b.bucket.incorrect - a.bucket.incorrect;
    return a.topicOrder - b.topicOrder;
  });

  return eligible[0].categoryId;
}

// Plans a weak-topic practice session: picks the weakest eligible category
// via selectWeakestCategory, then builds its questions through the same
// buildPracticeQuestions used for a manually-selected category — never
// backfilling from another category or difficulty — while carrying the
// caller's difficulty/quantity/mode through unchanged. Returns
// { eligible: false } when no category qualifies yet, so the caller can
// show a message instead of starting a session.
export function planWeakTopicSession({ byCategory, difficulty, quantity, mode }) {
  const categoryId = selectWeakestCategory(byCategory);
  if (!categoryId) return { eligible: false };

  const { questions, isEmpty } = buildPracticeQuestions({ categoryId, difficulty, quantity });
  return { eligible: true, categoryId, difficulty, quantity, mode, questions, isEmpty };
}
