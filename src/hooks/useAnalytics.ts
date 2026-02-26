import { useCallback } from 'react'

const SESSION_KEY = 'analytics_session_id'

// Generate session ID if not exists
function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now().toString(36) + Math.random().toString(36).substr(2)
    localStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}



// Track event function
async function trackEvent(
  eventName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventData: any = {},
  page?: string,
  referrer?: string
) {
  try {
    const sessionId = getSessionId()
    const language = navigator.language
    const screenWidth = window.screen.width
    const screenHeight = window.screen.height

    const payload = {
      event_type: eventName,
      event_data: eventData,
      session_id: sessionId,
      page: page || window.location.pathname,
      referrer: referrer || document.referrer,
      user_agent: navigator.userAgent,
      language,
      screen_width: screenWidth,
      screen_height: screenHeight
    }

    // Non-blocking fetch — fail silently if server is unavailable
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => { /* silent fail */ })
  } catch {
    // silent fail
  }
}

// Hook for analytics
export function useAnalytics() {
  return useCallback(trackEvent, [])
}

// Export trackEvent for direct use
export { trackEvent }
