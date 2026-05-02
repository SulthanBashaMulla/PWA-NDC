import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { COLLEGE_WEBSITE, SEMESTERS, MONTHS, getSheetUrls } from "@/config/college";
import { Bell, FileText, Globe, TrendingUp, BookOpen, Calendar, User, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { getNotifications, getCirculars } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";
import { getTodayName } from "@/firebase/timetable";
import { useDayTimetable } from "@/hooks/useTimetable";
import Papa from "papaparse";

interface ARow { RollNo:string; Month:string; Semester:string; DaysPresent:string; TotalDays:string; Percentage:string; }
interface MRow { RollNo:string; Semester:string; Subject:string; Mid1:string; Mid2:string; }

const StudentDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const rollNo      = (user as any)?.rollNo  || "";
  const group       = (user as any)?.group   || "";
  const section     = (user as any)?.section || "";
  const [semester, setSemester] = useState((user as any)?.semester || 3);
  const [month,    setMonth]    = useState("June");
  const [tab,      setTab]      = useState<"marks"|"attendance">("marks");
  const [notices,  setNotices]  = useState<Notice[]>([]);
  const [circulars,setCirculars]= useState<Circular[]>([]);
  const [attendance,setAtt]     = useState<ARow[]>([]);
  const [marks,    setMarks]    = useState<MRow[]>([]);
  const [loading,  setLoading]  = useState(true);

  const now       = new Date();
  const hour      = now.getHours();
  const greet     = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const todayName = getTodayName();

  // Today's timetable (real-time)
  const { data: todayTT, loading: ttLoading } = useDayTimetable(
    group || undefined, section || undefined, todayName
  );

  const todaySlots = [
    ...(todayTT?.foreNoon  ?? []).map(s => ({ ...s, session:"FN" })),
    ...(todayTT?.afterNoon ?? []).map(s => ({ ...s, session:"AN" })),
  ];

  useEffect(() => {
    getNotifications().then(setNotices).catch(() => {});
    getCirculars().then(setCirculars).catch(() => {});
  }, []);

  useEffect(() => {
    if (!group || !section) { setLoading(false); return; }
    setLoading(true);
    const urls = getSheetUrls(group, section);
    Promise.all([
      fetch(urls.attendance).then(r=>r.text()).then(csv=>setAtt(Papa.parse<ARow>(csv,{header:true,skipEmptyLines:true}).data)),
      fetch(urls.marks).then(r=>r.text()).then(csv=>setMarks(Papa.parse<MRow>(csv,{header:true,skipEmptyLines:true}).data)),
    ]).catch(()=>{}).finally(()=>setLoading(false));
  }, [group, section]);

  const myAtt    = useMemo(()=>attendance.filter(a=>a.RollNo===rollNo),[attendance,rollNo]);
  const myMarks  = useMemo(()=>marks.filter(m=>m.RollNo===rollNo&&m.Semester===String(semester)),[marks,rollNo,semester]);
  const monthAtt = useMemo(()=>myAtt.filter(a=>a.Month===month&&a.Semester===String(semester)),[myAtt,month,semester]);

  const overallPct = useMemo(()=>{
    if(!myAtt.length) return 0;
    const p=myAtt.reduce((s,a)=>s+Number(a.DaysPresent),0);
    const t=myAtt.reduce((s,a)=>s+Number(a.TotalDays),0);
    return t>0?Math.round((p/t)*1000)/10:0;
  },[myAtt]);

  const pctColor = (p:number) => p>=75?"#059669":p>=60?"#d97706":"#dc2626";
  const pctBg    = (p:number) => p>=75?"rgba(16,185,129,0.1)":p>=60?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.1)";

  const panels = [
    { icon:<TrendingUp size={20}/>, label:"Attendance", value:`${overallPct}%`,      color:"var(--navy)",   bg:"rgba(15,45,94,0.1)",    onClick:()=>setTab("attendance"), stagger:"stagger-1" },
    { icon:<BookOpen   size={20}/>, label:"Marks",      value:`Sem ${semester}`,      color:"var(--orange)", bg:"rgba(232,96,28,0.1)",   onClick:()=>setTab("marks"),      stagger:"stagger-2" },
    { icon:<Calendar   size={20}/>, label:"Timetable",  value:"Today",                color:"#059669",       bg:"rgba(16,185,129,0.1)",  onClick:()=>navigate("/timetable"), stagger:"stagger-3" },
    { icon:<Bell       size={20}/>, label:"Notices",    value:`${notices.length}`,    color:"#2563eb",       bg:"rgba(37,99,235,0.1)",   onClick:()=>navigate("/notifications"), stagger:"stagger-4" },
    { icon:<Globe      size={20}/>, label:"Website",    value:"Visit",                color:"var(--orange)", bg:"rgba(232,96,28,0.08)",  onClick:()=>window.open(COLLEGE_WEBSITE,"_blank"), stagger:"stagger-5" },
    { icon:<FileText   size={20}/>, label:"Circulars",  value:`${circulars.length}`,  color:"#7c3aed",       bg:"rgba(139,92,246,0.1)",  onClick:()=>navigate("/circulars"), stagger:"stagger-6" },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 space-y-4 pb-8">

          {/* Hero banner */}
          <div className="ndc-hero stagger-1">
            <div className="relative z-10">
              <p className="text-xs font-semibold mb-1" style={{ color:"rgba(255,255,255,0.6)", fontFamily:"Sora,sans-serif" }}>
                {greet} 👋
              </p>
              <h1 className="text-xl font-bold text-white leading-tight mb-1" style={{ fontFamily:"Sora,sans-serif" }}>
                {user?.name?.split(" ")[0] || "Student"}
              </h1>
              <p className="text-xs mb-3" style={{ color:"rgba(255,255,255,0.55)" }}>
                {group} · Section {section} · Roll {rollNo}
              </p>
              {/* Attendance bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color:"rgba(255,255,255,0.6)" }}>Overall Attendance</span>
                    <span className="font-bold" style={{ color: overallPct>=75?"#6ee7b7":overallPct>=60?"#fcd34d":"#fca5a5" }}>
                      {overallPct}%
                    </span>
                  </div>
                  <div className="progress-bar" style={{ background:"rgba(255,255,255,0.12)" }}>
                    <div className="progress-fill" style={{
                      width:`${Math.min(overallPct,100)}%`,
                      background: overallPct>=75 ? "linear-gradient(90deg,#059669,#34d399)" :
                                  overallPct>=60 ? "linear-gradient(90deg,#d97706,#fbbf24)" :
                                                   "linear-gradient(90deg,#dc2626,#f87171)"
                    }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color: overallPct>=75?"#6ee7b7":overallPct>=60?"#fcd34d":"#fca5a5" }}>
                    {overallPct}%
                  </p>
                  <p className="text-[10px]" style={{ color:"rgba(255,255,255,0.5)" }}>Attendance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Today's timetable */}
          <div className="stagger-2">
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Today — {todayName}</p>
              <button onClick={() => navigate("/timetable")}
                className="flex items-center gap-1 text-xs font-bold"
                style={{ color:"var(--orange)", fontFamily:"Sora,sans-serif" }}>
                Full Timetable <ChevronRight size={13} />
              </button>
            </div>
            <div className="ndc-card">
              {ttLoading ? (
                <div className="p-4 space-y-2">
                  {[1,2,3].map(i=><div key={i} className="h-10 rounded-xl animate-pulse" style={{ background:"var(--bg-2)" }} />)}
                </div>
              ) : todaySlots.length === 0 ? (
                <div className="p-5 text-center">
                  <Clock size={22} className="mx-auto mb-2 opacity-30" style={{ color:"var(--navy)" }} />
                  <p className="text-sm" style={{ color:"var(--text-3)" }}>No classes today</p>
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor:"var(--bg-2)" }}>
                  {todaySlots.slice(0,4).map((slot, i) => (
                    <div key={slot.id} className="flex items-center gap-3 p-3">
                      <div className="w-16 text-center shrink-0">
                        <p className="text-xs font-bold" style={{ color:"var(--navy)" }}>{slot.startTime}</p>
                        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{slot.endTime}</p>
                        <span className="badge text-[9px] mt-0.5"
                          style={{ background: slot.session==="FN"?"rgba(15,45,94,0.1)":"rgba(232,96,28,0.1)", color: slot.session==="FN"?"var(--navy)":"var(--orange)" }}>
                          {slot.session}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold line-clamp-1" style={{ color:"var(--navy)", fontFamily:"Sora,sans-serif" }}>
                          {slot.subjectName}
                        </p>
                        <p className="text-xs" style={{ color:"var(--text-3)" }}>{slot.lecturerName}</p>
                      </div>
                    </div>
                  ))}
                  {todaySlots.length > 4 && (
                    <div className="p-2 text-center">
                      <button onClick={() => navigate("/timetable")} className="text-xs font-bold" style={{ color:"var(--orange)" }}>
                        +{todaySlots.length-4} more periods
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick panels 2×3 */}
          <div>
            <p className="section-title mb-3 stagger-3">Quick Access</p>
            <div className="grid grid-cols-3 gap-3">
              {panels.map(p=>(
                <div key={p.label} onClick={p.onClick} className={`action-panel ${p.stagger}`}>
                  <div className="p-icon mb-1" style={{ background:p.bg }}>
                    <span style={{ color:p.color }}>{p.icon}</span>
                  </div>
                  <p className="p-value" style={{ color:p.color }}>{p.value}</p>
                  <p className="p-label">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Latest notices */}
          <div className="grid grid-cols-2 gap-3 stagger-4">
            <div className="ndc-card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate("/notifications")}>
              <div className="ndc-card-header"><h3>Notice</h3><Bell size={13} className="text-orange-300" /></div>
              <div className="p-3">
                <p className="text-xs font-semibold line-clamp-2" style={{ color:"var(--text-1)" }}>
                  {notices[0]?.title || "No notices yet"}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px]" style={{ color:"var(--orange)" }}>View all</span>
                  <ChevronRight size={10} style={{ color:"var(--orange)" }} />
                </div>
              </div>
            </div>
            <div className="ndc-card cursor-pointer hover:shadow-md transition-shadow" onClick={()=>navigate("/circulars")}>
              <div className="ndc-card-header"><h3>Circular</h3><FileText size={13} className="text-orange-300" /></div>
              <div className="p-3">
                <p className="text-xs font-semibold line-clamp-2" style={{ color:"var(--text-1)" }}>
                  {circulars[0]?.title || "No circulars yet"}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-[10px]" style={{ color:"var(--orange)" }}>View all</span>
                  <ChevronRight size={10} style={{ color:"var(--orange)" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Marks / Attendance tabs */}
          <div className="ndc-card stagger-5">
            <div className="p-4">
              <div className="ndc-tabs mb-4">
                <button className={`ndc-tab ${tab==="marks"?"active":""}`} onClick={()=>setTab("marks")}>📊 Marks</button>
                <button className={`ndc-tab ${tab==="attendance"?"active":""}`} onClick={()=>setTab("attendance")}>📅 Attendance</button>
              </div>
              <div className="flex gap-2 mb-4">
                <select value={semester} onChange={e=>setSemester(Number(e.target.value))}
                  className="ndc-input text-sm" style={{ padding:"8px 10px" }}>
                  {SEMESTERS.map(s=><option key={s} value={s}>Sem {s}</option>)}
                </select>
                {tab==="attendance" && (
                  <select value={month} onChange={e=>setMonth(e.target.value)}
                    className="ndc-input text-sm" style={{ padding:"8px 10px" }}>
                    {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                  </select>
                )}
              </div>
              {loading ? (
                <div className="flex flex-col gap-2">
                  {[1,2,3].map(i=><div key={i} className="h-10 rounded-lg animate-pulse" style={{ background:"var(--bg-2)" }} />)}
                </div>
              ) : tab==="marks" ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                      <th className="text-left pb-2">Subject</th>
                      <th className="text-center pb-2">Mid-1</th>
                      <th className="text-center pb-2">Mid-2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myMarks.length===0
                      ? <tr><td colSpan={3} className="py-8 text-center text-sm" style={{ color:"var(--text-3)" }}>No marks for Sem {semester}</td></tr>
                      : myMarks.map((m,i)=>{
                        const c1 = Number(m.Mid1)>=16?"#059669":Number(m.Mid1)>=12?"#d97706":"#dc2626";
                        const c2 = Number(m.Mid2)>=16?"#059669":Number(m.Mid2)>=12?"#d97706":"#dc2626";
                        return (
                          <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                            <td className="py-2.5 pr-3 text-sm">{m.Subject}</td>
                            <td className="py-2.5 text-center">
                              <span className="badge text-xs font-bold" style={{ background:`${c1}18`, color:c1 }}>{m.Mid1}</span>
                            </td>
                            <td className="py-2.5 text-center">
                              <span className="badge text-xs font-bold" style={{ background:`${c2}18`, color:c2 }}>{m.Mid2}</span>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                      <th className="text-left pb-2">Month</th>
                      <th className="text-center pb-2">Present</th>
                      <th className="text-center pb-2">Total</th>
                      <th className="text-center pb-2">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthAtt.length===0
                      ? <tr><td colSpan={4} className="py-8 text-center text-sm" style={{ color:"var(--text-3)" }}>No data for {month}</td></tr>
                      : monthAtt.map((a,i)=>{
                        const p=Number(a.Percentage);
                        return (
                          <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                            <td className="py-2.5 text-sm">{a.Month}</td>
                            <td className="py-2.5 text-center text-sm">{a.DaysPresent}</td>
                            <td className="py-2.5 text-center text-sm">{a.TotalDays}</td>
                            <td className="py-2.5 text-center">
                              <span className="badge text-xs font-bold" style={{ background:pctBg(p), color:pctColor(p) }}>
                                {a.Percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
