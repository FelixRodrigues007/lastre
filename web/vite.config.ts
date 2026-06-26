import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// The canonical design tokens live one level up in /design-system so the
// landing page and the ad pipeline share a single source of truth. Alias +
// fs.allow let us import that file directly instead of duplicating it here.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@design-system": fileURLToPath(
        new URL("../design-system", import.meta.url),
      ),
    },
  },
  server: {
    fs: { allow: [".", "../design-system"] },
  },
});
