import { useState, type FormEvent, type ReactNode } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { COLLEGE_LOGO_URL } from "@/config/college";
import { Eye, EyeOff, GraduationCap, BookOpen, Shield, LogIn } from "lucide-react";

const ROLES: { value: UserRole;label: string;icon: ReactNode } [] = [
  { value: "student", label: "Student", icon: <GraduationCap size={14} /> },
  { value: "lecturer", label: "Lecturer", icon: <BookOpen size={14} /> },
  { value: "admin", label: "Admin", icon: <Shield size={14} /> },
];

const PLACEHOLDERS: Record < UserRole, string > = {
  student: "Roll Number (e.g. 23BCA001)",
  lecturer: "Lecturer ID (e.g. LEC001)",
  admin: "Admin ID (e.g. admin001)",
};

const LoginPage = () => {
  const { login, loading } = useAuth();
  
  const [role, setRole] = useState < UserRole > ("student");
  const [id, setId] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!id.trim()) {
      setError("Please enter your ID.");
      return;
    }
    
    if (!pwd.trim()) {
      setError("Please enter your password.");
      return;
    }
    
    try {
      await login(id.trim(), pwd, role);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };
  
  return (
    <div className="login-bg">
      <div className="login-card animate-fade-in-up w-full max-w-sm mx-auto">

        {/* Top section */}
        <div className="login-card-top">
          <div className="flex flex-col items-center">
            <img
              src={COLLEGE_LOGO_URL}
              alt="NDC"
              className="h-20 w-20 object-contain mb-3"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
              }}
            />
            <h1
              className="text-lg font-bold text-white leading-tight text-center"
              style={{ fontFamily: "Sora, sans-serif" }}
            >
              National Degree College
            </h1>
            <p
              className="text-xs mt-0.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Nandyal — Student Portal
            </p>
          </div>
        </div>

        {/* Form section */}
        <div className="p-6">
          <p
            className="text-sm font-bold mb-4 text-center"
            style={{
              fontFamily: "Sora, sans-serif",
              color: "var(--text-1)",
            }}
          >
            Sign In to Continue
          </p>

          {/* Role selector */}
          <div
            className="flex gap-2 p-1 rounded-xl mb-5"
            style={{ background: "var(--bg-2)" }}
          >
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => {
                  setRole(r.value);
                  setId("");
                  setPwd("");
                  setError("");
                }}
                className={`role-btn ${role === r.value ? "active" : ""}`}
              >
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* ID Field */}
            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{
                  fontFamily: "Sora, sans-serif",
                  color: "var(--text-2)",
                }}
              >
                {role === "student"
                  ? "Roll Number"
                  : role === "lecturer"
                  ? "Lecturer ID"
                  : "Admin ID"}
              </label>

              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder={PLACEHOLDERS[role]}
                className="ndc-input"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-xs font-bold mb-1.5"
                style={{
                  fontFamily: "Sora, sans-serif",
                  color: "var(--text-2)",
                }}
              >
                Password
              </label>

              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Enter your password"
                  className="ndc-input"
                  style={{ paddingRight: "44px" }}
                />

                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-3)" }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color: "#dc2626",
                  border: "1px solid rgba(239,68,68,0.18)",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-navy mt-1"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p
            className="text-center text-xs mt-4"
            style={{ color: "var(--text-3)" }}
          >
            Use your college-issued credentials
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;