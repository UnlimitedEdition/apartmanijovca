import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_SERVICE_ROLE_KEY

// Use global variable to persist across HMR reloads in development
declare global {
  // eslint-disable-next-line no-var
  var __supabaseServerClient: SupabaseClient | undefined
  // eslint-disable-next-line no-var
  var __supabaseAdminClient: SupabaseClient | undefined
}

// Regular client with anon key (for public operations)
export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) return null
  
  if (global.__supabaseServerClient) {
    return global.__supabaseServerClient
  }
  
  const client = createClient(supabaseUrl, supabaseAnonKey)
  global.__supabaseServerClient = client
  return client
})()

// Admin client with service role key (for privileged operations like rate limiting)
export const supabaseAdmin = (() => {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null
  
  if (global.__supabaseAdminClient) {
    return global.__supabaseAdminClient
  }
  
  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  global.__supabaseAdminClient = client
  return client
})()

