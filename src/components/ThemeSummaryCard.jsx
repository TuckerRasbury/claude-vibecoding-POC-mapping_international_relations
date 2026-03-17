/**
 * ThemeSummaryCard.jsx
 *
 * A compact floating card overlaying the bottom-left of the globe.
 * Appears when a historical theme is selected in Historian Mode.
 *
 * Shows:
 *   - Theme name + icon
 *   - 2–3 sentence Wikipedia extract for the theme
 *   - Country count ("X countries highlighted")
 *   - Link to Wikipedia article
 *   - Dismiss button (hides the card but keeps the globe highlights active)
 *
 * Does NOT close Historian Mode — it's just an info overlay.
 * Reappears automatically whenever a new theme is selected.
 *
 * Serves: Orientation + Curiosity
 */

import { useState, useEffect } from 'react'

/**
 * @param {object}      props
 * @param {object|null} props.theme        - theme object from HISTORICAL_THEMES
 * @param {object|null} props.wikiSummary  - WikiSummary from useHistoricalTheme
 * @param {boolean}     props.loading      - true while Wikipedia fetch is in flight
 */
export default function ThemeSummaryCard({ theme, wikiSummary, loading }) {
  const [dismissed, setDismissed] = useState(false)

  // Re-show the card whenever the theme changes
  useEffect(() => {
    setDismissed(false)
  }, [theme?.id])

  if (!theme || dismissed) return null

  const countryCount = theme.countries.size

  return (
    <div
      className="
        absolute bottom-20 left-4 z-[500]
        w-72 max-w-[calc(100vw-2rem)]
        bg-[#0d1426]/95 border border-amber-900/40
        rounded-lg shadow-xl backdrop-blur-sm
        animate-fade-in
      "
      role="complementary"
      aria-label={`${theme.label} theme summary`}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b border-[#1a2540]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{theme.icon}</span>
            <h3 className="text-sm font-semibold text-amber-300 leading-tight">
              {theme.label}
            </h3>
          </div>
          <p className="text-[10px] text-amber-700/70 mt-0.5">
            {countryCount} countries highlighted in gold
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-slate-600 hover:text-slate-400 transition-colors p-0.5 -mr-1 -mt-0.5 shrink-0"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {loading && (
          <div className="space-y-2">
            <div className="h-2.5 bg-[#1a2540] rounded animate-pulse w-full" />
            <div className="h-2.5 bg-[#1a2540] rounded animate-pulse w-4/5" />
            <div className="h-2.5 bg-[#1a2540] rounded animate-pulse w-3/5" />
          </div>
        )}

        {!loading && wikiSummary?.extractShort && (
          <p className="text-xs text-slate-400 leading-relaxed">
            {wikiSummary.extractShort}
          </p>
        )}

        {!loading && !wikiSummary?.extractShort && (
          <p className="text-xs text-slate-600 italic">{theme.description}</p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1a2540]">
          <p className="text-[9px] text-slate-700">
            Click any gold country to explore its history
          </p>
          {wikiSummary?.pageUrl && (
            <a
              href={wikiSummary.pageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-amber-700/70 hover:text-amber-400 transition-colors whitespace-nowrap ml-2"
            >
              Wikipedia →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
