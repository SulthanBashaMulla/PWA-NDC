// src/sheets/sheetsAPI.ts
// Google Sheets API v4 — write-back functions for class incharge lecturers
// Used to add / update / delete attendance and marks rows in Google Sheets

// ── CONFIG ───────────────────────────────────────────────────
// Paste your Google Sheets API key here
// Get it from: console.cloud.google.com → APIs → Credentials → Create API Key
// Restrict it to: Google Sheets API only
const SHEETS_API_KEY = "AIzaSyAOIskWFvW_-kp_rhtMT8050rzyTF1js10";

// ── Types ────────────────────────────────────────────────────
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

// ── Base fetch helper ────────────────────────────────────────
async function sheetsRequest(
  method: string,
  spreadsheetId: string,
  range: string,
  body?: object
) {
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;

  const url = method === "GET"
    ? `${base}/values/${encodeURIComponent(range)}?key=${SHEETS_API_KEY}`
    : `${base}/values/${encodeURIComponent(range)}?valueInputOption=RAW&key=${SHEETS_API_KEY}`;

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Sheets API request failed");
  }

  return res.json();
}

// ── Get spreadsheet ID from CSV URL ─────────────────────────
// CSV URL format:
// https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/gviz/tq?tqx=out:csv&sheet=SheetName
export function extractSheetId(csvUrl: string): string {
  const match = csvUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("Invalid Google Sheets URL");
  return match[1];
}

export function extractSheetName(csvUrl: string): string {
  const match = csvUrl.match(/sheet=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : "Sheet1";
}

// ── Read all rows from a sheet ────────────────────────────────
export async function readSheetRows(csvUrl: string): Promise<string[][]> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);
  const data      = await sheetsRequest("GET", id, `${sheetName}!A:Z`);
  return data.values || [];
}

// ── Find row number by Roll No (1-indexed, row 1 = header) ───
export async function findRowByRollNo(
  csvUrl: string,
  rollNo: string,
  rollNoColumn = 0   // column index (0 = column A)
): Promise<number> {
  const rows = await readSheetRows(csvUrl);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][rollNoColumn] === rollNo) return i + 1; // 1-indexed
  }
  return -1;
}

// ════════════════════════════════════════════════════════════
// ATTENDANCE WRITE-BACK
// ════════════════════════════════════════════════════════════

// Add a new attendance row
export async function addAttendanceRow(
  csvUrl: string,
  row: AttendanceRow
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);

  await sheetsRequest("POST", id, `${sheetName}!A:G`, {
    values: [[
      row.rollNo,
      row.name,
      row.month,
      row.daysPresent,
      row.totalDays,
      row.percentage,
      row.semester
    ]]
  });
}

// Update an existing attendance row by Roll No + Month + Semester
export async function updateAttendanceRow(
  csvUrl: string,
  rollNo: string,
  month: string,
  semester: number,
  updated: Partial<AttendanceRow>
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);
  const rows      = await readSheetRows(csvUrl);

  // Find the matching row (RollNo + Month + Semester all match)
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

  if (targetRow === -1) throw new Error(`Row not found for ${rollNo} / ${month} / Sem ${semester}`);

  const existing = rows[targetRow - 1];
  const newRow = [
    updated.rollNo      ?? existing[0],
    updated.name        ?? existing[1],
    updated.month       ?? existing[2],
    updated.daysPresent ?? existing[3],
    updated.totalDays   ?? existing[4],
    updated.percentage  ?? existing[5],
    updated.semester    ?? existing[6]
  ];

  await sheetsRequest("PUT", id, `${sheetName}!A${targetRow}:G${targetRow}`, {
    values: [newRow]
  });
}

// Delete an attendance row by Roll No + Month + Semester
// (clears the row content — Google Sheets API cannot delete rows via REST)
export async function deleteAttendanceRow(
  csvUrl: string,
  rollNo: string,
  month: string,
  semester: number
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);
  const rows      = await readSheetRows(csvUrl);

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

  if (targetRow === -1) throw new Error("Row not found");

  // Clear the row
  await sheetsRequest("PUT", id, `${sheetName}!A${targetRow}:G${targetRow}`, {
    values: [["", "", "", "", "", "", ""]]
  });
}

// ════════════════════════════════════════════════════════════
// MARKS WRITE-BACK
// ════════════════════════════════════════════════════════════

// Add a new marks row
export async function addMarksRow(
  csvUrl: string,
  row: MarksRow
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);

  await sheetsRequest("POST", id, `${sheetName}!A:F`, {
    values: [[
      row.rollNo,
      row.name,
      row.subject,
      row.mid1,
      row.mid2,
      row.semester
    ]]
  });
}

// Update marks by Roll No + Subject + Semester
export async function updateMarksRow(
  csvUrl: string,
  rollNo: string,
  subject: string,
  semester: number,
  updated: Partial<MarksRow>
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);
  const rows      = await readSheetRows(csvUrl);

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

  if (targetRow === -1) throw new Error(`Row not found for ${rollNo} / ${subject} / Sem ${semester}`);

  const existing = rows[targetRow - 1];
  const newRow = [
    updated.rollNo   ?? existing[0],
    updated.name     ?? existing[1],
    updated.subject  ?? existing[2],
    updated.mid1     ?? existing[3],
    updated.mid2     ?? existing[4],
    updated.semester ?? existing[5]
  ];

  await sheetsRequest("PUT", id, `${sheetName}!A${targetRow}:F${targetRow}`, {
    values: [newRow]
  });
}

// Delete marks row by Roll No + Subject + Semester
export async function deleteMarksRow(
  csvUrl: string,
  rollNo: string,
  subject: string,
  semester: number
): Promise<void> {
  const id        = extractSheetId(csvUrl);
  const sheetName = extractSheetName(csvUrl);
  const rows      = await readSheetRows(csvUrl);

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

  if (targetRow === -1) throw new Error("Row not found");

  await sheetsRequest("PUT", id, `${sheetName}!A${targetRow}:F${targetRow}`, {
    values: [["", "", "", "", "", ""]]
  });
}

// ════════════════════════════════════════════════════════════
// BULK CSV UPLOAD (for marks)
// ════════════════════════════════════════════════════════════
// Parse a CSV file and push all rows to the sheet
// CSV must have headers: RollNo, Name, Subject, Mid1, Mid2, Semester

export async function bulkUploadMarksFromCSV(
  csvUrl: string,
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
            await addMarksRow(csvUrl, {
              rollNo:   String(row.RollNo   || row.rollNo   || ""),
              name:     String(row.Name     || row.name     || ""),
              subject:  String(row.Subject  || row.subject  || ""),
              mid1:     Number(row.Mid1     || row.mid1     || 0),
              mid2:     Number(row.Mid2     || row.mid2     || 0),
              semester: Number(row.Semester || row.semester || 1)
            });
            success++;
          } catch (e: any) {
            errors.push(`Row ${row.RollNo}: ${e.message}`);
          }
        }

        resolve({ success, errors });
      }
    });
  });
}
