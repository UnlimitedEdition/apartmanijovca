'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationMarkerProps {
  onLocationChange: (lat: number, lng: number) => void
  initialPosition?: [number, number] | null
}

function LocationMarker({ onLocationChange, initialPosition }: LocationMarkerProps) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null)

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      const newPosition: [number, number] = [lat, lng]
      setPosition(newPosition)
      onLocationChange(lat, lng)
    },
  })

  return position === null ? null : <Marker position={position} />
}

interface LocationPickerMapProps {
  latitude?: number
  longitude?: number
  onLocationChange: (lat: number, lng: number) => void
}

export default function LocationPickerMap({ latitude, longitude, onLocationChange }: LocationPickerMapProps) {
  // Default center: Herceg Novi, Montenegro
  const defaultCenter: [number, number] = [42.4511, 18.5311]
  const center: [number, number] = 
    latitude && longitude ? [latitude, longitude] : defaultCenter
  
  const initialPosition: [number, number] | null = 
    latitude && longitude ? [latitude, longitude] : null

  return (
    <div className="border rounded-lg overflow-hidden" style={{ height: '400px' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          onLocationChange={onLocationChange}
          initialPosition={initialPosition}
        />
      </MapContainer>
    </div>
  )
}
