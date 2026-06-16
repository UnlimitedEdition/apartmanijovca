import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/require-admin'


export const dynamic = 'force-dynamic'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// GET – visibility + custom attractions
export async function GET(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const db = getSupabaseAdmin()

  const [visibilityResult, customResult] = await Promise.all([
    db.from('content').select('value').eq('key', 'attractions.visibility').eq('language', 'sr').maybeSingle(),
    db.from('content').select('value').eq('key', 'attractions.custom').eq('language', 'sr').maybeSingle(),
  ])

  const hidden: number[] = Array.isArray(visibilityResult.data?.value?.hidden)
    ? visibilityResult.data!.value.hidden
    : []

  const custom = Array.isArray(customResult.data?.value) ? customResult.data!.value : []

  return NextResponse.json({ hidden, custom })
}

// PATCH – update hidden indices
export async function PATCH(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const hidden: number[] = Array.isArray(body.hidden) ? body.hidden : []

  const db = getSupabaseAdmin()
  const { error } = await db.from('content').upsert(
    { key: 'attractions.visibility', language: 'sr', value: { hidden } },
    { onConflict: 'key,language' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ hidden })
}

// POST – add custom attraction
export async function POST(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const body = await request.json()
  const { name, description, distance, image, lat, lng } = body

  if (!name || !description) {
    return NextResponse.json({ error: 'name and description are required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const existing = await db.from('content').select('value').eq('key', 'attractions.custom').eq('language', 'sr').maybeSingle()
  const current = Array.isArray(existing.data?.value) ? existing.data!.value : []

  const newEntry = { name, description, distance: distance || '', image: image || '', lat: lat || null, lng: lng || null }
  const updated = [...current, newEntry]

  const { error } = await db.from('content').upsert(
    { key: 'attractions.custom', language: 'sr', value: updated },
    { onConflict: 'key,language' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ custom: updated })
}

// DELETE – remove custom attraction by index
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin(request)
  if (authError) return authError

  const { index } = await request.json()
  if (typeof index !== 'number') {
    return NextResponse.json({ error: 'index is required' }, { status: 400 })
  }

  const db = getSupabaseAdmin()

  const existing = await db.from('content').select('value').eq('key', 'attractions.custom').eq('language', 'sr').maybeSingle()
  const current = Array.isArray(existing.data?.value) ? existing.data!.value : []
  const updated = current.filter((_: unknown, i: number) => i !== index)

  const { error } = await db.from('content').upsert(
    { key: 'attractions.custom', language: 'sr', value: updated },
    { onConflict: 'key,language' }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ custom: updated })
}
