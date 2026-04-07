import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_ATTENDANCE, DEMO_CIRCULARS, DEMO_NOTICES, DEMO_MARKS } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { BookOpen, Calendar, Bell, FileText, Globe, TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SEMESTERS, MONTHS } from '@/config/college';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState(user?.semester || 3);
  const [selectedMonth, setSelectedMonth] = useState('January');
  const [activeTab, setActiveTab] = useState<'marks' | 'attendance'>('marks');

  const rollNo = user?.rollNo || '';

  const myAttendance = useMemo(() => DEMO_ATTENDANCE.filter(a => a.RollNo === rollNo), [rollNo]);
  const myMarks = useMemo(() => DEMO_MARKS.filter(m => m.RollNo === rollNo && m.Semester === String(selectedSemester)), [rollNo, selectedSemester]);
  const monthAttendance = useMemo(() => myAttendance.filter(a => a.Month === selectedMonth && a.Semester === String(selectedSemester)), [myAttendance, selectedMonth, selectedSemester]);

  const overallPercentage = useMemo(() => {
    if (myAttendance.length === 0) return 0;
    const totalPresent = myAttendance.reduce((s, a) => s + Number(a.DaysPresent), 0);
    const totalDays = myAttendance.reduce((s, a) => s + Number(a.TotalDays), 0);
    return totalDays > 0 ? Math.round((totalPresent / totalDays) * 100 * 10) / 10 : 0;
  }, [myAttendance]);

  const percentColor = overallPercentage >= 75 ? 'text-green-500' : overallPercentage >= 60 ? 'text-accent' : 'text-destructive';

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-6xl p-4 md:p-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Profile + Attendance panel */}
            <div className="space-y-4 md:col-span-1">
              {/* Attendance % */}
              <GlassCard shimmer strong className="text-center">
                <TrendingUp className="mx-auto mb-2 text-primary" size={24} />
                <p className="text-xs font-medium text-muted-foreground">Overall Attendance</p>
                <p className={`animate-count-up font-heading text-4xl font-bold ${percentColor}`}>
                  {overallPercentage}%
                </p>
              </GlassCard>

              {/* Details */}
              <GlassCard shimmer>
                <h3 className="mb-3 font-heading text-sm font-semibold text-foreground">Student Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{user?.name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Roll No</span><span className="font-medium">{user?.rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Group</span><span className="font-medium">{user?.group}-{user?.section}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Semester</span><span className="font-medium">{user?.semester}</span></div>
                </div>
              </GlassCard>

              {/* Quick links */}
              <GlassCard shimmer className="cursor-pointer hover:scale-[1.02]" onClick={() => navigate('/notifications')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2"><Bell size={18} className="text-primary" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{latestNotice?.Title}</p>
                    <p className="text-xs text-muted-foreground">{latestNotice?.Date}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard shimmer className="cursor-pointer hover:scale-[1.02]" onClick={() => navigate('/circulars')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent/10 p-2"><FileText size={18} className="text-accent" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{latestCircular?.Title}</p>
                    <p className="text-xs text-muted-foreground">{latestCircular?.Date}</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard shimmer className="cursor-pointer hover:scale-[1.02]" onClick={() => window.open(COLLEGE_WEBSITE, '_blank')}>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-500/10 p-2"><Globe size={18} className="text-green-500" /></div>
                  <p className="text-xs font-semibold text-foreground">College Website</p>
                </div>
              </GlassCard>
            </div>

            {/* Main content */}
            <div className="space-y-4 md:col-span-2 lg:col-span-3">
              {/* Tab switcher */}
              <div className="flex gap-2">
                <button onClick={() => setActiveTab('marks')} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'marks' ? 'glass-strong text-primary shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                  <BookOpen size={16} /> Marks
                </button>
                <button onClick={() => setActiveTab('attendance')} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${activeTab === 'attendance' ? 'glass-strong text-primary shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Calendar size={16} /> Attendance
                </button>
              </div>

              {activeTab === 'marks' && (
                <GlassCard shimmer strong>
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-heading text-base font-semibold">Marks — Semester {selectedSemester}</h3>
                    <select value={selectedSemester} onChange={e => setSelectedSemester(Number(e.target.value))} className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Subject</th>
                          <th className="pb-2 pr-4 text-center">Mid-1</th>
                          <th className="pb-2 text-center">Mid-2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myMarks.length === 0 ? (
                          <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No marks data available</td></tr>
                        ) : myMarks.map((m, i) => (
                          <tr key={i} className="border-b border-border/10">
                            <td className="py-2.5 pr-4 font-medium">{m.Subject}</td>
                            <td className="py-2.5 pr-4 text-center">{m.Mid1}</td>
                            <td className="py-2.5 text-center">{m.Mid2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}

              {activeTab === 'attendance' && (
                <GlassCard shimmer strong>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3 className="font-heading text-base font-semibold">Attendance</h3>
                    <select value={selectedSemester} onChange={e => setSelectedSemester(Number(e.target.value))} className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30 text-left text-xs text-muted-foreground">
                          <th className="pb-2 pr-4">Month</th>
                          <th className="pb-2 pr-4 text-center">Present</th>
                          <th className="pb-2 pr-4 text-center">Total</th>
                          <th className="pb-2 text-center">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthAttendance.length === 0 ? (
                          <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No attendance data for this selection</td></tr>
                        ) : monthAttendance.map((a, i) => {
                          const pct = Number(a.Percentage);
                          const color = pct >= 75 ? 'text-green-500' : pct >= 60 ? 'text-accent' : 'text-destructive';
                          return (
                            <tr key={i} className="border-b border-border/10">
                              <td className="py-2.5 pr-4 font-medium">{a.Month}</td>
                              <td className="py-2.5 pr-4 text-center">{a.DaysPresent}</td>
                              <td className="py-2.5 pr-4 text-center">{a.TotalDays}</td>
                              <td className={`py-2.5 text-center font-semibold ${color}`}>{a.Percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
