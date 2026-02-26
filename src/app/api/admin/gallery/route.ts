import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(
  supabaseUrl, 
  process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
)

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, caption, tags, display_order } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('gallery')
      .insert([{
        url,
        caption,
        tags: tags || [],
        display_order: display_order || 0
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
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
