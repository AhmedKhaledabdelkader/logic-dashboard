import { BACKEND_URL } from './backend';

// Production build. The backend address is defined once in ./backend.ts
export const environment = {
  production: true,
  apiUrl: `${BACKEND_URL}/api`,
  mediaUrl: `${BACKEND_URL}/api/media`,
};
