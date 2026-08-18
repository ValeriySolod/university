import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import Trainer from "@/components/Trainer";
import SiteFooter from "@/components/SiteFooter";

export default function Home() {
  return (
    <div className="page-shell">
      <SiteHeader />
      <main>
        <Hero />
        <Trainer />
      </main>
      <SiteFooter />
    </div>
  );
}
