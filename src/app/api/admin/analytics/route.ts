import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseAdmin = createClient(supabaseUrl, process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const isServiceRole = !!(process.env.NEXT_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    // Removed unused startDateStr

    // 1. Get total events and unique sessions
    const { data: events, error } = await supabaseAdmin
      .from('analytics_events')
      .select('*')
      // .gte('created_at', startDateStr) // Temporarily remove filter
      .order('created_at', { ascending: false })

    const count = events ? events.length : 0
    const errMsg = error ? error.message : 'none'
    console.log(`DB_DEBUG: KEY=${isServiceRole} DAYS=${days} EVENTS=${count} ERROR=${errMsg}`)

    if (error) throw error

    const safeEvents = events || []
    const totalViews = safeEvents.length
    const uniqueVisitors = new Set(safeEvents.map(e => e.session_id)).size
    const conversionEvents = safeEvents.filter(e => e.event_type === 'cta_click').length
    const conversionRate = uniqueVisitors > 0 ? ((conversionEvents / uniqueVisitors) * 100).toFixed(1) : 0

    // Estimate average duration (simplified)
    const sessionTimes: Record<string, { start: number; end: number }> = {}
    safeEvents.forEach(e => {
      const t = new Date(e.created_at).getTime()
      if (!sessionTimes[e.session_id]) {
        sessionTimes[e.session_id] = { start: t, end: t }
      } else {
        sessionTimes[e.session_id].start = Math.min(sessionTimes[e.session_id].start, t)
        sessionTimes[e.session_id].end = Math.max(sessionTimes[e.session_id].end, t)
      }
    })
    
    const durations = Object.values(sessionTimes).map(s => s.end - s.start).filter(d => d > 0)
    const avgDurationMs = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    const avgDurationMin = Math.floor(avgDurationMs / 60000)
    const avgDurationSec = Math.floor((avgDurationMs % 60000) / 1000)
    const averageDuration = durations.length > 0 ? `${avgDurationMin}m ${avgDurationSec}s` : 'N/A'

    // 2. Aggregate by date
    const viewsByDate: Record<string, number> = {}
    safeEvents.forEach(e => {
      const date = new Date(e.created_at).toISOString().split('T')[0]
      viewsByDate[date] = (viewsByDate[date] || 0) + 1
    })

    // 3. Top pages
    const pages: Record<string, number> = {}
    safeEvents.forEach(e => {
      const p = e.page_url || '/'
      pages[p] = (pages[p] || 0) + 1
    })

    // 4. Device types
    const devices: Record<string, number> = {}
    safeEvents.forEach(e => {
      const d = e.device_type || 'desktop'
      devices[d] = (devices[d] || 0) + 1
    })

    // 5. Countries
    const countries: Record<string, number> = {}
    safeEvents.forEach(e => {
      const c = e.country || 'Unknown'
      countries[c] = (countries[c] || 0) + 1
    })

    return NextResponse.json({
      summary: {
        totalViews,
        uniqueVisitors,
        averageDuration,
        conversionRate
      },
      chartData: Object.entries(viewsByDate).map(([date, count]) => ({ date, count })).sort((a,b) => a.date.localeCompare(b.date)),
      topPages: Object.entries(pages).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count),
      devices: Object.entries(devices).map(([name, value]) => ({ name, value })),
      countries: Object.entries(countries).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count).slice(0, 5)
    })

  } catch (err: unknown) {
    const error = err as Error
    console.error('Analytics API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
