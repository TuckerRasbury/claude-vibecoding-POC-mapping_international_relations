/**
 * SearchBar.jsx
 *
 * Persistent search bar — always visible at the top of the app.
 * Serves the "investigator" user who arrives with a specific story or country in mind,
 * as opposed to the "explorer" who pokes around the globe.
 *
 * Inputs:
 *   - Free text keyword (e.g. "coup", "famine", "election")
 *   - Country autocomplete (populated from FIPS_TO_ISO country list)
 *   - Date range: Last 7 / 30 / 90 days / All time
 *   - Topic category (maps to GDELT themes — see useGdelt.js for mapping)
 *
 * Serves: Discovery + Curiosity
 */

import { useState } from 'react'
import { FIPS_TO_ISO } from '../../utils/countryCodeMap.js'

// Sorted country list for the datalist autocomplete
const COUNTRIES = Object.values(FIPS_TO_ISO)
  .map(({ name, iso3 }) => ({ name, iso3 }))
  .sort((a, b) => a.name.localeCompare(b.name))

// Lookup: "sudan" → "SDN"
const NAME_TO_ISO3 = Object.fromEntries(
  COUNTRIES.map(c => [c.name.toLowerCase(), c.iso3])
)

const DATE_RANGES = [
  { label: 'Last 7 days',  value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time',     value: 'all' },
]

const TOPICS = [
  { label: 'Any topic',                value: null },
  { label: 'Conflict & War',           value: 'Conflict & War' },
  { label: 'War Crimes & Genocide',    value: 'War Crimes & Genocide' },
  { label: 'Elections & Democracy',    value: 'Elections & Democracy' },
  { label: 'Economics & Trade',        value: 'Economics & Trade' },
  { label: 'Labor & Unions',           value: 'Labor & Unions' },
  { label: 'Industry & Corporate',     value: 'Industry & Corporate Power' },
  { label: 'Climate & Environment',    value: 'Climate & Environment' },
  { label: 'Human Rights',            value: 'Human Rights' },
  { label: 'Public Health',           value: 'Public Health' },
]

const SELECT_CLASS = `
  bg-[#111928] text-slate-400 text-xs px-2 py-1.5 rounded
  border border-[#1a2540] focus:outline-none focus:border-amber-700/50
  cursor-pointer
`.trim()

/**
 * @param {object} props
 * @param {function} props.onSearch  - Called with { keyword, countryName, countryIso3, dateRange, topicCategory }
 * @param {function} props.onClear   - Called when the user clears the search
 * @param {boolean}  props.isActive  - True when a search is currently active
 */
export default function SearchBar({ onSearch, onClear, isActive }) {
  const [keyword, setKeyword]           = useState('')
  const [countryInput, setCountryInput] = useState('')
  const [dateRange, setDateRange]       = useState('30d')
  const [topicCategory, setTopicCategory] = useState(null)

  // Resolve the typed country name to its ISO3 code (if it exactly matches a known country)
  const resolvedCountry = (() => {
    const trimmed = countryInput.trim()
    if (!trimmed) return null
    const iso3 = NAME_TO_ISO3[trimmed.toLowerCase()]
    return iso3 ? { name: trimmed, iso3 } : null
  })()

  function handleSubmit(e) {
    e.preventDefault()
    const hasInput = keyword.trim() || resolvedCountry || topicCategory
    if (!hasInput) return
    onSearch({
      keyword:       keyword.trim() || null,
      countryName:   resolvedCountry?.name ?? null,
      countryIso3:   resolvedCountry?.iso3 ?? null,
      dateRange,
      topicCategory,
    })
  }

  function handleClear() {
    setKeyword('')
    setCountryInput('')
    setDateRange('30d')
    setTopicCategory(null)
    onClear()
  }

  return (
    <div className="w-full bg-[#070c18] border-b border-[#111928] px-4 py-2">
      <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-center">

        {/* Keyword input */}
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder='Search stories… e.g. "coup", "famine", "election"'
          className="
            flex-1 min-w-[180px] bg-[#111928] text-slate-200 text-xs px-3 py-1.5 rounded
            border border-[#1a2540] placeholder-slate-600
            focus:outline-none focus:border-amber-700/50
          "
        />

        {/* Country autocomplete */}
        <div>
          <input
            type="text"
            value={countryInput}
            onChange={e => setCountryInput(e.target.value)}
            placeholder="Country"
            list="search-country-list"
            className="
              w-32 bg-[#111928] text-slate-200 text-xs px-3 py-1.5 rounded
              border border-[#1a2540] placeholder-slate-600
              focus:outline-none focus:border-amber-700/50
            "
          />
          <datalist id="search-country-list">
            {COUNTRIES.map(c => (
              <option key={c.iso3} value={c.name} />
            ))}
          </datalist>
        </div>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className={SELECT_CLASS}
        >
          {DATE_RANGES.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>

        {/* Topic */}
        <select
          value={topicCategory ?? ''}
          onChange={e => setTopicCategory(e.target.value || null)}
          className={SELECT_CLASS}
        >
          {TOPICS.map(t => (
            <option key={t.label} value={t.value ?? ''}>{t.label}</option>
          ))}
        </select>

        {/* Search button */}
        <button
          type="submit"
          className="
            px-4 py-1.5 text-xs font-semibold rounded
            bg-amber-700/50 hover:bg-amber-700/70
            text-amber-200 border border-amber-700/50
            transition-colors duration-150
          "
        >
          Search
        </button>

        {/* Clear — only shown when a search is active */}
        {isActive && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="Clear search"
          >
            ✕ Clear
          </button>
        )}
      </form>
    </div>
  )
}
