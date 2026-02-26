'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { trackEvent } from '../hooks/useAnalytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const previousPathname = useRef<string>()

  useEffect(() => {
    // Track page view
    const isInitial = !previousPathname.current
    trackEvent('page_view', { initial: isInitial }, pathname, isInitial ? document.referrer : previousPathname.current)

    // Update previous pathname
    previousPathname.current = pathname
  }, [pathname])

  return null
}
