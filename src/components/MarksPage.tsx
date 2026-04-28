import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { BookOpen, RefreshCw } from "lucide-react";
import { getSheetUrls, SEMESTERS } from "@/config/college";
import Papa from "papaparse";

interface MarksRow {
  RollNo:   string;
  Name:     string;
  Subject:  string;
  Mid1:     string;
  Mid2:     string;
  Semester: string;
}

const MarksPage = () => {
  const { user }   = useAuth();
  const isStudent  = user?.role === "student";
  const group      = (user as any)?.group   || "";
  const section    = (user as any)?.section || "";
  const rollNo     = (user as any)?.rollNo  || "";

  const [rows,     setRows]     = useState<MarksRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [semester, setSemester] = useState((user as any)?.semester || 3);

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  const load = async () => {
    if (!group || !section) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const { marks } = getSheetUrls(group, section);
      const res  = await fetch(marks);
      const csv  = await res.text();
      const data = Papa.parse<MarksRow>(csv, { header: true, skipEmptyLines: true });
      setRows(data.data);
    } catch {
      setError("Failed to load marks. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [group, section]);

  // Student: own marks for chosen semester
  const myMarks = useMemo(() =>
    rows.filter(m => m.RollNo === rollNo && String(m.Semester) === String(semester)),
    [rows, rollNo, semester]
  );

  // Lecturer/Admin: all students, grouped by student
  const classMarks = useMemo(() => {
    if (isStudent) return [];
    const byStu: Record<string, { name: string; subjects: MarksRow[] }> = {};
    rows
      .filter(m => String(m.Semester) === String(semester))
      .forEach(m => {
        if (!byStu[m.RollNo]) byStu[m.RollNo] = { name: m.Name, subjects: [] };
        byStu[m.RollNo].subjects.push(m);
      });
    return Object.entries(byStu)
      .map(([roll, v]) => ({ rollNo: roll, ...v }))
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [rows, semester, isStudent]);

  const markColor = (v: string) => {
    const n = Number(v);
    if (isNaN(n)) return "";
    return n >= 18 ? "text-emerald-600" : n >= 14 ? "text-amber-500" : "text-rose-500";
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Marks</h1>
              <p className="text-sm" style={muted}>
                {group} · Section {section}
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

          {/* Semester filter */}
          <GlassCard strong className="mb-5 card-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={15} style={{ color: "hsl(265 50% 55%)" }} />
                <span className="text-xs font-semibold" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 30% 48%)" }}>Semester</span>
              </div>
              <select
                value={semester}
                onChange={e => setSemester(Number(e.target.value))}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
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
              {[1,2,3].map(i => (
                <div key={i} className="rounded-[20px] h-20 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)" }} />
              ))}
            </div>
          )}

          {/* STUDENT VIEW */}
          {!loading && isStudent && (
            <GlassCard strong shimmer className="card-stagger-2">
              <h3 className="text-sm font-bold mb-4" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>
                Your Marks — Semester {semester}
              </h3>
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
                      ? <tr><td colSpan={3} className="py-10 text-center text-sm" style={muted}>No marks for Sem {semester}</td></tr>
                      : myMarks.map((m, i) => (
                        <tr key={i} className="border-b border-white/20">
                          <td className="py-2.5 pr-4 font-medium" style={txt}>{m.Subject}</td>
                          <td className={`py-2.5 pr-4 text-center font-bold ${markColor(m.Mid1)}`}>{m.Mid1}</td>
                          <td className={`py-2.5 text-center font-bold ${markColor(m.Mid2)}`}>{m.Mid2}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {/* LECTURER / ADMIN VIEW — expandable per student */}
          {!loading && !isStudent && (
            <div className="space-y-3">
              {classMarks.length === 0 && !error && (
                <GlassCard className="text-center py-10">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(265 50% 55%)" }} />
                  <p className="font-semibold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>No marks for Sem {semester}</p>
                </GlassCard>
              )}
              {classMarks.map((stu, idx) => (
                <GlassCard key={stu.rollNo} className={`card-stagger-${Math.min(idx + 1, 6)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-sm" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{stu.name}</p>
                      <p className="text-[11px] font-mono" style={{ color: "hsl(265 40% 52%)" }}>{stu.rollNo}</p>
                    </div>
                    <span className="badge badge-purple">Sem {semester}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/30 text-left">
                          <th className="pb-2 pr-4">Subject</th>
                          <th className="pb-2 pr-4 text-center">Mid-1</th>
                          <th className="pb-2 text-center">Mid-2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stu.subjects.map((s, i) => (
                          <tr key={i} className="border-b border-white/15">
                            <td className="py-1.5 pr-4" style={txt}>{s.Subject}</td>
                            <td className={`py-1.5 pr-4 text-center font-semibold ${markColor(s.Mid1)}`}>{s.Mid1}</td>
                            <td className={`py-1.5 text-center font-semibold ${markColor(s.Mid2)}`}>{s.Mid2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MarksPage;
