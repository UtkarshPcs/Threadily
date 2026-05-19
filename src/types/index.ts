export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  threads_connected: boolean;
  created_at: string;
}

export interface ThreadBlock {
  id: string;
  content: string;
  order: number;
  char_count: number;
  media_urls?: string[];
}

export interface Draft {
  id: string;
  user_id: string;
  title: string;
  blocks: ThreadBlock[];
  status: 'draft' | 'scheduled' | 'published' | 'failed' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  published_at?: string;
  version: number;
}

export interface DraftVersion {
  id: string;
  draft_id: string;
  blocks: ThreadBlock[];
  version: number;
  created_at: string;
}

export interface Template {
  id: string;
  user_id: string;
  name: string;
  category: 'hook' | 'cta' | 'storytelling' | 'custom';
  content: string;
  created_at: string;
}

export interface IdeaNote {
  id: string;
  user_id: string;
  content: string;
  tags: string[];
  created_at: string;
}

export interface ScheduledPost {
  id: string;
  draft_id: string;
  scheduled_at: string;
  status: 'pending' | 'publishing' | 'published' | 'failed';
  error?: string;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export type AITone = 'educational' | 'storytelling' | 'viral' | 'motivational' | 'minimalist' | 'controversial';

export type PreviewMode = 'mobile' | 'desktop';
export type ThemeMode = 'light' | 'dark';
