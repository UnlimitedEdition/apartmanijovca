'use client'

import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'

// Live availability badge — a small client island so the apartments list page can
// stay statically cached (ISR) while THIS badge reflects real, current occupancy.
// All instances share a single /api/availability request (today → tomorrow).

let occupiedCache: Promise<Set<string>> | null = null

// Set of apartment_ids occupied TODAY (night model — checkout day is free).
function fetchOccupiedToday(): Promise<Set<string>> {
  if (occupiedCache) return occupiedCache
  occupiedCache = fetch('/api/availability/today', { cache: 'no-store' })
    .then((r) => r.json())
    .then((j) => new Set<string>(Array.isArray(j?.occupied) ? j.occupied : []))
    .catch(() => new Set<string>())
  return occupiedCache
}

type Status = 'loading' | 'available' | 'booked'

export function AvailabilityBadge({
  apartmentId,
  availableLabel,
  bookedLabel,
}: {
  apartmentId: string
  availableLabel: string
  bookedLabel: string
}) {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true
    fetchOccupiedToday()
      .then((occupied) => {
        if (!active) return
        setStatus(occupied.has(apartmentId) ? 'booked' : 'available')
      })
      .catch(() => active && setStatus('available'))
    return () => {
      active = false
    }
  }, [apartmentId])

  // While resolving, render nothing (badge is absolutely positioned — no layout shift).
  if (status === 'loading') return null

  const occupied = status === 'booked'

  return (
    <Badge
      className={`absolute top-3 left-3 z-10 ${
        occupied ? 'bg-red-500/90 text-white' : 'bg-primary/90 text-primary-foreground'
      } backdrop-blur border-0 shadow-lg px-2 py-0.5 text-[10px] font-bold`}
    >
      {occupied ? bookedLabel : availableLabel}
    </Badge>
  )
}
