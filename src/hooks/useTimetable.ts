// src/hooks/useTimetable.ts  
// ═══════════════════════════════════════════════════════════════  
// Realtime hooks for the weekly timetable of one (group, section).  
// UPDATED: Added session-based filtering (foreNoon / afterNoon)
// ═══════════════════════════════════════════════════════════════  

import { useEffect, useState } from "react";  
import {  
  DAYS,  
  DayTimetable,  
  Day,  
  subscribeToWeek,  
  subscribeToDay,  
  Session  
} from "@/firebase/timetable";  

// 🆕 You must import your auth/user
import { useAuth } from "@/context/AuthContext";  


// ─────────────────────────────────────────────────────────────
// WEEK HOOK (UPDATED)
// ─────────────────────────────────────────────────────────────
export function useWeekTimetable(
  group: string | undefined,
  section: string | undefined
) {
  const { user } = useAuth(); // 🆕 get logged-in user
  const session: Session | undefined = user?.session;

  const [week, setWeek] = useState<Record<Day, DayTimetable> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!group || !section) {
      setWeek(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeToWeek(group, section, w => {

      const filled = {} as Record<Day, DayTimetable>;

      for (const d of DAYS) {
        const dayData = w[d] ?? {
          day: d,
          foreNoon: [],
          afterNoon: [],
          updatedAt: null,
          updatedBy: "",
        };

        // 🆕 APPLY SESSION FILTER HERE
        filled[d] = {
          ...dayData,
          foreNoon: session === "foreNoon" ? dayData.foreNoon : [],
          afterNoon: session === "afterNoon" ? dayData.afterNoon : [],
        };
      }

      setWeek(filled);
      setLoading(false);
    });

    return () => unsub();
  }, [group, section, session]);

  return { week, loading, error };
}


// ─────────────────────────────────────────────────────────────
// DAY HOOK (UPDATED)
// ─────────────────────────────────────────────────────────────
export function useDayTimetable(
  group: string | undefined,
  section: string | undefined,
  day: Day | undefined,
) {
  const { user } = useAuth(); // 🆕
  const session: Session | undefined = user?.session;

  const [data, setData] = useState<DayTimetable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group || !section || !day) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = subscribeToDay(group, section, day, d => {

      // 🆕 FILTER SESSION
      const filtered: DayTimetable = {
        ...d,
        foreNoon: session === "foreNoon" ? d.foreNoon : [],
        afterNoon: session === "afterNoon" ? d.afterNoon : [],
      };

      setData(filtered);
      setLoading(false);
    });

    return () => unsub();
  }, [group, section, day, session]);

  return { data, loading };
}