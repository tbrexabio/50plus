import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || ''
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = !!(url && anon)

if (!isSupabaseConfigured) {
  console.warn('[50plus] Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
} else {
  console.log('[50plus] Supabase configured:', url.replace(/(https?:\/\/)(.*)/, '$1****.supabase.co'))
  console.log('[50plus] Anon key length:', anon.length)
}

export const supabase = isSupabaseConfigured ? createClient(url, anon, { auth: { persistSession: true, autoRefreshToken: true } }) : null
