import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_ATTENDANCE } from '@/lib/sheets';
import { GROUPS, SECTIONS } from '@/config/college';
import { Calendar, Search } from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const isIncharge = user?.role === 'lecturer' && user?.isIncharge;
  const [group, setGroup] = useState(user?.group || 'MPC');
  const [section, setSection] = useState(user?.section || 'A');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = DEMO_ATTENDANCE;
    if (search) data = data.filter(a => a.RollNo.toLowerCase().includes(search.toLowerCase()) || a.Name.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [search]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <h2 className="mb-4 font-heading text-xl font-bold flex items-center gap-2">
            <Calendar size={22} className="text-primary" /> Attendance Management
            {!isIncharge && <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Read Only</span>}
          </h2>

          <GlassCard shimmer strong>
            <div className="mb-4 flex flex-wrap gap-3">
              <select value={group} onChange={e => setGroup(e.target.value)} className="rounded-md border border-border/50 bg-background/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={section} onChange={e => setSection(e.target.value)} className="rounded-md border border-border/50 bg-background/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
              <div className="relative flex-1 min-w-[180px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by Roll No or Name" className="w-full rounded-md border border-border/50 bg-background/50 py-1.5 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-left text-xs text-muted-foreground">
                    <th className="pb-2 pr-4">Roll No</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Month</th>
                    <th className="pb-2 pr-4 text-center">Present</th>
                    <th className="pb-2 pr-4 text-center">Total</th>
                    <th className="pb-2 text-center">%</th>
                    {isIncharge && <th className="pb-2 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={isIncharge ? 7 : 6} className="py-8 text-center text-muted-foreground">No attendance data found</td></tr>
                  ) : filtered.map((a, i) => {
                    const pct = Number(a.Percentage);
                    const color = pct >= 75 ? 'text-green-500' : pct >= 60 ? 'text-accent' : 'text-destructive';
                    return (
                      <tr key={i} className="border-b border-border/10">
                        <td className="py-2.5 pr-4 font-mono text-xs">{a.RollNo}</td>
                        <td className="py-2.5 pr-4">{a.Name}</td>
                        <td className="py-2.5 pr-4">{a.Month}</td>
                        <td className="py-2.5 pr-4 text-center">{a.DaysPresent}</td>
                        <td className="py-2.5 pr-4 text-center">{a.TotalDays}</td>
                        <td className={`py-2.5 text-center font-semibold ${color}`}>{a.Percentage}%</td>
                        {isIncharge && (
                          <td className="py-2.5 text-center">
                            <button className="text-xs text-primary hover:underline">Edit</button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {isIncharge && (
              <div className="mt-4 flex gap-2">
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition">+ Add Row</button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
