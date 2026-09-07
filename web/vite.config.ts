import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

/* O conteúdo dos decks não pode sair no bundle público: o chunk vai para
 * /decks-private/, que web/functions/decks-private/_middleware.ts tranca. Um
 * módulo só entra neste chunk se for alcançável exclusivamente pelos decks —
 * o que a landing também usa o Rollup separa sozinho num chunk comum. */
const isDeckChunk = (chunk: {
  facadeModuleId: string | null;
  moduleIds: string[];
}): boolean => {
  const inDecks = (id: string) => id.replace(/\\/g, "/").includes("/src/decks/");
  if (chunk.facadeModuleId && inDecks(chunk.facadeModuleId)) return true;
  const real = chunk.moduleIds.filter((id) => !id.startsWith("\0"));
  return real.length > 0 && real.every(inDecks);
};

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) =>
          isDeckChunk(chunk)
            ? "decks-private/[name]-[hash].js"
            : "assets/[name]-[hash].js",
      },
    },
  },
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
