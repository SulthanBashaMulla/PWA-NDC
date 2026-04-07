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

  // ✅ DATA
  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  // ✅ SEEN LOGIC (INSIDE COMPONENT)
  const seenNotice = localStorage.getItem("seen_notice");
  const seenCircular = localStorage.getItem("seen_circular");

  const isNewNotice = latestNotice?.id !== seenNotice;
  const isNewCircular = latestCircular?.id !== seenCircular;

  // ✅ CARDS
  const cards = [
    { icon: <Bell size={22} />, label: 'Notifications', isNew: isNewNotice, onClick: () => navigate('/notifications') },
    { icon: <FileText size={22} />, label: 'Circulars', isNew: isNewCircular, onClick: () => navigate('/circulars') },
    { icon: <Globe size={22} />, label: 'Website', onClick: () => window.open(COLLEGE_WEBSITE) },
    { icon: <Users size={22} />, label: 'Lecturers', onClick: () => navigate('/admin/lecturers') },
    { icon: <GraduationCap size={22} />, label: 'Students', onClick: () => navigate('/admin/students') },
    { icon: <Bell size={22} />, label: 'Manage Notices', onClick: () => navigate('/notifications') },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">

      {/* 🔥 STRONGER GLASS BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-200 to-orange-300" />

      {/* 🔥 SOFT COLOR BLOBS (IMPORTANT FOR GLASS EFFECT) */}
      <div className="absolute top-[-100px] left-[-80px] w-[300px] h-[300px] bg-blue-400 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-[-100px] right-[-80px] w-[300px] h-[300px] bg-orange-400 rounded-full blur-3xl opacity-30" />

      <AnimatedBackground />

      <div className="relative z-10">
        <Navbar />

        <div className="p-4 md:p-6 space-y-4">

          {/* PROFILE */}
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500/30">
              <Shield size={28} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{user?.name || "Admin"}</h2>
              <p className="text-sm text-gray-700">{user?.designation || "Administrator"}</p>
            </div>
          </GlassCard>

          {/* 🔥 LATEST INFO */}
          <div className="grid grid-cols-2 gap-3">

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500 mb-1">Latest Notification</p>
              <p className="text-sm font-semibold text-blue-700 line-clamp-2">
                {latestNotice?.Title || 'No notifications'}
              </p>
            </GlassCard>

            <GlassCard className="p-3">
              <p className="text-xs text-gray-500 mb-1">Latest Circular</p>
              <p className="text-sm font-semibold text-orange-600 line-clamp-2">
                {latestCircular?.Title || 'No circulars'}
              </p>
            </GlassCard>

          </div>

          {/* OVERVIEW */}
          <h3 className="text-gray-800 font-semibold px-1">Overview</h3>

          {/* GRID */}
          <div className="grid grid-cols-2 gap-4">

            {cards.map((card, index) => (
              <GlassCard
                key={index}
                className="relative aspect-square flex flex-col justify-center items-center cursor-pointer"
                onClick={card.onClick}
              >
                {card.isNew && (
                  <span className="absolute top-3 right-3 h-2.5 w-2.5 bg-red-500 rounded-full animate-ping"></span>
                )}

                <div className="bg-blue-500/20 p-3 rounded-xl mb-2">
                  {card.icon}
                </div>

                <p className="text-sm font-semibold text-center">{card.label}</p>
              </GlassCard>
            ))}

          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;