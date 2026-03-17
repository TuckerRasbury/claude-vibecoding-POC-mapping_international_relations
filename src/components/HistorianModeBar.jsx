/**
 * HistorianModeBar.jsx
 *
 * Two-part bar rendered below TopicFilter.
 *
 * When historianMode=false: shows a single "📜 Historian Mode" toggle pill.
 * When historianMode=true:  shows the toggle (now active/highlighted) +
 *                           a row of eight historical theme pills.
 *
 * Selecting a theme calls onThemeSelect(themeId). Selecting the same theme
 * again deselects it (onThemeSelect(null)). Turning the mode off clears
 * the active theme.
 *
 * Serves: Discovery + Orientation + Connection
 */

import { HISTORICAL_THEMES } from '../hooks/useHistoricalTheme.js'

/**
 * @param {object}      props
 * @param {boolean}     props.historianMode        - true when historian mode is active
 * @param {string|null} props.selectedTheme        - id of the active theme or null
 * @param {function}    props.onToggleHistorianMode - flip historian mode on/off
 * @param {function}    props.onThemeSelect        - called with themeId or null
 */
export default function HistorianModeBar({
  historianMode,
  selectedTheme,
  onToggleHistorianMode,
  onThemeSelect,
}) {
  return (
    <div
      className={`
        w-full border-b transition-colors duration-200
        ${historianMode
          ? 'bg-[#0d0e1c] border-amber-900/30'
          : 'bg-[#080d1a] border-[#111928]'
        }
      `}
    >
      <div className="px-4 py-1.5 flex flex-wrap items-center gap-2 overflow-x-auto">

        {/* Toggle button */}
        <button
          onClick={onToggleHistorianMode}
          className={`
            flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
            transition-all duration-150 whitespace-nowrap shrink-0
            ${historianMode
              ? 'bg-amber-900/50 text-amber-300 border border-amber-700/60'
              : 'bg-[#111928] text-slate-500 border border-[#1a2540] hover:text-slate-300 hover:border-slate-600'
            }
          `}
          aria-pressed={historianMode}
        >
          <span>📜</span>
          Historian Mode
          {historianMode && (
            <span className="ml-1 text-amber-600/80 font-normal text-[10px]">ON</span>
          )}
        </button>

        {/* Theme pills — only when mode is active */}
        {historianMode && (
          <>
            <div className="w-px h-4 bg-[#1a2540] shrink-0" aria-hidden="true" />
            {HISTORICAL_THEMES.map(theme => {
              const isActive = selectedTheme === theme.id
              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeSelect(isActive ? null : theme.id)}
                  title={theme.description}
                  className={`
                    flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                    transition-all duration-150 whitespace-nowrap
                    ${isActive
                      ? 'bg-amber-800/60 text-amber-200 border border-amber-600/70'
                      : 'bg-[#111928] text-slate-400 border border-[#1a2540] hover:text-slate-200 hover:border-amber-900/50'
                    }
                  `}
                  aria-pressed={isActive}
                >
                  <span className="text-[11px]">{theme.icon}</span>
                  {theme.label}
                </button>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
