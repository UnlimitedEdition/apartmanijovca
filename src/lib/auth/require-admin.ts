import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_EMAILS = [
  'mtosic0450@gmail.com',
  'apartmanijovca@gmail.com',
]

/**
 * Call at the top of every /api/admin/* route handler.
 * Returns null on success (caller proceeds), or a 401/403 NextResponse.
 *
 * Uses getUser() — verifies JWT signature server-side, unlike getSession().
 */
export async function requireAdmin(
  request: NextRequest
): Promise<NextResponse | null> {
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!ADMIN_EMAILS.includes(user.email ?? '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
