'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { 
  useAvailability, 
  Apartment, 
  AvailabilityStatus,
  isDateRangeAvailable
} from '../../hooks/useAvailability'
import { trackEvent } from '../../hooks/useAnalytics'

// Types
interface DateSelection {
  checkIn: Date | null
  checkOut: Date | null
}

interface AvailabilityCalendarProps {
  apartmentId?: string
  onDateSelect?: (checkIn: Date, checkOut: Date) => void
  onApartmentSelect?: (apartment: Apartment) => void
  initialCheckIn?: Date
  initialCheckOut?: Date
  initialApartmentId?: string
  minNights?: number
  maxNights?: number
  className?: string
}

// Month names for localization
const MONTH_NAMES: Record<string, string[]> = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  sr: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']
}

const DAY_NAMES: Record<string, string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  sr: ['Ned', 'Pon', 'Uto', 'Sre', 'Pet', 'Sub'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  it: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
}

// Status colors
const STATUS_COLORS = {
  available: 'bg-green-100 hover:bg-green-200 border-green-300',
  booked: 'bg-red-100 border-red-300 cursor-not-allowed',
  pending: 'bg-yellow-100 border-yellow-300',
  blocked: 'bg-gray-100 border-gray-300 cursor-not-allowed',
  selected: 'bg-blue-500 text-white',
  inRange: 'bg-blue-100 border-blue-300',
  today: 'ring-2 ring-blue-500'
}

// Helper functions
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

const isSameDay = (date1: Date, date2: Date): boolean => {
  return formatDate(date1) === formatDate(date2)
}

const isToday = (date: Date): boolean => {
  return isSameDay(date, new Date())
}

const isBeforeToday = (date: Date): boolean => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year: number, month: number): number => {
  return new Date(year, month, 1).getDay()
}

// Calendar day component
interface CalendarDayProps {
  date: Date
  status: AvailabilityStatus | undefined
  isSelected: boolean
  isInRange: boolean
  isSelectionStart: boolean
  isSelectionEnd: boolean
  isPast: boolean
  isToday: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function CalendarDay({
  date,
  status,
  isSelected,
  isInRange,
  isSelectionStart,
  isSelectionEnd,
  isPast,
  isToday,
  onClick,
  onMouseEnter
}: CalendarDayProps) {
  const dayNumber = date.getDate()
  
  // Determine the cell's appearance
  let cellClass = 'relative w-full aspect-square border rounded-lg transition-all duration-150 flex items-center justify-center text-sm font-medium '
  
  if (isPast) {
    cellClass += 'bg-gray-50 text-gray-400 cursor-not-allowed '
  } else if (isSelected) {
    cellClass += `${STATUS_COLORS.selected} `
  } else if (isInRange) {
    cellClass += `${STATUS_COLORS.inRange} `
  } else if (status?.status === 'booked') {
    cellClass += `${STATUS_COLORS.booked} `
  } else if (status?.status === 'pending') {
    cellClass += `${STATUS_COLORS.pending} `
  } else if (status?.status === 'blocked') {
    cellClass += `${STATUS_COLORS.blocked} `
  } else {
    cellClass += `${STATUS_COLORS.available} cursor-pointer `
  }
  
  if (isToday && !isSelected) {
    cellClass += STATUS_COLORS.today + ' '
  }
  
  // Special styling for range selection
  if (isSelectionStart) {
    cellClass += 'rounded-r-none '
  } else if (isSelectionEnd) {
    cellClass += 'rounded-l-none '
  } else if (isInRange && !isSelected) {
    cellClass += 'rounded-none '
  }

  return (
    <button
      type="button"
      className={cellClass}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      disabled={isPast || status?.status === 'booked' || status?.status === 'blocked'}
    >
      <span>{dayNumber}</span>
      {status?.status === 'booked' && !isPast && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
      )}
      {status?.status === 'pending' && !isPast && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-yellow-500 rounded-full" />
      )}
    </button>
  )
}

// Month grid component
interface MonthGridProps {
  year: number
  month: number
  apartmentId: string
  availability: Map<string, AvailabilityStatus>
  selection: DateSelection
  hoverDate: Date | null
  onDateClick: (date: Date) => void
  onDateHover: (date: Date) => void
  lang: string
}

