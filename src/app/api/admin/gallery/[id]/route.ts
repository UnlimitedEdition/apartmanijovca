import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

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
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .update(body)
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
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
