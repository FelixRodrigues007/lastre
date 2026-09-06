/* Excalidraw's bundle asks for ./fonts/<Family>/*.woff2 at runtime, but ships
 * them inside node_modules — Vite never copies them, so a production build
 * 404s every hand-drawn face and the canvas silently falls back to a system
 * font. The CSP is font-src 'self', so pulling them from a CDN is not an
 * option either: they have to be ours, served from our origin.
 *
 * Mirrors them into public/excalidraw/fonts, which pairs with the
 * window.EXCALIDRAW_ASSET_PATH set in main.tsx. Xiaolai is skipped: 12 MB of
 * CJK glyphs against ~500 KB for everything else, and no board needs it. */

import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(
  here,
  "../node_modules/@excalidraw/excalidraw/dist/prod/fonts",
);
const dest = path.resolve(here, "../public/excalidraw/fonts");

const SKIP = new Set(["Xiaolai"]);

if (!existsSync(src)) {
  console.error(`excalidraw fonts not found at ${src} — run npm install first`);
  process.exit(1);
}

await rm(dest, { recursive: true, force: true });
await mkdir(dest, { recursive: true });

let copied = 0;
for (const entry of await readdir(src, { withFileTypes: true })) {
  if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
  await cp(path.join(src, entry.name), path.join(dest, entry.name), {
    recursive: true,
  });
  copied++;
}

console.log(`excalidraw fonts: ${copied} families synced to public/excalidraw`);
