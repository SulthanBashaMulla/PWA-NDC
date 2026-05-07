import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Index         from "./pages/Index";
import Dashboard     from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Marks         from "./pages/Marks";
import Attendance    from "./pages/Attendance";
import NotFound      from "./pages/NotFound";

// Components
import LecturersListPage     from "./components/LecturersListPage";
import StudentsListPage      from "./components/StudentsListPage";
import ProfilePage           from "./components/ProfilePage";
import GroupsPage            from "./components/GroupsPage";
import DepartmentsPage       from "./components/DepartmentsPage";

// Timetable — role-based
import AdminTimetablePage    from "./components/timetable/AdminTimetablePage";
import LecturerTimetablePage from "./components/timetable/LecturerTimetablePage";
import StudentTimetablePage  from "./components/timetable/StudentTimetablePage";
import TimetableEditor       from "./components/timetable/TimetableEditor";

import { COLLEGE_LOGO_URL } from "@/config/college";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

// ── Splash screen ─────────────────────────────────────────────
const AuthLoading = () => (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center"
    style={{ background: "linear-gradient(160deg, #081c3d 0%, #0f2d5e 50%, #1a3f7a 100%)" }}
  >
    {/* Dot pattern overlay */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* Orange top line */}
    <div
      className="absolute top-0 left-0 right-0"
      style={{ height: 4, background: "linear-gradient(90deg, #e8601c, #f07840, #e8601c)" }}
    />

    {/* Main content */}
    <div className="relative z-10 flex flex-col items-center px-8 text-center">

      {/* Square logo — rounded like app icon */}
      <div
        style={{
          width: 110,
          height: 110,
          borderRadius: 24,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
          overflow: "hidden",
          animation: "splashLogoIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>
        <img
          src={COLLEGE_LOGO_URL}
          alt="NDC"
          style={{ width: 90, height: 90, objectFit: "contain" }}
          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>

      {/* College name */}
      <h1
        style={{
          color: "white",
          fontFamily: "Sora, sans-serif",
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: "0.01em",
          animation: "splashFadeUp 0.5s 0.3s ease-out both",
        }}>
        National Degree College
      </h1>

      {/* Location */}
      <p
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "Sora, sans-serif",
          fontSize: 13,
          marginBottom: 32,
          animation: "splashFadeUp 0.5s 0.4s ease-out both",
        }}>
        Nandyal
      </p>

      {/* Loading progress bar */}
      <div
        style={{
          width: 160,
          height: 3,
          borderRadius: 2,
          background: "rgba(255,255,255,0.12)",
          marginBottom: 36,
          overflow: "hidden",
          animation: "splashFadeUp 0.5s 0.5s ease-out both",
        }}>
        <div
          style={{
            height: "100%",
            borderRadius: 2,
            background: "linear-gradient(90deg, #e8601c, #f07840)",
            animation: "splashBar 2.2s 0.5s ease-in-out both",
          }}
        />
      </div>

      {/* Arabic quote */}
      <p
        style={{
          color: "rgba(255,255,255,0.8)",
          fontSize: 18,
          fontFamily: "serif",
          letterSpacing: "0.05em",
          marginBottom: 8,
          lineHeight: 1.6,
          animation: "splashFadeUp 0.5s 0.6s ease-out both",
        }}>
        نَصْرٌ مِّنَ اللَّهِ وَفَتْحٌ قَرِيبٌ
      </p>

      {/* Transliteration */}
      <p
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 11,
          fontFamily: "Sora, sans-serif",
          letterSpacing: "0.05em",
          animation: "splashFadeUp 0.5s 0.7s ease-out both",
        }}>
        From Classroom to Careers, Together we Learn - Sulthan
      </p>
    </div>

    {/* Orange bottom line */}
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{ height: 4, background: "linear-gradient(90deg, #e8601c, #f07840, #e8601c)" }}
    />

    {/* Animations */}
    <style>{`
      @keyframes splashLogoIn {
        from { opacity: 0; transform: scale(0.65); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes splashFadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes splashBar {
        from { width: 0%; }
        to   { width: 100%; }
      }
    `}</style>
  </div>
);

// ── Route guards ──────────────────────────────────────────────
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user)   return <Navigate to="/" replace />;
  return <>{children}</>;
};

const RequireGuest = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading)               return <AuthLoading />;
  if (!user)                 return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ── Timetable router — role decides component ─────────────────
const TimetableRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "admin")    return <AdminTimetablePage />;
  if (user.role === "lecturer") return <LecturerTimetablePage />;
  return <StudentTimetablePage />;
};

// ── All routes ────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<RequireGuest><Index /></RequireGuest>} />

    {/* Protected — all roles */}
    <Route path="/dashboard"     element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
    <Route path="/marks"         element={<RequireAuth><Marks /></RequireAuth>} />
    <Route path="/attendance"    element={<RequireAuth><Attendance /></RequireAuth>} />
    <Route path="/profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />

    {/* Admin-only */}
    <Route path="/groups"      element={<RequireAdmin><GroupsPage /></RequireAdmin>} />
    <Route path="/departments" element={<RequireAdmin><DepartmentsPage /></RequireAdmin>} />

    {/* Timetable */}
    <Route path="/timetable"
      element={<RequireAuth><TimetableRouter /></RequireAuth>} />
    <Route path="/timetable/edit/:group/:section/:day"
      element={<RequireAdmin><TimetableEditor /></RequireAdmin>} />

    {/* Lists */}
    <Route path="/admin/lecturers" element={<RequireAuth><LecturersListPage /></RequireAuth>} />
    <Route path="/admin/students"  element={<RequireAuth><StudentsListPage /></RequireAuth>} />

    {/* 404 */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
