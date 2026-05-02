// src/firebase/firestore.ts
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "./config";

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════
export interface UserProfile {
  uid:          string;
  role:         "student" | "lecturer" | "admin";
  name:         string;
  email:        string;
  status:       string;
  // Student fields
  rollNo?:      string;
  group?:       string;
  section?:     string;
  semester?:    number;
  phone?:       string;
  // Lecturer fields
  lecturerId?:  string;
  department?:  string;
  designation?: string;
  isIncharge?:  boolean;
  // Admin fields
  adminId?:     string;
}

export interface StudentProfile extends UserProfile {
  role:     "student";
  rollNo:   string;
  group:    string;
  section:  string;
  semester: number;
}

export interface LecturerProfile extends UserProfile {
  role:        "lecturer";
  lecturerId:  string;
  department:  string;
  designation: string;
  isIncharge:  boolean;
}

export interface Notice {
  id:        string;
  title:     string;
  content:   string;
  postedBy:  string;
  postedAt:  Timestamp | null;
  expiresAt: Timestamp | null; // auto-delete after 30 days
}

export interface Circular {
  id:          string;
  title:       string;
  description: string;
  author:      string;
  date:        Timestamp | null;
}

// ═══════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════
export async function getUserProfile(uid: string): Promise<UserProfile> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) throw new Error("User profile not found. Please contact admin.");
  return { uid, ...snap.data() } as UserProfile;
}

export async function getAllStudents(): Promise<StudentProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("name")));
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter(u => u.role === "student") as StudentProfile[];
}

export async function getAllLecturers(): Promise<LecturerProfile[]> {
  const snap = await getDocs(query(collection(db, "users"), orderBy("name")));
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter(u => u.role === "lecturer") as LecturerProfile[];
}

// Students filtered by group + section (for incharge lecturers)
export async function getStudentsByClass(
  group: string,
  section: string
): Promise<StudentProfile[]> {
  const all = await getAllStudents();
  return all.filter(s => s.group === group && s.section === section);
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// — Admin + Lecturer can post
// — All logged-in users can read
// — Admin can delete individually or bulk-delete expired
// ═══════════════════════════════════════════════════════════════

// 30-day expiry constant
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getNotifications(): Promise<Notice[]> {
  const snap = await getDocs(
    query(collection(db, "notifications"), orderBy("postedAt", "desc"))
  );
  const now = Date.now();
  return snap.docs
    .map(d => ({
      id:        d.id,
      title:     d.data().title     || "",
      content:   d.data().content   || "",
      postedBy:  d.data().postedBy  || "",
      postedAt:  d.data().postedAt  || null,
      expiresAt: d.data().expiresAt || null,
    }))
    // Client-side filter: hide expired notices
    .filter(n => {
      if (!n.expiresAt) return true; // no expiry = keep forever
      const expMs = n.expiresAt.toDate?.().getTime?.() ?? 0;
      return expMs > now;
    });
}

export async function addNotification(
  title:    string,
  content:  string,
  postedBy: string
): Promise<void> {
  const now       = new Date();
  const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
  await addDoc(collection(db, "notifications"), {
    title,
    content,
    postedBy,
    postedAt:  serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, "notifications", id));
}

// Delete ALL notices older than 30 days — called by admin manually
export async function deleteExpiredNotifications(): Promise<number> {
  const cutoff = Timestamp.fromDate(new Date(Date.now() - THIRTY_DAYS_MS));
  const snap   = await getDocs(
    query(
      collection(db, "notifications"),
      where("postedAt", "<=", cutoff)
    )
  );
  if (snap.empty) return 0;
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
  return snap.docs.length;
}

// ═══════════════════════════════════════════════════════════════
// CIRCULARS
// ═══════════════════════════════════════════════════════════════
export async function getCirculars(): Promise<Circular[]> {
  const snap = await getDocs(
    query(collection(db, "circulars"), orderBy("date", "desc"))
  );
  return snap.docs.map(d => ({
    id:          d.id,
    title:       d.data().title       || "",
    description: d.data().description || "",
    author:      d.data().author      || "",
    date:        d.data().date        || null,
  }));
}

export async function addCircular(
  title:       string,
  description: string,
  author:      string
): Promise<void> {
  await addDoc(collection(db, "circulars"), {
    title,
    description,
    author,
    date: serverTimestamp(),
  });
}

export async function deleteCircular(id: string): Promise<void> {
  await deleteDoc(doc(db, "circulars", id));
}
