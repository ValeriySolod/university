import SiteHeader from "@/components/SiteHeader";
import PracticeIntro from "@/components/PracticeIntro";
import Trainer from "@/components/Trainer";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  title: "Практика — НМТ математика",
  description:
    "Тематична практика з математики: обери категорію, рівень складності та кількість завдань і отримуй миттєве пояснення після кожної відповіді.",
};

export default function PracticePage() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <PracticeIntro />
        <Trainer />
      </main>
      <SiteFooter />
    </div>
  );
}
