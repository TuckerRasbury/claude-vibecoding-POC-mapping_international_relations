/**
 * gdeltParser.js
 *
 * Normalizes raw GDELT API responses into our NewsStory data model.
 *
 * GDELT Doc 2.0 API (ArtList mode) returns JSON like:
 * {
 *   articles: [
 *     {
 *       url: "...",
 *       url_mobile: "...",
 *       title: "...",
 *       seendate: "20240315T120000Z",
 *       socialimage: "...",
 *       domain: "bbc.co.uk",
 *       language: "English",
 *       sourcecountry: "United Kingdom"
 *     }
 *   ]
 * }
 *
 * GDELT does NOT return per-article country codes in ArtList mode.
 * Country association comes from the query itself (we filter by country name/code).
 * The sourcecountry field tells us WHERE the article was published, not what it's about.
 */

import { NAME_TO_ISO3 } from './countryCodeMap.js'

/**
 * Parse a GDELT seendate string into a JS Date.
 * Format: "20240315T120000Z" or "20240315120000"
 */
export function parseGdeltDate(seendate) {
  if (!seendate) return null
  // Normalize to ISO 8601
  const cleaned = seendate.replace(/(\d{8})T?(\d{6})Z?/, '$1T$2Z')
  const d = new Date(cleaned)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Normalize a single GDELT article object into a NewsStory.
 * @param {object} article - Raw GDELT article
 * @param {string} queriedCountryIso3 - ISO3 code of the country we queried for
 * @returns {NewsStory}
 */
export function normalizeArticle(article, queriedCountryIso3 = null) {
  const sourceIso3 = article.sourcecountry
    ? NAME_TO_ISO3[article.sourcecountry.toLowerCase()] ?? null
    : null

  return {
    headline: article.title ?? '(No title)',
    source: article.domain ?? article.sourcecountry ?? 'Unknown source',
    sourceCountryIso3: sourceIso3,
    countryIso3: queriedCountryIso3,
    date: parseGdeltDate(article.seendate),
    url: article.url ?? null,
    imageUrl: article.socialimage ?? null,
    language: article.language ?? 'English',
    toneScore: null, // ArtList mode doesn't return tone; available in other GDELT modes
  }
}

/**
 * Parse a full GDELT ArtList response.
 * @param {object} response - Parsed JSON from GDELT API
 * @param {string} queriedCountryIso3 - ISO3 of the queried country
 * @returns {NewsStory[]}
 */
export function parseArtListResponse(response, queriedCountryIso3 = null) {
  if (!response?.articles || !Array.isArray(response.articles)) return []
  return response.articles.map(a => normalizeArticle(a, queriedCountryIso3))
}
