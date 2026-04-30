import { useState, FormEvent } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_LOGO_URL, COLLEGE_NAME } from "@/config/college";
import { Eye, EyeOff, GraduationCap, BookOpen, Shield, School } from "lucide-react";

const ROLES: { value: UserRole;label: string;icon: React.ReactNode;placeholder: string } [] = [
  { value: "student", label: "Student", icon: <GraduationCap size={14} />, placeholder: "Roll Number (e.g. 23CS001)" },
  { value: "lecturer", label: "Lecturer", icon: <BookOpen size={14} />, placeholder: "Lecturer ID (e.g. LEC001)" },
  { value: "admin", label: "Admin", icon: <Shield size={14} />, placeholder: "Admin ID (e.g. admin001)" },
];

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [role, setRole] = useState < UserRole > ("student");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!id.trim()) return setError("Please enter your ID.");
    if (!password.trim()) return setError("Please enter your password.");
    
    try {
      await login(id.trim(), password, role);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    }
  };
  
  const currentRole = ROLES.find(r => r.value === role) !;
  
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <AnimatedBackground />

      {/* Left side decorative text */}
      <div className="hidden lg:flex flex-col justify-center flex-1 max-w-md pl-16 pr-8 z-10">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <School size={20} className="text-white" />
            </div>
            <span className="text-white/80 font-semibold text-sm tracking-wide">
              NDC Portal
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Welcome to<br />
            <span className="text-cyan-300">National Degree</span><br />
            College
          </h2>

          <p className="text-white/60 text-base leading-relaxed">
            Your all-in-one academic portal for students, lecturers, and administrators.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            "Access your attendance & marks",
            "View circulars & notices",
            "Manage class records"
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-cyan-400/30 border border-cyan-400/50 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-cyan-300" />
              </div>
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="h-20 w-20 rounded-2xl flex items-center justify-center mb-4 shadow-xl bg-white/15 border border-white/25 backdrop-blur">
            <img
              src={COLLEGE_LOGO_URL}
              alt="NDC"
              className="h-14 w-14 rounded-xl object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                t.parentElement!.innerHTML = "🎓";
              }}
            />
          </div>

          <h1 className="text-xl font-bold text-white text-center">
            {COLLEGE_NAME}
          </h1>
          <p className="text-sm mt-0.5 text-white/60">Nandyal</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl p-6 shadow-2xl bg-white">
          <div className="h-1 w-12 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 mx-auto mb-5" />

          <h2 className="text-lg font-bold mb-5 text-center text-[#0D2137]">
            Sign In to Portal
          </h2>

          {/* Role Selector */}
          <div className="mb-5 flex gap-2">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => { setRole(r.value); setId(""); setError(""); }}
                className={`flex-1 py-2 rounded-lg border ${role === r.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ID */}
            <input
              type="text"
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder={currentRole.placeholder}
              className="w-full border rounded-lg px-3 py-2"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full border rounded-lg px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-2 top-2"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs mt-4 text-gray-400">
            Use your college-issued ID & password
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;