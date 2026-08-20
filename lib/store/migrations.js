// Pure persisted-state migrations, kept separate from lib/store/persistConfig.js
// so each schema step is independently testable. Every migration takes the
// raw persisted state object (already parsed from storage) and returns the
// state to reduce against the current slice set.

// Version 1 -> 2 introduces the `markedQuestions` slice and optional
// `questionSnapshot`/`submittedAnswer` fields on attempt outcomes plus an
// optional `sourceAttemptId` on attempt records. Both additions are
// backward-compatible with existing persisted data: outcomes recorded under
// version 1 simply lack the new optional fields (surfaced as "legacy" in
// lib/attemptReview.js), and a missing `markedQuestions` slice is already
// defaulted to its initial state by persistConfig's validatingStateReconciler.
// So this migration is an identity transform — it exists to make the version
// bump explicit and independently testable rather than silently discarding
// version-1 data the way an unrecognized version does.
export function migrateFromV1(state) {
  return state;
}
