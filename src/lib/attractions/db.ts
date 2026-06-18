import { supabase } from '@/lib/supabase'
import type { Locale } from '@/lib/types/database'
import type { AttractionEntry } from '@/data/attractions'

/**
 * Raw row shape as returned by Supabase (JSONB cols come back as unknown).
 * We validate/cast inside the function — avoids `any` in the rest of the code.
 */
interface AttractionRow {
  name: Record<string, string>
  description: Record<string, string> | null
  distance: string | null
  image: string | null
  latitude: number | null
  longitude: number | null
  display_order: number
}

/**
 * Reads all visible attractions from the `attractions` table (anon client,
 * RLS: is_visible = true). Returns an array of `AttractionEntry` shaped for
 * the given locale with a stable numeric `id` derived from `display_order`.
 *
 * Falls back to an empty array on any DB error so the page can still render
 * using the static fallback in the caller.
 */
export async function getVisibleAttractions(locale: Locale): Promise<AttractionEntry[]> {
  if (!supabase) {
    // Supabase env vars not available (e.g. build-time without secrets)
    return []
  }

  const { data, error } = await supabase
    .from('attractions')
    .select('name, description, distance, image, latitude, longitude, display_order')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })

  if (error || !data) {
    return []
  }

  return (data as AttractionRow[]).map((row, index): AttractionEntry => {
    const name: string = row.name?.[locale] ?? row.name?.['sr'] ?? ''
    const description: string =
      row.description?.[locale] ?? row.description?.['sr'] ?? ''

    return {
      id: row.display_order ?? index,
      name,
      description,
      distance: row.distance ?? '',
      image: row.image ?? '',
      lat: row.latitude ?? 0,
      lng: row.longitude ?? 0,
    }
  })
}
