import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminDashboard from './AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {}, // Safe for Server Components
      remove: () => {}, // Safe for Server Components
    },
  })

  // 1. Provera sesije — getUser() verifikuje JWT potpis (getSession ne).
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // List of authorized admin emails
  const ADMIN_EMAILS = [
    'mtosic0450@gmail.com',
    'apartmanijovca@gmail.com'
  ]

  if (!ADMIN_EMAILS.includes(user.email || '')) {
    redirect('/admin/login')
  }

  try {
    if (!AdminDashboard) {
      throw new Error('AdminDashboard component is undefined! Check imports.')
    }

    return (
      <AdminDashboard
        stats={{
          totalBookings: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          totalReviews: 0,
        }}
      />
    )
  } catch (err: unknown) {
    console.error('💥 Rendering error in AdminPage:', err)
    return (
      <div style={{ padding: '2rem', color: 'red', border: '2px solid red', margin: '2rem', borderRadius: '8px' }}>
        <h2>Admin Panel - Rendering Error</h2>
        <p>Došlo je do greške pri učitavanju panela. Pokušajte ponovo.</p>
      </div>
    )
  }
}
