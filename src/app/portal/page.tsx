/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from 'next'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import PortalDashboard from './PortalDashboard'
import { getLocalizedValue } from '@/lib/localization/helpers'
import type { Locale } from '@/lib/localization/helpers'

export const metadata: Metadata = {
  title: 'Guest Portal - Apartmani Jovča',
  description: 'Manage your booking and stay',
}

export default async function PortalPage() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: (name: string, value: string, options?: any) => {
          cookieStore.set(name, value, options)
        },
        remove: (name: string, options?: any) => {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/portal/login')
  }

  // Get user's bookings
  const { data: guest } = await supabase
    .from('guests')
    .select('id')
    .eq('email', session.user.email)
    .single()

  if (!guest) {
    redirect('/portal/login?error=no-booking')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, apartments(name, type)')
    .eq('guest_id', guest.id)
    .order('created_at', { ascending: false })

  // Transform JSONB apartment fields to localized strings
  // Use Serbian as default locale for portal
  const defaultLocale: Locale = 'sr'
  const transformedBookings = bookings?.map(booking => {
    if (booking.apartments) {
      return {
        ...booking,
        apartments: {
          ...booking.apartments,
          name: getLocalizedValue(booking.apartments.name, defaultLocale),
          type: getLocalizedValue(booking.apartments.type, defaultLocale),
          ...(booking.apartments.bed_type && {
            bed_type: getLocalizedValue(booking.apartments.bed_type, defaultLocale)
          }),
          ...(booking.apartments.description && {
            description: getLocalizedValue(booking.apartments.description, defaultLocale)
          })
        }
      }
    }
    return booking
  }) || []

  return <PortalDashboard bookings={transformedBookings} userEmail={session.user.email!} />
}
