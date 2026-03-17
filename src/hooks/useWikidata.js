/**
 * useWikidata.js
 *
 * Fetches structured country facts from Wikidata via SPARQL.
 *
 * --- API NOTES ---
 * Endpoint: https://query.wikidata.org/sparql
 * Format: JSON (?format=json)
 * CORS: Enabled. Callable directly from the browser.
 * Rate limit: No hard limit. Cache results per country per session.
 * Attribution: "Data from Wikidata, licensed under CC0."
 *
 * Returns a CountryContext object:
 *   { name, iso2, iso3, capital, population, region, wikidataId }
 */

import { useState, useEffect } from 'react'

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql'

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    // Cache valid for 24 hours — country facts don't change often
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
 * Builds a SPARQL query to fetch basic country facts by ISO alpha-2 code.
 */
function buildCountryQuery(iso2) {
  return `
SELECT ?country ?countryLabel ?capital ?capitalLabel ?population ?continentLabel ?iso2 ?iso3
WHERE {
  ?country wdt:P297 "${iso2}" .
  OPTIONAL { ?country wdt:P36 ?capital . }
  OPTIONAL { ?country wdt:P1082 ?population . }
  OPTIONAL { ?country wdt:P30 ?continent . }
  OPTIONAL { ?country wdt:P297 ?iso2 . }
  OPTIONAL { ?country wdt:P298 ?iso3 . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" . }
}
LIMIT 1
`.trim()
}

/**
 * Fetches country facts from Wikidata.
 * @param {string} iso2 - ISO 3166-1 alpha-2 code (e.g. "SD" for Sudan)
 * @returns {CountryContext|null}
 */
export async function fetchCountryContext(iso2) {
  if (!iso2) return null
  const cacheKey = `wikidata:country:${iso2}`
  const cached = getCached(cacheKey)
  if (cached !== null) return cached

  const query = buildCountryQuery(iso2.toUpperCase())
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`

  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/sparql-results+json' },
    })
    if (!res.ok) throw new Error(`Wikidata returned ${res.status}`)
    const json = await res.json()
    const bindings = json?.results?.bindings ?? []
    if (bindings.length === 0) return null

    const b = bindings[0]
    const result = {
      name: b.countryLabel?.value ?? null,
      iso2: b.iso2?.value ?? iso2,
      iso3: b.iso3?.value ?? null,
      capital: b.capitalLabel?.value ?? null,
      population: b.population?.value ? parseInt(b.population.value, 10) : null,
      region: b.continentLabel?.value ?? null,
      wikidataId: b.country?.value?.split('/').pop() ?? null,
      attribution: 'Data from Wikidata, licensed under CC0.',
    }
    setCache(cacheKey, result)
    return result
  } catch (err) {
    console.error(`fetchCountryContext(${iso2}) failed:`, err)
    return null
  }
}

/**
 * React hook — fetches Wikidata country context reactively.
 * @param {string|null} iso2 - ISO alpha-2 country code
 */
export function useWikidata(iso2) {
  const [context, setContext] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!iso2) {
      setContext(null)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchCountryContext(iso2).then(result => {
      if (cancelled) return
      setContext(result)
      setLoading(false)
    }).catch(err => {
      if (cancelled) return
      setError(err.message)
      setLoading(false)
    })

    return () => { cancelled = true }
  }, [iso2])

  return { context, loading, error }
}
