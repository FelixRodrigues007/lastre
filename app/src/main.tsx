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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </BrowserRouter>
  </StrictMode>,
);
