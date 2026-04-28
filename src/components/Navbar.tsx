import { useAuth } from "@/context/AuthContext";
import { usePWA }  from "@/hooks/usePWA";
import { LogOut, ArrowLeft, Download } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { COLLEGE_LOGO_URL, COLLEGE_NAME } from "@/config/college";

const Navbar = () => {
  const { user, logout }          = useAuth();
  const { installPrompt, promptInstall } = usePWA();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-6 safe-top"
      style={{
        background: "rgba(255,255,255,0.28)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
        boxShadow: "0 2px 16px rgba(120,60,180,0.1)",
      }}
    >
      {/* Left: back button + logo */}
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl p-2 transition-all hover:bg-white/30 active:scale-95"
            style={{ color: "hsl(260 40% 35%)" }}
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <img
          src={COLLEGE_LOGO_URL}
          alt="NDC Logo"
          className="h-9 w-9 rounded-full object-cover"
          style={{ boxShadow: "0 0 0 2px rgba(139,92,246,0.3)" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <div>
          <h1
            className="text-sm font-semibold leading-tight"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 50% 20%)" }}
          >
            {COLLEGE_NAME}
          </h1>
          <p className="text-xs" style={{ color: "hsl(260 20% 50%)" }}>Nandyal</p>
        </div>
      </div>

      {/* Right: install + user + logout */}
      <div className="flex items-center gap-2">
        {/* PWA install button — only shows when installable */}
        {installPrompt && (
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:bg-white/30 active:scale-95"
            style={{ color: "hsl(265 80% 50%)", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
            title="Install NDC App"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {user && (
          <>
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 40% 20%)" }}>
                {user.name}
              </p>
              <p className="text-xs capitalize" style={{ color: "hsl(260 20% 52%)" }}>{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="rounded-xl p-2 transition-all hover:bg-red-100/50 active:scale-95"
              style={{ color: "hsl(0 72% 55%)" }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
