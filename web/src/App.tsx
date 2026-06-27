import { useEffect } from "react";
import { initScrollEffects } from "./lib/initScrollEffects";
import { SiteProvider } from "./context/SiteContext";
import { SiteNav } from "./components/layout/SiteNav";
import { SkipLink, ScrollDepthTracker, StickyMobileCta } from "./components/layout/SiteChrome";
import { Hero } from "./components/hero/Hero";
import { Problem } from "./components/problem/Problem";
import { Solution } from "./components/solution/Solution";
import { Different } from "./components/different/Different";
import { Proof } from "./components/proof/Proof";
import { HowItWorks } from "./components/how/HowItWorks";
import { Demonstration } from "./components/demonstration/Demonstration";
import { SiteFooter } from "./components/layout/SiteFooter";
import { Faq } from "./components/content/ContentSections";

export function App() {
  useEffect(() => {
    return initScrollEffects();
  }, []);

  return (
    <SiteProvider>
      <SkipLink />
      <ScrollDepthTracker />
      <StickyMobileCta />

      <div className="site-curtain">
        <SiteNav />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <Proof />
          <Different />
          <Demonstration />
          <Faq />
        </main>
      </div>
      <SiteFooter />
    </SiteProvider>
  );
}
