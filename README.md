# Math Sprint

An interactive Ukrainian-language elementary mathematics trainer with ten multiple-choice questions, immediate explanations, live task and total timers, progress tracking, and final performance statistics.

Two interaction modes are available:

- **Classic** keeps the explanation visible until the learner clicks the next button.
- **Ultimate** shows the explanation briefly and advances automatically after each answer.

## Run locally

Built with Next.js (App Router).

```bash
npm install
npm run dev
```

## Question set

1. Order of operations: `48 ÷ 6 + 7 = 15`
2. Percentages: `25% of 80 = 20`
3. Powers: `3² + 4² = 25`
4. Fractions and decimals: `0.75 = 3/4`
5. Linear equations: `5x = 35`, so `x = 7`
6. Square perimeter: a `36 cm` perimeter gives a `9 cm` side
7. Number sequences: `2, 5, 8, 11, 14`
8. Average speed: `180 km ÷ 3 h = 60 km/h`
9. Like terms: `4a + 3a − 2a = 5a`
10. Rectangle area: `7 cm × 5 cm = 35 cm²`

## Deployment

The project is a Next.js app and deploys directly from the repository root on Vercel (build command `next build`).
