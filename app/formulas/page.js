import "katex/dist/katex.min.css";
import SiteHeader from "@/components/SiteHeader";
import FormulaReference from "@/components/FormulaReference";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Довідник формул — НМТ математика",
  description: "Довідник формул з алгебри та геометрії для підготовки до НМТ: степені, корені, логарифми, прогресії, планіметрія та стереометрія.",
};

export default function FormulasPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <h1 className="formulas-title">Довідник формул</h1>
        <p className="formulas-intro">
          Основні формули з алгебри та геометрії рівня НМТ, згруповані за темами.
        </p>
        <FormulaReference />
      </main>
      <SiteFooter />
    </div>
  );
}
