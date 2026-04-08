// src/config/college.ts
// ═══════════════════════════════════════════════════════════
// NDC — National Degree College, Nandyal
// Groups, Sections and Subjects fetched LIVE from Sheets
// ═══════════════════════════════════════════════════════════

import Papa from "papaparse";

// ── College Info ─────────────────────────────────────────────
export const COLLEGE_NAME    = "National Degree College";
export const COLLEGE_SHORT   = "NDC";
export const COLLEGE_PLACE   = "Nandyal";
export const COLLEGE_WEBSITE = "https://ndcndl.org";

// Upload logo to imgbb.com → paste direct link here
export const COLLEGE_LOGO_URL = "https://i.postimg.cc/VknRXB1B/1000340942-removebg-preview.png";

// ── Fixed values ─────────────────────────────────────────────
export const SEMESTERS = [1, 2, 3, 4, 5, 6];

export const MONTHS = [
  "June", "July", "August", "September", "October",
  "November", "December", "January", "February", "March"
];

// ── Config sheet URLs (safe to publish — no personal data) ───
export const CONFIG_SHEET_URLS = {
  groups:   "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGGqui8A13632DbW6G-h7hci6vL-I8IoQSqW6cuHgeGatgXxXk0vAho4LDz2vHjJsIfwSa8W0fkRfm/pub?gid=602607246&single=true&output=csv",
  subjects: "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGGqui8A13632DbW6G-h7hci6vL-I8IoQSqW6cuHgeGatgXxXk0vAho4LDz2vHjJsIfwSa8W0fkRfm/pub?gid=1731213369&single=true&output=csv",
};

// ── Student data spreadsheet ID ───────────────────────────────
// Get this from your NDC Student Data spreadsheet URL:
// https://docs.google.com/spreadsheets/d/THIS_PART/edit
export const DATA_SHEET_ID = "YOUR_STUDENT_DATA_SPREADSHEET_ID";

// ── Notices & Circulars (Firestore-based) ────────────────────
export const NOTICES_SHEET_URL   = "";
export const CIRCULARS_SHEET_URL = "";

// ── Types ────────────────────────────────────────────────────
export interface GroupConfig {
  groupCode: string;   // e.g. "BCA"
  fullName:  string;   // e.g. "Bachelor of Computer Applications"
  sections:  string[]; // e.g. ["A","B","C"]
}

export interface SubjectConfig {
  groupCode:   string; // e.g. "BCA"
  semester:    number; // e.g. 1
  subjectCode: string; // e.g. "BCA101"
  subjectName: string; // e.g. "Computer Fundamentals"
}

// ── Cache ─────────────────────────────────────────────────────
let cachedGroups:   GroupConfig[]   | null = null;
let cachedSubjects: SubjectConfig[] | null = null;

// ── Fetch Groups ──────────────────────────────────────────────
// Sheet columns: GroupCode | FullName | Sections
// Sections is comma-separated: "A,B,C"
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
                     .split(",")
                     .map((s: string) => s.trim())
                     .filter(Boolean),
      }))
      .filter((g: GroupConfig) => g.groupCode);

    return cachedGroups;
  } catch (err) {
    console.error("Failed to fetch groups, using fallback:", err);
    // Fallback — NDC degree groups
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

// ── Fetch Subjects ────────────────────────────────────────────
// Sheet columns: GroupCode | Semester | SubjectCode | SubjectName
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
  } catch (err) {
    console.error("Failed to fetch subjects:", err);
    return [];
  }
}

// ── Get subjects for a group + semester ──────────────────────
export async function getSubjectsForGroup(
  groupCode: string,
  semester: number
): Promise<SubjectConfig[]> {
  const all = await fetchSubjects();
  return all.filter(
    (s) => s.groupCode === groupCode && s.semester === semester
  );
}

// ── Get sections for a group ──────────────────────────────────
export async function getSectionsForGroup(
  groupCode: string
): Promise<string[]> {
  const groups = await fetchGroups();
  const found  = groups.find((g) => g.groupCode === groupCode);
  return found?.sections ?? ["A", "B", "C"];
}

// ── Clear cache (force re-fetch) ──────────────────────────────
export function clearConfigCache() {
  cachedGroups   = null;
  cachedSubjects = null;
}

// ── Build CSV URL dynamically for any group+section ──────────
// Tab names in your data sheet: "BCA-A-Attendance", "BCA-A-Marks"
export function buildSheetCsvUrl(
  group: string,
  section: string,
  type: "Attendance" | "Marks"
): string {
  const tabName   = `${group}-${section}-${type}`;
  const encoded   = encodeURIComponent(tabName);
  return `https://docs.google.com/spreadsheets/d/${DATA_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

// ── Get attendance + marks URLs for a group+section ──────────
export function getSheetUrls(group: string, section: string) {
  return {
    attendance: buildSheetCsvUrl(group, section, "Attendance"),
    marks:      buildSheetCsvUrl(group, section, "Marks"),
  };
}
