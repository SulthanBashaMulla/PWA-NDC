import { useState, FormEvent } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_LOGO_URL, COLLEGE_NAME } from "@/config/college";
import { Eye, EyeOff, GraduationCap, BookOpen, Shield } from "lucide-react";

const ROLES: { value: UserRole; label: string; icon: React.ReactNode; placeholder: string }[] = [
  { value: "student",  label: "Student",  icon: <GraduationCap size={16} />, placeholder: "Roll Number (e.g. 23CS001)" },
  { value: "lecturer", label: "Lecturer", icon: <BookOpen size={16} />,      placeholder: "Lecturer ID (e.g. LEC001)"  },
  { value: "admin",    label: "Admin",    icon: <Shield size={16} />,         placeholder: "Admin ID (e.g. admin001)"   },
];

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [role,     setRole]     = useState<UserRole>("student");
  const [id,       setId]       = useState("");
  const [password, setPassword] = useState("");
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!id.trim())       return setError("Please enter your ID.");
    if (!password.trim()) return setError("Please enter your password.");
    try {
      await login(id.trim(), password, role);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };

  const currentRole = ROLES.find(r => r.value === role)!;

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      <div
        className="relative z-10 w-full max-w-sm animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        {/* Logo + name */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center mb-3"
            style={{
              background: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(16px)",
              border: "2px solid rgba(255,255,255,0.65)",
              boxShadow: "0 8px 32px rgba(120,60,180,0.2)",
            }}
          >
            <img
              src={COLLEGE_LOGO_URL}
              alt="NDC"
              className="h-14 w-14 rounded-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                t.parentElement!.innerHTML = '<span style="font-size:32px">🎓</span>';
              }}
            />
          </div>
          <h1
            className="text-xl font-bold text-center"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 55% 18%)" }}
          >
            {COLLEGE_NAME}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "hsl(260 20% 50%)" }}>Nandyal</p>
        </div>

        {/* Card */}
        <div
          className="rounded-[24px] p-6 shimmer-bar"
          style={{
            background: "rgba(255,255,255,0.38)",
            backdropFilter: "blur(32px)",
            WebkitBackdropFilter: "blur(32px)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 16px 48px rgba(120,60,180,0.18), inset 0 1px 0 rgba(255,255,255,0.7)",
          }}
        >
          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent rounded-t-[24px]" />

          <h2
            className="text-lg font-bold mb-5 text-center"
            style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 50% 20%)" }}
          >
            Sign In
          </h2>

          {/* Role selector */}
          <div className="flex gap-2 mb-5 p-1 rounded-[14px]" style={{ background: "rgba(255,255,255,0.3)" }}>
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setId(""); setError(""); }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[10px] py-2 text-xs font-semibold transition-all duration-200"
                style={role === r.value ? {
                  background: "rgba(255,255,255,0.75)",
                  color: "hsl(265 80% 48%)",
                  boxShadow: "0 2px 8px rgba(120,60,180,0.15)",
                } : {
                  color: "hsl(260 20% 52%)",
                }}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID field */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}
              >
                {currentRole.label} ID
              </label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder={currentRole.placeholder}
                className="glass-input"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {/* Password field */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "hsl(260 30% 45%)", fontFamily: "Outfit, sans-serif" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="glass-input"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: "hsl(260 20% 55%)" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-medium"
                style={{ background: "rgba(239,68,68,0.12)", color: "hsl(0 72% 48%)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-1"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <p
            className="text-center text-xs mt-4"
            style={{ color: "hsl(260 20% 55%)" }}
          >
            Use your college-issued ID &amp; password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
