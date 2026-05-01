const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://itjrtkyihsucohlquviw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anJ0a3lpaHN1Y29obHF1dml3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2MTE3MjYsImV4cCI6MjA5MzE4NzcyNn0.1uRXmE736xc8Trpvl4jmKGRYUU7Z_-xsMPGf580bLWk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createFirstPilot() {
  console.log('--- INITIALIZING PILOT REGISTRATION ---');
  const { data, error } = await supabase.auth.signUp({
    email: 'arpansadhu13@gmail.com',
    password: 'Arpan_Evita@123',
  });

  if (error) {
    console.error('ERROR:', error.message);
  } else {
    console.log('SUCCESS: Pilot registered successfully!');
    console.log('PILOT ID:', data.user.id);
    console.log('--- CHECK YOUR EMAIL TO CONFIRM REGISTRATION ---');
  }
}

createFirstPilot();
