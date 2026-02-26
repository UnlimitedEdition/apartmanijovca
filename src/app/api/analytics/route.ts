import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 200 })
    }

    const body = await request.json()
    const {
      event_type,
      event_data,
      session_id,
      page,
      referrer,
      user_agent,
      language
    } = body

    if (!event_type) {
      console.warn('Analytics API: Missing event_type in body', body)
      return NextResponse.json({ success: false, error: 'Missing event_type' })
    }

    // Get geo data from Vercel headers
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry')
    const city = request.headers.get('x-vercel-ip-city')
    // const region = request.headers.get('x-vercel-ip-region')

    // Detect device type
    const device = getDeviceType(user_agent)

    const analyticsData = {
      event_type,
      event_data: event_data || {},
      session_id,
      page_url: page,
      referrer,
      device_type: device,
      language,
      country: country || 'Unknown',
      city: city || 'Unknown',
      created_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert(analyticsData)

    if (error) {
      console.error('Analytics insert error:', error)
      // Don't fail the request for analytics errors
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics API error:', error)
    // Return 200 even on error to prevent client-side console errors for non-critical analytics
    return NextResponse.json({ success: false, error: 'Analytics error' }, { status: 200 })
  }
}

function getDeviceType(userAgent: string): string {
  if (/mobile/i.test(userAgent)) return 'mobile'
  if (/tablet/i.test(userAgent)) return 'tablet'
  return 'desktop'
}
