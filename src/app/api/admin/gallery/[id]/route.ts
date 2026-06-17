import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getMoveOrderUpdates, normalizeDisplayOrder, normalizeMoveTargetOrder } from '@/lib/admin/gallery-order'


export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const id = params.id

    const { error } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', id)

    if (error) throw error

    // Invalidate the public gallery page cache
    revalidatePath('/[lang]/gallery', 'page')
    revalidatePath('/sr/gallery', 'page')
    revalidatePath('/en/gallery', 'page')
    revalidatePath('/de/gallery', 'page')
    revalidatePath('/it/gallery', 'page')

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[admin/gallery/[id] DELETE] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const id = params.id
    const body = await request.json()
    const updateData: {
      url?: string
      caption?: string | Record<string, string> | null
      tags?: string[]
      display_order?: number
    } = {}
    let targetOrder: number | undefined

    if (typeof body.url === 'string') updateData.url = body.url
    if ('caption' in body) updateData.caption = body.caption
    if (Array.isArray(body.tags)) updateData.tags = body.tags
    if ('display_order' in body) {
      targetOrder = normalizeDisplayOrder(body.display_order)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    if (targetOrder !== undefined) {
      const { data: orderItems, error: orderError } = await supabaseAdmin
        .from('gallery')
        .select('id, display_order')

      if (orderError) throw orderError

      const currentItem = (orderItems || []).find(item => item.id === id)
      if (!currentItem) {
        return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 })
      }

      targetOrder = normalizeMoveTargetOrder(orderItems || [], targetOrder)
      updateData.display_order = targetOrder

      const orderUpdates = getMoveOrderUpdates(orderItems || [], id, currentItem.display_order, targetOrder)
      for (const orderUpdate of orderUpdates) {
        const { error: updateError } = await supabaseAdmin
          .from('gallery')
          .update({ display_order: orderUpdate.display_order })
          .eq('id', orderUpdate.id)

        if (updateError) throw updateError
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .update(updateData)
      .eq('id', id)
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
    console.error('[admin/gallery/[id] PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
