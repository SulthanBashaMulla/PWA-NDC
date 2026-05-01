import { useState, useEffect } from "react";
import { getAllLecturers } from "@/firebase/firestore";
import type { LecturerProfile } from "@/firebase/firestore";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { Users, Search, RefreshCw } from "lucide-react";

export default function LecturersListPage() {
  const [lecturers,  setLecturers]  = useState<LecturerProfile[]>([]);
  const [filtered,   setFiltered]   = useState<LecturerProfile[]>([]);
  const [search,     setSearch]     = useState("");
  const [department, setDepartment] = useState("All");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  const departments = ["All", ...Array.from(new Set(lecturers.map(l=>l.department).filter(Boolean))).sort()];

  const load = () => {
    setLoading(true); setError("");
    getAllLecturers()
      .then(d => { setLecturers(d); setFiltered(d); })
      .catch(() => setError("Failed to load lecturers."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useEffect(() => {
    let r = lecturers;
    if (department !== "All") r = r.filter(l => l.department === department);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(l => l.name.toLowerCase().includes(q) || l.lecturerId?.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [department, search, lecturers]);

  const desBadge = (d:string) => {
    if (d==="HOD")       return "badge-orange";
    if (d==="Principal") return "badge-navy";
    return "badge-gray";
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
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>Lecturers</h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>{filtered.length} of {lecturers.length} staff</p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading?"animate-spin":""} />
            </button>
          </div>

          {/* Filters */}
          <div className="ndc-card mb-4 stagger-1">
            <div className="p-4 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:"var(--text-3)" }} />
                <input type="text" placeholder="Search name or ID…" value={search}
                  onChange={e=>setSearch(e.target.value)}
                  className="ndc-input" style={{ paddingLeft:"34px" }} />
              </div>
              <select value={department} onChange={e=>setDepartment(e.target.value)}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {departments.map(d=><option key={d} value={d}>{d==="All"?"All Departments":d}</option>)}
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
            <div className="space-y-3">
              {[1,2,3,4].map(i=><div key={i} className="h-20 rounded-[16px] animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />)}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length===0 && !error && (
            <div className="ndc-card text-center py-12">
              <Users size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>No lecturers found</p>
            </div>
          )}

          {/* Cards */}
          <div className="space-y-3">
            {filtered.map((lec,i)=>(
              <div key={lec.uid} className={`ndc-card stagger-${Math.min(i+1,6)}`}>
                <div className="p-4 flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                    style={{ background:"rgba(15,45,94,0.1)", color:"var(--navy)", fontFamily:"Sora,sans-serif" }}>
                    {lec.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>{lec.name}</p>
                      <span className={`badge ${desBadge(lec.designation)} text-[10px]`}>{lec.designation}</span>
                    </div>
                    <p className="text-xs font-mono mb-2" style={{ color:"var(--orange)" }}>ID: {lec.lecturerId}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="badge badge-navy text-[10px]">🏫 {lec.department}</span>
                      {lec.isIncharge && (
                        <span className="badge badge-orange text-[10px]">📋 {lec.group}-{lec.section}</span>
                      )}
                      <span className={`badge text-[10px] ${lec.status==="active"?"badge-green":"badge-red"}`}>
                        {lec.status==="active"?"✅":"🚫"} {lec.status}
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
