import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_WEBSITE } from "@/config/college";
import { Bell, FileText, Globe, Calendar, BookOpen, Users, GraduationCap, ChevronRight, User } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getCirculars } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";

const LecturerDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [notices,   setNotices]   = useState<Notice[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);

  const isIncharge  = (user as any)?.isIncharge;
  const group       = (user as any)?.group       || "";
  const section     = (user as any)?.section     || "";
  const department  = (user as any)?.department  || "";
  const designation = (user as any)?.designation || "Lecturer";

  const now   = new Date();
  const hour  = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  useEffect(() => {
    getNotifications().then(setNotices).catch(() => {});
    getCirculars().then(setCirculars).catch(() => {});
  }, []);

  const panels = [
    { icon:<Bell size={20}/>,          label:"Notifications", value:`${notices.length}`,   bg:"rgba(15,45,94,0.1)",   color:"var(--navy)",   onClick:()=>navigate("/notifications"),            stagger:"stagger-1" },
    { icon:<FileText size={20}/>,       label:"Circulars",     value:`${circulars.length}`, bg:"rgba(232,96,28,0.1)", color:"var(--orange)", onClick:()=>navigate("/circulars"),                 stagger:"stagger-2" },
    { icon:<Calendar size={20}/>,       label:"Attendance",    value:isIncharge?"Manage":"View", bg:"rgba(16,185,129,0.1)", color:"#059669",  onClick:()=>navigate("/attendance"),                stagger:"stagger-3" },
    { icon:<BookOpen size={20}/>,       label:"Marks",         value:isIncharge?"Manage":"View", bg:"rgba(139,92,246,0.1)",color:"#7c3aed",   onClick:()=>navigate("/marks"),                     stagger:"stagger-4" },
    { icon:<GraduationCap size={20}/>,  label:"Students",      value:"List",                bg:"rgba(245,158,11,0.1)", color:"#d97706",       onClick:()=>navigate("/admin/students"),            stagger:"stagger-5" },
    { icon:<Globe size={20}/>,          label:"Website",       value:"Visit",               bg:"rgba(232,96,28,0.08)",color:"var(--orange)",  onClick:()=>window.open(COLLEGE_WEBSITE,"_blank"), stagger:"stagger-6" },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">

          {/* Hero */}
          <div className="ndc-hero stagger-1">
            <div className="relative z-10">
              <p className="text-xs font-semibold mb-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"Sora,sans-serif" }}>
                {greet} 👋
              </p>
              <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily:"Sora,sans-serif" }}>
                {user?.name?.split(" ").slice(0,2).join(" ") || "Lecturer"}
              </h1>
              <div className="flex flex-wrap gap-2">
                <span className="badge badge-orange text-xs">{designation}</span>
                <span className="badge" style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)", fontSize:"11px" }}>
                  {department}
                </span>
                {isIncharge && (
                  <span className="badge" style={{ background:"rgba(232,96,28,0.25)", color:"#f07840", fontSize:"11px" }}>
                    📋 Incharge: {group}-{section}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 stagger-2">
            {[
              { label:"Notices",   value:notices.length,   color:"var(--navy)",   bg:"rgba(15,45,94,0.08)"   },
              { label:"Circulars", value:circulars.length, color:"var(--orange)", bg:"rgba(232,96,28,0.08)" },
              { label:"Semester",  value:"Active",          color:"#059669",       bg:"rgba(16,185,129,0.08)" },
            ].map(s=>(
              <div key={s.label} className="stat-card text-center">
                <p className="text-2xl font-black mb-0.5" style={{ fontFamily:"Sora,sans-serif", color:s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Quick action panels */}
          <div>
            <p className="section-title mb-3 stagger-3">Quick Access</p>
            <div className="grid grid-cols-3 gap-3">
              {panels.map(p=>(
                <div key={p.label} onClick={p.onClick} className={`action-panel ${p.stagger}`}>
                  <div className="p-icon" style={{ background:p.bg }}>
                    <span style={{ color:p.color }}>{p.icon}</span>
                  </div>
                  <p className="p-value" style={{ color:p.color }}>{p.value}</p>
                  <p className="p-label">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Latest notice + circular */}
          <div className="stagger-4">
            <p className="section-title mb-3">Latest Updates</p>
            <div className="space-y-2">
              {notices.slice(0,2).map((n,i)=>(
                <div key={n.id} className="notice-item" onClick={()=>navigate("/notifications")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="badge badge-navy text-[10px]">Notice</span>
                      </div>
                      <p className="text-sm font-semibold line-clamp-1" style={{ color:"var(--text-1)" }}>{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color:"var(--text-3)" }}>{n.content}</p>
                    </div>
                    <ChevronRight size={14} style={{ color:"var(--text-3)", flexShrink:0, marginTop:2 }} />
                  </div>
                </div>
              ))}
              {circulars.slice(0,1).map((c,i)=>(
                <div key={c.id} className="notice-item" onClick={()=>navigate("/circulars")}
                  style={{ borderLeftColor:"var(--navy)" }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="badge badge-orange text-[10px]">Circular</span>
                      </div>
                      <p className="text-sm font-semibold line-clamp-1" style={{ color:"var(--text-1)" }}>{c.title}</p>
                    </div>
                    <ChevronRight size={14} style={{ color:"var(--text-3)", flexShrink:0, marginTop:2 }} />
                  </div>
                </div>
              ))}
              {notices.length===0&&circulars.length===0 && (
                <div className="text-center py-6 rounded-xl" style={{ background:"var(--surface-2)" }}>
                  <p className="text-sm" style={{ color:"var(--text-3)" }}>No updates yet</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
