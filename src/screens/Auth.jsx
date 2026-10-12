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

  async function google() {
    setBusy(true)
    setMsg(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (error) {
      setMsg({ ok: false, text: error.message || 'Google sign-in is not available right now.' })
      setBusy(false)
    }
  }

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
        <button type="button" className="btn btn--big btn--google" onClick={google} disabled={busy}>
          <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
          </svg>
          Continue with Google
        </button>
        <div className="auth__or"><span>or use email</span></div>
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
