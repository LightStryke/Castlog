'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const markerIcon = new L.DivIcon({
  className: 'custom-marker',
  html: '<div style="width:18px;height:18px;border-radius:9999px;background:#10b981;border:2px solid #052e16;box-shadow:0 0 8px rgba(16,185,129,.6)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

export default function MapView({ catches, filter }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const filteredCatches = useMemo(() => {
    if (!filter || filter === 'All') return catches
    return catches.filter((catchItem) => {
      if (filter === 'Freshwater') return catchItem.species?.toLowerCase().includes('bass') || catchItem.species?.toLowerCase().includes('trout') || catchItem.species?.toLowerCase().includes('catfish') || catchItem.species?.toLowerCase().includes('carp')
      if (filter === 'Saltwater') return !catchItem.species?.toLowerCase().includes('bass') && !catchItem.species?.toLowerCase().includes('trout') && !catchItem.species?.toLowerCase().includes('catfish') && !catchItem.species?.toLowerCase().includes('carp')
      if (filter === 'Sharks') return catchItem.species?.toLowerCase().includes('shark')
      return true
    })
  }, [catches, filter])

  if (!mounted) return <div className="h-[calc(100vh-64px)] w-full bg-gray-950" />

  return (
    <MapContainer center={[39.5, -98.35]} zoom={4} className="h-[calc(100vh-64px)] w-full">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {filteredCatches.map((catchItem) => (
        <Marker key={catchItem.id} position={[catchItem.latitude, catchItem.longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-sm text-gray-900">
              <p className="font-semibold">{catchItem.profiles?.username || 'Angler'}</p>
              <p>{catchItem.species}</p>
              <p>{catchItem.weight_lbs} lbs</p>
              <p>{new Date(catchItem.created_at).toLocaleDateString()}</p>
              <a href="/feed" className="text-emerald-600 underline">View in feed</a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
