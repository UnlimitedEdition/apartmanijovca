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
  const host = request.headers.get('host') || ''

  // Redirect preview URLs to production URL
  if (host.includes('milans-projects') || host.includes('-git-')) {
    const productionUrl = new URL(request.url)
    productionUrl.host = 'apartmani-jovca.vercel.app'
    return NextResponse.redirect(productionUrl, 308) // Permanent redirect
  }

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.svg' ||
    pathname === '/icon.png' ||
    pathname === '/apple-icon.png' ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|eot)$/)
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
    // Skip all internal Next.js paths, static files, and images
    '/((?!api|_next|images|favicon\\.ico|favicon\\.svg|.*\\.(?:ico|png|jpg|jpeg|svg|gif|webp|avif|woff|woff2|ttf|eot)).*)'
  ]
}
