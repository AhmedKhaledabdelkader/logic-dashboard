export interface WorkStep {
  id: number;
  /** "01", "02" ... numbered by position in the list the API returned. */
  number: string;
  title: string;
  description: string;
  outcome: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface WorkStepPayload {
  title: string;
  description: string;
  outcome: string | null;
  icon: string | null;
  is_active: boolean;
  /** 1-based position; the backend shifts the other steps. */
  sort_order?: number;
}
