import { useState, useEffect } from "react";
import { getAllStudents } from "@/firebase/firestore";
import type { StudentProfile } from "@/firebase/firestore";
import GlassCard from "./GlassCard";
import AnimatedBackground from "./AnimatedBackground";
import Navbar from "./Navbar";
import { GraduationCap, Search, RefreshCw, X } from "lucide-react";
import { fetchGroups } from "@/config/college";

const SECTIONS = ["All", "A", "B", "C"];

export default function StudentsListPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filtered, setFiltered] = useState<StudentProfile[]>([]);
  const [groups,   setGroups]   = useState<string[]>(["All"]);
  const [group,    setGroup]    = useState("All");
  const [section,  setSection]  = useState("All");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const txt   = { color: "hsl(260 40% 20%)" };
  const muted = { color: "hsl(260 20% 50%)" };

  const load = () => {
    setLoading(true);
    setError("");
    getAllStudents()
      .then(data => { setStudents(data); setFiltered(data); })
      .catch(() => setError("Failed to load students. Check your connection."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    fetchGroups().then(g => setGroups(["All", ...g.map(x => x.groupCode)])).catch(() => {});
  }, []);

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
  const hasFilters   = group !== "All" || section !== "All" || !!search.trim();

  // Stats
  const groupStats = groups.filter(g => g !== "All").map(g => ({
    group: g,
    count: students.filter(s => s.group === g).length,
  }));

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between animate-fade-in-up">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>Students</h1>
              <p className="text-sm" style={muted}>{filtered.length} of {students.length} students</p>
            </div>
            <button onClick={load} disabled={loading} className="rounded-xl p-2.5 transition-all hover:bg-white/30 active:scale-95" style={{ color: "hsl(265 50% 55%)" }}>
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Group stats bar */}
          {!loading && students.length > 0 && groupStats.some(g => g.count > 0) && (
            <div className="flex gap-2 overflow-x-auto pb-1 mb-4 card-stagger-1">
              <div className="glass-panel shrink-0 px-4 py-2.5 text-center" style={{ minWidth: 72 }}>
                <p className="text-lg font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(265 80% 50%)" }}>{students.length}</p>
                <p className="text-[10px] font-semibold" style={muted}>Total</p>
              </div>
              {groupStats.filter(g => g.count > 0).map(g => (
                <div key={g.group} className="glass-panel shrink-0 px-4 py-2.5 text-center" style={{ minWidth: 72 }}>
                  <p className="text-lg font-bold" style={{ fontFamily: "Outfit, sans-serif", color: "hsl(320 70% 50%)" }}>{g.count}</p>
                  <p className="text-[10px] font-semibold truncate max-w-[70px]" style={muted}>{g.group}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <GlassCard strong className="mb-5 card-stagger-2">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "hsl(260 20% 55%)" }} />
                <input
                  type="text"
                  placeholder="Search by Roll No or Name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="glass-input"
                  style={{ paddingLeft: "34px" }}
                />
              </div>
              <select
                value={group}
                onChange={e => { setGroup(e.target.value); setSection("All"); }}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {groups.map(g => <option key={g} value={g}>{g === "All" ? "All Groups" : g}</option>)}
              </select>
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="glass-input"
                style={{ width: "auto", padding: "7px 12px", fontSize: "13px" }}
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s === "All" ? "All Sections" : `Section ${s}`}</option>)}
              </select>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all active:scale-95"
                  style={{ background: "rgba(239,68,68,0.1)", color: "hsl(0 72% 50%)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <X size={12} /> Clear
                </button>
              )}
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
              {[1,2,3,4,5].map(i => (
                <div key={i} className="rounded-[20px] h-20 animate-pulse"
                  style={{ background: "rgba(255,255,255,0.2)", animationDelay: `${i * 0.07}s` }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filtered.length === 0 && !error && (
            <GlassCard className="text-center py-12">
              <GraduationCap size={36} className="mx-auto mb-3 opacity-40" style={{ color: "hsl(265 50% 55%)" }} />
              <p className="font-semibold" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>No students found</p>
              <p className="text-sm mt-1" style={muted}>Try clearing your filters.</p>
            </GlassCard>
          )}

          {/* Student cards */}
          <div className="space-y-3">
            {filtered.map((stu, i) => (
              <GlassCard key={stu.uid} className={`card-stagger-${Math.min(i + 1, 6)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-sm" style={{ fontFamily: "Outfit, sans-serif", ...txt }}>{stu.name}</p>
                      <span className="badge badge-purple">Sem {stu.semester}</span>
                    </div>
                    <p className="text-xs font-mono mb-2" style={{ color: "hsl(265 40% 52%)" }}>Roll: {stu.rollNo}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="badge badge-blue">🏫 {stu.group}</span>
                      <span className="badge badge-gray">📌 Section {stu.section}</span>
                      {stu.phone && <span className="badge badge-gray">📞 {stu.phone}</span>}
                      <span className={`badge ${stu.status === "active" ? "badge-green" : "badge-red"}`}>
                        {stu.status === "active" ? "✅" : "🚫"} {stu.status}
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
