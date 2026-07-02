import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

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
