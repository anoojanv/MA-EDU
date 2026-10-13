import React, { useEffect, useState } from 'react'
import { recentAnswers } from '../lib/family.js'
import { SKILL_BY_ID } from '../data/skills.js'

const DAY = 86400000
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/** Last 7 days of practice: questions answered per day, with accuracy on hover. */
export function WeekChart({ childId }) {
  const [rows, setRows] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let live = true
    setRows(null)
    recentAnswers(childId, 7).then((r) => live && setRows(r)).catch(() => live && setErr(true))
    return () => { live = false }
  }, [childId])

  if (err) return <p className="week__empty">Could not load this week’s activity.</p>
  if (!rows) return <p className="week__empty">Loading this week…</p>

  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start.getTime() - (6 - i) * DAY)
    return { d, key: dayKey(d), n: 0, right: 0 }
  })
  const byKey = Object.fromEntries(days.map((x) => [x.key, x]))
  const skills = {}
  for (const r of rows) {
    const day = byKey[dayKey(new Date(r.created_at))]
    if (day) { day.n++; if (r.correct) day.right++ }
    const s = (skills[r.skill_id] ||= { n: 0, right: 0 })
    s.n++
    if (r.correct) s.right++
  }
  const total = rows.length
  const right = rows.filter((r) => r.correct).length
  const max = Math.max(10, ...days.map((x) => x.n))
  const top = Object.entries(skills).sort((a, b) => b[1].n - a[1].n).slice(0, 4)
  const tricky = Object.entries(skills).filter(([, s]) => s.n >= 5 && s.right / s.n < 0.7).sort((a, b) => a[1].right / a[1].n - b[1].right / b[1].n)[0]

  return (
    <section className="week">
      <div className="week__head">
        <h2>This week</h2>
        <p>{total ? <><b>{total}</b> questions · <b>{Math.round((right / total) * 100)}%</b> right</> : 'No practice yet this week.'}</p>
      </div>
      <div className="week__plot" role="table" aria-label="Questions answered each day this week">
        {days.map((x, i) => {
          const label = x.d.toLocaleDateString(undefined, { weekday: 'short' })
          const tip = x.n ? `${label}: ${x.n} questions, ${Math.round((x.right / x.n) * 100)}% right` : `${label}: no practice`
          return (
            <div key={x.key} className={'week__col' + (i === 6 ? ' is-today' : '')} role="row" tabIndex={0} aria-label={tip} data-tip={tip}>
              <span className="week__val" role="cell">{x.n || ''}</span>
              <span className="week__track"><span className="week__bar" style={{ height: `${(x.n / max) * 100}%`, '--i': i }} /></span>
              <span className="week__day" role="cell">{label}</span>
            </div>
          )
        })}
      </div>
      {top.length > 0 && (
        <ul className="week__skills">
          {top.map(([id, s]) => (
            <li key={id}>
              <span aria-hidden="true">{SKILL_BY_ID[id]?.icon}</span> {SKILL_BY_ID[id]?.title || id}
              <span className="week__skillstat">{s.right} of {s.n} right</span>
            </li>
          ))}
        </ul>
      )}
      {tricky && (
        <p className="week__tip">
          <b>Worth a look together:</b> {SKILL_BY_ID[tricky[0]]?.title}. {Math.round((tricky[1].right / tricky[1].n) * 100)}% right this week. Try the “Let’s figure it out” help side by side.
        </p>
      )}
    </section>
  )
}
