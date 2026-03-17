/**
 * SearchResultsPanel.jsx
 *
 * Slide-in panel that shows GDELT search results.
 * Opens when the user submits the SearchBar; closes via the ✕ button or Escape.
 *
 * Simultaneously highlights matched countries on the globe:
 *   - If search included a specific country → that country glows teal on the globe
 *   - If keyword/topic only → source countries of results glow teal
 *
 * Clicking a result card opens the full StoryPanel for that country via onCountryClick.
 *
 * Serves: Discovery + Orientation + Curiosity
 */

import { useEffect } from 'react'
import { useGdelt } from '../../hooks/useGdelt.js'
import StoryCard from '../Story/StoryCard.jsx'

/**
 * @param {object}   props
 * @param {object|null} props.searchParams       - { keyword, countryName, countryIso3, dateRange, topicCategory }
 * @param {function} props.onClose               - Close the panel
 * @param {function} props.onCountryClick        - Open the StoryPanel for a country { iso3, iso2, name }
 * @param {function} props.onHighlightsChange    - Reports Set<iso3> of countries to highlight on globe
 */
export default function SearchResultsPanel({
  searchParams,
  onClose,
  onCountryClick,
  onHighlightsChange,
}) {
  const isOpen = !!searchParams

  const { stories, loading, error } = useGdelt({
    keyword:       searchParams?.keyword       ?? null,
    countryName:   searchParams?.countryName   ?? null,
    countryIso3:   searchParams?.countryIso3   ?? null,
    dateRange:     searchParams?.dateRange     ?? '30d',
    topicCategory: searchParams?.topicCategory ?? null,
    maxRecords: 25,
    enabled: isOpen,
  })

  // Compute which countries to highlight and report up to App / GlobeView
  useEffect(() => {
    if (!isOpen) {
      onHighlightsChange?.(new Set())
      return
    }
    // If a specific country was searched, highlight it directly (most accurate)
    if (searchParams?.countryIso3) {
      onHighlightsChange?.(new Set([searchParams.countryIso3]))
      return
    }
    // Otherwise highlight source countries of the returned articles
    const iso3s = new Set(
      stories.map(s => s.sourceCountryIso3).filter(Boolean)
    )
    onHighlightsChange?.(iso3s)
  }, [isOpen, searchParams?.countryIso3, stories, onHighlightsChange])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Build a readable summary of the active search
  function buildSearchSummary() {
    const parts = []
    if (searchParams?.keyword)       parts.push(`"${searchParams.keyword}"`)
    if (searchParams?.countryName)   parts.push(searchParams.countryName)
    if (searchParams?.topicCategory) parts.push(searchParams.topicCategory)
    const rangeLabel = { '7d': '7 days', '30d': '30 days', '90d': '90 days', 'all': 'all time' }
    parts.push(`· ${rangeLabel[searchParams?.dateRange ?? '30d']}`)
    return parts.join(' · ')
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[900] bg-black/20"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-[1000]
          w-full sm:w-[420px] max-w-full
          bg-[#0d1426] border-l border-[#1a2540]
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Search results panel"
      >
        {isOpen && (
          <div className="flex flex-col h-full">

            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-[#1a2540] bg-[#0a0f1e]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-teal-600 font-semibold mb-1">
                    Search results
                  </p>
                  <h2 className="text-sm font-serif text-slate-300 leading-snug truncate">
                    {buildSearchSummary()}
                  </h2>
                  {!loading && (
                    <p className="text-xs text-slate-600 mt-1">
                      {stories.length} {stories.length === 1 ? 'story' : 'stories'} found
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors p-1 -mt-1 -mr-1"
                  aria-label="Close results panel"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {/* Loading state */}
              {loading && (
                <div className="space-y-4 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-1.5">
                      <div className="h-3 bg-[#1a2540] rounded animate-pulse w-full" />
                      <div className="h-3 bg-[#1a2540] rounded animate-pulse w-4/5" />
                      <div className="h-2 bg-[#1a2540] rounded animate-pulse w-1/3 mt-1" />
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <p className="text-sm text-red-400/80 mt-4">
                  Could not load results. {error}
                </p>
              )}

              {/* Empty state */}
              {!loading && !error && stories.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-slate-500 text-sm">No stories found for this search.</p>
                  <p className="text-slate-600 text-xs mt-2">
                    Try broadening your date range or adjusting the keywords.
                  </p>
                </div>
              )}

              {/* Results */}
              {!loading && stories.length > 0 && (
                <div>
                  {/* Teal globe hint — only for keyword/topic searches (not country-specific) */}
                  {!searchParams?.countryIso3 && (
                    <p className="text-[10px] text-teal-700 mb-3">
                      Countries highlighted in teal on the globe are publishing these stories.
                    </p>
                  )}

                  {stories.map((story, i) => (
                    <div key={story.url ?? i}>
                      {/* Country label before each story (relevant for keyword/topic searches) */}
                      {!searchParams?.countryIso3 && story.sourceCountryIso3 && i > 0 &&
                        story.sourceCountryIso3 !== stories[i - 1]?.sourceCountryIso3 && (
                        <div className="mt-3 mb-1">
                          <button
                            className="text-[10px] text-teal-600/70 hover:text-teal-400 uppercase tracking-widest transition-colors"
                            onClick={() => {
                              // Try to open the StoryPanel for this source country
                              if (story.sourceCountryIso3) {
                                onCountryClick?.({
                                  iso3: story.sourceCountryIso3,
                                  iso2: null,
                                  name: story.source,
                                })
                              }
                            }}
                          >
                            {story.source}
                          </button>
                        </div>
                      )}
                      <StoryCard story={story} isFirst={i === 0} />
                    </div>
                  ))}

                  <p className="text-[10px] text-slate-700 mt-6 text-center">
                    Powered by the GDELT Project · gdeltproject.org
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
