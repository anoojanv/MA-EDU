import React, { useState } from 'react'
import { ChildForm, blankChild } from '../components/ChildForm.jsx'

/** Grown-ups: edit, add or remove children. */
export function Family({ children, onSave, onAdd, onRemove, onBack, onSignOut, email }) {
  const [drafts, setDrafts] = useState(() => children.map((c) => ({ ...c })))
  const [adding, setAdding] = useState(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function run(fn, done) {
    setBusy(true)
    setMsg(null)
    try {
      await fn()
      setMsg({ ok: true, text: done })
    } catch (e) {
      setMsg({ ok: false, text: e.message || 'Could not save. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  const pick = (c) => ({ name: c.name.trim(), birth_date: c.birth_date, avatar: c.avatar, theme: c.theme, tone: c.tone, level_override: c.level_override || null })

  return (
    <div className="screen family">
      <header className="family__head">
        <button className="btn btn--sm" onClick={onBack}>← Back</button>
        <div>
          <p className="eyebrow">Grown-ups</p>
          <h1>Your family</h1>
        </div>
      </header>

      {msg && <p className={'auth__msg' + (msg.ok ? ' is-ok' : ' is-err')} role="status">{msg.text}</p>}

      {drafts.map((d, i) => (
        <form key={d.id} className="family__child" onSubmit={(e) => { e.preventDefault(); run(() => onSave(d.id, pick(d)), `Saved ${d.name.trim()}.`) }}>
          <ChildForm index={i} value={d} showLevel onChange={(v) => setDrafts((all) => all.map((x) => (x.id === d.id ? v : x)))} />
          <div className="family__actions">
            <button className="btn btn--primary" disabled={busy}>Save {d.name.trim() || 'changes'}</button>
            <button
              type="button"
              className="btn btn--danger"
              disabled={busy}
              onClick={() => {
                if (window.confirm(`Remove ${d.name} and all of their progress? This cannot be undone.`)) {
                  run(async () => {
                    await onRemove(d.id)
                    setDrafts((all) => all.filter((x) => x.id !== d.id))
                  }, `Removed ${d.name}.`)
                }
              }}
            >
              Remove
            </button>
          </div>
        </form>
      ))}

      {adding ? (
        <form className="family__child" onSubmit={(e) => { e.preventDefault(); run(async () => {
          const [row] = await onAdd({ ...pick(adding), sort_order: drafts.length })
          setDrafts((all) => [...all, { ...row }])
          setAdding(null)
        }, `Added ${adding.name.trim()}.`) }}>
          <ChildForm index={drafts.length} value={adding} showLevel onChange={setAdding} />
          <div className="family__actions">
            <button className="btn btn--primary" disabled={busy}>Add {adding.name.trim() || 'child'}</button>
            <button type="button" className="btn" onClick={() => setAdding(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        drafts.length < 8 && <button className="btn btn--big family__add" onClick={() => setAdding(blankChild(drafts.length))}>＋ Add a child</button>
      )}

      <footer className="family__foot">
        <span>Signed in as {email}</span>
        <button className="btn btn--sm" onClick={onSignOut}>Sign out</button>
      </footer>
    </div>
  )
}
