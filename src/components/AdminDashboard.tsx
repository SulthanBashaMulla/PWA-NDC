import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_CIRCULARS, DEMO_NOTICES } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { Bell, FileText, Globe, Users, GraduationCap, Shield, Settings, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  const seenNotice = localStorage.getItem("seen_notice");
  const seenCircular = localStorage.getItem("seen_circular");
  const isNewNotice = latestNotice?.id !== seenNotice;
  const isNewCircular = latestCircular?.id !== seenCircular;

  const panels = [
    {
      icon: <Bell size={24} />,
      label: 'Notifications',
      sub: 'Manage notices',
      isNew: isNewNotice,
      color: 'text-violet-600',
      bg: 'bg-violet-400/20',
      onClick: () => navigate('/notifications'),
      stagger: 'card-stagger-1',
    },
    {
      icon: <FileText size={24} />,
      label: 'Circulars',
      sub: 'Manage circulars',
      isNew: isNewCircular,
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-400/20',
      onClick: () => navigate('/circulars'),
      stagger: 'card-stagger-2',
    },
    {
      icon: <Users size={24} />,
      label: 'Lecturers',
      sub: 'Faculty list',
      color: 'text-blue-600',
      bg: 'bg-blue-400/20',
      onClick: () => navigate('/admin/lecturers'),
      stagger: 'card-stagger-3',
    },
    {
      icon: <GraduationCap size={24} />,
      label: 'Students',
      sub: 'Student list',
      color: 'text-emerald-600',
      bg: 'bg-emerald-400/20',
      onClick: () => navigate('/admin/students'),
      stagger: 'card-stagger-4',
    },
    {
      icon: <Globe size={24} />,
      label: 'Website',
      sub: 'College portal',
      color: 'text-pink-600',
      bg: 'bg-pink-400/20',
      onClick: () => window.open(COLLEGE_WEBSITE),
      stagger: 'card-stagger-5',
    },
    {
      icon: <BarChart3 size={24} />,
      label: 'Reports',
      sub: 'Analytics',
      color: 'text-amber-600',
      bg: 'bg-amber-400/20',
      onClick: () => {},
      stagger: 'card-stagger-6',
    },
    {
      icon: <Bell size={24} />,
      label: 'Manage',
      sub: 'Post notices',
      color: 'text-indigo-600',
      bg: 'bg-indigo-400/20',
      onClick: () => navigate('/notifications'),
      stagger: 'card-stagger-1',
    },
    {
      icon: <Settings size={24} />,
      label: 'Settings',
      sub: 'System config',
      color: 'text-slate-600',
      bg: 'bg-slate-400/20',
      onClick: () => {},
      stagger: 'card-stagger-2',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-4xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 animate-fade-in-up">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 50% 20%)' }}
            >
              Admin Panel 🛡️
            </h1>
            <p className="text-sm" style={{ color: 'hsl(260 20% 50%)' }}>
              {user?.name || 'Administrator'} · {user?.designation || 'System Admin'}
            </p>
          </div>

          {/* Profile card */}
          <GlassCard strong shimmer className="mb-5 card-stagger-1">
            <div className="flex items-center gap-4">
              <div className="icon-badge bg-violet-400/25 p-3">
                <Shield size={26} className="text-violet-600" />
              </div>
              <div>
                <p
                  className="font-bold text-base"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                >
                  {user?.name || 'Admin'}
                </p>
                <p className="text-sm" style={{ color: 'hsl(260 20% 50%)' }}>
                  {user?.designation || 'Administrator'}
                </p>
              </div>
              <div className="ml-auto text-right">
                <span
                  className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    color: 'hsl(265 80% 50%)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                  }}
                >
                  Super Admin
                </span>
              </div>
            </div>
          </GlassCard>

          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <GlassCard onClick={() => navigate('/notifications')} className="card-stagger-2 relative">
              {isNewNotice && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <Bell size={13} className="text-violet-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                  Latest Notice
                </p>
              </div>
              <p className="text-xs font-semibold line-clamp-2" style={{ color: 'hsl(260 40% 20%)' }}>
                {latestNotice?.Title || 'No notifications'}
              </p>
            </GlassCard>

            <GlassCard onClick={() => navigate('/circulars')} className="card-stagger-3 relative">
              {isNewCircular && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
                </span>
              )}
              <div className="flex items-center gap-2 mb-1">
                <FileText size={13} className="text-fuchsia-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                  Latest Circular
                </p>
              </div>
              <p className="text-xs font-semibold line-clamp-2" style={{ color: 'hsl(260 40% 20%)' }}>
                {latestCircular?.Title || 'No circulars'}
              </p>
            </GlassCard>
          </div>

          {/* Section label */}
          <p
            className="px-1 mb-3 text-xs font-semibold uppercase tracking-widest animate-fade-in-up"
            style={{ color: 'hsl(260 30% 50%)' }}
          >
            Overview
          </p>

          {/* Square panels grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {panels.map((p, i) => (
              <div
                key={i}
                onClick={p.onClick}
                className={`glass-panel relative flex flex-col items-center justify-center text-center p-4 aspect-square ${p.stagger}`}
              >
                {p.isNew && (
                  <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
                  </span>
                )}
                <div className={`icon-badge ${p.bg} mb-3`}>
                  <span className={p.color}>{p.icon}</span>
                </div>
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                >
                  {p.label}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'hsl(260 20% 55%)' }}>
                  {p.sub}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
