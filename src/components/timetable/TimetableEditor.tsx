import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import AnimatedBackground from "@/components/AnimatedBackground";
import {
  getDayTimetable, saveSession, newSlotId, DAYS,
  type Day, type Session, type TimetableSlot,
} from "@/firebase/timetable";
import { fetchSubjects, getSubjectsForGroup, type SubjectConfig } from "@/config/college";
import { getAllLecturers } from "@/firebase/firestore";
import type { LecturerProfile } from "@/firebase/firestore";
import { Plus, Trash2, Save, ChevronLeft } from "lucide-react";

// Max slots per session
const MAX_FN = 3;
const MAX_AN = 2;

const emptySlot = (): TimetableSlot => ({
  id:           newSlotId(),
  startTime:    "",
  endTime:      "",
  subjectCode:  "",
  subjectName:  "",
  lecturerId:   "",
  lecturerName: "",
  room:         "",
  notes:        "",
});

const TimetableEditor = () => {
  const { group = "", section = "", day = "Monday" } = useParams<{
    group: string; section: string; day: string;
  }>();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [fnSlots,   setFnSlots]   = useState<TimetableSlot[]>([]);
  const [anSlots,   setAnSlots]   = useState<TimetableSlot[]>([]);
  const [subjects,  setSubjects]  = useState<SubjectConfig[]>([]);
  const [lecturers, setLecturers] = useState<LecturerProfile[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState<Session | null>(null);
  const [saved,     setSaved]     = useState<Session | null>(null);
  const [error,     setError]     = useState("");

  useEffect(() => {
    Promise.all([
      getDayTimetable(group, section, day as Day).then(d => {
        setFnSlots(d.foreNoon.length  > 0 ? d.foreNoon  : [emptySlot()]);
        setAnSlots(d.afterNoon.length > 0 ? d.afterNoon : [emptySlot()]);
      }),
      fetchSubjects().then(setSubjects),
      getAllLecturers().then(setLecturers),
    ]).catch(() => setError("Failed to load data."))
      .finally(() => setLoading(false));
  }, [group, section, day]);

  const groupSubjects = subjects.filter(s => s.groupCode === group);

  const updateSlot = (
    session: Session, idx: number, field: keyof TimetableSlot, value: string
  ) => {
    const setter = session === "foreNoon" ? setFnSlots : setAnSlots;
    setter(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Auto-fill subject name when code selected
      if (field === "subjectCode") {
        const sub = groupSubjects.find(s => s.subjectCode === value);
        if (sub) next[idx].subjectName = sub.subjectName;
      }
      // Auto-fill lecturer name when id selected
      if (field === "lecturerId") {
        const lec = lecturers.find(l => l.lecturerId === value);
        if (lec) next[idx].lecturerName = lec.name;
      }
      return next;
    });
  };

  const addSlot = (session: Session) => {
    const max    = session === "foreNoon" ? MAX_FN : MAX_AN;
    const slots  = session === "foreNoon" ? fnSlots : anSlots;
    const setter = session === "foreNoon" ? setFnSlots : setAnSlots;
    if (slots.length >= max) {
      setError(`Max ${max} periods for ${session === "foreNoon" ? "Fore Noon" : "After Noon"}.`);
      return;
    }
    setError("");
    setter(prev => [...prev, emptySlot()]);
  };

  const removeSlot = (session: Session, idx: number) => {
    const setter = session === "foreNoon" ? setFnSlots : setAnSlots;
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (session: Session) => {
    const slots = session === "foreNoon" ? fnSlots : anSlots;
    const valid = slots.filter(s => s.subjectName.trim() && s.startTime && s.endTime);
    if (valid.length === 0) { setError("Add at least one complete period before saving."); return; }
    setSaving(session); setError("");
    try {
      await saveSession(group, section, day as Day, session, valid, user?.uid || "admin");
      setSaved(session);
      setTimeout(() => setSaved(null), 2500);
    } catch { setError("Save failed. Check connection."); }
    finally { setSaving(null); }
  };

  const SlotForm = ({ slot, idx, session }: { slot: TimetableSlot; idx: number; session: Session }) => (
    <div className="ndc-card mb-3 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="badge badge-navy text-[10px]">Period {idx + 1}</span>
        <button onClick={() => removeSlot(session, idx)}
          className="rounded-lg p-1.5 hover:bg-red-50" style={{ color:"#ef4444" }}>
          <Trash2 size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
            Start Time
          </label>
          <input type="time" value={slot.startTime}
            onChange={e => updateSlot(session, idx, "startTime", e.target.value)}
            className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
            End Time
          </label>
          <input type="time" value={slot.endTime}
            onChange={e => updateSlot(session, idx, "endTime", e.target.value)}
            className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
        </div>
      </div>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
            Subject
          </label>
          {groupSubjects.length > 0 ? (
            <select value={slot.subjectCode}
              onChange={e => updateSlot(session, idx, "subjectCode", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }}>
              <option value="">Select subject…</option>
              {groupSubjects.map(s => (
                <option key={s.subjectCode} value={s.subjectCode}>{s.subjectName}</option>
              ))}
            </select>
          ) : (
            <input type="text" value={slot.subjectName} placeholder="Subject name…"
              onChange={e => updateSlot(session, idx, "subjectName", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
          )}
        </div>
        <div>
          <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
            Lecturer
          </label>
          {lecturers.length > 0 ? (
            <select value={slot.lecturerId}
              onChange={e => updateSlot(session, idx, "lecturerId", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }}>
              <option value="">Select lecturer…</option>
              {lecturers.map(l => (
                <option key={l.lecturerId} value={l.lecturerId}>{l.name} ({l.lecturerId})</option>
              ))}
            </select>
          ) : (
            <input type="text" value={slot.lecturerName} placeholder="Lecturer name…"
              onChange={e => updateSlot(session, idx, "lecturerName", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
              Room (optional)
            </label>
            <input type="text" value={slot.room || ""} placeholder="e.g. 301"
              onChange={e => updateSlot(session, idx, "room", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1" style={{ fontFamily:"Sora,sans-serif", color:"var(--text-2)" }}>
              Notes (optional)
            </label>
            <input type="text" value={slot.notes || ""} placeholder="e.g. Lab"
              onChange={e => updateSlot(session, idx, "notes", e.target.value)}
              className="ndc-input" style={{ padding:"8px 10px", fontSize:"13px" }} />
          </div>
        </div>
      </div>
    </div>
  );

  const SessionBlock = ({
    label, session, slots, max, emoji,
  }: { label: string; session: Session; slots: TimetableSlot[]; max: number; emoji: string }) => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="section-title">{emoji} {label}</p>
        <span className="badge badge-gray text-[10px]">{slots.length}/{max} periods</span>
      </div>
      {slots.map((slot, idx) => (
        <SlotForm key={slot.id} slot={slot} idx={idx} session={session} />
      ))}
      <div className="flex gap-2 mt-2">
        {slots.length < max && (
          <button onClick={() => addSlot(session)}
            className="btn-navy flex items-center gap-2 text-sm"
            style={{ width:"auto", padding:"9px 16px" }}>
            <Plus size={14} /> Add Period
          </button>
        )}
        <button onClick={() => handleSave(session)}
          disabled={saving === session}
          className="btn-orange flex items-center gap-2 text-sm flex-1">
          {saving === session
            ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            : <Save size={14} />}
          {saving === session ? "Saving…" : saved === session ? "✅ Saved!" : `Save ${label}`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="relative z-10">
        <Navbar />
        <div className="max-w-2xl mx-auto p-4 pb-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 animate-fade-in-up">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background:"var(--surface)", border:"1px solid rgba(15,45,94,0.1)", color:"var(--navy)" }}>
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ fontFamily:"Sora,sans-serif", color:"var(--navy)" }}>
                Edit Timetable
              </h1>
              <p className="text-sm" style={{ color:"var(--text-3)" }}>
                {group} · Section {section} · {day}
              </p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold animate-fade-in"
              style={{ background:"rgba(239,68,68,0.08)", color:"#dc2626", border:"1px solid rgba(239,68,68,0.15)" }}>
              {error}
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 rounded-[16px] animate-pulse"
                  style={{ background:"rgba(15,45,94,0.06)" }} />
              ))}
            </div>
          ) : (
            <>
              <SessionBlock
                label="Fore Noon" session="foreNoon"
                slots={fnSlots} max={MAX_FN} emoji="☀️" />
              <SessionBlock
                label="After Noon" session="afterNoon"
                slots={anSlots} max={MAX_AN} emoji="🌤" />
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default TimetableEditor;
