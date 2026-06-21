'use client'

import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'

// Live availability badge — a small client island so the apartments list page can
// stay statically cached (ISR) while THIS badge reflects real, current occupancy.
// All instances share a single /api/availability request (today → tomorrow).

let availabilityCache: Promise<Map<string, boolean>> | null = null

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function fetchAvailabilityToday(): Promise<Map<string, boolean>> {
  if (availabilityCache) return availabilityCache

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  availabilityCache = fetch(`/api/availability?checkIn=${fmt(today)}&checkOut=${fmt(tomorrow)}`, {
    cache: 'no-store',
  })
    .then((r) => r.json())
    .then((j) => {
      const map = new Map<string, boolean>()
      if (j?.success && Array.isArray(j.data?.apartments)) {
        for (const a of j.data.apartments) map.set(a.id, !!a.available)
      }
      return map
    })

  return availabilityCache
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
    fetchAvailabilityToday()
      .then((map) => {
        if (!active) return
        // Default to available unless a booking explicitly occupies today.
        setStatus(map.get(apartmentId) === false ? 'booked' : 'available')
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
