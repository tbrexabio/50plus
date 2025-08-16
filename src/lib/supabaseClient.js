import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: confirm envs are visible in the browser console
console.log("Supabase URL:", url || "(missing)");
console.log("Supabase key starts:", anon ? anon.slice(0, 10) : "(missing)");

export const isSupabaseConfigured = Boolean(url && anon);

export const supabase = isSupabaseConfigured
  ? createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
console.log("Supabase URL:", url);
console.log("Supabase key starts:", anon ? anon.slice(0, 10) : "MISSING");

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anon);
export const supabase = isSupabaseConfigured ? createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
}) : null;
