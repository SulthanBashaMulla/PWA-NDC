import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["ndc-logo.png", "favicon.ico"],
      manifest: {
        name: "NDC Student Management",
        short_name: "NDC Portal",
        description: "National Degree College, Nandyal — Student Management System",
        theme_color: "#7c3aed",
        background_color: "#f5f3ff",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/ndc-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/ndc-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/ndc-logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            // Cache Google Sheets CSV reads
            urlPattern: /^https:\/\/docs\.google\.com\/spreadsheets/,
            handler: "NetworkFirst",
            options: {
              cacheName: "sheets-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 }, // 5 min
            },
          },
          {
            // Cache Firebase Firestore (offline support)
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: "NetworkFirst",
            options: {
              cacheName: "firestore-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 10 },
            },
          },
        ],
      },
      devOptions: {
        // Enable PWA in dev so you can test install prompt locally
        enabled: mode === "development",
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
