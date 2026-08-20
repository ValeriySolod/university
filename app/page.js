import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import NmtTrainer from "@/components/NmtTrainer";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <Hero />
        <NmtTrainer />
      </main>
      <SiteFooter />
    </div>
  );
}
