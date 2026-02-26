'use client'

import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'

interface ApartmentMapProps {
  latitude: number
  longitude: number
  name: string
  address?: string
}

export default function ApartmentMap({ latitude, longitude, name, address }: ApartmentMapProps) {
  const [mounted, setMounted] = useState(false)
  const [MapComponent, setMapComponent] = useState<React.ComponentType<{ latitude: number; longitude: number; name: string }> | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Dynamically import the map component
    import('./ApartmentMapView').then((mod) => {
      setMapComponent(() => mod.default)
    })
  }, [])

  if (!mounted) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50 h-[300px] flex items-center justify-center">
        <p className="text-sm text-gray-600">Učitavanje mape...</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <MapPin className="h-4 w-4 text-blue-600" />
        <span className="font-semibold">{address || name}</span>
      </div>
      
      {MapComponent && (
        <MapComponent
          latitude={latitude}
          longitude={longitude}
          name={name}
        />
      )}
    </div>
  )
}
