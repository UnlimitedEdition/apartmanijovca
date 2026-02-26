import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateApiInput, sanitizeContent } from '@/lib/validations/content'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

// GET - Get content by section or key
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const section = searchParams.get('section')
    const language = searchParams.get('language') || searchParams.get('lang')

    let query = supabaseAdmin
      .from('content')
      .select('*')

    // Section-based query: fetch all keys matching 'section.*' pattern
    if (section) {
      query = query.like('key', `${section}.%`)
    } else if (key) {
      // Key-based query: fetch specific key (backward compatibility)
      query = query.eq('key', key)
    }

    if (language) {
      query = query.eq('language', language)
    }

    const { data, error } = await query.order('language', { ascending: true })

    if (error) throw error

    // If section-based query, group by language and strip section prefix
    if (section && data) {
      const groupedByLanguage: Record<string, Record<string, string>> = {}
      const updatedAtByLanguage: Record<string, string> = {}
      
      data.forEach(item => {
        if (!groupedByLanguage[item.language]) {
          groupedByLanguage[item.language] = {}
        }
        
        // Track the most recent updated_at timestamp for each language
        if (!updatedAtByLanguage[item.language] || item.updated_at > updatedAtByLanguage[item.language]) {
          updatedAtByLanguage[item.language] = item.updated_at
        }
        
        // Strip section prefix from key (e.g., 'home.title' -> 'title')
        const fieldKey = item.key.substring(section.length + 1)
        
        // BACKWARD COMPATIBILITY: Handle both double-encoded (legacy) and single-encoded (new) values
        // Legacy format: "\"text\"" (JSON string within JSONB) - caused by old JSON.stringify bug
        // New format: "text" (plain string in JSONB) - correct format after fix
        let textValue: string
        
        if (item.value === null || item.value === undefined) {
          // Handle null/undefined edge case
          textValue = ''
        } else if (typeof item.value === 'string') {
          // Already a plain string (new format) - use directly
          textValue = item.value
        } else if (typeof item.value === 'object' && item.value !== null) {
          // Might be an object or array - convert to string
          textValue = JSON.stringify(item.value)
        } else {
          // For any other type (number, boolean, etc.) - convert to string
          textValue = String(item.value)
        }
        
        // Additional check: if the string looks like double-encoded JSON (starts with quotes),
        // try to parse it once more to extract the actual text
        if (textValue.startsWith('"') && textValue.endsWith('"') && textValue.length > 1) {
          try {
            const parsed = JSON.parse(textValue)
            if (typeof parsed === 'string') {
              textValue = parsed
            }
          } catch {
            // If parsing fails, keep the original value
            // This handles cases where the content legitimately starts/ends with quotes
          }
        }
        
        groupedByLanguage[item.language][fieldKey] = textValue
      })
      
      // Transform to array format expected by ContentEditor
      // Include updated_at timestamp for concurrent edit detection
      const content = Object.entries(groupedByLanguage).map(([lang, data]) => ({
        lang,
        data,
        updated_at: updatedAtByLanguage[lang]
      }))
      
      return NextResponse.json({ content })
    }

    // Key-based query: return flat array (backward compatibility)
    const content = data?.map(item => {
      // BACKWARD COMPATIBILITY: Handle both double-encoded (legacy) and single-encoded (new) values
      // Legacy format: "\"text\"" (JSON string within JSONB) - caused by old JSON.stringify bug
      // New format: "text" (plain string in JSONB) - correct format after fix
      let textValue: string
      
      if (item.value === null || item.value === undefined) {
        // Handle null/undefined edge case
        textValue = ''
      } else if (typeof item.value === 'string') {
        // Already a plain string (new format) - use directly
        textValue = item.value
      } else if (typeof item.value === 'object' && item.value !== null) {
        // Might be an object or array - convert to string
        textValue = JSON.stringify(item.value)
      } else {
        // For any other type (number, boolean, etc.) - convert to string
        textValue = String(item.value)
      }
      
      // Additional check: if the string looks like double-encoded JSON (starts with quotes),
      // try to parse it once more to extract the actual text
      if (textValue.startsWith('"') && textValue.endsWith('"') && textValue.length > 1) {
        try {
          const parsed = JSON.parse(textValue)
          if (typeof parsed === 'string') {
            textValue = parsed
          }
        } catch {
          // If parsing fails, keep the original value
          // This handles cases where the content legitimately starts/ends with quotes
        }
      }
      
      return {
        id: item.id,
        language: item.language,
        key: item.key,
        value: textValue,
        updatedAt: item.updated_at
      }
    }) || []

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

