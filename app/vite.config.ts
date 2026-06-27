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
    port: 5174,
    fs: { allow: [".", "../design-system"] },
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
});
