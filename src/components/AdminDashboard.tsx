import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_CIRCULARS, DEMO_NOTICES } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { Bell, FileText, Globe, Users, GraduationCap, User, Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  const cards = [
    { icon: <Bell size={20} />, label: 'Notifications', desc: latestNotice?.Title || 'No notifications', color: 'bg-primary/10 text-primary', onClick: () => navigate('/notifications') },
    { icon: <FileText size={20} />, label: 'Circulars', desc: latestCircular?.Title || 'No circulars', color: 'bg-accent/10 text-accent', onClick: () => navigate('/circulars') },
    { icon: <Globe size={20} />, label: 'College Website', desc: 'nationaldegreecollegenandyal.ac.in', color: 'bg-green-500/10 text-green-500', onClick: () => window.open(COLLEGE_WEBSITE, '_blank') },
    { icon: <Bell size={20} />, label: 'Manage Notifications', desc: 'Post new notifications', color: 'bg-blue-500/10 text-blue-500', onClick: () => navigate('/notifications') },
    { icon: <FileText size={20} />, label: 'Manage Circulars', desc: 'Post new circulars', color: 'bg-purple-500/10 text-purple-500', onClick: () => navigate('/circulars') },
    { icon: <Users size={20} />, label: 'Lecturers', desc: 'View all lecturers by department', color: 'bg-amber-500/10 text-amber-500', onClick: () => navigate('/lecturers') },
    { icon: <GraduationCap size={20} />, label: 'Students', desc: 'View all students by group/section', color: 'bg-teal-500/10 text-teal-500', onClick: () => navigate('/students') },
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
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <Shield size={28} className="text-destructive" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.designation}</p>
                <div className="mt-1 flex items-center gap-1">
                  <User size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Read-only access to all data</p>
                </div>
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

export default AdminDashboard;
