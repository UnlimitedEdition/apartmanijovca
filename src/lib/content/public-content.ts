import { supabaseAdmin } from '@/lib/supabase'
import { Locale } from '@/lib/types/database'

export type SectionContent = Record<string, string>

type ContentRow = {
  key: string
  value: unknown
}

export function normalizeContentValue(value: unknown): string {
  if (value === null || value === undefined) return ''

  let textValue: string
  if (typeof value === 'string') {
    textValue = value
  } else if (typeof value === 'object') {
    textValue = JSON.stringify(value)
  } else {
    textValue = String(value)
  }

  if (textValue.startsWith('"') && textValue.endsWith('"') && textValue.length > 1) {
    try {
      const parsed = JSON.parse(textValue)
      if (typeof parsed === 'string') return parsed
    } catch {
      return textValue
    }
  }

  return textValue
}

export function getContentText(content: SectionContent, key: string, fallback: string): string {
  return Object.prototype.hasOwnProperty.call(content, key) ? content[key] : fallback
}

export async function getPublishedSectionContent(section: string, locale: Locale): Promise<SectionContent> {
  if (!supabaseAdmin) return {}

  try {
    const { data, error } = await supabaseAdmin
      .from('content')
      .select('key,value')
      .eq('language', locale)
      .eq('published', true)
      .like('key', section + '.%')

    if (error) throw error

    const prefix = section + '.'
    return ((data || []) as ContentRow[]).reduce<SectionContent>((acc, item) => {
      if (item.key.startsWith(prefix)) {
        acc[item.key.slice(prefix.length)] = normalizeContentValue(item.value)
      }
      return acc
    }, {})
  } catch (error) {
    console.error('[content] Failed to load ' + section + ' content for ' + locale + ':', error)
    return {}
  }
}
