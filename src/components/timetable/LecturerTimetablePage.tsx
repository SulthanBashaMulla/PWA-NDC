import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import { DAYS, SESSION_LABELS, getTodayName } from "@/firebase/timetable";
import { useWeekTimetable } from "@/hooks/useTimetable";
import type { Day } from "@/firebase/timetable";
import { Clock } from "lucide-react";

const LecturerTimetablePage = () => {
  const { user }   = useAuth();
  const group      = (user as any)?.group    || "";
  const section    = (user as any)?.section  || "";
  const isIncharge = (user as any)?.isIncharge || false; // ← fixed: was user?.roles?.includes()
  const lecturerId = (user as any)?.lecturerId || "";

  const todayName             = getTodayName();
  const [selectedDay, setDay] = useState<Day>(todayName);

  const { week, loading } = useWeekTimetable(
    group || undefined, section || undefined
  );

  const dayData  = week?.[selectedDay];

  // Filter: incharge sees ALL slots for their class
  // Non-incharge sees only their own slots
  const fnSlots  = (dayData?.foreNoon  ?? []).filter(s => isIncharge || s.lecturerId === lecturerId);
  const anSlots  = (dayData?.afterNoon ?? []).filter(s => isIncharge || s.lecturerId === lecturerId);
  const hasSlots = fnSlots.length > 0 || anSlots.length > 0;

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
              {isIncharge ? `Class Incharge — ${group} Section ${section}` : "My assigned periods"}
            </p>
          </div>

          {/* Day selector */}
          <div className="ndc-tabs mb-5 stagger-1 overflow-x-auto">
            {DAYS.map(d => (
              <button key={d} onClick={() => setDay(d)}
                className={`ndc-tab whitespace-nowrap ${selectedDay === d ? "active" : ""}`}
                style={{ minWidth:60 }}>
                {d === todayName ? `${d.slice(0,3)} ✦` : d.slice(0,3)}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-16 rounded-[16px] animate-pulse" style={{ background:"rgba(15,45,94,0.06)" }} />
              ))}
            </div>
          )}

          {/* No slots */}
          {!loading && !hasSlots && (
            <div className="ndc-card text-center py-12">
              <Clock size={32} className="mx-auto mb-3 opacity-30" style={{ color:"var(--navy)" }} />
              <p className="font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                {isIncharge ? `No classes on ${selectedDay}` : `No periods assigned on ${selectedDay}`}
              </p>
            </div>
          )}

          {/* Fore Noon */}
          {!loading && fnSlots.length > 0 && (
            <div className="mb-4 stagger-2">
              <p className="section-title mb-3">Fore Noon</p>
              <div className="ndc-card">
                <div className="divide-y" style={{ borderColor:"var(--bg-2)" }}>
                  {fnSlots.map(slot => (
                    <div key={slot.id} className="flex items-center gap-3 p-3">
                      <div className="w-16 text-center shrink-0">
                        <p className="text-xs font-bold" style={{ color:"var(--navy)" }}>{slot.startTime}</p>
                        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{slot.endTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                          {slot.subjectName}
                        </p>
                        <p className="text-xs" style={{ color:"var(--text-3)" }}>{slot.subjectCode}</p>
                        {isIncharge && (
                          <p className="text-xs" style={{ color:"var(--orange)" }}>
                            {slot.lecturerName} ({slot.lecturerId})
                          </p>
                        )}
                      </div>
                      {slot.room && (
                        <span className="badge badge-navy text-[10px] shrink-0">🏫 {slot.room}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* After Noon */}
          {!loading && anSlots.length > 0 && (
            <div className="stagger-3">
              <p className="section-title mb-3">After Noon</p>
              <div className="ndc-card">
                <div className="divide-y" style={{ borderColor:"var(--bg-2)" }}>
                  {anSlots.map(slot => (
                    <div key={slot.id} className="flex items-center gap-3 p-3">
                      <div className="w-16 text-center shrink-0">
                        <p className="text-xs font-bold" style={{ color:"var(--navy)" }}>{slot.startTime}</p>
                        <p className="text-[10px]" style={{ color:"var(--text-3)" }}>{slot.endTime}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                          {slot.subjectName}
                        </p>
                        <p className="text-xs" style={{ color:"var(--text-3)" }}>{slot.subjectCode}</p>
                        {isIncharge && (
                          <p className="text-xs" style={{ color:"var(--orange)" }}>
                            {slot.lecturerName} ({slot.lecturerId})
                          </p>
                        )}
                      </div>
                      {slot.room && (
                        <span className="badge badge-orange text-[10px] shrink-0">🏫 {slot.room}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LecturerTimetablePage;
