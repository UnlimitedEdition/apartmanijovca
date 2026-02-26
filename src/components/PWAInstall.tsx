'use client'

import { useEffect, useState } from 'react'

export default function PWAInstall() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(() => console.log('SW registration failed'))
    }

    // Listen for install prompt
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt')
        }
        setDeferredPrompt(null)
        setShowInstall(false)
      })
    }
  }

  if (!showInstall) return null

  return (
    <button
      onClick={handleInstall}
      className="fixed bottom-6 left-6 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 hover:bg-blue-700"
    >
      Install App
    </button>
  )
}
