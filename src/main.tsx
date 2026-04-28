import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((reg) => console.log("[PWA] SW registered:", reg.scope))
      .catch((err) => console.error("[PWA] SW failed:", err));
  });
}

createRoot(document.getElementById("root")!).render(<App />);
