'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Phone, MessageCircle, MessageSquare } from 'lucide-react'
import { trackEvent } from '../hooks/useAnalytics'

export default function StickyMobileCTA() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const phoneNumber = '+381652378080'
  const whatsappUrl = `https://wa.me/381652378080`
  const viberUrl = `viber://chat?number=%2B381652378080`

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show in admin panel or portal
  if (!mounted || pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-background/80 backdrop-blur-lg border-t border-border p-3 flex gap-4">
      <a 
        href={`tel:${phoneNumber}`}
        onClick={() => trackEvent('cta_click', { type: 'phone', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-sm"
      >
        <Phone className="w-4 h-4" /> Pozovi
      </a>
      <a 
        href={viberUrl}
        onClick={() => trackEvent('cta_click', { type: 'viber', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-[#7360f2] text-white py-3 rounded-xl font-bold text-sm"
      >
        <MessageSquare className="w-4 h-4" /> Viber
      </a>
      <a 
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('cta_click', { type: 'whatsapp', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-bold text-sm"
      >
        <MessageCircle className="w-4 h-4" /> WA
      </a>
    </div>
  )
}
