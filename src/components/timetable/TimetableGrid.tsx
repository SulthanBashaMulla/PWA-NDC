// src/components/timetable/TimetableGrid.tsx
// ═══════════════════════════════════════════════════════════════
// Read-only weekly grid (Mon–Sat × ForeNoon / AfterNoon).
// Used by Student dashboard and Lecturer "Class Timetable" tab.
// ═══════════════════════════════════════════════════════════════
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, User, MapPin } from "lucide-react";
import {
  DAYS, Day, DayTimetable, Session, TimetableSlot,
} from "@/firebase/timetable";

interface Props {
  week: Record<Day, DayTimetable>;
  /** Optional — highlight slots taught by this lecturer uid */
  highlightLecturerId?: string;
}

const SESSION_LABEL: Record<Session, string> = {
  foreNoon:  "Fore Noon",
  afterNoon: "After Noon",
};

export default function TimetableGrid({ week, highlightLecturerId }: Props) {
  return (
    <div className="space-y-4">
      {DAYS.map(day => (
        <DayBlock
          key={day}
          day={day}
          data={week[day]}
          highlightLecturerId={highlightLecturerId}
        />
      ))}
    </div>
  );
}

function DayBlock({
  day, data, highlightLecturerId,
}: { day: Day; data: DayTimetable; highlightLecturerId?: string }) {
  const empty = data.foreNoon.length === 0 && data.afterNoon.length === 0;
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-bold">{day}</h3>
        {empty && <span className="text-xs text-muted-foreground">No classes scheduled</span>}
      </div>

      {!empty && (
        <div className="grid gap-4 md:grid-cols-2">
          <SessionColumn
            label={SESSION_LABEL.foreNoon}
            slots={data.foreNoon}
            highlightLecturerId={highlightLecturerId}
          />
          <SessionColumn
            label={SESSION_LABEL.afterNoon}
            slots={data.afterNoon}
            highlightLecturerId={highlightLecturerId}
          />
        </div>
      )}
    </Card>
  );
}

function SessionColumn({
  label, slots, highlightLecturerId,
}: { label: string; slots: TimetableSlot[]; highlightLecturerId?: string }) {
  const sorted = [...slots].sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary">{label}</Badge>
        <span className="text-xs text-muted-foreground">
          {sorted.length} {sorted.length === 1 ? "period" : "periods"}
        </span>
      </div>
      {sorted.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">—</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map(s => (
            <SlotRow
              key={s.id}
              slot={s}
              highlight={!!highlightLecturerId && s.lecturerId === highlightLecturerId}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function SlotRow({ slot, highlight }: { slot: TimetableSlot; highlight: boolean }) {
  return (
    <li
      className={
        "rounded-md border p-2 text-sm " +
        (highlight ? "border-primary bg-primary/5" : "border-border")
      }
    >
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock size={12} />
        <span>{slot.startTime} – {slot.endTime}</span>
      </div>
      <div className="flex items-center gap-1 font-medium mt-0.5">
        <BookOpen size={14} />
        <span>{slot.subjectName}</span>
        {slot.subjectCode && (
          <span className="text-xs text-muted-foreground">({slot.subjectCode})</span>
        )}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
        <span className="flex items-center gap-1"><User size={12} />{slot.lecturerName}</span>
        {slot.room && (
          <span className="flex items-center gap-1"><MapPin size={12} />{slot.room}</span>
        )}
      </div>
    </li>
  );
}
