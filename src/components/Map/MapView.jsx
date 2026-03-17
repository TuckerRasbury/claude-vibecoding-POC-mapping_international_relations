/**
 * MapView.jsx
 *
 * The primary discovery surface. Leaflet map with:
 *   - CartoDB Dark Matter base tiles (no API key, attribution required)
 *   - Natural Earth 110m country GeoJSON for clickable polygons
 *   - Country hover tooltips
 *   - Click → opens StoryPanel for that country
 *
 * CartoDB Dark Matter tile URL:
 *   https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
 * Attribution:
 *   © OpenStreetMap contributors © CARTO
 */

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import CountryLayer from './CountryLayer.jsx'

// CartoDB Dark Matter — free, no API key, attribution required
const CARTO_DARK = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' +
    ' &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
}

const DEFAULT_CENTER = [20, 10]
const DEFAULT_ZOOM = 2

export default function MapView({ onCountryClick, selectedIso3 }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const [geojson, setGeojson] = useState(null)

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true,
      // Prevent the map from zooming too far out to avoid white edges
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]],
      maxBoundsViscosity: 1.0,
    })

    L.tileLayer(CARTO_DARK.url, {
      attribution: CARTO_DARK.attribution,
      subdomains: CARTO_DARK.subdomains,
      maxZoom: CARTO_DARK.maxZoom,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Load GeoJSON once
  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? '/'
    fetch(`${base}data/countries.geojson`)
      .then(r => r.json())
      .then(setGeojson)
      .catch(err => console.error('Failed to load countries.geojson:', err))
  }, [])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
      {geojson && mapRef.current && (
        <CountryLayer
          map={mapRef.current}
          geojson={geojson}
          selectedIso3={selectedIso3}
          onCountryClick={onCountryClick}
        />
      )}
    </div>
  )
}
