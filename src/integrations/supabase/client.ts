
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Use environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[PRESENT]' : '[MISSING]');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];