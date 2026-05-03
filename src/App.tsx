import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";

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

// Timetable — role-based
import AdminTimetablePage    from "./components/timetable/AdminTimetablePage";
import LecturerTimetablePage from "./components/timetable/LecturerTimetablePage";
import StudentTimetablePage  from "./components/timetable/StudentTimetablePage";
import TimetableEditor       from "./components/timetable/TimetableEditor";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

// ── Loading spinner ───────────────────────────────────────────
const AuthLoading = () => (
  <div className="relative min-h-screen flex items-center justify-center">
    <AnimatedBackground />
    <div className="relative z-10 flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin"
        style={{ animationDuration:"0.8s" }} />
      <p className="text-sm font-semibold"
        style={{ fontFamily:"Sora,sans-serif", color:"hsl(260 40% 25%)" }}>
        Loading NDC…
      </p>
    </div>
  </div>
);

// ── Guards ────────────────────────────────────────────────────
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

// ── Routes ────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"          element={<RequireGuest><Index /></RequireGuest>} />

    {/* Protected — all roles */}
    <Route path="/dashboard"     element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
    <Route path="/marks"         element={<RequireAuth><Marks /></RequireAuth>} />
    <Route path="/attendance"    element={<RequireAuth><Attendance /></RequireAuth>} />
    <Route path="/profile"       element={<RequireAuth><ProfilePage /></RequireAuth>} />

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
