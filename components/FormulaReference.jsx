import { getFormulaSections } from "@/lib/formulas";
import FormulaMath from "@/components/FormulaMath";

export default function FormulaReference() {
  const sections = getFormulaSections();

  return (
    <div className="formula-reference">
      {sections.map((section) => (
        <section key={section.id} className="formula-section" aria-labelledby={`formula-section-${section.id}`}>
          <h2 id={`formula-section-${section.id}`}>{section.title}</h2>
          {section.subsections.map((subsection) => (
            <div key={subsection.id} className="formula-subsection">
              <h3 id={`formula-subsection-${subsection.id}`}>{subsection.title}</h3>
              <ul className="formula-list" aria-labelledby={`formula-subsection-${subsection.id}`}>
                {subsection.formulas.map((formula) => (
                  <li key={formula.id} className="formula-item">
                    <p className="formula-item-label">{formula.label}</p>
                    <div className="formula-scroll">
                      <FormulaMath expression={formula.expression} displayMode ariaLabel={formula.label} />
                    </div>
                    {formula.note && <p className="formula-item-note">{formula.note}</p>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
