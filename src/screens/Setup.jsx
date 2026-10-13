import React, { useState } from 'react'
import { Mascot } from '../components/Mascot.jsx'
import { ChildForm, blankChild } from '../components/ChildForm.jsx'

/** First run: how many kids, then a card for each. */
export function Setup({ onSave, onSignOut }) {
  const [count, setCount] = useState(null)
  const [kids, setKids] = useState([])
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)

  function choose(n) {
    setCount(n)
    setKids((prev) => Array.from({ length: n }, (_, i) => prev[i] || blankChild(i)))
  }

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      await onSave(kids.map((k, i) => ({ ...k, name: k.name.trim(), sort_order: i })))
    } catch (e2) {
      setErr(e2.message || 'Could not save. Try again.')
      setBusy(false)
    }
  }

  return (
    <div className="screen setup">
      <header className="setup__hero">
        <Mascot mood="wave" size={96} />
        <div>
          <p className="eyebrow">Welcome to MA-learning</p>
          <h1>How many kids are learning?</h1>
        </div>
      </header>

      <div className="count-pick" role="radiogroup" aria-label="Number of kids">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={count === n} className="count-pick__btn" onClick={() => choose(n)}>{n}</button>
        ))}
      </div>

      {count && (
        <form className="setup__form" onSubmit={submit}>
          <p className="setup__lede">Tell us about each child. Their birthday sets their grade, and we build a year plan just for them.</p>
          {kids.map((k, i) => (
            <ChildForm key={i} index={i} value={k} onChange={(v) => setKids((all) => all.map((x, j) => (j === i ? v : x)))} />
          ))}
          {err && <p className="auth__msg is-err" role="alert">{err}</p>}
          <button className="btn btn--primary btn--big" disabled={busy}>{busy ? 'Building plans…' : count === 1 ? 'Build the plan' : `Build ${count} plans`}</button>
        </form>
      )}

      <button className="btn btn--sm setup__out" onClick={onSignOut}>Sign out</button>
    </div>
  )
}
