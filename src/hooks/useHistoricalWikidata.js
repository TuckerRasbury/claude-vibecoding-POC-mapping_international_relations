/**
 * useHistoricalWikidata.js
 *
 * Fetches key historical events for a country from Wikidata via SPARQL.
 *
 * Strategy:
 *   - Query for armed conflicts, wars, revolutions, and coups where the
 *     country is a participant (P710) or the event occurred in the country (P17).
 *   - Also fetch the country's independence event specifically (P independence = P625/P571).
 *   - Results are ordered by start date (oldest → newest) and capped at 10.
 *
 * Data quality note:
 *   Wikidata coverage varies significantly by country. Well-documented countries
 *   (Ukraine, Sudan, Iran, etc.) will return rich timelines. Smaller or less-edited
 *   countries may return few or no results — fall back to the Wikipedia history
 *   article in that case (handled in HistoryTab.jsx).
 *
 * Caching: sessionStorage, 24-hour TTL (historical data doesn't change).
 *
 * Attribution: "Data from Wikidata, licensed under CC0."
 *
 * Serves: Orientation + Connection
 */

import { useState, useEffect } from 'react'

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

// Wikidata entity IDs for broad event categories
// Q180684 = armed conflict, Q198 = war, Q10931 = revolution, Q45382 = coup d'état
// Q1570 = independence, Q1069572 = famine
const EVENT_TYPES = ['Q180684', 'Q198', 'Q10931', 'Q45382', 'Q1570', 'Q1069572']

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < 24 * 60 * 60 * 1000) return data
  } catch {}
  return null
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

/**
 * Builds the SPARQL query.
 * Uses UNION to catch both participant (P710) and location (P17) relations.
 * Filters to a specific set of event types to avoid noise.
 */
function buildHistoricalEventsQuery(wikidataId) {
  const typeFilter = EVENT_TYPES.map(t => `wd:${t}`).join(', ')
  return `
SELECT DISTINCT ?event ?eventLabel ?date ?endDate ?deaths ?typeLabel WHERE {
  {
    ?event wdt:P710 wd:${wikidataId} .
  } UNION {
    ?event wdt:P17 wd:${wikidataId} .
  }
  ?event wdt:P31/wdt:P279* ?type .
  FILTER(?type IN (${typeFilter}))
  OPTIONAL { ?event wdt:P580 ?date . }
  OPTIONAL { ?event wdt:P582 ?endDate . }
  OPTIONAL { ?event wdt:P1120 ?deaths . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
ORDER BY ?date
LIMIT 12
`.trim()
}

/**
 * Formats a Wikidata date string (ISO 8601) into a readable year or year range.
 * e.g. "1983-00-00T00:00:00Z" → "1983"
 *      start "1955" + end "1975" → "1955–1975"
 */
export function formatHistoricalDate(startRaw, endRaw) {
  function extractYear(raw) {
    if (!raw) return null
    const m = raw.match(/^[+-]?(\d{4})/)
    return m ? m[1] : null
  }
  const start = extractYear(startRaw)
  const end = extractYear(endRaw)
  if (!start) return null
  if (!end || end === start) return start
  return `${start}–${end}`
}

/**
 * Fetches historical events for a country given its Wikidata entity ID.
 * @param {string} wikidataId - e.g. "Q1049" (Sudan)
 * @returns {HistoricalEvent[]}
 *   Each event: { label, date, endDate, dateDisplay, deaths }
 */
export async function fetchHistoricalEvents(wikidataId) {
  if (!wikidataId) return []
  const cacheKey = `wikidata:history:${wikidataId}`
  const cached = getCached(cacheKey)
  if (cached !== null) return cached

  const query = buildHistoricalEventsQuery(wikidataId)
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' },
    })
    if (!res.ok) throw new Error(`Wikidata returned ${res.status}`)
    const json = await res.json()
    const bindings = json?.results?.bindings ?? []

    // Deduplicate by event URL (UNION can produce duplicates)
    const seen = new Set()
    const events = []
    for (const b of bindings) {
      const eventUrl = b.event?.value
      if (!eventUrl || seen.has(eventUrl)) continue
      seen.add(eventUrl)

      const startRaw = b.date?.value ?? null
      const endRaw = b.endDate?.value ?? null

      events.push({
        label: b.eventLabel?.value ?? '(unnamed event)',
        date: startRaw,
        endDate: endRaw,
        dateDisplay: formatHistoricalDate(startRaw, endRaw),
        deaths: b.deaths?.value ? parseInt(b.deaths.value, 10) : null,
        wikidataUrl: eventUrl,
      })
    }

    setCache(cacheKey, events)
    return events
  } catch (err) {
    console.error(`fetchHistoricalEvents(${wikidataId}) failed:`, err)
    return []
  }
}

/**
 * React hook — fetches historical events reactively given a Wikidata ID.
 * @param {string|null} wikidataId
 */
export function useHistoricalWikidata(wikidataId) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!wikidataId) {
      setEvents([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchHistoricalEvents(wikidataId).then(result => {
      if (cancelled) return
      setEvents(result)
      setLoading(false)
    }).catch(err => {
      if (cancelled) return
      setError(err.message)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [wikidataId])

  return { events, loading, error }
}
