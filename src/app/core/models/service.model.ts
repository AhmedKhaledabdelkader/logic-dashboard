export interface ServiceItem {
  id: number;
  title: string;
  group_title: string | null;
  sort_order: number;
}

export interface Service {
  id: number;
  code: string | null;
  slug: string;
  title: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  items: ServiceItem[];
  items_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface ServiceItemPayload {
  id?: number | null;
  title: string;
  group_title: string | null;
}

export interface ServicePayload {
  code?: string | null;
  title: string;
  description: string;
  icon?: string | null;
  is_active: boolean;
  items: ServiceItemPayload[];
}
