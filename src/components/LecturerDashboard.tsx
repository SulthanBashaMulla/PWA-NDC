import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { COLLEGE_WEBSITE } from "@/config/college";
import { Calendar, BookOpen, Bell, FileText, Globe, User, MoreHorizontal, GraduationCap } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getCirculars } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";

const LecturerDashboard = () => {
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
  const isIncharge     = (user as any)?.isIncharge;
  const group          = (user as any)?.group   || "";
  const section        = (user as any)?.section || "";
  const department     = (user as any)?.department || "";
  const designation    = (user as any)?.designation || "Lecturer";
  const inchargeLabel  = isIncharge ? `Incharge: ${group} — Sec ${section}` : "General Faculty";

  const panels = [
    { icon: <Bell          size={22} />, label: "Notifications", sub: latestNotice?.title   || "No new",          color: "text-violet-600",  bg: "bg-violet-400/20",  onClick: () => navigate("/notifications"),            stagger: "card-stagger-1" },
    { icon: <FileText      size={22} />, label: "Circulars",     sub: latestCircular?.title || "No new",          color: "text-fuchsia-600", bg: "bg-fuchsia-400/20", onClick: () => navigate("/circulars"),                 stagger: "card-stagger-2" },
    { icon: <Calendar      size={22} />, label: "Attendance",    sub: isIncharge ? "Manage" : "View",             color: "text-blue-600",    bg: "bg-blue-400/20",    onClick: () => navigate("/attendance"),                stagger: "card-stagger-3" },
    { icon: <BookOpen      size={22} />, label: "Marks",         sub: isIncharge ? "Manage" : "View",             color: "text-pink-600",    bg: "bg-pink-400/20",    onClick: () => navigate("/marks"),                     stagger: "card-stagger-4" },
    { icon: <Globe         size={22} />, label: "Website",       sub: "College portal",                           color: "text-emerald-600", bg: "bg-emerald-400/20", onClick: () => window.open(COLLEGE_WEBSITE, "_blank"), stagger: "card-stagger-5" },
    { icon: <GraduationCap size={22} />, label: "Students",      sub: "Class list",                               color: "text-amber-600",   bg: "bg-amber-400/20",   onClick: () => navigate("/admin/students"),            stagger: "card-stagger-6" },
    { icon: <User          size={22} />, label: "Profile",       sub: "My details",                               color: "text-indigo-600",  bg: "bg-indigo-400/20",  onClick: () => {},                                     stagger: "card-stagger-1" },
    { icon: <MoreHorizontal size={22}/>, label: "More",          sub: "Settings",                                 color: "text-slate-500",   bg: "bg-slate-400/20",   onClick: () => {},                                     stagger: "card-stagger-2" },
  ];

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-5xl p-4 md:p-6">

          <div className="mb-5 animate-fade-in-up">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
              Welcome, {(user?.name || "Lecturer").split(" ")[0]} 👋
            </h1>
            <p className="text-sm" style={muted}>{inchargeLabel}</p>
          </div>

          {/* Profile + info row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            <GlassCard strong shimmer className="card-stagger-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="icon-badge bg-violet-400/25"><User size={22} className="text-violet-600" /></div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{user?.name}</p>
                  <p className="text-[11px]" style={muted}>{designation}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[["Department", department], ["Role", inchargeLabel]].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={muted}>{k}</span>
                    <span className="font-semibold text-right max-w-[58%] truncate" style={txt}>{v}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard onClick={() => navigate("/notifications")} className="card-stagger-2">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={13} className="text-blue-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Notice</p>
              </div>
              <p className="text-xs font-semibold line-clamp-3" style={txt}>{latestNotice?.title || "No notices yet"}</p>
            </GlassCard>

            <GlassCard onClick={() => navigate("/circulars")} className="card-stagger-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={13} className="text-fuchsia-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Circular</p>
              </div>
              <p className="text-xs font-semibold line-clamp-3" style={txt}>{latestCircular?.title || "No circulars yet"}</p>
            </GlassCard>
          </div>

          <p className="px-1 mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(260 30% 50%)" }}>Quick Access</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {panels.map(p => (
              <div key={p.label} onClick={p.onClick} className={`glass-panel flex flex-col items-center justify-center text-center p-4 aspect-square ${p.stagger}`}>
                <div className={`icon-badge ${p.bg} mb-2.5`}><span className={p.color}>{p.icon}</span></div>
                <p className="text-sm font-bold leading-tight" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{p.label}</p>
                <p className="text-[10px] mt-0.5 line-clamp-1" style={muted}>{p.sub}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
