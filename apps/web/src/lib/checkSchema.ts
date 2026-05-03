import { createClient } from '@supabase/supabase-base';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function checkSchema() {
  const { data, error } = await supabase.from('tasks').select('*').limit(1);
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('COLUMNS:', Object.keys(data[0] || {}));
  }
}

checkSchema();
