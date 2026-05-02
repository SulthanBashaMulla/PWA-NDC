import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import { fetchGroups, GroupConfig } from "@/config/college";
import { DAYS, getTodayName } from "@/firebase/timetable";
import { useWeekTimetable } from "@/hooks/useTimetable";
import type { Day } from "@/firebase/timetable";
import { ChevronRight, Edit3, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminTimetablePage = () => {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const todayName   = getTodayName();

  const [groups,        setGroups]        = useState<GroupConfig[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupConfig | null>(null);
  const [selectedSec,   setSelectedSec]   = useState<string>("");
  const [selectedDay,   setDay]           = useState<Day>(todayName);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    fetchGroups()
      .then(g => {
        setGroups(g);
        if (g.length > 0) {
          setSelectedGroup(g[0]);
          setSelectedSec(g[0].sections[0] || "A");
        }
      })
      .catch(() => {})
      .finally(() => setLoadingGroups(false));
  }, []);

  const { week, loading: ttLoading } = useWeekTimetable(
    selectedGroup?.groupCode, selectedSec || undefined
  );

  const dayData  = week?.[selectedDay];
  const fnSlots  = dayData?.foreNoon  ?? [];
  const anSlots  = dayData?.afterNoon ?? [];
  const hasSlots = fnSlots.length > 0 || anSlots.length > 0;

  const SlotRow = ({ slot, session }: { slot: any; session: "FN"|"AN" }) => (
    <div className="flex items-center gap-3 p-3 border-b" style={{ borderColor:"var(--bg-2)" }}>
      <div className="w-16 text-center shrink-0">
        <p className="text-xs font-bold" style={{ color:"var(--navy)" }}>{slot.startTime}</p>
        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{slot.endTime}</p>
        <span className="badge text-[9px] mt-0.5"
          style={{
            background: session==="FN" ? "rgba(15,45,94,0.1)" : "rgba(232,96,28,0.1)",
            color:      session==="FN" ? "var(--navy)"         : "var(--orange)",
          }}>
          {session}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
          {slot.subjectName}
        </p>
        <p className="text-xs" style={{ color:"var(--orange)" }}>{slot.lecturerName}</p>
        {slot.room && <p className="text-xs" style={{ color:"var(--text-3)" }}>Room: {slot.room}</p>}
      </div>
    </div>
  );

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
                Timetable
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>View &amp; manage all class schedules</p>
            </div>
            {selectedGroup && selectedSec && (
              <button
                onClick={() => navigate(`/timetable/edit/${selectedGroup.groupCode}/${selectedSec}/${selectedDay}`)}
                className="btn-orange text-xs flex items-center gap-2"
                style={{ width:"auto", padding:"9px 16px" }}>
                <Edit3 size={14} /> Edit Schedule
              </button>
            )}
          </div>

          {/* Group + Section + Day filters */}
          <div className="ndc-card mb-4 stagger-1">
            <div className="p-4 flex flex-wrap gap-3">
              {/* Group selector */}
              <select
                value={selectedGroup?.groupCode || ""}
                onChange={e => {
                  const g = groups.find(x => x.groupCode === e.target.value);
                  if (g) { setSelectedGroup(g); setSelectedSec(g.sections[0] || "A"); }
                }}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}
                disabled={loadingGroups}>
                {loadingGroups
                  ? <option>Loading…</option>
                  : groups.map(g => <option key={g.groupCode} value={g.groupCode}>{g.groupCode}</option>)
                }
              </select>

              {/* Section selector */}
              <select
                value={selectedSec}
                onChange={e => setSelectedSec(e.target.value)}
                className="ndc-input" style={{ width:"auto", padding:"7px 12px", fontSize:"13px" }}>
                {(selectedGroup?.sections ?? []).map(s => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>

            {/* Day selector */}
            <div className="px-4 pb-4">
              <div className="ndc-tabs overflow-x-auto gap-1">
                {DAYS.map(d => (
                  <button key={d} onClick={() => setDay(d)}
                    className={`ndc-tab whitespace-nowrap ${selectedDay === d ? "active" : ""}`}
                    style={{ minWidth:56, fontSize:11 }}>
                    {d === todayName ? `${d.slice(0,3)} ✦` : d.slice(0,3)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {(loadingGroups || ttLoading) && (
            <div className="space-y-2">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 rounded-[16px] animate-pulse"
                  style={{ background:"rgba(15,45,94,0.06)" }} />
              ))}
            </div>
          )}

          {/* Empty */}
          {!loadingGroups && !ttLoading && !hasSlots && (
            <div className="ndc-card text-center py-12 stagger-2">
              <Clock size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold mb-2" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                No timetable for {selectedGroup?.groupCode} Sec {selectedSec} on {selectedDay}
              </p>
              {selectedGroup && selectedSec && (
                <button
                  onClick={() => navigate(`/timetable/edit/${selectedGroup.groupCode}/${selectedSec}/${selectedDay}`)}
                  className="btn-orange text-xs px-4 py-2" style={{ width:"auto" }}>
                  <Edit3 size={13} /> Create Schedule
                </button>
              )}
            </div>
          )}

          {/* Timetable slots */}
          {!loadingGroups && !ttLoading && hasSlots && (
            <div className="ndc-card stagger-2">
              <div className="ndc-card-header">
                <h3>{selectedGroup?.groupCode} Sec {selectedSec} — {selectedDay}</h3>
                <span className="badge badge-orange text-[10px]">
                  {fnSlots.length + anSlots.length} periods
                </span>
              </div>

              {fnSlots.length > 0 && (
                <>
                  <div className="px-4 py-2" style={{ background:"rgba(15,45,94,0.04)", borderBottom:`1px solid var(--bg-2)` }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--navy)" }}>
                      ☀️ Fore Noon
                    </span>
                  </div>
                  {fnSlots.map(s => <SlotRow key={s.id} slot={s} session="FN" />)}
                </>
              )}

              {anSlots.length > 0 && (
                <>
                  <div className="px-4 py-2" style={{ background:"rgba(232,96,28,0.04)", borderBottom:`1px solid var(--bg-2)` }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--orange)" }}>
                      🌤 After Noon
                    </span>
                  </div>
                  {anSlots.map(s => <SlotRow key={s.id} slot={s} session="AN" />)}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminTimetablePage;
