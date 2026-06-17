import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getInsertOrderUpdates, normalizeDisplayOrder } from '@/lib/admin/gallery-order'


export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[admin/gallery] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const body = await request.json()
    const { url, caption, tags, display_order } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const targetOrder = normalizeDisplayOrder(display_order)
    const { data: orderItems, error: orderError } = await supabaseAdmin
      .from('gallery')
      .select('id, display_order')
      .gte('display_order', targetOrder)

    if (orderError) throw orderError

    const orderUpdates = getInsertOrderUpdates(orderItems || [], targetOrder)
    for (const orderUpdate of orderUpdates) {
      const { error: updateError } = await supabaseAdmin
        .from('gallery')
        .update({ display_order: orderUpdate.display_order })
        .eq('id', orderUpdate.id)

      if (updateError) throw updateError
    }

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .insert([{
        url,
        caption,
        tags: Array.isArray(tags) ? tags : [],
        display_order: targetOrder
      }])
      .select()
      .single()

    if (error) throw error

    // Invalidate the public gallery page cache
    revalidatePath('/[lang]/gallery', 'page')
    revalidatePath('/sr/gallery', 'page')
    revalidatePath('/en/gallery', 'page')
    revalidatePath('/de/gallery', 'page')
    revalidatePath('/it/gallery', 'page')

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[admin/gallery] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
