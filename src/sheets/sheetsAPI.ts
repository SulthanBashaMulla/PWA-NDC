// src/sheets/sheetsAPI.ts
// ═══════════════════════════════════════════════════════════
// Google Sheets API v4 — write-back for class incharge lecturers
// ═══════════════════════════════════════════════════════════

// API key from env — never hardcode in source
const SHEETS_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string;

if (!SHEETS_API_KEY) {
  console.warn(
    "[sheetsAPI] VITE_GOOGLE_API_KEY is not set. " +
    "Write-back to Google Sheets will fail. Add it to .env.local"
  );
}

// ── Row types ─────────────────────────────────────────────────
export interface AttendanceRow {
  rollNo:      string;
  name:        string;
  month:       string;
  daysPresent: number;
  totalDays:   number;
  percentage:  number;
  semester:    number;
}

export interface MarksRow {
  rollNo:   string;
  name:     string;
  subject:  string;
  mid1:     number;
  mid2:     number;
  semester: number;
}

// ── Extract spreadsheet ID from editor URL ────────────────────
// Use the editor URL: https://docs.google.com/spreadsheets/d/YOUR_ID/edit
// NOT the published /pub URL (those are read-only via CSV)
export function extractSheetId(url: string): string {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match) return match[1];
  throw new Error(
    "Cannot extract sheet ID. Use the editor URL: " +
    "https://docs.google.com/spreadsheets/d/YOUR_ID/edit"
  );
}

