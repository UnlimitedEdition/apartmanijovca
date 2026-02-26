import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractLocale } from '@/lib/localization/extract'
import { localizeApartments } from '@/lib/localization/transformer'
import { isCompleteMultiLanguageText, getMissingLanguages } from '@/lib/localization/helpers'
import type { ApartmentRecord } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)



// GET - List all apartments
export async function GET(request: NextRequest) {
  try {
    // Check if raw data is requested (for admin editing)
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('raw') === 'true'
    
    // Extract locale from request
    const locale = extractLocale(request)

    const { data, error } = await supabaseAdmin
      .from('apartments')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    const apartments = data as ApartmentRecord[] || []
    
    // Return raw data for admin editing, or localized data for display
    if (raw) {
      return NextResponse.json({ apartments })
    }

    // Transform apartment data to localized format
    const localized = localizeApartments(apartments, locale)

    return NextResponse.json({ apartments: localized })
  } catch (error) {
    console.error('Error fetching apartments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    )
  }
}

// POST - Create new apartment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      slug,
      name, 
      description, 
      bed_type, 
      capacity, 
      base_price_eur, 
      images,
      status,
      display_order,
      size_sqm,
      floor,
      bathroom_count,
      balcony,
      view_type,
      kitchen_type,
      features,
      house_rules,
      check_in_time,
      check_out_time,
      min_stay_nights,
      max_stay_nights,
      cancellation_policy,
      gallery,
      video_url,
      virtual_tour_url,
      meta_title,
      meta_description,
      meta_keywords,
      weekend_price_eur,
      weekly_discount_percent,
      monthly_discount_percent,
      seasonal_pricing,
      // New checkbox/counter fields
      bed_counts,
      selected_amenities,
      selected_rules,
      selected_view,
      // Location fields
      address,
      city,
      country,
      postal_code,
      latitude,
      longitude
    } = body

    // Validate required fields
    if (!name || !capacity || !base_price_eur || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate multi-language objects have all required languages
    if (!isCompleteMultiLanguageText(name)) {
      const missing = getMissingLanguages(name)
      return NextResponse.json(
        { 
          error: 'Name must include all languages (sr, en, de, it)',
          details: { missing }
        },
        { status: 400 }
      )
    }

    if (description && !isCompleteMultiLanguageText(description)) {
      const missing = getMissingLanguages(description)
      return NextResponse.json(
        { 
          error: 'Description must include all languages (sr, en, de, it)',
          details: { missing }
        },
        { status: 400 }
      )
    }

    if (bed_type && !isCompleteMultiLanguageText(bed_type)) {
      const missing = getMissingLanguages(bed_type)
      return NextResponse.json(
        { 
          error: 'Bed type must include all languages (sr, en, de, it)',
          details: { missing }
        },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('apartments')
      .insert({
        slug,
        name,
        description: description || { sr: '', en: '', de: '', it: '' },
        bed_type: bed_type || { sr: '', en: '', de: '', it: '' },
        capacity,
        base_price_eur,
        images: images || [],
        status: status || 'active',
        display_order: display_order ?? 0,
        size_sqm,
        floor,
        bathroom_count,
        balcony,
        view_type,
        kitchen_type,
        features,
        house_rules,
        check_in_time,
        check_out_time,
        min_stay_nights,
        max_stay_nights,
        cancellation_policy,
        gallery,
        video_url,
        virtual_tour_url,
        meta_title,
        meta_description,
        meta_keywords,
        weekend_price_eur,
        weekly_discount_percent,
        monthly_discount_percent,
        seasonal_pricing,
        // New checkbox/counter fields
        bed_counts: bed_counts || {},
        selected_amenities: selected_amenities || [],
        selected_rules: selected_rules || [],
        selected_view: selected_view || null,
        // Location fields
        address: address || null,
        city: city || null,
        country: country || 'Crna Gora',
        postal_code: postal_code || null,
        latitude: latitude || null,
        longitude: longitude || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating apartment:', error)
    return NextResponse.json(
      { error: 'Failed to create apartment' },
      { status: 500 }
    )
  }
}

// PUT - Update apartment (handled by [id] route)
// This is just a placeholder - actual update is in [id]/route.ts
export async function PUT() {
  return NextResponse.json(
    { error: 'Use /api/admin/apartments/[id] for updates' },
    { status: 400 }
  )
}

// DELETE - Delete apartment (handled by [id] route)
export async function DELETE() {
  return NextResponse.json(
    { error: 'Use /api/admin/apartments/[id] for deletions' },
    { status: 400 }
  )
}
