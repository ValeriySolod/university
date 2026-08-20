# University — NMT Math Trainer

An interactive Ukrainian-language mathematics trainer built with Next.js (App Router), aimed at NMT (ЗНО/НМТ) preparation.

## Product contract

- `/` is the NMT trainer.
- A full NMT test contains **22 tasks** and lasts **60 minutes**.
- **15 single-choice** tasks are worth **1 point** each.
- **3 matching** tasks are worth **up to 4 points** each.
- **4 short-answer** tasks are worth **2 points** each.
- The maximum score is **32 test points**.
- The **100–200 rating** is derived from test points using an explicit official lookup table, and is **unavailable below 5 test points**.
- `/practice` is separate topic practice (single-topic drills such as powers, roots, logarithms) and **must not show an NMT rating**.

Implementation of the full 22-task session, official scoring, matching/short-answer UI, and `/practice` is delivered incrementally — see [ROADMAP.md](./ROADMAP.md) for the current status. The trainer currently available at `/` runs the existing single-choice practice modes described below while the NMT session is built out.

## Current trainer modes

Two interaction modes are available:

- **Classic** keeps the explanation visible until the learner clicks the next button.
- **Ultimate** shows the explanation briefly and advances automatically after each answer.

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
