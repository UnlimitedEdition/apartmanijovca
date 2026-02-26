/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sr', 'de', 'it'],
  defaultLocale: 'sr',
  localePrefix: 'always'
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json')
  ) {
    return NextResponse.next()
  }

  // 1. Admin routes - bypass i18n completely
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => request.cookies.get(name)?.value,
          set: (name: string, value: string, options?: any) => {
            res.cookies.set(name, value, options)
          },
          remove: (name: string) => {
            res.cookies.delete(name)
          },
        },
      }
    )

    const { data: { session } } = await supabase.auth.getSession()

    if (!session && pathname !== '/admin/login') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return res
  }

  // 2. Let next-intl handle all other routes (including root)
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Preskoči sve interne Next.js putanje i statičke fajlove
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'
  ]
}
