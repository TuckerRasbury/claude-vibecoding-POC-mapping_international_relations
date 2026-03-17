/**
 * StoryPanel.jsx
 *
 * Slide-in panel that opens when a user clicks a country on the map.
 *
 * Shows:
 *   1. Country header (name, flag emoji if available, Wikidata facts)
 *   2. Recent news stories from GDELT (useGdelt hook)
 *   3. Background section — Wikipedia summary as Historical Anchor (useWikipedia hook)
 *   4. Source links — go deeper paths (SourceLinks component)
 *
 * State: controlled by App.jsx via `country` prop ({ iso3, iso2, name }).
 * Panel is hidden when `country` is null.
 *
 * Serves: Discovery + Orientation + Connection + Curiosity
 */

import { useEffect, useState } from 'react'
import { useGdelt } from '../../hooks/useGdelt.js'
import { useWikipedia, fetchWikiRelated } from '../../hooks/useWikipedia.js'
import { useWikidata } from '../../hooks/useWikidata.js'
import { FIPS_TO_ISO } from '../../utils/countryCodeMap.js'
import StoryCard from './StoryCard.jsx'
import BackgroundSection from './BackgroundSection.jsx'
import SourceLinks from '../SourceLinks.jsx'
import HistoryTab from './HistoryTab.jsx'

function formatPopulation(n) {
  if (!n) return null
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

export default function StoryPanel({ country, onClose, initialTab = 'news' }) {
  const [relatedLinks, setRelatedLinks] = useState([])
  const [activeTab, setActiveTab] = useState('news') // 'news' | 'history'
  const isOpen = !!country

  // Reset to the appropriate tab whenever a new country is opened
  useEffect(() => {
    if (country) setActiveTab(initialTab)
  }, [country?.iso3, initialTab])

  // Fetch stories from GDELT
  const { stories, loading: storiesLoading } = useGdelt({
    countryName: country?.name ?? null,
    countryIso3: country?.iso3 ?? null,
    dateRange: '30d',
    maxRecords: 8,
    enabled: isOpen,
  })

  // Fetch Wikipedia summary using country name as article title
  const wikiTitle = country?.name ?? null
  const { summary: wikiSummary, loading: wikiLoading } = useWikipedia(wikiTitle)

  // Fetch Wikidata context using iso2
  const iso2 = country?.iso2 ?? null
  const { context: wikidataCtx } = useWikidata(iso2)

  // Fetch related Wikipedia articles
  useEffect(() => {
    if (!wikiTitle) { setRelatedLinks([]); return }
    fetchWikiRelated(wikiTitle).then(setRelatedLinks)
  }, [wikiTitle])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop — click to close */}
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
          w-full sm:w-96 max-w-full
          bg-[#0d1426] border-l border-[#1a2540]
          overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
        aria-label="Country story panel"
      >
        {country && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-5 pt-5 pb-0 border-b border-[#1a2540] bg-[#0a0f1e]">
              <div className="flex items-start justify-between gap-3 pb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-serif text-slate-100 leading-tight">
                    {country.name}
                  </h2>
                  {/* Wikidata facts */}
                  {wikidataCtx && (
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      {wikidataCtx.capital && (
                        <span className="text-xs text-slate-500">
                          Capital: <span className="text-slate-400">{wikidataCtx.capital}</span>
                        </span>
                      )}
                      {wikidataCtx.population && (
                        <span className="text-xs text-slate-500">
                          Pop: <span className="text-slate-400">{formatPopulation(wikidataCtx.population)}</span>
                        </span>
                      )}
                      {wikidataCtx.region && (
                        <span className="text-xs text-slate-500">
                          <span className="text-slate-400">{wikidataCtx.region}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 text-slate-600 hover:text-slate-300 transition-colors p-1 -mt-1 -mr-1"
                  aria-label="Close panel"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2 2l14 14M16 2L2 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-0 -mb-px">
                {[
                  { key: 'news',    label: 'News' },
                  { key: 'history', label: 'History' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`
                      px-4 py-2 text-xs font-semibold border-b-2 transition-colors duration-150
                      ${activeTab === tab.key
                        ? 'border-amber-600 text-amber-300'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                      }
                    `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">

              {activeTab === 'news' && (
                <>
                  {/* Recent news */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 mb-1 font-semibold">
                      Recent news
                    </p>
                    {storiesLoading && (
                      <div className="space-y-3 mt-2">
                        {[1,2,3].map(i => (
                          <div key={i} className="space-y-1">
                            <div className="h-3 bg-[#1a2540] rounded animate-pulse w-full" />
                            <div className="h-3 bg-[#1a2540] rounded animate-pulse w-3/4" />
                            <div className="h-2 bg-[#1a2540] rounded animate-pulse w-1/3 mt-1" />
                          </div>
                        ))}
                      </div>
                    )}
                    {!storiesLoading && stories.length === 0 && (
                      <p className="text-sm text-slate-600 italic mt-2">
                        No recent stories found for {country.name}.
                      </p>
                    )}
                    {!storiesLoading && stories.length > 0 && (
                      <div>
                        {stories.map((story, i) => (
                          <StoryCard key={story.url ?? i} story={story} isFirst={i === 0} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Historical Anchor */}
                  <BackgroundSection wikiSummary={wikiSummary} loading={wikiLoading} />

                  {/* Source links */}
                  <SourceLinks
                    wikiUrl={wikiSummary?.pageUrl}
                    articleUrl={stories[0]?.url}
                    articleDomain={stories[0]?.source}
                    related={relatedLinks}
                  />
                </>
              )}

              {activeTab === 'history' && (
                <HistoryTab
                  countryName={country.name}
                  wikidataId={wikidataCtx?.wikidataId ?? null}
                />
              )}
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
