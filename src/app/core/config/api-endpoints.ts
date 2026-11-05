import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export const API = {

  auth: `${base}/auth`,

  home: {
    slides:   `${base}/admin/home/slides`,
    regional: `${base}/admin/home/regional`,
    stats:    `${base}/admin/home/stats`,
    video:    `${base}/admin/home/video`,

    insights: `${base}/admin/home/insights`,   // ← new
  },

  insights: `${base}/admin/insights`,

  services: `${base}/admin/services`,

  howWeWork: `${base}/admin/how-we-work`,

  about: `${base}/admin/about-page`,   // ← new: singleton About page (GET + PUT only)

};