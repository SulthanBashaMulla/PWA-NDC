import { useState, useEffect } from "react";
import { getAllStudents } from "@/firebase/firestore";
import type { StudentProfile } from "@/firebase/firestore";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { GraduationCap, Search, RefreshCw, X } from "lucide-react";

const SECTIONS = ["All","A","B","C","G"];

export default function StudentsListPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filtered, setFiltered] = useState<StudentProfile[]>([]);
  const [groups,   setGroups]   = useState<string[]>(["All"]);
  const [group,    setGroup]    = useState("All");
  const [section,  setSection]  = useState("All");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = () => {
    setLoading(true); setError("");
    getAllStudents()
      .then(d => {
        setStudents(d);
        setFiltered(d);
        const g = ["All", ...Array.from(new Set(d.map(s=>s.group).filter(Boolean))).sort()];
        setGroups(g);
      })
      .catch(() => setError("Failed to load students."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    let r = students;
    if (group   !== "All") r = r.filter(s => s.group   === group);
    if (section !== "All") r = r.filter(s => s.section === section);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(s => s.rollNo.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [group, section, search, students]);

  const clearFilters = () => { setGroup("All"); setSection("All"); setSearch(""); };
  const hasFilters   = group!=="All" || section!=="All" || !!search.trim();

  // Group stats
  const groupStats = groups.filter(g=>g!=="All").map(g=>({
    group:g, count:students.filter(s=>s.group===g).length
  })).filter(g=>g.count>0);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>Students</h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>{filtered.length} of {students.length} students</p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading?"animate-spin":""} />
            </button>
          </div>

          {/* Stats bar */}
          {!loading && students.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 stagger-1">
              <div className="stat-card shrink-0 text-center" style={{ minWidth:72, padding:"10px 14px" }}>
                <p className="text-xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>{students.length}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Total</p>
              </div>
              {groupStats.map(g=>(
                <div key={g.group} className="stat-card shrink-0 text-center" style={{ minWidth:72, padding:"10px 14px" }}>
                  <p className="text-xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--orange)" }}>{g.count}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[70px]" style={{ color:"var(--text-3)" }}>{g.group}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="ndc-card mb-4 stagger-2">
            <div className="p-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-3)" }} />
                <input type="text" placeholder="Search roll no or name…" value={search}
                  onChange={e=>setSearch(e.target.value)}
                  className="ndc-input" style={{ paddingLeft:"34px" }} />
              </div>
              <select value={group} onChange={e=>{setGroup(e.target.value);setSection("All");}}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {groups.map(g=><option key={g} value={g}>{g==="All"?"All Groups":g}</option>)}
              </select>
              <select value={section} onChange={e=>setSection(e.target.value)}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {SECTIONS.map(s=><option key={s} value={s}>{s==="All"?"All Sections":`Sec ${s}`}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all"
                  style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
                  <X size={12}/> Clear
                </button>
              )}
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
            <div className="space-y-3">
              {[1,2,3,4,5].map(i=><div key={i} className="h-20 rounded-[16px] animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length===0 && !error && (
            <div className="ndc-card text-center py-12">
              <GraduationCap size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>No students found</p>
              <p className="text-sm mt-1" style={{ color:"var(--text-3)" }}>Try clearing your filters.</p>
            </div>
          )}

          {/* Student cards */}
          <div className="space-y-3">
            {filtered.map((stu,i)=>(
              <div key={stu.uid} className={`ndc-card stagger-${Math.min(i+1,6)}`}>
                <div className="p-4 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                    style={{ background:"rgba(232,96,28,0.1)", color:"var(--orange)", fontFamily:"Sora,sans-serif" }}>
                    {stu.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>{stu.name}</p>
                      <span className="badge badge-navy text-[10px]">Sem {stu.semester}</span>
                    </div>
                    <p className="text-xs font-mono mb-2" style={{ color:"var(--orange)" }}>Roll: {stu.rollNo}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-navy text-[10px]"> {stu.group}</span>
                      <span className="badge badge-gray text-[10px]">  {stu.section} Sec</span>

                      <span className={`badge text-[10px] ${stu.status==="active"?"badge-green":"badge-red"}`}>
                        {stu.status==="active"?"✅":"🚫"} {stu.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
