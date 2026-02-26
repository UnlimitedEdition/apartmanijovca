'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../app/[lang]/components/ui/card'
import { Badge } from '../../app/[lang]/components/ui/badge'
import { Button } from '../../app/[lang]/components/ui/button'
import { 
  Calendar, 
  Home, 
  User, 
  MapPin, 
  Clock,
  ChevronRight,
  X,
  Eye,
  FileText
} from 'lucide-react'
import { format, differenceInDays, parseISO } from 'date-fns'

interface Apartment {
  id: string
  name: string
  type: string
  bed_type?: string
  description?: string
  max_guests?: number
  base_price_eur?: number
  amenities?: string[] | Record<string, unknown>
  images?: string[] | Record<string, unknown>
  address?: string
  map_link?: string
  check_in_instructions?: string
  contact_phone?: string
  contact_email?: string
}

export interface BookingData {
  id: string
  apartment_id: string
  check_in: string
  check_out: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  status: string
  total_price?: number
  number_of_guests?: number
  created_at: string
  apartments?: Apartment
}

interface BookingCardProps {
  booking: BookingData
  onViewDetails?: (booking: BookingData) => void
  onCancel?: (booking: BookingData) => void
  showActions?: boolean
  variant?: 'default' | 'compact'
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500 hover:bg-yellow-600',
  confirmed: 'bg-green-500 hover:bg-green-600',
  checked_in: 'bg-blue-500 hover:bg-blue-600',
  checked_out: 'bg-gray-500 hover:bg-gray-600',
  cancelled: 'bg-red-500 hover:bg-red-600',
  no_show: 'bg-red-700 hover:bg-red-800'
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  checked_in: 'Checked In',
  checked_out: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show'
}

export default function BookingCard({ 
  booking, 
  onViewDetails, 
  onCancel,
  showActions = true,
  variant = 'default'
}: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const checkInDate = parseISO(booking.check_in)
  const checkOutDate = parseISO(booking.check_out)
  const nights = differenceInDays(checkOutDate, checkInDate)
  const isUpcoming = checkInDate > new Date()
  const isPast = checkOutDate < new Date()
  // const isActive = checkInDate <= new Date() && checkOutDate >= new Date() && 
  //   ['confirmed', 'checked_in'].includes(booking.status)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/portal/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok && onCancel) {
        onCancel(booking)
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: string) => format(parseISO(date), 'MMM d, yyyy')
  
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount)

  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails?.(booking)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{booking.apartments?.name || 'Apartment'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(booking.check_in)} - {formatDate(booking.check_out)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={statusColors[booking.status] || 'bg-gray-500'}>
                {statusLabels[booking.status] || booking.status}
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5 text-primary" />
              {booking.apartments?.name || 'Apartment'}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {booking.apartments?.type || 'Standard'}
              {booking.apartments?.address && ` • ${booking.apartments.address}`}
            </CardDescription>
          </div>
          <Badge className={`${statusColors[booking.status] || 'bg-gray-500'} text-white`}>
            {statusLabels[booking.status] || booking.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Dates */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Check-in</p>
              <p className="font-medium">{formatDate(booking.check_in)}</p>
              {booking.apartments?.check_in_instructions && isUpcoming && (
                <p className="text-xs text-primary">from 2:00 PM</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Check-out</p>
              <p className="font-medium">{formatDate(booking.check_out)}</p>
              {isUpcoming && (
                <p className="text-xs text-primary">by 10:00 AM</p>
              )}
            </div>
          </div>
        </div>

        {/* Booking Info */}
        <div className="flex flex-wrap gap-4 text-sm border-t pt-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{booking.number_of_guests || 1} guest{(booking.number_of_guests || 1) > 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{nights} night{nights > 1 ? 's' : ''}</span>
          </div>
          {booking.total_price && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-lg font-bold text-primary">
                {formatCurrency(booking.total_price)}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewDetails?.(booking)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            
            {isUpcoming && booking.status !== 'cancelled' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            )}

            {isPast && (
              <Button 
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                <FileText className="h-4 w-4 mr-1" />
                Download Invoice
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
