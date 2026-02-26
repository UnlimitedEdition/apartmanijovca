'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../[lang]/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../[lang]/components/ui/tabs'
import { Badge } from '../[lang]/components/ui/badge'
import { Button } from '../[lang]/components/ui/button'
import BookingCard, { BookingData } from '../../components/portal/BookingCard'
import BookingDetails from '../../components/portal/BookingDetails'
import ProfileSettings from '../../components/portal/ProfileSettings'
import { 
  Calendar, 
  Home, 
  User, 
  History,
  LogOut,
  CalendarDays,
  Star,
  Plus
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type Booking = BookingData

interface PortalDashboardProps {
  bookings: Booking[]
  userEmail: string
}

export default function PortalDashboard({ bookings: initialBookings, userEmail }: PortalDashboardProps) {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [bookings] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Separate bookings into categories
  const now = new Date()
  const upcomingBookings = bookings.filter(b => 
    new Date(b.check_in) > now && b.status !== 'cancelled'
  )
  const activeBookings = bookings.filter(b => 
    new Date(b.check_in) <= now && 
    new Date(b.check_out) >= now && 
    ['confirmed', 'checked_in'].includes(b.status)
  )
  const pastBookings = bookings.filter(b => 
    new Date(b.check_out) < now || b.status === 'cancelled' || b.status === 'checked_out'
  )

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
  }

  const handleBackToList = () => {
    setSelectedBooking(null)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/portal/login'
  }

  // If a booking is selected, show the details view
  if (selectedBooking) {
    return (
      <BookingDetails 
        booking={selectedBooking} 
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Guest Portal</h1>
          <p className="text-muted-foreground">Welcome back, {userEmail}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Home className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <History className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Past Stays</p>
                <p className="text-2xl font-bold">{pastBookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4 mb-6">
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge variant="secondary" className="ml-1">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Home className="h-4 w-4" />
            Active
            {activeBookings.length > 0 && (
              <Badge variant="default" className="ml-1">{activeBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Upcoming Bookings */}
        <TabsContent value="upcoming">
          {upcomingBookings.length > 0 ? (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Upcoming Bookings</CardTitle>
                <CardDescription>You don&apos;t have any upcoming reservations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <a href="/booking">
                    <Plus className="h-4 w-4 mr-2" />
                    Book Now
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Active Bookings */}
        <TabsContent value="active">
          {activeBookings.length > 0 ? (
            <div className="grid gap-4">
              {activeBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Bookings</CardTitle>
                <CardDescription>You don&apos;t have any bookings in progress</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your current stay will appear here once you check in.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Past Bookings / History */}
        <TabsContent value="history">
          {pastBookings.length > 0 ? (
            <div className="grid gap-4">
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onViewDetails={handleViewDetails}
                  showActions={true}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Past Bookings</CardTitle>
                <CardDescription>Your booking history will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Once you complete a stay, it will appear in your history.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <ProfileSettings email={userEmail} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
