import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@design-system/tokens/lastro.css";
import "./styles/global.css";
import "./styles/section-atmosphere.css";
import "./styles/studio.css";
import "./components/ui/media-card.css";
import "./components/ui/button.css";
import "./components/layout/site-chrome.css";

import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
