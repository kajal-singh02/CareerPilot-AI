import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vjhdmmtoxtuyqlfyodcr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaGRtbXRveHR1eXFsZnlvZGNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM3NjkwMjEsImV4cCI6MjEwOTM0NTAyMX0.EASEHYkLI72SIzn_yFbF6J_t0eK4ns4lkjpDIo5n8k0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
