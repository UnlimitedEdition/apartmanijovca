import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth/require-admin'

export const dynamic = 'force-dynamic'

interface LocalizedText {
  sr: string
  en?: string
  de?: string
  it?: string
}

interface AttractionRow {
  id: string
  name: LocalizedText
  description: LocalizedText | null
  distance: string | null
  image: string | null
  latitude: number | null
  longitude: number | null
  display_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key =
    process.env.NEXT_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

function revalidateAttractions() {
  revalidatePath('/[lang]/attractions', 'page')
  revalidatePath('/sr/attractions', 'page')
  revalidatePath('/en/attractions', 'page')
  revalidatePath('/de/attractions', 'page')
  revalidatePath('/it/attractions', 'page')
}

// GET – return all attractions ordered by display_order
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('attractions')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ attractions: data as AttractionRow[] })
}

// POST – insert new attraction
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const {
    name,
    description,
    distance,
    image,
    latitude,
    longitude,
    display_order,
    is_visible,
  }: {
    name: LocalizedText
    description?: LocalizedText
    distance?: string
    image?: string
    latitude?: number
    longitude?: number
    display_order?: number
    is_visible?: boolean
  } = body

  if (!name?.sr || typeof name.sr !== 'string' || name.sr.trim() === '') {
    return NextResponse.json(
      { error: 'name.sr is required' },
      { status: 400 }
    )
  }
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('attractions')
    .insert({
      name,
      description: description ?? null,
      distance: distance ?? null,
      image: image ?? null,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      display_order: display_order ?? 0,
      is_visible: is_visible ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateAttractions()
  return NextResponse.json({ attraction: data as AttractionRow }, { status: 201 })
}

// PATCH – update attraction by id
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const { id, ...fields }: { id: string; [key: string]: unknown } = body

  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: 'no fields to update' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('attractions')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateAttractions()
  return NextResponse.json({ attraction: data as AttractionRow })
}

// DELETE – remove attraction by id (query param or body)
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const searchParams = request.nextUrl.searchParams
  let id = searchParams.get('id')

  if (!id) {
    try {
      const body = await request.json()
      id = typeof body?.id === 'string' ? body.id : null
    } catch {
      // no body — id stays null
    }
  }

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { error } = await db.from('attractions').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateAttractions()
  return NextResponse.json({ deleted: id })
}
