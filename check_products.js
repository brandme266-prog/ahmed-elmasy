import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://nvqhxljakfqurutkxdmp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52cWh4bGpha2ZxdXJ1dGt4ZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcxNjY4ODcsImV4cCI6MjAyMjc0Mjg4N30.-Tj7t17LzP-63eUoX4jGZ2Q_uA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('products').select('*');
  console.log("Products count:", data?.length);
  if (data && data.length > 0) {
    console.log("First product:", data[0]);
    console.log("Is active count:", data.filter(p => p.is_active).length);
  }
}
run();
