'use client'

import { useState, useEffect } from 'react'
import { getConnectionStatus } from '@/lib/whatsapp/service'

interface WhatsAppStatusData {
  isConfigured: boolean
  isConnected: boolean
  lastChecked?: string
  error?: string
  businessAccountId?: string
}

export default function WhatsAppStatus() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<WhatsAppStatusData>({
    isConfigured: false,
    isConnected: false,
  })

  useEffect(() => {
    const checkHours = () => {
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay()
      // Business hours: 9-21, Monday-Saturday
      const isBusinessDay = day >= 1 && day <= 6
      const isBusinessHour = hour >= 9 && hour < 21
      setIsOpen(isBusinessDay && isBusinessHour)
    }

    const checkWhatsAppStatus = async () => {
      try {
        const connectionStatus = await getConnectionStatus()
        setStatus({
          isConfigured: connectionStatus.isConfigured,
          isConnected: connectionStatus.isConnected,
          lastChecked: connectionStatus.lastChecked?.toISOString(),
          error: connectionStatus.error,
          businessAccountId: connectionStatus.businessAccountId,
        })
      } catch (error) {
        console.error('Failed to check WhatsApp status:', error)
      }
    }

    checkHours()
    checkWhatsAppStatus()

    const hourInterval = setInterval(checkHours, 60000) // check every minute
    const statusInterval = setInterval(checkWhatsAppStatus, 300000) // check status every 5 minutes

    return () => {
      clearInterval(hourInterval)
      clearInterval(statusInterval)
    }
  }, [])

  return (
    <div className="fixed bottom-20 right-6 z-40">
      {/* Status Badge */}
      <div 
        className={`flex items-center gap-2 bg-white border rounded-lg p-2 shadow-lg text-sm cursor-pointer hover:shadow-xl transition-shadow ${
          status.isConfigured && status.isConnected ? 'border-green-200' : 'border-red-200'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={`w-2 h-2 rounded-full ${
          status.isConfigured && status.isConnected 
            ? 'bg-green-600' 
            : status.isConfigured 
              ? 'bg-yellow-600' 
              : 'bg-red-600'
        }`}></div>
        <span className="text-gray-700">
          WhatsApp: {status.isConfigured && status.isConnected ? 'Connected' : status.isConfigured ? 'Disconnected' : 'Not Configured'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Expanded Status Panel */}
      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 w-72 bg-white border rounded-lg shadow-lg p-4 text-sm">
          <h3 className="font-semibold text-gray-900 mb-3">WhatsApp Business Status</h3>
          
          <div className="space-y-2">
            {/* Configuration Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Configuration:</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                status.isConfigured 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {status.isConfigured ? 'Configured' : 'Not Configured'}
              </span>
            </div>

            {/* Connection Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection:</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                status.isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status.isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            {/* Business Hours */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Business Hours:</span>
              <span className={`px-2 py-0.5 rounded text-xs ${
                isOpen 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {isOpen ? 'Online (9-21h)' : 'Offline'}
              </span>
            </div>

            {/* Last Checked */}
            {status.lastChecked && (
              <div className="text-xs text-gray-400 pt-2 border-t">
                Last checked: {new Date(status.lastChecked).toLocaleTimeString()}
              </div>
            )}

            {/* Error Message */}
            {status.error && (
              <div className="text-xs text-red-500 pt-2 border-t">
                {status.error}
              </div>
            )}

            {/* Setup Link */}
            {!status.isConfigured && (
              <a 
                href="/docs/WHATSAPP_SETUP.md" 
                className="block mt-3 text-center text-blue-600 hover:text-blue-800 text-xs"
              >
                View Setup Guide →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
