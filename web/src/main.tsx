import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Canonical tokens — design-system/tokens/lastro.css (same file as app.lastre.io console).
import "@design-system/tokens/lastro.css";
import "./styles/global.css";
import "./styles/section-atmosphere.css";
import "./styles/studio.css";
import "./components/ui/media-card.css";
import "./components/ui/button.css";
import "./components/layout/site-chrome.css";

import { App } from "./App";

const root = createRoot(document.getElementById("root")!);

/* /decks and /decks/:slug run the presentation surface instead of the landing.
 * Path-based, no router dependency; Vercel already rewrites every path to
 * index.html, so the client owns the resolution. */
const isDecks = /^\/decks(\/|$)/.test(window.location.pathname);

if (isDecks) {
  // Internal working documents: never indexed.
  const robots = document.createElement("meta");
  robots.name = "robots";
  robots.content = "noindex, nofollow";
  document.head.appendChild(robots);

  // The decks surface has no <Preloader/>, so it clears the anti-flash layer itself.
  document.getElementById("preboot")?.remove();

  void import("./decks/DecksApp").then(({ DecksApp }) => {
    root.render(
      <StrictMode>
        <DecksApp />
      </StrictMode>,
    );
  });
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
