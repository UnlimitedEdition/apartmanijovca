import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

/**
 * Call at the top of any authenticated guest/portal route handler.
 * Returns the verified user, or a 401 NextResponse to return directly.
 *
 * Uses getUser() — verifies the JWT signature server-side, unlike getSession().
 * The caller MUST derive identity (email, id) from the returned user, never
 * from a query/body parameter, to prevent IDOR.
 */
export async function requireUser(
  request: NextRequest
): Promise<{ user: User } | { response: NextResponse }> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    }
  )

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return {
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { user }
}
