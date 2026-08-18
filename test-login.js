const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://nvqhxljakfqurutkxdmp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52c2h4bGpakZxxdXJ1dGt4ZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNDIzMDAsImV4cCI6MjEwMjYxODMwMH0.j-02T4lqUHIPr5I4qn8scY6MZWUEIQonKimjo2sGtu4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'hfgc46987@gmail.com',
    password: '1232456789@@##$$'
  });
  console.log(JSON.stringify({ data, error }, null, 2));
}
run();