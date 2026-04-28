import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { Calendar, RefreshCw } from "lucide-react";
import { getSheetUrls, SEMESTERS, MONTHS } from "@/config/college";
import Papa from "papaparse";

interface AttendanceRow {
  RollNo:      string;
  Name:        string;
  Month:       string;
  DaysPresent: string;
  TotalDays:   string;
  Percentage:  string;
  Semester:    string;
}

const AttendancePage = () => {
  const { user } = useAuth();
  const isIncharge = (user as any)?.isIncharge;
  const group      = (user as any)?.group   || "";
  const section    = (user as any)?.section || "";
  const rollNo     = (user as any)?.rollNo  || "";
  const isStudent  = user?.role === "student";

  const [rows,      setRows]      = useState<AttendanceRow[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [semester,  setSemester]  = useState((user as any)?.semester || 3);
  const [month,     setMonth]     = useState("June");

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  const load = async () => {
    if (!group || !section) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const { attendance } = getSheetUrls(group, section);
      const res  = await fetch(attendance);
      const csv  = await res.text();
      const data = Papa.parse<AttendanceRow>(csv, { header: true, skipEmptyLines: true });
      setRows(data.data);
    } catch {
      setError("Failed to load attendance data. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [group, section]);

  // Filter rows
  const filtered = useMemo(() => {
    let r = rows.filter(
      a => a.Month === month && String(a.Semester) === String(semester)
    );
    if (isStudent) r = r.filter(a => a.RollNo === rollNo);
    return r;
  }, [rows, month, semester, isStudent, rollNo]);

  // Per-student summary for incharge view
  const summary = useMemo(() => {
    if (!isStudent) {
      const byStu: Record<string, { name: string; present: number; total: number }> = {};
      rows
        .filter(a => String(a.Semester) === String(semester))
        .forEach(a => {
          if (!byStu[a.RollNo]) byStu[a.RollNo] = { name: a.Name, present: 0, total: 0 };
          byStu[a.RollNo].present += Number(a.DaysPresent);
          byStu[a.RollNo].total   += Number(a.TotalDays);
        });
      return Object.entries(byStu).map(([roll, s]) => ({
        rollNo: roll,
        name:   s.name,
        pct:    s.total > 0 ? Math.round((s.present / s.total) * 1000) / 10 : 0,
        present: s.present,
        total:   s.total,
      })).sort((a, b) => a.rollNo.localeCompare(b.rollNo));
    }
    return [];
  }, [rows, semester, isStudent]);

  const pctColor = (p: number) => p >= 75 ? "text-emerald-500" : p >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Attendance</h1>
              <p className="text-sm" style={muted}>
                {isStudent ? `${group} · Section ${section}` : `${group} — Section ${section}`}
              </p>
            </div>
            <button
              onClick={load}
              disabled={loading}
              className="rounded-xl p-2.5 transition-all hover:bg-white/30 active:scale-95"
              style={{ color: "hsl(265 50% 55%)" }}
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Filters */}
          <GlassCard strong className="mb-5 card-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <Calendar size={15} style={{ color: "hsl(265 50% 55%)" }} />
                <span className="text-xs font-semibold" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 30% 48%)" }}>Filter</span>
              </div>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
              <select
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </GlassCard>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.12)", color: "hsl(0 72% 48%)", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="rounded-[20px] h-14 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          )}

          {/* STUDENT VIEW — month table */}
          {!loading && isStudent && (
            <GlassCard strong shimmer className="card-stagger-2">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                {month} — Semester {semester}
              </h3>
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
                    {filtered.length === 0
                      ? <tr><td colSpan={4} className="py-10 text-center text-sm" style={muted}>No data for {month}, Sem {semester}</td></tr>
                      : filtered.map((a, i) => {
                        const p = Number(a.Percentage);
                        return (
                          <tr key={i} className="border-b border-white/20">
                            <td className="py-2.5 pr-4 font-medium" style={txt}>{a.Month}</td>
                            <td className="py-2.5 pr-4 text-center">{a.DaysPresent}</td>
                            <td className="py-2.5 pr-4 text-center">{a.TotalDays}</td>
                            <td className={`py-2.5 text-center font-bold ${pctColor(p)}`}>{a.Percentage}%</td>
                          </tr>
                        );
                      })
                    }
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* LECTURER / ADMIN VIEW — class summary */}
          {!loading && !isStudent && (
            <GlassCard strong shimmer className="card-stagger-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                  Class Summary — Semester {semester}
                </h3>
                <span className="badge badge-purple">{summary.length} students</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/30 text-left">
                      <th className="pb-3 pr-3">Roll No</th>
                      <th className="pb-3 pr-3">Name</th>
                      <th className="pb-3 pr-3 text-center">Present</th>
                      <th className="pb-3 pr-3 text-center">Total</th>
                      <th className="pb-3 text-center">Overall %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.length === 0
                      ? <tr><td colSpan={5} className="py-10 text-center text-sm" style={muted}>No attendance data for Sem {semester}</td></tr>
                      : summary.map((s, i) => (
                        <tr key={i} className="border-b border-white/20">
                          <td className="py-2.5 pr-3 text-xs font-mono" style={{ color: "hsl(265 40% 50%)" }}>{s.rollNo}</td>
                          <td className="py-2.5 pr-3 font-medium" style={txt}>{s.name}</td>
                          <td className="py-2.5 pr-3 text-center">{s.present}</td>
                          <td className="py-2.5 pr-3 text-center">{s.total}</td>
                          <td className={`py-2.5 text-center font-bold ${pctColor(s.pct)}`}>{s.pct}%</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
