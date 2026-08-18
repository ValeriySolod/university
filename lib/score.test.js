import { describe, expect, it } from "vitest";
import { calculateScore } from "./score";

describe("calculateScore", () => {
  it("returns 0 for zero correct answers", () => {
    expect(calculateScore(0, 10)).toBe(0);
  });

  it("returns a proportional score for a partial result", () => {
    expect(calculateScore(5, 10)).toBe(100);
  });

  it("rounds a non-exact proportion to the nearest point", () => {
    expect(calculateScore(1, 3)).toBe(67);
  });

  it("returns exactly 200 for a perfect result", () => {
    expect(calculateScore(10, 10)).toBe(200);
  });

  it("returns 0 when there are no questions, avoiding division by zero", () => {
    expect(calculateScore(0, 0)).toBe(0);
  });
});
