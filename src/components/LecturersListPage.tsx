// src/components/LecturersListPage.tsx
import { useState, useEffect } from "react";
import { getAllLecturers, LecturerProfile } from "../firebase/firestore";

export default function LecturersListPage() {
  const [lecturers, setLecturers]       = useState<LecturerProfile[]>([]);
  const [filtered, setFiltered]         = useState<LecturerProfile[]>([]);
  const [department, setDepartment]     = useState("All");
  const [search, setSearch]             = useState("");
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  // All unique departments for filter dropdown
  const departments = [
    "All",
    ...Array.from(new Set(lecturers.map((l) => l.department).filter(Boolean)))
  ];

  useEffect(() => {
    getAllLecturers()
      .then((data) => {
        setLecturers(data);
        setFiltered(data);
      })
      .catch(() => setError("Failed to load lecturers. Check your connection."))
      .finally(() => setLoading(false));
  }, []);

  // Filter whenever dept or search changes
  useEffect(() => {
    let result = lecturers;
    if (department !== "All") result = result.filter((l) => l.department === department);
    if (search.trim())
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.lecturerId.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [department, search, lecturers]);

  const designationColor = (d: string) => {
    if (d === "HOD")       return { bg: "rgba(249,115,22,0.15)", color: "#f97316" };
    if (d === "Principal") return { bg: "rgba(139,92,246,0.15)", color: "#8b5cf6" };
    return                        { bg: "rgba(59,130,246,0.15)",  color: "#3b82f6" };
  };

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
          👨‍🏫 Lecturers
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
          {filtered.length} of {lecturers.length} lecturers · Read-only view
        </p>
      </div>

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
        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or ID..."
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

        {/* Department filter */}
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1.5px solid rgba(203,213,225,0.7)",
            background: "rgba(248,250,252,0.9)",
            fontSize: 13.5,
            color: "#1e293b",
            outline: "none",
            cursor: "pointer"
          }}
        >
          {departments.map((d) => (
            <option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>
          ))}
        </select>
      </div>

      {/* States */}
      {loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          Loading lecturers...
        </div>
      )}
      {error && (
        <div style={{
          background: "rgba(239,68,68,0.1)", borderRadius: 12,
          padding: 14, color: "#dc2626", fontSize: 14, marginBottom: 12
        }}>{error}</div>
      )}

      {/* Lecturer Cards */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>
          No lecturers found.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map((lec) => {
          const dc = designationColor(lec.designation);
          return (
            <div key={lec.uid} style={{
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
                    {lec.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    ID: {lec.lecturerId}
                  </div>
                </div>
                <span style={{
                  background: dc.bg, color: dc.color,
                  borderRadius: 20, padding: "3px 10px",
                  fontSize: 11.5, fontWeight: 700
                }}>
                  {lec.designation}
                </span>
              </div>

              {/* Details row */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag icon="🏫" text={lec.department} />
                {lec.isIncharge && (
                  <Tag
                    icon="📋"
                    text={`Incharge: ${lec.group} - ${lec.section}`}
                    highlight
                  />
                )}
                <Tag
                  icon={lec.status === "active" ? "✅" : "🚫"}
                  text={lec.status}
                  color={lec.status === "active" ? "#10b981" : "#ef4444"}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Small tag component
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
