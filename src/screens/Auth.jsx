import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { Mascot } from '../components/Mascot.jsx'

/** Grown-up sign in: email and password, or a one-time email link. */
export function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'link') {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
        if (error) throw error
        setMsg({ ok: true, text: `Check ${email} for a sign-in link.` })
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
        if (error) throw error
        if (!data.session) setMsg({ ok: true, text: `Almost there. Confirm your email from the message we sent to ${email}.` })
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message || 'Something went wrong. Try again.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen auth">
      <header className="auth__hero">
        <Mascot mood="wave" size={112} />
        <div>
          <p className="eyebrow">MA-learning</p>
          <h1>Playful learning, built for each of your kids</h1>
          <p className="auth__lede">Tell us their ages and MA-learning builds a daily plan for each one: a few minutes on screen, one activity together, and practice that gets harder as they grow.</p>
        </div>
      </header>

      <form className="card auth__card" onSubmit={submit}>
        <div className="seg" role="tablist" aria-label="Sign in or create an account">
          <button type="button" role="tab" aria-pressed={mode === 'signin'} onClick={() => setMode('signin')}>Sign in</button>
          <button type="button" role="tab" aria-pressed={mode === 'signup'} onClick={() => setMode('signup')}>Create account</button>
          <button type="button" role="tab" aria-pressed={mode === 'link'} onClick={() => setMode('link')}>Email me a link</button>
        </div>
        <label className="field">
          <span>Grown-up’s email</span>
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        {mode !== 'link' && (
          <label className="field">
            <span>Password</span>
            <input type="password" required minLength={8} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            {mode === 'signup' && <small>At least 8 characters.</small>}
          </label>
        )}
        <button className="btn btn--primary btn--big" disabled={busy}>
          {busy ? 'One moment…' : mode === 'signup' ? 'Create account' : mode === 'link' ? 'Send me a link' : 'Sign in'}
        </button>
        {msg && <p className={'auth__msg' + (msg.ok ? ' is-ok' : ' is-err')} role="status">{msg.text}</p>}
        <p className="auth__fine">Accounts are for grown-ups. Kids never need an email or a password.</p>
      </form>
    </div>
  )
}
