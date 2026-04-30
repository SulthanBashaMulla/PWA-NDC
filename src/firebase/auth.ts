// src/firebase/auth.ts
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./config";
import { getUserProfile } from "./firestore";
import type { UserProfile } from "./firestore";

export type UserRole = "student" | "lecturer" | "admin";

// ── Email format must match Apps Script ───────────────────────
// Students:  rollno@ndc.student
// Lecturers: lecturerid@ndc.lecturer
// Admins:    adminid@ndc.admin
function buildEmail(id: string, role: UserRole): string {
  const clean = id.trim().toLowerCase();
  switch (role) {
    case "student":  return `${clean}@ndc.student`;
    case "lecturer": return `${clean}@ndc.lecturer`;
    case "admin":    return `${clean}@ndc.admin`;
  }
}

// ── Login ─────────────────────────────────────────────────────
export async function loginUser(
  id:       string,
  password: string,
  role:     UserRole
): Promise<{ firebaseUser: FirebaseUser; profile: UserProfile }> {
  const email = buildEmail(id, role);

  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (err: any) {
    // Translate Firebase error codes to friendly messages
    switch (err.code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        throw new Error("Invalid ID or password. Please check and try again.");
      case "auth/too-many-requests":
        throw new Error("Too many failed attempts. Please wait a few minutes.");
      case "auth/network-request-failed":
        throw new Error("No internet connection. Please check your network.");
      case "auth/user-disabled":
        throw new Error("This account has been disabled. Contact admin.");
      default:
        throw new Error("Login failed. Please try again.");
    }
  }

  // Fetch Firestore profile
  const profile = await getUserProfile(credential.user.uid);

  // Safety check — role must match
  if (profile.role !== role) {
    await signOut(auth);
    throw new Error(
      `This ID belongs to a ${profile.role} account. Please select the correct role.`
    );
  }

  // Safety check — account must be active
  if (profile.status && profile.status !== "active") {
    await signOut(auth);
    throw new Error("Your account is inactive. Please contact admin.");
  }

  return { firebaseUser: credential.user, profile };
}

// ── Logout ────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// ── Change Password ───────────────────────────────────────────
export async function changePassword(newPassword: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in.");
  await updatePassword(user, newPassword);
}
