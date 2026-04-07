import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_CIRCULARS, DEMO_NOTICES } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { Calendar, BookOpen, Bell, FileText, Globe, User, MoreHorizontal } from 'lucide-react';

const LecturerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  const inchargeLabel = user?.isIncharge
    ? `Class Incharge: ${user.group} - Section ${user.section}`
    : 'General Faculty';

  const cards = [
    { icon: <Bell size={20} />, label: 'Notifications', desc: latestNotice?.Title || 'No new notifications', color: 'bg-primary/10 text-primary', onClick: () => navigate('/notifications') },
    { icon: <FileText size={20} />, label: 'Circulars', desc: latestCircular?.Title || 'No new circulars', color: 'bg-accent/10 text-accent', onClick: () => navigate('/circulars') },
    { icon: <Globe size={20} />, label: 'College Website', desc: 'nationaldegreecollegenandyal.ac.in', color: 'bg-green-500/10 text-green-500', onClick: () => window.open(COLLEGE_WEBSITE, '_blank') },
    { icon: <Calendar size={20} />, label: 'Attendance', desc: user?.isIncharge ? 'Manage attendance records' : 'View attendance records', color: 'bg-blue-500/10 text-blue-500', onClick: () => navigate('/attendance') },
    { icon: <BookOpen size={20} />, label: 'Marks', desc: user?.isIncharge ? 'Manage student marks' : 'View student marks', color: 'bg-purple-500/10 text-purple-500', onClick: () => navigate('/marks') },
    { icon: <MoreHorizontal size={20} />, label: 'More', desc: 'Profile, settings, logout', color: 'bg-muted text-muted-foreground', onClick: () => {} },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          {/* Profile card */}
          <GlassCard shimmer strong className="mb-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User size={28} className="text-primary" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.department} — {user?.designation}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{inchargeLabel}</p>
              </div>
            </div>
          </GlassCard>

          {/* Dashboard grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c, i) => (
              <GlassCard key={i} shimmer className="cursor-pointer transition hover:scale-[1.02]" onClick={c.onClick}>
                <div className="flex items-start gap-3">
                  <div className={`rounded-lg p-2.5 ${c.color}`}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading text-sm font-semibold">{c.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground truncate">{c.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
