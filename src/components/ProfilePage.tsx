// src/components/ProfilePage.tsx
// One component handles Student / Lecturer / Admin profile.
// Shows role-specific fields and allows password change.

import { useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/firebase/auth";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import {
  User, GraduationCap, BookOpen, Shield,
  Phone, Mail, Hash, Building2, Star,
  Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  LogOut, ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { COLLEGE_NAME, COLLEGE_PLACE } from "@/config/college";

// ── Helpers ───────────────────────────────────────────────────
const avatarInitials = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? "")
    .join("");

const roleConfig = {
  student: {
    label:   "Student",
    color:   "var(--navy)",
    bg:      "rgba(15,45,94,0.1)",
    icon:    <GraduationCap size={20} />,
    badgeClass: "badge-navy",
  },
  lecturer: {
    label:   "Lecturer",
    color:   "var(--orange)",
    bg:      "rgba(232,96,28,0.1)",
    icon:    <BookOpen size={20} />,
    badgeClass: "badge-orange",
  },
  admin: {
    label:   "Admin",
    color:   "#7c3aed",
    bg:      "rgba(139,92,246,0.1)",
    icon:    <Shield size={20} />,
    badgeClass: "badge-purple",
  },
} as const;

// ── Info Row ─────────────────────────────────────────────────
const InfoRow = ({
  icon, label, value, mono = false,
}: {
  icon: React.ReactNode; label: string; value?: string | number; mono?: boolean;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-center gap-3 py-3 border-b" style={{ borderColor:"var(--bg-2)" }}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background:"rgba(15,45,94,0.06)" }}>
        <span style={{ color:"var(--navy)" }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color:"var(--text-3)", fontFamily:"Sora,sans-serif" }}>
          {label}
        </p>
        <p className={`text-sm font-semibold truncate ${mono ? "font-mono" : ""}`} style={{ color:"var(--text-1)" }}>
          {String(value)}
        </p>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  // Password change state
  const [showPwdForm,  setShowPwdForm]  = useState(false);
  const [currentPwd,   setCurrentPwd]   = useState(""); // not actually verified client-side; Firebase checks it
  const [newPwd,       setNewPwd]       = useState("");
  const [confirmPwd,   setConfirmPwd]   = useState("");
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [pwdLoading,   setPwdLoading]   = useState(false);
  const [pwdSuccess,   setPwdSuccess]   = useState(false);
  const [pwdError,     setPwdError]     = useState("");

  if (!user) return null;

  const role   = user.role;
  const cfg    = roleConfig[role];
  const initials = avatarInitials(user.name || "U");

  // Role-specific field groups
  const studentFields = role === "student" ? [
    { icon:<Hash size={14}/>,        label:"Roll Number",  value:(user as any).rollNo  },
    { icon:<GraduationCap size={14}/>, label:"Group",       value:(user as any).group   },
    { icon:<Building2 size={14}/>,   label:"Section",      value:(user as any).section },
    { icon:<Star size={14}/>,        label:"Semester",     value:(user as any).semester ? `Semester ${(user as any).semester}` : undefined },
    { icon:<Phone size={14}/>,       label:"Phone",        value:(user as any).phone, mono:true },
    { icon:<Mail size={14}/>,        label:"Email",        value:user.email, mono:true },
  ] : [];

  const lecturerFields = role === "lecturer" ? [
    { icon:<Hash size={14}/>,       label:"Lecturer ID",  value:(user as any).lecturerId, mono:true },
    { icon:<Building2 size={14}/>,  label:"Department",   value:(user as any).department },
    { icon:<Star size={14}/>,       label:"Designation",  value:(user as any).designation },
    { icon:<BookOpen size={14}/>,   label:"Role",         value:(user as any).isIncharge ? `Class Incharge — ${(user as any).group} Section ${(user as any).section}` : "Subject Lecturer" },
    { icon:<Phone size={14}/>,      label:"Phone",        value:(user as any).phone, mono:true },
    { icon:<Mail size={14}/>,       label:"Email",        value:user.email, mono:true },
  ] : [];

  const adminFields = role === "admin" ? [
    { icon:<Hash size={14}/>,       label:"Admin ID",     value:(user as any).adminId, mono:true },
    { icon:<Star size={14}/>,       label:"Designation",  value:(user as any).designation },
    { icon:<Shield size={14}/>,     label:"Access Level", value:"Super Admin — Full Control" },
    { icon:<Phone size={14}/>,      label:"Phone",        value:(user as any).phone, mono:true },
    { icon:<Mail size={14}/>,       label:"Email",        value:user.email, mono:true },
  ] : [];

  const fields = [...studentFields, ...lecturerFields, ...adminFields];

  // Password change handler
  const handlePasswordChange = async () => {
    setPwdError("");
    if (!newPwd.trim())       return setPwdError("Enter a new password.");
    if (newPwd.length < 6)    return setPwdError("Password must be at least 6 characters.");
    if (newPwd !== confirmPwd) return setPwdError("Passwords do not match.");

    setPwdLoading(true);
    try {
      await changePassword(newPwd);
      setPwdSuccess(true);
      setNewPwd(""); setConfirmPwd(""); setCurrentPwd("");
      setTimeout(() => { setPwdSuccess(false); setShowPwdForm(false); }, 2500);
    } catch (err: any) {
      setPwdError(err.message || "Failed to change password. Try logging out and back in first.");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-md mx-auto p-4 pb-8">

          {/* ── Avatar card ── */}
          <div className="ndc-card mb-4 animate-fade-in-up">
            {/* Top gradient band */}
            <div className="h-20 rounded-t-[16px]"
              style={{ background:`linear-gradient(135deg, var(--navy-dark), var(--navy))`, borderBottom:"3px solid var(--orange)" }} />

            {/* Avatar overlapping the band */}
            <div className="flex flex-col items-center" style={{ marginTop:"-36px" }}>
              <div className="w-18 h-18 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                style={{
                  width:72, height:72,
                  background:`linear-gradient(135deg, var(--navy), var(--navy-mid))`,
                  border:"3px solid white",
                  fontFamily:"Sora,sans-serif",
                  boxShadow:"0 4px 20px rgba(15,45,94,0.25)",
                }}>
                {initials}
              </div>

              <div className="text-center mt-3 mb-4 px-4">
                <h1 className="text-lg font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                  {user.name}
                </h1>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className={`badge ${cfg.badgeClass} text-xs`}>
                    {cfg.icon}
                    <span className="ml-1">{cfg.label}</span>
                  </span>
                  <span className={`badge text-xs ${user.status === "active" ? "badge-green" : "badge-red"}`}>
                    {user.status === "active" ? "✅ Active" : "🚫 Inactive"}
                  </span>
                </div>
                <p className="text-xs mt-2" style={{ color:"var(--text-3)" }}>
                  {COLLEGE_NAME}, {COLLEGE_PLACE}
                </p>
              </div>
            </div>
          </div>

          {/* ── Profile fields ── */}
          <div className="ndc-card mb-4 stagger-2">
            <div className="ndc-card-header">
              <h3>Profile Information</h3>
              <User size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
            </div>
            <div className="px-4 pb-2">
              {fields.map((f, i) => (
                <InfoRow key={i} icon={f.icon} label={f.label} value={f.value} mono={f.mono} />
              ))}
            </div>
          </div>

          {/* ── Account info ── */}
          <div className="ndc-card mb-4 stagger-3">
            <div className="ndc-card-header">
              <h3>Account</h3>
              <Lock size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
            </div>
            <div className="px-4 pb-2">
              <InfoRow icon={<Shield size={14}/>} label="Account Status" value={user.status === "active" ? "Active" : "Inactive"} />
              <InfoRow icon={<User size={14}/>}   label="Role"           value={cfg.label} />
            </div>
          </div>

          {/* ── Change Password ── */}
          <div className="ndc-card mb-4 stagger-4">
            <button
              onClick={() => { setShowPwdForm(v => !v); setPwdError(""); setPwdSuccess(false); }}
              className="w-full flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background:"rgba(15,45,94,0.08)" }}>
                  <Lock size={15} style={{ color:"var(--navy)" }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                    Change Password
                  </p>
                  <p className="text-xs" style={{ color:"var(--text-3)" }}>Update your login password</p>
                </div>
              </div>
              <ChevronRight size={16} style={{ color:"var(--text-3)", transform: showPwdForm ? "rotate(90deg)" : "none", transition:"transform 0.2s" }} />
            </button>

            {showPwdForm && (
              <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor:"var(--bg-2)" }}>
                <div className="pt-3">
                  {/* New Password */}
                  <div className="mb-3">
                    <label className="block text-xs font-bold mb-1.5"
                      style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        placeholder="Min 6 characters"
                        className="ndc-input"
                        style={{ paddingRight:"44px" }}
                      />
                      <button type="button" onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color:"var(--text-3)" }}>
                        {showNew ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-3">
                    <label className="block text-xs font-bold mb-1.5"
                      style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        placeholder="Repeat new password"
                        className="ndc-input"
                        style={{ paddingRight:"44px" }}
                      />
                      <button type="button" onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                        style={{ color:"var(--text-3)" }}>
                        {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                      </button>
                    </div>
                  </div>

                  {/* Password match indicator */}
                  {newPwd && confirmPwd && (
                    <div className={`flex items-center gap-2 text-xs mb-3 font-semibold ${newPwd === confirmPwd ? "text-green-600" : "text-red-500"}`}>
                      {newPwd === confirmPwd
                        ? <><CheckCircle2 size={13}/> Passwords match</>
                        : <><AlertCircle size={13}/> Passwords do not match</>
                      }
                    </div>
                  )}

                  {/* Error */}
                  {pwdError && (
                    <div className="mb-3 rounded-xl px-3 py-2 text-xs font-semibold"
                      style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
                      {pwdError}
                    </div>
                  )}

                  {/* Success */}
                  {pwdSuccess && (
                    <div className="mb-3 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2"
                      style={{ background:"rgba(16,185,129,0.08)", color:"#059669", border:"1px solid rgba(16,185,129,0.15)" }}>
                      <CheckCircle2 size={13}/> Password changed successfully!
                    </div>
                  )}

                  <button
                    onClick={handlePasswordChange}
                    disabled={pwdLoading || !newPwd || !confirmPwd}
                    className="btn-navy flex items-center justify-center gap-2">
                    {pwdLoading
                      ? <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      : <Lock size={14} />}
                    {pwdLoading ? "Updating…" : "Update Password"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Quick links based on role ── */}
          <div className="ndc-card mb-4 stagger-5">
            <div className="ndc-card-header">
              <h3>Quick Links</h3>
              <ChevronRight size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
            </div>
            <div>
              {role === "student" && (
                <>
                  <button onClick={() => navigate("/marks")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(139,92,246,0.1)" }}>
                      <BookOpen size={14} style={{ color:"#7c3aed" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>My Marks</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/attendance")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(16,185,129,0.1)" }}>
                      <GraduationCap size={14} style={{ color:"#059669" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>My Attendance</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/timetable")} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(232,96,28,0.1)" }}>
                      <Star size={14} style={{ color:"var(--orange)" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Timetable</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                </>
              )}
              {role === "lecturer" && (
                <>
                  <button onClick={() => navigate("/attendance")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(16,185,129,0.1)" }}>
                      <GraduationCap size={14} style={{ color:"#059669" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Attendance</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/marks")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(139,92,246,0.1)" }}>
                      <BookOpen size={14} style={{ color:"#7c3aed" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Marks</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/timetable")} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(232,96,28,0.1)" }}>
                      <Star size={14} style={{ color:"var(--orange)" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Timetable</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                </>
              )}
              {role === "admin" && (
                <>
                  <button onClick={() => navigate("/admin/students")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(16,185,129,0.1)" }}>
                      <GraduationCap size={14} style={{ color:"#059669" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Students</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/admin/lecturers")} className="w-full flex items-center gap-3 p-3 border-b hover:bg-gray-50 transition-colors" style={{ borderColor:"var(--bg-2)" }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(232,96,28,0.1)" }}>
                      <BookOpen size={14} style={{ color:"var(--orange)" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Lecturers</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                  <button onClick={() => navigate("/notifications")} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:"rgba(15,45,94,0.08)" }}>
                      <Shield size={14} style={{ color:"var(--navy)" }} />
                    </div>
                    <span className="text-sm font-semibold" style={{ color:"var(--text-1)" }}>Notifications</span>
                    <ChevronRight size={14} className="ml-auto" style={{ color:"var(--text-3)" }} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Logout ── */}
          <div className="stagger-6">
            <button
              onClick={async () => { await logout(); navigate("/"); }}
              className="w-full flex items-center justify-center gap-2 rounded-[14px] py-3.5 text-sm font-bold transition-all active:scale-98"
              style={{
                background:"rgba(239,68,68,0.08)",
                color:"#dc2626",
                border:"1px solid rgba(239,68,68,0.2)",
                fontFamily:"Sora,sans-serif",
              }}>
              <LogOut size={16} /> Sign Out
            </button>
            <p className="text-center text-xs mt-3" style={{ color:"var(--text-3)" }}>
              {COLLEGE_NAME} · {COLLEGE_PLACE}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
