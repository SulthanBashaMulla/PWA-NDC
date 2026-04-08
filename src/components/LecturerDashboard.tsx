import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_CIRCULARS, DEMO_NOTICES } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { Calendar, BookOpen, Bell, FileText, Globe, User, MoreHorizontal, GraduationCap } from 'lucide-react';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  const inchargeLabel = user?.isIncharge
    ? `Incharge: ${user.group} — Sec ${user.section}`
    : 'General Faculty';

  // Square panel cards — 2 columns × 4 rows = 8 panels
  const panels = [
    {
      icon: <Bell size={22} />,
      label: 'Notifications',
      sub: latestNotice?.Title || 'No new',
      color: 'text-violet-600',
      bg: 'bg-violet-400/20',
      onClick: () => navigate('/notifications'),
      stagger: 'card-stagger-1',
    },
    {
      icon: <FileText size={22} />,
      label: 'Circulars',
      sub: latestCircular?.Title || 'No new',
      color: 'text-fuchsia-600',
      bg: 'bg-fuchsia-400/20',
      onClick: () => navigate('/circulars'),
      stagger: 'card-stagger-2',
    },
    {
      icon: <Calendar size={22} />,
      label: 'Attendance',
      sub: user?.isIncharge ? 'Manage' : 'View',
      color: 'text-blue-600',
      bg: 'bg-blue-400/20',
      onClick: () => navigate('/attendance'),
      stagger: 'card-stagger-3',
    },
    {
      icon: <BookOpen size={22} />,
      label: 'Marks',
      sub: user?.isIncharge ? 'Manage' : 'View',
      color: 'text-pink-600',
      bg: 'bg-pink-400/20',
      onClick: () => navigate('/marks'),
      stagger: 'card-stagger-4',
    },
    {
      icon: <Globe size={22} />,
      label: 'Website',
      sub: 'College portal',
      color: 'text-emerald-600',
      bg: 'bg-emerald-400/20',
      onClick: () => window.open(COLLEGE_WEBSITE, '_blank'),
      stagger: 'card-stagger-5',
    },
    {
      icon: <GraduationCap size={22} />,
      label: 'Students',
      sub: 'Class list',
      color: 'text-amber-600',
      bg: 'bg-amber-400/20',
      onClick: () => navigate('/admin/students'),
      stagger: 'card-stagger-6',
    },
    {
      icon: <User size={22} />,
      label: 'Profile',
      sub: 'My details',
      color: 'text-indigo-600',
      bg: 'bg-indigo-400/20',
      onClick: () => {},
      stagger: 'card-stagger-1',
    },
    {
      icon: <MoreHorizontal size={22} />,
      label: 'More',
      sub: 'Settings',
      color: 'text-slate-500',
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
        <div className="mx-auto max-w-5xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 animate-fade-in-up">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 50% 20%)' }}
            >
              Welcome, {user?.name?.split(' ')[0] || 'Lecturer'} 👋
            </h1>
            <p className="text-sm" style={{ color: 'hsl(260 20% 50%)' }}>
              {inchargeLabel}
            </p>
          </div>

          {/* Profile + info row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

            {/* Profile card spanning 1 col */}
            <GlassCard strong shimmer className="md:col-span-1 card-stagger-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="icon-badge bg-violet-400/25">
                  <User size={22} className="text-violet-600" />
                </div>
                <div className="min-w-0">
                  <p
                    className="font-bold text-sm truncate"
                    style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                  >
                    {user?.name}
                  </p>
                  <p className="text-[11px]" style={{ color: 'hsl(260 20% 50%)' }}>
                    {user?.designation}
                  </p>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  ['Department', user?.department],
                  ['Role', inchargeLabel],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs">
                    <span style={{ color: 'hsl(260 20% 55%)' }}>{k}</span>
                    <span className="font-semibold text-right max-w-[60%] truncate" style={{ color: 'hsl(260 40% 25%)' }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Latest notice */}
            <GlassCard onClick={() => navigate('/notifications')} className="card-stagger-2">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={14} className="text-blue-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                  Latest Notice
                </p>
              </div>
              <p className="text-xs font-semibold line-clamp-3" style={{ color: 'hsl(260 40% 20%)' }}>
                {latestNotice?.Title || 'No notices yet'}
              </p>
              <p className="text-[10px] mt-2" style={{ color: 'hsl(260 20% 55%)' }}>{latestNotice?.Date}</p>
            </GlassCard>

            {/* Latest circular */}
            <GlassCard onClick={() => navigate('/circulars')} className="card-stagger-3">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-fuchsia-600" />
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                  Latest Circular
                </p>
              </div>
              <p className="text-xs font-semibold line-clamp-3" style={{ color: 'hsl(260 40% 20%)' }}>
                {latestCircular?.Title || 'No circulars yet'}
              </p>
              <p className="text-[10px] mt-2" style={{ color: 'hsl(260 20% 55%)' }}>{latestCircular?.Date}</p>
            </GlassCard>

          </div>

          {/* Section label */}
          <p
            className="px-1 mb-3 text-xs font-semibold uppercase tracking-widest animate-fade-in-up"
            style={{ color: 'hsl(260 30% 50%)' }}
          >
            Quick Access
          </p>

          {/* Square panels grid 2×4 (or 4×2 on md) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {panels.map((p) => (
              <div
                key={p.label}
                onClick={p.onClick}
                className={`glass-panel flex flex-col items-center justify-center text-center p-4 aspect-square ${p.stagger}`}
              >
                <div className={`icon-badge ${p.bg} mb-2.5`}>
                  <span className={p.color}>{p.icon}</span>
                </div>
                <p
                  className="text-sm font-bold leading-tight"
                  style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                >
                  {p.label}
                </p>
                <p className="text-[10px] mt-0.5 line-clamp-1" style={{ color: 'hsl(260 20% 55%)' }}>
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

export default LecturerDashboard;
