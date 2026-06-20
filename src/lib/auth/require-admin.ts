import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Lista admin emailova iz env-a (`ADMIN_EMAILS`, comma-separated). NEMA
 * hardkodovanih adresa u kodu. Postaviti `ADMIN_EMAILS` u Vercel env, npr.
 * `ADMIN_EMAILS=a@example.com,b@example.com`. Ako env nije postavljen, lista je
 * prazna → niko nema admin pristup (fail-closed).
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

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

  if (!getAdminEmails().includes((user.email ?? '').toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return null
}
