// src/hooks/useTimetable.ts
// Realtime hooks for weekly/daily timetable.
// Reads ALL sessions — session filtering is done in the UI.
import { useEffect, useState } from "react";
import {
  DAYS, DayTimetable, Day,
  subscribeToWeek, subscribeToDay,
} from "@/firebase/timetable";

// ── WEEK HOOK ─────────────────────────────────────────────────
export function useWeekTimetable(
  group:   string | undefined,
  section: string | undefined,
) {
  const [week,    setWeek]    = useState<Record<Day, DayTimetable> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!group || !section) {
      setWeek(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsub = subscribeToWeek(group, section, w => {
      // Ensure all days exist even if Firestore has no doc for them
      const filled = {} as Record<Day, DayTimetable>;
      for (const d of DAYS) {
        filled[d] = w[d] ?? {
          day: d, foreNoon: [], afterNoon: [], updatedAt: null, updatedBy: "",
        };
      }
      setWeek(filled);
      setLoading(false);
    });

    return () => unsub();
  }, [group, section]);

  return { week, loading, error };
}

// ── DAY HOOK ──────────────────────────────────────────────────
export function useDayTimetable(
  group:   string | undefined,
  section: string | undefined,
  day:     Day   | undefined,
) {
  const [data,    setData]    = useState<DayTimetable | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!group || !section || !day) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsub = subscribeToDay(group, section, day, d => {
      setData(d);
      setLoading(false);
    });

    return () => unsub();
  }, [group, section, day]);

  return { data, loading };
}
