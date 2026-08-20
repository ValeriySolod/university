import SiteHeader from "@/components/SiteHeader";
import HistoryTrainer from "@/components/HistoryTrainer";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Історія спроб — НМТ математика",
  description: "Перегляд завершених спроб, розбір помилок, позначені завдання та повторення — без впливу на активний тест чи практику.",
};

export default function HistoryPage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <HistoryTrainer />
      </main>
      <SiteFooter />
    </div>
  );
}
