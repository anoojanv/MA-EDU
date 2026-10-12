import React from 'react'
import { Mascot } from '../components/Mascot.jsx'
import { PLANS } from '../data/curriculum.js'

export function Who({ learners, stars, plans, onPick }) {
  return (
    <div className="screen who">
      <header className="who__hero">
        <Mascot mood="wave" size={112} />
        <div>
          <p className="eyebrow">Maanu Learning</p>
          <h1>Who’s learning today?</h1>
        </div>
      </header>
      <div className="who__grid">
        {learners.map((l, i) => {
          const plan = PLANS[l.plan]
          const unit = plan.units[plans[l.id]?.unit || 0]
          return (
            <button key={l.id} className={`who-card tone-${l.tone}`} style={{ '--i': i }} onClick={() => onPick(l.id)}>
              <span className="avatar avatar--xl">{l.avatar}</span>
              <span className="who-card__name">{l.name}</span>
              <span className="who-card__meta">{l.grade} · ★ {stars[l.id] || 0}</span>
              <span className="who-card__unit">
                <span aria-hidden="true">{unit.icon}</span> {unit.title}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
