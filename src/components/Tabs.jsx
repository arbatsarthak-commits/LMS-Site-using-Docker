import React from 'react'

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabsRow" role="tablist" aria-label="Tabs">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          className={`tab ${active === t.id ? 'tabActive' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

