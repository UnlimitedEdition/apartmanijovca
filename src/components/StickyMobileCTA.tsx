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
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black/60 backdrop-blur-md border-t border-white/10 p-3 flex gap-3"
      style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <a
        href={`tel:${phoneNumber}`}
        onClick={() => trackEvent('cta_click', { type: 'phone', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-[#2563eb] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide shadow hover:bg-[#1d4ed8] transition-colors duration-200"
        aria-label="Pozovite nas telefonom"
      >
        <Phone className="w-4 h-4" /> Pozovi
      </a>
      <a
        href={viberUrl}
        onClick={() => trackEvent('cta_click', { type: 'viber', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-[#7360f2] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide shadow hover:opacity-90 transition-opacity duration-200"
        aria-label="Kontaktirajte nas putem Vibera"
      >
        <MessageSquare className="w-4 h-4" /> Viber
      </a>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('cta_click', { type: 'whatsapp', location: 'sticky_mobile' })}
        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-bold text-sm uppercase tracking-wide shadow hover:opacity-90 transition-opacity duration-200"
        aria-label="Kontaktirajte nas putem WhatsAppa"
      >
        <MessageCircle className="w-4 h-4" /> WA
      </a>
    </div>
  )
}
