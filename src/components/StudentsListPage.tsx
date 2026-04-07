// src/components/StudentsListPage.tsx
import { useState, useEffect } from "react";
import { getAllStudents, StudentProfile } from "../firebase/firestore";

const GROUPS   = ["All", "MPC", "BiPC", "CEC", "HEC", "MEC"];
const SECTIONS = ["All", "A", "B", "C"];

export default function StudentsListPage() {
  const [students, setStudents]   = useState<StudentProfile[]>([]);
  const [filtered, setFiltered]   = useState<StudentProfile[]>([]);
  const [group, setGroup]         = useState("All");
  const [section, setSection]     = useState("All");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Stats
  const totalCount        = students.length;
  const groupCount        = group !== "All"
    ? students.filter((s) => s.group === group).length
    : null;
  const sectionCount      = section !== "All"
    ? students.filter((s) => s.section === section).length
    : null;

  useEffect(() => {
    getAllStudents()
      .then((data) => {
        setStudents(data);
        setFiltered(data);
      })
      .catch(() => setError("Failed to load students. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever group, section, or search changes
  useEffect(() => {
    let result = students;
    if (group   !== "All") result = result.filter((s) => s.group   === group);
    if (section !== "All") result = result.filter((s) => s.section === section);
    if (search.trim())
      result = result.filter(
        (s) =>
          s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [group, section, search, students]);

  // Group-wise counts for stat bar
  const groupStats = ["MPC", "BiPC", "CEC", "HEC", "MEC"].map((g) => ({
    group: g,
    count: students.filter((s) => s.group === g).length
  }));

  return (
    <div style={{ padding: "16px", minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.8)",
        padding: "16px 20px",
        marginBottom: 16,
        boxShadow: "0 4px 16px rgba(59,130,246,0.1)"
      }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#1e293b" }}>
          🎓 Students
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          {filtered.length} of {totalCount} students · Read-only view
        </p>
      </div>

      {/* Stats bar — group wise counts */}
      {!loading && students.length > 0 && (
        <div style={{
          display: "flex", gap: 8, overflowX: "auto",
          paddingBottom: 4, marginBottom: 16
        }}>
          <StatCard label="Total" count={totalCount} color="#3b82f6" />
          {groupStats.map((g) => (
            <StatCard key={g.group} label={g.group} count={g.count} color="#f97316" />
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.8)",
        padding: 16,
        marginBottom: 16,
        display: "flex",
        gap: 10,
        flexWrap: "wrap"
      }}>
        {/* Roll No / Name search */}
        <input
          type="text"
          placeholder="Search by Roll No or Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 160,
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(203,213,225,0.7)",
            background: "rgba(248,250,252,0.9)",
            fontSize: 13.5,
            outline: "none",
            color: "#1e293b"
          }}
        />

        {/* Group filter */}
        <select
          value={group}
          onChange={(e) => { setGroup(e.target.value); setSection("All"); }}
          style={selectStyle}
        >
          {GROUPS.map((g) => (
            <option key={g} value={g}>{g === "All" ? "All Groups" : g}</option>
          ))}
        </select>

        {/* Section filter */}
        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          style={selectStyle}
        >
          {SECTIONS.map((s) => (
            <option key={s} value={s}>{s === "All" ? "All Sections" : `Section ${s}`}</option>
          ))}
        </select>

        {/* Clear filters */}
        {(group !== "All" || section !== "All" || search) && (
          <button
            onClick={() => { setGroup("All"); setSection("All"); setSearch(""); }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1.5px solid rgba(249,115,22,0.4)",
              background: "rgba(249,115,22,0.08)",
              color: "#f97316",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Clear ✕
          </button>
        )}
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          Loading students...
        </div>
      )}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", borderRadius: 12,
          padding: 14, color: "#dc2626", fontSize: 14, marginBottom: 12
        }}>{error}</div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          No students found.
        </div>
      )}

      {/* Student Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((stu) => (
          <div key={stu.uid} style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(16px)",
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.8)",
            padding: "14px 16px",
            boxShadow: "0 2px 8px rgba(59,130,246,0.07)"
          }}>
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>
                  {stu.name}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  Roll No: <b>{stu.rollNo}</b>
                </div>
              </div>
              <span style={{
                background: "rgba(59,130,246,0.1)",
                color: "#3b82f6",
                borderRadius: 20, padding: "3px 10px",
                fontSize: 11.5, fontWeight: 700
              }}>
                Sem {stu.semester}
              </span>
            </div>

            {/* Details row */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Tag icon="🏫" text={stu.group} />
              <Tag icon="📌" text={`Section ${stu.section}`} highlight />
              <Tag icon="📞" text={stu.phone || "—"} />
              <Tag
                icon={stu.status === "active" ? "✅" : "🚫"}
                text={stu.status}
                color={stu.status === "active" ? "#10b981" : "#ef4444"}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

const selectStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1.5px solid rgba(203,213,225,0.7)",
  background: "rgba(248,250,252,0.9)",
  fontSize: 13.5,
  color: "#1e293b",
  outline: "none",
  cursor: "pointer"
};

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(12px)",
      borderRadius: 12,
      border: `1.5px solid ${color}30`,
      padding: "10px 16px",
      minWidth: 70,
      textAlign: "center",
      flexShrink: 0,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color }}>{count}</div>
      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function Tag({
  icon, text, highlight = false, color
}: {
  icon: string; text: string; highlight?: boolean; color?: string
}) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: highlight ? "rgba(59,130,246,0.1)" : "rgba(241,245,249,0.9)",
      color: color || (highlight ? "#3b82f6" : "#475569"),
      borderRadius: 8, padding: "3px 8px",
      fontSize: 12, fontWeight: highlight ? 700 : 500
    }}>
      {icon} {text}
    </span>
  );
}
