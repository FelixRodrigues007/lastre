import { useEffect } from "react";
import { initScrollEffects } from "./lib/initScrollEffects";
import { initCinematicScroll } from "./lib/initCinematicScroll";
import { SiteProvider } from "./context/SiteContext";
import { Preloader } from "./components/preloader/Preloader";
import { SiteNav } from "./components/layout/SiteNav";
import { SkipLink, ScrollDepthTracker, StickyMobileCta } from "./components/layout/SiteChrome";
import { Hero } from "./components/hero/Hero";
import { SealedRail } from "./components/sealedRail/SealedRail";
import { Problem } from "./components/problem/Problem";
import { Solution } from "./components/solution/Solution";
import { Proof } from "./components/proof/Proof";
import { HowItWorks } from "./components/how/HowItWorks";
import { Capabilities } from "./components/capabilities/Capabilities";
import { Demonstration } from "./components/demonstration/Demonstration";
import { SiteFooter } from "./components/layout/SiteFooter";
import { Faq, ComparisonTable } from "./components/content/ContentSections";
import { Personas, PartnersBar } from "./components/trust/TrustSections";

export function App() {
  useEffect(() => {
    const cleanScroll = initScrollEffects();
    const cleanCinematic = initCinematicScroll();
    return () => {
      cleanScroll();
      cleanCinematic();
    };
  }, []);

  return (
    <SiteProvider>
      <Preloader />
      <SkipLink />
      <ScrollDepthTracker />
      <StickyMobileCta />

      <div className="site-curtain">
        <SiteNav />
        <main>
          <Hero />
          <SealedRail />
          <Problem />
          <Solution />
          <PartnersBar />
          <HowItWorks />
          <Capabilities />
          <Proof />
          <Personas />
          <ComparisonTable />
          <Demonstration />
          <Faq />
        </main>
      </div>
      <SiteFooter />
    </SiteProvider>
  );
}
