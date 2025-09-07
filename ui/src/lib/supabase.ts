import { createClient } from '@supabase/supabase-js';
//These are public keys - it is ok to expose them
const supabaseUrl = 'https://gtqapuookyklhpfzrzrp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cWFwdW9va3lrbGhwZnpyenJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1Mjk2MzIsImV4cCI6MjA1NDEwNTYzMn0.T-2XjTbsGW8LSxgPfZcFQggDxyvzYh5ImY0XinzGTWY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 