import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseInstance) return supabaseInstance;

  // @ts-ignore
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  // @ts-ignore
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL and Anon Key are required. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

export const supabase = getSupabase();

export type Role = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  name: string;
  role: Role;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  class: string;
}

export interface Question {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  created_by: string;
}

export interface Exam {
  id: string;
  title: string;
  duration: number;
  created_by: string;
  created_at?: string;
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
}

export interface Answer {
  id: string;
  user_id: string;
  exam_id: string;
  question_id: string;
  answer: string;
}

export interface Result {
  id: string;
  user_id: string;
  exam_id: string;
  score: number;
  completed_at?: string;
}
