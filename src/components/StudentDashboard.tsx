import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { COLLEGE_WEBSITE, SEMESTERS, MONTHS } from "@/config/college";
import { BookOpen, Calendar, Bell, FileText, Globe, TrendingUp, User } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { getNotifications, getCirculars } from "@/firebase/firestore";
import type { Notice, Circular } from "@/firebase/firestore";
import { getSheetUrls } from "@/config/college";
import Papa from "papaparse";

interface AttendanceRow { RollNo: string; Month: string; Semester: string; DaysPresent: string; TotalDays: string; Percentage: string; }
interface MarksRow      { RollNo: string; Semester: string; Subject: string; Mid1: string; Mid2: string; }

const StudentDashboard = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const [semester,  setSemester]  = useState((user as any)?.semester || 3);
  const [month,     setMonth]     = useState("June");
  const [tab,       setTab]       = useState<"marks" | "attendance">("marks");
  const [notices,   setNotices]   = useState<Notice[]>([]);
  const [circulars, setCirculars] = useState<Circular[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [marks,      setMarks]      = useState<MarksRow[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const rollNo  = (user as any)?.rollNo  || "";
  const group   = (user as any)?.group   || "";
  const section = (user as any)?.section || "";

  // Load Firestore notices & circulars
  useEffect(() => {
    getNotifications().then(setNotices).catch(() => {});
    getCirculars().then(setCirculars).catch(() => {});
  }, []);

  // Load Google Sheets attendance & marks via CSV
  useEffect(() => {
    if (!group || !section) { setDataLoading(false); return; }
    const urls = getSheetUrls(group, section);
    setDataLoading(true);

    Promise.all([
      fetch(urls.attendance).then(r => r.text()).then(csv => {
        const result = Papa.parse<AttendanceRow>(csv, { header: true, skipEmptyLines: true });
        setAttendance(result.data);
      }),
      fetch(urls.marks).then(r => r.text()).then(csv => {
        const result = Papa.parse<MarksRow>(csv, { header: true, skipEmptyLines: true });
        setMarks(result.data);
      }),
    ])
    .catch(() => {})
    .finally(() => setDataLoading(false));
  }, [group, section]);

  const myAttendance    = useMemo(() => attendance.filter(a => a.RollNo === rollNo), [attendance, rollNo]);
  const myMarks         = useMemo(() => marks.filter(m => m.RollNo === rollNo && m.Semester === String(semester)), [marks, rollNo, semester]);
  const monthAttendance = useMemo(() => myAttendance.filter(a => a.Month === month && a.Semester === String(semester)), [myAttendance, month, semester]);

  const overallPct = useMemo(() => {
    if (!myAttendance.length) return 0;
    const p = myAttendance.reduce((s, a) => s + Number(a.DaysPresent), 0);
    const t = myAttendance.reduce((s, a) => s + Number(a.TotalDays), 0);
    return t > 0 ? Math.round((p / t) * 1000) / 10 : 0;
  }, [myAttendance]);

  const pctColor = overallPct >= 75 ? "text-emerald-600" : overallPct >= 60 ? "text-amber-500" : "text-rose-500";

  const latestNotice   = notices[0];
  const latestCircular = circulars[0];

  const panels = [
    { icon: <TrendingUp size={20} />, label: "Attendance", value: `${overallPct}%`,       color: "text-violet-600", bg: "bg-violet-400/20", onClick: () => setTab("attendance"), stagger: "card-stagger-1" },
    { icon: <BookOpen   size={20} />, label: "Marks",      value: `Sem ${semester}`,       color: "text-fuchsia-600",bg: "bg-fuchsia-400/20",onClick: () => setTab("marks"),      stagger: "card-stagger-2" },
    { icon: <Bell       size={20} />, label: "Notices",    value: `${notices.length}`,     color: "text-blue-600",   bg: "bg-blue-400/20",   onClick: () => navigate("/notifications"), stagger: "card-stagger-3" },
    { icon: <FileText   size={20} />, label: "Circulars",  value: `${circulars.length}`,   color: "text-pink-600",   bg: "bg-pink-400/20",   onClick: () => navigate("/circulars"),     stagger: "card-stagger-4" },
    { icon: <Globe      size={20} />, label: "Website",    value: "Open",                  color: "text-emerald-600",bg: "bg-emerald-400/20",onClick: () => window.open(COLLEGE_WEBSITE, "_blank"), stagger: "card-stagger-5" },
    { icon: <User       size={20} />, label: "Profile",    value: (user?.name || "").split(" ")[0] || "Me", color: "text-indigo-600", bg: "bg-indigo-400/20", onClick: () => {}, stagger: "card-stagger-6" },
  ];

  const txt  = { color: "hsl(260 40% 20%)" };
  const muted= { color: "hsl(260 20% 50%)" };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-6xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 animate-fade-in-up">
            <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
              Hello, {(user?.name || "Student").split(" ")[0]} 👋
            </h1>
            <p className="text-sm" style={muted}>{group} · Section {section} · {rollNo}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">

            {/* LEFT COLUMN */}
            <div className="md:col-span-1">

              {/* Profile card */}
              <GlassCard strong shimmer className="mb-4 card-stagger-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-badge bg-violet-400/20"><User size={20} className="text-violet-600" /></div>
                  <div>
                    <p className="font-semibold text-sm" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{user?.name}</p>
                    <p className="text-xs" style={muted}>Semester {semester}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[["Roll No", rollNo], ["Group", `${group}-${section}`]].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={muted}>{k}</span>
                      <span className="font-semibold" style={txt}>{v}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Square panels 2×3 */}
              <div className="grid grid-cols-2 gap-3">
                {panels.map(p => (
                  <div key={p.label} onClick={p.onClick} className={`glass-panel flex flex-col items-center justify-center text-center p-3 aspect-square ${p.stagger}`}>
                    <div className={`icon-badge ${p.bg} mb-2`}><span className={p.color}>{p.icon}</span></div>
                    <p className={`text-base font-bold leading-tight ${p.color} animate-count-up`} style={{ fontFamily: "Outfit, sans-serif" }}>{p.value}</p>
                    <p className="text-[10px] mt-0.5 font-medium" style={muted}>{p.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: main content */}
            <div className="space-y-4 md:col-span-2 lg:col-span-3 animate-fade-in-up">

              {/* Notice + Circular row */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard onClick={() => navigate("/notifications")} className="card-stagger-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Bell size={13} className="text-blue-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Notice</p>
                  </div>
                  <p className="text-xs font-semibold line-clamp-2" style={txt}>{latestNotice?.title || "No notices yet"}</p>
                </GlassCard>
                <GlassCard onClick={() => navigate("/circulars")} className="card-stagger-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <FileText size={13} className="text-fuchsia-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={muted}>Latest Circular</p>
                  </div>
                  <p className="text-xs font-semibold line-clamp-2" style={txt}>{latestCircular?.title || "No circulars yet"}</p>
                </GlassCard>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {(["marks", "attendance"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${tab === t ? "tab-active" : "tab-inactive"}`}
                    style={{ fontFamily: "Outfit, sans-serif" }}>
                    {t === "marks" ? <><BookOpen size={14} /> Marks</> : <><Calendar size={14} /> Attendance</>}
                  </button>
                ))}
              </div>

              {/* Marks */}
              {tab === "marks" && (
                <GlassCard strong shimmer>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Marks — Sem {semester}</h3>
                    <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="glass-input" style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}>
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  {dataLoading ? (
                    <div className="py-10 text-center text-sm" style={muted}>Loading marks…</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/30 text-left">
                            <th className="pb-3 pr-4">Subject</th>
                            <th className="pb-3 pr-4 text-center">Mid-1</th>
                            <th className="pb-3 text-center">Mid-2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myMarks.length === 0
                            ? <tr><td colSpan={3} className="py-10 text-center text-sm" style={muted}>No marks found for Sem {semester}</td></tr>
                            : myMarks.map((m, i) => (
                              <tr key={i} className="border-b border-white/20">
                                <td className="py-2.5 pr-4 font-medium" style={txt}>{m.Subject}</td>
                                <td className="py-2.5 pr-4 text-center font-semibold text-violet-600">{m.Mid1}</td>
                                <td className="py-2.5 text-center font-semibold text-fuchsia-600">{m.Mid2}</td>
                              </tr>
                            ))
                          }
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              )}

              {/* Attendance */}
              {tab === "attendance" && (
                <GlassCard strong shimmer>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Attendance</h3>
                    <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="glass-input" style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}>
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                    <select value={month} onChange={e => setMonth(e.target.value)} className="glass-input" style={{ width: "auto", padding: "6px 10px", fontSize: "13px" }}>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  {dataLoading ? (
                    <div className="py-10 text-center text-sm" style={muted}>Loading attendance…</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/30 text-left">
                            <th className="pb-3 pr-4">Month</th>
                            <th className="pb-3 pr-4 text-center">Present</th>
                            <th className="pb-3 pr-4 text-center">Total</th>
                            <th className="pb-3 text-center">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthAttendance.length === 0
                            ? <tr><td colSpan={4} className="py-10 text-center text-sm" style={muted}>No data for {month}, Sem {semester}</td></tr>
                            : monthAttendance.map((a, i) => {
                              const p = Number(a.Percentage);
                              const c = p >= 75 ? "text-emerald-500" : p >= 60 ? "text-amber-500" : "text-rose-500";
                              return (
                                <tr key={i} className="border-b border-white/20">
                                  <td className="py-2.5 pr-4 font-medium" style={txt}>{a.Month}</td>
                                  <td className="py-2.5 pr-4 text-center">{a.DaysPresent}</td>
                                  <td className="py-2.5 pr-4 text-center">{a.TotalDays}</td>
                                  <td className={`py-2.5 text-center font-bold ${c}`}>{a.Percentage}%</td>
                                </tr>
                              );
                            })
                          }
                        </tbody>
                      </table>
                    </div>
                  )}
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
