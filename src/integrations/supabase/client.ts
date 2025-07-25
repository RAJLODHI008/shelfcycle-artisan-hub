// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://clypgyriecpgvwzzcaih.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseXBneXJpZWNwZ3Z3enpjYWloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MjM2OTYsImV4cCI6MjA2Nzk5OTY5Nn0.GjY7ujU5tZ9ivdDs5oz1HojqP4eyhL3b3bIe4qHp3Qo";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});