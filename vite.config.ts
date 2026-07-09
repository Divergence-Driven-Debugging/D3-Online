import { API_CONFIG } from "./src/config/api";
import { LSP_CONFIG } from "./src/config/lsp";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    proxy: {
      "/api": {
        target: API_CONFIG.url,
        changeOrigin: true,
        rewrite: (path) => path.replace("/api", ""),
      },
      "/lsp": {
        target: LSP_CONFIG.url,
        changeOrigin: true,
        rewrite: (path) => path.replace("/lsp", ""),
      },
    },
  },
});
