import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { extractLocale } from '@/lib/localization/extract'
import { localizeApartment } from '@/lib/localization/transformer'
import { mergeMultiLanguageText } from '@/lib/localization/helpers'
import type { ApartmentRecord } from '@/lib/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

// GET - Get single apartment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Check if raw data is requested (for admin editing)
    const { searchParams } = new URL(request.url)
    const raw = searchParams.get('raw') === 'true'
    
    // Extract locale from request
    const locale = extractLocale(request)

    const { data, error } = await supabaseAdmin
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    const apartment = data as ApartmentRecord
    
    // Return raw data for admin editing, or localized data for display
    if (raw) {
      return NextResponse.json(apartment)
    }

    // Transform apartment data to localized format
    const localized = localizeApartment(apartment, locale)

    return NextResponse.json(localized)
  } catch (error) {
    console.error('Error fetching apartment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch apartment' },
      { status: 500 }
    )
  }
}

// PUT - Update apartment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // First, get the existing apartment to merge multi-language fields
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('apartments')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    if (!existing) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    const existingApartment = existing as ApartmentRecord

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    // Merge multi-language fields if provided (partial updates)
    if (body.name) {
      updateData.name = mergeMultiLanguageText(
        existingApartment.name,
        body.name
      )
    }
    
    if (body.description) {
      updateData.description = mergeMultiLanguageText(
        existingApartment.description,
        body.description
      )
    }
    
    if (body.bed_type) {
      updateData.bed_type = mergeMultiLanguageText(
        existingApartment.bed_type,
        body.bed_type
      )
    }

    // Update all other fields directly if provided
    const simpleFields = [
      'slug', 'capacity', 'base_price_eur', 'images', 'status', 'display_order',
      'size_sqm', 'floor', 'bathroom_count', 'balcony',
      'check_in_time', 'check_out_time', 'min_stay_nights', 'max_stay_nights',
      'gallery', 'video_url', 'virtual_tour_url',
      'weekend_price_eur', 'weekly_discount_percent', 'monthly_discount_percent',
      'seasonal_pricing',
      // New checkbox/counter fields
      'bed_counts', 'selected_amenities', 'selected_rules', 'selected_view',
      // Location fields
      'address', 'city', 'country', 'postal_code', 'latitude', 'longitude'
    ]

    simpleFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    // Handle optional multi-language fields
    const optionalMultiLangFields = [
      'view_type', 'kitchen_type', 'house_rules', 'cancellation_policy',
      'meta_title', 'meta_description', 'meta_keywords'
    ]

    optionalMultiLangFields.forEach(field => {
      if (body[field]) {
        updateData[field] = body[field]
      }
    })

    // Handle features array
    if (body.features) {
      updateData.features = body.features
    }

    const { data, error } = await supabaseAdmin
      .from('apartments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json(
        { error: 'Apartment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating apartment:', error)
    return NextResponse.json(
      { error: 'Failed to update apartment' },
      { status: 500 }
    )
  }
}

// DELETE - Delete apartment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check for existing bookings
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('apartment_id', id)
      .limit(1)

    if (bookingsError) throw bookingsError

    if (bookings && bookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete apartment with existing bookings' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('apartments')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting apartment:', error)
    return NextResponse.json(
      { error: 'Failed to delete apartment' },
      { status: 500 }
    )
  }
}
