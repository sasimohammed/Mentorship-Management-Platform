import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'member';
  committee_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Committee = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};

export type Week = {
  id: string;
  committee_id: string;
  week_number: number;
  title: string;
  description: string;
  content: string;
  start_date: string;
  end_date: string;
  created_at: string;
};

export type Project = {
  id: string;
  committee_id: string;
  title: string;
  description: string;
  assigned_to: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  submission_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Attendance = {
  id: string;
  committee_id: string;
  user_id: string;
  week_id: string | null;
  date: string;
  status: 'present' | 'absent' | 'excused';
  notes: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  committee_id: string;
  created_by: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
};

export type Feedback = {
  id: string;
  committee_id: string;
  user_id: string;
  given_by: string;
  content: string;
  rating: number | null;
  created_at: string;
};
