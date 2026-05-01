import { useNavigate } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen flex items-center justify-center p-6">
      <AnimatedBackground />
      <div className="relative z-10 text-center animate-fade-in-up">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background:"rgba(15,45,94,0.1)", border:"2px solid rgba(15,45,94,0.15)" }}>
          <span className="text-4xl">🔍</span>
        </div>
        <p className="text-6xl font-black mb-3" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>404</p>
        <p className="text-lg font-bold mb-2" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>Page Not Found</p>
        <p className="text-sm mb-6" style={{ color:"var(--text-3)" }}>This page doesn't exist in NDC portal.</p>
        <button onClick={() => navigate("/")} className="btn-navy" style={{ width:"auto", padding:"12px 32px" }}>
          Go to Home
        </button>
      </div>
    </div>
  );
}
