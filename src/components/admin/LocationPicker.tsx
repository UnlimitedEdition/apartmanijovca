'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

interface LocationPickerProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
}

export default function LocationPicker({ latitude, longitude, onLocationChange }: LocationPickerProps) {
  const [mounted, setMounted] = useState(false)
  const [showMap, setShowMap] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [MapComponent, setMapComponent] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    
    // Dynamically import the map component
    import('./LocationPickerMap').then((mod) => {
      setMapComponent(() => mod.default)
    })
  }, [])

  if (!mounted) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-sm text-gray-600">Učitavanje mape...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setShowMap(!showMap)}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
      >
        <MapPin className="h-4 w-4" />
        {showMap ? 'Sakrij mapu' : 'Odaberi na mapi'}
      </button>

      {showMap && MapComponent && (
        <MapComponent
          latitude={latitude}
          longitude={longitude}
          onLocationChange={onLocationChange}
        />
      )}

      {latitude && longitude && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          Odabrana lokacija: {latitude.toFixed(6)}, {longitude.toFixed(6)}
        </div>
      )}
    </div>
  )
}
