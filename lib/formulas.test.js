import { describe, expect, it } from "vitest";
import { getFormulaSections, isValidFormulaEntry, sanitizeFormulaSections } from "./formulas";

describe("isValidFormulaEntry", () => {
  it("accepts an entry with a non-empty id, label and expression", () => {
    expect(isValidFormulaEntry({ id: "a", label: "A", expression: "a^2" })).toBe(true);
  });

  it("rejects entries missing a required field", () => {
    expect(isValidFormulaEntry({ id: "a", label: "A" })).toBe(false);
    expect(isValidFormulaEntry({ id: "a", expression: "a^2" })).toBe(false);
    expect(isValidFormulaEntry({ label: "A", expression: "a^2" })).toBe(false);
  });

  it("rejects entries with blank or non-string fields", () => {
    expect(isValidFormulaEntry({ id: "a", label: "  ", expression: "a^2" })).toBe(false);
    expect(isValidFormulaEntry({ id: "a", label: "A", expression: 42 })).toBe(false);
  });

  it("rejects non-object input", () => {
    expect(isValidFormulaEntry(null)).toBe(false);
    expect(isValidFormulaEntry(undefined)).toBe(false);
    expect(isValidFormulaEntry("a^2")).toBe(false);
  });
});

describe("sanitizeFormulaSections", () => {
  it("keeps a well-formed section untouched", () => {
    const input = [
      {
        id: "algebra",
        title: "Алгебра",
        subsections: [
          {
            id: "roots",
            title: "Корені",
            formulas: [{ id: "sqrt", label: "Квадратний корінь", expression: "\\sqrt{a}" }],
          },
        ],
      },
    ];
    expect(sanitizeFormulaSections(input)).toEqual(input);
  });

  it("drops individual malformed formula entries but keeps the valid ones", () => {
    const input = [
      {
        id: "algebra",
        title: "Алгебра",
        subsections: [
          {
            id: "roots",
            title: "Корені",
            formulas: [
              { id: "sqrt", label: "Квадратний корінь", expression: "\\sqrt{a}" },
              { id: "broken", label: "", expression: "\\sqrt{b}" },
              { id: "no-expression", label: "Без формули" },
            ],
          },
        ],
      },
    ];
    const result = sanitizeFormulaSections(input);
    expect(result[0].subsections[0].formulas).toEqual([{ id: "sqrt", label: "Квадратний корінь", expression: "\\sqrt{a}" }]);
  });

  it("drops a subsection that ends up with no valid formulas", () => {
    const input = [
      {
        id: "algebra",
        title: "Алгебра",
        subsections: [
          { id: "empty", title: "Порожня", formulas: [{ id: "bad", label: "", expression: "" }] },
          {
            id: "roots",
            title: "Корені",
            formulas: [{ id: "sqrt", label: "Квадратний корінь", expression: "\\sqrt{a}" }],
          },
        ],
      },
    ];
    const result = sanitizeFormulaSections(input);
    expect(result[0].subsections.map((s) => s.id)).toEqual(["roots"]);
  });

  it("drops a section that ends up with no valid subsections", () => {
    const input = [
      { id: "empty-section", title: "Порожня секція", subsections: [] },
      {
        id: "algebra",
        title: "Алгебра",
        subsections: [
          {
            id: "roots",
            title: "Корені",
            formulas: [{ id: "sqrt", label: "Квадратний корінь", expression: "\\sqrt{a}" }],
          },
        ],
      },
    ];
    const result = sanitizeFormulaSections(input);
    expect(result.map((s) => s.id)).toEqual(["algebra"]);
  });

  it("handles completely malformed input without throwing", () => {
    expect(sanitizeFormulaSections(null)).toEqual([]);
    expect(sanitizeFormulaSections(undefined)).toEqual([]);
    expect(sanitizeFormulaSections("not an array")).toEqual([]);
    expect(sanitizeFormulaSections([null, 42, { id: "x" }])).toEqual([]);
  });
});

describe("getFormulaSections", () => {
  const sections = getFormulaSections();

  it("includes both the algebra and geometry top-level sections", () => {
    expect(sections.map((section) => section.id)).toEqual(expect.arrayContaining(["algebra", "geometry"]));
  });

  it("gives every section at least one subsection with at least one formula", () => {
    for (const section of sections) {
      expect(section.subsections.length).toBeGreaterThan(0);
      for (const subsection of section.subsections) {
        expect(subsection.formulas.length).toBeGreaterThan(0);
      }
    }
  });

  it("only exposes formula entries that pass isValidFormulaEntry", () => {
    for (const section of sections) {
      for (const subsection of section.subsections) {
        for (const formula of subsection.formulas) {
          expect(isValidFormulaEntry(formula)).toBe(true);
        }
      }
    }
  });

  it("uses unique ids across every formula in the catalog", () => {
    const ids = sections.flatMap((section) => section.subsections.flatMap((subsection) => subsection.formulas.map((formula) => formula.id)));
    expect(new Set(ids).size).toBe(ids.length);
  });
});
