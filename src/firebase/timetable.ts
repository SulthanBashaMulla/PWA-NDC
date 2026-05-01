// src/firebase/timetable.ts
// ═══════════════════════════════════════════════════════════════
// Timetable persistence — Firestore (UPDATED WITH SESSION LOGIC)
// ═══════════════════════════════════════════════════════════════

import {
  doc,
  collection,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./config";

// ── Types ────────────────────────────────────────────────────
export type Day =
  | "Monday" | "Tuesday" | "Wednesday"
  | "Thursday" | "Friday" | "Saturday";

export const DAYS: Day[] = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export type Session = "foreNoon" | "afterNoon";

export const SESSIONS: { value: Session; label: string }[] = [
  { value: "foreNoon",  label: "Fore Noon"  },
  { value: "afterNoon", label: "After Noon" },
];

export interface TimetableSlot {
  id: string;
  startTime: string;
  endTime: string;
  subjectCode: string;
  subjectName: string;
  lecturerId: string;
  lecturerName: string;
  room?: string;
  notes?: string;
}

export interface DayTimetable {
  day: Day;
  foreNoon: TimetableSlot[];
  afterNoon: TimetableSlot[];
  updatedAt: Timestamp | null;
  updatedBy: string;
}

// ── Doc path helpers ─────────────────────────────────────────
export function classKey(group: string, section: string): string {
  return `${group.trim().replace(/\s+/g, "_")}_${section.trim()}`;
}

function classDocRef(group: string, section: string) {
  return doc(db, "timetables", classKey(group, section));
}

function dayDocRef(group: string, section: string, day: Day) {
  return doc(db, "timetables", classKey(group, section), "days", day);
}

function daysColRef(group: string, section: string) {
  return collection(db, "timetables", classKey(group, section), "days");
}

// ── 🆕 SESSION HELPER (IMPORTANT) ─────────────────────────────
export function filterBySession(
  day: DayTimetable,
  session: Session
): TimetableSlot[] {
  return session === "foreNoon" ? day.foreNoon : day.afterNoon;
}

// ── Reads ────────────────────────────────────────────────────
export async function getDayTimetable(
  group: string,
  section: string,
  day: Day,
): Promise<DayTimetable> {
  const snap = await getDoc(dayDocRef(group, section, day));
  if (!snap.exists()) {
    return { day, foreNoon: [], afterNoon: [], updatedAt: null, updatedBy: "" };
  }
  const data = snap.data() as Partial<DayTimetable>;
  return {
    day,
    foreNoon:  data.foreNoon  ?? [],
    afterNoon: data.afterNoon ?? [],
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy ?? "",
  };
}

export async function getWeekTimetable(
  group: string,
  section: string,
): Promise<Record<Day, DayTimetable>> {
  const snap = await getDocs(daysColRef(group, section));
  const out = {} as Record<Day, DayTimetable>;

  for (const d of DAYS) {
    out[d] = { day: d, foreNoon: [], afterNoon: [], updatedAt: null, updatedBy: "" };
  }

  snap.forEach(s => {
    const id = s.id as Day;
    if (!DAYS.includes(id)) return;

    const data = s.data() as Partial<DayTimetable>;
    out[id] = {
      day: id,
      foreNoon: data.foreNoon ?? [],
      afterNoon: data.afterNoon ?? [],
      updatedAt: data.updatedAt ?? null,
      updatedBy: data.updatedBy ?? "",
    };
  });

  return out;
}

// ── Realtime subscriptions ───────────────────────────────────
export function subscribeToWeek(
  group: string,
  section: string,
  cb: (week: Record<Day, DayTimetable>) => void,
): Unsubscribe {
  return onSnapshot(daysColRef(group, section), snap => {
    const out = {} as Record<Day, DayTimetable>;

    for (const d of DAYS) {
      out[d] = { day: d, foreNoon: [], afterNoon: [], updatedAt: null, updatedBy: "" };
    }

    snap.forEach(s => {
      const id = s.id as Day;
      if (!DAYS.includes(id)) return;

      const data = s.data() as Partial<DayTimetable>;
      out[id] = {
        day: id,
        foreNoon: data.foreNoon ?? [],
        afterNoon: data.afterNoon ?? [],
        updatedAt: data.updatedAt ?? null,
        updatedBy: data.updatedBy ?? "",
      };
    });

    cb(out);
  });
}

// ── 🆕 VALIDATION FUNCTION ────────────────────────────────────
export function validateSessionData(
  session: Session,
  foreNoon: TimetableSlot[],
  afterNoon: TimetableSlot[]
): void {
  if (session === "foreNoon" && afterNoon.length > 0) {
    throw new Error("After Noon must be empty for Fore Noon groups");
  }

  if (session === "afterNoon" && foreNoon.length > 0) {
    throw new Error("Fore Noon must be empty for After Noon groups");
  }
}

// ── Writes ───────────────────────────────────────────────────
export async function saveDayBoth(
  group: string,
  section: string,
  day: Day,
  foreNoon: TimetableSlot[],
  afterNoon: TimetableSlot[],
  adminUid: string,
): Promise<void> {

  await setDoc(
    classDocRef(group, section),
    { group, section, updatedAt: serverTimestamp() },
    { merge: true },
  );

  await setDoc(
    dayDocRef(group, section, day),
    {
      foreNoon,
      afterNoon,
      updatedAt: serverTimestamp(),
      updatedBy: adminUid,
    },
    { merge: true },
  );
}

// ── Lecturer-centric reads ───────────────────────────────────
export async function getLecturerWeek(
  classes: { group: string; section: string }[],
  lecturerUid: string,
) {
  const out: any[] = [];

  await Promise.all(classes.map(async ({ group, section }) => {
    const week = await getWeekTimetable(group, section);

    for (const day of DAYS) {
      for (const session of ["foreNoon", "afterNoon"] as Session[]) {
        for (const slot of week[day][session]) {
          if (slot.lecturerId === lecturerUid) {
            out.push({ group, section, day, session, slot });
          }
        }
      }
    }
  }));

  return out;
}

// ── Slot id helper ────────────────────────────────────────────
export function newSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}