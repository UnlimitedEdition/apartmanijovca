/**
 * Content management utilities for fetching dynamic content from database
 */

import { supabase } from './supabase'

export interface ContentData {
  [key: string]: string
}

/**
 * Fetch content for a specific section and language from database
 * Falls back to empty object if content is not found
 */
export async function getContent(section: string, lang: string): Promise<ContentData> {
  if (!supabase) {
    console.warn('Supabase client not initialized')
    return {}
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('key, value')
      .eq('language', lang)
      .like('key', `${section}.%`)
      .eq('published', true)

    if (error) {
      console.error(`Error fetching content for ${section}/${lang}:`, error)
      return {}
    }

    if (!data || data.length === 0) {
      return {}
    }

    // Transform array of {key, value} to flat object
    // Strip section prefix from keys (e.g., 'home.title' -> 'title')
    const content: ContentData = {}
    data.forEach((item) => {
      const fieldKey = item.key.substring(section.length + 1)
      
      // Handle JSONB value - it should already be a plain string after API fix
      let textValue: string
      if (typeof item.value === 'string') {
        textValue = item.value
      } else if (typeof item.value === 'object' && item.value !== null) {
        textValue = JSON.stringify(item.value)
      } else {
        textValue = String(item.value || '')
      }
      
      content[fieldKey] = textValue
    })

    return content
  } catch (err) {
    console.error(`Exception fetching content for ${section}/${lang}:`, err)
    return {}
  }
}

/**
 * Get a single content value by full key (e.g., 'home.title')
 */
export async function getContentValue(key: string, lang: string, fallback: string = ''): Promise<string> {
  if (!supabase) {
    return fallback
  }

  try {
    const { data, error } = await supabase
      .from('content')
      .select('value')
      .eq('key', key)
      .eq('language', lang)
      .eq('published', true)
      .single()

    if (error || !data) {
      return fallback
    }

    // Handle JSONB value
    if (typeof data.value === 'string') {
      return data.value
    } else if (typeof data.value === 'object' && data.value !== null) {
      return JSON.stringify(data.value)
    }
    
    return String(data.value || fallback)
  } catch (err) {
    console.error(`Exception fetching content value for ${key}/${lang}:`, err)
    return fallback
  }
}
