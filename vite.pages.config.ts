import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Build estático (SPA) usado apenas para publicar no GitHub Pages.
 * O app principal continua sendo construído por vite.config.ts (TanStack Start).
 */
export default defineConfig({
  base: process.env["PAGES_BASE"] ?? "/descricao_vagas/",
  root: fileURLToPath(new URL("./pages", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
    emptyOutDir: true,
  },
});
