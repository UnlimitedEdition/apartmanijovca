import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    const { data: items, error } = await supabase
      .from('gallery')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(items || [])
  } catch (err: unknown) {
    const error = err as Error
    console.error('Gallery API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
