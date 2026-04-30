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
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// ═══════════════════════════════════════════════════════════════
// TYPES — match Apps Script field names exactly
// ═══════════════════════════════════════════════════════════════
export interface UserProfile {
  uid:         string;
  role:        "student" | "lecturer" | "admin";
  name:        string;
  email:       string;
  status:      string;
  // Student fields
  rollNo?:     string;
  group?:      string;
  section?:    string;
  semester?:   number;
  phone?:      string;
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
  id:       string;
  title:    string;
  content:  string;
  postedBy: string;
  postedAt: Timestamp | null;
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
  if (!snap.exists()) {
    throw new Error("User profile not found. Please contact admin.");
  }
  return { uid, ...snap.data() } as UserProfile;
}

export async function getAllStudents(): Promise<StudentProfile[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("name"))
  );
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter(u => u.role === "student") as StudentProfile[];
}

export async function getAllLecturers(): Promise<LecturerProfile[]> {
  const snap = await getDocs(
    query(collection(db, "users"), orderBy("name"))
  );
  return snap.docs
    .map(d => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter(u => u.role === "lecturer") as LecturerProfile[];
}

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════
export async function getNotifications(): Promise<Notice[]> {
  const snap = await getDocs(
    query(collection(db, "notifications"), orderBy("postedAt", "desc"))
  );
  return snap.docs.map(d => ({
    id:       d.id,
    title:    d.data().title    || "",
    content:  d.data().content  || "",
    postedBy: d.data().postedBy || "",
    postedAt: d.data().postedAt || null,
  }));
}

export async function addNotification(
  title:    string,
  content:  string,
  postedBy: string
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    title,
    content,
    postedBy,
    postedAt: serverTimestamp(),
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await deleteDoc(doc(db, "notifications", id));
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
