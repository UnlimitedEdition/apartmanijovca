'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '../ui/button'

// Lagani single-day date picker (klik na dan u kalendaru — bez kucanja).
// Zamena za native <input type="date"> koji je bezveze za unos (zero-paduje godinu dok kucaš).

const MONTHS_SR = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun',
  'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar',
]
const WEEKDAYS_SR = ['Pon', 'Uto', 'Sre', 'Čet', 'Pet', 'Sub', 'Ned'] // ponedeljak prvi

function toISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fromISO(s: string): Date | null {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return isNaN(d.getTime()) ? null : d
}

function formatHuman(s: string): string {
  const d = fromISO(s)
  if (!d) return ''
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

interface DatePopoverPickerProps {
  value: string // ISO 'YYYY-MM-DD' ili ''
  onChange: (iso: string) => void
  placeholder?: string
  className?: string
  ariaLabel?: string
}

export default function DatePopoverPicker({
  value,
  onChange,
  placeholder = 'Izaberi dan',
  className = '',
  ariaLabel,
}: DatePopoverPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = fromISO(value)
  const [viewMonth, setViewMonth] = useState<Date>(() => selected ?? new Date())
  const rootRef = useRef<HTMLDivElement>(null)

  const openPicker = () => {
    if (selected) setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
    setOpen(true)
  }

  // Zatvori na klik izvan + ESC
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (new Date(year, month, 1).getDay() + 6) % 7 // ponedeljak = 0
  const todayISO = toISO(new Date())

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={ariaLabel || placeholder}
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="flex-1 h-11 px-3 inline-flex items-center gap-2 rounded-md border border-input bg-background text-sm hover:bg-muted/40 focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className={value ? '' : 'text-muted-foreground'}>
            {value ? formatHuman(value) : placeholder}
          </span>
        </button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            title="Očisti datum"
            onClick={() => { onChange(''); setOpen(false) }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-[280px] rounded-lg border bg-popover p-3 shadow-lg">
          {/* Header: mesec + navigacija */}
          <div className="flex items-center justify-between mb-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMonth(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold capitalize">
              {MONTHS_SR[month]} {year}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMonth(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Zaglavlja dana */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS_SR.map((w) => (
              <div key={w} className="text-center text-[10px] font-semibold text-muted-foreground py-1">
                {w}
              </div>
            ))}
          </div>

          {/* Dani */}
          <div className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: leading }).map((_, i) => (
              <div key={`empty-${i}`} className="h-8" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const iso = toISO(new Date(year, month, day))
              const isSel = iso === value
              const isToday = iso === todayISO
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => { onChange(iso); setOpen(false) }}
                  className={[
                    'h-8 rounded text-xs font-medium transition-colors',
                    isSel ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                    !isSel && isToday ? 'ring-1 ring-primary' : '',
                  ].join(' ')}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Footer: brze akcije */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t">
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => { onChange(todayISO); setOpen(false) }}
            >
              Danas
            </button>
            {value && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:underline"
                onClick={() => { onChange(''); setOpen(false) }}
              >
                Očisti
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
