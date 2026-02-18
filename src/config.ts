export const CONFIG = {
  GOOGLE_SHEETS_API_KEY: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || '',
  SPREADSHEET_ID: import.meta.env.VITE_SPREADSHEET_ID || '',
  PASSWORD: import.meta.env.VITE_PASSWORD || '',
};

if (!CONFIG.GOOGLE_SHEETS_API_KEY) {
  console.warn('Missing VITE_GOOGLE_SHEETS_API_KEY environment variable');
}

if (!CONFIG.SPREADSHEET_ID) {
  console.warn('Missing VITE_SPREADSHEET_ID environment variable');
}
