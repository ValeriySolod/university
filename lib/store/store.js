import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { FLUSH, PAUSE, PERSIST, PURGE, REGISTER, REHYDRATE, persistReducer, persistStore } from "redux-persist";
import nmtSessionReducer from "./nmtSessionSlice";
import practiceSettingsReducer from "./practiceSettingsSlice";
import attemptsReducer from "./attemptsSlice";
import topicStatsReducer from "./topicStatsSlice";
import markedQuestionsReducer from "./markedQuestionsSlice";
import { persistConfig } from "./persistConfig";

const rootReducer = combineReducers({
  nmtSession: nmtSessionReducer,
  practiceSettings: practiceSettingsReducer,
  attempts: attemptsReducer,
  topicStats: topicStatsReducer,
  markedQuestions: markedQuestionsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// Creates one store + persistor pair per app instance (called once from
// StoreProvider), rather than a shared module-level singleton, so server
// rendering never leaks state between requests.
export function makeStore() {
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });
  const persistor = persistStore(store);
  return { store, persistor };
}
