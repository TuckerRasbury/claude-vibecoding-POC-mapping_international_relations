/**
 * StoryCard.jsx
 *
 * A single news story: headline, source, date, and link to the original article.
 * Stories come from GDELT and are always linked back to the primary source.
 *
 * GDELT data is automatically coded from news articles — it is not editorially curated.
 * Every story must link to the original source. Never display GDELT content without attribution.
 *
 * Serves: Discovery + Curiosity
 */

function formatDate(date) {
  if (!date) return null
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StoryCard({ story, isFirst }) {
  const date = formatDate(story.date)

  return (
    <div className={`py-3 ${isFirst ? '' : 'border-t border-newsprint-400'}`}>
      <a
        href={story.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <p className="font-serif text-sm text-ink leading-snug group-hover:text-broadred transition-colors">
          {story.headline}
        </p>
      </a>
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {story.source && (
          <span className="text-xs text-broadred font-semibold">{story.source}</span>
        )}
        {date && (
          <>
            <span className="text-newsprint-400 text-xs">·</span>
            <span className="text-xs text-ink-muted">{date}</span>
          </>
        )}
        {story.url && (
          <>
            <span className="text-newsprint-400 text-xs">·</span>
            <a
              href={story.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-muted hover:text-broadred transition-colors"
            >
              Read →
            </a>
          </>
        )}
      </div>
    </div>
  )
}
