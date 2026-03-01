
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../app/[lang]/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'
import { LocalizedApartment, ApartmentRecord, Locale } from '../lib/types/database'
import { transformApartmentRecord } from '../lib/transformers/database'

// Re-export LocalizedApartment as Apartment for backward compatibility
export type Apartment = LocalizedApartment

export interface Booking {
  id: string
  apartment_id: string
  guest_id: string
  check_in: string
  check_out: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  total_price: number | null
}

export interface AvailabilityStatus {
  date: string
  apartmentId: string
  status: 'available' | 'booked' | 'blocked' | 'pending'
  bookingId?: string
}

export interface AvailabilityData {
  apartments: Apartment[]
  availability: Map<string, AvailabilityStatus> // key: `${apartmentId}-${date}`
  bookings: Booking[]
}

interface UseAvailabilityOptions {
  apartmentId?: string
  startDate?: Date
  endDate?: Date
  enableRealtime?: boolean
}

interface UseAvailabilityReturn {
  data: AvailabilityData | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRealtimeConnected: boolean
}

// Timezone helper for Europe/Belgrade
const formatDateForDB = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

// Generate array of dates between start and end (inclusive)
const getDatesInRange = (startDate: Date, endDate: Date): string[] => {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)
  
  while (current <= end) {
    dates.push(formatDateForDB(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

// Main hook for availability data with real-time updates
export function useAvailability(options: UseAvailabilityOptions = {}): UseAvailabilityReturn {
  const { startDate, endDate, enableRealtime = true } = options
  
  const [data, setData] = useState<AvailabilityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 5

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range (default to 3 months if not specified)
      const now = new Date()
      const rangeStart = startDate || now
      const rangeEnd = endDate || new Date(now.getFullYear(), now.getMonth() + 3, 0)

      // Fetch apartments
      const apartmentsQuery = supabase
        .from('apartments')
        .select('*')
      
      const { data: apartmentsData, error: apartmentsError } = await apartmentsQuery

      if (apartmentsError) throw apartmentsError

      // Get locale from browser or URL, default to 'sr'
      const getClientLocale = (): Locale => {
        // Try to get from URL path (e.g., /en/apartments)
        const pathMatch = window.location.pathname.match(/^\/(sr|en|de|it)\//)
        if (pathMatch) return pathMatch[1] as Locale
        
        // Try to get from browser language
        const browserLang = navigator.language.split('-')[0]
        if (['sr', 'en', 'de', 'it'].includes(browserLang)) {
          return browserLang as Locale
        }
        
        return 'sr'
      }
      
      const locale: Locale = getClientLocale()
      
      // Transform apartment records to localized format
      const apartments = (apartmentsData || []).map((apt: ApartmentRecord) => 
        transformApartmentRecord(apt, locale)
      )

      // Fetch bookings in date range
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          apartment_id,
          guest_id,
          check_in,
          check_out,
          status,
          total_price
        `)
        .gte('check_in', formatDateForDB(rangeStart))
        .lte('check_out', formatDateForDB(rangeEnd))
        .neq('status', 'cancelled')

      if (bookingsError) throw bookingsError

      // Build availability map
      const availabilityMap = new Map<string, AvailabilityStatus>()
      const bookings = (bookingsData || []) as Booking[]

      // Initialize all dates as available
      const dates = getDatesInRange(rangeStart, rangeEnd)
      apartments.forEach((apartment: Apartment) => {
        dates.forEach((date) => {
          const key = `${apartment.id}-${date}`
          availabilityMap.set(key, {
            date,
            apartmentId: apartment.id,
            status: 'available'
          })
        })
      })

      // Mark booked dates
      bookings.forEach((booking) => {
        const bookingDates = getDatesInRange(
          new Date(booking.check_in),
          new Date(booking.check_out)
        )
        
        bookingDates.forEach((date) => {
          const key = `${booking.apartment_id}-${date}`
          const existingStatus = availabilityMap.get(key)
          
          if (existingStatus) {
            availabilityMap.set(key, {
              date,
              apartmentId: booking.apartment_id,
              status: booking.status === 'pending' ? 'pending' : 'booked',
              bookingId: booking.id
            })
          }
        })
      })

      setData({
        apartments,
        availability: availabilityMap,
        bookings
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch availability'))
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  // Handle real-time booking updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleBookingChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setData((prevData) => {
      if (!prevData) return prevData

      const newAvailability = new Map(prevData.availability)
      const newBookings = [...prevData.bookings]

      if (eventType === 'INSERT') {
        // Add new booking
        newBookings.push(newRecord as Booking)
        
        // Mark dates as booked
        const bookingDates = getDatesInRange(
          new Date(newRecord.check_in),
          new Date(newRecord.check_out)
        )
        
        bookingDates.forEach((date) => {
          const key = `${newRecord.apartment_id}-${date}`
          newAvailability.set(key, {
            date,
            apartmentId: newRecord.apartment_id,
            status: newRecord.status === 'pending' ? 'pending' : 'booked',
            bookingId: newRecord.id
          })
        })
      } else if (eventType === 'UPDATE') {
        // Update existing booking
        const index = newBookings.findIndex((b) => b.id === newRecord.id)
        if (index !== -1) {
          newBookings[index] = newRecord as Booking
        }

        // If booking was cancelled, free up the dates
        if (newRecord.status === 'cancelled') {
          const oldDates = getDatesInRange(
            new Date(newRecord.check_in),
            new Date(newRecord.check_out)
          )
          
          oldDates.forEach((date) => {
            const key = `${newRecord.apartment_id}-${date}`
            newAvailability.set(key, {
              date,
              apartmentId: newRecord.apartment_id,
              status: 'available'
            })
          })
        } else {
          // Update dates with new status
          const newDates = getDatesInRange(
            new Date(newRecord.check_in),
            new Date(newRecord.check_out)
          )
          
          newDates.forEach((date) => {
            const key = `${newRecord.apartment_id}-${date}`
            newAvailability.set(key, {
              date,
              apartmentId: newRecord.apartment_id,
              status: newRecord.status === 'pending' ? 'pending' : 'booked',
              bookingId: newRecord.id
            })
          })
        }
      } else if (eventType === 'DELETE') {
        // Remove booking and free up dates
        const deletedBooking = oldRecord as Booking
        const index = newBookings.findIndex((b) => b.id === deletedBooking.id)
        if (index !== -1) {
          newBookings.splice(index, 1)
        }

        const oldDates = getDatesInRange(
          new Date(deletedBooking.check_in),
          new Date(deletedBooking.check_out)
        )
        
        oldDates.forEach((date) => {
          const key = `${deletedBooking.apartment_id}-${date}`
          newAvailability.set(key, {
            date,
            apartmentId: deletedBooking.apartment_id,
            status: 'available'
          })
        })
      }

      return {
        ...prevData,
        availability: newAvailability,
        bookings: newBookings
      }
    })
  }, [])

  // Setup real-time subscription
  useEffect(() => {
    if (!enableRealtime) return

    const setupRealtime = async () => {
      try {
        // Create channel for bookings changes
        const channel = supabase
          .channel('availability-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'bookings'
            },
            handleBookingChange
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              setIsRealtimeConnected(true)
              reconnectAttemptsRef.current = 0
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              setIsRealtimeConnected(false)
              
              // Attempt reconnection with exponential backoff
              if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                const delay = Math.pow(2, reconnectAttemptsRef.current) * 4000
                reconnectAttemptsRef.current++
                
                setTimeout(() => {
                  setupRealtime()
                }, delay)
              }
            }
          })

        channelRef.current = channel
      } catch (err) {
        console.error('Failed to setup realtime subscription:', err)
        setIsRealtimeConnected(false)
      }
    }

    setupRealtime()

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe().then(() => {
          if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
            channelRef.current = null
          }
        }).catch(console.error)
        setIsRealtimeConnected(false)
      }
    }
  }, [enableRealtime, handleBookingChange])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isRealtimeConnected
  }
}

// Helper function to check if a specific date is available
export function isDateAvailable(
  availability: Map<string, AvailabilityStatus>,
  apartmentId: string,
  date: string
): boolean {
  const key = `${apartmentId}-${date}`
  const status = availability.get(key)
  return status?.status === 'available'
}

// Helper function to check if a date range is available
export function isDateRangeAvailable(
  availability: Map<string, AvailabilityStatus>,
  apartmentId: string,
  checkIn: Date,
  checkOut: Date
): boolean {
  const dates = getDatesInRange(checkIn, checkOut)
  return dates.every((date) => isDateAvailable(availability, apartmentId, date))
}

// Get available apartments for a date range
export function getAvailableApartmentsForRange(
  apartments: Apartment[],
  availability: Map<string, AvailabilityStatus>,
  checkIn: Date,
  checkOut: Date
): Apartment[] {
  return apartments.filter((apartment) =>
    isDateRangeAvailable(availability, apartment.id, checkIn, checkOut)
  )
}

export default useAvailability