export function extractSheetName(url: string): string {
  const match = url.match(/[?&]sheet=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "Sheet1";
}

// ── Base Sheets API request ───────────────────────────────────
async function sheetsRequest(
  method: "GET" | "POST" | "PUT",
  spreadsheetId: string,
  range: string,
  body?: object
) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  let url: string;
  if (method === "GET") {
    url = `${base}/values/${encodeURIComponent(range)}?key=${SHEETS_API_KEY}`;
  } else if (method === "POST") {
    url = `${base}/values/${encodeURIComponent(range)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS&key=${SHEETS_API_KEY}`;
  } else {
    url = `${base}/values/${encodeURIComponent(range)}?valueInputOption=RAW&key=${SHEETS_API_KEY}`;
  }

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Sheets API error: ${res.status}`);
  }

  return res.json();
}

// ── Read all rows from a sheet tab ────────────────────────────
export async function readSheetRows(
  spreadsheetId: string,
  sheetName: string
): Promise<string[][]> {
  const data = await sheetsRequest("GET", spreadsheetId, `${sheetName}!A:Z`);
  return data.values || [];
}

// ════════════════════════════════════════════════════════════
// ATTENDANCE WRITE-BACK
// ════════════════════════════════════════════════════════════

export async function addAttendanceRow(
  spreadsheetId: string,
  sheetName: string,
  row: AttendanceRow
): Promise<void> {
  await sheetsRequest("POST", spreadsheetId, `${sheetName}!A:G`, {
    values: [[
      row.rollNo, row.name, row.month,
      row.daysPresent, row.totalDays, row.percentage, row.semester,
    ]],
  });
}

export async function updateAttendanceRow(
  spreadsheetId: string,
  sheetName: string,
  rollNo: string,
  month: string,
  semester: number,
  updated: Partial<AttendanceRow>
): Promise<void> {
  const rows = await readSheetRows(spreadsheetId, sheetName);

  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (
      rows[i][0] === rollNo &&
      rows[i][2] === month &&
      String(rows[i][6]) === String(semester)
    ) {
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1)
    throw new Error(`No attendance record for ${rollNo} / ${month} / Sem ${semester}`);

  const e = rows[targetRow - 1];
  await sheetsRequest("PUT", spreadsheetId, `${sheetName}!A${targetRow}:G${targetRow}`, {
    values: [[
      updated.rollNo      ?? e[0],
      updated.name        ?? e[1],
      updated.month       ?? e[2],
      updated.daysPresent ?? e[3],
      updated.totalDays   ?? e[4],
      updated.percentage  ?? e[5],
      updated.semester    ?? e[6],
    ]],
  });
}

export async function deleteAttendanceRow(
  spreadsheetId: string,
  sheetName: string,
  rollNo: string,
  month: string,
  semester: number
): Promise<void> {
  const rows = await readSheetRows(spreadsheetId, sheetName);

  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (
      rows[i][0] === rollNo &&
      rows[i][2] === month &&
      String(rows[i][6]) === String(semester)
    ) {
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1) throw new Error("Attendance record not found");

  await sheetsRequest("PUT", spreadsheetId, `${sheetName}!A${targetRow}:G${targetRow}`, {
    values: [["", "", "", "", "", "", ""]],
  });
}

// ════════════════════════════════════════════════════════════
// MARKS WRITE-BACK
// ════════════════════════════════════════════════════════════

export async function addMarksRow(
  spreadsheetId: string,
  sheetName: string,
  row: MarksRow
): Promise<void> {
  await sheetsRequest("POST", spreadsheetId, `${sheetName}!A:F`, {
    values: [[
      row.rollNo, row.name, row.subject,
      row.mid1, row.mid2, row.semester,
    ]],
  });
}

export async function updateMarksRow(
  spreadsheetId: string,
  sheetName: string,
  rollNo: string,
  subject: string,
  semester: number,
  updated: Partial<MarksRow>
): Promise<void> {
  const rows = await readSheetRows(spreadsheetId, sheetName);

  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (
      rows[i][0] === rollNo &&
      rows[i][2] === subject &&
      String(rows[i][5]) === String(semester)
    ) {
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1)
    throw new Error(`No marks record for ${rollNo} / ${subject} / Sem ${semester}`);

  const e = rows[targetRow - 1];
  await sheetsRequest("PUT", spreadsheetId, `${sheetName}!A${targetRow}:F${targetRow}`, {
    values: [[
      updated.rollNo   ?? e[0],
      updated.name     ?? e[1],
      updated.subject  ?? e[2],
      updated.mid1     ?? e[3],
      updated.mid2     ?? e[4],
      updated.semester ?? e[5],
    ]],
  });
}

export async function deleteMarksRow(
  spreadsheetId: string,
  sheetName: string,
  rollNo: string,
  subject: string,
  semester: number
): Promise<void> {
  const rows = await readSheetRows(spreadsheetId, sheetName);

  let targetRow = -1;
  for (let i = 1; i < rows.length; i++) {
    if (
      rows[i][0] === rollNo &&
      rows[i][2] === subject &&
      String(rows[i][5]) === String(semester)
    ) {
      targetRow = i + 1;
      break;
    }
  }
  if (targetRow === -1) throw new Error("Marks record not found");

  await sheetsRequest("PUT", spreadsheetId, `${sheetName}!A${targetRow}:F${targetRow}`, {
    values: [["", "", "", "", "", ""]],
  });
}

// ════════════════════════════════════════════════════════════
// BULK CSV UPLOAD
// CSV headers: RollNo, Name, Subject, Mid1, Mid2, Semester
// ════════════════════════════════════════════════════════════
export async function bulkUploadMarksFromCSV(
  spreadsheetId: string,
  sheetName: string,
  file: File
): Promise<{ success: number; errors: string[] }> {
  const Papa = (await import("papaparse")).default;

  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let success = 0;
        const errors: string[] = [];

        for (const row of results.data as any[]) {
          try {
            await addMarksRow(spreadsheetId, sheetName, {
              rollNo:   String(row.RollNo   || row.rollNo   || ""),
              name:     String(row.Name     || row.name     || ""),
              subject:  String(row.Subject  || row.subject  || ""),
              mid1:     Number(row.Mid1     || row.mid1     || 0),
              mid2:     Number(row.Mid2     || row.mid2     || 0),
              semester: Number(row.Semester || row.semester || 1),
            });
            success++;
          } catch (e: any) {
            errors.push(`${row.RollNo}: ${e.message}`);
          }
        }
        resolve({ success, errors });
      },
    });
  });
}

// ── Build sheet tab name: "BCA-A-Attendance" ─────────────────
export function buildSheetTabName(
  group: string,
  section: string,
  type: "Attendance" | "Marks"
): string {
  return `${group}-${section}-${type}`;
}
