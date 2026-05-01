// src/pages/Timetable.tsx
// Thin role-router — same pattern as src/pages/Dashboard.tsx
import { useAuth } from "@/context/AuthContext";
import StudentTimetablePage  from "@/components/timetable/StudentTimetablePage";
import LecturerTimetablePage from "@/components/timetable/LecturerTimetablePage";
import AdminTimetablePage    from "@/components/timetable/AdminTimetablePage";

export default function Timetable() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "student")  return <StudentTimetablePage />;
  if (user.role === "lecturer") return <LecturerTimetablePage />;
  return <AdminTimetablePage />;
}
