
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://klvuxfxvevksilkzfopv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdnV4Znh2ZXZrc2lsa3pmb3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MjcwNjQsImV4cCI6MjA1MTAwMzA2NH0.YDIrzCNADh7cNF1ZlqfuksbHePAVxH2wWM3XeiA8zJk";

// Debugging the supabase configuration
console.log("Initializing Supabase client with URL:", SUPABASE_URL);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Log debug information for the functions endpoint
console.log("Supabase project ID:", SUPABASE_URL.split('//')[1].split('.')[0]);
