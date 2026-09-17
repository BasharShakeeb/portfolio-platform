import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables are missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  storageKey: 'portfolio-auth',
  },
});

export type Profile = {
  id: string;
  site_name: string;
  bio: string;
  avatar_url: string;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
};

export type ItemCategory = 'projects' | 'awards' | 'certificates' | 'research' | 'other';

export type Item = {
  id: string;
  user_id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  link: string;
  tags: string[];
  year: number | null;
  month: number | null;
  day: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type MessageStatus = 'unread' | 'read' | 'replied';

export type Message = {
  id: string;
  user_id: string;
  visitor_name: string;
  visitor_email: string;
  subject: string;
  body: string;
  reply: string;
  status: MessageStatus;
  created_at: string;
  replied_at: string | null;
};

export type ItemInput = Omit<Item, 'id' | 'user_id' | 'created_at' | 'updated_at'>;


export type ContactSettings = {
  id: string;
  phone: string;
  phone_visible: boolean;
  email: string;
  email_visible: boolean;
  github: string;
  github_visible: boolean;
  linkedin: string;
  linkedin_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type ChatFAQ = {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  keywords: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};
