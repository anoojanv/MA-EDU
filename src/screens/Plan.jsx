import React from 'react'
import { SKILL_BY_ID } from '../data/skills.js'
import { Ring } from '../components/Meter.jsx'

export function Plan({ learner, plan, unitIndex, sessions, progress, onSetUnit }) {
  const entries = Object.values(progress)
  const answered = entries.reduce((t, e) => t + e.answered, 0)
  const correct = entries.reduce((t, e) => t + e.correct, 0)
  const days = Object.values(sessions).reduce((t, n) => t + n, 0)
  const stars = entries.filter((e) => e.score >= 80).length

  const stats = [
    { label: 'Unit', value: `${unitIndex + 1} of ${plan.units.length}` },
    { label: 'Days practised', value: days },
    { label: 'Questions answered', value: answered },
    { label: 'First-try accuracy', value: answered ? `${Math.round((correct / answered) * 100)}%` : '–' },
    { label: 'Super-star skills', value: stars },
  ]

  return (
    <div className="plan">
      <header className="plan__head">
        <p className="eyebrow">For grown-ups</p>
        <h1>{plan.title}</h1>
        <p className="plan__sub">
          Follows the {plan.program}. About {plan.minutes} minutes a day: three short on-screen steps, then one activity together. A unit moves on after {plan.sessionsPerUnit} days.
        </p>
        <dl className="stats">
          {stats.map((s) => (
            <div key={s.label} className="stats__item">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <ol className="timeline">
        {plan.units.map((u, i) => {
          const status = i < unitIndex ? 'done' : i === unitIndex ? 'now' : 'later'
          const n = sessions[u.id] || 0
          return (
            <li key={u.id} className={`tl is-${status}`} style={{ '--i': i }}>
              <div className="tl__rail" aria-hidden="true">
                <span className="tl__node">{status === 'done' ? '✓' : i + 1}</span>
              </div>
              <article className="tl__card">
                <div className="tl__top">
                  <span className="tl__when">{u.when}</span>
                  <span className={`pill pill--${status}`}>{status === 'done' ? 'Done' : status === 'now' ? 'This unit' : 'Coming up'}</span>
                </div>
                <h3><span aria-hidden="true">{u.icon}</span> {u.title}</h3>
                <p className="tl__goal">“{u.goal}”</p>
                <div className="tl__tags">
                  <span className="chip">{u.frame}</span>
                  {u.reading && <span className="chip">{u.reading}</span>}
                </div>
                <ul className="tl__skills">
                  {u.steps.map((s, k) => {
                    const sk = SKILL_BY_ID[s.skill]
                    const p = progress[s.skill]
                    return (
                      <li key={k}>
                        <Ring score={p?.score || 0} mastered={p?.mastered} size={38} />
                        <span>{sk.title}</span>
                      </li>
                    )
                  })}
                </ul>
                <div className="tl__progress" aria-label={`${n} of ${plan.sessionsPerUnit} days done`}>
                  <span className="tl__bar"><span style={{ width: `${Math.min(100, (n / plan.sessionsPerUnit) * 100)}%` }} /></span>
                  <span>{Math.min(n, plan.sessionsPerUnit)} / {plan.sessionsPerUnit} days</span>
                </div>
                <details className="tl__more">
                  <summary>Activity and tip</summary>
                  <p><b>{u.offscreen.icon} {u.offscreen.title}.</b> {u.offscreen.text}</p>
                  <p className="tl__tip">{u.parent}</p>
                </details>
                {status !== 'now' && (
                  <button className="btn btn--sm" onClick={() => onSetUnit(i)}>Make this {learner.name}’s current unit</button>
                )}
              </article>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
