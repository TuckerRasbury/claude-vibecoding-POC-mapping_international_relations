/**
 * useGdelt.js
 *
 * Fetches news stories from the GDELT Doc 2.0 API.
 *
 * --- GDELT API NOTES ---
 * Endpoint: https://api.gdeltproject.org/api/v2/doc/doc
 * Mode used: ArtList (returns article list with headline, URL, domain, date)
 * CORS: GDELT supports CORS for browser requests — no proxy needed.
 * Rate limits: No hard limit published. Cache aggressively. Don't call on every keystroke.
 * Caching: Results cached in sessionStorage keyed by query string.
 *
 * --- TOPIC CATEGORY → GDELT MAPPING ---
 * GDELT's GKG (Global Knowledge Graph) themes are used to filter by topic.
 * These are mapped to our user-facing categories below.
 *
 * | User Category            | GDELT GKG Themes / Keywords                          | Notes                          |
 * |--------------------------|------------------------------------------------------|--------------------------------|
 * | Conflict & War           | MILITARY, TAX_FNCACT_CONFLICT                        | Good coverage                  |
 * | War Crimes & Genocide    | GENOCIDE, WAR_CRIME, HUMAN_RIGHTS_ABUSES             | THIN — supplement w/ Wikipedia |
 * | Elections & Democracy    | ELECTIONS, DEMOCRACY                                 | Good coverage                  |
 * | Economics & Trade        | ECON_TRADE, ECON_CURRENCY                            | Good coverage                  |
 * | Labor & Unions           | LABOR_UNIONS, STRIKE                                 | MODERATE — may miss local news |
 * | Industry & Corporate     | BUSINESS, CORPORATE_POWER                            | Good coverage                  |
 * | Climate & Environment    | ENV_CLIMATECHANGE, ENV_DEFORESTATION                 | Good coverage                  |
 * | Human Rights             | HUMAN_RIGHTS, REFUGEES                               | Good coverage                  |
 * | Public Health            | HEALTH, PANDEMIC, DISEASE                            | Good coverage                  |
 *
 * ⚠ War Crimes & Genocide: GDELT's automated coding significantly undercounts these events.
 * This category should be supplemented with manually curated content in Phase 4C.
 */

import { useState, useEffect, useCallback } from 'react'
import { parseArtListResponse } from '../utils/gdeltParser.js'
import { fipsToIso3, FIPS_TO_ISO } from '../utils/countryCodeMap.js'

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc'

// Maps our user-facing topic categories to GDELT keyword/theme queries
const TOPIC_TO_GDELT_QUERY = {
  'Conflict & War': 'conflict war military attack',
  'War Crimes & Genocide': 'genocide "war crime" atrocity massacre',
  'Elections & Democracy': 'election democracy vote parliament',
  'Economics & Trade': 'economy trade sanctions tariff currency',
  'Labor & Unions': 'labor union strike workers protest',
  'Industry & Corporate Power': 'corporation industry corporate monopoly',
  'Climate & Environment': 'climate environment deforestation flood drought',
  'Human Rights': '"human rights" refugee displacement abuse',
  'Public Health': 'health pandemic disease epidemic',
}

// Countries treated as "dominant" in US coverage — used for featured story filtering
export const DOMINANT_COVERAGE_COUNTRIES = new Set([
  'USA', 'GBR', 'FRA', 'DEU', 'CHN', 'RUS', 'ISR',
])

const DATE_RANGE_MAP = {
  '7d': '7',
  '30d': '30',
  '90d': '90',
  'all': '365',
}

function buildQuery({ countryName, keyword, topicCategory }) {
  const parts = []
  if (countryName) parts.push(`"${countryName}"`)
  if (keyword) parts.push(keyword)
  if (topicCategory && TOPIC_TO_GDELT_QUERY[topicCategory]) {
    parts.push(TOPIC_TO_GDELT_QUERY[topicCategory])
  }
  return parts.join(' ') || 'world news'
}

function buildUrl({ countryName, keyword, topicCategory, dateRange, maxRecords }) {
  const query = buildQuery({ countryName, keyword, topicCategory })
  const timespan = DATE_RANGE_MAP[dateRange] ?? '30'
  const params = new URLSearchParams({
    query,
    mode: 'ArtList',
    maxrecords: String(maxRecords ?? 10),
    timespan: `${timespan}d`,
    format: 'json',
  })
  return `${GDELT_BASE}?${params.toString()}`
}

