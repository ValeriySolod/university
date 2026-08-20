// Redux Persist configuration: an explicit schema version plus a migration
// strategy so invalid, incomplete, unknown-version, or structurally
// incompatible persisted data always falls back to valid defaults instead
// of crashing the app.
//
// Two independent layers guard against bad data:
// 1. `migrate` runs when the persisted version doesn't match
//    PERSISTED_STATE_VERSION. Known older versions run their explicit
//    migration step (see lib/store/migrations.js); anything else discards
//    the persisted blob.
// 2. `validatingStateReconciler` runs on every rehydration (version match
//    or not) and validates each slice independently against its own
//    schema, falling back to that slice's fresh initial state on any
//    structural mismatch — so corruption in one slice (or a tampered
//    localStorage value) never invalidates the others.

import storage from "./storage";
import { nmtSessionInitialState, isValidPersistedNmtSession } from "./nmtSessionSlice";
import { practiceSettingsInitialState, isValidPersistedPracticeSettings } from "./practiceSettingsSlice";
import { attemptsInitialState, isValidPersistedAttempts } from "./attemptsSlice";
import { topicStatsInitialState, isValidPersistedTopicStats } from "./topicStatsSlice";
import { markedQuestionsInitialState, isValidPersistedMarkedQuestions } from "./markedQuestionsSlice";
import { migrateFromV1 } from "./migrations";

export const PERSISTED_STATE_VERSION = 2;

const VALIDATORS = {
  nmtSession: isValidPersistedNmtSession,
  practiceSettings: isValidPersistedPracticeSettings,
  attempts: isValidPersistedAttempts,
  topicStats: isValidPersistedTopicStats,
  markedQuestions: isValidPersistedMarkedQuestions,
};

const INITIAL_STATES = {
  nmtSession: nmtSessionInitialState,
  practiceSettings: practiceSettingsInitialState,
  attempts: attemptsInitialState,
  topicStats: topicStatsInitialState,
  markedQuestions: markedQuestionsInitialState,
};

export function validatingStateReconciler(inboundState, _originalState, reducedState) {
  const nextState = { ...reducedState };
  for (const key of Object.keys(VALIDATORS)) {
    const inboundSlice = inboundState?.[key];
    if (inboundSlice !== undefined && VALIDATORS[key](inboundSlice)) {
      nextState[key] = inboundSlice;
    } else {
      nextState[key] = INITIAL_STATES[key];
    }
  }
  return nextState;
}

export function migrate(state, versionFound) {
  if (versionFound === PERSISTED_STATE_VERSION) {
    return Promise.resolve(state);
  }
  if (versionFound === 1) {
    return Promise.resolve(migrateFromV1(state));
  }
  return Promise.resolve(undefined);
}

export const persistConfig = {
  key: "university-trainer",
  version: PERSISTED_STATE_VERSION,
  storage,
  stateReconciler: validatingStateReconciler,
  migrate,
};
