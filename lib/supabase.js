import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aqxhfwoqmmtkipnuzoqx.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxeGhmd29xbW10a2lwbnV6b3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMTM0ODAsImV4cCI6MjA4NjU4OTQ4MH0.3PFJkjNta_17j0RG9XYJjDb3ns-s11xjnCG1eHKbBXg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
