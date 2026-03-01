import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Use global variable to persist across HMR reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient<Database> | undefined
}

export const supabase = global.__supabaseClient ?? (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase Client] Missing environment variables')
    return null as unknown as SupabaseClient<Database>
  }
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
  global.__supabaseClient = client
  return client
})()

// Server-side client for API routes and server components
export function createServerSupabaseClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  })
}
