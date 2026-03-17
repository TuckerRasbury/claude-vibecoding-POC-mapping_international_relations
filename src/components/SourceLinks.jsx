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
    <div className="mt-4 pt-4 border-t border-[#1a2540]">
      <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">
        Go deeper
      </p>
      <div className="flex flex-col gap-1.5">
        {wikiUrl && (
          <a
            href={wikiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-500 hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <span className="text-slate-600">→</span>
            Wikipedia: full article
          </a>
        )}
        {articleUrl && (
          <a
            href={articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-amber-500 hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <span className="text-slate-600">→</span>
            {articleDomain ? `Read on ${articleDomain}` : 'Read original article'}
          </a>
        )}
        {related.slice(0, 3).map((r, i) => (
          <a
            key={i}
            href={r.pageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-start gap-1.5"
          >
            <span className="text-slate-600 mt-0.5 shrink-0">→</span>
            <span>
              {r.title}
              {r.description && (
                <span className="text-slate-600 ml-1">— {r.description}</span>
              )}
            </span>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-slate-700 mt-3 leading-relaxed">
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
