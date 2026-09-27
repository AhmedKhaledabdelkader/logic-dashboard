/**
 * What the backend returns
 */
export interface Insight {
  id: number;
  title: string;
  image: string;
  is_featured: boolean;
}

/**
 * What the dashboard sends
 */
export interface InsightPayload {
  id?: number | null;
  title: string;
  image: File | null;
  is_featured: boolean;
}