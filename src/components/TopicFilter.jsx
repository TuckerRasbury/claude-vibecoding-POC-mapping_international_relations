/**
 * TopicFilter.jsx
 *
 * Horizontal pill bar for filtering the globe by news topic.
 * Selecting a topic triggers a fresh GDELT query via useGlobalActivity,
 * and the globe re-highlights relevant countries.
 *
 * Serves: Discovery + Orientation
 */

const TOPICS = [
  { label: 'All News',             value: null,                   icon: '🌐' },
  { label: 'Conflict & War',       value: 'Conflict & War',       icon: '⚔️' },
  { label: 'Elections',            value: 'Elections & Democracy', icon: '🗳️' },
  { label: 'Human Rights',         value: 'Human Rights',         icon: '✊' },
  { label: 'Climate',              value: 'Climate & Environment', icon: '🌿' },
  { label: 'Economics',            value: 'Economics & Trade',    icon: '📈' },
  { label: 'Public Health',        value: 'Public Health',        icon: '🏥' },
  { label: 'War Crimes',           value: 'War Crimes & Genocide', icon: '⚠️' },
]

export default function TopicFilter({ selected, onChange }) {
  return (
    <div className="w-full bg-[#080d1a] border-b border-[#111928] px-4 py-1.5 overflow-x-auto">
      <div className="flex gap-1.5 min-w-max">
        {TOPICS.map(topic => {
          const isActive = selected === topic.value
          return (
            <button
              key={topic.label}
              onClick={() => onChange(isActive ? null : topic.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                transition-all duration-150 whitespace-nowrap
                ${isActive
                  ? 'bg-amber-700/60 text-amber-200 border border-amber-600/60'
                  : 'bg-[#111928] text-slate-400 border border-[#1a2540] hover:text-slate-200 hover:border-slate-600'
                }
              `}
            >
              <span className="text-[11px]">{topic.icon}</span>
              {topic.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
