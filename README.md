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

`/practice` is not implemented yet. The existing topic-practice generators and single-choice practice UI (`lib/useMathTrainer.js`, `components/Trainer.jsx`, `components/SetupCard.jsx`, etc.) remain in the codebase, unused by `/`, for the next roadmap item to move to `/practice`. See [ROADMAP.md](./ROADMAP.md) for the current status.

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
