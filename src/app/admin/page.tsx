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

  // 1. Provera sesije
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    console.log('❌ No active session found, redirecting to login')
    redirect('/admin/login')
  }

  if (session.user.email !== 'mtosic0450@gmail.com') {
    console.warn('⚠️ Unauthorized user email:', session.user.email)
    redirect('/admin/login')
  }

  console.log('✅ Admin authorized:', session.user.email)

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
    const error = err as Error
    console.error('💥 Rendering error in AdminPage:', error)
    return (
      <div style={{ padding: '2rem', color: 'red', border: '2px solid red', margin: '2rem', borderRadius: '8px' }}>
        <h2>Admin Panel - Rendering Error</h2>
        <p><strong>Error message:</strong> {error.message}</p>
        <pre style={{ background: '#f0f0f0', padding: '1rem', overflow: 'auto' }}>
          {error.stack}
        </pre>
      </div>
    )
  }
}
