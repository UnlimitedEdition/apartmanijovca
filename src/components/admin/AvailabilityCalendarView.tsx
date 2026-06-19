'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, X } from 'lucide-react'
import DatePopoverPicker from './DatePopoverPicker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Apartment {
  id: string
  name: string | Record<string, string>
}

interface DayRecord {
  is_available: boolean
  booking_id: string | null
  price_override: number | null
  reason: string | null
}

interface AvailabilityData {
  [date: string]: DayRecord
}

type DayStatus = 'booked' | 'maintenance' | 'blocked' | 'available' | 'empty'

// Vrednosti moraju da budu u skladu sa DB CHECK constraint-om:
// availability.reason ∈ (NULL, 'booked', 'maintenance', 'blocked'). 'free' = oslobodi (reason NULL).
type BlockReason = 'booked' | 'maintenance' | 'blocked' | 'free'

interface PopoverState {
  dateStr: string
  dayLabel: string
  isRealBooking: boolean
  anchorTop: number
  anchorLeft: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateStr(dateStr: string): string {
  // 'YYYY-MM-DD' → 'DD.MM.YYYY'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function getApartmentName(apt: Apartment): string {
  if (typeof apt.name === 'string') return apt.name
  return apt.name?.sr || apt.name?.en || 'Apartman'
}

/** Returns leading empty cell count for a month when week starts on Monday */
function leadingEmptyCells(year: number, month: number): number {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  return (firstDay + 6) % 7 // Mon=0, Tue=1, ... Sun=6
}

function getDayStatus(record: DayRecord | undefined): DayStatus {
  if (!record) return 'empty'
  if (record.booking_id) return 'booked'              // prava rezervacija (merge iz bookings tabele)
  if (record.reason === 'maintenance') return 'maintenance'
  if (record.reason === 'blocked') return 'blocked'
  if (!record.is_available) return 'booked'           // ručno "Zauzeto" (reason 'booked')
  return 'available'
}

function getDayColors(status: DayStatus): string {
  switch (status) {
    case 'booked':
      return 'bg-red-100 text-red-900 border-red-300'
    case 'maintenance':
      return 'bg-yellow-100 text-yellow-900 border-yellow-300'
    case 'blocked':
      return 'bg-gray-200 text-gray-600 border-gray-300'
    case 'available':
      return 'bg-green-100 text-green-900 border-green-300'
    default:
      return 'bg-white text-gray-400 border-gray-200'
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const WEEKDAYS = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned']

const BLOCK_REASON_OPTIONS: { value: BlockReason; label: string }[] = [
  { value: 'booked', label: 'Zauzeto (Booking.com)' },
  { value: 'maintenance', label: 'Održavanje' },
  { value: 'blocked', label: 'Blokirano' },
  { value: 'free', label: 'Oslobodi (Dostupno)' },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AvailabilityCalendarView() {
  // --- state ---
  const [apartments, setApartments] = useState<Apartment[]>([])
  const [selectedApartment, setSelectedApartment] = useState<string>('')
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [availability, setAvailability] = useState<AvailabilityData>({})
  const [loading, setLoading] = useState(false)

  // Range form
  const [rangeFrom, setRangeFrom] = useState('')
  const [rangeTo, setRangeTo] = useState('')
  const [rangeReason, setRangeReason] = useState<BlockReason>('booked')
  const [rangeSaving, setRangeSaving] = useState(false)
  const [rangeMessage, setRangeMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Single-day popover
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [popoverSaving, setPopoverSaving] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const today = formatDate(new Date())

  // --- data fetching ---

  const fetchApartments = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/apartments')
      if (!res.ok) throw new Error('Failed to fetch apartments')
      const data = await res.json()
      const apts: Apartment[] = data.apartments || []
      setApartments(apts)
      if (apts.length > 0 && !selectedApartment) {
        setSelectedApartment(apts[0].id)
      }
    } catch (err) {
      console.error('Greška pri učitavanju apartmana:', err)
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
      const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`

      const params = new URLSearchParams({
        apartmentId: selectedApartment,
        startDate,
        endDate,
        limit: '31',
        includeBookings: 'true',
      })

      const res = await fetch(`/api/admin/availability?${params}`)
      if (!res.ok) throw new Error('Failed to fetch availability')

      const data = await res.json()
      const map: AvailabilityData = {}
      ;(data.data as Array<{
        date: string
        is_available: boolean
        price_override?: number | null
        booking_id?: string | null
        reason?: string | null
      }> || []).forEach((rec) => {
        map[rec.date] = {
          is_available: rec.is_available,
          booking_id: rec.booking_id ?? null,
          price_override: rec.price_override ?? null,
          reason: rec.reason ?? null,
        }
      })
      setAvailability(map)
    } catch (err) {
      console.error('Greška pri učitavanju dostupnosti:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedApartment, currentMonth])

  useEffect(() => { fetchApartments() }, [fetchApartments])
  useEffect(() => { fetchAvailability() }, [fetchAvailability])

  // Close popover on outside click
  useEffect(() => {
    if (!popover) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopover(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [popover])

  // --- month nav ---

  const previousMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  const nextMonth = () =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))

  const monthName = currentMonth.toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })

  // --- calendar grid ---

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = leadingEmptyCells(year, month)

  // --- single POST helper ---

  const postSingleDate = async (
    dateStr: string,
    isAvailable: boolean,
    reason: string | null,
  ): Promise<void> => {
    const res = await fetch('/api/admin/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apartmentId: selectedApartment,
        date: dateStr,
        isAvailable,
        reason,
      }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error((body as { error?: string }).error || 'Server error')
    }
  }

  // --- range save ---

  const handleRangeSave = async () => {
    if (!rangeFrom || !rangeTo) {
      setRangeMessage({ type: 'err', text: 'Unesite oba datuma.' })
      return
    }
    const from = new Date(rangeFrom)
    const to = new Date(rangeTo)
    if (from > to) {
      setRangeMessage({ type: 'err', text: 'Datum "Od" mora biti pre datuma "Do".' })
      return
    }
    const diffMs = to.getTime() - from.getTime()
    const diffDays = Math.ceil(diffMs / 86400000)
    if (diffDays > 366) {
      setRangeMessage({ type: 'err', text: 'Raspon ne može biti duži od 366 dana.' })
      return
    }
    if (diffDays === 0) {
      setRangeMessage({ type: 'err', text: 'Raspon mora biti bar 1 dan (check-out nije blokiran).' })
      return
    }

    const isAvailable = rangeReason === 'free'
    const apiReason = isAvailable ? null : rangeReason

    setRangeSaving(true)
    setRangeMessage(null)
    try {
      // POST each night in [from, to) — check-out night exclusive
      const cursor = new Date(from)
      while (cursor < to) {
        const dateStr = formatDate(cursor)
        await postSingleDate(dateStr, isAvailable, apiReason)
        cursor.setDate(cursor.getDate() + 1)
      }
      setRangeMessage({ type: 'ok', text: `Sačuvano ${diffDays} dan(a).` })
      await fetchAvailability()
    } catch (err) {
      console.error('Greška pri blokiranju raspona:', err)
      setRangeMessage({ type: 'err', text: 'Greška pri čuvanju. Pokušaj ponovo.' })
    } finally {
      setRangeSaving(false)
    }
  }

  // --- calendar range click ---

  const handleDayClick = (dateStr: string) => {
    setPopover(null)
    setRangeMessage(null)

    if (!rangeFrom || rangeTo) {
      setRangeFrom(dateStr)
      setRangeTo('')
      return
    }

    if (dateStr < rangeFrom) {
      setRangeTo(rangeFrom)
      setRangeFrom(dateStr)
      return
    }

    setRangeTo(dateStr)
  }

  const handlePopoverAction = async (action: 'available' | 'booked' | 'maintenance' | 'blocked') => {
    if (!popover || !selectedApartment) return
    const isAvailable = action === 'available'
    // action ∈ {available, booked, maintenance, blocked}; svi osim 'available' su validni DB reason-i.
    const reason = action === 'available' ? null : action
    setPopoverSaving(true)
    try {
      await postSingleDate(popover.dateStr, isAvailable, reason)
      await fetchAvailability()
      setPopover(null)
    } catch (err) {
      console.error('Greška pri ažuriranju dana:', err)
    } finally {
      setPopoverSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-3xl mx-auto space-y-4">

      {/* ---- Compact header: apartment select + month nav ---- */}
      <Card>
        <CardContent className="py-3 px-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={selectedApartment}
              onChange={(e) => setSelectedApartment(e.target.value)}
              className="h-9 px-2 rounded-md border border-gray-300 text-sm flex-1 min-w-0"
            >
              {apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {getApartmentName(apt)}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="outline" size="sm" onClick={previousMonth} className="h-9 w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold capitalize px-2 min-w-[130px] text-center">
                {monthName}
              </span>
              <Button variant="outline" size="sm" onClick={nextMonth} className="h-9 w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---- Calendar grid ---- */}
      <Card>
        <CardContent className="p-2 sm:p-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 mb-1">
                {WEEKDAYS.map((wd) => (
                  <div
                    key={wd}
                    className="text-center text-[10px] sm:text-xs font-semibold text-gray-500 py-1"
                  >
                    {wd}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {/* Leading empty cells */}
                {Array.from({ length: leading }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-9 sm:h-11" />
                ))}

                {/* Actual days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const date = new Date(year, month, day)
                  const dateStr = formatDate(date)
                  const record = availability[dateStr]
                  const status = getDayStatus(record)
                  const colors = getDayColors(status)
                  const isToday = dateStr === today
                  const hasRange = !!rangeFrom && !!rangeTo
                  const rangeStart = hasRange && rangeFrom > rangeTo ? rangeTo : rangeFrom
                  const rangeEnd = hasRange && rangeFrom > rangeTo ? rangeFrom : rangeTo
                  const isRangeSelected = !!rangeFrom && (
                    dateStr === rangeFrom ||
                    (hasRange && dateStr >= rangeStart && dateStr <= rangeEnd)
                  )

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => handleDayClick(dateStr)}
                      className={[
                        'h-9 sm:h-11 flex items-center justify-center rounded border',
                        'text-[10px] sm:text-xs font-medium transition-colors',
                        'hover:opacity-75 active:opacity-60',
                        colors,
                        isToday ? 'ring-2 ring-primary ring-offset-1' : '',
                        isRangeSelected ? 'ring-2 ring-blue-600 ring-offset-1 border-blue-500' : '',
                      ].join(' ')}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-x-3 gap-y-1.5 text-[10px] sm:text-xs">
                {[
                  { color: 'bg-green-100 border-green-300', label: 'Dostupno' },
                  { color: 'bg-red-100 border-red-300', label: 'Rezervisano' },
                  { color: 'bg-yellow-100 border-yellow-300', label: 'Održavanje' },
                  { color: 'bg-gray-200 border-gray-300', label: 'Blokirano' },
                  { color: 'bg-white border-gray-200', label: 'Nema podataka' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded border shrink-0 ${color}`} />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ---- Range form ---- */}
      <Card>
        <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
          <CardTitle className="text-sm sm:text-base font-semibold">
            Ručno blokiranje (npr. rezervacija sa Booking.com)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-end">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-600">Od</label>
              <DatePopoverPicker
                value={rangeFrom}
                onChange={(v) => { setRangeFrom(v); setRangeMessage(null) }}
                placeholder="Od"
                ariaLabel="Od datum"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-600">Do (check-out, nije blokiran)</label>
              <DatePopoverPicker
                value={rangeTo}
                onChange={(v) => { setRangeTo(v); setRangeMessage(null) }}
                placeholder="Do"
                ariaLabel="Do datum"
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-xs font-medium text-gray-600">Status</label>
              <select
                value={rangeReason}
                onChange={(e) => setRangeReason(e.target.value as BlockReason)}
                className="h-9 px-2 rounded-md border border-gray-300 text-sm w-full"
              >
                {BLOCK_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleRangeSave}
              disabled={rangeSaving || !selectedApartment}
              className="h-9 shrink-0"
            >
              {rangeSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Sačuvaj
            </Button>
          </div>

          {rangeMessage && (
            <p
              className={`mt-2 text-xs font-medium ${
                rangeMessage.type === 'ok' ? 'text-green-700' : 'text-red-600'
              }`}
            >
              {rangeMessage.text}
            </p>
          )}
          {rangeFrom && !rangeTo && (
            <p className="mt-1 text-xs text-blue-700">
              Izabran pocetak: {formatDateStr(rangeFrom)}. Kliknite drugi datum za kraj raspona.
            </p>
          )}
          {rangeFrom && rangeTo && rangeFrom <= rangeTo && (
            <p className="mt-1 text-xs text-gray-500">
              Blokira: {formatDateStr(rangeFrom)} - {formatDateStr(rangeTo)} (check-out dan nije ukljucen)
            </p>
          )}
        </CardContent>
      </Card>

      {/* ---- Single-day popover (portal-free, absolute positioned) ---- */}
      {popover && (
        <div
          ref={popoverRef}
          style={{ position: 'absolute', top: popover.anchorTop, left: popover.anchorLeft, zIndex: 50 }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[220px] max-w-[260px]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-700">{popover.dayLabel}</span>
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {popover.isRealBooking ? (
            <p className="text-xs text-gray-600 leading-snug">
              Rezervacija sa sajta — uredi je u tabu <strong>Rezervacije</strong>.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {popoverSaving ? (
                <div className="col-span-2 flex justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handlePopoverAction('available')}
                    className="text-[11px] rounded border border-green-300 bg-green-50 text-green-800 px-2 py-1.5 hover:bg-green-100 transition-colors"
                  >
                    Dostupno
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePopoverAction('booked')}
                    className="text-[11px] rounded border border-red-300 bg-red-50 text-red-800 px-2 py-1.5 hover:bg-red-100 transition-colors"
                  >
                    Zauzeto
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePopoverAction('maintenance')}
                    className="text-[11px] rounded border border-yellow-300 bg-yellow-50 text-yellow-800 px-2 py-1.5 hover:bg-yellow-100 transition-colors"
                  >
                    Održavanje
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePopoverAction('blocked')}
                    className="text-[11px] rounded border border-gray-300 bg-gray-100 text-gray-700 px-2 py-1.5 hover:bg-gray-200 transition-colors"
                  >
                    Blokirano
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
