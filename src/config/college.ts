// College configuration — fill in your actual URLs before deploying
export const COLLEGE_WEBSITE = 'https://nationaldegreecollegenandyal.ac.in';
export const COLLEGE_LOGO_URL = '/ndc-logo.png'; // Replace with actual logo URL

// Google Sheets published CSV URLs — keyed by "Group-Section"
export const SHEETS_CONFIG: Record<string, {
  attendance: string;
  marks: string;
}> = {
  'MPC-A': { attendance: '', marks: '' },
  'MPC-B': { attendance: '', marks: '' },
  'BiPC-A': { attendance: '', marks: '' },
  // Add all groups and sections here
};

// Circulars and Notices Google Sheets published CSV URLs
export const CIRCULARS_SHEET_URL = ''; // Published CSV URL for circulars
export const NOTICES_SHEET_URL = '';   // Published CSV URL for notices

// Available groups and sections
export const GROUPS = ['MPC', 'BiPC', 'CEC', 'HEC'] as const;
export const SECTIONS = ['A', 'B', 'C'] as const;
export const SEMESTERS = [1, 2, 3, 4, 5, 6] as const;
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] as const;
