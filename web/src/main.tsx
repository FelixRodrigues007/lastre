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

/* Excalidraw resolves its font files against this base, on every surface that
 * mounts it — /diagram and the deck that embeds a board. Left unset it requests
 * ./fonts/... relative to its own chunk, which the SPA rewrite answers with
 * index.html: every hand-drawn face fails and the canvas quietly falls back to
 * a system font. scripts/sync-excalidraw-fonts.mjs puts the real files there. */
(window as unknown as { EXCALIDRAW_ASSET_PATH?: string }).EXCALIDRAW_ASSET_PATH =
  "/excalidraw/";

const root = createRoot(document.getElementById("root")!);

/* /decks and /diagram run internal surfaces instead of the landing.
 * Path-based, no router dependency; Vercel already rewrites every path to
 * index.html, so the client owns the resolution. */
const isDecks = /^\/decks(\/|$)/.test(window.location.pathname);
const isDiagram = /^\/diagram(\/|$)/.test(window.location.pathname);

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
} else if (isDiagram) {
  // Internal drawing surface: never indexed, no landing chrome.
  const robots = document.createElement("meta");
  robots.name = "robots";
  robots.content = "noindex, nofollow";
  document.head.appendChild(robots);

  document.getElementById("preboot")?.remove();

  void import("./diagram/DiagramApp").then(({ DiagramApp }) => {
    root.render(
      <StrictMode>
        <DiagramApp />
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
