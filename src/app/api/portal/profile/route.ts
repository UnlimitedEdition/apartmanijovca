import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireUser } from '@/lib/auth/require-user'

// Create Supabase client with service role for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey)
}

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Identity comes from the verified session, never from a query param (IDOR).
    const auth = await requireUser(request)
    if ('response' in auth) return auth.response
    const guestEmail = auth.user.email
    if (!guestEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    // Get guest profile
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('*')
      .eq('email', guestEmail)
      .single()

    if (guestError || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Get associated user from auth
    const { data: { users } } = await supabase.auth.admin.listUsers()
    
    const user = users?.find(u => u.email === guestEmail)

    return NextResponse.json({ 
      profile: {
        id: guest.id,
        email: guest.email,
        name: guest.full_name,
        phone: guest.phone,
        country: guest.country,
        created_at: guest.created_at,
        // Notification preferences (could be stored in guest table or separate table)
        notifications: {
          email: true,
          sms: false,
          marketing: false
        }
      },
      hasPassword: !!user?.email_confirmed_at
    })
  } catch (error) {
    console.error('Error in portal profile route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Identity comes from the verified session, never from the request body (IDOR).
    const auth = await requireUser(request)
    if ('response' in auth) return auth.response
    const email = auth.user.email
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()

    const body = await request.json()
    const { name, phone, country, notifications } = body

    // Update guest profile
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.full_name = name
    if (phone !== undefined) updateData.phone = phone
    if (country !== undefined) updateData.country = country

    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .update(updateData)
      .eq('email', email)
      .select()
      .single()

    if (guestError) {
      console.error('Error updating guest:', guestError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    // Update notification preferences if provided
    // This would typically go to a separate preferences table
    if (notifications) {
      // For now, we'll just acknowledge the update
      // In a full implementation, you'd store these in a preferences table
    }

    return NextResponse.json({ 
      success: true, 
      profile: guest 
    })
  } catch (error) {
    console.error('Error in portal profile PUT route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
