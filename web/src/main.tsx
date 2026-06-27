import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Canonical design tokens (olive palette, dark default) — single source of
// truth shared with the ad pipeline. Copied locally to src/styles/ so
// Vercel builds (with Root Directory = web) work reliably without parent
// directory dependencies.
import "./styles/lastro-tokens.css";
import "./styles/global.css";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
