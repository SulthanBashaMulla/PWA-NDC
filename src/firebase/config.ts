// src/firebase/config.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ── Firebase config ───────────────────────────────────────────
// Using hardcoded values so Vercel never crashes on missing env vars.
// These are safe to expose in frontend code (protected by Firebase
// Security Rules in your console).
const firebaseConfig = {
  apiKey:            "AIzaSyAfJIPvOLuGM1j8ET35fPtLQd2PRMPbd1o",
  authDomain:        "ndc-student-managment.firebaseapp.com",
  projectId:         "ndc-student-managment",
  storageBucket:     "ndc-student-managment.firebasestorage.app",
  messagingSenderId: "563452237750",
  appId:             "1:563452237750:web:796ba1af00bb0882c3d317",
  measurementId:     "G-PJ7618ZEYE",
};

// Prevent duplicate app init (hot-reload safe)
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
