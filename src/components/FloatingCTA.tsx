'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, Phone, MessageSquare } from 'lucide-react'
import { trackEvent } from '../hooks/useAnalytics'

export default function FloatingCTA() {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const phoneNumber = '+381652378080'
  const whatsappUrl = `https://wa.me/381652378080?text=${encodeURIComponent('Dobar dan! Interesuje me smeštaj u Apartmanima Jovča.')}`
  const viberUrl = `viber://chat?number=%2B381652378080`

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show in admin panel or portal
  if (!mounted || pathname?.startsWith('/admin') || pathname?.startsWith('/portal')) return null

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col gap-3" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Viber Button */}
      <a
        href={viberUrl}
        onClick={() => trackEvent('cta_click', { type: 'viber', location: 'floating' })}
        className="flex items-center justify-center w-14 h-14 bg-[#7360f2] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        title="Viber"
        aria-label="Kontaktirajte nas putem Vibera"
      >
        <MessageSquare className="w-7 h-7" />
      </a>

      {/* WhatsApp Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent('cta_click', { type: 'whatsapp', location: 'floating' })}
        className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        title="WhatsApp"
        aria-label="Kontaktirajte nas putem WhatsAppa"
      >
        <MessageCircle className="w-7 h-7" />
      </a>

      {/* Phone Button - Desktop only */}
      <a
        href={`tel:${phoneNumber}`}
        onClick={() => trackEvent('cta_click', { type: 'phone', location: 'floating' })}
        className="flex items-center justify-center w-14 h-14 bg-[#2563eb] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
        title="Pozovi"
        aria-label="Pozovite nas telefonom"
      >
        <Phone className="w-7 h-7" />
      </a>
    </div>
  )
}
