'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from 'lucide-react'

interface Apartment {
  id: string
  name: string | Record<string, string>
}

interface AvailabilityData {
  [date: string]: {
    is_available: boolean
    booking_id: string | null
    price_override: number | null
  }
}

export default function AvailabilityCalendarView() {
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [availability, setAvailability] = useState<AvailabilityData>({})
  const [loading, setLoading] = useState(false)

  const fetchApartments = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/apartments')
      if (!response.ok) throw new Error('Failed to fetch apartments')
      const data = await response.json()
      const apts = data.apartments || []
      setApartments(apts)
      if (apts.length > 0 && !selectedApartment) {
        setSelectedApartment(apts[0].id)
      }
    } catch (err) {
      console.error('Error fetching apartments:', err)
    }
  }, [selectedApartment])

  const fetchAvailability = useCallback(async () => {
    if (!selectedApartment) return
    
    try {
      setLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth() + 1
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`

      const params = new URLSearchParams({
        apartmentId: selectedApartment,
        startDate,
        endDate,
        limit: '100'
      })

      const response = await fetch(`/api/admin/availability?${params}`)
      if (!response.ok) throw new Error('Failed to fetch availability')

      const data = await response.json()
      const availMap: AvailabilityData = {}
      
      data.data?.forEach((record: any) => {
        availMap[record.date] = {
          is_available: record.is_available,
          booking_id: record.booking_id,
          price_override: record.price_override
        }
      })
      
      setAvailability(availMap)
    } catch (err) {
      console.error('Error fetching availability:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedApartment, currentMonth])

  useEffect(() => {
    fetchApartments()
  }, [fetchApartments])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  const getApartmentName = (apt: Apartment): string => {
    if (typeof apt.name === 'string') return apt.name
    return apt.name?.sr || apt.name?.en || 'Unknown'
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDayStatus = (date: Date | null) => {
    if (!date) return null
    const dateStr = formatDate(date)
    const avail = availability[dateStr]
    
    if (!avail) return 'unknown'
    if (avail.booking_id) return 'booked'
    if (!avail.is_available) return 'blocked'
    return 'available'
  }

  const getDayColor = (status: string | null) => {
    switch (status) {
      case 'booked': return 'bg-red-100 text-red-900 border-red-300'
      case 'blocked': return 'bg-gray-200 text-gray-600 border-gray-300'
      case 'available': return 'bg-green-100 text-green-900 border-green-300'
      default: return 'bg-white text-gray-400 border-gray-200'
    }
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })
  const days = getDaysInMonth()
  const weekDays = ['Ned', 'Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub']

  return (
    <div className="space-y-4">
      {/* Apartment Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Kalendar dostupnosti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-2">Izaberi apartman</label>
              <select
                value={selectedApartment}
                onChange={(e) => setSelectedApartment(e.target.value)}
                className="w-full h-9 sm:h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>
                    {getApartmentName(apt)}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={previousMonth} className="h-8 sm:h-9">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h3 className="text-sm sm:text-lg font-semibold capitalize">{monthName}</h3>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-8 sm:h-9">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-2 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-[10px] sm:text-xs font-semibold text-gray-600 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {days.map((date, index) => {
                  const status = getDayStatus(date)
                  const colorClass = getDayColor(status)
                  
                  return (
                    <div
                      key={index}
                      className={`aspect-square flex items-center justify-center rounded border text-[10px] sm:text-xs font-medium transition-colors ${colorClass} ${
                        date ? 'cursor-pointer hover:opacity-80' : ''
                      }`}
                    >
                      {date ? date.getDate() : ''}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border bg-green-100 border-green-300 flex-shrink-0"></div>
                  <span className="truncate">Dostupno</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border bg-red-100 border-red-300 flex-shrink-0"></div>
                  <span className="truncate">Rezervisano</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border bg-gray-200 border-gray-300 flex-shrink-0"></div>
                  <span className="truncate">Blokirano</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 rounded border bg-white border-gray-200 flex-shrink-0"></div>
                  <span className="truncate">Nema podataka</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
