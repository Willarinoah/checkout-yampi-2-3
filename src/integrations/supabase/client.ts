import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// These are public keys, safe to expose
const SUPABASE_URL = 'https://diuflhhkgdjwqvobfuio.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdWZsaGhrZ2Rqd3F2b2JmdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODc1OTksImV4cCI6MjA1MjU2MzU5OX0.1-k-o7tA-3EPwom_qHFRMUVMHq24dYRqvjK4SwDNEiU';

// Use environment variables if available, otherwise use hardcoded values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.log('VITE_SUPABASE_URL:', supabaseUrl);
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[PRESENT]' : '[MISSING]');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

export type Tables = Database['public']['Tables'];
export type Enums = Database['public']['Enums'];