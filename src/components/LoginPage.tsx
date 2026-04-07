import React, { useState } from 'react';
import { useAuth, UserRole } from '@/context/AuthContext';
import GlassCard from './GlassCard';
import AnimatedBackground from './AnimatedBackground';
import { Eye, EyeOff, Loader2, Shield, BookOpen, GraduationCap } from 'lucide-react';

const ROLES: { key: UserRole; label: string; idLabel: string; icon: React.ReactNode; color: string }[] = [
  { key: 'admin', label: 'Admin', idLabel: 'Admin ID', icon: <Shield size={16} />, color: 'bg-destructive/20 text-destructive' },
  { key: 'lecturer', label: 'Lecturer', idLabel: 'Lecturer ID', icon: <BookOpen size={16} />, color: 'bg-accent/20 text-accent' },
  { key: 'student', label: 'Student', idLabel: 'Roll Number', icon: <GraduationCap size={16} />, color: 'bg-primary/20 text-primary' },
];

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const currentRole = ROLES.find(r => r.key === role)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(id, password, role);
    } catch {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and title */}
        <div className="mb-6 text-center">
          <img src="/ndc-logo.png" alt="NDC Logo" className="mx-auto mb-3 h-20 w-20 rounded-full object-cover ring-4 ring-primary/20" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
          <h1 className="font-heading text-2xl font-bold text-foreground">National Degree College</h1>
          <p className="text-sm text-muted-foreground">Nandyal — Student Management System</p>
        </div>

        <GlassCard shimmer strong className="p-0 overflow-hidden">
          {/* Role tabs */}
          <div className="flex border-b border-border/30">
            {ROLES.map(r => (
              <button
                key={r.key}
                onClick={() => { setRole(r.key); setError(''); }}
                className={`flex flex-1 items-center justify-center gap-1.5 py-3.5 text-sm font-medium transition-all ${
                  role === r.key
                    ? 'bg-primary/10 text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                }`}
              >
                {r.icon}
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            {/* Role badge */}
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${currentRole.color}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {currentRole.label} Login
              </span>
            </div>

            {/* ID field */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{currentRole.idLabel}</label>
              <input
                type="text"
                value={id}
                onChange={e => setId(e.target.value)}
                placeholder={`Enter your ${currentRole.idLabel.toLowerCase()}`}
                required
                className="w-full rounded-lg border border-border/50 bg-background/50 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-border/50 bg-background/50 px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <button type="button" className="w-full text-xs text-primary/70 hover:text-primary transition">
              Forgot Password?
            </button>

            {/* Demo hint */}
            <div className="rounded-md bg-primary/5 p-3 text-center">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Demo:</span> Try <code className="rounded bg-primary/10 px-1 text-primary">23CS001</code> / <code className="rounded bg-primary/10 px-1 text-primary">LEC001</code> / <code className="rounded bg-primary/10 px-1 text-primary">admin001</code> with any password
              </p>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};

export default LoginPage;