function MonthGrid({
  year,
  month,
  apartmentId,
  availability,
  selection,
  hoverDate,
  onDateClick,
  onDateHover,
  lang
}: MonthGridProps) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const monthNames = MONTH_NAMES[lang] || MONTH_NAMES.en
  const dayNames = DAY_NAMES[lang] || DAY_NAMES.en

  // Generate calendar days
  const days: (Date | null)[] = []
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day))
  }

  // Check if a date is in the selection range
  const isInRange = (date: Date): boolean => {
    if (!selection.checkIn) return false
    
    if (selection.checkOut) {
      return date > selection.checkIn && date < selection.checkOut
    }
    
    if (hoverDate && hoverDate > selection.checkIn) {
      return date > selection.checkIn && date < hoverDate
    }
    
    return false
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 text-center">
        {monthNames[month]} {year}
      </h3>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }
          
          const dateStr = formatDate(date)
          const status = availability.get(`${apartmentId}-${dateStr}`)
          const isSelected = selection.checkIn && isSameDay(date, selection.checkIn) ||
            (selection.checkOut && isSameDay(date, selection.checkOut))
          const isSelectionStart = selection.checkIn && isSameDay(date, selection.checkIn)
          const isSelectionEnd = selection.checkOut && isSameDay(date, selection.checkOut)
          
          return (
            <CalendarDay
              key={dateStr}
              date={date}
              status={status}
              isSelected={!!isSelected}
              isInRange={isInRange(date)}
              isSelectionStart={!!isSelectionStart}
              isSelectionEnd={!!isSelectionEnd}
              isPast={isBeforeToday(date)}
              isToday={isToday(date)}
              onClick={() => onDateClick(date)}
              onMouseEnter={() => onDateHover(date)}
            />
          )
        })}
      </div>
    </div>
  )
}

