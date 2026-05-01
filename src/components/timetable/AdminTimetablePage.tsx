// src/components/timetable/AdminTimetablePage.tsx
// ═══════════════════════════════════════════════════════════════
// Admin: pick group + section + day + semester, then edit.
// UPDATED: session-aware (foreNoon / afterNoon)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import {
  fetchGroups, GroupConfig, SEMESTERS,
} from "@/config/college";
import { DAYS, Day } from "@/firebase/timetable";
import TimetableEditor from "./TimetableEditor";

export default function AdminTimetablePage() {
  const { user } = useAuth();

  const [groups, setGroups] = useState<GroupConfig[]>([]);
  const [group,    setGroup]    = useState<string>("");
  const [section,  setSection]  = useState<string>("");
  const [day,      setDay]      = useState<Day>("Monday");
  const [semester, setSemester] = useState<number>(1);

  // 🆕 session of selected group
  const [session, setSession] = useState<"foreNoon" | "afterNoon">("foreNoon");

  useEffect(() => {
    fetchGroups().then(g => {
      setGroups(g);

      if (g.length > 0) {
        const first = g[0];
        setGroup(first.groupCode);
        setSection(first.sections[0] ?? "A");

        // 🆕 set session from config
        setSession(first.session ?? "foreNoon");
      }
    });
  }, []);

  const selectedGroup = groups.find(g => g.groupCode === group);
  const sections = selectedGroup?.sections ?? [];

  // 🆕 update session when group changes
  useEffect(() => {
    if (!selectedGroup) return;
    setSession(selectedGroup.session ?? "foreNoon");
  }, [group, selectedGroup]);

  if (!user || user.role !== "admin") {
    return (
      <div className="p-6">
        <Card className="p-6">Admins only.</Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Manage Timetable</h1>

      <Card className="p-4 grid gap-3 sm:grid-cols-4">

        {/* GROUP */}
        <div>
          <Label className="text-xs">Group</Label>
          <Select value={group} onValueChange={(v) => {
            setGroup(v);
            const g = groups.find(g => g.groupCode === v);
            const s = g?.sections ?? [];

            setSection(s[0] ?? "A");

            // 🆕 update session
            setSession(g?.session ?? "foreNoon");
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {groups.map(g => (
                <SelectItem key={g.groupCode} value={g.groupCode}>
                  {g.groupCode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SECTION */}
        <div>
          <Label className="text-xs">Section</Label>
          <Select value={section} onValueChange={setSection}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {sections.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SEMESTER */}
        <div>
          <Label className="text-xs">Semester</Label>
          <Select value={String(semester)} onValueChange={(v) => setSemester(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEMESTERS.map(s => (
                <SelectItem key={s} value={String(s)}>Sem {s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* DAY */}
        <div>
          <Label className="text-xs">Day</Label>
          <Select value={day} onValueChange={(v) => setDay(v as Day)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DAYS.map(d => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* 🆕 SESSION DISPLAY */}
      <div className="flex items-center gap-2">
        <span className="text-sm">Session:</span>
        <Badge>
          {session === "foreNoon" ? "Fore Noon" : "After Noon"}
        </Badge>
      </div>

      {/* EDITOR */}
      {group && section && (
        <TimetableEditor
          group={group}
          section={section}
          day={day}
          semester={semester}
          session={session}   // 🆕 VERY IMPORTANT
          adminUid={user.uid}
        />
      )}
    </div>
  );
}