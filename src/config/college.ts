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

export const COLLEGE_LOGO_URL =
  "https://i.postimg.cc/VknRXB1B/1000340942-removebg-preview.png";

// ── Fixed values ─────────────────────────────────────────────
export const SEMESTERS = [1, 2, 3, 4, 5, 6];

export const MONTHS = [
  "June", "July", "August", "September", "October",
  "November", "December", "January", "February", "March",
];

// ── Config sheet URLs (public — read-only, no personal data) ──
export const CONFIG_SHEET_URLS = {
  groups:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGGqui8A13632DbW6G-h7hci6vL-I8IoQSqW6cuHgeGatgXxXk0vAho4LDz2vHjJsIfwSa8W0fkRfm/pub?gid=602607246&single=true&output=csv",
  subjects:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRGGqui8A13632DbW6G-h7hci6vL-I8IoQSqW6cuHgeGatgXxXk0vAho4LDz2vHjJsIfwSa8W0fkRfm/pub?gid=1731213369&single=true&output=csv",
};

// ── Student data spreadsheet ID — read from env ───────────────
// Set VITE_SHEET_ID in your .env.local file
export const DATA_SHEET_ID: string = (() => {
  const id = import.meta.env.VITE_SHEET_ID as string | undefined;
  if (!id) {
    console.warn(
      "[college.ts] VITE_SHEET_ID is not set. " +
      "Attendance and marks data will not load. Add it to .env.local"
    );
  }
  return id ?? "";
})();

// ── Types ────────────────────────────────────────────────────
export interface GroupConfig {
  groupCode: string;
  fullName:  string;
  sections:  string[];
}

export interface SubjectConfig {
  groupCode:   string;
  semester:    number;
  subjectCode: string;
  subjectName: string;
}

// ── Cache ─────────────────────────────────────────────────────
let cachedGroups:   GroupConfig[]   | null = null;
let cachedSubjects: SubjectConfig[] | null = null;

// ── Fetch Groups ──────────────────────────────────────────────
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

// ── Build CSV URL for any group+section ──────────────────────
export function buildSheetCsvUrl(
  group: string,
  section: string,
  type: "Attendance" | "Marks"
): string {
  if (!DATA_SHEET_ID) return "";
  const tabName = `${group}-${section}-${type}`;
  const encoded = encodeURIComponent(tabName);
  return `https://docs.google.com/spreadsheets/d/${DATA_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encoded}`;
}

// ── Get attendance + marks URLs for a group+section ──────────
export function getSheetUrls(group: string, section: string) {
  return {
    attendance: buildSheetCsvUrl(group, section, "Attendance"),
    marks:      buildSheetCsvUrl(group, section, "Marks"),
  };
}
