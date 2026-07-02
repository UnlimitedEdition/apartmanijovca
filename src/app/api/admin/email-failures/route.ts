import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Admin client with service role for full access
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

// GET /api/admin/email-failures — neuspešna slanja mejlova u poslednjih 7 dana
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error, count } = await supabaseAdmin
      .from('email_events')
      .select('id, event_type, email_to, email_subject, booking_id, payload, created_at', { count: 'exact' })
      .eq('event_type', 'send_failure')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({
      count: count ?? 0,
      failures: (data ?? []).map((row) => ({
        id: row.id,
        emailTo: row.email_to,
        subject: row.email_subject,
        bookingId: row.booking_id,
        emailType: (row.payload as Record<string, unknown> | null)?.emailType ?? null,
        error: (row.payload as Record<string, unknown> | null)?.error ?? null,
        createdAt: row.created_at,
      })),
    })
  } catch (error) {
    console.error('Error fetching email failures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email failures' },
      { status: 500 }
    )
  }
}
