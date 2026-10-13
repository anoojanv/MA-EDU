import React from 'react'
import { Mascot } from '../components/Mascot.jsx'
import { LEVEL_INFO } from '../data/curriculum.js'

export function Who({ learners, onPick, onFamily, saving }) {
  return (
    <div className="screen who">
      <header className="who__hero">
        <Mascot mood="wave" size={112} />
        <div>
          <p className="eyebrow">MA-learning</p>
          <h1>Who’s learning today?</h1>
        </div>
      </header>
      <div className="who__grid">
        {learners.map(({ child, plan, ps }, i) => {
          const unit = plan.units[Math.min(ps.unit, plan.units.length - 1)]
          return (
            <button key={child.id} className={`who-card tone-${child.tone}`} style={{ '--i': i }} onClick={() => onPick(child.id)}>
              <span className="avatar avatar--xl">{child.avatar}</span>
              <span className="who-card__name">{child.name}</span>
              <span className="who-card__meta">{LEVEL_INFO[plan.level].name} · ★ {child.stars || 0}</span>
              <span className="who-card__unit">
                <span aria-hidden="true">{unit.icon}</span> {unit.title}
              </span>
            </button>
          )
        })}
      </div>
      <footer className="who__foot">
        <button className="btn btn--sm" onClick={onFamily}>Grown-ups: manage family</button>
        {saving && <span className="save-chip" role="status">{saving}</span>}
      </footer>
    </div>
  )
}
