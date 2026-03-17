/**
 * FeaturedStory.jsx
 *
 * Hero banner shown at the top of the page on load.
 * Story is fetched live from GDELT via fetchFeaturedStory().
 *
 * Selection logic: picks the most recent article whose source country is NOT
 * in the dominant-coverage set (US, UK, France, Germany, China, Russia, Israel).
 * This surfaces stories that most Americans would not otherwise encounter.
 *
 * Serves: Discovery + Connection
 */

import { useState, useEffect } from 'react'
import { fetchFeaturedStory } from '../hooks/useGdelt.js'

function formatDate(seendate) {
  if (!seendate) return null
  // GDELT seendate: "20240315T120000Z" or similar
  const cleaned = seendate.replace(/(\d{4})(\d{2})(\d{2})T?.*/, '$1-$2-$3')
  const d = new Date(cleaned)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default function FeaturedStory({ onCountryClick }) {
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedStory()
      .then(s => {
        setStory(s)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="w-full bg-[#0d1426] border-b border-[#1a2540] px-5 py-3 flex items-center gap-3">
        <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold shrink-0">
          Featured
        </span>
        <div className="h-3 bg-[#1a2540] rounded animate-pulse flex-1 max-w-xl" />
      </div>
    )
  }

  if (!story) return null

  const date = formatDate(story.date)

  return (
    <div className="w-full bg-[#0d1426] border-b border-[#1a2540]">
      <div className="max-w-6xl mx-auto px-5 py-3 flex items-start gap-4">
        {/* Label */}
        <span className="text-xs uppercase tracking-widest text-amber-600 font-semibold shrink-0 mt-0.5">
          Featured
        </span>

        {/* Story content */}
        <div className="flex-1 min-w-0">
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-100 text-sm font-semibold leading-snug hover:text-amber-400 transition-colors line-clamp-2 block"
          >
            {story.headline}
          </a>
          <div className="flex items-center gap-2 mt-1">
            {story.sourceCountry && (
              <span className="text-xs text-slate-500">
                {story.sourceCountry}
              </span>
            )}
            {story.source && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-500">{story.source}</span>
              </>
            )}
            {date && (
              <>
                <span className="text-slate-700">·</span>
                <span className="text-xs text-slate-600">{date}</span>
              </>
            )}
          </div>
        </div>

        {/* "Find on map" button — only if we have an iso3 */}
        {story.sourceCountryIso3 && onCountryClick && (
          <button
            onClick={() => onCountryClick({
              iso3: story.sourceCountryIso3,
              name: story.sourceCountry,
            })}
            className="shrink-0 text-xs text-amber-600 border border-amber-800 hover:border-amber-500 hover:text-amber-400 rounded px-2.5 py-1 transition-colors whitespace-nowrap"
          >
            Find on map →
          </button>
        )}
      </div>
    </div>
  )
}
