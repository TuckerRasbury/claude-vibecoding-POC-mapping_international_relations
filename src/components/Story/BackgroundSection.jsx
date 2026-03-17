/**
 * BackgroundSection.jsx
 *
 * The "Historical Anchor" — plain-language context explaining why this place
 * or conflict matters, even if the user has never heard of it.
 *
 * Source: Wikipedia REST API summary (/page/summary/{title})
 * The extract is trimmed to 3 sentences to stay scannable.
 * A link to the full article is always shown.
 *
 * Serves: Orientation
 */

export default function BackgroundSection({ wikiSummary, loading }) {
  if (loading) {
    return (
      <div className="mt-4 pt-4 border-t border-[#1a2540]">
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">
          Background
        </p>
        <div className="space-y-2">
          <div className="h-3 bg-[#1a2540] rounded animate-pulse w-full" />
          <div className="h-3 bg-[#1a2540] rounded animate-pulse w-5/6" />
          <div className="h-3 bg-[#1a2540] rounded animate-pulse w-4/6" />
        </div>
      </div>
    )
  }

  if (!wikiSummary?.extractShort && !wikiSummary?.extract) return null

  const text = wikiSummary.extractShort ?? wikiSummary.extract

  return (
    <div className="mt-4 pt-4 border-t border-[#1a2540]">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">
        Background
      </p>
      {wikiSummary.thumbnail && (
        <img
          src={wikiSummary.thumbnail}
          alt={wikiSummary.title}
          className="w-full h-28 object-cover rounded mb-3 opacity-80"
        />
      )}
      <p className="text-sm text-slate-300 leading-relaxed">{text}</p>
      {wikiSummary.pageUrl && (
        <a
          href={wikiSummary.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-amber-600 hover:text-amber-400 transition-colors"
        >
          Read more on Wikipedia →
        </a>
      )}
    </div>
  )
}
