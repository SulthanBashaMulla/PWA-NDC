// src/components/DepartmentsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import AnimatedBackground from "./AnimatedBackground";
import { fetchGroups, type GroupConfig } from "@/config/college";
import { getAllStudents, getAllLecturers } from "@/firebase/firestore";
import type { LecturerProfile, StudentProfile } from "@/firebase/firestore";
import { Building2, GraduationCap, Users, ChevronRight, RefreshCw, BookOpen } from "lucide-react";

interface DeptData {
  name:       string;
  groups:     GroupConfig[];
  lecturers:  LecturerProfile[];
  students:   StudentProfile[];
}

const DEPT_COLORS = [
  { color:"var(--navy)",   bg:"rgba(15,45,94,0.1)"   },
  { color:"var(--orange)", bg:"rgba(232,96,28,0.1)"  },
  { color:"#059669",       bg:"rgba(16,185,129,0.1)" },
  { color:"#7c3aed",       bg:"rgba(139,92,246,0.1)" },
  { color:"#2563eb",       bg:"rgba(37,99,235,0.1)"  },
  { color:"#d97706",       bg:"rgba(245,158,11,0.1)" },
  { color:"#dc2626",       bg:"rgba(239,68,68,0.1)"  },
  { color:"#0891b2",       bg:"rgba(8,145,178,0.1)"  },
];

