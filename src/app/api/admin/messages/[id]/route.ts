import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const { status } = await request.json()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('id', params.id)

    if (error) {
      console.error('Error updating message:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in message update API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting message:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in message delete API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
