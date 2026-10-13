import React from 'react'
import { SUBJECTS, LEVELS, skillsFor } from '../data/skills.js'
import { Ring } from '../components/Meter.jsx'
import { tier } from '../lib/mastery.js'

export function Skills({ learner, level, onLevel, progress, onOpen }) {
  const list = skillsFor(level)
  const groups = []
  for (const s of list) {
    let g = groups.find((x) => x[0] === s.subject)
    if (!g) groups.push((g = [s.subject, []]))
    g[1].push(s)
  }
  const upNext = list.find((s) => (progress[s.id]?.score || 0) < 80)
  let n = 0
  return (
    <div className="skills">
      <div className="skills__intro">
        <h1>Free play</h1>
        <div className="seg" role="group" aria-label="Level">
          {LEVELS.map((l) => (
            <button key={l.id} aria-pressed={level === l.id} onClick={() => onLevel(l.id)}>{l.name}</button>
          ))}
        </div>
      </div>
      <p className="skills__lede">Any skill, as long as {learner.name} likes. Each one has its own Star Meter: 80 is a super star, 100 is mastered.</p>
      {groups.map(([subject, items]) => (
        <section key={subject} className="skills__section">
          <h2 className={`section-title tone-${SUBJECTS[subject].tone}`}>
            <span className="section-title__dot" />
            {SUBJECTS[subject].name}
          </h2>
          <div className="tiles">
            {items.map((s) => {
              const p = progress[s.id]
              const score = p?.score || 0
              return (
                <button key={s.id} className={`tile tone-${SUBJECTS[s.subject].tone}`} style={{ '--i': n++ }} onClick={() => onOpen(s.id)}>
                  <span className="tile__icon" aria-hidden="true">{s.icon}</span>
                  <span className="tile__text">
                    <span className="tile__title">{s.title}</span>
                    <span className="tile__desc">{s.desc}</span>
                    <span className="tile__tier">{tier(score).name}{p ? ` · ${p.correct} of ${p.answered} right` : ''}</span>
                  </span>
                  <Ring score={score} mastered={p?.mastered} />
                  {upNext?.id === s.id && <span className="tile__flag">Up next</span>}
                </button>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
