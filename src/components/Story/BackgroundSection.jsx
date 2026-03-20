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
      <div className="mt-5 pt-5 border-t border-newsprint-400">
        <p className="text-[10px] uppercase tracking-widest text-broadred mb-2 font-bold">
          Background
        </p>
        <div className="space-y-2">
          <div className="h-3 bg-newsprint-300 rounded animate-pulse w-full" />
          <div className="h-3 bg-newsprint-300 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-newsprint-300 rounded animate-pulse w-4/6" />
        </div>
      </div>
    )
  }

  if (!wikiSummary?.extractShort && !wikiSummary?.extract) return null

  const text = wikiSummary.extractShort ?? wikiSummary.extract

  return (
    <div className="mt-5 pt-5 border-t border-newsprint-400">
      <p className="text-[10px] uppercase tracking-widest text-broadred mb-2 font-bold">
        Background
      </p>
      {wikiSummary.thumbnail && (
        <img
          src={wikiSummary.thumbnail}
          alt={wikiSummary.title}
          className="w-full h-28 object-cover rounded mb-3"
        />
      )}
      <p className="font-serif text-sm text-ink leading-relaxed">{text}</p>
      {wikiSummary.pageUrl && (
        <a
          href={wikiSummary.pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-xs text-broadred hover:text-broadred-dark font-semibold transition-colors"
        >
          Read more on Wikipedia →
        </a>
      )}
    </div>
  )
}
