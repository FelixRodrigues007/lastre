import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Canonical design tokens (olive palette, dark default) — single source of
// truth shared with the ad pipeline. See vite.config.ts alias.
import "@design-system/tokens/lastro.css";
import "./styles/global.css";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
