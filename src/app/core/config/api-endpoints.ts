import { environment } from '../../../environments/environment';

const base = environment.apiUrl;

export const API = {
 
  home: {
    slides:   `${base}/admin/home/slides`,
    regional: `${base}/admin/home/regional`,
    stats:    `${base}/admin/home/stats`,
     video: `${base}/admin/home/video`,
    
     insights: `${base}/admin/home/insights`,   // ← new
  },
  insights: `${base}/admin/insights`,
};

 