import { createClient } from '@supabase/supabase-js';

// HARDCODED FALLBACKS for deployment stability
const DEFAULT_URL = 'https://itjrtkyihsucohlquviw.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anJ0a3lpaHN1Y29obHF1dml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTE3MjYsImV4cCI6MjA5MzE4NzcyNn0.1uRXmE736xc8Trpvl4jmKGRYUU7Z_-xsMPGf580bLWk';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_KEY;

if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
  console.error('CRITICAL: Supabase URL is missing or invalid.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);



