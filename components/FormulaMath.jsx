import { renderFormula } from "@/lib/renderFormula";

// Reusable KaTeX renderer for trusted, repo-owned LaTeX strings. This is the
// only place in the app allowed to use dangerouslySetInnerHTML: katex's
// output is generated from static formula data (lib/formulas.js), never
// from user input. A malformed expression falls back to readable plain text
// instead of throwing, so one bad entry cannot crash the page.
export default function FormulaMath({ expression, displayMode = false, ariaLabel }) {
  const { ok, html } = renderFormula(expression, { displayMode });

  if (!ok) {
    return (
      <span className="formula-fallback" role="text" aria-label={ariaLabel}>
        Формулу не вдалося відобразити: {expression}
      </span>
    );
  }

  return <span className="formula-math" aria-label={ariaLabel} dangerouslySetInnerHTML={{ __html: html }} />;
}
