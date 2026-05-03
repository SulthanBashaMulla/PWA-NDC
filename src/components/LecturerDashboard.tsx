import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_WEBSITE } from "@/config/college";
import { Bell, Globe, Calendar, BookOpen, GraduationCap, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getNotifications, getStudentsByClass } from "@/firebase/firestore";
import type { Notice } from "@/firebase/firestore";
import { getTodayName } from "@/firebase/timetable";
import { useDayTimetable } from "@/hooks/useTimetable";

const LecturerDashboard = () => {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [notices,  setNotices]  = useState<Notice[]>([]);
  const [stuCount, setStuCount] = useState<number | null>(null);

  const isIncharge  = (user as any)?.isIncharge || false;
  const group       = (user as any)?.group       || "";
  const section     = (user as any)?.section     || "";
  const department  = (user as any)?.department  || "";
  const designation = (user as any)?.designation || "Lecturer";
  const lecturerId  = (user as any)?.lecturerId  || "";
  const todayName   = getTodayName();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hour  = now.getHours();
  const greet = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  // Today's timetable
  const { data: todayTT, loading: ttLoading } = useDayTimetable(
    group || undefined, section || undefined, todayName
  );

  // All slots for today — filter by lecturer if not incharge
  const allFN = todayTT?.foreNoon  ?? [];
  const allAN = todayTT?.afterNoon ?? [];
  const fnSlots = isIncharge ? allFN : allFN.filter(s => s.lecturerId === lecturerId);
  const anSlots = isIncharge ? allAN : allAN.filter(s => s.lecturerId === lecturerId);
  const totalSlots = fnSlots.length + anSlots.length;

  useEffect(() => {
    getNotifications().then(setNotices).catch(() => {});
    if (isIncharge && group && section) {
      getStudentsByClass(group, section).then(d => setStuCount(d.length)).catch(() => {});
    }
  }, [isIncharge, group, section]);

  const panels = [
    { icon:<Bell size={20}/>,         label:"Notifications", value:`${notices.length}`,        bg:"rgba(15,45,94,0.1)",   color:"var(--navy)",   onClick:()=>navigate("/notifications"),           stagger:"stagger-1" },
    { icon:<Calendar size={20}/>,      label:"Attendance",    value:isIncharge?"Manage":"View",  bg:"rgba(16,185,129,0.1)", color:"#059669",       onClick:()=>navigate("/attendance"),              stagger:"stagger-2" },
    { icon:<BookOpen size={20}/>,      label:"Marks",         value:isIncharge?"Manage":"View",  bg:"rgba(139,92,246,0.1)", color:"#7c3aed",       onClick:()=>navigate("/marks"),                   stagger:"stagger-3" },
    { icon:<GraduationCap size={20}/>, label:"Students",      value:"List",                      bg:"rgba(245,158,11,0.1)", color:"#d97706",       onClick:()=>navigate("/admin/students"),          stagger:"stagger-4" },
    { icon:<Globe size={20}/>,         label:"Website",       value:"Visit",                     bg:"rgba(232,96,28,0.08)", color:"var(--orange)", onClick:()=>window.open(COLLEGE_WEBSITE,"_blank"), stagger:"stagger-5" },
    { icon:<Bell size={20}/>,          label:"Timetable",     value:"Full",                      bg:"rgba(15,45,94,0.08)",  color:"var(--navy)",   onClick:()=>navigate("/timetable"),               stagger:"stagger-6" },
  ];

  const SlotRow = ({ slot, session }: { slot: any; session: "FN"|"AN" }) => (
    <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor:"var(--bg-2)" }}>
      <div className="w-16 text-center shrink-0">
        <p className="text-xs font-bold" style={{ color:"var(--navy)" }}>{slot.startTime}</p>
        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{slot.endTime}</p>
        <span className="badge text-[9px] mt-0.5"
          style={{
            background: session==="FN"?"rgba(15,45,94,0.1)":"rgba(232,96,28,0.1)",
            color:      session==="FN"?"var(--navy)":"var(--orange)",
          }}>
          {session}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold line-clamp-1" style={{ color:"var(--navy)", fontFamily:"Sora,sans-serif" }}>
          {slot.subjectName}
        </p>
        {isIncharge && (
          <p className="text-xs" style={{ color:"var(--orange)" }}>{slot.lecturerName}</p>
        )}
        {slot.notes && <p className="text-xs italic" style={{ color:"var(--text-3)" }}>{slot.notes}</p>}
      </div>
      {slot.room && <span className="badge badge-gray text-[10px] shrink-0">🏫 {slot.room}</span>}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">

          {/* ── Hero with date+time same as admin ── */}
          <div className="ndc-hero stagger-1">
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"Sora,sans-serif" }}>
                  {greet} 👋
                </p>
                <h1 className="text-xl font-bold text-white mb-1" style={{ fontFamily:"Sora,sans-serif" }}>
                  {user?.name?.split(" ").slice(0,2).join(" ") || "Lecturer"}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-orange text-xs">{designation}</span>
                  <span className="badge text-xs" style={{ background:"rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.8)" }}>
                    {department}
                  </span>
                  {isIncharge && (
                    <span className="badge text-xs" style={{ background:"rgba(232,96,28,0.25)", color:"#f07840" }}>
                      📋 Incharge: {group}-{section}
                    </span>
                  )}
                </div>
              </div>

              {/* Date + Time — same layout as admin */}
              <div className="text-right ml-4 shrink-0">
                <p className="text-xs" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"Sora,sans-serif" }}>
                  {now.toLocaleDateString("en-IN",{ weekday:"short", day:"numeric", month:"short" })}
                </p>
                <p className="text-lg font-black text-white" style={{ fontFamily:"Sora,sans-serif" }}>
                  {now.toLocaleTimeString("en-IN",{ hour:"2-digit", minute:"2-digit" })}
                </p>
                <p className="text-xs mt-0.5" style={{ color:"rgba(255,255,255,0.5)" }}>
                  Today: {todayName}
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 stagger-2">
            <div className="stat-card text-center">
              <p className="text-2xl font-black mb-0.5" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                {notices.length}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Notices</p>
            </div>
            <div className="stat-card text-center">
              <p className="text-2xl font-black mb-0.5" style={{ fontFamily:"Sora,sans-serif", color:"var(--orange)" }}>
                {totalSlots}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>
                {isIncharge ? "Periods Today" : "My Periods"}
              </p>
            </div>
            <div className="stat-card text-center cursor-pointer"
              onClick={() => isIncharge && navigate("/admin/students")}>
              <p className="text-2xl font-black mb-0.5" style={{ fontFamily:"Sora,sans-serif", color:"#059669" }}>
                {isIncharge ? (stuCount ?? "—") : "—"}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>
                {isIncharge ? "Students" : "General"}
              </p>
            </div>
          </div>

          {/* ── Today's timetable — ALL slots ── */}
          <div className="stagger-3">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">My Schedule — {todayName}</p>
              <button onClick={() => navigate("/timetable")}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color:"var(--orange)", fontFamily:"Sora,sans-serif" }}>
                Full <ChevronRight size={13} />
              </button>
            </div>
            <div className="ndc-card">
              {ttLoading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map(i=><div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:"var(--bg-2)" }} />)}
                </div>
              ) : totalSlots === 0 ? (
                <div className="p-6 text-center">
                  <Clock size={24} className="mx-auto mb-2 opacity-30" style={{ color:"var(--navy)" }} />
                  <p className="text-sm" style={{ color:"var(--text-3)" }}>
                    {group && section ? "No periods assigned today" : "No class assigned"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Fore Noon */}
                  {fnSlots.length > 0 && (
                    <>
                      <div className="px-4 py-2" style={{ background:"rgba(15,45,94,0.04)", borderBottom:"1px solid var(--bg-2)" }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--navy)" }}>☀️ Fore Noon</span>
                      </div>
                      {fnSlots.map(s => <SlotRow key={s.id} slot={s} session="FN" />)}
                    </>
                  )}
                  {/* After Noon */}
                  {anSlots.length > 0 && (
                    <>
                      <div className="px-4 py-2" style={{ background:"rgba(232,96,28,0.04)", borderBottom:"1px solid var(--bg-2)" }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--orange)" }}>🌤 After Noon</span>
                      </div>
                      {anSlots.map(s => <SlotRow key={s.id} slot={s} session="AN" />)}
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Quick panels — no circulars */}
          <div>
            <p className="section-title mb-3 stagger-4">Quick Access</p>
            <div className="grid grid-cols-3 gap-3">
              {panels.map(p => (
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

          {/* Latest notice only — no circulars */}
          <div className="stagger-5">
            <p className="section-title mb-3">Latest Updates</p>
            <div className="space-y-2">
              {notices.slice(0,3).map((n, i) => (
                <div key={n.id} className="notice-item" onClick={() => navigate("/notifications")}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="badge badge-navy text-[10px] mb-1">Notice</span>
                      <p className="text-sm font-semibold line-clamp-1" style={{ color:"var(--text-1)" }}>
                        {n.title}
                      </p>
                    </div>
                    <ChevronRight size={14} style={{ color:"var(--text-3)", flexShrink:0, marginTop:2 }} />
                  </div>
                </div>
              ))}
              {notices.length === 0 && (
                <div className="text-center py-6 rounded-xl" style={{ background:"var(--surface-2)" }}>
                  <p className="text-sm" style={{ color:"var(--text-3)" }}>No notices yet</p>
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
