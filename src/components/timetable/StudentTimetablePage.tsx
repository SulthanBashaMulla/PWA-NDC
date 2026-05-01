// src/components/timetable/StudentTimetablePage.tsx
// ═══════════════════════════════════════════════════════════════
// Student: read-only weekly grid for their own group + section.
// UPDATED: session-aware UI (foreNoon / afterNoon)
// ═══════════════════════════════════════════════════════════════

import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWeekTimetable } from "@/hooks/useTimetable";
import TimetableGrid from "./TimetableGrid";

export default function StudentTimetablePage() {
  const { user } = useAuth();

  const { week, loading } = useWeekTimetable(
    user?.group,
    user?.section
  );

  // 🆕 Get session
  const session = user?.session;

  if (!user || user.role !== "student") {
    return (
      <div className="p-6">
        <Card className="p-6">Students only.</Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timetable</h1>
        
        <p className="text-sm text-muted-foreground">
          {user.group} – Section {user.section}
        </p>

        {/* 🆕 SESSION DISPLAY */}
        <p className="text-sm font-medium mt-1">
          Session:{" "}
          <span className="text-primary">
            {session === "foreNoon" ? "Fore Noon" : "After Noon"}
          </span>
        </p>
      </div>

      {/* Content */}
      {loading || !week ? (
        <Card className="p-6 flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          Loading timetable…
        </Card>
      ) : (
        <TimetableGrid week={week} />
      )}
    </div>
  );
}