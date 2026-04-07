import Papa from 'papaparse';
import { CIRCULARS_SHEET_URL, NOTICES_SHEET_URL } from '@/config/college';

export interface AttendanceRow {
  RollNo: string;
  Name: string;
  Month: string;
  DaysPresent: string;
  TotalDays: string;
  Percentage: string;
  Semester: string;
}

export interface MarksRow {
  RollNo: string;
  Name: string;
  Subject: string;
  Mid1: string;
  Mid2: string;
  Semester: string;
}

export interface CircularRow {
  Title: string;
  Description: string;
  Date: string;
  PostedBy: string;
}

export interface NoticeRow {
  Title: string;
  Description: string;
  Date: string;
  PostedBy: string;
}

async function fetchCSV<T>(url: string): Promise<T[]> {
  if (!url) return [];
  try {
    const res = await fetch(url);
    const text = await res.text();
    const result = Papa.parse<T>(text, { header: true, skipEmptyLines: true });
    return result.data;
  } catch (err) {
    console.error('Error fetching CSV:', err);
    return [];
  }
}

export const fetchAttendance = (url: string) => fetchCSV<AttendanceRow>(url);
export const fetchMarks = (url: string) => fetchCSV<MarksRow>(url);
export const fetchCirculars = () => fetchCSV<CircularRow>(CIRCULARS_SHEET_URL);
export const fetchNotices = () => fetchCSV<NoticeRow>(NOTICES_SHEET_URL);

// Demo data for development
export const DEMO_ATTENDANCE: AttendanceRow[] = [
  { RollNo: '23CS001', Name: 'Ravi Kumar', Month: 'January', DaysPresent: '18', TotalDays: '22', Percentage: '81.8', Semester: '3' },
  { RollNo: '23CS001', Name: 'Ravi Kumar', Month: 'February', DaysPresent: '20', TotalDays: '24', Percentage: '83.3', Semester: '3' },
  { RollNo: '23CS001', Name: 'Ravi Kumar', Month: 'March', DaysPresent: '15', TotalDays: '21', Percentage: '71.4', Semester: '3' },
  { RollNo: '23CS002', Name: 'Priya Sharma', Month: 'January', DaysPresent: '21', TotalDays: '22', Percentage: '95.5', Semester: '3' },
  { RollNo: '23CS002', Name: 'Priya Sharma', Month: 'February', DaysPresent: '22', TotalDays: '24', Percentage: '91.7', Semester: '3' },
  { RollNo: '23CS003', Name: 'Arun Reddy', Month: 'January', DaysPresent: '12', TotalDays: '22', Percentage: '54.5', Semester: '3' },
];

export const DEMO_MARKS: MarksRow[] = [
  { RollNo: '23CS001', Name: 'Ravi Kumar', Subject: 'Physics', Mid1: '28', Mid2: '30', Semester: '3' },
  { RollNo: '23CS001', Name: 'Ravi Kumar', Subject: 'Chemistry', Mid1: '25', Mid2: '27', Semester: '3' },
  { RollNo: '23CS001', Name: 'Ravi Kumar', Subject: 'Mathematics', Mid1: '30', Mid2: '29', Semester: '3' },
  { RollNo: '23CS002', Name: 'Priya Sharma', Subject: 'Physics', Mid1: '27', Mid2: '28', Semester: '3' },
  { RollNo: '23CS002', Name: 'Priya Sharma', Subject: 'Chemistry', Mid1: '30', Mid2: '30', Semester: '3' },
  { RollNo: '23CS003', Name: 'Arun Reddy', Subject: 'Physics', Mid1: '18', Mid2: '20', Semester: '3' },
];

export const DEMO_CIRCULARS: CircularRow[] = [
  { Title: 'Semester Exams Schedule Released', Description: 'The semester examination schedule for all groups has been published. Students are advised to check their respective exam dates.', Date: '2026-04-05', PostedBy: 'Admin' },
  { Title: 'Annual Sports Day', Description: 'Annual sports day will be held on April 15th. All students are encouraged to participate.', Date: '2026-04-02', PostedBy: 'Admin' },
  { Title: 'Library Timings Extended', Description: 'Library will remain open till 8 PM during exam season starting April 10th.', Date: '2026-03-28', PostedBy: 'Admin' },
];

export const DEMO_NOTICES: NoticeRow[] = [
  { Title: 'Fee Payment Deadline', Description: 'Last date for semester fee payment is April 20th. Late fees will be applicable after the deadline.', Date: '2026-04-06', PostedBy: 'Admin' },
  { Title: 'Guest Lecture on AI', Description: 'A guest lecture on Artificial Intelligence will be conducted on April 12th in the main auditorium.', Date: '2026-04-03', PostedBy: 'HOD CS' },
  { Title: 'Attendance Warning', Description: 'Students with attendance below 65% are advised to meet their class incharge immediately.', Date: '2026-03-30', PostedBy: 'Admin' },
];
