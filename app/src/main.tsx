import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@design-system/tokens/lastro.css";
import { initLocale } from "./lib/locale";
import { initTheme } from "./lib/theme";
import { initDemoSession } from "./lib/initDemoSession";
import { APP_BUILD_STAMP } from "./lib/buildStamp";
import "./styles/app.css";
import "./styles/app-craft.css";
import "./styles/motion.css";
import "./styles/screen-signatures.css";
import "./styles/micro-states.css";
import "./styles/craft.css";
import "./styles/refine.css";

initTheme();
initLocale();
initDemoSession();

document.documentElement.dataset.appBuild = APP_BUILD_STAMP;

import { App } from "./App";
import { LocaleProvider } from "./context/LocaleContext";
import { NavCountsProvider } from "./context/NavCountsContext";
import { OnboardingProvider } from "./context/OnboardingContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <OnboardingProvider>
          <NavCountsProvider>
            <App />
          </NavCountsProvider>
        </OnboardingProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
);
