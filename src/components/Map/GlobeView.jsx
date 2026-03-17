/**
 * GlobeView.jsx
 *
 * Replaces the flat Leaflet map with a spinning 3D globe.
 *
 * Library: react-globe.gl (Three.js/WebGL — no API key, free)
 *
 * Features:
 *   - Dark earth texture globe on a starfield background
 *   - Country polygons from Natural Earth GeoJSON (same file as before)
 *   - Hover: country raises and highlights; floating amber pin + name appear above it
 *   - Selected: country glows amber (selected ISO3 passed from App)
 *   - Auto-rotates on load; pauses when a country is selected or user interacts
 *   - Atmosphere glow in deep navy
 *
 * Props:
 *   onCountryClick({ iso3, iso2, name }) — called when user clicks a country
 *   selectedIso3 — ISO3 of the currently selected country (or null)
 *   activeCountries — Set<iso3> of countries with recent GDELT news (from useGlobalActivity)
 */

import { useRef, useEffect, useState } from 'react'
import Globe from 'react-globe.gl'

// Three-Globe CDN assets — lightweight, cached by browser after first load
const GLOBE_TEXTURE = '//unpkg.com/three-globe/example/img/earth-dark.jpg'
const NIGHT_SKY     = '//unpkg.com/three-globe/example/img/night-sky.png'

// Returns ISO3 from Natural Earth properties, with fallback for disputed territories
function getIso3(props) {
  const iso = props.ISO_A3
  if (iso && iso !== '-99') return iso
  return props.ADM0_A3 ?? props.SOV_A3 ?? null
}

// Simple centroid: average lat/lng of the first polygon ring
// Good enough for pin placement; Natural Earth 110m polygons are simple enough
function getCentroid(geometry) {
  const ring =
    geometry.type === 'Polygon'
      ? geometry.coordinates[0]
      : geometry.coordinates[0]?.[0] ?? [] // MultiPolygon: first ring of first polygon

  if (!ring.length) return { lat: 0, lng: 0 }

  let sumLat = 0, sumLng = 0
  for (const [lng, lat] of ring) {
    sumLng += lng
    sumLat += lat
  }
  return { lat: sumLat / ring.length, lng: sumLng / ring.length }
}

export default function GlobeView({ onCountryClick, selectedIso3, activeCountries = new Set() }) {
  const globeRef   = useRef()
  const containerRef = useRef()
  const [geojson, setGeojson]         = useState(null)
  const [hoverFeature, setHoverFeature] = useState(null)
  const [size, setSize]               = useState({ w: 800, h: 600 })

  // Load GeoJSON
  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? '/'
    fetch(`${base}data/countries.geojson`)
      .then(r => r.json())
      .then(setGeojson)
      .catch(err => console.error('Failed to load countries.geojson:', err))
  }, [])

  // Track container size via ResizeObserver so the canvas always fills its parent
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ w: Math.round(width), h: Math.round(height) })
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Pause auto-rotation when a country is selected; resume when panel closes
  useEffect(() => {
    const ctrl = globeRef.current?.controls()
    if (!ctrl) return
    ctrl.autoRotate = !selectedIso3
  }, [selectedIso3])

  const features = geojson?.features ?? []

  // Pin shown above the hovered country
  const hoverPin = hoverFeature
    ? [{ ...getCentroid(hoverFeature.geometry),
         name: hoverFeature.properties.NAME_EN || hoverFeature.properties.NAME || '' }]
    : []

  return (
    <div ref={containerRef} className="w-full h-full">
      <Globe
        ref={globeRef}
        width={size.w}
        height={size.h}

        // Textures
        globeImageUrl={GLOBE_TEXTURE}
        backgroundImageUrl={NIGHT_SKY}

        // Atmosphere
        atmosphereColor="#1a3a6e"
        atmosphereAltitude={0.18}

        // Country polygons
        polygonsData={features}
        polygonGeoJsonGeometry={feat => feat.geometry}
        polygonAltitude={feat => {
          const iso3 = getIso3(feat.properties)
          if (iso3 === selectedIso3)      return 0.02
          if (feat === hoverFeature)       return 0.015
          if (iso3 && activeCountries.has(iso3)) return 0.009
          return 0.006
        }}
        polygonCapColor={feat => {
          const iso3 = getIso3(feat.properties)
          if (iso3 === selectedIso3)      return 'rgba(232, 148, 58, 0.75)'
          if (feat === hoverFeature)       return 'rgba(44, 62, 100, 0.9)'
          if (iso3 && activeCountries.has(iso3)) return 'rgba(120, 60, 20, 0.55)'
          return 'rgba(22, 32, 58, 0.7)'
        }}
        polygonSideColor={() => 'rgba(45, 58, 82, 0.25)'}
        polygonStrokeColor={feat => {
          const iso3 = getIso3(feat.properties)
          if (iso3 === selectedIso3)      return '#e8943a'
          if (feat === hoverFeature)       return '#c97b2e'
          if (iso3 && activeCountries.has(iso3)) return '#8b4513'
          return '#2d3a52'
        }}
        onPolygonHover={feat => setHoverFeature(feat ?? null)}
        onPolygonClick={feat => {
          if (!feat) return
          const props = feat.properties
          const iso3 = getIso3(props)
          const iso2 = props.ISO_A2 !== '-99' ? props.ISO_A2 : null
          const name = props.NAME_EN || props.NAME || props.ADMIN || 'Unknown'
          if (iso3) onCountryClick?.({ iso3, iso2, name })
        }}
        polygonsTransitionDuration={200}

        // Floating amber pin dot above hovered country
        pointsData={hoverPin}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={0.08}
        pointRadius={0.35}
        pointColor={() => '#c97b2e'}
        pointsMerge={false}
        pointsTransitionDuration={150}

        // Country name label floating above the pin
        labelsData={hoverPin}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => d.name}
        labelSize={1.1}
        labelAltitude={0.1}
        labelColor={() => '#f0b464'}
        labelResolution={3}
        labelsTransitionDuration={150}

        // Start spinning on ready
        onGlobeReady={() => {
          const ctrl = globeRef.current.controls()
          ctrl.autoRotate      = true
          ctrl.autoRotateSpeed = 0.5
          ctrl.enableDamping   = true
          ctrl.dampingFactor   = 0.1
          // Pull the camera back slightly for a better field-of-view
          globeRef.current.pointOfView({ altitude: 2.2 })
        }}
      />
    </div>
  )
}
