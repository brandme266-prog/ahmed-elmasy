import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const prerender = require("vite-plugin-prerender");
import { componentTagger } from "lovable-tagger";

const Renderer = prerender.PuppeteerRenderer;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" ? componentTagger() : null,
    mode === "production" ? prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: ['/', '/products', '/articles', '/services'],
      renderer: new Renderer({
        renderAfterDocumentEvent: 'render-event',
        injectProperty: '__PRERENDER_INJECTED',
        inject: {}
      })
    }) : null
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    sourcemap: true,
  },
}));
