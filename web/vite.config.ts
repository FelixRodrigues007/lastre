import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Design tokens are now copied locally into src/styles/lastro-tokens.css
// so builds work cleanly when Vercel uses Root Directory = "web".
export default defineConfig({
  plugins: [react()],
});
