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
 *   │ HistorianModeBar (toggle + theme pills) │
 *   ├─────────────────────────────────────────┤
 *   │                                         │
 *   │       GlobeView (fills remaining height)│
 *   │         ThemeSummaryCard (bottom-left)  │
 *   │                                         │
 *   └─────────────────────────────────────────┘
 *
 * Globe highlight layers (priority order):
 *   1. selectedIso3        — amber (selected country)
 *   2. hover               — blue-gray
 *   3. historicalHighlights — gold (historian mode theme)
 *   4. searchHighlights    — teal (search results)
 *   5. activeCountries     — amber/dimmed (recent news)
 *   6. default             — dark navy
 */

import { useState, useCallback, useMemo } from 'react'
import GlobeView from './components/Map/GlobeView.jsx'
import FeaturedStory from './components/FeaturedStory.jsx'
import StoryPanel from './components/Story/StoryPanel.jsx'
import TopicFilter from './components/TopicFilter.jsx'
import SearchBar from './components/Search/SearchBar.jsx'
import SearchResultsPanel from './components/Search/SearchResultsPanel.jsx'
import HistorianModeBar from './components/HistorianModeBar.jsx'
import ThemeSummaryCard from './components/ThemeSummaryCard.jsx'
import { useGlobalActivity } from './hooks/useGlobalActivity.js'
import { useHistoricalTheme, THEME_BY_ID } from './hooks/useHistoricalTheme.js'

export default function App() {
  const [selectedCountry, setSelectedCountry]         = useState(null)
  const [selectedTopic, setSelectedTopic]             = useState(null)
  const [searchParams, setSearchParams]               = useState(null)
  const [searchHighlights, setSearchHighlights]       = useState(new Set())
  const [historianMode, setHistorianMode]             = useState(false)
  const [selectedHistoricalTheme, setSelectedHistoricalTheme] = useState(null)

  const { activeCountries } = useGlobalActivity(selectedTopic)
  const { theme, wikiSummary, loading: themeLoading } = useHistoricalTheme(selectedHistoricalTheme)

  // The gold globe highlights come directly from the theme's static country set
  const historicalHighlights = useMemo(
    () => theme?.countries ?? new Set(),
    [theme]
  )

  const handleCountryClick = useCallback((country) => {
    setSelectedCountry(country)
  }, [])

  const handleStoryPanelClose = useCallback(() => {
    setSelectedCountry(null)
  }, [])

  const handleSearch = useCallback((params) => {
    setSearchParams(params)
    setSelectedCountry(null)
  }, [])

  const handleSearchClear = useCallback(() => {
    setSearchParams(null)
    setSearchHighlights(new Set())
  }, [])

  const handleSearchResultsClose = useCallback(() => {
    setSearchParams(null)
    setSearchHighlights(new Set())
  }, [])

  const handleToggleHistorianMode = useCallback(() => {
    setHistorianMode(prev => {
      if (prev) setSelectedHistoricalTheme(null) // clear theme when turning off
      return !prev
    })
  }, [])

  const handleThemeSelect = useCallback((themeId) => {
    setSelectedHistoricalTheme(themeId)
  }, [])

  // Watermark text adapts to current mode
  const watermarkHint = historianMode && theme
    ? `${theme.countries.size} countries highlighted · Click to explore history`
    : 'Glowing countries have recent news · Click to explore'

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

      {/* Topic filter pills — quick globe filter */}
      <TopicFilter selected={selectedTopic} onChange={setSelectedTopic} />

      {/* Historian Mode toggle + theme pills */}
      <HistorianModeBar
        historianMode={historianMode}
        selectedTheme={selectedHistoricalTheme}
        onToggleHistorianMode={handleToggleHistorianMode}
        onThemeSelect={handleThemeSelect}
      />

      {/* Globe — fills remaining height */}
      <div className="flex-1 relative min-h-0">
        <GlobeView
          onCountryClick={handleCountryClick}
          selectedIso3={selectedCountry?.iso3 ?? null}
          activeCountries={activeCountries}
          searchHighlights={searchHighlights}
          historicalHighlights={historicalHighlights}
          historianMode={historianMode}
        />

        {/* Theme summary card — floats over globe when a historical theme is active */}
        <ThemeSummaryCard
          theme={theme}
          wikiSummary={wikiSummary}
          loading={themeLoading}
        />

        {/* Branding watermark */}
        <div className="absolute bottom-8 left-4 z-[500] pointer-events-none select-none">
          <p className="text-xs text-slate-700 font-serif tracking-wide">
            Curiosity Engine
          </p>
          <p className="text-[10px] text-slate-800 mt-0.5">
            {watermarkHint}
          </p>
        </div>
      </div>

      {/* Search results panel */}
      <SearchResultsPanel
        searchParams={searchParams}
        onClose={handleSearchResultsClose}
        onCountryClick={handleCountryClick}
        onHighlightsChange={setSearchHighlights}
      />

      {/* Country story panel */}
      <StoryPanel
        country={selectedCountry}
        onClose={handleStoryPanelClose}
      />
    </div>
  )
}
