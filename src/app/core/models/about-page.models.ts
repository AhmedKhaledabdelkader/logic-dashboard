export interface ValueItem {
  icon: string;
  title: string;
  subtitle: string;
}

export interface PresenceItem {
  title: string;
  subtitle: string;
}

export interface AboutPage {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_paragraph: string;
  story_image: string | null;
  presence: PresenceItem[];
  values: ValueItem[];
}

export interface AboutPagePayload {
  hero_title: string;
  hero_subtitle: string;
  story_title: string;
  story_paragraph: string;
  story_image: File | null;
  presence: PresenceItem[];
  values: ValueItem[];
}