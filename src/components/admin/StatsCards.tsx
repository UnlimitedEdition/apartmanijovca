'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { 
  Calendar, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Home
} from 'lucide-react'

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  checkedInToday: number
  checkedOutToday: number
  totalRevenue: number
  monthlyRevenue: number
  occupancyRate: number
  totalApartments: number
}

interface StatsCardsProps {
  initialStats?: Partial<DashboardStats>
}

const defaultStats: DashboardStats = {
  totalBookings: 0,
  pendingBookings: 0,
  confirmedBookings: 0,
  checkedInToday: 0,
  checkedOutToday: 0,
  totalRevenue: 0,
  monthlyRevenue: 0,
  occupancyRate: 0,
  totalApartments: 0
}

export default function StatsCards({ initialStats }: StatsCardsProps) {
  const [stats, setStats] = useState<DashboardStats>({ ...defaultStats, ...initialStats })
  const [loading, setLoading] = useState(!initialStats)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialStats) {
      setStats({ ...defaultStats, ...initialStats })
      return
    }

    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data = await response.json()
        setStats({ ...defaultStats, ...data })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    
    // Set up real-time subscription for bookings
    const interval = setInterval(fetchStats, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [initialStats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Greška pri učitavanju statistike: {error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Today's Check-ins */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">
            Dolasci danas
          </CardTitle>
          <CheckCircle2 className="h-5 w-5 md:h-4 md:w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-green-700 dark:text-green-300">
            {stats.checkedInToday}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            gostiju koji dolaze danas
          </p>
        </CardContent>
      </Card>

      {/* Today's Check-outs */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Odlasci danas
          </CardTitle>
          <Clock className="h-5 w-5 md:h-4 md:w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-orange-700 dark:text-orange-300">
            {stats.checkedOutToday}
          </div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            gostiju koji odlaze danas
          </p>
        </CardContent>
      </Card>

      {/* Pending Bookings */}
      <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Na čekanju
          </CardTitle>
          <AlertCircle className="h-5 w-5 md:h-4 md:w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-yellow-700 dark:text-yellow-300">
            {stats.pendingBookings}
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
            čeka na vašu potvrdu
          </p>
        </CardContent>
      </Card>

      {/* Confirmed Bookings */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Potvrđeno
          </CardTitle>
          <Calendar className="h-5 w-5 md:h-4 md:w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-blue-700 dark:text-blue-300">
            {stats.confirmedBookings}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            predstojeći dolasci
          </p>
        </CardContent>
      </Card>

      {/* Total Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ukupno rezervacija</CardTitle>
          <Users className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground mt-1">
            rezervisano do sada
          </p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ukupan prihod</CardTitle>
          <CreditCard className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            ukupna zarada
          </p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mesečni prihod</CardTitle>
          <TrendingUp className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            zarada u ovom mesecu
          </p>
        </CardContent>
      </Card>

      {/* Occupancy Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Popunjenost</CardTitle>
          <Home className="h-5 w-5 md:h-4 md:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-xl md:text-2xl font-bold">{stats.occupancyRate}%</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalApartments} apartmana
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
