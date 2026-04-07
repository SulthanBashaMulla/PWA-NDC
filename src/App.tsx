import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Notifications from "./pages/Notifications";
import Circulars from "./pages/Circulars";
import Marks from "./pages/Marks";
import Attendance from "./pages/Attendance";
import LecturersListPage from "./components/LecturersListPage";
import StudentsListPage  from "./components/StudentsListPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/circulars" element={<Circulars />} />
            <Route path="/marks" element={<Marks />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/admin/lecturers" element={<LecturersListPage />} />
<Route path="/admin/students"  element={<StudentsListPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