// Main calendar component
export default function AvailabilityCalendar({
  apartmentId,
  onDateSelect,
  onApartmentSelect,
  initialCheckIn,
  initialCheckOut,
  initialApartmentId,
  minNights = 1,
  maxNights = 30,
  className = ''
}: AvailabilityCalendarProps) {
  const t = useTranslations('booking')
  const commonT = useTranslations('common')
  const aptT = useTranslations('apartments')
  const locale = useLocale()
  
  // State
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [selectedApartment, setSelectedApartment] = useState<string | null>(apartmentId || null)
  const [selection, setSelection] = useState<DateSelection>({
    checkIn: initialCheckIn || null,
    checkOut: initialCheckOut || null
  })
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  
  // Fetch availability data with real-time updates
  const { data, loading, error, isRealtimeConnected } = useAvailability({
    enableRealtime: true
  })

  // Get available apartments for selected dates
  // const availableApartments = useMemo(() => {
  //   if (!data || !selection.checkIn || !selection.checkOut) return []
  //   return getAvailableApartmentsForRange(
  //     data.apartments,
  //     data.availability,
  //     selection.checkIn,
  //     selection.checkOut
  //   )
  // }, [data, selection.checkIn, selection.checkOut])

  // Auto-select apartment if initialApartmentId is provided (supports both ID and slug)
  useEffect(() => {
    if (initialApartmentId && !selectedApartment && data?.apartments) {
      // Try to find by ID first, then by slug
      const apartment = data.apartments.find(apt => 
        apt.id === initialApartmentId || apt.slug === initialApartmentId
      )
      if (apartment) {
        setSelectedApartment(apartment.id) // Always use ID for selection
        if (onApartmentSelect) {
          onApartmentSelect(apartment)
        }
      }
    }
  }, [initialApartmentId, selectedApartment, data?.apartments, onApartmentSelect])

  // Handle date click
  const handleDateClick = useCallback((date: Date) => {
    if (!selectedApartment) return
    
    // Helper function to check if two dates are the same day
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    }
    
    // If clicking the same check-in date, reset selection
    if (selection.checkIn && isSameDay(date, selection.checkIn)) {
      setSelection({ checkIn: null, checkOut: null })
      return
    }
    
    // If clicking the same check-out date, reset only check-out
    if (selection.checkOut && isSameDay(date, selection.checkOut)) {
      setSelection({ ...selection, checkOut: null })
      return
    }
    
    // If no check-in selected, set check-in
    if (!selection.checkIn) {
      setSelection({ checkIn: date, checkOut: null })
      return
    }
    
    // If clicking a date before check-in, reset check-in
    if (date < selection.checkIn) {
      setSelection({ checkIn: date, checkOut: null })
      return
    }
    
    // Calculate nights
    const nightsNum = Math.ceil((date.getTime() - selection.checkIn.getTime()) / (1000 * 60 * 60 * 24))
    
    // Validate min/max nights
    if (nightsNum < minNights) {
      return // Too short
    }
    
    if (nightsNum > maxNights) {
      return // Too long
    }
    
    // Check if range is available
    if (data && isDateRangeAvailable(data.availability, selectedApartment, selection.checkIn, date)) {
      setSelection({ ...selection, checkOut: date })
      
      // Track event
      trackEvent('date_range_selected', {
        apartmentId: selectedApartment,
        checkIn: formatDate(selection.checkIn),
        checkOut: formatDate(date),
        nights: nightsNum
      })
      
      // Callback
      if (onDateSelect) {
        onDateSelect(selection.checkIn, date)
      }
    }
  }, [selectedApartment, selection, minNights, maxNights, data, onDateSelect])

  // Handle apartment selection
  const handleApartmentSelect = useCallback((apartment: Apartment) => {
    setSelectedApartment(apartment.id)
    setSelection({ checkIn: null, checkOut: null })
    
    if (onApartmentSelect) {
      onApartmentSelect(apartment)
    }
    
    trackEvent('apartment_selected', { apartmentId: apartment.id })
  }, [onApartmentSelect])

  // Navigation
  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }, [currentMonth, currentYear])

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }, [currentMonth, currentYear])

  // Generate months to display (current month and next month)
  const monthsToDisplay = useMemo(() => {
    const monthsArr = []
    
    // Current month
    monthsArr.push({ year: currentYear, month: currentMonth })
    
    // Next month
    if (currentMonth === 11) {
      monthsArr.push({ year: currentYear + 1, month: 0 })
    } else {
      monthsArr.push({ year: currentYear, month: currentMonth + 1 })
    }
    
    return monthsArr
  }, [currentYear, currentMonth])

  // Loading state
  if (loading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-6" />
          <div className="grid grid-cols-7 gap-2 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{t('calendar.loadError')}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-500 underline"
          >
            {commonT('retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Real-time status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRealtimeConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
          <span className="text-xs text-gray-500">
            {isRealtimeConnected ? t('calendar.realtime') : t('calendar.connecting')}
          </span>
        </div>
      </div>

      {/* Apartment selector (if no specific apartment) */}
      {!apartmentId && data?.apartments && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">{t('form.apartment')}</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.apartments.map((apartment) => (
              <button
                key={apartment.id}
                type="button"
                onClick={() => handleApartmentSelect(apartment)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedApartment === apartment.id
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{apartment.name}</h4>
                    <p className="text-sm text-gray-500">
                      {apartment.bed_type} · {apartment.capacity} {aptT('guests')}
                    </p>
                  </div>
                  <p className="font-bold text-blue-600">
                    €{apartment.base_price_eur}
                    <span className="text-xs font-normal text-gray-500">/ {aptT('perNight').replace('po ', '').replace('a ', '')}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar */}
      {selectedApartment && (
        <>
          {/* Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={goToPrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('calendar.prev')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setCurrentMonth(new Date().getMonth())
                  setCurrentYear(new Date().getFullYear())
                }}
                className="text-sm text-blue-500 hover:underline"
              >
                {t('calendar.today')}
              </button>
            </div>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label={t('calendar.next')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span>{t('calendar.available')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span>{t('calendar.booked')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
              <span>{t('calendar.pending')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded bg-blue-500" />
              <span>{t('calendar.selected')}</span>
            </div>
          </div>

          {/* Month grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monthsToDisplay.map(({ year, month }) => (
              <MonthGrid
                key={`${year}-${month}`}
                year={year}
                month={month}
                apartmentId={selectedApartment}
                availability={data?.availability || new Map()}
                selection={selection}
                hoverDate={hoverDate}
                onDateClick={handleDateClick}
                onDateHover={setHoverDate}
                lang={locale}
              />
            ))}
          </div>

          {/* Selection summary */}
          {selection.checkIn && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">{t('summary.dates')}</h4>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-500">{t('form.checkIn')}</p>
                  <p className="font-medium">
                    {selection.checkIn.toLocaleDateString(locale === 'sr' ? 'sr-RS' : locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : 'en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">{t('form.checkOut')}</p>
                  {selection.checkOut ? (
                    <p className="font-medium">
                      {selection.checkOut.toLocaleDateString(locale === 'sr' ? 'sr-RS' : locale === 'de' ? 'de-DE' : locale === 'it' ? 'it-IT' : 'en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  ) : (
                    <p className="text-gray-400">{t('calendar.selectCheckOut')}</p>
                  )}
                </div>
              </div>
              
              {selection.checkOut && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-sm">
                    {(() => {
                      const n = Math.ceil((selection.checkOut.getTime() - selection.checkIn.getTime()) / (1000 * 60 * 60 * 24))
                      return n === 1 ? t('summary.nights', { count: 1 }) : t('summary.nights_plural', { count: n })
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Clear selection button */}
          {(selection.checkIn || selection.checkOut) && (
            <button
              onClick={() => setSelection({ checkIn: null, checkOut: null })}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {t('calendar.clear')}
            </button>
          )}
        </>
      )}

      {/* No apartment selected message */}
      {!selectedApartment && !apartmentId && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('messages.selectApartment')}</p>
        </div>
      )}
    </div>
  )
}
