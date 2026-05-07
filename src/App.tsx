import { useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider, useAuth } from "@/context/AuthContext";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import NotFound from "./pages/NotFound";

// Components
import LecturersListPage from "./components/LecturersListPage";
import StudentsListPage from "./components/StudentsListPage";
import ProfilePage from "./components/ProfilePage";
import GroupsPage from "./components/GroupsPage";
import DepartmentsPage from "./components/DepartmentsPage";

// Timetable
import AdminTimetablePage from "./components/timetable/AdminTimetablePage";
import LecturerTimetablePage from "./components/timetable/LecturerTimetablePage";
import StudentTimetablePage from "./components/timetable/StudentTimetablePage";
import TimetableEditor from "./components/timetable/TimetableEditor";

import { COLLEGE_LOGO_URL } from "@/config/college";

// ─────────────────────────────────────────────────────────────
// Query Client
// ─────────────────────────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

// ─────────────────────────────────────────────────────────────
// Dynamic Quotes
// ─────────────────────────────────────────────────────────────
const splashQuotes = [
  "From Classroom to Careers, Together we Learn — Sulthan Basha",
  "Dream Big. Study Hard. Stay Humble.",
  "Knowledge is the Beginning of Greatness.",
  "Learn Today, Lead Tomorrow.",
  "Success Starts with Discipline.",
  "Where Learning Meets Opportunity.",
  "Education Builds the Future.",
  "Empowering Students Every Day.",
  "Small Progress is Still Progress.",
  "Your Future Begins Here.",
  "Believe. Learn. Achieve.",
  "Excellence Through Education.",
];

const randomQuote =
  splashQuotes[Math.floor(Math.random() * splashQuotes.length)];

// ─────────────────────────────────────────────────────────────
// Splash Screen
// ─────────────────────────────────────────────────────────────
const AuthLoading = () => (
  <div
    className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
    style={{
      background:
        "linear-gradient(160deg, #081c3d 0%, #0f2d5e 50%, #1a3f7a 100%)",
    }}
  >
    {/* Background pattern */}
    <div
      className="absolute inset-0 opacity-10"
      style={{
        backgroundImage:
          "radial-gradient(circle, white 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />

    {/* Glow */}
    <div
      className="absolute"
      style={{
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "rgba(232,96,28,0.15)",
        filter: "blur(80px)",
      }}
    />

    {/* Top line */}
    <div
      className="absolute top-0 left-0 right-0"
      style={{
        height: 4,
        background:
          "linear-gradient(90deg, #e8601c, #f07840, #e8601c)",
      }}
    />

    {/* Main content */}
    <div className="relative z-10 flex flex-col items-center px-8 text-center">
      {/* Logo */}
      <div
        style={{
          width: 115,
          height: 115,
          borderRadius: 28,
          background: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          marginBottom: 24,
          boxShadow:
            "0 10px 45px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08)",
          animation:
            "splashLogoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        <img
          src={COLLEGE_LOGO_URL}
          alt="NDC"
          style={{
            width: 92,
            height: 92,
            objectFit: "contain",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      </div>

      {/* College name */}
      <h1
        style={{
          color: "white",
          fontFamily: "Sora, sans-serif",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "0.02em",
          marginBottom: 6,
          animation: "splashFadeUp 0.5s 0.3s ease-out both",
        }}
      >
        National Degree College
      </h1>

      {/* Subtitle */}
      <p
        style={{
          color: "rgba(255,255,255,0.55)",
          fontFamily: "Sora, sans-serif",
          fontSize: 13,
          marginBottom: 34,
          animation: "splashFadeUp 0.5s 0.45s ease-out both",
        }}
      >
        Nandyal
      </p>

      {/* Progress */}
      <div
        style={{
          width: 180,
          height: 4,
          borderRadius: 999,
          overflow: "hidden",
          background: "rgba(255,255,255,0.12)",
          marginBottom: 36,
          animation: "splashFadeUp 0.5s 0.55s ease-out both",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 999,
            background:
              "linear-gradient(90deg, #e8601c, #ff8a50)",
            animation: "splashBar 2.5s ease-in-out forwards",
          }}
        />
      </div>

      {/* Dynamic quote */}
      <p
        style={{
          color: "rgba(255,255,255,0.84)",
          fontSize: 17,
          lineHeight: 1.7,
          fontFamily: "serif",
          maxWidth: 340,
          animation: "splashFadeUp 0.5s 0.65s ease-out both",
        }}
      >
        {randomQuote}
      </p>
    </div>

    {/* Bottom line */}
    <div
      className="absolute bottom-0 left-0 right-0"
      style={{
        height: 4,
        background:
          "linear-gradient(90deg, #e8601c, #f07840, #e8601c)",
      }}
    />

    {/* Animations */}
    <style>{`
      @keyframes splashLogoIn {
        from {
          opacity: 0;
          transform: scale(0.65);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes splashFadeUp {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes splashBar {
        from {
          width: 0%;
        }
        to {
          width: 100%;
        }
      }
    `}</style>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Artificial Loading Hook
// ─────────────────────────────────────────────────────────────
const useMinimumLoading = (delay = 2500) => {
  const [minLoading, setMinLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return minLoading;
};

// ─────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────
const RequireAuth = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const minLoading = useMinimumLoading();

  if (loading || minLoading) return <AuthLoading />;

  if (!user) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const RequireGuest = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const minLoading = useMinimumLoading();

  if (loading || minLoading) return <AuthLoading />;

  if (user) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const RequireAdmin = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, loading } = useAuth();
  const minLoading = useMinimumLoading();

  if (loading || minLoading) return <AuthLoading />;

  if (!user) return <Navigate to="/" replace />;

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────
// Timetable Router
// ─────────────────────────────────────────────────────────────
const TimetableRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;

  if (user.role === "admin") {
    return <AdminTimetablePage />;
  }

  if (user.role === "lecturer") {
    return <LecturerTimetablePage />;
  }

  return <StudentTimetablePage />;
};

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    <Route
      path="/"
      element={
        <RequireGuest>
          <Index />
        </RequireGuest>
      }
    />

    <Route
      path="/dashboard"
      element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      }
    />

    <Route
      path="/notifications"
      element={
        <RequireAuth>
          <Notifications />
        </RequireAuth>
      }
    />

    <Route
      path="/marks"
      element={
        <RequireAuth>
          <Marks />
        </RequireAuth>
      }
    />

    <Route
      path="/attendance"
      element={
        <RequireAuth>
          <Attendance />
        </RequireAuth>
      }
    />

    <Route
      path="/profile"
      element={
        <RequireAuth>
          <ProfilePage />
        </RequireAuth>
      }
    />

    <Route
      path="/groups"
      element={
        <RequireAdmin>
          <GroupsPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/departments"
      element={
        <RequireAdmin>
          <DepartmentsPage />
        </RequireAdmin>
      }
    />

    <Route
      path="/timetable"
      element={
        <RequireAuth>
          <TimetableRouter />
        </RequireAuth>
      }
    />

    <Route
      path="/timetable/edit/:group/:section/:day"
      element={
        <RequireAdmin>
          <TimetableEditor />
        </RequireAdmin>
      }
    />

    <Route
      path="/admin/lecturers"
      element={
        <RequireAuth>
          <LecturersListPage />
        </RequireAuth>
      }
    />

    <Route
      path="/admin/students"
      element={
        <RequireAuth>
          <StudentsListPage />
        </RequireAuth>
      }
    />

    <Route path="*" element={<NotFound />} />
  </Routes>
);

// ─────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────
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