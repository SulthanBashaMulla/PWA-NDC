import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { usePWA } from "./hooks/usePWA";

createRoot(document.getElementById("root")!).render(<App />);
