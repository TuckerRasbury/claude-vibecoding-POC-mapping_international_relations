/**
 * useHistoricalTheme.js
 *
 * Static definitions for the eight Historian Mode themes.
 * Each theme has a curated ISO3 country list, a Wikipedia article title for
 * the theme intro, and display metadata.
 *
 * Country lists are curated rather than SPARQL-queried because:
 *   - Historical facts don't change — curation is correct here
 *   - SPARQL queries for broad themes return inconsistent/incomplete results
 *   - Static lists load instantly with no network round-trip
 *
 * Wikipedia summaries for each theme ARE fetched live from Wikipedia REST API
 * via fetchWikiSummary (imported from useWikipedia.js).
 *
 * Serves: Discovery + Orientation + Connection
 */

import { useState, useEffect } from 'react'
import { fetchWikiSummary } from './useWikipedia.js'

// ─── Theme definitions ────────────────────────────────────────────────────────

export const HISTORICAL_THEMES = [
  {
    id: 'colonialism',
    label: 'Colonialism',
    icon: '⛓',
    description: 'Countries that experienced European colonial rule',
    wikiTitle: 'Colonialism',
    // Africa, Asia, Americas, Pacific — vast majority of the Global South
    countries: new Set([
      // Africa
      'DZA','AGO','BEN','BWA','BFA','BDI','CMR','CAF','TCD','COD','COG','CIV',
      'DJI','GNQ','ERI','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY',
      'MDG','MWI','MLI','MRT','MUS','MOZ','NAM','NER','NGA','RWA','SEN','SLE',
      'SOM','ZAF','SSD','SDN','SWZ','TZA','TGO','TUN','UGA','ZMB','ZWE',
      // Asia & Middle East
      'AFG','BGD','BRN','KHM','IND','IDN','IRQ','JOR','KWT','LAO','LBN','MYS',
      'MDV','MMR','NPL','PAK','PHL','QAT','SGP','LKA','SYR','TLS','VNM','YEM',
      // Americas
      'ARG','BLZ','BOL','BRA','CHL','COL','CRI','CUB','DOM','ECU','SLV','GTM',
      'GUY','HTI','HND','JAM','MEX','NIC','PAN','PRY','PER','TTO','URY','VEN',
      // Pacific
      'FJI','KIR','MHL','FSM','NRU','PNG','WSM','SLB','TON','TUV','VUT',
    ]),
  },
  {
    id: 'cold-war',
    label: 'Cold War',
    icon: '☢',
    description: 'Proxy conflicts and superpower competition (1947–1991)',
    wikiTitle: 'Cold War',
    countries: new Set([
      // Southeast Asia (hot wars)
      'VNM','LAO','KHM','KOR','PRK',
      // Latin America (interventions & coups)
      'CUB','NIC','SLV','GTM','GRD','PAN','CHL','BRA','ARG','URY','BOL',
      'GUY','HTI','DOM','HND','JAM','PER','ECU','COL','VEN','PRY','MEX',
      // Africa (proxy wars)
      'AGO','MOZ','ETH','SDN','COD','MDG','MZB','ZWE','NAM','ZMB','SOM',
      // Middle East (interventions & wars)
      'AFG','IRN','IRQ','EGY','SYR','LBN','YEM','LBY','TUN',
      // Europe (frontline & occupied)
      'DEU','AUT','GRC','TUR','POL','CZE','HUN','ROU','BGR','YUG','ALB',
      // Central Asia / Caucasus
      'KAZ','UZB','TKM','TJK','KGZ','AZE','ARM','GEO',
    ]),
  },
  {
    id: 'genocide',
    label: 'Genocide & Atrocity',
    icon: '⚠',
    description: 'Countries where mass killings and ethnic cleansing occurred',
    wikiTitle: 'Genocide',
    countries: new Set([
      'DEU','POL','RWA','KHM','TUR','ARM','BIH','SDN','SSD','ETH','CHN',
      'UGA','IDN','BGD','IRQ','SYR','MMR','COD','NGA','ZWE','BLR','UKR',
      'LKA','GTM','BDI','SOM','NAM','TZA','BRA','USA','AUS','CAN',
    ]),
  },
  {
    id: 'slave-trade',
    label: 'Slave Trade',
    icon: '⚓',
    description: 'Countries central to the transatlantic and Indian Ocean slave trades',
    wikiTitle: 'Atlantic slave trade',
    countries: new Set([
      // West Africa (source)
      'SEN','GMB','GNB','GIN','SLE','LBR','CIV','GHA','TGO','BEN','NGA',
      'CMR','GAB','COG','COD','AGO','MOZ','MDG','TZA','KEN','MZB',
      // East Africa (Indian Ocean trade)
      'TZA','KEN','SOM','ETH','ERI','YEM','OMN',
      // Americas (destination)
      'USA','BRA','HTI','JAM','CUB','DOM','BRB','TTO','GUY','SUR','PAN',
      'COL','VEN','MEX','BLZ','PER','ECU',
      // Colonial powers (perpetrators)
      'GBR','PRT','ESP','FRA','NLD','DNK','SWE','BEL',
    ]),
  },
  {
    id: 'revolution',
    label: 'Revolution & Coup',
    icon: '✊',
    description: '20th and 21st century revolutions, military coups, and uprisings',
    wikiTitle: 'Revolution',
    countries: new Set([
      // Famous revolutions
      'FRA','RUS','CHN','CUB','IRN','MEX','USA',
      // Africa (coups & uprisings)
      'BFA','MLI','NGA','SDN','EGY','LBY','TUN','DZA','ETH','GHA','GIN',
      'TGO','CMR','COD','SOM','UGA','ZWE','SLE','LBR','CAF','MDG','BDI',
      // Asia
      'AFG','BGD','PAK','THA','PHL','IDN','PRK','VNM','KHM','LAO','MMR',
      // Middle East
      'SYR','IRQ','YEM','JOR','LBN','IRN','TUR',
      // Americas
      'GRD','PAN','HTI','NIC','CHL','ARG','BOL','BRA','URY','PRY','GTM',
      // Europe
      'ROU','HUN','CZE','POL','YUG','ALB','BGR',
    ]),
  },
  {
    id: 'nuclear',
    label: 'Nuclear Age',
    icon: '☢',
    description: 'Weapons programs, testing sites, and nuclear crises',
    wikiTitle: 'Nuclear weapons',
    countries: new Set([
      // Confirmed nuclear states
      'USA','RUS','CHN','GBR','FRA','IND','PAK','ISR','PRK',
      // Former Soviet states (inherited & dismantled)
      'UKR','BLR','KAZ',
      // Former programs (abandoned)
      'ZAF','LBY','IRQ','IRN','SWE','CHE','ARG','BRA','EGY','SYR',
      // Testing impacted territories
      'KAZ','MHL','AUS','DZA','FSM','KIR','TUV','PLW',
      // Crisis flashpoints
      'CUB','KOR','TWN','VNM',
    ]),
  },
  {
    id: 'famine',
    label: 'Famine',
    icon: '🌾',
    description: 'Countries struck by major historical famines and food crises',
    wikiTitle: 'Famine',
    countries: new Set([
      // Europe
      'IRL','UKR','BLR','POL','GRC','NLD','FIN',
      // Soviet Union successor states
      'RUS','KAZ','UZB',
      // South Asia
      'IND','BGD','PAK','AFG',
      // East Asia
      'CHN','PRK','VNM','KHM',
      // Africa
      'ETH','ERI','SOM','SDN','SSD','NGA','NER','MLI','BFA','TCD','CAF',
      'MOZ','ZWE','MDG','KEN','TZA','MWI','ZMB','UGA',
      // Middle East
      'YEM','SYR','IRQ','LBN',
      // Americas
      'HTI','VEN',
    ]),
  },
  {
    id: 'refugee',
    label: 'Refugee Crisis',
    icon: '🚶',
    description: 'Major sources and hosts of refugee and displaced populations',
    wikiTitle: 'Refugee',
    countries: new Set([
      // Major source countries (conflict & persecution)
      'SYR','AFG','SDN','SSD','MMR','SOM','COD','ERI','ETH','IRQ',
      'VEN','COL','UKR','PAK','NGA','MLI','CAF','BDI','GTM','HND',
      'SLV','LBY','YEM','IRN','PRK',
      // Major host countries
      'TUR','PAK','UGA','DEU','IRN','ETH','BGD','JOR','LBN','KEN',
      'SDN','TZA','EGY','IND','USA','SWE','FRA','GBR','GRC','AUT',
    ]),
  },
  {
    id: 'unions',
    label: 'Labor & Unions',
    icon: '✊',
    description: 'Countries with defining labor movements, general strikes, and workers\' rights history',
    wikiTitle: 'Labour movement',
    countries: new Set([
      // Birthplaces of organized labor
      'GBR',  // Chartism, General Strike 1926, TUC
      'USA',  // Haymarket Affair, IWW, AFL-CIO, UAW
      'FRA',  // CGT, May '68, long tradition of syndicalism
      'DEU',  // First modern trade unions, Weimar labor law, IG Metall
      'AUS',  // 8-hour day movement (1856), strong union tradition
      'NZL',  // Waterfront strike 1951, early labor protections
      // Scandinavia — codetermination models
      'SWE','NOR','DNK','FIN',
      // Continental Europe
      'ITA',  // Hot Autumn 1969, CGIL, anarcho-syndicalist roots
      'ESP',  // CNT, anarcho-syndicalism, Franco's union suppression
      'BEL','NLD','CHE','AUT',
      // Eastern Europe — union as resistance
      'POL',  // Solidarność (Solidarity) — landmark in Cold War and labor history
      'HUN',  // 1956 workers' councils
      'CZE',  // Prague Spring had strong labor components
      'ROU',  // Jiu Valley miners' strikes
      'RUS',  // Bolshevism, early Soviet labor, 1905 general strike
      // Latin America
      'BRA',  // CUT, PT origins in ABC steelworkers' union (Lula)
      'ARG',  // CGT, Peronism, repeated union clashes
      'CHL',  // Copper miners, brutal Pinochet union suppression
      'BOL',  // Tin miners (FSTMB), COB federation
      'MEX',  // CTM, Zapatista adjacent labor struggles
      'COL',  // Banana plantation strikes (United Fruit), ongoing assassinations of unionists
      // Asia
      'IND',  // AITUC, textile workers, tea plantation workers
      'KOR',  // KCTU, democracy movement driven by labor
      'BGD',  // Garment workers, Rana Plaza disaster
      'JPN',  // Sohyo federation, postwar labor law
      'CHN',  // Early labor history, 1920s general strikes; contemporary suppression
      'PHL',  // KMU, labor export economy
      // Africa
      'ZAF',  // COSATU, NUM — central to the anti-apartheid movement
      'NGA',  // NLC, oil workers' strikes
      'GHA',  // Ghana TUC, Nkrumah-era labor politics
      'ETH',  // CETU under Derg, subsequent suppression
      // Middle East & North Africa
      'EGY',  // Textile workers, Mahalla, role in Arab Spring
      'TUN',  // UGTT — only surviving civil society institution after revolution
      'IRN',  // Oil workers' strike (1978–79) triggered the Islamic Revolution
      // Canada
      'CAN',  // Winnipeg General Strike 1919, auto workers, CAW
    ]),
  },
]

// Quick lookup by id
export const THEME_BY_ID = Object.fromEntries(
  HISTORICAL_THEMES.map(t => [t.id, t])
)

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * React hook — fetches the Wikipedia intro for the selected historical theme.
 *
 * @param {string|null} themeId - one of the theme ids above, or null
 * @returns {{ theme, wikiSummary, loading }}
 */
export function useHistoricalTheme(themeId) {
  const [wikiSummary, setWikiSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const theme = themeId ? THEME_BY_ID[themeId] ?? null : null

  useEffect(() => {
    if (!theme) { setWikiSummary(null); return }
    let cancelled = false
    setLoading(true)
    fetchWikiSummary(theme.wikiTitle).then(result => {
      if (cancelled) return
      setWikiSummary(result)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [theme?.id])

  return { theme, wikiSummary, loading }
}
