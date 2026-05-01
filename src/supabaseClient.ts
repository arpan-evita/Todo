import { createClient } from '@supabase/supabase-js';

// Hardcoded for immediate Vercel deployment stability
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://itjrtkyihsucohlquviw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anJ0a3lpaHN1Y29obHF1dml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTE3MjYsImV4cCI6MjA5MzE4NzcyNn0.1uRXmE736xc8Trpvl4jmKGRYUU7Z_-xsMPGf580bLWk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
