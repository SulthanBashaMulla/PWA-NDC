// src/config/college.ts
// ═══════════════════════════════════════════════════════════════
// NDC — National Degree College, Nandyal
// Single source of truth: Google Sheets
// ═══════════════════════════════════════════════════════════════

import Papa from "papaparse";

// ── College Info ─────────────────────────────────────────────
export const COLLEGE_NAME     = "National Degree College";
export const COLLEGE_SHORT    = "NDC";
export const COLLEGE_PLACE    = "Nandyal";
export const COLLEGE_WEBSITE  = "https://ndcndl.org";
export const COLLEGE_LOGO_URL = "https://i.postimg.cc/pXbTGLXB/ndc-logo.png";

// ── Semesters & Months ───────────────────────────────────────
export const SEMESTERS = [1, 2, 3, 4, 5, 6];

export const MONTHS = [
  "June", "July", "August", "September", "October",
  "November", "December", "January", "February", "March",
];

// ── YOUR Login Sheet ID ──────────────────────────────────────
// This is your Login sheet that has Lecturers/Students/Admins/Groups/Subjects tabs
const LOGIN_SHEET_ID = "1F2V6ZeW7_qOnceOOsTvxyVGRDe9ULSpqhdbhE1ECqH8";

// ── YOUR Student Data Sheet ID ───────────────────────────────
// This is your NDC Student Data sheet that has Attendance/Marks tabs
// Update this with your NDC Student Data sheet ID from its URL
export const DATA_SHEET_ID =
  import.meta.env.VITE_SHEET_ID || "1F2V6ZeW7_qOnceOOsTvxyVGRDe9ULSpqhdbhE1ECqH8";

// ── Build published CSV URL from Login sheet ─────────────────
// Uses the tab name (gid not needed — use sheet name param)
function loginSheetCsvUrl(tabName: string): string {
  return `https://docs.google.com/spreadsheets/d/${LOGIN_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

// Config URLs — Groups and Subjects tabs from Login sheet
export const CONFIG_SHEET_URLS = {
  groups:   loginSheetCsvUrl("Groups"),
  subjects: loginSheetCsvUrl("Subjects"),
};

// ── Types ────────────────────────────────────────────────────
export interface GroupConfig {
  groupCode: string;   // e.g. "BCA"
  fullName:  string;   // e.g. "Bachelor of Computer Applications"
  sections:  string[]; // e.g. ["A","B","C"]
}

export interface SubjectConfig {
  groupCode:   string;
  semester:    number;
  subjectCode: string;
  subjectName: string;
}

// ── Cache ────────────────────────────────────────────────────
let cachedGroups:   GroupConfig[]   | null = null;
let cachedSubjects: SubjectConfig[] | null = null;

// ── Fetch Groups from Login sheet → Groups tab ───────────────
export async function fetchGroups(): Promise<GroupConfig[]> {
  if (cachedGroups) return cachedGroups;
  try {
    const res    = await fetch(CONFIG_SHEET_URLS.groups);
    const text   = await res.text();
    const result = Papa.parse<any>(text, { header: true, skipEmptyLines: true });

    cachedGroups = result.data
      .map((row: any) => ({
        groupCode: String(row.GroupCode || row.groupCode || "").trim(),
        fullName:  String(row.FullName  || row.fullName  || "").trim(),
        sections:  String(row.Sections  || row.sections  || "A")
          .split(",").map((s: string) => s.trim()).filter(Boolean),
      }))
      .filter((g: GroupConfig) => g.groupCode);

    return cachedGroups;
  } catch {
    // Fallback hardcoded groups
    cachedGroups = [
      { groupCode: "BCA",     fullName: "Bachelor of Computer Applications",   sections: ["A","B","C"] },
      { groupCode: "BSc CS",  fullName: "BSc Computer Science",                sections: ["A","B","C"] },
      { groupCode: "BSc QT",  fullName: "BSc Quantum Technology",              sections: ["A","B"]     },
      { groupCode: "BSc IOT", fullName: "BSc Internet of Things",              sections: ["A","B"]     },
      { groupCode: "BSc IT",  fullName: "BSc Information Technology",          sections: ["A","B","C"] },
      { groupCode: "BSc Bot", fullName: "BSc Botany",                          sections: ["A","B"]     },
      { groupCode: "BCom CA", fullName: "BCom Computer Applications",          sections: ["A","B","C"] },
      { groupCode: "BBA",     fullName: "Bachelor of Business Administration", sections: ["A","B"]     },
      { groupCode: "BA Urdu", fullName: "BA Special Urdu",                     sections: ["A"]         },
    ];
    return cachedGroups;
  }
}

// ── Fetch Subjects from Login sheet → Subjects tab ───────────
export async function fetchSubjects(): Promise<SubjectConfig[]> {
  if (cachedSubjects) return cachedSubjects;
  try {
    const res    = await fetch(CONFIG_SHEET_URLS.subjects);
    const text   = await res.text();
    const result = Papa.parse<any>(text, { header: true, skipEmptyLines: true });

    cachedSubjects = result.data
      .map((row: any) => ({
        groupCode:   String(row.GroupCode   || row.groupCode   || "").trim(),
        semester:    Number(row.Semester    || row.semester    || 1),
        subjectCode: String(row.SubjectCode || row.subjectCode || "").trim(),
        subjectName: String(row.SubjectName || row.subjectName || "").trim(),
      }))
      .filter((s: SubjectConfig) => s.groupCode && s.subjectName);

    return cachedSubjects;
  } catch {
    return [];
  }
}

// ── Get subjects for a specific group + semester ─────────────
export async function getSubjectsForGroup(
  groupCode: string,
  semester:  number
): Promise<SubjectConfig[]> {
  const all = await fetchSubjects();
  return all.filter(s => s.groupCode === groupCode && s.semester === semester);
}

// ── Get sections for a specific group ────────────────────────
export async function getSectionsForGroup(groupCode: string): Promise<string[]> {
  const groups = await fetchGroups();
  return groups.find(g => g.groupCode === groupCode)?.sections ?? ["A","B","C"];
}

// ── Clear cache (call when sheet data changes) ────────────────
export function clearConfigCache() {
  cachedGroups   = null;
  cachedSubjects = null;
}

// ── Build CSV URL for Attendance/Marks from Student Data sheet
// Tab name format: "BCA-A-Attendance" or "BCA-A-Marks"
export function buildSheetCsvUrl(
  group:   string,
  section: string,
  type:    "Attendance" | "Marks"
): string {
  const tabName = `${group}-${section}-${type}`;
  return `https://docs.google.com/spreadsheets/d/${DATA_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}`;
}

// ── Get both URLs for a group+section ────────────────────────
export function getSheetUrls(group: string, section: string) {
  return {
    attendance: buildSheetCsvUrl(group, section, "Attendance"),
    marks:      buildSheetCsvUrl(group, section, "Marks"),
  };
}
