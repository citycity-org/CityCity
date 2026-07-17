// Server-side Supabase client.
// Uses the service role key when available (bypasses RLS), falls back to anon key.
// Never import this in client components — server-only.

import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
const anonKey         = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Returns a Supabase client suitable for server-side use.
 * Prefers the service role key so RLS policies don't block writes.
 * Falls back to anon key (works as long as our RLS policies allow anon insert/select).
 */
export function createServerClient() {
  return createClient(supabaseUrl, serviceRoleKey ?? anonKey, {
    auth: { persistSession: false },
  })
}
