// Static algebra/geometry formula reference for the /formulas page. Kept as
// data only (no rendering) so the page and FormulaReference component stay
// thin and the catalog can be unit tested without React.
//
// Each formula entry: { id, label, expression, note? }
//   - expression is a KaTeX-compatible LaTeX string, trusted (repo-owned).
//   - note is an optional short plain-text clarification.

export const formulaSections = [
  {
    id: "algebra",
    title: "Алгебра",
    subsections: [
      {
        id: "powers-roots",
        title: "Степені та корені",
        formulas: [
          { id: "power-product", label: "Добуток степенів з однаковою основою", expression: "a^m \\cdot a^n = a^{m+n}" },
          { id: "power-quotient", label: "Частка степенів з однаковою основою", expression: "\\dfrac{a^m}{a^n} = a^{m-n}", note: "a ≠ 0" },
          { id: "power-of-power", label: "Степінь степеня", expression: "(a^m)^n = a^{mn}" },
          { id: "power-of-product", label: "Степінь добутку", expression: "(ab)^n = a^n b^n" },
          { id: "negative-power", label: "Степінь з від'ємним показником", expression: "a^{-n} = \\dfrac{1}{a^n}", note: "a ≠ 0" },
          { id: "zero-power", label: "Нульовий степінь", expression: "a^0 = 1", note: "a ≠ 0" },
          { id: "rational-power", label: "Степінь з дробовим показником", expression: "a^{\\frac{m}{n}} = \\sqrt[n]{a^m}", note: "a ≥ 0, n — натуральне число, n ≥ 2" },
          { id: "root-product", label: "Корінь з добутку", expression: "\\sqrt[n]{ab} = \\sqrt[n]{a} \\cdot \\sqrt[n]{b}", note: "a, b ≥ 0" },
          { id: "root-quotient", label: "Корінь з частки", expression: "\\sqrt[n]{\\dfrac{a}{b}} = \\dfrac{\\sqrt[n]{a}}{\\sqrt[n]{b}}", note: "a ≥ 0, b > 0" },
          { id: "root-of-power", label: "Корінь зі степеня", expression: "\\sqrt[n]{a^m} = a^{\\frac{m}{n}}", note: "a ≥ 0" },
        ],
      },
      {
        id: "logarithms",
        title: "Логарифми",
        formulas: [
          { id: "log-definition", label: "Означення логарифма", expression: "\\log_a b = c \\iff a^c = b", note: "a > 0, a ≠ 1, b > 0" },
          { id: "log-product", label: "Логарифм добутку", expression: "\\log_a (xy) = \\log_a x + \\log_a y", note: "x, y > 0" },
          { id: "log-quotient", label: "Логарифм частки", expression: "\\log_a \\dfrac{x}{y} = \\log_a x - \\log_a y", note: "x, y > 0" },
          { id: "log-power", label: "Логарифм степеня", expression: "\\log_a (x^n) = n \\log_a x", note: "x > 0" },
          { id: "log-base-change", label: "Перехід до нової основи", expression: "\\log_a b = \\dfrac{\\log_c b}{\\log_c a}", note: "a, c > 0, a ≠ 1, c ≠ 1, b > 0" },
          { id: "log-of-one", label: "Логарифм одиниці", expression: "\\log_a 1 = 0" },
          { id: "log-of-base", label: "Логарифм основи", expression: "\\log_a a = 1" },
        ],
      },
      {
        id: "quadratic-equations",
        title: "Квадратні рівняння",
        formulas: [
          { id: "quadratic-general", label: "Загальний вигляд", expression: "ax^2 + bx + c = 0", note: "a ≠ 0" },
          { id: "quadratic-discriminant", label: "Дискримінант", expression: "D = b^2 - 4ac" },
          { id: "quadratic-roots", label: "Корені квадратного рівняння", expression: "x_{1,2} = \\dfrac{-b \\pm \\sqrt{D}}{2a}", note: "D ≥ 0" },
          { id: "vieta-sum", label: "Теорема Вієта — сума коренів", expression: "x_1 + x_2 = -\\dfrac{b}{a}" },
          { id: "vieta-product", label: "Теорема Вієта — добуток коренів", expression: "x_1 \\cdot x_2 = \\dfrac{c}{a}" },
          { id: "quadratic-vertex", label: "Координати вершини параболи", expression: "x_0 = -\\dfrac{b}{2a}, \\quad y_0 = -\\dfrac{D}{4a}" },
        ],
      },
      {
        id: "progressions",
        title: "Прогресії",
        formulas: [
          { id: "arithmetic-nth-term", label: "n-й член арифметичної прогресії", expression: "a_n = a_1 + (n-1)d" },
          { id: "arithmetic-sum", label: "Сума перших n членів арифметичної прогресії", expression: "S_n = \\dfrac{a_1 + a_n}{2} \\cdot n" },
          { id: "arithmetic-sum-diff", label: "Сума через різницю", expression: "S_n = \\dfrac{2a_1 + (n-1)d}{2} \\cdot n" },
          { id: "geometric-nth-term", label: "n-й член геометричної прогресії", expression: "b_n = b_1 \\cdot q^{n-1}", note: "q ≠ 0" },
          { id: "geometric-sum", label: "Сума перших n членів геометричної прогресії", expression: "S_n = \\dfrac{b_1 (q^n - 1)}{q - 1}", note: "q ≠ 1" },
          { id: "geometric-sum-infinite", label: "Сума нескінченної спадної геометричної прогресії", expression: "S = \\dfrac{b_1}{1 - q}", note: "|q| < 1" },
        ],
      },
      {
        id: "abbreviated-multiplication",
        title: "Формули скороченого множення",
        formulas: [
          { id: "square-of-sum", label: "Квадрат суми", expression: "(a+b)^2 = a^2 + 2ab + b^2" },
          { id: "square-of-difference", label: "Квадрат різниці", expression: "(a-b)^2 = a^2 - 2ab + b^2" },
          { id: "difference-of-squares", label: "Різниця квадратів", expression: "a^2 - b^2 = (a-b)(a+b)" },
          { id: "cube-of-sum", label: "Куб суми", expression: "(a+b)^3 = a^3 + 3a^2b + 3ab^2 + b^3" },
          { id: "cube-of-difference", label: "Куб різниці", expression: "(a-b)^3 = a^3 - 3a^2b + 3ab^2 - b^3" },
          { id: "sum-of-cubes", label: "Сума кубів", expression: "a^3 + b^3 = (a+b)(a^2 - ab + b^2)" },
          { id: "difference-of-cubes", label: "Різниця кубів", expression: "a^3 - b^3 = (a-b)(a^2 + ab + b^2)" },
        ],
      },
      {
        id: "percentages-proportions",
        title: "Відсотки та пропорції",
        formulas: [
          { id: "percent-of-number", label: "Відсоток числа", expression: "p\\% \\text{ від } a = \\dfrac{p}{100} \\cdot a" },
          { id: "number-by-percent", label: "Число за його відсотком", expression: "a = \\dfrac{b}{p} \\cdot 100", note: "b становить p% від a" },
          { id: "proportion-basic", label: "Основна властивість пропорції", expression: "\\dfrac{a}{b} = \\dfrac{c}{d} \\iff ad = bc", note: "b, d ≠ 0" },
        ],
      },
    ],
  },
  {
    id: "geometry",
    title: "Геометрія",
    subsections: [
      {
        id: "triangles",
        title: "Трикутники",
        formulas: [
          { id: "triangle-angle-sum", label: "Сума кутів трикутника", expression: "\\alpha + \\beta + \\gamma = 180^{\\circ}" },
          { id: "triangle-exterior-angle", label: "Зовнішній кут трикутника", expression: "\\theta = \\alpha + \\beta", note: "θ — зовнішній кут, α, β — несуміжні внутрішні кути" },
          { id: "law-of-sines", label: "Теорема синусів", expression: "\\dfrac{a}{\\sin \\alpha} = \\dfrac{b}{\\sin \\beta} = \\dfrac{c}{\\sin \\gamma} = 2R" },
          { id: "law-of-cosines", label: "Теорема косинусів", expression: "c^2 = a^2 + b^2 - 2ab\\cos \\gamma" },
          { id: "midline-triangle", label: "Середня лінія трикутника", expression: "m = \\dfrac{a}{2}", note: "паралельна стороні a і вдвічі менша за неї" },
        ],
      },
      {
        id: "pythagorean-theorem",
        title: "Теорема Піфагора",
        formulas: [
          { id: "pythagorean", label: "Теорема Піфагора", expression: "c^2 = a^2 + b^2", note: "a, b — катети, c — гіпотенуза" },
          { id: "leg-via-hypotenuse", label: "Катет через гіпотенузу", expression: "a = \\sqrt{c^2 - b^2}" },
        ],
      },
      {
        id: "triangle-area",
        title: "Площа трикутника",
        formulas: [
          { id: "area-base-height", label: "Через основу і висоту", expression: "S = \\dfrac{1}{2} a h_a" },
          { id: "area-two-sides-angle", label: "Через дві сторони й кут між ними", expression: "S = \\dfrac{1}{2} ab \\sin \\gamma" },
          { id: "area-heron", label: "Формула Герона", expression: "S = \\sqrt{p(p-a)(p-b)(p-c)}", note: "p — півпериметр, p = (a+b+c)/2" },
          { id: "area-inradius", label: "Через радіус вписаного кола", expression: "S = pr", note: "p — півпериметр" },
          { id: "area-circumradius", label: "Через радіус описаного кола", expression: "S = \\dfrac{abc}{4R}" },
          { id: "area-equilateral", label: "Площа рівностороннього трикутника", expression: "S = \\dfrac{a^2 \\sqrt{3}}{4}" },
        ],
      },
      {
        id: "circles",
        title: "Кола",
        formulas: [
          { id: "circle-circumference", label: "Довжина кола", expression: "C = 2\\pi r" },
          { id: "circle-area", label: "Площа круга", expression: "S = \\pi r^2" },
          { id: "arc-length", label: "Довжина дуги", expression: "\\ell = \\dfrac{\\pi r \\alpha}{180^{\\circ}}", note: "α — центральний кут у градусах" },
          { id: "sector-area", label: "Площа сектора", expression: "S = \\dfrac{\\pi r^2 \\alpha}{360^{\\circ}}", note: "α — центральний кут у градусах" },
          { id: "inscribed-angle", label: "Вписаний кут", expression: "\\angle ABC = \\dfrac{1}{2} \\breve{AC}", note: "вдвічі менший за відповідний центральний кут" },
        ],
      },
      {
        id: "quadrilaterals",
        title: "Чотирикутники",
        formulas: [
          { id: "square-area", label: "Площа квадрата", expression: "S = a^2" },
          { id: "rectangle-area", label: "Площа прямокутника", expression: "S = ab" },
          { id: "parallelogram-area", label: "Площа паралелограма", expression: "S = a h_a = ab \\sin \\alpha" },
          { id: "rhombus-area", label: "Площа ромба", expression: "S = \\dfrac{1}{2} d_1 d_2" },
          { id: "trapezoid-area", label: "Площа трапеції", expression: "S = \\dfrac{a+b}{2} h", note: "a, b — основи, h — висота" },
          { id: "quadrilateral-perimeter", label: "Периметр прямокутника", expression: "P = 2(a+b)" },
        ],
      },
      {
        id: "coordinate-geometry",
        title: "Координатна геометрія",
        formulas: [
          { id: "distance-between-points", label: "Відстань між двома точками", expression: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" },
          { id: "midpoint", label: "Координати середини відрізка", expression: "\\left( \\dfrac{x_1+x_2}{2}, \\dfrac{y_1+y_2}{2} \\right)" },
          { id: "line-slope", label: "Кутовий коефіцієнт прямої", expression: "k = \\dfrac{y_2 - y_1}{x_2 - x_1}", note: "x₁ ≠ x₂" },
          { id: "line-equation", label: "Рівняння прямої з кутовим коефіцієнтом", expression: "y = kx + b" },
        ],
      },
      {
        id: "prisms-cylinders",
        title: "Призми та циліндри",
        formulas: [
          { id: "prism-volume", label: "Об'єм призми", expression: "V = S_{\\text{осн}} \\cdot h" },
          { id: "cylinder-volume", label: "Об'єм циліндра", expression: "V = \\pi r^2 h" },
          { id: "cylinder-lateral-area", label: "Бічна поверхня циліндра", expression: "S_{\\text{бічн}} = 2\\pi r h" },
          { id: "cylinder-total-area", label: "Повна поверхня циліндра", expression: "S_{\\text{повн}} = 2\\pi r h + 2\\pi r^2" },
        ],
      },
      {
        id: "pyramids-cones",
        title: "Піраміди та конуси",
        formulas: [
          { id: "pyramid-volume", label: "Об'єм піраміди", expression: "V = \\dfrac{1}{3} S_{\\text{осн}} \\cdot h" },
          { id: "cone-volume", label: "Об'єм конуса", expression: "V = \\dfrac{1}{3} \\pi r^2 h" },
          { id: "cone-lateral-area", label: "Бічна поверхня конуса", expression: "S_{\\text{бічн}} = \\pi r \\ell", note: "ℓ — твірна конуса" },
          { id: "cone-total-area", label: "Повна поверхня конуса", expression: "S_{\\text{повн}} = \\pi r \\ell + \\pi r^2" },
          { id: "cone-slant-height", label: "Твірна конуса", expression: "\\ell = \\sqrt{r^2 + h^2}" },
        ],
      },
      {
        id: "spheres",
        title: "Сфери",
        formulas: [
          { id: "sphere-volume", label: "Об'єм кулі", expression: "V = \\dfrac{4}{3} \\pi r^3" },
          { id: "sphere-surface-area", label: "Площа поверхні сфери", expression: "S = 4\\pi r^2" },
        ],
      },
    ],
  },
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// A formula entry is valid only when it carries a non-empty id, label and
// LaTeX expression string; everything else (note, extra fields) is optional.
export function isValidFormulaEntry(entry) {
  return (
    !!entry &&
    typeof entry === "object" &&
    isNonEmptyString(entry.id) &&
    isNonEmptyString(entry.label) &&
    isNonEmptyString(entry.expression)
  );
}

function sanitizeSubsection(subsection) {
  if (
    !subsection ||
    typeof subsection !== "object" ||
    !isNonEmptyString(subsection.id) ||
    !isNonEmptyString(subsection.title) ||
    !Array.isArray(subsection.formulas)
  ) {
    return null;
  }

  const formulas = subsection.formulas.filter(isValidFormulaEntry);
  if (formulas.length === 0) return null;

  return { id: subsection.id, title: subsection.title, formulas };
}

function sanitizeSection(section) {
  if (
    !section ||
    typeof section !== "object" ||
    !isNonEmptyString(section.id) ||
    !isNonEmptyString(section.title) ||
    !Array.isArray(section.subsections)
  ) {
    return null;
  }

  const subsections = section.subsections.map(sanitizeSubsection).filter(Boolean);
  if (subsections.length === 0) return null;

  return { id: section.id, title: section.title, subsections };
}

// Drops malformed sections/subsections/formulas instead of letting a bad
// catalog entry crash the page — used both on the real catalog above and on
// arbitrary input in tests.
export function sanitizeFormulaSections(sections) {
  if (!Array.isArray(sections)) return [];
  return sections.map(sanitizeSection).filter(Boolean);
}

export function getFormulaSections() {
  return sanitizeFormulaSections(formulaSections);
}
