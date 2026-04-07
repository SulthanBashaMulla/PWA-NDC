import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_CIRCULARS, DEMO_NOTICES } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { Bell, FileText, Globe, Users, GraduationCap, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];
  
  const cards = [
    { icon: <Bell size={22} />, label: 'Notifications', onClick: () => navigate('/notifications') },
    { icon: <FileText size={22} />, label: 'Circulars', onClick: () => navigate('/circulars') },
    { icon: <Globe size={22} />, label: 'Website', onClick: () => window.open(COLLEGE_WEBSITE) },
    { icon: <Users size={22} />, label: 'Lecturers', onClick: () => navigate('/admin/lecturers') },
    { icon: <GraduationCap size={22} />, label: 'Students', onClick: () => navigate('/admin/students') },
    { icon: <Bell size={22} />, label: 'Manage Notices', onClick: () => navigate('/notifications') },
  ];
  
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-400 via-white to-orange-200">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navbar />

        <div className="p-4 md:p-6 w-full">

          {/* PROFILE */}
          <GlassCard strong className="mb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-400/20">
                <Shield size={28} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user?.name}</h2>
                <p className="text-sm text-gray-600">{user?.designation}</p>
              </div>
            </div>
          </GlassCard>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* LEFT GRID */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {cards.map((c, i) => (
                <GlassCard
                  key={i}
                  className="aspect-square flex flex-col justify-center items-center cursor-pointer"
                  onClick={c.onClick}
                >
                  <div className="bg-blue-500/20 p-3 rounded-xl mb-2">
                    {c.icon}
                  </div>
                  <p className="text-sm font-semibold text-center">{c.label}</p>
                </GlassCard>
              ))}
            </div>

            {/* RIGHT PANEL */}
            <GlassCard className="md:col-span-1 md:row-span-2 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold mb-2">Overview</h3>
                <p className="text-sm text-gray-600">
                  Welcome back! Manage everything from this dashboard.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <div className="bg-blue-500/10 p-3 rounded-lg text-sm">
                  📢 {latestNotice?.Title || 'No notifications'}
                </div>
                <div className="bg-orange-500/10 p-3 rounded-lg text-sm">
                  📄 {latestCircular?.Title || 'No circulars'}
                </div>
              </div>
            </GlassCard>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;