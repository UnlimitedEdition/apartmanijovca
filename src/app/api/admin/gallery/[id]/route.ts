import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import {
  getInsertOrderUpdates,
  getMoveOrderUpdates,
  normalizeDisplayOrder,
  normalizeInsertTargetOrder,
  normalizeMoveTargetOrder,
} from '@/lib/admin/gallery-order'
import { ALL_GALLERY_FOLDER, getGalleryOrderColumn, isGalleryFolder } from '@/lib/admin/gallery-order-columns'


export const dynamic = 'force-dynamic'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

type GalleryOrderRow = {
  id: string
  display_order?: number | null
  [key: string]: string | number | null | undefined
}

function mapOrderItems(rows: GalleryOrderRow[], orderColumn: string) {
  return rows.map(row => ({
    id: row.id,
    display_order: normalizeDisplayOrder(row[orderColumn] ?? row.display_order)
  }))
}

function revalidateGalleryPages() {
  revalidatePath('/[lang]/gallery', 'page')
  revalidatePath('/sr/gallery', 'page')
  revalidatePath('/en/gallery', 'page')
  revalidatePath('/de/gallery', 'page')
  revalidatePath('/it/gallery', 'page')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const id = (await params).id

    const { error } = await supabaseAdmin
      .from('gallery')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidateGalleryPages()

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[admin/gallery/[id] DELETE] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(request)
  if (authError) return authError
  try {
    const id = (await params).id
    const body = await request.json()
    const updateData: Record<string, unknown> = {}
    let targetOrder: number | undefined

    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : undefined
    const folder = tags?.[0]

    if (typeof body.url === 'string') updateData.url = body.url
    if ('caption' in body) updateData.caption = body.caption
    if (tags) updateData.tags = tags
    if ('display_order' in body) {
      targetOrder = normalizeDisplayOrder(body.display_order)
    }

    if (targetOrder !== undefined && (!folder || folder === ALL_GALLERY_FOLDER || !isGalleryFolder(folder))) {
      return NextResponse.json({ error: 'Valid folder is required' }, { status: 400 })
    }

    if (Object.keys(updateData).length === 0 && targetOrder === undefined) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    if (targetOrder !== undefined && folder) {
      const orderColumn = getGalleryOrderColumn(folder)
      const { data: folderRows, error: folderOrderError } = await supabaseAdmin
        .from('gallery')
        .select(`id, display_order, ${orderColumn}`)
        .contains('tags', [folder])

      if (folderOrderError) throw folderOrderError

      const { data: existingItem, error: existingError } = await supabaseAdmin
        .from('gallery')
        .select(`id, display_order, ${orderColumn}`)
        .eq('id', id)
        .single()

      if (existingError) throw existingError
      if (!existingItem) {
        return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 })
      }

      const folderOrderItems = mapOrderItems(folderRows || [], orderColumn)
      const currentItem = folderOrderItems.find(item => item.id === id)

      if (currentItem) {
        targetOrder = normalizeMoveTargetOrder(folderOrderItems, targetOrder)
        const orderUpdates = getMoveOrderUpdates(folderOrderItems, id, currentItem.display_order, targetOrder)
        for (const orderUpdate of orderUpdates) {
          const { error: updateError } = await supabaseAdmin
            .from('gallery')
            .update({ [orderColumn]: orderUpdate.display_order })
            .eq('id', orderUpdate.id)

          if (updateError) throw updateError
        }
      } else {
        targetOrder = normalizeInsertTargetOrder(folderOrderItems, targetOrder)
        const orderUpdates = getInsertOrderUpdates(folderOrderItems, targetOrder)
        for (const orderUpdate of orderUpdates) {
          const { error: updateError } = await supabaseAdmin
            .from('gallery')
            .update({ [orderColumn]: orderUpdate.display_order })
            .eq('id', orderUpdate.id)

          if (updateError) throw updateError
        }
      }

      updateData[orderColumn] = targetOrder
    }

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidateGalleryPages()

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[admin/gallery/[id] PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
