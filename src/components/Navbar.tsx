import { useAuth } from "@/context/AuthContext";
import { usePWA }  from "@/hooks/usePWA";
import { LogOut, ArrowLeft, Download, GraduationCap } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { COLLEGE_LOGO_URL } from "@/config/college";

const Navbar = () => {
  const { user, logout }              = useAuth();
  const { installPrompt, promptInstall } = usePWA();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <nav className="ndc-navbar safe-top">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">

        {/* Left: back + logo */}
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/10 active:scale-95"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <ArrowLeft size={20} />
            </button>
          )}
        <img
  src={COLLEGE_LOGO_URL}
  alt="NDC"
  className="h-9 w-9"
  onError={(e) => {
    const t = e.target as HTMLImageElement;
    t.style.display = "none";
  }}
/>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ fontFamily: "Sora, sans-serif", color: "white" }}>
              National Degree College
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>Nandyal</p>
          </div>
        </div>

        {/* Right: install + user + logout */}
        <div className="flex items-center gap-2">
          {installPrompt && (
            <button
              onClick={promptInstall}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
              style={{
                fontFamily: "Sora, sans-serif",
                background: "rgba(232,96,28,0.2)",
                color: "#f07840",
                border: "1px solid rgba(232,96,28,0.35)",
              }}
            >
              <Download size={12} />
              <span className="hidden sm:inline">Install</span>
            </button>
          )}

          {user && (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold" style={{ fontFamily: "Sora, sans-serif", color: "white" }}>
                  {user.name}
                </p>
                <p className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {user.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 transition-all hover:bg-red-500/20 active:scale-95"
                style={{ color: "#f87171" }}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
