import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Where the Express API runs during `npm run dev` / `npm run preview`.
  const apiTarget = env.VITE_API_PROXY || "http://localhost:5000";
  const proxy = {
    "/api": { target: apiTarget, changeOrigin: true },
    "/uploads": { target: apiTarget, changeOrigin: true },
  };
  const siteUrl = (env.VITE_SITE_URL || "https://jmjhyderabadprovince.org").replace(/\/$/, "");
  return {
  plugins: [
    react(),
    {
      // Puts the live domain into the static link-preview tags in index.html.
      name: "jmj-site-url",
      transformIndexHtml: { order: "pre", handler: (html: string) => html.replaceAll("%SITE_URL%", siteUrl) },
    },
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: { port: 5173, host: true, strictPort: true, allowedHosts: ["terminal.local"], proxy },
  preview: { port: 4173, host: true, strictPort: true, proxy },
  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    modulePreload: { polyfill: false },
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"]
        }
      }
    }
  }
};
});
