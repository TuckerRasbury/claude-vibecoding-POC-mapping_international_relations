import { useState } from 'react'

// Phase 1: Data layer scaffold — UI wired up in Phase 2
function App() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-slate-200 flex items-center justify-center">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-3xl font-serif text-amber-400 mb-4">Curiosity Engine</h1>
        <p className="text-slate-400 text-sm leading-relaxed">
          An interactive map for curious Americans exploring international news,
          conflict, and history for the first time.
        </p>
        <p className="text-slate-600 text-xs mt-6">Phase 1 — Data layer building…</p>
      </div>
    </div>
  )
}

export default App
