import { DEMO_NOTICES } from '@/lib/sheets';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { Bell } from 'lucide-react';

const NotificationsPage = () => {
  const notices = DEMO_NOTICES;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl p-4 md:p-6">
          <h2 className="mb-4 font-heading text-xl font-bold flex items-center gap-2">
            <Bell size={22} className="text-primary" /> Notifications
          </h2>
          <div className="space-y-3">
            {notices.map((n, i) => (
              <GlassCard key={i} shimmer>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold">{n.Title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.Description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{n.Date}</p>
                    <p className="text-xs text-primary/70">{n.PostedBy}</p>
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

export default NotificationsPage;
