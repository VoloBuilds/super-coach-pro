import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srlhzhuhwqbohzqwsylu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybGh6aHVod3Fib2h6cXdzeWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTU5NzYsImV4cCI6MjA2MDkzMTk3Nn0.KqFentfa97IQ7-ej8Gsd7Jr5_qgJaIgiHjgsscKdAco';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 