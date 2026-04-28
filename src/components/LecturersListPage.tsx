import { useState, useEffect } from "react";
import { getAllLecturers } from "@/firebase/firestore";
import type { LecturerProfile } from "@/firebase/firestore";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { Users, Search, RefreshCw } from "lucide-react";

export default function LecturersListPage() {
  const [lecturers, setLecturers] = useState < LecturerProfile[] > ([]);
  const [filtered, setFiltered] = useState < LecturerProfile[] > ([]);
  const [department, setDepartment] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const txt = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };
  
  const departments = [
    "All",
    ...Array.from(new Set(lecturers.map(l => l.department).filter(Boolean))).sort(),
  ];
  
  const load = () => {
    setLoading(true);
    setError("");
    getAllLecturers()
      .then(data => { setLecturers(data);
        setFiltered(data); })
      .catch(() => setError("Failed to load lecturers. Check your connection."))
      .finally(() => setLoading(false));
  };
  
  useEffect(load, []);
  
  useEffect(() => {
    let r = lecturers;
    if (department !== "All") r = r.filter(l => l.department === department);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(l => l.name.toLowerCase().includes(q) || l.lecturerId.toLowerCase().includes(q));
    }
    setFiltered(r);
  }, [department, search, lecturers]);
  
  const designationBadge = (d: string) => {
    if (d === "HOD") return "badge-orange";
    if (d === "Principal") return "badge-purple";
    return "badge-blue";
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
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Lecturers</h1>
              <p className="text-sm" style={muted}>{filtered.length} of {lecturers.length} staff members</p>
            </div>
            <button onClick={load} disabled={loading} className="rounded-xl p-2.5 transition-all hover:bg-white/30 active:scale-95" style={{ color: "hsl(265 50% 55%)" }}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Filters */}
          <GlassCard strong className="mb-5 card-stagger-1">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 20% 55%)" }} />
                <input
                  type="text"
                  placeholder="Search by name or ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: "34px" }}
                />
              </div>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {departments.map(d => <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>)}
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
                <div key={i} className="rounded-[20px] h-20 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)", animationDelay: `${i * 0.08}s` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && !error && (
            <GlassCard className="text-center py-12">
              <Users size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(265 50% 55%)" }} />
              <p className="font-semibold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>No lecturers found</p>
              <p className="text-sm mt-1" style={muted}>Try a different search or filter.</p>
            </GlassCard>
          )}

          {/* Cards */}
          <div className="space-y-3">
            {filtered.map((lec, i) => (
              <GlassCard key={lec.uid} className={`card-stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-bold text-sm" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{lec.name}</p>
                      <span className={`badge ${designationBadge(lec.designation)}`}>{lec.designation}</span>
                    </div>
                    <p className="text-xs font-mono mb-2" style={{ color: "hsl(265 40% 52%)" }}>ID: {lec.lecturerId}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-gray">🏫 {lec.department}</span>
                      {lec.isIncharge && (
                        <span className="badge badge-blue">📋 Incharge: {lec.group} – {lec.section}</span>
                      )}
                      <span className={`badge ${lec.status === "active" ? "badge-green" : "badge-red"}`}>
                        {lec.status === "active" ? "✅" : "🚫"} {lec.status}
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}