import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_WEBSITE } from "@/config/college";
import { Bell, FileText, Globe, Users, GraduationCap, Shield, Settings, BarChart3, ChevronRight, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getCirculars, getAllStudents, getAllLecturers } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";

const AdminDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [notices,    setNotices]    = useState<Notice[]>([]);
  const [circulars,  setCirculars]  = useState<Circular[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [lecturerCount,setLecturerCount]= useState(0);
  const [loading,    setLoading]    = useState(true);

  const now   = new Date();
  const hour  = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const designation = (user as any)?.designation || "Administrator";

  const seenNotice    = localStorage.getItem("seen_notice");
  const seenCircular  = localStorage.getItem("seen_circular");
  const isNewNotice   = !!notices[0]   && notices[0].id   !== seenNotice;
  const isNewCircular = !!circulars[0] && circulars[0].id !== seenCircular;

  useEffect(() => {
    Promise.all([
      getNotifications().then(d => { setNotices(d); if(d[0]) localStorage.setItem("seen_notice", d[0].id); }),
      getCirculars().then(d => { setCirculars(d); if(d[0]) localStorage.setItem("seen_circular", d[0].id); }),
      getAllStudents().then(d => setStudentCount(d.length)),
      getAllLecturers().then(d => setLecturerCount(d.length)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const stats = [
    { label:"Students",  value: loading ? "—" : studentCount,  color:"var(--navy)",   bg:"rgba(15,45,94,0.08)",  icon:<GraduationCap size={18}/> },
    { label:"Lecturers", value: loading ? "—" : lecturerCount, color:"var(--orange)", bg:"rgba(232,96,28,0.08)", icon:<Users size={18}/> },
    { label:"Notices",   value: loading ? "—" : notices.length, color:"#059669",      bg:"rgba(16,185,129,0.08)",icon:<Bell size={18}/> },
    { label:"Circulars", value: loading ? "—" : circulars.length,color:"#7c3aed",     bg:"rgba(139,92,246,0.08)",icon:<FileText size={18}/> },
  ];

  const panels = [
    { icon:<Bell size={22}/>,           label:"Notifications", sub:"Manage notices",   isNew:isNewNotice,   color:"var(--navy)",   bg:"rgba(15,45,94,0.1)",    onClick:()=>navigate("/notifications"),            stagger:"stagger-1" },
    { icon:<FileText size={22}/>,        label:"Circulars",     sub:"Manage circulars", isNew:isNewCircular, color:"var(--orange)", bg:"rgba(232,96,28,0.1)",   onClick:()=>navigate("/circulars"),                 stagger:"stagger-2" },
    { icon:<Users size={22}/>,           label:"Lecturers",     sub:"Faculty list",                          color:"#2563eb",       bg:"rgba(37,99,235,0.1)",   onClick:()=>navigate("/admin/lecturers"),           stagger:"stagger-3" },
    { icon:<GraduationCap size={22}/>,   label:"Students",      sub:"Student list",                          color:"#059669",       bg:"rgba(16,185,129,0.1)",  onClick:()=>navigate("/admin/students"),            stagger:"stagger-4" },
    { icon:<Globe size={22}/>,           label:"Website",       sub:"College portal",                        color:"var(--orange)", bg:"rgba(232,96,28,0.08)",  onClick:()=>window.open(COLLEGE_WEBSITE),          stagger:"stagger-5" },
    { icon:<Settings size={22}/>,        label:"Settings",      sub:"System config",                         color:"#475569",       bg:"rgba(100,116,139,0.1)", onClick:()=>{},                                    stagger:"stagger-6" },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">

          {/* Hero */}
          <div className="ndc-hero stagger-1">
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"Sora,sans-serif" }}>
                  {greet} 👋
                </p>
                <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily:"Sora,sans-serif" }}>
                  {user?.name?.split(" ").slice(0,2).join(" ") || "Admin"}
                </h1>
                <div className="flex items-center gap-2">
                  <span className="badge badge-orange text-xs">{designation}</span>
                  <span className="badge text-xs" style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)" }}>
                    🛡️ Super Admin
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"Sora,sans-serif" }}>
                  {now.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                </p>
                <p className="text-lg font-black text-white" style={{ fontFamily:"Sora,sans-serif" }}>
                  {now.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}
                </p>
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div>
            <p className="section-title mb-3 stagger-2">Overview</p>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <div key={s.label} className={`stat-card stagger-${i+2}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:s.bg }}>
                      <span style={{ color:s.color }}>{s.icon}</span>
                    </div>
                    <TrendingUp size={14} style={{ color:"var(--text-3)" }} />
                  </div>
                  <p className="text-3xl font-black mb-0.5" style={{ fontFamily:"Sora,sans-serif", color:s.color }}>
                    {loading ? <span className="h-6 w-10 rounded animate-pulse inline-block" style={{ background:"var(--bg-2)" }} /> : s.value}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--text-3)", fontFamily:"Sora,sans-serif" }}>
                    {s.label}
                  </p>
                  <div className="progress-bar mt-2">
                    <div className="progress-fill" style={{ width:"70%", background:`linear-gradient(90deg, ${s.color}, ${s.color}aa)` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick panels */}
          <div>
            <p className="section-title mb-3 stagger-3">Management</p>
            <div className="grid grid-cols-3 gap-3">
              {panels.map(p => (
                <div key={p.label} onClick={p.onClick} className={`action-panel relative ${p.stagger}`}>
                  {p.isNew && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5 z-10">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
                    </span>
                  )}
                  <div className="p-icon" style={{ background:p.bg }}>
                    <span style={{ color:p.color }}>{p.icon}</span>
                  </div>
                  <p className="p-value" style={{ color:p.color }}>{p.label}</p>
                  <p className="p-label">{p.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Notice board */}
          <div className="stagger-4">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Notice Board</p>
              <button onClick={() => navigate("/notifications")}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color:"var(--orange)", fontFamily:"Sora,sans-serif" }}>
                View All <ChevronRight size={13} />
              </button>
            </div>
            <div className="ndc-card">
              <div className="divide-y" style={{ '--tw-divide-opacity':1, borderColor:"var(--bg-2)" } as any}>
                {notices.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={28} className="mx-auto mb-2 opacity-30" style={{ color:"var(--navy)" }} />
                    <p className="text-sm font-semibold" style={{ color:"var(--text-2)" }}>No notices posted yet</p>
                    <button onClick={() => navigate("/notifications")} className="btn-orange mt-3 text-xs px-4 py-2" style={{ width:"auto" }}>
                      Post First Notice
                    </button>
                  </div>
                ) : notices.slice(0, 4).map((n, i) => (
                  <div key={n.id} className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate("/notifications")}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background:"rgba(232,96,28,0.1)" }}>
                      <Bell size={14} style={{ color:"var(--orange)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold line-clamp-1" style={{ color:"var(--text-1)" }}>{n.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color:"var(--text-3)" }}>{n.content}</p>
                    </div>
                    <ChevronRight size={14} style={{ color:"var(--text-3)", shrink:0, marginTop:4 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick post notice */}
          <div className="stagger-5">
            <button onClick={() => navigate("/notifications")} className="btn-orange w-full">
              <Bell size={15} /> Post New Notification
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
