'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { 
  Users, 
  MousePointer2, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Globe2, 
  Clock,
  ArrowUpRight,
  TrendingUp,
  Loader2
} from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalViews: number
    uniqueVisitors: number
    averageDuration: string
    conversionRate: number | string
  }
  chartData: { date: string; count: number }[]
  topPages: { name: string; count: number }[]
  devices: { name: string; value: number }[]
  countries: { name: string; count: number }[]
}

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/analytics?days=${days}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [days])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data) return null

  const maxPageViews = Math.max(...data.topPages.map(p => p.count), 1)

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">Analitika poseta</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Pregled saobraćaja u poslednjih {days} dana</p>
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {[7, 30, 90].map(d => (
            <Button 
              key={d}
              variant={days === d ? 'secondary' : 'ghost'} 
              size="sm"
              onClick={() => setDays(d)}
              className="h-7 text-xs px-2 sm:px-3"
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Pregledi</CardTitle>
            <MousePointer2 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.summary.totalViews.toLocaleString()}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
              <span className="truncate">Svi događaji</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Posetioci</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.summary.uniqueVisitors.toLocaleString()}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
              <span className="truncate">Sesije</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Vreme</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.summary.averageDuration}</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
              Prosečno
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6">
            <CardTitle className="text-[10px] sm:text-xs font-medium text-muted-foreground">Konverzija</CardTitle>
            <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{data.summary.conversionRate}%</div>
            <p className="text-[9px] sm:text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
              WA/Viber
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Pages */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-sm sm:text-base">Najposećenije stranice</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Stranice sa najvećim brojem pregleda</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {data.topPages.map((page, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm gap-2">
                    <span className="font-medium truncate flex-1">{page.name}</span>
                    <span className="text-muted-foreground whitespace-nowrap text-[10px] sm:text-xs">{page.count}</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all" 
                      style={{ width: `${(page.count / maxPageViews) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices & Countries */}
        <div className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Uređaji</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {data.devices.map((device, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {device.name === 'mobile' ? <Smartphone className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                       device.name === 'tablet' ? <Tablet className="h-3 w-3 sm:h-4 sm:w-4" /> : 
                       <Monitor className="h-3 w-3 sm:h-4 sm:w-4" />}
                      <span className="text-xs sm:text-sm capitalize">{device.name}</span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold">
                      {data.summary.totalViews > 0 ? Math.round((device.value / data.summary.totalViews) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Lokacije</CardTitle>
              <Globe2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                {data.countries.length > 0 ? data.countries.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm truncate flex-1">{c.name}</span>
                    <span className="text-xs sm:text-sm font-bold ml-2">{c.count}</span>
                  </div>
                )) : (
                  <p className="text-[10px] sm:text-xs text-muted-foreground text-center py-4">Nema dovoljno podataka</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
