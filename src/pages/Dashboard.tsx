import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/components/LoginPage';
import StudentDashboard from '@/components/StudentDashboard';
import LecturerDashboard from '@/components/LecturerDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'lecturer') return <LecturerDashboard />;
  return <AdminDashboard />;
};

export default Dashboard;
