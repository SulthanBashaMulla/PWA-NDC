// src/config/college.ts
import Papa from "papaparse";

// ── College Info ─────────────────────────────────────────────
export const COLLEGE_NAME = "National Degree College";
export const COLLEGE_SHORT = "NDC";
export const COLLEGE_PLACE = "Nandyal";
export const COLLEGE_WEBSITE = "https://ndcndl.org";
export const COLLEGE_LOGO_URL = "https://i.postimg.cc/pXbTGLXB/ndc-logo.png";

// ── Semesters & Months ───────────────────────────────────────
export const SEMESTERS = [1, 2, 3, 4, 5, 6];

export const MONTHS = [
"January", "February", "March", "April", "May", "June", "July", "August", "September", "October",
  "November", "December", 
];

export const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as
const;

// ── Sheet IDs ────────────────────────────────────────────────
// Login Sheet — has Lecturers / Students / Admins / Groups / Subjects tabs
const LOGIN_SHEET_ID = "1F2V6ZeW7_qOnceOOsTvxyVGRDe9ULSpqhdbhE1ECqH8";

// NDC Student Data Sheet — has {Group}-{Section}-Attendance / Marks tabs
export const DATA_SHEET_ID =
  import.meta.env.VITE_SHEET_ID || "1F2V6ZeW7_qOnceOOsTvxyVGRDe9ULSpqhdbhE1ECqH8";

// NDC Timetable Sheet — has {Group}-{Section}-Timetable tabs (reference/export only)
// Primary timetable data lives in Firestore (real-time).
// This sheet is used as a read reference / CSV backup.
export const TIMETABLE_SHEET_ID = "1GsE0heccGwWRMS0QqhESjBEBHT9qhdDSvhFP1UeGUo4";

// ── CSV URL builders ─────────────────────────────────────────
function csvUrl(sheetId: string, tabName: string): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

function loginSheetCsvUrl(tabName: string): string {
  return csvUrl(LOGIN_SHEET_ID, tabName);
}

// Config URLs — Groups and Subjects tabs from Login sheet
export const CONFIG_SHEET_URLS = {
  groups: loginSheetCsvUrl("Groups"),
  subjects: loginSheetCsvUrl("Subjects"),
};

// Attendance + Marks for a group/section from Student Data sheet
export function getSheetUrls(group: string, section: string) {
  return {
    attendance: csvUrl(DATA_SHEET_ID, `${group}-${section}-Attendance`),
    marks: csvUrl(DATA_SHEET_ID, `${group}-${section}-Marks`),
  };
}

// Timetable CSV reference (not used for live data — Firestore is used instead)
export function getTimetableUrl(group: string, section: string): string {
  return csvUrl(TIMETABLE_SHEET_ID, `${group}-${section}-Timetable`);
}

// Legacy compat
export function buildSheetCsvUrl(
  group: string, section: string, type: "Attendance" | "Marks"
): string {
  return csvUrl(DATA_SHEET_ID, `${group}-${section}-${type}`);
}

// ── Types ────────────────────────────────────────────────────
export interface GroupConfig {
  groupCode: string;
  fullName: string;
  sections: string[];
  department ? : string;
}

export interface SubjectConfig {
  groupCode: string;
  semester: number;
  subjectCode: string;
  subjectName: string;
}

// ── Cache ────────────────────────────────────────────────────
let cachedGroups: GroupConfig[] | null = null;
let cachedSubjects: SubjectConfig[] | null = null;

// ── Fetch Groups ─────────────────────────────────────────────
export async function fetchGroups(): Promise < GroupConfig[] > {
  if (cachedGroups) return cachedGroups;
  try {
    const res = await fetch(CONFIG_SHEET_URLS.groups);
    const text = await res.text();
    const result = Papa.parse < any > (text, { header: true, skipEmptyLines: true });
    
    cachedGroups = result.data
      .map((row: any) => ({
        groupCode: String(row.GroupCode || row.groupCode || "").trim(),
        fullName: String(row.FullName || row.fullName || "").trim(),
        department: String(row.Department || row.department || "").trim(),
        sections: String(row.Sections || row.sections || "A")
          .split(",").map((s: string) => s.trim()).filter(Boolean),
      }))
      .filter((g: GroupConfig) => g.groupCode);
    
    return cachedGroups;
  } catch {
    cachedGroups = [
      { groupCode: "BCA", fullName: "Bachelor of Computer Applications", department: "Computer Science", sections: ["A", "B", "C"] },
      { groupCode: "BSc CS", fullName: "BSc Computer Science", department: "Computer Science", sections: ["A", "B", "C"] },
      { groupCode: "BSc QT", fullName: "BSc Quantum Technology", department: "Science", sections: ["A", "B"] },
      { groupCode: "BSc IOT", fullName: "BSc Internet of Things", department: "Computer Science", sections: ["A", "B"] },
      { groupCode: "BSc IT", fullName: "BSc Information Technology", department: "Computer Science", sections: ["A", "B", "C"] },
      { groupCode: "BSc Bot", fullName: "BSc Botany", department: "Science", sections: ["A", "B"] },
      { groupCode: "BCom CA", fullName: "BCom Computer Applications", department: "Commerce", sections: ["A", "B", "C"] },
      { groupCode: "BBA", fullName: "Bachelor of Business Administration", department: "Management", sections: ["A", "B"] },
      { groupCode: "BA Urdu", fullName: "BA Special Urdu", department: "Arts", sections: ["A"] },
    ];
    return cachedGroups;
  }
}

// Unique departments from groups list
export async function fetchDepartments(): Promise < string[] > {
  const groups = await fetchGroups();
  return Array.from(new Set(groups.map(g => g.department || "").filter(Boolean))).sort();
}

// ── Fetch Subjects ───────────────────────────────────────────
export async function fetchSubjects(): Promise < SubjectConfig[] > {
  if (cachedSubjects) return cachedSubjects;
  try {
    const res = await fetch(CONFIG_SHEET_URLS.subjects);
    const text = await res.text();
    const result = Papa.parse < any > (text, { header: true, skipEmptyLines: true });
    
    cachedSubjects = result.data
      .map((row: any) => ({
        groupCode: String(row.GroupCode || row.groupCode || "").trim(),
        semester: Number(row.Semester || row.semester || 1),
        subjectCode: String(row.SubjectCode || row.subjectCode || "").trim(),
        subjectName: String(row.SubjectName || row.subjectName || "").trim(),
      }))
      .filter((s: SubjectConfig) => s.groupCode && s.subjectName);
    
    return cachedSubjects;
  } catch {
    return [];
  }
}

export async function getSubjectsForGroup(
  groupCode: string, semester: number
): Promise < SubjectConfig[] > {
  const all = await fetchSubjects();
  return all.filter(s => s.groupCode === groupCode && s.semester === semester);
}

export async function getSectionsForGroup(groupCode: string): Promise < string[] > {
  const groups = await fetchGroups();
  return groups.find(g => g.groupCode === groupCode)?.sections ?? ["A", "B", "C"];
}

export function clearConfigCache() {
  cachedGroups = null;
  cachedSubjects = null;
}