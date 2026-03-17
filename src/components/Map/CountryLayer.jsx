/**
 * CountryLayer.jsx
 *
 * Renders Natural Earth country polygons on the Leaflet map.
 *
 * Visual encoding:
 *   - Default: dark fill (#1a2540), thin border (#2d3a52)
 *   - Hover: slightly lighter fill, amber border
 *   - Selected: amber fill, bright amber border
 *
 * GeoJSON property used for country identity: ISO_A3
 * Fallback: ADM0_A3 (used when ISO_A3 is "-99", e.g. Kosovo, Taiwan)
 */

import { useEffect, useRef } from 'react'
import L from 'leaflet'

const STYLE = {
  default: {
    fillColor: '#1a2540',
    fillOpacity: 0.85,
    color: '#2d3a52',
    weight: 0.8,
    opacity: 1,
  },
  hover: {
    fillColor: '#243354',
    fillOpacity: 0.95,
    color: '#c97b2e',
    weight: 1.5,
    opacity: 1,
  },
  selected: {
    fillColor: '#2e3f1c',
    fillOpacity: 0.95,
    color: '#e8943a',
    weight: 2,
    opacity: 1,
  },
}

function getIso3(props) {
  // Natural Earth uses '-99' as a sentinel for disputed/unrecognized territories
  const iso = props.ISO_A3
  if (iso && iso !== '-99') return iso
  return props.ADM0_A3 ?? props.SOV_A3 ?? null
}

export default function CountryLayer({ map, geojson, selectedIso3, onCountryClick }) {
  const layerRef = useRef(null)

  useEffect(() => {
    if (!map || !geojson) return

    // Remove existing layer if re-rendering
    if (layerRef.current) {
      layerRef.current.removeFrom(map)
    }

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const iso3 = getIso3(feature.properties)
        return iso3 === selectedIso3 ? STYLE.selected : STYLE.default
      },
      onEachFeature(feature, featureLayer) {
        const props = feature.properties
        const iso3 = getIso3(props)
        const name = props.NAME_EN || props.NAME || props.ADMIN || 'Unknown'
        const iso2 = props.ISO_A2 !== '-99' ? props.ISO_A2 : null

        // Tooltip on hover
        featureLayer.bindTooltip(name, {
          permanent: false,
          sticky: true,
          direction: 'top',
          offset: [0, -4],
        })

        featureLayer.on({
          mouseover(e) {
            if (iso3 !== selectedIso3) {
              e.target.setStyle(STYLE.hover)
              e.target.bringToFront()
            }
          },
          mouseout(e) {
            if (iso3 !== selectedIso3) {
              e.target.setStyle(STYLE.default)
            }
          },
          click() {
            if (iso3 && onCountryClick) {
              onCountryClick({ iso3, iso2, name })
            }
          },
        })
      },
    })

    layer.addTo(map)
    layerRef.current = layer

    return () => {
      layer.removeFrom(map)
    }
  }, [map, geojson]) // eslint-disable-line react-hooks/exhaustive-deps
  // Note: selectedIso3 changes are handled by the separate effect below

  // Update styles when selectedIso3 changes without rebuilding the whole layer
  useEffect(() => {
    if (!layerRef.current) return
    layerRef.current.eachLayer((featureLayer) => {
      const iso3 = getIso3(featureLayer.feature.properties)
      featureLayer.setStyle(iso3 === selectedIso3 ? STYLE.selected : STYLE.default)
    })
  }, [selectedIso3])

  return null // renders directly onto the Leaflet map
}