const DepartmentsPage = () => {
  const navigate             = useNavigate();
  const [depts,   setDepts]  = useState<DeptData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]  = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [groups, students, lecturers] = await Promise.all([
        fetchGroups(),
        getAllStudents(),
        getAllLecturers(),
      ]);

      // Build unique departments
      const deptMap: Record<string, DeptData> = {};

      groups.forEach(g => {
        const dept = g.department || "General";
        if (!deptMap[dept]) {
          deptMap[dept] = { name: dept, groups: [], lecturers: [], students: [] };
        }
        deptMap[dept].groups.push(g);
      });

      lecturers.forEach(l => {
        const dept = l.department || "General";
        if (!deptMap[dept]) {
          deptMap[dept] = { name: dept, groups: [], lecturers: [], students: [] };
        }
        deptMap[dept].lecturers.push(l);
      });

      students.forEach(s => {
        // Match student's group to a department
        const grp = groups.find(g => g.groupCode === s.group);
        const dept = grp?.department || "General";
        if (!deptMap[dept]) {
          deptMap[dept] = { name: dept, groups: [], lecturers: [], students: [] };
        }
        deptMap[dept].students.push(s);
      });

      setDepts(Object.values(deptMap).sort((a, b) => a.name.localeCompare(b.name)));
    } catch {
      setError("Failed to load departments. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleExpand = (name: string) =>
    setExpanded(prev => prev === name ? null : name);

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
                Departments
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {depts.length} department{depts.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button onClick={load} disabled={loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white active:scale-95"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Summary stats */}
          {!loading && depts.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-5 stagger-1">
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                  {depts.length}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Departments</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"var(--orange)" }}>
                  {depts.reduce((s, d) => s + d.lecturers.length, 0)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Lecturers</p>
              </div>
              <div className="stat-card text-center">
                <p className="text-2xl font-black" style={{ fontFamily:"Sora,sans-serif", color:"#059669" }}>
                  {depts.reduce((s, d) => s + d.students.length, 0)}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color:"var(--text-3)" }}>Students</p>
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
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-[16px] animate-pulse"
                  style={{ background:"rgba(15,45,94,0.06)", animationDelay:`${i*0.08}s` }} />
              ))}
            </div>
          )}

          {/* Department cards */}
          {!loading && depts.map((dept, di) => {
            const palette   = DEPT_COLORS[di % DEPT_COLORS.length];
            const isOpen    = expanded === dept.name;

            return (
              <div key={dept.name} className={`ndc-card mb-4 stagger-${Math.min(di+2,6)}`}>

                {/* Header row — tap to expand */}
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer"
                  onClick={() => toggleExpand(dept.name)}>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: palette.bg }}>
                    <Building2 size={22} style={{ color: palette.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                      {dept.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs" style={{ color:"var(--text-3)" }}>
                        <BookOpen size={11} /> {dept.groups.length} group{dept.groups.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color:"var(--text-3)" }}>
                        <Users size={11} /> {dept.lecturers.length} lecturer{dept.lecturers.length !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 text-xs" style={{ color:"var(--text-3)" }}>
                        <GraduationCap size={11} /> {dept.students.length} student{dept.students.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} style={{
                    color:"var(--text-3)",
                    transform: isOpen ? "rotate(90deg)" : "none",
                    transition:"transform 0.2s",
                    flexShrink:0,
                  }} />
                </div>

                {/* Progress bar */}
                <div className="px-4">
                  <div className="progress-bar mb-0">
                    <div className="progress-fill" style={{
                      width: depts.reduce((s,d)=>s+d.students.length,0) > 0
                        ? `${(dept.students.length / Math.max(...depts.map(d=>d.students.length||1)) * 100)}%`
                        : "10%",
                      background:`linear-gradient(90deg, ${palette.color}, ${palette.color}88)`
                    }} />
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div className="border-t mt-3" style={{ borderColor:"var(--bg-2)" }}>

                    {/* Groups in this dept */}
                    {dept.groups.length > 0 && (
                      <div className="p-4 pb-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                          style={{ color:"var(--text-3)", fontFamily:"Sora,sans-serif" }}>
                          Groups
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {dept.groups.map(g => (
                            <button key={g.groupCode}
                              onClick={e => { e.stopPropagation(); navigate(`/admin/students?group=${encodeURIComponent(g.groupCode)}`); }}
                              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-95"
                              style={{ background: palette.bg, color: palette.color, border:`1px solid ${palette.color}30` }}>
                              {g.groupCode}
                              <span className="badge-gray rounded-full px-1.5 py-0.5 text-[9px] ml-1"
                                style={{ background:"rgba(0,0,0,0.08)" }}>
                                {g.sections.length} sec
                              </span>
                              <ChevronRight size={10} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lecturers in this dept */}
                    {dept.lecturers.length > 0 && (
                      <div className="p-4 pt-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider mb-2"
                          style={{ color:"var(--text-3)", fontFamily:"Sora,sans-serif" }}>
                          Lecturers
                        </p>
                        <div className="space-y-2">
                          {dept.lecturers.map(lec => (
                            <div key={lec.uid}
                              className="flex items-center gap-2 p-2 rounded-xl"
                              style={{ background:"var(--surface-2)" }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                                style={{ background: palette.bg, color: palette.color, fontFamily:"Sora,sans-serif" }}>
                                {lec.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate" style={{ color:"var(--text-1)" }}>
                                  {lec.name}
                                </p>
                                <p className="text-[10px]" style={{ color:"var(--text-3)" }}>
                                  {lec.designation}
                                  {lec.isIncharge ? ` · Incharge ${lec.group}-${lec.section}` : ""}
                                </p>
                              </div>
                              <span className={`badge text-[9px] ${lec.status==="active"?"badge-green":"badge-red"}`}>
                                {lec.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View all students button */}
                    <div className="p-4 pt-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          navigate("/admin/students");
                        }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-98"
                        style={{ background: palette.bg, color: palette.color, border:`1px solid ${palette.color}25` }}>
                        <GraduationCap size={13} />
                        View {dept.students.length} Student{dept.students.length !== 1 ? "s" : ""}
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty */}
          {!loading && depts.length === 0 && !error && (
            <div className="ndc-card text-center py-12">
              <Building2 size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                No departments found
              </p>
              <p className="text-sm mt-1" style={{ color:"var(--text-3)" }}>
                Add a Department column to the Login Sheet → Groups tab
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default DepartmentsPage;