// POST - Create or update content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, language, value, section, lang, data, published } = body

    // Section-based save: iterate through data object and save each field
    if (section && lang && data) {
      // Validate API input
      const validation = validateApiInput(body)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Validation failed', details: validation.errors },
          { status: 400 }
        )
      }
      
      // Sanitize content
      const sanitizedData: Record<string, string> = {}
      for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
          sanitizedData[key] = sanitizeContent(value)
        } else {
          sanitizedData[key] = String(value)
        }
      }
      
      const results = []
      
      for (const [fieldKey, fieldValue] of Object.entries(sanitizedData)) {
        // Construct full key as 'section.field' (e.g., 'home.title')
        const fullKey = `${section}.${fieldKey}`
        
        // FIX: Supabase client automatically handles JSONB encoding
        // Using JSON.stringify causes double-encoding bug
        // Store value directly - PostgreSQL JSONB column handles the encoding
        const jsonbValue = fieldValue
        
        // Check if content already exists
        const { data: existing, error: checkError } = await supabaseAdmin
          .from('content')
          .select('id')
          .eq('key', fullKey)
          .eq('language', lang)
          .limit(1)

        if (checkError) throw checkError

        if (existing && existing.length > 0) {
          // Update existing content
          const { data: updated, error: updateError } = await supabaseAdmin
            .from('content')
            .update({
              value: jsonbValue,
              published: published !== undefined ? published : true,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing[0].id)
            .select()
            .single()

          if (updateError) throw updateError
          results.push(updated)
        } else {
          // Insert new content
          const { data: inserted, error: insertError } = await supabaseAdmin
            .from('content')
            .insert({
              key: fullKey,
              language: lang,
              value: jsonbValue,
              published: published !== undefined ? published : true
            })
            .select()
            .single()

          if (insertError) throw insertError
          results.push(inserted)
        }
      }
      
      return NextResponse.json({ success: true, results }, { status: 200 })
    }

    // Key-based save: single entry (backward compatibility)
    if (!key || !language) {
      return NextResponse.json(
        { error: 'Key and language are required' },
        { status: 400 }
      )
    }

    // Sanitize content for key-based save
    const sanitizedValue = typeof value === 'string' ? sanitizeContent(value) : String(value)

    // FIX: Supabase client automatically handles JSONB encoding
    // Using JSON.stringify causes double-encoding bug
    // Store value directly - PostgreSQL JSONB column handles the encoding
    const jsonbValue = sanitizedValue

    // Check if content already exists
    const { data: existing, error: checkError } = await supabaseAdmin
      .from('content')
      .select('id')
      .eq('key', key)
      .eq('language', language)
      .limit(1)

    if (checkError) throw checkError

    let result

    if (existing && existing.length > 0) {
      // Update existing content
      const { data: updated, error: updateError } = await supabaseAdmin
        .from('content')
        .update({
          value: jsonbValue,
          published: published !== undefined ? published : true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)
        .select()
        .single()

      if (updateError) throw updateError
      result = updated
    } else {
      // Insert new content
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('content')
        .insert({
          key,
          language,
          value: jsonbValue,
          published: published !== undefined ? published : true
        })
        .select()
        .single()

      if (insertError) throw insertError
      result = inserted
    }

    return NextResponse.json(result, { status: existing?.length ? 200 : 201 })
  } catch (error) {
    console.error('Error saving content:', error)
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    )
  }
}

// PUT - Update content (alias for POST)
export async function PUT(request: NextRequest) {
  return POST(request)
}

// DELETE - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const language = searchParams.get('language') || searchParams.get('lang')

    if (!key || !language) {
      return NextResponse.json(
        { error: 'Key and language are required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('content')
      .delete()
      .eq('key', key)
      .eq('language', language)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content:', error)
    return NextResponse.json(
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
