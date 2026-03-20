/**
 * SourceLinks.jsx
 *
 * "Gateway, not destination" — every story ends with a clear path out.
 * Shows links to Wikipedia, the original news source, and related Wikipedia articles.
 *
 * Serves: Curiosity
 */

export default function SourceLinks({ wikiUrl, articleUrl, articleDomain, related = [] }) {
  const hasLinks = wikiUrl || articleUrl || related.length > 0

  if (!hasLinks) return null

  return (
    <div className="mt-5 pt-5 border-t border-newsprint-400">
      <p className="text-[10px] uppercase tracking-widest text-broadred mb-2 font-bold">
        Go Deeper
      </p>
      <div className="flex flex-col gap-2">
        {wikiUrl && (
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-broadred hover:text-broadred-dark transition-colors flex items-center gap-1.5 font-semibold"
          >
            <span>→</span>
            Wikipedia: full article
          </a>
        )}
        {articleUrl && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-broadred hover:text-broadred-dark transition-colors flex items-center gap-1.5 font-semibold"
          >
            <span>→</span>
            {articleDomain ? `Read on ${articleDomain}` : 'Read original article'}
          </a>
        )}
        {related.slice(0, 3).map((r, i) => (
          <a
            key={i}
            href={r.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-ink-light hover:text-ink transition-colors flex items-start gap-1.5"
          >
            <span className="text-ink-muted mt-0.5 shrink-0">→</span>
            <span>
              {r.title}
              {r.description && (
                <span className="text-ink-muted ml-1">— {r.description}</span>
              )}
            </span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-ink-faint mt-4 leading-relaxed">
        Wikipedia content licensed under{' '}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          CC BY-SA 4.0
        </a>
        . Data from{' '}
        <a
          href="https://www.wikidata.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Wikidata
        </a>{' '}
        (CC0). News powered by the{' '}
        <a
          href="https://www.gdeltproject.org"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          GDELT Project
        </a>
        .
      </p>
    </div>
  )
}
