/**
 * useWikipedia.js
 *
 * Fetches Wikipedia article summaries for countries and topics.
 *
 * --- API NOTES ---
 * Base URL: https://en.wikipedia.org/api/rest_v1/
 * CORS: Enabled. Callable directly from the browser.
 * Rate limit: 200 req/s. Cache one fetch per country per session.
 * Attribution required: "Content from Wikipedia, licensed under CC BY-SA 4.0"
 *
 * Endpoints used:
 *   /page/summary/{title} — extract + thumbnail + URL
 *   /page/related/{title} — related articles for discovery links
 */

import { useState, useEffect } from 'react'

const WIKI_BASE = 'https://en.wikipedia.org/api/rest_v1'

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    // Cache valid for 1 hour
    if (Date.now() - ts < 60 * 60 * 1000) return data
  } catch {}
  return null
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

/**
 * Fetches a Wikipedia summary for a given title.
 * Returns a WikiSummary object or null.
 */
export async function fetchWikiSummary(title) {
  if (!title) return null
  const encoded = encodeURIComponent(title.replace(/ /g, '_'))
  const cacheKey = `wiki:summary:${encoded}`
  const cached = getCached(cacheKey)
  if (cached !== null) return cached

  try {
    const res = await fetch(`${WIKI_BASE}/page/summary/${encoded}`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return null
    const json = await res.json()

    const result = {
      title: json.title ?? title,
      extract: json.extract ?? null,
      // Trim to 3 sentences for the Historical Anchor
      extractShort: trimToSentences(json.extract, 3),
      thumbnail: json.thumbnail?.source ?? null,
      pageUrl: json.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
      attribution: 'Content from Wikipedia, licensed under CC BY-SA 4.0',
    }
    setCache(cacheKey, result)
    return result
  } catch {
    return null
  }
}

/**
 * Fetches related Wikipedia articles for discovery links.
 * Returns array of { title, description, pageUrl } — max 5.
 */
export async function fetchWikiRelated(title) {
  if (!title) return []
  const encoded = encodeURIComponent(title.replace(/ /g, '_'))
  const cacheKey = `wiki:related:${encoded}`
  const cached = getCached(cacheKey)
  if (cached !== null) return cached

  try {
    const res = await fetch(`${WIKI_BASE}/page/related/${encoded}`, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return []
    const json = await res.json()

    const results = (json.pages ?? []).slice(0, 5).map(p => ({
      title: p.title ?? '',
      description: p.description ?? '',
      pageUrl: p.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(p.title ?? '')}`,
    }))
    setCache(cacheKey, results)
    return results
  } catch {
    return []
  }
}

function trimToSentences(text, n) {
  if (!text) return null
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  return sentences.slice(0, n).join(' ').trim()
}

/**
 * Fetches the dedicated history article for a country.
 * Tries "History of {countryName}" first, falls back to "{countryName}" itself.
 * Returns a WikiSummary with the full extract (not trimmed to 3 sentences).
 *
 * @param {string} countryName - e.g. "Sudan"
 * @returns {WikiSummary|null}
 */
export async function fetchHistoryArticle(countryName) {
  if (!countryName) return null

  const candidates = [
    `History of ${countryName}`,
    `${countryName}`,
  ]

  for (const title of candidates) {
    const encoded = encodeURIComponent(title.replace(/ /g, '_'))
    const cacheKey = `wiki:history:${encoded}`
    const cached = getCached(cacheKey)
    if (cached !== null) return cached

    try {
      const res = await fetch(`${WIKI_BASE}/page/summary/${encoded}`, {
        headers: { 'Accept': 'application/json' },
      })
      if (!res.ok) continue
      const json = await res.json()
      // Skip disambiguation pages
      if (json.type === 'disambiguation') continue

      const result = {
        title: json.title ?? title,
        extract: json.extract ?? null,
        extractShort: trimToSentences(json.extract, 5),
        thumbnail: json.thumbnail?.source ?? null,
        pageUrl: json.content_urls?.desktop?.page ?? `https://en.wikipedia.org/wiki/${encoded}`,
        attribution: 'Content from Wikipedia, licensed under CC BY-SA 4.0',
      }
      setCache(cacheKey, result)
      return result
    } catch {
      continue
    }
  }
  return null
}

/**
 * React hook — fetches a Wikipedia summary reactively.
 * @param {string|null} title - Wikipedia article title
 */
export function useWikipedia(title) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!title) {
      setSummary(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchWikiSummary(title).then(result => {
      if (cancelled) return
      setSummary(result)
      setLoading(false)
    }).catch(err => {
      if (cancelled) return
      setError(err.message)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [title])

  return { summary, loading, error }
}
