import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  // IMPORTANT: Lovable hosting expects assets to be served from the site root.
  // A wrong `base` causes JS/CSS asset 404s and results in a blank page.
  base: "/",
  plugins: [react()],
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
