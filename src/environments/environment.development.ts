import { BACKEND_URL } from './backend';

// Development build. The backend address is defined once in ./backend.ts
export const environment = {
  production: false,
  apiUrl: `${BACKEND_URL}/api`,
  mediaUrl: `${BACKEND_URL}/api/media`,
};
