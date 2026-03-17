/**
 * useGlobalActivity.js
 *
 * Single GDELT query that returns a Set<iso3> of countries with recent news activity.
 *
 * One request on mount, cached 30 minutes in sessionStorage.
 * Uses sourcecountry field from GDELT ArtList results to determine active countries.
 *
 * Serves: Discovery — the globe lights up where news is happening.
 */

import { useState, useEffect } from 'react'
import { FIPS_TO_ISO } from '../utils/countryCodeMap.js'

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc'
const CACHE_KEY  = 'gdelt:global-activity'
const CACHE_TTL  = 30 * 60 * 1000 // 30 minutes

// Build a lookup: country name (lowercase) → iso3
const NAME_TO_ISO3 = {}
for (const v of Object.values(FIPS_TO_ISO)) {
  if (v.name && v.iso3) {
    NAME_TO_ISO3[v.name.toLowerCase()] = v.iso3
  }
}

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts < CACHE_TTL) return data
  } catch {}
  return null
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

export function useGlobalActivity() {
  const [activeCountries, setActiveCountries] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const cached = getCached()
    if (cached) {
      setActiveCountries(new Set(cached))
      setLoading(false)
      return
    }

    const params = new URLSearchParams({
      query: 'conflict crisis election protest war humanitarian disaster',
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
        setCache(arr)
        setActiveCountries(iso3Set)
      })
      .catch(err => console.warn('useGlobalActivity: GDELT fetch failed', err))
      .finally(() => setLoading(false))
  }, [])

  return { activeCountries, loading }
}
