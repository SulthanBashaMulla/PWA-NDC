// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAfJIPvOLuGM1j8ET35fPtLQd2PRMPbd1o",
  authDomain: "ndc-student-managment.firebaseapp.com",
  projectId: "ndc-student-managment",
  storageBucket: "ndc-student-managment.firebasestorage.app",
  messagingSenderId: "563452237750",
  appId: "1:563452237750:web:796ba1af00bb0882c3d317",
  measurementId: "G-PJ7618ZEYE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
