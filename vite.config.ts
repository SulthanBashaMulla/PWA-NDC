import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    target: "es2020",
    sourcemap: false,
    // Warn if any chunk exceeds 500KB
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // Firebase split into smaller pieces
          "firebase-core": ["firebase/app", "firebase/auth"],
          "firebase-db":   ["firebase/firestore"],
          // UI icons
          "icons":         ["lucide-react"],
          // Sheets/CSV parsing
          "sheets":        ["papaparse"],
          // Radix primitives
          "radix":         [
            "@radix-ui/react-dialog",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-popover",
          ],
        },
      },
    },
  },
  server: { port: 8080, host: true },
}));
