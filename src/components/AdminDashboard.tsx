import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { COLLEGE_WEBSITE } from "@/config/college";
import { Bell, FileText, Globe, Users, GraduationCap, Shield, Settings, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getCirculars } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";

const AdminDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [notices,   setNotices]   = useState<Notice[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);

  useEffect(() => {
    getNotifications().then(setNotices).catch(() => {});
    getCirculars().then(setCirculars).catch(() => {});
  }, []);

  const latestNotice   = notices[0];
  const latestCircular = circulars[0];

  const seenNotice    = localStorage.getItem("seen_notice");
  const seenCircular  = localStorage.getItem("seen_circular");
  const isNewNotice   = !!latestNotice   && latestNotice.id   !== seenNotice;
  const isNewCircular = !!latestCircular && latestCircular.id !== seenCircular;

  const designation = (user as any)?.designation || "Administrator";

  const panels = [
    { icon: <Bell          size={24} />, label: "Notifications", sub: "Manage notices",   isNew: isNewNotice,   color: "text-violet-600",  bg: "bg-violet-400/20",  onClick: () => navigate("/notifications"),            stagger: "card-stagger-1" },
    { icon: <FileText      size={24} />, label: "Circulars",     sub: "Manage circulars", isNew: isNewCircular, color: "text-fuchsia-600", bg: "bg-fuchsia-400/20", onClick: () => navigate("/circulars"),                 stagger: "card-stagger-2" },
    { icon: <Users         size={24} />, label: "Lecturers",     sub: "Faculty list",                           color: "text-blue-600",    bg: "bg-blue-400/20",    onClick: () => navigate("/admin/lecturers"),           stagger: "card-stagger-3" },
    { icon: <GraduationCap size={24} />, label: "Students",      sub: "Student list",                           color: "text-emerald-600", bg: "bg-emerald-400/20", onClick: () => navigate("/admin/students"),            stagger: "card-stagger-4" },
    { icon: <Globe         size={24} />, label: "Website",       sub: "College portal",                         color: "text-pink-600",    bg: "bg-pink-400/20",    onClick: () => window.open(COLLEGE_WEBSITE),          stagger: "card-stagger-5" },
    { icon: <BarChart3     size={24} />, label: "Reports",       sub: "Analytics",                              color: "text-amber-600",   bg: "bg-amber-400/20",   onClick: () => {},                                    stagger: "card-stagger-6" },
    { icon: <Bell          size={24} />, label: "Post Notice",   sub: "Send to all",                            color: "text-indigo-600",  bg: "bg-indigo-400/20",  onClick: () => navigate("/notifications"),            stagger: "card-stagger-1" },
    { icon: <Settings      size={24} />, label: "Settings",      sub: "System config",                          color: "text-slate-600",   bg: "bg-slate-400/20",   onClick: () => {},                                    stagger: "card-stagger-2" },
  ];

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-4xl p-4 md:p-6">

          <div className="mb-5 animate-fade-in-up">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Admin Panel 🛡️</h1>
            <p className="text-sm" style={muted}>{user?.name} · {designation}</p>
          </div>

          {/* Profile */}
          <GlassCard strong shimmer className="mb-5 card-stagger-1">
            <div className="flex items-center gap-4">
              <div className="icon-badge bg-violet-400/25 p-3"><Shield size={26} className="text-violet-600" /></div>
              <div>
                <p className="font-bold text-base" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{user?.name}</p>
                <p className="text-sm" style={muted}>{designation}</p>
              </div>
              <div className="ml-auto">
                <span className="badge badge-purple">Super Admin</span>
              </div>
            </div>
          </GlassCard>

          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <GlassCard onClick={() => navigate("/notifications")} className="card-stagger-2 relative">
              {isNewNotice && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <Bell size={13} className="text-violet-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Notice</p>
              </div>
              <p className="text-xs font-semibold line-clamp-2" style={txt}>{latestNotice?.title || "No notices"}</p>
            </GlassCard>

            <GlassCard onClick={() => navigate("/circulars")} className="card-stagger-3 relative">
              {isNewCircular && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <FileText size={13} className="text-fuchsia-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Circular</p>
              </div>
              <p className="text-xs font-semibold line-clamp-2" style={txt}>{latestCircular?.title || "No circulars"}</p>
            </GlassCard>
          </div>

          <p className="px-1 mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(260 30% 50%)" }}>Overview</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {panels.map((p, i) => (
              <div key={i} onClick={p.onClick} className={`glass-panel relative flex flex-col items-center justify-center text-center p-4 aspect-square ${p.stagger}`}>
                {p.isNew && (
                  <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                  </span>
                )}
                <div className={`icon-badge ${p.bg} mb-3`}><span className={p.color}>{p.icon}</span></div>
                <p className="text-sm font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{p.label}</p>
                <p className="text-[10px] mt-0.5" style={muted}>{p.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
