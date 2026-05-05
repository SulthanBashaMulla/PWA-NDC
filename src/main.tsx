import { createRoot } from "react-dom/client";
import { browserLocalPersistence, setPersistence } from "firebase/auth";
import { auth } from "./firebase/config";
import App from "./App.tsx";
import "./index.css";

// ── Set Firebase Auth persistence explicitly ──────────────────
// browserLocalPersistence = user stays logged in across browser restarts
// This is the default but setting it explicitly prevents issues on some devices
setPersistence(auth, browserLocalPersistence).catch(err => {
  console.warn("[Auth] Could not set persistence:", err.message);
});

// ── Register Service Worker ───────────────────────────────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(reg => {
        console.log("[PWA] SW registered:", reg.scope);

        // Check for updates every 60 seconds while app is open
        setInterval(() => reg.update(), 60_000);

        // When a new SW is available, reload to activate it
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New version available — could show a toast here
              console.log("[PWA] New version available. Refreshing…");
              window.location.reload();
            }
          });
        });
      })
      .catch(err => console.error("[PWA] SW registration failed:", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
