import { useEffect } from "react";
import { initScrollReveal } from "./lib/initScrollReveal";
import { SiteNav } from "./components/layout/SiteNav";
import { Hero } from "./components/hero/Hero";
import { Problem } from "./components/problem/Problem";
import { Solution } from "./components/solution/Solution";
import { Different } from "./components/different/Different";
import { Proof } from "./components/proof/Proof";
import { HowItWorks } from "./components/how/HowItWorks";
import { Minerals } from "./components/minerals/Minerals";
import { Demonstration } from "./components/demonstration/Demonstration";
import { FinalCta } from "./components/cta/FinalCta";
import { SiteFooter } from "./components/layout/SiteFooter";

export function App() {
  useEffect(() => {
    initScrollReveal();
  }, []);

  return (
    <>
      <div className="site-curtain">
        <SiteNav />
        <main>
          <Hero />
          <Problem />
          <Solution />
          <HowItWorks />
          <Proof />
          <Different />
          <Minerals />
          <Demonstration />
          <FinalCta />
        </main>
      </div>
      <SiteFooter />
    </>
  );
}
