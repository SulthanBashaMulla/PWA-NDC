import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_MARKS } from '@/lib/sheets';
import { GROUPS, SECTIONS, SEMESTERS } from '@/config/college';
import { BookOpen, Search } from 'lucide-react';

const MarksPage = () => {
  const { user } = useAuth();
  const isIncharge = user?.role === 'lecturer' && user?.isIncharge;
  const [group, setGroup] = useState(user?.group || 'MPC');
  const [section, setSection] = useState(user?.section || 'A');
  const [semester, setSemester] = useState(3);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let data = DEMO_MARKS.filter(m => m.Semester === String(semester));
    if (search) data = data.filter(m => m.RollNo.toLowerCase().includes(search.toLowerCase()) || m.Name.toLowerCase().includes(search.toLowerCase()));
    return data;
  }, [semester, search]);

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-5xl p-4 md:p-6">
          <h2 className="mb-4 font-heading text-xl font-bold flex items-center gap-2">
            <BookOpen size={22} className="text-primary" /> Marks Management
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
              <select value={semester} onChange={e => setSemester(Number(e.target.value))} className="rounded-md border border-border/50 bg-background/50 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
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
                    <th className="pb-2 pr-4">Subject</th>
                    <th className="pb-2 pr-4 text-center">Mid-1</th>
                    <th className="pb-2 text-center">Mid-2</th>
                    {isIncharge && <th className="pb-2 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={isIncharge ? 6 : 5} className="py-8 text-center text-muted-foreground">No marks data found</td></tr>
                  ) : filtered.map((m, i) => (
                    <tr key={i} className="border-b border-border/10">
                      <td className="py-2.5 pr-4 font-mono text-xs">{m.RollNo}</td>
                      <td className="py-2.5 pr-4">{m.Name}</td>
                      <td className="py-2.5 pr-4">{m.Subject}</td>
                      <td className="py-2.5 pr-4 text-center">{m.Mid1}</td>
                      <td className="py-2.5 text-center">{m.Mid2}</td>
                      {isIncharge && (
                        <td className="py-2.5 text-center">
                          <button className="text-xs text-primary hover:underline">Edit</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isIncharge && (
              <div className="mt-4 flex gap-2">
                <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition">+ Add Row</button>
                <button className="rounded-md border border-border/50 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition">Upload CSV</button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default MarksPage;
