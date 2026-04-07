import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { Bell, FileText, Globe, Users, GraduationCap, Shield } from 'lucide-react';
import { COLLEGE_WEBSITE } from '@/config/college';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { icon: <Bell size={22} />, label: 'Notifications', onClick: () => navigate('/notifications') },
    { icon: <FileText size={22} />, label: 'Circulars', onClick: () => navigate('/circulars') },
    { icon: <Globe size={22} />, label: 'Website', onClick: () => window.open(COLLEGE_WEBSITE) },
    { icon: <Users size={22} />, label: 'Lecturers', onClick: () => navigate('/admin/lecturers') },
    { icon: <GraduationCap size={22} />, label: 'Students', onClick: () => navigate('/admin/students') },
    { icon: <Bell size={22} />, label: 'Manage Notices', onClick: () => navigate('/notifications') },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-300 via-white to-orange-200">

      {/* Background Animation */}
      <AnimatedBackground />

      <div className="relative z-10">
        <Navbar />

        <div className="p-4 md:p-6 w-full space-y-4">

          {/* PROFILE CARD */}
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-400/20">
              <Shield size={28} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.name || "Admin"}</h2>
              <p className="text-sm text-gray-600">{user?.designation || "Administrator"}</p>
            </div>
          </GlassCard>

          {/* OVERVIEW TITLE */}
          <h3 className="text-gray-700 font-semibold px-1">
            Overview
          </h3>

          {/* GRID DASHBOARD */}
          <div className="grid grid-cols-2 gap-4">

            {cards.map((card, index) => (
              <GlassCard
                key={index}
                onClick={card.onClick}
                className="
                  aspect-square 
                  flex flex-col 
                  items-center 
                  justify-center 
                  text-center 
                  cursor-pointer
                  transition-all duration-300
                  hover:scale-105
                "
              >
                {/* ICON */}
                <div className="bg-blue-400/20 p-3 rounded-xl mb-2">
                  {card.icon}
                </div>

                {/* LABEL */}
                <p className="text-sm font-semibold text-gray-700">
                  {card.label}
                </p>
              </GlassCard>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;