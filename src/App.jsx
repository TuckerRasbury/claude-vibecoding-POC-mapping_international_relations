/**
 * App.jsx
 *
 * Layout:
 *   ┌─────────────────────────────────────────┐
 *   │ FeaturedStory (top bar, live from GDELT) │
 *   ├─────────────────────────────────────────┤
 *   │ SearchBar (keyword · country · date · topic) │
 *   ├─────────────────────────────────────────┤
 *   │ TopicFilter (quick globe-filter pills)  │
 *   ├─────────────────────────────────────────┤
 *   │                                         │
 *   │           GlobeView (full height)       │
 *   │                                         │
 *   └─────────────────────────────────────────┘
 *                              ↑
 *   SearchResultsPanel or StoryPanel slides in from right
 *
 * State:
 *   selectedCountry  — controls StoryPanel (map click)
 *   searchParams     — controls SearchResultsPanel (search submit)
 *   searchHighlights — Set<iso3> passed to GlobeView for teal highlight
 *
 * Priority: StoryPanel takes precedence over SearchResultsPanel.
 * Clicking a country while search is active opens StoryPanel, not results.
 */

import { useState, useCallback } from 'react'
import GlobeView from './components/Map/GlobeView.jsx'
import FeaturedStory from './components/FeaturedStory.jsx'
import StoryPanel from './components/Story/StoryPanel.jsx'
import TopicFilter from './components/TopicFilter.jsx'
import SearchBar from './components/Search/SearchBar.jsx'
import SearchResultsPanel from './components/Search/SearchResultsPanel.jsx'
import { useGlobalActivity } from './hooks/useGlobalActivity.js'

export default function App() {
  const [selectedCountry, setSelectedCountry]   = useState(null)
  const [selectedTopic, setSelectedTopic]       = useState(null)
  const [searchParams, setSearchParams]         = useState(null)
  const [searchHighlights, setSearchHighlights] = useState(new Set())

  const { activeCountries } = useGlobalActivity(selectedTopic)

  const handleCountryClick = useCallback((country) => {
    setSelectedCountry(country)
  }, [])

  const handleStoryPanelClose = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  const handleSearch = useCallback((params) => {
    setSearchParams(params)
    setSelectedCountry(null) // close StoryPanel if open
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchParams(null)
    setSearchHighlights(new Set())
  }, [])

  const handleSearchResultsClose = useCallback(() => {
    setSearchParams(null)
    setSearchHighlights(new Set())
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1e] overflow-hidden">
      {/* Top bar: live featured story from GDELT */}
      <FeaturedStory onCountryClick={handleCountryClick} />

      {/* Search bar — always visible */}
      <SearchBar
        onSearch={handleSearch}
        onClear={handleSearchClear}
        isActive={!!searchParams}
      />

      {/* Topic filter pills — quick globe filter, no results panel */}
      <TopicFilter selected={selectedTopic} onChange={setSelectedTopic} />

      {/* Map — fills remaining height */}
      <div className="flex-1 relative min-h-0">
        <GlobeView
          onCountryClick={handleCountryClick}
          selectedIso3={selectedCountry?.iso3 ?? null}
          activeCountries={activeCountries}
          searchHighlights={searchHighlights}
        />

        {/* Branding watermark */}
        <div className="absolute bottom-8 left-4 z-[500] pointer-events-none select-none">
          <p className="text-xs text-slate-700 font-serif tracking-wide">
            Curiosity Engine
          </p>
          <p className="text-[10px] text-slate-800 mt-0.5">
            Glowing countries have recent news · Click to explore
          </p>
        </div>
      </div>

      {/* Search results panel — slides in from right when search is active */}
      <SearchResultsPanel
        searchParams={searchParams}
        onClose={handleSearchResultsClose}
        onCountryClick={handleCountryClick}
        onHighlightsChange={setSearchHighlights}
      />

      {/* Story panel — slides in from right when a country is clicked */}
      <StoryPanel
        country={selectedCountry}
        onClose={handleStoryPanelClose}
      />
    </div>
  )
}
