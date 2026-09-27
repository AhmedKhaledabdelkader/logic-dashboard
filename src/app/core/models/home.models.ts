export interface HeroSlide {
  id?: number | null;
  title: string;
  subtitle: string;
  image: string;
}

export interface RegionalContent {
  id?: number | null;
  title: string;
  paragraph: string;
  image: string;
}


// =========================================================
// STATISTICS
// =========================================================

export interface StatItem {
  id?: number | null;
  number: string;
  title: string;
}


// =========================================================
// VIDEO
// =========================================================

export interface VideoContent {
  id?: number | null;
  title: string;
  subtitle: string;
  youtubeUrl: string;
}


// =========================================================
// PAYLOADS
// =========================================================

export interface HeroSlidePayload {
  id?: number | null;
  title: string;
  subtitle: string;
  image: File | null;
}

export interface RegionalPayload {
  title: string;
  paragraph: string;
  image: File | null;
}