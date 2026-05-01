import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { BookOpen, RefreshCw } from "lucide-react";
import { getSheetUrls, SEMESTERS } from "@/config/college";
import Papa from "papaparse";

interface MRow { RollNo: string;Name: string;Semester: string;Subject: string;Mid1: string;Mid2: string; }

const MarksPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const group = (user as any)?.group || "";
  const section = (user as any)?.section || "";
  const rollNo = (user as any)?.rollNo || "";
  const [rows, setRows] = useState < MRow[] > ([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [semester, setSemester] = useState((user as any)?.semester || 3);
  
  const load = async () => {
    if (!group || !section) { setLoading(false); return; }
    setLoading(true);
    setError("");
    try {
      const { marks } = getSheetUrls(group, section);
      const text = await fetch(marks).then(r => r.text());
      setRows(Papa.parse < MRow > (text, { header: true, skipEmptyLines: true }).data);
    } catch { setError("Failed to load marks. Check connection."); }
    finally { setLoading(false); }
  };
  
  useEffect(() => { load(); }, [group, section]);
  
  const myMarks = useMemo(() =>
    rows.filter(m => m.RollNo === rollNo && String(m.Semester) === String(semester)),
    [rows, rollNo, semester]
  );
  
  const classMarks = useMemo(() => {
    if (isStudent) return [];
    const map: Record < string, { name: string;subjects: MRow[] } > = {};
    rows.filter(m => String(m.Semester) === String(semester)).forEach(m => {
      if (!map[m.RollNo]) map[m.RollNo] = { name: m.Name, subjects: [] };
      map[m.RollNo].subjects.push(m);
    });
    return Object.entries(map)
      .map(([roll, v]) => ({ rollNo: roll, ...v }))
      .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [rows, semester, isStudent]);
  
  const markColor = (v: string) => {
    const n = Number(v);
    if (isNaN(n)) return "var(--text-3)";
    return n >= 18 ? "#059669" : n >= 14 ? "#d97706" : "#dc2626";
  };
  const markBg = (v: string) => {
    const n = Number(v);
    if (isNaN(n)) return "rgba(100,116,139,0.08)";
    return n >= 18 ? "rgba(16,185,129,0.1)" : n >= 14 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
  };
  
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>Marks</h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>{group} · Section {section}</p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white active:scale-95"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Semester filter */}
          <div className="ndc-card mb-4 stagger-1">
            <div className="p-4 flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={15} style={{ color:"var(--navy)" }} />
                <span className="text-xs font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>Semester</span>
              </div>
              <select value={semester} onChange={e=>setSemester(Number(e.target.value))}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
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
              {[1,2,3].map(i=><div key={i} className="h-14 rounded-xl animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />)}
            </div>
          )}

          {/* STUDENT VIEW */}
          {!loading && isStudent && (
            <div className="ndc-card stagger-2">
              <div className="ndc-card-header">
                <h3>Your Marks — Semester {semester}</h3>
                <BookOpen size={13} style={{ color:"rgba(255,255,255,0.6)" }} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                      <th className="text-left p-3">Subject</th>
                      <th className="text-center p-3">Mid-1</th>
                      <th className="text-center p-3">Mid-2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myMarks.length===0
                      ? <tr><td colSpan={3} className="py-10 text-center text-sm" style={{ color:"var(--text-3)" }}>No marks for Sem {semester}</td></tr>
                      : myMarks.map((m,i)=>(
                        <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                          <td className="p-3 text-sm font-medium">{m.Subject}</td>
                          <td className="p-3 text-center">
                            <span className="badge text-xs font-bold" style={{ background:markBg(m.Mid1), color:markColor(m.Mid1) }}>{m.Mid1}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="badge text-xs font-bold" style={{ background:markBg(m.Mid2), color:markColor(m.Mid2) }}>{m.Mid2}</span>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* LECTURER/ADMIN VIEW */}
          {!loading && !isStudent && (
            <div className="space-y-3">
              {classMarks.length===0 && !error && (
                <div className="ndc-card text-center py-10">
                  <BookOpen size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
                  <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>No marks for Sem {semester}</p>
                </div>
              )}
              {classMarks.map((stu,idx)=>(
                <div key={stu.rollNo} className={`ndc-card stagger-${Math.min(idx+1,6)}`}>
                  <div className="p-3 flex items-center justify-between border-b" style={{ borderColor:"var(--bg-2)" }}>
                    <div>
                      <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>{stu.name}</p>
                      <p className="text-xs font-mono" style={{ color:"var(--orange)" }}>{stu.rollNo}</p>
                    </div>
                    <span className="badge badge-navy text-[10px]">Sem {semester}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                          <th className="text-left p-2.5 text-xs">Subject</th>
                          <th className="text-center p-2.5 text-xs">Mid-1</th>
                          <th className="text-center p-2.5 text-xs">Mid-2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stu.subjects.map((s,i)=>(
                          <tr key={i} className="border-b" style={{ borderColor:"var(--bg-2)" }}>
                            <td className="p-2.5 text-sm">{s.Subject}</td>
                            <td className="p-2.5 text-center">
                              <span className="badge text-xs" style={{ background:markBg(s.Mid1), color:markColor(s.Mid1) }}>{s.Mid1}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <span className="badge text-xs" style={{ background:markBg(s.Mid2), color:markColor(s.Mid2) }}>{s.Mid2}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MarksPage;