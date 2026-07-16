import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Not throwing to avoid crash in environments where envs aren't set yet
  console.warn('Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;

const globalForSupabase = globalThis as typeof globalThis & {
  __supabaseClient?: ReturnType<typeof createClient>;
};

export const supabase = globalForSupabase.__supabaseClient ?? createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storage,
  },
});

globalForSupabase.__supabaseClient = supabase;
