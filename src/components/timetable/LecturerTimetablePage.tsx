// src/components/timetable/LecturerTimetablePage.tsx
// ═══════════════════════════════════════════════════════════════
// Lecturer: two tabs.
//   • My Periods       — every slot across the college that they teach
//   • Class Timetable  — full week of their incharge class (if any)
// UPDATED: role-based Incharge logic (no more user.isIncharge)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, Clock, BookOpen, MapPin, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DAYS, Day, Session, TimetableSlot, getLecturerWeek,
} from "@/firebase/timetable";
import { useWeekTimetable } from "@/hooks/useTimetable";
import { fetchGroups } from "@/config/college";
import TimetableGrid from "./TimetableGrid";

interface MyPeriod {
  group: string; section: string; day: Day; session: Session; slot: TimetableSlot;
}

export default function LecturerTimetablePage() {
  const { user } = useAuth();

  // ✅ NEW: role-based check
  const isIncharge = user?.roles?.includes("Incharge");

  const [periods, setPeriods] = useState<MyPeriod[] | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Incharge class only if role exists
  const inchargeGroup   = isIncharge ? user?.group   : undefined;
  const inchargeSection = isIncharge ? user?.section : undefined;

  const { week, loading: weekLoading } =
    useWeekTimetable(inchargeGroup, inchargeSection);

  // Load lecturer periods
  useEffect(() => {
    if (!user || user.role !== "lecturer") return;

    let alive = true;
    setLoading(true);

    fetchGroups()
      .then(async groups => {
        const classes = groups.flatMap(g =>
          g.sections.map(s => ({ group: g.groupCode, section: s })),
        );

        const list = await getLecturerWeek(classes, user.uid);

        if (!alive) return;
        setPeriods(list);
      })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [user]);

  if (!user || user.role !== "lecturer") {
    return (
      <div className="p-6">
        <Card className="p-6">Lecturers only.</Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Timetable</h1>
        <p className="text-sm text-muted-foreground">{user.name}</p>

        {/* ✅ Show badges */}
        <div className="flex gap-2 mt-2">
          {user.roles?.map((r: string) => (
            <Badge key={r}>{r}</Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="mine">
        <TabsList>
          <TabsTrigger value="mine">My Periods</TabsTrigger>

          {/* ✅ Only enable if Incharge */}
          <TabsTrigger value="class" disabled={!isIncharge}>
            Class Timetable {isIncharge && `(${user.group}-${user.section})`}
          </TabsTrigger>
        </TabsList>

        {/* ── MY PERIODS ── */}
        <TabsContent value="mine" className="mt-4">
          {loading || !periods ? (
            <Card className="p-6 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Scanning timetables…
            </Card>
          ) : (
            <MyPeriodsView periods={periods} />
          )}
        </TabsContent>

        {/* ── CLASS TIMETABLE ── */}
        <TabsContent value="class" className="mt-4">
          {!isIncharge ? (
            <Card className="p-6 text-sm text-muted-foreground">
              You are not assigned as a class incharge.
            </Card>
          ) : weekLoading || !week ? (
            <Card className="p-6 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Loading class timetable…
            </Card>
          ) : (
            <TimetableGrid week={week} highlightLecturerId={user.uid} />
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}

// ── My Periods view ──────────────────────────────────────────
function MyPeriodsView({ periods }: { periods: MyPeriod[] }) {
  if (periods.length === 0) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        No periods assigned to you yet.
      </Card>
    );
  }

  const byDay: Record<Day, MyPeriod[]> = {
    Monday: [], Tuesday: [], Wednesday: [],
    Thursday: [], Friday: [], Saturday: [],
  };

  for (const p of periods) byDay[p.day].push(p);

  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <Card key={day} className="p-4">
          <div className="flex items-baseline justify-between mb-2">
            <h3 className="font-bold">{day}</h3>
            <span className="text-xs text-muted-foreground">
              {byDay[day].length} {byDay[day].length === 1 ? "period" : "periods"}
            </span>
          </div>

          {byDay[day].length === 0 ? (
            <p className="text-xs text-muted-foreground italic">—</p>
          ) : (
            <ul className="space-y-2">
              {byDay[day].map(p => (
                <li
                  key={`${p.group}-${p.section}-${p.session}-${p.slot.id}`}
                  className="rounded-md border p-2 text-sm"
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    <span>{p.slot.startTime} – {p.slot.endTime}</span>
                    <Badge variant="secondary" className="ml-1">
                      {p.session === "foreNoon" ? "FN" : "AN"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 font-medium mt-0.5">
                    <BookOpen size={14} />
                    <span>{p.slot.subjectName}</span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {p.group} – {p.section}
                    </span>

                    {p.slot.room && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {p.slot.room}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ))}
    </div>
  );
}