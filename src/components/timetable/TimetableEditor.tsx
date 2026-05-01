// src/components/timetable/TimetableEditor.tsx  
// ═══════════════════════════════════════════════════════════════  
// Admin editor — session-based editing (ForeNoon / AfterNoon)
// UPDATED: session restriction + validation
// ═══════════════════════════════════════════════════════════════  

import { useEffect, useMemo, useState } from "react";  
import { Card } from "@/components/ui/card";  
import { Button } from "@/components/ui/button";  
import { Input } from "@/components/ui/input";  
import { Label } from "@/components/ui/label";  
import {  
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,  
} from "@/components/ui/select";  
import { Trash2, Plus, Save, Loader2 } from "lucide-react";  
import { toast } from "sonner";  
import {  
  Day, Session, TimetableSlot,  
  newSlotId, saveDayBoth,  
} from "@/firebase/timetable";  
import { useDayTimetable } from "@/hooks/useTimetable";  
import {  
  getSubjectsForGroup, SubjectConfig,  
} from "@/config/college";  
import { getAllLecturers, LecturerProfile } from "@/firebase/firestore";  
  
interface Props {  
  group:    string;  
  section:  string;  
  day:      Day;  
  semester: number;  
  session:  Session; // ✅ NEW
  adminUid: string;  
}  
  
export default function TimetableEditor({  
  group, section, day, semester, session, adminUid,  
}: Props) {  

  const { data, loading } = useDayTimetable(group, section, day);  

  const [foreNoon,  setForeNoon]  = useState<TimetableSlot[]>([]);  
  const [afterNoon, setAfterNoon] = useState<TimetableSlot[]>([]);  

  const [dirty, setDirty] = useState(false);  
  const [saving, setSaving] = useState(false);  

  const [subjects,  setSubjects]  = useState<SubjectConfig[]>([]);  
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);  

  // ─────────────────────────────────────────
  // Hydrate
  // ─────────────────────────────────────────
  useEffect(() => {  
    if (!data || dirty) return;  
    setForeNoon(data.foreNoon);  
    setAfterNoon(data.afterNoon);  
  }, [data, dirty]);  

  // ─────────────────────────────────────────
  // Load dropdowns
  // ─────────────────────────────────────────
  useEffect(() => {  
    let alive = true;  

    Promise.all([  
      getSubjectsForGroup(group, semester),  
      getAllLecturers(),  
    ])
    .then(([subs, lecs]) => {  
      if (!alive) return;  
      setSubjects(subs);  
      setLecturers(lecs);  
    });

    return () => { alive = false; };  
  }, [group, semester]);  

  // ─────────────────────────────────────────
  // Slot helpers
  // ─────────────────────────────────────────
  const update = (s: Session, next: TimetableSlot[]) => {  
    setDirty(true);  
    if (s === "foreNoon") setForeNoon(next);  
    else setAfterNoon(next);  
  };  

  const addSlot = (s: Session) => {  
    const blank: TimetableSlot = {  
      id: newSlotId(),  
      startTime: s === "foreNoon" ? "09:00" : "14:00",  
      endTime:   s === "foreNoon" ? "10:00" : "15:00",  
      subjectCode: "",  
      subjectName: "",  
      lecturerId: "",  
      lecturerName: "",  
      room: "",  
    };  

    update(s, [...(s === "foreNoon" ? foreNoon : afterNoon), blank]);  
  };  

  const removeSlot = (s: Session, id: string) => {  
    update(s, (s === "foreNoon" ? foreNoon : afterNoon).filter(x => x.id !== id));  
  };  

  const patchSlot = (s: Session, id: string, patch: Partial<TimetableSlot>) => {  
    update(
      s,
      (s === "foreNoon" ? foreNoon : afterNoon).map(x =>
        x.id === id ? { ...x, ...patch } : x
      )
    );  
  };  

  // ─────────────────────────────────────────
  // SAVE (IMPORTANT LOGIC)
  // ─────────────────────────────────────────
  const onSave = async () => {

    const activeSlots = session === "foreNoon" ? foreNoon : afterNoon;

    // ✅ VALIDATION
    if (session === "foreNoon" && activeSlots.length > 3) {
      toast.error("Fore Noon can have max 3 periods.");
      return;
    }

    if (session === "afterNoon" && activeSlots.length > 2) {
      toast.error("After Noon can have max 2 periods.");
      return;
    }

    for (const s of activeSlots) {
      if (!s.startTime || !s.endTime) {
        toast.error("Time missing"); return;
      }
      if (s.startTime >= s.endTime) {
        toast.error("Invalid time"); return;
      }
      if (!s.subjectName) {
        toast.error("Select subject"); return;
      }
      if (!s.lecturerId) {
        toast.error("Assign lecturer"); return;
      }
    }

    setSaving(true);

    try {
      await saveDayBoth(
        group,
        section,
        day,
        session === "foreNoon" ? foreNoon : [],
        session === "afterNoon" ? afterNoon : [],
        adminUid
      );

      toast.success("Timetable saved");
      setDirty(false);

    } catch (e: any) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 flex items-center gap-2">
        <Loader2 className="animate-spin" size={16} /> Loading…
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {/* ONLY SHOW ACTIVE SESSION */}
      {session === "foreNoon" && (
        <SessionEditor
          title="Fore Noon"
          slots={foreNoon}
          subjects={subjects}
          lecturers={lecturers}
          onAdd={() => addSlot("foreNoon")}
          onRemove={id => removeSlot("foreNoon", id)}
          onPatch={(id, p) => patchSlot("foreNoon", id, p)}
        />
      )}

      {session === "afterNoon" && (
        <SessionEditor
          title="After Noon"
          slots={afterNoon}
          subjects={subjects}
          lecturers={lecturers}
          onAdd={() => addSlot("afterNoon")}
          onRemove={id => removeSlot("afterNoon", id)}
          onPatch={(id, p) => patchSlot("afterNoon", id, p)}
        />
      )}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={!dirty || saving}>
          {saving ? <Loader2 className="animate-spin mr-2" size={14} /> : <Save size={14} className="mr-2" />}
          Save {day}
        </Button>
      </div>

    </div>
  );
}


// ─────────────────────────────────────────
// SESSION EDITOR (unchanged)
// ─────────────────────────────────────────
function SessionEditor({
  title, slots, subjects, lecturers,
  onAdd, onRemove, onPatch,
}: any) {

  const sorted = useMemo(
    () => [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [slots]
  );

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-3">
        <h3>{title}</h3>
        <Button size="sm" onClick={onAdd}>
          <Plus size={14}/> Add
        </Button>
      </div>

      {sorted.map(slot => (
        <div key={slot.id} className="border p-3 mb-2">
          <Input type="time" value={slot.startTime}
            onChange={e => onPatch(slot.id, { startTime: e.target.value })} />

          <Input type="time" value={slot.endTime}
            onChange={e => onPatch(slot.id, { endTime: e.target.value })} />

          <Button onClick={() => onRemove(slot.id)}>
            <Trash2 size={14}/> Remove
          </Button>
        </div>
      ))}
    </Card>
  );
}