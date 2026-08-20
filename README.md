# University — NMT Math Trainer

An interactive Ukrainian-language mathematics trainer built with Next.js (App Router), aimed at NMT (ЗНО/НМТ) preparation.

## Product contract

- `/` is the NMT trainer.
- A full NMT test contains **22 tasks** and lasts **60 minutes**.
- **15 single-choice** tasks are worth **1 point** each.
- **3 matching** tasks are worth **up to 3 points** each.
- **4 short-answer** tasks are worth **2 points** each.
- The maximum score is **32 test points**.
- The **100–200 rating** is derived from test points using an explicit official lookup table, and is **unavailable below 5 test points**.
- `/practice` is separate topic practice (single-topic drills such as powers, roots, logarithms) and **must not show an NMT rating**.

`/` now runs the full 22-task NMT session end to end:

- The session starts from an intro screen describing the 22 tasks and the 60-minute limit, then runs a 60:00 countdown based on an absolute deadline (delayed timers or an inactive tab never extend the session), and auto-submits once time runs out.
- All 22 tasks are reachable at any point through a task navigator that distinguishes answered, unanswered, and the current task; Previous/Next controls step through tasks in order, and the last task offers submission.
- Single-choice, matching, and short-answer tasks each have a dedicated answer interface; answers are kept per-task, so navigating away and back restores what was entered.
- Correctness, correct answers, explanations, points, and rating are never shown while the test is active.
- Submitting with unanswered tasks remaining requires explicit confirmation.
- The result screen shows official test points out of 32 (via `lib/nmtScore.js`, not proportional scoring), the 100–200 rating when available, an explicit "rating unavailable" state below 5 test points, answered/unanswered counts, and elapsed time.

`/practice` now runs the thematic single-choice trainer, with setup filters for:

- **category** — every category defined in `lib/topics.js` (elementary mathematics, powers, roots, logarithms);
- **difficulty** — all, basic, intermediate, or advanced;
- **quantity** — 10, 20, or 30 questions.

Question selection is pure logic in `lib/practiceQuestions.js`: it generates or filters strictly within the chosen category and difficulty (never backfilling from another category or difficulty), and — for the generated categories (powers, roots, logarithms) — repeats generation batches until the requested quantity is reached, assigning each combined question a unique, stable session id. The elementary bank is a fixed set explicitly tagged with a difficulty per question. If a category/difficulty combination has no matching questions, `/practice` stays on setup and shows a Ukrainian message instead of starting a broken session.

`/practice` keeps the existing Classic and Ultimate modes, immediate per-answer correctness and explanations, and a result screen with accuracy, correct-answer count, total time, and average answer time — but **no `/200` score and no NMT rating**, matching the product contract above.

Both `/` and `/practice` are reachable from the header navigation on every page.

## Persistence and reload behavior

State is centralized in a Redux Toolkit store (`lib/store/`) and persisted to `localStorage` via Redux Persist, wired in at the app root by `components/StoreProvider.jsx` so `/` and `/practice` share one persisted store. No page, component, or trainer hook touches `localStorage` directly — it stays behind the store's persistence configuration.

Four slices keep state clearly separated:

- **`nmtSession`** (`lib/store/nmtSessionSlice.js`) — the active NMT test: phase, current task index, answers by question id, the start timestamp, and the original absolute deadline. Starting or restarting the test atomically replaces this slice.
- **`practiceSettings`** (`lib/store/practiceSettingsSlice.js`) — the selected practice category, difficulty, quantity, and Classic/Ultimate mode.
- **`attempts`** (`lib/store/attemptsSlice.js`) — one compact, immutable record per completed NMT or practice attempt (id, trainer type, timestamp, selected settings when applicable, points, duration, and per-question outcomes).
- **`topicStats`** (`lib/store/topicStatsSlice.js`) — aggregate attempted/correct/incorrect counts per practice category, updated from completed practice outcomes.

**Reloading an active NMT test** restores its answers, current task, and original absolute deadline — the 60-minute limit is never reset or extended. If the restored deadline has already passed, the session is submitted once through the normal scoring path (`lib/nmtSession.js` / `lib/nmtScore.js`), rather than resuming a countdown from an expired clock. Completing a test persists its result and an attempt record; repeated submission, timer ticks, remounts, or React Strict Mode never produce a duplicate attempt (idempotent by session id via `lib/store/thunks.js`).

**Reloading `/practice`** restores the previously selected category, difficulty, quantity, and mode, validated against the app's current option lists — a stale or unrecognized selection (e.g. a removed category) falls back to defaults instead of restoring something the page can no longer offer. Finishing a practice session appends one attempt record and updates topic statistics from its outcomes.

The persisted schema carries an explicit version (`lib/store/persistConfig.js`). A version mismatch discards the persisted blob (no migration path exists yet, this being the first schema version), and every slice is independently validated on every rehydration — invalid, incomplete, or structurally incompatible data for one slice falls back to that slice's defaults without affecting the others or crashing the app. The store is created lazily behind a client-side provider so Next.js server rendering and hydration are unaffected.

This increment does not add attempt-history, error-review, marked-task, retry, or weak-topic UI — the persisted data is groundwork for later roadmap items.

## Run locally

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```

## Deployment

The project is a Next.js app and deploys directly from the repository root on Vercel (build command `next build`).
