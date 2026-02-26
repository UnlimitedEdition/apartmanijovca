/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'sr', 'de', 'it'],
  defaultLocale: 'sr',
  localePrefix: 'always' // Changed from 'as-needed' to 'always' for consistent behavior
})

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. OBAVEZNO: Potpuno preskoči i18n za admin rute
  if (pathname.startsWith('/admin')) {
    const res = NextResponse.next()
    
    // Provera sesije samo za zaštitu, ne za routing jezika
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

    console.log('🔒 Middleware check:', { 
      path: pathname, 
      hasSession: !!session,
      email: session?.user?.email,
      cookieHeader: request.headers.get('cookie')?.substring(0, 50) + '...'
    })

    if (!session && pathname !== '/admin/login') {
      console.log('🚩 No session, redirecting to login from middleware')
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return res
  }

  // 2. Handle root path - redirect to default locale
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/sr', request.url))
  }

  // 3. Sve ostale rute idu kroz prevode
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    // Preskoči sve interne Next.js putanje i statičke fajlove
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json).*)'
  ]
}
