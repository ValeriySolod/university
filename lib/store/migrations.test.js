import { describe, expect, it } from "vitest";
import { migrateFromV1 } from "./migrations";

describe("migrateFromV1", () => {
  it("keeps version-1 state as-is, including legacy attempts without question snapshots", () => {
    const state = {
      attempts: {
        items: [
          {
            id: "practice-1",
            trainerType: "practice",
            completedAt: 1000,
            category: "powers",
            difficulty: "basic",
            mode: "classic",
            quantity: 1,
            totalPoints: 1,
            maxPoints: 1,
            durationMs: 500,
            outcomes: [{ questionId: "practice-powers-1", category: "powers", correct: true, earnedPoints: 1, maxPoints: 1 }],
          },
        ],
      },
      practiceSettings: { modeChoice: "classic", topicChoice: "powers", difficultyChoice: "all", quantityChoice: 10 },
    };

    expect(migrateFromV1(state)).toBe(state);
  });
});
