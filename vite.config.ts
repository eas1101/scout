import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { metaImagesPlugin } from "./vite-plugin-meta-images";

export default defineConfig({
  base: '/scout/',
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    metaImagesPlugin(),
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined ? [
      await import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
      await import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
    ] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  
  // ▼▼▼ 修改了這裡 ▼▼▼
  // 原本指向 "client"，現在指向根目錄，這樣就能找到 index.html 了
  root: import.meta.dirname, 
  // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: true, // 注意：在新版 Vite 這可能需要是陣列或字串，若報錯請改為 true 或特定 host
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
