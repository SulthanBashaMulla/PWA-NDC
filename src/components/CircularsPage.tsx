import { DEMO_CIRCULARS } from '@/lib/sheets';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { FileText } from 'lucide-react';

const CircularsPage = () => {
  const circulars = DEMO_CIRCULARS;

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-3xl p-4 md:p-6">
          <h2 className="mb-4 font-heading text-xl font-bold flex items-center gap-2">
            <FileText size={22} className="text-accent" /> Circulars
          </h2>
          <div className="space-y-3">
            {circulars.map((c, i) => (
              <GlassCard key={i} shimmer>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-heading text-sm font-semibold">{c.Title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{c.Description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{c.Date}</p>
                    <p className="text-xs text-accent/70">{c.PostedBy}</p>
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

export default CircularsPage;
