import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'
import { getInsertOrderUpdates, normalizeDisplayOrder, normalizeInsertTargetOrder } from '@/lib/admin/gallery-order'
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
    const { url, caption, display_order } = body
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string' && tag.trim().length > 0)
      : []
    const folder = tags[0]

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    if (!folder || folder === ALL_GALLERY_FOLDER || !isGalleryFolder(folder)) {
      return NextResponse.json({ error: 'Valid folder is required' }, { status: 400 })
    }

    const orderColumn = getGalleryOrderColumn(folder)
    const requestedOrder = normalizeDisplayOrder(display_order)

    const { data: allRows, error: allOrderError } = await supabaseAdmin
      .from('gallery')
      .select('id, display_order')

    if (allOrderError) throw allOrderError

    const allOrderItems = mapOrderItems(allRows || [], 'display_order')
    const globalTargetOrder = normalizeInsertTargetOrder(allOrderItems, allOrderItems.length + 1)
    const globalOrderUpdates = getInsertOrderUpdates(allOrderItems, globalTargetOrder)

    for (const orderUpdate of globalOrderUpdates) {
      const { error: updateError } = await supabaseAdmin
        .from('gallery')
        .update({ display_order: orderUpdate.display_order })
        .eq('id', orderUpdate.id)

      if (updateError) throw updateError
    }

    const { data: folderRows, error: folderOrderError } = await supabaseAdmin
      .from('gallery')
      .select(`id, display_order, ${orderColumn}`)
      .contains('tags', [folder])

    if (folderOrderError) throw folderOrderError

    const folderOrderItems = mapOrderItems(folderRows || [], orderColumn)
    const folderTargetOrder = normalizeInsertTargetOrder(folderOrderItems, requestedOrder)
    const folderOrderUpdates = getInsertOrderUpdates(folderOrderItems, folderTargetOrder)

    for (const orderUpdate of folderOrderUpdates) {
      const { error: updateError } = await supabaseAdmin
        .from('gallery')
        .update({ [orderColumn]: orderUpdate.display_order })
        .eq('id', orderUpdate.id)

      if (updateError) throw updateError
    }

    const insertData: Record<string, unknown> = {
      url,
      caption,
      tags,
      display_order: globalTargetOrder,
      [orderColumn]: folderTargetOrder
    }

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .insert([insertData])
      .select()
      .single()

    if (error) throw error

    revalidateGalleryPages()

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[admin/gallery] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
