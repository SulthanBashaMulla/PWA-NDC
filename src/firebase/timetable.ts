// src/firebase/timetable.ts
// Timetable persistence — Firestore
// Reads always return BOTH sessions (FN + AN).
// Session filtering happens in the UI, not here.
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

// ── TYPES ─────────────────────────────────────────────────────
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

export const SESSION_LABELS: Record<Session, string> = {
  foreNoon:  "Fore Noon",
  afterNoon: "After Noon",
};

export interface TimetableSlot {
  id:           string;
  startTime:    string;
  endTime:      string;
  subjectCode:  string;
  subjectName:  string;
  lecturerId:   string;
  lecturerName: string;
  room?:        string;
  notes?:       string;
}

export interface DayTimetable {
  day:       Day;
  foreNoon:  TimetableSlot[];
  afterNoon: TimetableSlot[];
  updatedAt: Timestamp | null;
  updatedBy: string;
}

// ── PATH HELPERS ──────────────────────────────────────────────
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

// ── EMPTY DAY FACTORY ─────────────────────────────────────────
function emptyDay(day: Day): DayTimetable {
  return { day, foreNoon: [], afterNoon: [], updatedAt: null, updatedBy: "" };
}

function parseDay(day: Day, data: any): DayTimetable {
  return {
    day,
    foreNoon:  Array.isArray(data?.foreNoon)  ? data.foreNoon  : [],
    afterNoon: Array.isArray(data?.afterNoon) ? data.afterNoon : [],
    updatedAt: data?.updatedAt ?? null,
    updatedBy: data?.updatedBy ?? "",
  };
}

// ── READS (returns all sessions — filter in UI) ───────────────
export async function getDayTimetable(
  group: string, section: string, day: Day,
): Promise<DayTimetable> {
  const snap = await getDoc(dayDocRef(group, section, day));
  return snap.exists() ? parseDay(day, snap.data()) : emptyDay(day);
}

export async function getWeekTimetable(
  group: string, section: string,
): Promise<Record<Day, DayTimetable>> {
  const snap = await getDocs(daysColRef(group, section));
  const out  = {} as Record<Day, DayTimetable>;
  for (const d of DAYS) out[d] = emptyDay(d);
  snap.forEach(s => {
    const id = s.id as Day;
    if (DAYS.includes(id)) out[id] = parseDay(id, s.data());
  });
  return out;
}

// ── REALTIME ──────────────────────────────────────────────────
export function subscribeToDay(
  group: string, section: string, day: Day,
  cb: (data: DayTimetable) => void,
): Unsubscribe {
  return onSnapshot(dayDocRef(group, section, day), snap => {
    cb(snap.exists() ? parseDay(day, snap.data()) : emptyDay(day));
  });
}

export function subscribeToWeek(
  group: string, section: string,
  cb: (week: Record<Day, DayTimetable>) => void,
): Unsubscribe {
  return onSnapshot(daysColRef(group, section), snap => {
    const out = {} as Record<Day, DayTimetable>;
    for (const d of DAYS) out[d] = emptyDay(d);
    snap.forEach(s => {
      const id = s.id as Day;
      if (DAYS.includes(id)) out[id] = parseDay(id, s.data());
    });
    cb(out);
  });
}

// ── WRITE (ADMIN) ─────────────────────────────────────────────
export async function saveDayBoth(
  group: string, section: string, day: Day,
  foreNoon: TimetableSlot[], afterNoon: TimetableSlot[],
  adminUid: string,
): Promise<void> {
  await setDoc(
    classDocRef(group, section),
    { group, section, updatedAt: serverTimestamp() },
    { merge: true },
  );
  await setDoc(
    dayDocRef(group, section, day),
    { foreNoon, afterNoon, updatedAt: serverTimestamp(), updatedBy: adminUid },
    { merge: true },
  );
}

// Save only one session, preserve the other
export async function saveSession(
  group: string, section: string, day: Day,
  session: Session, slots: TimetableSlot[],
  adminUid: string,
): Promise<void> {
  const existing = await getDayTimetable(group, section, day);
  const foreNoon  = session === "foreNoon"  ? slots : existing.foreNoon;
  const afterNoon = session === "afterNoon" ? slots : existing.afterNoon;
  await saveDayBoth(group, section, day, foreNoon, afterNoon, adminUid);
}

// ── LECTURER VIEW — all slots assigned to them ────────────────
export async function getLecturerWeek(
  classes: { group: string; section: string }[],
  lecturerId: string,
) {
  const out: {
    group: string; section: string; day: Day; session: Session; slot: TimetableSlot;
  }[] = [];

  await Promise.all(classes.map(async ({ group, section }) => {
    const week = await getWeekTimetable(group, section);
    for (const day of DAYS) {
      for (const session of ["foreNoon", "afterNoon"] as Session[]) {
        for (const slot of week[day][session]) {
          if (slot.lecturerId === lecturerId) {
            out.push({ group, section, day, session, slot });
          }
        }
      }
    }
  }));

  return out;
}

// ── TODAY HELPER ──────────────────────────────────────────────
export function getTodayName(): Day {
  const days: (Day | "Sunday")[] = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
  ];
  const name = days[new Date().getDay()];
  // If Sunday or out of range, return Monday
  return (DAYS.includes(name as Day) ? name : "Monday") as Day;
}

// ── ID HELPER ─────────────────────────────────────────────────
export function newSlotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `slot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
