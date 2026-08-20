// Attempt-id generation lives outside Redux reducers, which must stay
// deterministic and free of browser APIs. Hooks call this before dispatch
// and pass the id in as a plain action payload.

export function generateAttemptId(prefix) {
  const unique =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${unique}`;
}
