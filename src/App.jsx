/**
 * App.jsx
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │ FeaturedStory (top bar, live from GDELT) │
 *   ├─────────────────────────────────────────┤
 *   │                                         │
 *   │           MapView (full height)         │
 *   │                                         │
 *   └─────────────────────────────────────────┘
 *                              ↑
 *                   StoryPanel slides in from right
 *                   when a country is clicked
 *
 * State:
 *   selectedCountry: { iso3, iso2, name } | null
 */

import { useState, useCallback } from 'react'
import MapView from './components/Map/MapView.jsx'
import FeaturedStory from './components/FeaturedStory.jsx'
import StoryPanel from './components/Story/StoryPanel.jsx'

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(null)

  const handleCountryClick = useCallback((country) => {
    setSelectedCountry(country)
  }, [])

  const handleClose = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Top bar: live featured story from GDELT */}
      <FeaturedStory onCountryClick={handleCountryClick} />

      {/* Map — fills remaining height */}
      <div className="flex-1 relative min-h-0">
        <MapView
          onCountryClick={handleCountryClick}
          selectedIso3={selectedCountry?.iso3 ?? null}
        />

        {/* Branding watermark */}
        <div className="absolute bottom-8 left-4 z-[500] pointer-events-none select-none">
          <p className="text-xs text-slate-700 font-serif tracking-wide">
            Curiosity Engine
          </p>
          <p className="text-[10px] text-slate-800 mt-0.5">
            Click any country to explore
          </p>
        </div>
      </div>

      {/* Story panel — slides in from right */}
      <StoryPanel
        country={selectedCountry}
        onClose={handleClose}
      />
    </div>
  )
}
