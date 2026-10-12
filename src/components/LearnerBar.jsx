import React from 'react'

export function SoundToggle({ muted, onToggle }) {
  return (
    <button className="icon-btn" onClick={onToggle} aria-pressed={!muted} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title={muted ? 'Sound off' : 'Sound on'}>
      {muted ? (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" /><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      )}
    </button>
  )
}

const TABS = [
  { id: 'today', label: 'Today' },
  { id: 'skills', label: 'All skills' },
  { id: 'plan', label: 'Grown-ups' },
]

export function LearnerBar({ learner, stars, tab, onTab, onSwitch, muted, onMute }) {
  return (
    <header className="lbar">
      <div className="lbar__row">
        <button className="who-chip" onClick={onSwitch} aria-label="Switch learner">
          <span className={`avatar avatar--sm tone-${learner.tone}`}>{learner.avatar}</span>
          <span className="who-chip__name">{learner.name}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <span className="stars-chip" aria-label={`${stars} stars`} key={stars}>
          <span className="stars-chip__star" aria-hidden="true">★</span>
          <b>{stars}</b>
        </span>
        <SoundToggle muted={muted} onToggle={onMute} />
      </div>
      <nav className="tabs" aria-label="Sections">
        {TABS.map((t) => (
          <button key={t.id} className="tabs__btn" aria-current={tab === t.id ? 'page' : undefined} onClick={() => onTab(t.id)}>
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
