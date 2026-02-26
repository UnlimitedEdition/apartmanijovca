'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import StatsCards from '../../components/admin/StatsCards'
import BookingList from '../../components/admin/BookingList'
import EnhancedApartmentManager from '../../components/admin/EnhancedApartmentManager'
import ContentEditor from '../../components/admin/ContentEditor'
import AnalyticsView from '../../components/admin/AnalyticsView'
import GalleryManager from '../../components/admin/GalleryManager'
import AvailabilityCalendarView from '../../components/admin/AvailabilityCalendarView'
import MessagesManager from '../../components/admin/MessagesManager'
import { 
  LayoutDashboard, 
  Calendar, 
  Building2, 
  FileText, 
  LogOut,
  RefreshCw,
  Loader2,
  LineChart,
  ImageIcon,
  CalendarCheck,
  Mail
} from 'lucide-react'

interface Stats {
  totalBookings: number
  pendingBookings: number
  confirmedBookings: number
  totalReviews: number
  checkedInToday?: number
  checkedOutToday?: number
  totalRevenue?: number
  monthlyRevenue?: number
  occupancyRate?: number
  totalApartments?: number
}

interface AdminDashboardProps {
  stats: Stats
}

export default function AdminDashboard({ stats: initialStats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentStats, setCurrentStats] = useState<Stats>(initialStats)
  const [refreshing, setRefreshing] = useState(false)
  const [statsKey, setStatsKey] = useState(0) // Key to force StatsCards refresh

  const refreshStats = useCallback(async () => {
    try {
      setRefreshing(true)
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setCurrentStats(prev => ({ ...prev, ...data }))
        setStatsKey(prev => prev + 1) // Force StatsCards to refresh
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleStatusChange = () => {
    // Refresh stats when a booking status changes
    refreshStats()
  }

  // Auto-load stats on mount
  useEffect(() => {
    refreshStats()
  }, [refreshStats])

  if (!Card || !Tabs || !Button) {
    return (
      <div className="p-8 text-red-500 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Greška pri učitavanju UI komponenti</h2>
        <p>Proverite putanje uvoza komponenti. Admin panel ne može da se prikaže.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Hamburger Menu */}
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-tight">
                Apartmani Jovča <span className="text-primary">Admin</span>
              </h1>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshStats}
                disabled={refreshing}
                className="h-9"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Osveži
              </Button>
              <Button variant="destructive" size="sm" asChild className="h-9">
                <a href="/">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjava
                </a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              onClick={() => {
                const menu = document.getElementById('mobile-menu')
                if (menu) {
                  menu.classList.toggle('hidden')
                }
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>

          {/* Mobile Dropdown Menu */}
          <div id="mobile-menu" className="hidden md:hidden pb-4 pt-2 border-t mt-2">
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Pregled
              </button>
              <button
                onClick={() => {
                  setActiveTab('bookings')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Rezervacije
              </button>
              <button
                onClick={() => {
                  setActiveTab('apartments')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'apartments' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Building2 className="h-4 w-4" />
                Apartmani
              </button>
              <button
                onClick={() => {
                  setActiveTab('availability')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'availability' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                Dostupnost
              </button>
              <button
                onClick={() => {
                  setActiveTab('content')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'content' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <FileText className="h-4 w-4" />
                Tekstovi
              </button>
              <button
                onClick={() => {
                  setActiveTab('messages')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Mail className="h-4 w-4" />
                Poruke
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <LineChart className="h-4 w-4" />
                Analitika
              </button>
              <button
                onClick={() => {
                  setActiveTab('gallery')
                  document.getElementById('mobile-menu')?.classList.add('hidden')
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'gallery' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Galerija
              </button>
              
              <div className="border-t pt-2 mt-2 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    refreshStats()
                    document.getElementById('mobile-menu')?.classList.add('hidden')
                  }}
                  disabled={refreshing}
                  className="w-full justify-start"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Osveži stats
                </Button>
                <Button variant="destructive" size="sm" asChild className="w-full justify-start">
                  <a href="/">
                    <LogOut className="h-4 w-4 mr-2" />
                    Odjavi se
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar + Content */}
      <div className="flex max-w-7xl mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              Pregled
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Rezervacije
            </button>
            <button
              onClick={() => setActiveTab('apartments')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'apartments' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Apartmani
            </button>
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'availability' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <CalendarCheck className="h-4 w-4" />
              Dostupnost
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'content' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <FileText className="h-4 w-4" />
              Tekstovi
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Mail className="h-4 w-4" />
              Poruke
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <LineChart className="h-4 w-4" />
              Analitika
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'gallery' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              Galerija
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <StatsCards key={statsKey} />
            <BookingList limit={5} title="Nedavne rezervacije" onStatusChange={handleStatusChange} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <BookingList onStatusChange={handleStatusChange} />
          </TabsContent>

          {/* Apartments Tab */}
          <TabsContent value="apartments">
            <EnhancedApartmentManager />
          </TabsContent>

          {/* Availability Tab */}
          <TabsContent value="availability">
            <AvailabilityCalendarView />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <ContentEditor />
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <MessagesManager />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsView />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            <GalleryManager />
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  )
}
