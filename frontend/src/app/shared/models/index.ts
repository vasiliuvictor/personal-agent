export type SearchFrequency = 'hourly' | 'daily' | 'weekly';

export interface Agent {
  id: string;
  name: string;
  keywords: string[];
  search_frequency: SearchFrequency;
  notification_email: boolean;
  last_run_at: string | null;
  next_run_at: string;
  created_at: string;
}

export interface Source {
  title: string;
  url: string;
  snippet: string;
}

export interface Insight {
  id: string;
  agent_id: string;
  summary: string;
  sources: Source[];
  search_query: string;
  is_read: boolean;
  created_at: string;
}

export interface InsightsResponse {
  data: Insight[];
  total: number;
  page: number;
  limit: number;
}
