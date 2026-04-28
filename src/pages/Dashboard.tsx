import { useAuth } from "@/context/AuthContext";
import StudentDashboard  from "@/components/StudentDashboard";
import LecturerDashboard from "@/components/LecturerDashboard";
import AdminDashboard    from "@/components/AdminDashboard";

export default function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;
  if (user.role === "student")  return <StudentDashboard />;
  if (user.role === "lecturer") return <LecturerDashboard />;
  return <AdminDashboard />;
}
