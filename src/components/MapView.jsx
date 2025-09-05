import React, { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Popup, useMapEvents } from 'react-leaflet'
import { LA_RIOJA_CENTER, LA_RIOJA_BOUNDS, TILE } from '../lib/geo'
import { fixLeafletIcons } from '../lib/icons'
import AnimatedMarker from './markers/AnimatedMarker'

function ClickHandler({ onMapClick, enabled }) {
  useMapEvents({ click(e) { if (enabled) onMapClick(e.latlng) } })
  return null
}

export default function MapView({ markers, onMapClick, onMarkerClick, placeMode=false }) {
  useEffect(() => { fixLeafletIcons() }, [])
  const center = useMemo(() => [LA_RIOJA_CENTER.lat, LA_RIOJA_CENTER.lng], [])

  return (
    <MapContainer
      center={center}
      zoom={LA_RIOJA_CENTER.zoom}
      className={`w-full h-full ${placeMode ? 'cursor-crosshair' : ''}`}
      maxBounds={LA_RIOJA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={12}
     zoomControl={false}>
      <TileLayer url={TILE.url} attribution={TILE.attribution} />
      <ClickHandler onMapClick={onMapClick} enabled={placeMode} />
      {markers.map(m => (
        <AnimatedMarker key={m.id} position={[m.lat, m.lng]} onClick={() => onMarkerClick?.(m)}>
          <Popup>
            <div className="space-y-1 text-sm">
              <div className="font-semibold">{m.streetName}</div>
              <div className="text-gray-600">{m.description}</div>
              <div className="text-xs text-gray-500">Por: {m.createdBy}</div>
            </div>
          </Popup>
        </AnimatedMarker>
      ))}
    </MapContainer>
  )
}
