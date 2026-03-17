/**
 * useGlobalActivity.js
 *
 * Single GDELT query that returns a Set<iso3> of countries with recent news activity.
 *
 * One request on mount (and whenever topicCategory changes), cached 30 min.
 * Uses sourcecountry field from GDELT ArtList results to determine active countries.
 *
 * @param {string|null} topicCategory  - Optional topic filter (must match TOPIC_TO_GDELT_QUERY keys)
 *
 * Serves: Discovery — the globe lights up where news is happening.
 */

import { useState, useEffect } from 'react'
import { FIPS_TO_ISO } from '../utils/countryCodeMap.js'

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc'
const CACHE_TTL  = 30 * 60 * 1000 // 30 minutes

// Build a lookup: country name (lowercase) → iso3
const NAME_TO_ISO3 = {}
for (const v of Object.values(FIPS_TO_ISO)) {
  if (v.name && v.iso3) {
    NAME_TO_ISO3[v.name.toLowerCase()] = v.iso3
  }
}

// Topic → GDELT keyword query (mirrors TOPIC_TO_GDELT_QUERY in useGdelt.js)
const TOPIC_QUERIES = {
  'Conflict & War':         'conflict war military attack',
  'War Crimes & Genocide':  'genocide "war crime" atrocity massacre',
  'Elections & Democracy':  'election democracy vote parliament',
  'Economics & Trade':      'economy trade sanctions tariff currency',
  'Climate & Environment':  'climate environment deforestation flood drought',
  'Human Rights':           '"human rights" refugee displacement abuse',
  'Public Health':          'health pandemic disease epidemic',
}

const DEFAULT_QUERY = 'conflict crisis election protest war humanitarian disaster'

function cacheKey(topic) {
  return `gdelt:global-activity:${topic ?? 'all'}`
}

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
  } catch {}
  return null
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function useGlobalActivity(topicCategory = null) {
  const [activeCountries, setActiveCountries] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const key = cacheKey(topicCategory)
    const cached = getCached(key)
    if (cached) {
      setActiveCountries(new Set(cached))
      setLoading(false)
      return
    }

    setLoading(true)
    const query = (topicCategory && TOPIC_QUERIES[topicCategory])
      ? TOPIC_QUERIES[topicCategory]
      : DEFAULT_QUERY

    const params = new URLSearchParams({
      query,
      mode: 'ArtList',
      maxrecords: '100',
      timespan: '14d',
      format: 'json',
    })

    fetch(`${GDELT_BASE}?${params}`)
      .then(r => r.json())
      .then(json => {
        const articles = json?.articles ?? []
        const iso3Set = new Set()
        for (const article of articles) {
          const src = (article.sourcecountry ?? '').toLowerCase().trim()
          if (src && NAME_TO_ISO3[src]) {
            iso3Set.add(NAME_TO_ISO3[src])
          }
        }
        const arr = [...iso3Set]
        setCache(key, arr)
        setActiveCountries(iso3Set)
      })
      .catch(err => console.warn('useGlobalActivity: GDELT fetch failed', err))
      .finally(() => setLoading(false))
  }, [topicCategory])

  return { activeCountries, loading }
}
