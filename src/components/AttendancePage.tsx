import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { Calendar, RefreshCw } from "lucide-react";
import { getSheetUrls, SEMESTERS, MONTHS } from "@/config/college";
import Papa from "papaparse";

interface ARow { RollNo: string;Name: string;Month: string;DaysPresent: string;TotalDays: string;Percentage: string;Semester: string; }

const AttendancePage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const group = (user as any)?.group || "";
  const section = (user as any)?.section || "";
  const rollNo = (user as any)?.rollNo || "";
  const [rows, setRows] = useState < ARow[] > ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState((user as any)?.semester || 3);
  const [month, setMonth] = useState("June");
  
  const load = async () => {
    if (!group || !section) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const { attendance } = getSheetUrls(group, section);
      const text = await fetch(attendance).then(r => r.text());
      setRows(Papa.parse < ARow > (text, { header: true, skipEmptyLines: true }).data);
    } catch { setError("Failed to load attendance. Check connection."); }
    finally { setLoading(false); }
  };
  
  useEffect(() => { load(); }, [group, section]);
  
  const filtered = useMemo(() => {
    let r = rows.filter(a => a.Month === month && String(a.Semester) === String(semester));
    if (isStudent) r = r.filter(a => a.RollNo === rollNo);
    return r;
  }, [rows, month, semester, isStudent, rollNo]);
  
  const summary = useMemo(() => {
    if (isStudent) return [];
    const map: Record < string, { name: string;present: number;total: number } > = {};
    rows.filter(a => String(a.Semester) === String(semester)).forEach(a => {
      if (!map[a.RollNo]) map[a.RollNo] = { name: a.Name, present: 0, total: 0 };
      map[a.RollNo].present += Number(a.DaysPresent);
      map[a.RollNo].total += Number(a.TotalDays);
    });
    return Object.entries(map)
      .map(([roll, s]) => ({ rollNo: roll, name: s.name, pct: s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0, present: s.present, total: s.total }))
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [rows, semester, isStudent]);
  
  const pctColor = (p: number) => p >= 75 ? "#059669" : p >= 60 ? "#d97706" : "#dc2626";
  const pctBg = (p: number) => p >= 75 ? "rgba(16,185,129,0.1)" : p >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>Attendance</h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>{group} · Section {section}</p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white active:scale-95"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Filters */}
          <div className="ndc-card mb-4 stagger-1">
            <div className="p-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Calendar size={15} style={{ color:"var(--navy)" }} />
                <span className="text-xs font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Filter</span>
              </div>
              <select value={semester} onChange={e=>setSemester(Number(e.target.value))}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
              </select>
              <select value={month} onChange={e=>setMonth(e.target.value)}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="space-y-2">
              {[1,2,3,4].map(i=><div key={i} className="h-12 rounded-xl animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />)}
            </div>
          )}

          {/* STUDENT VIEW */}
          {!loading && isStudent && (
            <div className="ndc-card stagger-2">
              <div className="ndc-card-header">
                <h3>{month} — Semester {semester}</h3>
                <Calendar size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                      <th className="text-left p-3">Month</th>
                      <th className="text-center p-3">Present</th>
                      <th className="text-center p-3">Total</th>
                      <th className="text-center p-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0
                      ? <tr><td colSpan={4} className="py-10 text-center text-sm" style={{ color:"var(--text-3)" }}>No data for {month}, Sem {semester}</td></tr>
                      : filtered.map((a,i)=>{
                        const p=Number(a.Percentage);
                        return (
                          <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                            <td className="p-3 text-sm font-medium">{a.Month}</td>
                            <td className="p-3 text-center text-sm">{a.DaysPresent}</td>
                            <td className="p-3 text-center text-sm">{a.TotalDays}</td>
                            <td className="p-3 text-center">
                              <span className="badge text-xs" style={{ background:pctBg(p), color:pctColor(p) }}>
                                {a.Percentage}%
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LECTURER/ADMIN VIEW */}
          {!loading && !isStudent && (
            <div className="ndc-card stagger-2">
              <div className="ndc-card-header">
                <h3>Class Summary — Sem {semester}</h3>
                <span className="badge badge-orange text-[10px]">{summary.length} students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                      <th className="text-left p-3">Roll No</th>
                      <th className="text-left p-3">Name</th>
                      <th className="text-center p-3">Present</th>
                      <th className="text-center p-3">Total</th>
                      <th className="text-center p-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.length===0
                      ? <tr><td colSpan={5} className="py-10 text-center text-sm" style={{ color:"var(--text-3)" }}>No data for Sem {semester}</td></tr>
                      : summary.map((s,i)=>(
                        <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                          <td className="p-3 text-xs font-mono font-semibold" style={{ color:"var(--navy)" }}>{s.rollNo}</td>
                          <td className="p-3 text-sm font-medium">{s.name}</td>
                          <td className="p-3 text-center text-sm">{s.present}</td>
                          <td className="p-3 text-center text-sm">{s.total}</td>
                          <td className="p-3 text-center">
                            <span className="badge text-xs" style={{ background:pctBg(s.pct), color:pctColor(s.pct) }}>
                              {s.pct}%
                            </span>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;