function getCached(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    // Cache valid for 15 minutes
    if (Date.now() - ts < 15 * 60 * 1000) return data
  } catch {}
  return null
}

function setCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

/**
 * Main hook. Fetches GDELT stories given filter parameters.
 *
 * @param {object} filters
 * @param {string} [filters.countryName]    - Display name of the country (e.g. "Sudan")
 * @param {string} [filters.countryIso3]    - ISO3 code of the country (for normalization)
 * @param {string} [filters.keyword]        - Free text keyword
 * @param {string} [filters.topicCategory]  - One of our user-facing category labels
 * @param {string} [filters.dateRange]      - '7d' | '30d' | '90d' | 'all'
 * @param {number} [filters.maxRecords]     - Max articles to return (default 10)
 * @param {boolean} [filters.enabled]       - Set false to skip fetching
 */
export function useGdelt(filters = {}) {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const {
    countryName,
    countryIso3,
    keyword,
    topicCategory,
    dateRange = '30d',
    maxRecords = 10,
    enabled = true,
  } = filters

  const fetchStories = useCallback(async () => {
    if (!enabled) return

    const url = buildUrl({ countryName, keyword, topicCategory, dateRange, maxRecords })
    const cacheKey = `gdelt:${url}`
    const cached = getCached(cacheKey)
    if (cached) {
      setStories(cached)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`GDELT returned ${res.status}`)
      const json = await res.json()
      const parsed = parseArtListResponse(json, countryIso3)
      setCache(cacheKey, parsed)
      setStories(parsed)
    } catch (err) {
      setError(err.message)
      setStories([])
    } finally {
      setLoading(false)
    }
  }, [countryName, countryIso3, keyword, topicCategory, dateRange, maxRecords, enabled])

  useEffect(() => {
    fetchStories()
  }, [fetchStories])

  return { stories, loading, error, refetch: fetchStories }
}

/**
 * Fetches a raw story list for a country — used by the map layer to calculate
 * story counts per country for visual encoding.
 *
 * Returns { iso3: count } map for the given list of country names.
 */
export async function fetchStoryCounts(countries) {
  const counts = {}
  await Promise.all(
    countries.map(async ({ name, iso3 }) => {
      const url = buildUrl({ countryName: name, dateRange: '30d', maxRecords: 50 })
      const cacheKey = `gdelt:counts:${iso3}`
      const cached = getCached(cacheKey)
      if (cached !== null) {
        counts[iso3] = cached
        return
      }
      try {
        const res = await fetch(url)
        if (!res.ok) return
        const json = await res.json()
        const n = json?.articles?.length ?? 0
        counts[iso3] = n
        setCache(cacheKey, n)
      } catch {
        counts[iso3] = 0
      }
    })
  )
  return counts
}

/**
 * Fetches the featured story: most recent article from an underrepresented country.
 * Underrepresented = not in DOMINANT_COVERAGE_COUNTRIES.
 *
 * Tries a broad query, then walks the results to find the first story
 * whose source country is not in the dominant set.
 */
export async function fetchFeaturedStory() {
  const cacheKey = 'gdelt:featured'
  const cached = getCached(cacheKey)
  if (cached) return cached

  const url = buildUrl({
    keyword: 'conflict crisis election protest',
    dateRange: '7d',
    maxRecords: 50,
  })

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`GDELT returned ${res.status}`)
    const json = await res.json()
    const articles = json?.articles ?? []

    // Walk articles and pick first one from a non-dominant country
    for (const article of articles) {
      const srcCountry = article.sourcecountry ?? ''
      const srcIso3 = srcCountry
        ? (Object.values(FIPS_TO_ISO)
            .find(v => v.name.toLowerCase() === srcCountry.toLowerCase())?.iso3 ?? null)
        : null

      if (!srcIso3 || !DOMINANT_COVERAGE_COUNTRIES.has(srcIso3)) {
        const story = {
          headline: article.title ?? '(No title)',
          source: article.domain ?? 'Unknown',
          sourceCountry: article.sourcecountry ?? 'Unknown',
          sourceCountryIso3: srcIso3,
          date: article.seendate ?? null,
          url: article.url ?? null,
          imageUrl: article.socialimage ?? null,
        }
        setCache(cacheKey, story)
        return story
      }
    }
  } catch (err) {
    console.error('fetchFeaturedStory failed:', err)
  }
  return null
}
