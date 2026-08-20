# University Roadmap

Bounded increments toward the full NMT (ЗНО/НМТ) trainer described in [README.md](./README.md). Each item is delivered as its own increment, without redesigning or changing already-shipped behavior.

1. **[x] Product contract & universal question model** — Document the NMT product contract (README) and introduce the explicit, universal single-choice / matching / short-answer question model with pure validation, without changing current trainer behavior.
2. **[ ] Official scoring (100–200 lookup table)** — Replace the current proportional 0–200 score with the official test-points-to-rating lookup table, unavailable below 5 test points.
3. **[ ] Full 22-task NMT session** — Assemble a real NMT session: 15 single-choice (1 point), 3 matching (up to 4 points), 4 short-answer (2 points), 60-minute timer, 32-point maximum.
4. **[ ] `/practice` topic practice route** — Separate route for single-topic drills (powers, roots, logarithms, etc.) that never shows an NMT rating.
5. **[ ] Matching question UI** — Render and interact with matching questions in the trainer.
6. **[ ] Short-answer question UI** — Render and interact with short-answer questions, including answer normalization and checking.
7. **[ ] Persistence & history** — Persist completed sessions and let learners review past attempts.
8. **[ ] Weak topics tracking** — Surface topics/question types a learner consistently struggles with, based on session history.
9. **[ ] Formulas reference & visual themes** — In-trainer formula reference sheet and selectable visual themes.
