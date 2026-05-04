// src/components/GroupsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { fetchGroups, type GroupConfig } from "@/config/college";
import { getAllStudents, getAllLecturers } from "@/firebase/firestore";
import { GraduationCap, Users, ChevronRight, RefreshCw, Building2 } from "lucide-react";

interface GroupStats extends GroupConfig {
  studentCount: number;
  lecturerCount: number;
}

const GroupsPage = () => {
  const navigate = useNavigate();
  const [groups,  setGroups]  = useState<GroupStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [rawGroups, students, lecturers] = await Promise.all([
        fetchGroups(),
        getAllStudents(),
        getAllLecturers(),
      ]);

      const enriched: GroupStats[] = rawGroups.map(g => ({
        ...g,
        studentCount:  students.filter(s => s.group === g.groupCode).length,
        lecturerCount: lecturers.filter(l => (l as any).group === g.groupCode).length,
      }));

      setGroups(enriched);
    } catch {
      setError("Failed to load groups. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Group by department
  const byDept = groups.reduce((acc, g) => {
    const dept = g.department || "General";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(g);
    return acc;
  }, {} as Record<string, GroupStats[]>);

  const deptColors = [
    "var(--navy)", "var(--orange)", "#059669", "#7c3aed",
    "#2563eb", "#d97706", "#dc2626", "#0891b2",
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-5 animate-fade-in-up">
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                Groups
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {groups.length} group{groups.length !== 1 ? "s" : ""} across {Object.keys(byDept).length} departments
              </p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white active:scale-95"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Summary stats */}
          {!loading && groups.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5 stagger-1">
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                  {groups.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Groups</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--orange)" }}>
                  {groups.reduce((s, g) => s + g.studentCount, 0)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Students</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"#059669" }}>
                  {Object.keys(byDept).length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Departments</p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
              style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-20 rounded-[16px] animate-pulse"
                  style={{ background:"rgba(15,45,94,0.06)", animationDelay:`${i*0.08}s` }} />
              ))}
            </div>
          )}

          {/* Groups grouped by department */}
          {!loading && Object.entries(byDept).map(([dept, deptGroups], di) => (
            <div key={dept} className={`mb-5 stagger-${Math.min(di+2,6)}`}>
              {/* Department header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 rounded-full" style={{ background: deptColors[di % deptColors.length] }} />
                <p className="text-xs font-bold uppercase tracking-wider"
                  style={{ fontFamily:"Sora,sans-serif", color: deptColors[di % deptColors.length] }}>
                  {dept}
                </p>
                <span className="badge badge-gray text-[10px]">{deptGroups.length} groups</span>
              </div>

              {/* Group cards */}
              <div className="space-y-3">
                {deptGroups.map((g, gi) => (
                  <div key={g.groupCode}
                    onClick={() => navigate(`/admin/students?group=${encodeURIComponent(g.groupCode)}`)}
                    className="ndc-card cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
                    <div className="p-4 flex items-center gap-3">

                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                        style={{
                          background: `${deptColors[di % deptColors.length]}15`,
                          color: deptColors[di % deptColors.length],
                          fontFamily:"Sora,sans-serif",
                          fontSize:13,
                        }}>
                        {g.groupCode.slice(0,3)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                            {g.groupCode}
                          </p>
                        </div>
                        <p className="text-xs mb-2 line-clamp-1" style={{ color:"var(--text-2)" }}>{g.fullName}</p>

                        {/* Sections + counts */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {g.sections.map(sec => (
                            <span key={sec} className="badge badge-navy text-[10px]">
                              Sec {sec}
                            </span>
                          ))}
                          <span className="text-[10px] font-semibold ml-1" style={{ color:"var(--text-3)" }}>
                            {g.sections.length} section{g.sections.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <GraduationCap size={12} style={{ color:"var(--navy)" }} />
                          <p className="text-sm font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                            {g.studentCount}
                          </p>
                        </div>
                        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>students</p>
                        <ChevronRight size={14} className="ml-auto mt-1" style={{ color:"var(--text-3)" }} />
                      </div>
                    </div>

                    {/* Progress bar — student proportion */}
                    <div className="px-4 pb-3">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{
                          width: groups.reduce((s,x)=>s+x.studentCount,0) > 0
                            ? `${(g.studentCount / Math.max(...groups.map(x=>x.studentCount)) * 100)}%`
                            : "0%",
                          background:`linear-gradient(90deg, ${deptColors[di % deptColors.length]}, ${deptColors[di % deptColors.length]}88)`
                        }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Empty */}
          {!loading && groups.length === 0 && !error && (
            <div className="ndc-card text-center py-12">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                No groups found
              </p>
              <p className="text-sm mt-1" style={{ color:"var(--text-3)" }}>
                Add groups to the Login Sheet → Groups tab
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default GroupsPage;
