import { describe, expect, it } from "vitest";
import { renderFormula } from "./renderFormula";

describe("renderFormula", () => {
  it("renders a well-formed LaTeX expression to HTML", () => {
    const result = renderFormula("a^2 + b^2 = c^2");
    expect(result.ok).toBe(true);
    expect(result.html).toEqual(expect.any(String));
    expect(result.html).toContain("katex");
  });

  it("fails safely instead of throwing for a malformed expression", () => {
    const result = renderFormula("\\frac{1}{");
    expect(result.ok).toBe(false);
    expect(result.html).toBeNull();
  });

  it("fails safely for an unknown command", () => {
    const result = renderFormula("\\thisCommandDoesNotExist{a}");
    expect(result.ok).toBe(false);
    expect(result.html).toBeNull();
  });

  it("fails safely for empty or non-string input", () => {
    expect(renderFormula("")).toEqual({ ok: false, html: null });
    expect(renderFormula("   ")).toEqual({ ok: false, html: null });
    expect(renderFormula(null)).toEqual({ ok: false, html: null });
    expect(renderFormula(undefined)).toEqual({ ok: false, html: null });
    expect(renderFormula(42)).toEqual({ ok: false, html: null });
  });

  it("supports display mode without throwing", () => {
    const result = renderFormula("\\sqrt[n]{a^m}", { displayMode: true });
    expect(result.ok).toBe(true);
    expect(result.html).toContain("katex-display");
  });
});
