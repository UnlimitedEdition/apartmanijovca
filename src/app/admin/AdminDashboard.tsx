'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent } from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import StatsCards, { type StatCardFilter } from '../../components/admin/StatsCards'
import BookingList from '../../components/admin/BookingList'
import EnhancedApartmentManager from '../../components/admin/EnhancedApartmentManager'
import ContentEditor, { CONTENT_SECTIONS } from '../../components/admin/ContentEditor'
import AnalyticsView from '../../components/admin/AnalyticsView'
import GalleryManager from '../../components/admin/GalleryManager'
import AvailabilityCalendarView from '../../components/admin/AvailabilityCalendarView'
import MessagesManager from '../../components/admin/MessagesManager'
import AttractionsManager from '../../components/admin/AttractionsManager'
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
  Mail,
  MapPin
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

function getActiveBookingCount(stats: Pick<Stats, 'pendingBookings' | 'confirmedBookings'>): number {
  return stats.pendingBookings + stats.confirmedBookings
}

export default function AdminDashboard({ stats: initialStats }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeContentSection, setActiveContentSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [statsKey, setStatsKey] = useState(0) // Key to force StatsCards refresh
  const [messageCount, setMessageCount] = useState<number | null>(null)
  const [bookingCount, setBookingCount] = useState<number | null>(getActiveBookingCount(initialStats))
  const [bookingFilter, setBookingFilter] = useState<{ status?: 'pending' | 'confirmed'; arrivalOn?: string; departureOn?: string; title?: string }>({})

  // Create Supabase client for logout
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )


  const fetchMessageCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/messages')
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessageCount(Array.isArray(data.messages) ? data.messages.length : 0)
    } catch (error) {
      console.error('Message count error:', error)
      setMessageCount(null)
    }
  }, [])

  const fetchBookingCount = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch booking stats')
      const data = await response.json()
      const pendingBookings = typeof data.pendingBookings === 'number' ? data.pendingBookings : 0
      const confirmedBookings = typeof data.confirmedBookings === 'number' ? data.confirmedBookings : 0
      setBookingCount(pendingBookings + confirmedBookings)
    } catch (error) {
      console.error('Booking count error:', error)
      setBookingCount(null)
    }
  }, [])

  useEffect(() => {
    fetchMessageCount()
    fetchBookingCount()
  }, [fetchMessageCount, fetchBookingCount])

  // Zaključaj scroll pozadine dok je mobilni meni otvoren
  useEffect(() => {
    if (mobileMenuOpen) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [mobileMenuOpen])

  const bookingBadge = bookingCount !== null && (
    <span className="ml-auto min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-bold text-primary-foreground">
      {bookingCount}
    </span>
  )

  const messageBadge = messageCount !== null && (
    <span className="ml-auto min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-bold text-primary-foreground">
      {messageCount}
    </span>
  )

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/admin/login'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if signOut fails
      window.location.href = '/admin/login'
    }
  }

  const refreshStats = useCallback(() => {
    setRefreshing(true)
    setStatsKey(prev => prev + 1) // Force StatsCards to re-mount and re-fetch independently
    fetchMessageCount()
    fetchBookingCount()
    setRefreshing(false)
  }, [fetchMessageCount, fetchBookingCount])

  const handleStatusChange = () => {
    // Refresh stats when a booking status changes
    refreshStats()
  }

  // Klik na statističku karticu -> odgovarajući tab (rezervacije sa filterom / analitika / dostupnost)
  const handleCardClick = useCallback((filter: StatCardFilter) => {
    if (filter.type === 'revenue' || filter.type === 'monthlyRevenue') {
      setActiveTab('analytics')
      return
    }
    if (filter.type === 'occupancy') {
      setActiveTab('availability')
      return
    }
    if (filter.type === 'arrivals') {
      setBookingFilter({ arrivalOn: filter.date, title: 'Dolasci danas' })
    } else if (filter.type === 'departures') {
      setBookingFilter({ departureOn: filter.date, title: 'Odlasci danas' })
    } else if (filter.type === 'status') {
      setBookingFilter({
        status: filter.status,
        title: filter.status === 'pending' ? 'Rezervacije na čekanju' : 'Potvrđene rezervacije',
      })
    } else {
      setBookingFilter({ title: 'Sve rezervacije' })
    }
    setActiveTab('bookings')
  }, [])

  // Otvaranje Rezervacija iz menija -> bez filtera
  const openBookingsTab = useCallback(() => {
    setBookingFilter({})
    setActiveTab('bookings')
  }, [])

  const openContentSection = useCallback((sectionId: string) => {
    setActiveContentSection(sectionId)
    setActiveTab('content')
  }, [])

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
              <Button variant="destructive" size="sm" onClick={handleLogout} className="h-9">
                <LogOut className="h-4 w-4 mr-2" />
                Odjava
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-9 w-9 p-0"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Zatvori meni' : 'Otvori meni'}
              onClick={() => setMobileMenuOpen(prev => !prev)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
          </div>

          {/* Mobile Dropdown Menu */}
          <div
            id="mobile-menu"
            className={`md:hidden pb-4 pt-2 border-t mt-2 ${mobileMenuOpen ? '' : 'hidden'}`}
          >
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setActiveTab('dashboard')
                  setMobileMenuOpen(false)
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
                  openBookingsTab()
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Rezervacije</span>
                {bookingBadge}
              </button>
              <button
                onClick={() => {
                  setActiveTab('apartments')
                  setMobileMenuOpen(false)
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
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'availability' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <CalendarCheck className="h-4 w-4" />
                Dostupnost
              </button>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'content' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Tekstovi
                </button>
                {activeTab === 'content' && (
                  <div className="ml-7 mt-1 space-y-1 border-l pl-3">
                    {CONTENT_SECTIONS.map(section => (
                      <button
                        key={section.id}
                        onClick={() => {
                          openContentSection(section.id)
                          setMobileMenuOpen(false)
                        }}
                        className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                          activeContentSection === section.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        {section.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setActiveTab('messages')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <Mail className="h-4 w-4" />
                <span>Poruke</span>
                {messageBadge}
              </button>
              <button
                onClick={() => {
                  setActiveTab('analytics')
                  setMobileMenuOpen(false)
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
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'gallery' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <ImageIcon className="h-4 w-4" />
                Galerija
              </button>
              <button
                onClick={() => {
                  setActiveTab('attractions')
                  setMobileMenuOpen(false)
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'attractions' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <MapPin className="h-4 w-4" />
                Atrakcije
              </button>

              <div className="border-t pt-2 mt-2 flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    refreshStats()
                    setMobileMenuOpen(false)
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
                <Button variant="destructive" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Odjavi se
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
              onClick={openBookingsTab}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'bookings' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Calendar className="h-4 w-4" />
              <span>Rezervacije</span>
              {bookingBadge}
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
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'content' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
              >
                <FileText className="h-4 w-4" />
                Tekstovi
              </button>
              {activeTab === 'content' && (
                <div className="ml-7 mt-1 space-y-1 border-l pl-3">
                  {CONTENT_SECTIONS.map(section => (
                    <button
                      key={section.id}
                      onClick={() => openContentSection(section.id)}
                      className={`w-full rounded-md px-3 py-1.5 text-left text-xs font-medium transition-colors ${
                        activeContentSection === section.id
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {section.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'messages' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Poruke</span>
              {messageBadge}
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
            <button
              onClick={() => setActiveTab('attractions')}
              className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'attractions' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
            >
              <MapPin className="h-4 w-4" />
              Atrakcije
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <StatsCards key={statsKey} onCardClick={handleCardClick} />
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <BookingList
              key={`bk-${bookingFilter.status || ''}-${bookingFilter.arrivalOn || ''}-${bookingFilter.departureOn || ''}`}
              title={bookingFilter.title}
              initialStatus={bookingFilter.status}
              arrivalOn={bookingFilter.arrivalOn}
              departureOn={bookingFilter.departureOn}
              onStatusChange={handleStatusChange}
            />
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
            <ContentEditor selectedSection={activeContentSection} />
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

          {/* Attractions Tab */}
          <TabsContent value="attractions">
            <AttractionsManager />
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </div>
  )
}
