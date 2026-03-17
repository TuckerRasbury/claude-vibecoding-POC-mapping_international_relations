/**
 * HistoryTab.jsx
 *
 * The "History" tab body inside StoryPanel.
 * Shown when the user switches from the default "News" tab.
 *
 * Three sections (in order):
 *   1. Key Events — structured timeline from Wikidata (useHistoricalWikidata)
 *      Dated events: conflicts, wars, revolutions, coups, famines.
 *      Falls back gracefully if Wikidata returns nothing.
 *
 *   2. Historical Background — Wikipedia "History of [Country]" article summary
 *      (fetchHistoryArticle — tries the dedicated history article first,
 *       then the country article itself). 5-sentence extract.
 *
 *   3. Go Deeper — links to the Wikipedia history article + Wikidata entity page
 *
 * Serves: Orientation (primary) + Connection + Curiosity
 *
 * Props:
 *   countryName   {string}       - e.g. "Sudan"
 *   wikidataId    {string|null}  - e.g. "Q1049" (from useWikidata context)
 */

import { useState, useEffect } from 'react'
import { useHistoricalWikidata } from '../../hooks/useHistoricalWikidata.js'
import { fetchHistoryArticle } from '../../hooks/useWikipedia.js'

function formatDeaths(n) {
  if (!n || n < 100) return null
  if (n >= 1_000_000) return `~${(n / 1_000_000).toFixed(1)}M deaths`
  if (n >= 1_000)     return `~${(n / 1_000).toFixed(0)}K deaths`
  return `~${n} deaths`
}

function SkeletonLine({ w = 'full' }) {
  return (
    <div className={`h-2.5 bg-[#1a2540] rounded animate-pulse w-${w} mb-2`} />
  )
}

export default function HistoryTab({ countryName, wikidataId }) {
  const { events, loading: eventsLoading } = useHistoricalWikidata(wikidataId)

  const [historyArticle, setHistoryArticle] = useState(null)
  const [articleLoading, setArticleLoading] = useState(false)

  useEffect(() => {
    if (!countryName) return
    let cancelled = false
    setArticleLoading(true)
    fetchHistoryArticle(countryName).then(result => {
      if (cancelled) return
      setHistoryArticle(result)
      setArticleLoading(false)
    })
    return () => { cancelled = true }
  }, [countryName])

  const isLoading = eventsLoading || articleLoading
  const hasEvents = events.length > 0

  return (
    <div className="space-y-6 py-2">

      {/* ── Key Events ─────────────────────────────────── */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
          Key events
        </p>

        {eventsLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-3 bg-[#1a2540] rounded animate-pulse shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonLine w="3/4" />
                  <SkeletonLine w="1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!eventsLoading && !hasEvents && (
          <p className="text-xs text-slate-600 italic">
            Structured historical event data is limited for {countryName}.
            See the Historical Background section below for narrative context.
          </p>
        )}

        {!eventsLoading && hasEvents && (
          <ol className="relative border-l border-[#1a2540] ml-2 space-y-4">
            {events.map((event, i) => (
              <li key={event.wikidataUrl ?? i} className="ml-4">
                {/* Timeline dot */}
                <span className="absolute -left-1.5 mt-1.5 w-2.5 h-2.5 rounded-full bg-[#1a2540] border border-amber-800/60" />

                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  {event.dateDisplay && (
                    <span className="text-[11px] font-mono text-amber-700/80 shrink-0">
                      {event.dateDisplay}
                    </span>
                  )}
                  {event.wikidataUrl ? (
                    <a
                      href={event.wikidataUrl.replace('http://www.wikidata.org/entity/', 'https://www.wikidata.org/wiki/')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-300 hover:text-amber-300 transition-colors leading-snug"
                    >
                      {event.label}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-300 leading-snug">{event.label}</span>
                  )}
                </div>
                {event.deaths && (
                  <p className="text-[10px] text-slate-600 mt-0.5 ml-0">
                    {formatDeaths(event.deaths)}
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* ── Historical Background ───────────────────────── */}
      <section>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
          Historical background
        </p>

        {articleLoading && (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => <SkeletonLine key={i} w={i % 2 === 0 ? '4/5' : 'full'} />)}
          </div>
        )}

        {!articleLoading && !historyArticle && (
          <p className="text-xs text-slate-600 italic">
            No historical background available for {countryName}.
          </p>
        )}

        {!articleLoading && historyArticle && (
          <div>
            {historyArticle.thumbnail && (
              <img
                src={historyArticle.thumbnail}
                alt={historyArticle.title}
                className="float-right ml-3 mb-2 w-24 rounded opacity-80"
              />
            )}
            <p className="text-sm text-slate-400 leading-relaxed">
              {historyArticle.extractShort}
            </p>
            <div className="clear-both" />
          </div>
        )}
      </section>

      {/* ── Go Deeper ──────────────────────────────────── */}
      {(historyArticle || wikidataId) && (
        <section>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Go deeper
          </p>
          <div className="flex flex-col gap-1.5">
            {historyArticle?.pageUrl && (
              <a
                href={historyArticle.pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
              >
                {historyArticle.title} — Wikipedia →
              </a>
            )}
            {wikidataId && (
              <a
                href={`https://www.wikidata.org/wiki/${wikidataId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
              >
                {countryName} on Wikidata →
              </a>
            )}
          </div>
          <p className="text-[10px] text-slate-700 mt-3">
            Content from Wikipedia (CC BY-SA 4.0) · Data from Wikidata (CC0)
          </p>
        </section>
      )}

    </div>
  )
}
