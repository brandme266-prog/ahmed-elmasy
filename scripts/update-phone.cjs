import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updatePhone() {
  const { data, error } = await supabase
    .from('site_settings')
    .update({ whatsapp: '01008246179' })
    .eq('id', true);
    
  if (error) {
    console.error('Error updating phone:', error);
  } else {
    console.log('Phone number updated successfully in Supabase!');
  }
}

updatePhone();
