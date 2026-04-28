import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedBackground />
      <div className="relative z-10 text-center animate-fade-in-up">
        <p className="text-7xl font-black mb-4" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 40% 25%)" }}>404</p>
        <p className="text-lg font-semibold mb-2" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 40% 30%)" }}>Page not found</p>
        <p className="text-sm mb-6" style={{ color: "hsl(260 20% 52%)" }}>This page doesn't exist in NDC portal.</p>
        <button onClick={() => navigate("/")} className="btn-primary" style={{ width: "auto", padding: "12px 32px" }}>
          Go Home
        </button>
      </div>
    </div>
  );
}
