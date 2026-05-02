import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import { DAYS, getTodayName } from "@/firebase/timetable";
import { useWeekTimetable } from "@/hooks/useTimetable";
import type { Day } from "@/firebase/timetable";
import { Clock } from "lucide-react";

const StudentTimetablePage = () => {
  const { user }  = useAuth();
  const group     = (user as any)?.group   || "";
  const section   = (user as any)?.section || "";
  const todayName = getTodayName();

  const [selectedDay, setDay] = useState<Day>(todayName);
  const { week, loading }     = useWeekTimetable(group || undefined, section || undefined);

  const dayData = week?.[selectedDay];
  const fnSlots = dayData?.foreNoon  ?? [];
  const anSlots = dayData?.afterNoon ?? [];
  const hasSlots = fnSlots.length > 0 || anSlots.length > 0;

  const SlotCard = ({ slot, session }: { slot: any; session: "FN"|"AN" }) => (
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
        <p className="text-sm font-bold line-clamp-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
          {slot.subjectName}
        </p>
        <p className="text-xs" style={{ color:"var(--text-3)" }}>{slot.lecturerName}</p>
        {slot.notes && <p className="text-xs mt-0.5 italic" style={{ color:"var(--text-3)" }}>{slot.notes}</p>}
      </div>
      {slot.room && (
        <span className="badge badge-gray text-[10px] shrink-0">🏫 {slot.room}</span>
      )}
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="mb-5 animate-fade-in-up">
            <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
              Timetable
            </h1>
            <p className="text-sm" style={{ color:"var(--text-3)" }}>
              {group} · Section {section}
            </p>
          </div>

          {/* Day selector */}
          <div className="ndc-tabs mb-5 stagger-1 overflow-x-auto gap-1">
            {DAYS.map(d => (
              <button key={d} onClick={() => setDay(d)}
                className={`ndc-tab whitespace-nowrap ${selectedDay === d ? "active" : ""}`}
                style={{ minWidth:56, fontSize:11 }}>
                {d === todayName ? `${d.slice(0,3)} ✦` : d.slice(0,3)}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-14 rounded-[16px] animate-pulse"
                  style={{ background:"rgba(15,45,94,0.06)", animationDelay:`${i*0.07}s` }} />
              ))}
            </div>
          )}

          {/* No classes */}
          {!loading && !hasSlots && (
            <div className="ndc-card text-center py-14">
              <Clock size={34} className="mx-auto mb-3 opacity-25" style={{ color:"var(--navy)" }} />
              <p className="font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                No classes on {selectedDay}
              </p>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>Enjoy your free day! 🎉</p>
            </div>
          )}

          {/* All slots in one card */}
          {!loading && hasSlots && (
            <div className="ndc-card stagger-2">
              <div className="ndc-card-header">
                <h3>{selectedDay}{selectedDay === todayName ? " — Today" : ""}</h3>
                <span className="badge badge-orange text-[10px]">
                  {fnSlots.length + anSlots.length} periods
                </span>
              </div>

              {/* Fore Noon */}
              {fnSlots.length > 0 && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2"
                    style={{ background:"rgba(15,45,94,0.04)", borderBottom:`1px solid var(--bg-2)` }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--navy)" }}>
                      ☀️ Fore Noon
                    </span>
                  </div>
                  {fnSlots.map(s => <SlotCard key={s.id} slot={s} session="FN" />)}
                </>
              )}

              {/* After Noon */}
              {anSlots.length > 0 && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2"
                    style={{ background:"rgba(232,96,28,0.04)", borderBottom:`1px solid var(--bg-2)` }}>
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color:"var(--orange)" }}>
                      🌤 After Noon
                    </span>
                  </div>
                  {anSlots.map(s => <SlotCard key={s.id} slot={s} session="AN" />)}
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StudentTimetablePage;
