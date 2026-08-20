// Browser-storage engine for Redux Persist. Falls back to a no-op storage
// on the server so persistReducer/persistStore never touch `window` during
// Next.js server rendering, avoiding hydration mismatches.

import createWebStorage from "redux-persist/lib/storage/createWebStorage";

function createNoopStorage() {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
}

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export default storage;
