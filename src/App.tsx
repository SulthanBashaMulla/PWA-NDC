import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AnimatedBackground from "@/components/AnimatedBackground";

// Pages (thin wrappers)
import Index          from "./pages/Index";
import Dashboard      from "./pages/Dashboard";
import Notifications  from "./pages/Notifications";
import Circulars      from "./pages/Circulars";
import Marks          from "./pages/Marks";
import Attendance     from "./pages/Attendance";
import LecturersListPage from "./components/LecturersListPage";
import StudentsListPage  from "./components/StudentsListPage";
import NotFound       from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 60_000 } },
});

// Full-screen loading spinner shown while Firebase resolves auth state
const AuthLoading = () => (
  <div className="relative min-h-screen flex items-center justify-center">
    <AnimatedBackground />
    <div className="relative z-10 flex flex-col items-center gap-4">
      <div
        className="h-12 w-12 rounded-full border-4 border-white/30 border-t-white animate-spin"
        style={{ animationDuration: "0.8s" }}
      />
      <p
        className="text-sm font-semibold"
        style={{ fontFamily: "Outfit, sans-serif", color: "hsl(260 40% 25%)" }}
      >
        Loading NDC…
      </p>
    </div>
  </div>
);

// Guard: redirect unauthenticated users to /
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (!user)   return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Guard: redirect authenticated users away from login
const RequireGuest = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <AuthLoading />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<RequireGuest><Index /></RequireGuest>} />

    {/* Protected */}
    <Route path="/dashboard"        element={<RequireAuth><Dashboard /></RequireAuth>} />
    <Route path="/notifications"    element={<RequireAuth><Notifications /></RequireAuth>} />
    <Route path="/circulars"        element={<RequireAuth><Circulars /></RequireAuth>} />
    <Route path="/marks"            element={<RequireAuth><Marks /></RequireAuth>} />
    <Route path="/attendance"       element={<RequireAuth><Attendance /></RequireAuth>} />
    <Route path="/admin/lecturers"  element={<RequireAuth><LecturersListPage /></RequireAuth>} />
    <Route path="/admin/students"   element={<RequireAuth><StudentsListPage /></RequireAuth>} />

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
