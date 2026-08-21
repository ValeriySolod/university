import katex from "katex";

// Pure wrapper around katex.renderToString: never throws. A malformed LaTeX
// expression (bad catalog entry, typo) returns { ok: false } instead of
// crashing the caller, so the /formulas page can fall back to plain text
// for that one formula and keep rendering the rest.
export function renderFormula(expression, { displayMode = false } = {}) {
  if (typeof expression !== "string" || expression.trim().length === 0) {
    return { ok: false, html: null };
  }

  try {
    const html = katex.renderToString(expression, {
      throwOnError: true,
      displayMode,
      strict: "warn",
    });
    return { ok: true, html };
  } catch {
    return { ok: false, html: null };
  }
}
