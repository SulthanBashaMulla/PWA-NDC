// src/firebase/auth.ts
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { auth } from "./config";
import { getUserProfile } from "./firestore";

// ── Role → email converter ──────────────────────────────────
// Students  : rollNo    → rollno@college.student
// Lecturers : lecId     → lecid@college.lecturer
// Admins    : adminId   → adminid@college.admin

export function buildEmail(id: string, role: "student" | "lecturer" | "admin"): string {
  const clean = id.trim().toLowerCase();
  const domain =
    role === "student"  ? "college.student"  :
    role === "lecturer" ? "college.lecturer" :
                          "college.admin";
  return `${clean}@${domain}`;
}

// ── Login ────────────────────────────────────────────────────
export async function loginUser(
  id: string,
  password: string,
  role: "student" | "lecturer" | "admin"
) {
  const email = buildEmail(id, role);

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const profile    = await getUserProfile(credential.user.uid);

    if (!profile) throw new Error("Profile not found. Contact admin.");
    if (profile.status === "inactive") throw new Error("Your account is inactive. Contact admin.");
    if (profile.role !== role) throw new Error(`This ID does not belong to a ${role} account.`);

    return { user: credential.user, profile };

  } catch (err: any) {
    // Make Firebase errors human-readable
    const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
      ? "Incorrect ID or password."
      : err.code === "auth/user-not-found"
      ? "No account found with this ID."
      : err.code === "auth/too-many-requests"
      ? "Too many failed attempts. Try again later."
      : err.message || "Login failed.";
    throw new Error(msg);
  }
}

// ── Logout ───────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Auth state listener ──────────────────────────────────────
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
