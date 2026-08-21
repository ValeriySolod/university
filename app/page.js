import SiteHeader from "@/components/SiteHeader";
import NmtTrainer from "@/components/NmtTrainer";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <NmtTrainer />
      </main>
      <SiteFooter />
    </div>
  );
}
