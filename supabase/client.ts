import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we have valid credentials
const hasValidCredentials = supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-id') && 
  !supabaseAnonKey.includes('your-supabase-anon-key');

if (!hasValidCredentials) {
    console.warn('Supabase URL or Anon Key not configured');
}

export const supabase = hasValidCredentials 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
      },
    });