'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../app/[lang]/components/ui/card'
// import { Badge } from '../../app/[lang]/components/ui/badge'
import { Button } from '../../app/[lang]/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../app/[lang]/components/ui/tabs'
import { 
  Calendar, 
  Home, 
  User, 
  MapPin, 
  Clock,
  Phone,
  Mail,
  ExternalLink,
  Copy,
  Check,
  Car,
  Wifi,
  Utensils,
  Tv,
  Snowflake,
  Waves,
  Shield,
  Coffee,
  DoorOpen,
  Key,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'
import { format, parseISO, differenceInDays } from 'date-fns'
import type { BookingData } from './BookingCard'

interface BookingDetailsProps {
  booking: BookingData
  onBack?: () => void
}

const amenityIcons: Record<string, React.ElementType> = {
  'wifi': Wifi,
  'parking': Car,
  'kitchen': Utensils,
  'tv': Tv,
  'ac': Snowflake,
  'pool': Waves,
  'safe': Shield,
  'breakfast': Coffee,
  'balcony': DoorOpen,
  'washer': Waves,
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-green-500',
  checked_in: 'bg-blue-500',
  checked_out: 'bg-gray-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-red-700'
}

const statusLabels: Record<string, string> = {
  pending: 'Pending Confirmation',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show'
}

export default function BookingDetails({ booking, onBack }: BookingDetailsProps) {
  const [copied, setCopied] = useState(false)

  const checkInDate = parseISO(booking.check_in)
  const checkOutDate = parseISO(booking.check_out)
  const nights = differenceInDays(checkOutDate, checkInDate)
  const isUpcoming = checkInDate > new Date()
  // const isActive = checkInDate <= new Date() && checkOutDate >= new Date()

  const formatDate = (date: string) => format(parseISO(date), 'EEEE, MMMM d, yyyy')
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount)

  const handleCopyBookingRef = () => {
    navigator.clipboard.writeText(booking.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const apartment = booking.apartments
  const amenities = apartment?.amenities as string[] | undefined

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
      )}

      {/* Booking Status Banner */}
      <div className={`rounded-lg p-4 ${
        booking.status === 'confirmed' ? 'bg-green-50 border border-green-200' :
        booking.status === 'cancelled' ? 'bg-red-50 border border-red-200' :
        booking.status === 'checked_in' ? 'bg-blue-50 border border-blue-200' :
        'bg-yellow-50 border border-yellow-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${statusColors[booking.status]} bg-opacity-20`}>
              {booking.status === 'confirmed' && <Check className="h-5 w-5 text-green-600" />}
              {booking.status === 'cancelled' && <AlertCircle className="h-5 w-5 text-red-600" />}
              {booking.status === 'checked_in' && <DoorOpen className="h-5 w-5 text-blue-600" />}
              {booking.status === 'pending' && <Clock className="h-5 w-5 text-yellow-600" />}
            </div>
            <div>
              <p className="font-medium">
                {statusLabels[booking.status] || booking.status}
              </p>
              <p className="text-sm text-muted-foreground">
                Booking Reference: {booking.id.slice(0, 8).toUpperCase()}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2 ml-1"
                  onClick={handleCopyBookingRef}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </p>
            </div>
          </div>
          {isUpcoming && booking.status !== 'cancelled' && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Arrival in</p>
              <p className="font-bold text-lg">
                {differenceInDays(checkInDate, new Date())} days
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="checkin">Check-in</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    {apartment?.name || 'Apartment'}
                  </CardTitle>
                  <CardDescription>{apartment?.bed_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Check-in</span>
                      </div>
                      <p className="font-semibold">{formatDate(booking.check_in)}</p>
                      <p className="text-sm text-muted-foreground">from 2:00 PM</p>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Check-out</span>
                      </div>
                      <p className="font-semibold">{formatDate(booking.check_out)}</p>
                      <p className="text-sm text-muted-foreground">by 10:00 AM</p>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Guests</p>
                      <p className="font-medium flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {booking.number_of_guests || 1} guest{(booking.number_of_guests || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {nights} night{nights > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {apartment?.description && (
                    <div className="border-t pt-4">
                      <p className="text-muted-foreground text-sm mb-2">About this apartment</p>
                      <p className="text-sm">{apartment.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Check-in Tab */}
            <TabsContent value="checkin" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Check-in Instructions
                  </CardTitle>
                  <CardDescription>Important information for your arrival</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {apartment?.check_in_instructions ? (
                    <div className="prose prose-sm max-w-none">
                      <p>{apartment.check_in_instructions}</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Standard Check-in Process</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Check-in time: from 2:00 PM</li>
                          <li>• Please present your ID/passport</li>
                          <li>• Contact us 30 minutes before arrival</li>
                          <li>• We&apos;ll provide door codes upon arrival</li>
                        </ul>
                      </div>
                      
                      {isUpcoming && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Your Arrival Details</h4>
                          <p className="text-sm text-green-800">
                            We look forward to welcoming you on {formatDate(booking.check_in)}!
                            Our team will be ready to assist you with the check-in process.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Location Card */}
              {apartment && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {apartment.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <p className="font-medium">{apartment.address}</p>
                      </div>
                    )}
                    
                    {apartment.map_link && (
                      <a 
                        href={apartment.map_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open in Maps
                      </a>
                    )}

                    {/* Directions placeholder - could integrate with Maps API */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Detailed directions will be provided in your confirmation email.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Apartment Amenities</CardTitle>
                  <CardDescription>Features and services available</CardDescription>
                </CardHeader>
                <CardContent>
                  {amenities && amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {amenities.map((amenity, index) => {
                        const Icon = amenityIcons[amenity.toLowerCase()] || Check
                        return (
                          <div 
                            key={index} 
                            className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                          >
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="text-sm capitalize">{amenity}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Amenities information not available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Price Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {apartment?.base_price_eur || 0} x {nights} nights
                </span>
                <span>{formatCurrency((apartment?.base_price_eur || 0) * nights)}</span>
              </div>
              {/* Add more price breakdown items if needed */}
              <div className="border-t pt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {booking.total_price 
                      ? formatCurrency(booking.total_price)
                      : formatCurrency((apartment?.base_price_eur || 0) * nights)
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Card */}
          {apartment && (
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {apartment.contact_phone && (
                  <a 
                    href={`tel:${apartment.contact_phone}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Phone className="h-4 w-4" />
                    {apartment.contact_phone}
                  </a>
                )}
                {apartment.contact_email && (
                  <a 
                    href={`mailto:${apartment.contact_email}`}
                    className="flex items-center gap-2 text-sm hover:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    {apartment.contact_email}
                  </a>
                )}
                {!apartment.contact_phone && !apartment.contact_email && (
                  <p className="text-sm text-muted-foreground">
                    Contact details will be sent with your confirmation
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="/contact">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </a>
              </Button>
              {isUpcoming && (
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Modify Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
