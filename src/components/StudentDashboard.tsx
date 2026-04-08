import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import Navbar from './Navbar';
import { DEMO_ATTENDANCE, DEMO_CIRCULARS, DEMO_NOTICES, DEMO_MARKS } from '@/lib/sheets';
import { COLLEGE_WEBSITE } from '@/config/college';
import { BookOpen, Calendar, Bell, FileText, Globe, TrendingUp, User } from 'lucide-react';
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

  const percentColor = overallPercentage >= 75
    ? 'text-emerald-500'
    : overallPercentage >= 60
    ? 'text-amber-500'
    : 'text-rose-500';

  const latestNotice = DEMO_NOTICES[0];
  const latestCircular = DEMO_CIRCULARS[0];

  // Square quick-action panels for the left column
  const quickPanels = [
    {
      icon: <TrendingUp size={22} className="text-violet-600" />,
      label: 'Attendance',
      value: `${overallPercentage}%`,
      valueColor: percentColor,
      bg: 'bg-violet-400/20',
      onClick: () => setActiveTab('attendance'),
      stagger: 'card-stagger-1',
    },
    {
      icon: <BookOpen size={22} className="text-fuchsia-600" />,
      label: 'Marks',
      value: `Sem ${selectedSemester}`,
      valueColor: 'text-fuchsia-600',
      bg: 'bg-fuchsia-400/20',
      onClick: () => setActiveTab('marks'),
      stagger: 'card-stagger-2',
    },
    {
      icon: <Bell size={22} className="text-blue-600" />,
      label: 'Notices',
      value: 'View',
      valueColor: 'text-blue-600',
      bg: 'bg-blue-400/20',
      onClick: () => navigate('/notifications'),
      stagger: 'card-stagger-3',
    },
    {
      icon: <FileText size={22} className="text-pink-600" />,
      label: 'Circulars',
      value: 'View',
      valueColor: 'text-pink-600',
      bg: 'bg-pink-400/20',
      onClick: () => navigate('/circulars'),
      stagger: 'card-stagger-4',
    },
    {
      icon: <Globe size={22} className="text-emerald-600" />,
      label: 'Website',
      value: 'Open',
      valueColor: 'text-emerald-600',
      bg: 'bg-emerald-400/20',
      onClick: () => window.open(COLLEGE_WEBSITE, '_blank'),
      stagger: 'card-stagger-5',
    },
    {
      icon: <User size={22} className="text-indigo-600" />,
      label: 'Profile',
      value: user?.name?.split(' ')[0] || 'Me',
      valueColor: 'text-indigo-600',
      bg: 'bg-indigo-400/20',
      onClick: () => {},
      stagger: 'card-stagger-6',
    },
  ];

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="mx-auto max-w-6xl p-4 md:p-6">

          {/* Header */}
          <div className="mb-5 animate-fade-in-up">
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 50% 20%)' }}
            >
              Hello, {user?.name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="text-sm" style={{ color: 'hsl(260 20% 50%)' }}>
              {user?.group} · Section {user?.section} · Roll {user?.rollNo}
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">

            {/* LEFT COLUMN: square panels grid */}
            <div className="md:col-span-1">
              {/* Student info card */}
              <GlassCard strong shimmer className="mb-4 card-stagger-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="icon-badge bg-white/40">
                    <User size={20} className="text-violet-600" />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm leading-tight"
                      style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                    >
                      {user?.name}
                    </p>
                    <p className="text-xs" style={{ color: 'hsl(260 20% 50%)' }}>
                      Semester {user?.semester}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    ['Roll No', user?.rollNo],
                    ['Group', `${user?.group}-${user?.section}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span style={{ color: 'hsl(260 20% 55%)' }}>{k}</span>
                      <span className="font-semibold" style={{ color: 'hsl(260 40% 25%)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Square panels grid 2×3 */}
              <div className="grid grid-cols-2 gap-3">
                {quickPanels.map((p) => (
                  <div
                    key={p.label}
                    onClick={p.onClick}
                    className={`glass-panel cursor-pointer flex flex-col items-center justify-center text-center p-3 aspect-square ${p.stagger}`}
                  >
                    <div className={`icon-badge ${p.bg} mb-2`}>
                      {p.icon}
                    </div>
                    <p
                      className={`text-base font-bold leading-tight ${p.valueColor} animate-count-up`}
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {p.value}
                    </p>
                    <p className="text-[10px] mt-0.5 font-medium" style={{ color: 'hsl(260 20% 50%)' }}>
                      {p.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: main content */}
            <div className="space-y-4 md:col-span-2 lg:col-span-3 animate-fade-in-up">

              {/* Latest cards row */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard onClick={() => navigate('/notifications')} className="card-stagger-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Bell size={14} className="text-blue-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                      Latest Notice
                    </p>
                  </div>
                  <p className="text-xs font-semibold line-clamp-2" style={{ color: 'hsl(260 40% 20%)' }}>
                    {latestNotice?.Title || 'No notices'}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'hsl(260 20% 55%)' }}>{latestNotice?.Date}</p>
                </GlassCard>

                <GlassCard onClick={() => navigate('/circulars')} className="card-stagger-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText size={14} className="text-fuchsia-600" />
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'hsl(260 20% 50%)' }}>
                      Latest Circular
                    </p>
                  </div>
                  <p className="text-xs font-semibold line-clamp-2" style={{ color: 'hsl(260 40% 20%)' }}>
                    {latestCircular?.Title || 'No circulars'}
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: 'hsl(260 20% 55%)' }}>{latestCircular?.Date}</p>
                </GlassCard>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('marks')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                    activeTab === 'marks' ? 'tab-active' : 'tab-inactive'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <BookOpen size={15} /> Marks
                </button>
                <button
                  onClick={() => setActiveTab('attendance')}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm transition-all duration-200 ${
                    activeTab === 'attendance' ? 'tab-active' : 'tab-inactive'
                  }`}
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  <Calendar size={15} /> Attendance
                </button>
              </div>

              {/* Marks tab */}
              {activeTab === 'marks' && (
                <GlassCard strong shimmer>
                  <div className="mb-4 flex items-center justify-between">
                    <h3
                      className="text-base font-bold"
                      style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                    >
                      Marks — Semester {selectedSemester}
                    </h3>
                    <select
                      value={selectedSemester}
                      onChange={e => setSelectedSemester(Number(e.target.value))}
                      className="px-2 py-1 text-sm"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/30 text-left">
                          <th className="pb-3 pr-4">Subject</th>
                          <th className="pb-3 pr-4 text-center">Mid-1</th>
                          <th className="pb-3 text-center">Mid-2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myMarks.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="py-10 text-center text-sm" style={{ color: 'hsl(260 20% 55%)' }}>
                              No marks data available
                            </td>
                          </tr>
                        ) : myMarks.map((m, i) => (
                          <tr key={i} className="border-b border-white/20 transition-colors hover:bg-white/20">
                            <td className="py-2.5 pr-4 font-medium text-sm" style={{ color: 'hsl(260 40% 20%)' }}>
                              {m.Subject}
                            </td>
                            <td className="py-2.5 pr-4 text-center font-semibold text-violet-600">{m.Mid1}</td>
                            <td className="py-2.5 text-center font-semibold text-fuchsia-600">{m.Mid2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}

              {/* Attendance tab */}
              {activeTab === 'attendance' && (
                <GlassCard strong shimmer>
                  <div className="mb-4 flex flex-wrap items-center gap-3">
                    <h3
                      className="text-base font-bold"
                      style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(260 40% 20%)' }}
                    >
                      Attendance
                    </h3>
                    <select
                      value={selectedSemester}
                      onChange={e => setSelectedSemester(Number(e.target.value))}
                      className="px-2 py-1 text-sm"
                    >
                      {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                    <select
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value)}
                      className="px-2 py-1 text-sm"
                    >
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/30 text-left">
                          <th className="pb-3 pr-4">Month</th>
                          <th className="pb-3 pr-4 text-center">Present</th>
                          <th className="pb-3 pr-4 text-center">Total</th>
                          <th className="pb-3 text-center">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-10 text-center text-sm" style={{ color: 'hsl(260 20% 55%)' }}>
                              No attendance data for this selection
                            </td>
                          </tr>
                        ) : monthAttendance.map((a, i) => {
                          const pct = Number(a.Percentage);
                          const color = pct >= 75 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-rose-500';
                          return (
                            <tr key={i} className="border-b border-white/20 hover:bg-white/20 transition-colors">
                              <td className="py-2.5 pr-4 font-medium" style={{ color: 'hsl(260 40% 20%)' }}>{a.Month}</td>
                              <td className="py-2.5 pr-4 text-center">{a.DaysPresent}</td>
                              <td className="py-2.5 pr-4 text-center">{a.TotalDays}</td>
                              <td className={`py-2.5 text-center font-bold ${color}`}>{a.Percentage}%</td>
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
