// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://diuflhhkgdjwqvobfuio.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdWZsaGhrZ2Rqd3F2b2JmdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5ODc1OTksImV4cCI6MjA1MjU2MzU5OX0.1-k-o7tA-3EPwom_qHFRMUVMHq24dYRqvjK4SwDNEiU";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);