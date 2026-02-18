export const CONFIG = {
  APPS_SCRIPT_URL: import.meta.env.VITE_APPS_SCRIPT_URL || '',
  PASSWORD: import.meta.env.VITE_PASSWORD || '',
};

if (!CONFIG.APPS_SCRIPT_URL) {
  console.warn('Missing VITE_APPS_SCRIPT_URL; using mock data for family tree');
}
