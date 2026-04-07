// src/firebase/firestore.ts
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// ── Types ────────────────────────────────────────────────────

export interface StudentProfile {
  uid:        string;
  email:      string;
  rollNo:     string;
  name:       string;
  role:       "student";
  group:      string;
  section:    string;
  semester:   number;
  phone:      string;
  status:     "active" | "inactive";
}

export interface LecturerProfile {
  uid:          string;
  email:        string;
  lecturerId:   string;
  name:         string;
  role:         "lecturer";
  department:   string;
  designation:  string;
  isIncharge:   boolean;
  group:        string | null;
  section:      string | null;
  status:       "active" | "inactive";
}

export interface AdminProfile {
  uid:         string;
  email:       string;
  adminId:     string;
  name:        string;
  role:        "admin";
  designation: string;
  phone:       string;
  status:      "active" | "inactive";
}

export type UserProfile = StudentProfile | LecturerProfile | AdminProfile;

export interface Notice {
  id:        string;
  title:     string;
  content:   string;
  postedBy:  string;
  postedAt:  Timestamp;
}

export interface Circular {
  id:          string;
  title:       string;
  description: string;
  author:      string;
  date:        Timestamp;
}

// ── Get user profile from Firestore ─────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

// ── Notifications ────────────────────────────────────────────
export async function getNotifications(): Promise<Notice[]> {
  const q = query(
    collection(db, "notifications"),
    orderBy("postedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Notice));
}

export async function addNotification(
  title: string,
  content: string,
  postedBy: string
) {
  await addDoc(collection(db, "notifications"), {
    title, content, postedBy,
    postedAt: serverTimestamp()
  });
}

export async function deleteNotification(id: string) {
  await deleteDoc(doc(db, "notifications", id));
}

// ── Circulars ────────────────────────────────────────────────
export async function getCirculars(): Promise<Circular[]> {
  const q = query(
    collection(db, "circulars"),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Circular));
}

export async function addCircular(
  title: string,
  description: string,
  author: string
) {
  await addDoc(collection(db, "circulars"), {
    title, description, author,
    date: serverTimestamp()
  });
}

export async function deleteCircular(id: string) {
  await deleteDoc(doc(db, "circulars", id));
}

// ── Admin: get all lecturers ─────────────────────────────────
export async function getAllLecturers(): Promise<LecturerProfile[]> {
  const q = query(
    collection(db, "users"),
    where("role", "==", "lecturer")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as LecturerProfile));
}

// ── Admin: get all students (optionally filter group+section) ─
export async function getAllStudents(
  group?: string,
  section?: string
): Promise<StudentProfile[]> {
  let q = query(collection(db, "users"), where("role", "==", "student"));
  if (group)   q = query(q, where("group",   "==", group));
  if (section) q = query(q, where("section", "==", section));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as StudentProfile));
}

// ── Lecturer: get students in their section only ─────────────
export async function getSectionStudents(
  group: string,
  section: string
): Promise<StudentProfile[]> {
  const q = query(
    collection(db, "users"),
    where("role",    "==", "student"),
    where("group",   "==", group),
    where("section", "==", section)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ uid: d.id, ...d.data() } as StudentProfile));
}
