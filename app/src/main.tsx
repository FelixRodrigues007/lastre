import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@design-system/tokens/lastre.css";
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
import "./styles/lastre-app.css";

initTheme();
const initialPath = window.location.pathname;
const isAssets = initialPath === "/" || /^\/assets(?:\/|$)/.test(initialPath);
const isDesignSystem =
  window.location.pathname.replace(/\/$/, "") === "/design-system";
const isAdminPreview =
  import.meta.env.DEV && /^\/admin(?:\/|$)/.test(window.location.pathname);
if (!isAssets && !isDesignSystem && !isAdminPreview) {
  initLocale();
  initDemoSession();
}

document.documentElement.dataset.appBuild = APP_BUILD_STAMP;

import { App } from "./App";
import { LanguageGate } from "./components/onboarding/LanguageGate";
import { LocaleProvider } from "./context/LocaleContext";
import { NavCountsProvider } from "./context/NavCountsContext";
import { OnboardingProvider } from "./context/OnboardingContext";

const DesignSystem = lazy(() =>
  import("./routes/DesignSystem").then((m) => ({ default: m.DesignSystem })),
);

// Vite eliminates the import and the inventory data from production builds.
const AdminPreview = import.meta.env.DEV
  ? lazy(() =>
      import("./routes/admin/AdminPreview").then((m) => ({
        default: m.AdminPreview,
      })),
    )
  : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isAdminPreview && AdminPreview ? (
      <Suspense fallback={<p role="status">Carregando inventário…</p>}>
        <AdminPreview />
      </Suspense>
    ) : isDesignSystem ? (
      <Suspense fallback={<p role="status">Carregando design system…</p>}>
        <DesignSystem />
      </Suspense>
    ) : isAssets ? (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    ) : (
      <BrowserRouter>
        <LocaleProvider>
          <LanguageGate />
          <OnboardingProvider>
            <NavCountsProvider>
              <App />
            </NavCountsProvider>
          </OnboardingProvider>
        </LocaleProvider>
      </BrowserRouter>
    )}
  </StrictMode>,
);
