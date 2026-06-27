import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "@design-system/tokens/lastro.css";
import { initLocale } from "./lib/locale";
import { initTheme } from "./lib/theme";
import "./styles/app.css";

initTheme();
initLocale();

import { App } from "./App";
import { LocaleProvider } from "./context/LocaleContext";
import { NavCountsProvider } from "./context/NavCountsContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <NavCountsProvider>
          <App />
        </NavCountsProvider>
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
);
