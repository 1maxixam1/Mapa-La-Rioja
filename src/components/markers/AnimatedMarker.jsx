import React, { useMemo } from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import styles from './marker.module.css'
import { renderToStaticMarkup } from 'react-dom/server'

export default function AnimatedMarker({ position, onClick, children }) {
  const icon = useMemo(() => {
    const html = renderToStaticMarkup(
      <div className={styles.wrapper}>
        <div className={styles.core} />
        <div className={styles.pulse} />
      </div>
    )
    return L.divIcon({ html, className: '', iconSize: [24,24], iconAnchor:[12,12], popupAnchor:[0,-12] })
  }, [])

  return (
    <Marker position={position} icon={icon} eventHandlers={{ click: () => onClick && onClick() }}>
      {children}
    </Marker>
  )
}
