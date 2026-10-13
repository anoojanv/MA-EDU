import React, { useCallback, useEffect, useRef, useState } from 'react'
import { planFor } from './data/curriculum.js'
import { SKILL_BY_ID, freeParams } from './data/skills.js'
import { applyResult } from './lib/mastery.js'
import { loadPrefs, savePrefs, todayKey } from './lib/storage.js'
import { setMuted, speak, sfx } from './lib/audio.js'
import { supabase } from './lib/supabase.js'
import { addChildren, listChildren, recordAnswer, removeChild, updateChild } from './lib/family.js'
import { Backdrop } from './components/Backdrop.jsx'
import { Confetti, rain } from './components/Confetti.jsx'
import { LearnerBar } from './components/LearnerBar.jsx'
import { Mascot } from './components/Mascot.jsx'
import { Auth } from './screens/Auth.jsx'
import { Setup } from './screens/Setup.jsx'
import { Family } from './screens/Family.jsx'
import { Who } from './screens/Who.jsx'
import { Today } from './screens/Today.jsx'
import { Skills } from './screens/Skills.jsx'
import { Plan } from './screens/Plan.jsx'
import { Practice } from './screens/Practice.jsx'
import { Offscreen } from './screens/Offscreen.jsx'

const blankPlan = () => ({ unit: 0, sessions: {}, today: { date: '', step: 0, completed: false } })
const YOUNG = new Set(['prek', 'jk', 'sk'])
const SAVE_DELAY = 800

/** Plan progress is kept per level, so a new school year starts a fresh plan. */
const planState = (child, level) => child.plan_state?.[level] || blankPlan()

/**
 * Decide what happens to the unit after a finished day:
 * acing it moves on early, struggling adds extra practice days (up to 8).
 */
function unitVerdict(unit, days, progress, perUnit) {
  const scores = [...new Set(unit.steps.map((s) => s.skill))].map((id) => progress[id]?.score || 0)
  const avg = scores.reduce((t, x) => t + x, 0) / scores.length
  if (days >= 3 && avg >= 85) return 'early'
  if (days >= perUnit && avg < 40 && days < 8) return days === perUnit ? 'extra' : 'stay'
  if (days >= perUnit) return 'next'
  return 'stay'
}

const SAVED_FIELDS = ['stars', 'progress', 'plan_state', 'free_level']

export default function App() {
  const [session, setSession] = useState(undefined) // undefined while loading
  const [kids, setKids] = useState(null)
  const kidsRef = useRef(kids)
  kidsRef.current = kids
  const [loadErr, setLoadErr] = useState(null)
  const [prefs, setPrefs] = useState(loadPrefs)
  const [view, setView] = useState({ name: 'who' })
  const [news, setNews] = useState({})
  const [saving, setSaving] = useState(null)
  const dirty = useRef(new Set())
  const timer = useRef()

  // ── Auth ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    setKids(null)
    setView({ name: 'who' })
    if (!userId) return
    setLoadErr(null)
    listChildren().then(setKids).catch((e) => setLoadErr(e.message || 'Could not load your family.'))
  }, [userId])

  useEffect(() => {
    savePrefs(prefs)
    setMuted(prefs.muted)
  }, [prefs])

  // ── Saving: changes are written in the background, a moment after they happen ──
  const flush = useCallback(async () => {
    clearTimeout(timer.current)
    const ids = [...dirty.current]
    dirty.current.clear()
    if (!ids.length) return
    setSaving('Saving…')
    try {
      await Promise.all(
        ids.map((id) => {
          const c = kidsRef.current?.find((k) => k.id === id)
          if (!c) return null
          return updateChild(id, Object.fromEntries(SAVED_FIELDS.map((f) => [f, c[f]])))
        }),
      )
      setSaving(null)
    } catch {
      ids.forEach((id) => dirty.current.add(id))
      setSaving('Not saved yet. We’ll keep trying.')
      timer.current = setTimeout(flush, 5000)
    }
  }, [])

  useEffect(() => {
    const onHide = () => document.visibilityState === 'hidden' && flush()
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', flush)
    }
  }, [flush])

  /** Change one child locally and schedule a save. Returns the new child. */
  const commitChild = (id, fn) => {
    let out
    const next = kidsRef.current.map((c) => (c.id === id ? (out = fn(c)) : c))
    kidsRef.current = next
    setKids(next)
    dirty.current.add(id)
    clearTimeout(timer.current)
    timer.current = setTimeout(flush, SAVE_DELAY)
    return out
  }

  const learners = (kids || []).map((child) => {
    const plan = planFor(child)
    const ps = planState(child, plan.level)
    return { child, plan, ps: { ...ps, unit: Math.min(ps.unit, plan.units.length - 1) } }
  })

  const current = learners.find((l) => l.child.id === view.pid)
  const learner = current?.child
  const plan = current?.plan
  const ps = current?.ps
  const step = ps && ps.today.date === todayKey() ? ps.today.step : 0
  const unit = plan?.units[ps.unit]

  const recordResult = useCallback((pid, skillId, correct) => {
    let out
    commitChild(pid, (c) => {
      const prev = c.progress?.[skillId]
      const e = applyResult(prev, correct)
      const firstMastery = !prev?.mastered && e.mastered
      out = { ...e, firstMastery }
      return {
        ...c,
        progress: { ...(c.progress || {}), [skillId]: e },
        stars: (c.stars || 0) + (correct ? 1 : 0) + (firstMastery ? 10 : 0),
      }
    })
    recordAnswer(pid, skillId, correct, out.score)
    return out
  }, [])

  const updatePlan = (pid, fn) =>
    commitChild(pid, (c) => {
      const level = planFor(c).level
      return { ...c, plan_state: { ...(c.plan_state || {}), [level]: fn(planState(c, level)) } }
    })

  const advanceStep = (pid) =>
    updatePlan(pid, (p) => {
      const today = todayKey()
      const cur = p.today.date === today ? p.today : { date: today, step: 0, completed: false }
      return { ...p, today: { ...cur, step: Math.min(4, cur.step + 1) } }
    })

  function finishDay(pid) {
    const c = kidsRef.current.find((x) => x.id === pid)
    const pl = planFor(c)
    let unitNews = null
    let bonus = 0
    updatePlan(pid, (p) => {
      const today = todayKey()
      const cur = p.today.date === today ? p.today : { date: today, step: 0, completed: false }
      let { sessions, unit: unitIdx } = p
      unitIdx = Math.min(unitIdx, pl.units.length - 1)
      if (!cur.completed) {
        bonus = 5
        const u = pl.units[unitIdx]
        const days = (sessions[u.id] || 0) + 1
        sessions = { ...sessions, [u.id]: days }
        const verdict = unitVerdict(u, days, c.progress || {}, pl.sessionsPerUnit)
        if ((verdict === 'early' || verdict === 'next') && unitIdx < pl.units.length - 1) {
          unitIdx += 1
          unitNews = { done: u.title, next: pl.units[unitIdx].title, early: verdict === 'early' }
        } else if (verdict === 'extra') {
          unitNews = { extra: u.title }
        }
      }
      return { ...p, unit: unitIdx, sessions, today: { date: today, step: 4, completed: true } }
    })
    if (bonus) commitChild(pid, (x) => ({ ...x, stars: (x.stars || 0) + bonus }))
    if (unitNews) setNews((n) => ({ ...n, [pid]: unitNews }))
    setView({ name: 'today', pid })
    setTimeout(() => {
      rain()
      sfx.fanfare()
      speak(c.theme === 'garden' ? `Your garden is blooming, ${c.name}!` : c.theme === 'space' ? `Mission complete, ${c.name}!` : `Home run, ${c.name}!`)
    }, 350)
  }

  const goTab = (tab) => setView({ name: tab, pid: view.pid })
  const toggleMute = () => setPrefs((p) => ({ ...p, muted: !p.muted }))
  const signOut = async () => {
    await flush()
    await supabase.auth.signOut()
  }

  // Family edits replace the saved row; local progress fields stay as they are.
  const saveDetails = async (id, patch) => {
    await flush()
    const row = await updateChild(id, patch)
    const next = kidsRef.current.map((c) => (c.id === id ? { ...c, ...row } : c))
    kidsRef.current = next
    setKids(next)
  }
  const addKids = async (rows) => {
    const added = await addChildren(rows)
    const next = [...(kidsRef.current || []), ...added]
    kidsRef.current = next
    setKids(next)
    return added
  }
  const dropKid = async (id) => {
    await removeChild(id)
    dirty.current.delete(id)
    const next = kidsRef.current.filter((c) => c.id !== id)
    kidsRef.current = next
    setKids(next)
  }

  let body
  if (session === undefined || (session && !kids && !loadErr)) {
    body = (
      <div className="screen loading">
        <Mascot mood="wave" size={96} />
        <p>Getting things ready…</p>
      </div>
    )
  } else if (!session) {
    body = <Auth />
  } else if (loadErr) {
    body = (
      <div className="screen loading">
        <Mascot mood="idle" size={96} />
        <p>{loadErr}</p>
        <button className="btn btn--primary" onClick={() => window.location.reload()}>Try again</button>
      </div>
    )
  } else if (!kids.length) {
    body = (
      <Setup
        onSave={async (rows) => {
          await addKids(rows)
          setView({ name: 'who' })
        }}
        onSignOut={signOut}
      />
    )
  } else if (view.name === 'family') {
    body = (
      <Family
        children={kids}
        email={session.user.email}
        onSave={saveDetails}
        onAdd={addKids}
        onRemove={dropKid}
        onSignOut={signOut}
        onBack={() => setView(view.pid && kids.some((k) => k.id === view.pid) ? { name: 'plan', pid: view.pid } : { name: 'who' })}
      />
    )
  } else if (view.name === 'who' || !learner) {
    body = (
      <Who
        learners={learners}
        saving={saving}
        onFamily={() => setView({ name: 'family' })}
        onPick={(pid) => {
          sfx.tap()
          setView({ name: 'today', pid })
        }}
      />
    )
  } else if (view.name === 'practice') {
    const skill = SKILL_BY_ID[view.skillId]
    const guided = view.step !== undefined
    const s = guided ? unit.steps[view.step] : null
    const freeLevel = learner.free_level || plan.level
    body = (
      <Practice
        key={`${view.skillId}-${view.step ?? 'free'}-${view.run || 0}`}
        skill={skill}
        learner={learner}
        params={guided ? s.params : freeParams(skill, freeLevel)}
        goal={s?.n}
        stepLabel={guided ? `Step ${view.step + 1} of 4 · ${unit.title}` : 'Free play'}
        entry={learner.progress?.[skill.id]}
        readAloud={plan.readAloud && !prefs.muted}
        onResult={(skillId, correct) => recordResult(learner.id, skillId, correct)}
        onExit={() => setView({ name: guided ? 'today' : 'skills', pid: learner.id })}
        onDone={() => {
          advanceStep(learner.id)
          setView({ name: 'today', pid: learner.id })
        }}
      />
    )
  } else if (view.name === 'offscreen') {
    body = <Offscreen learner={learner} unit={unit} onDone={() => finishDay(learner.id)} onBack={() => setView({ name: 'today', pid: learner.id })} />
  } else {
    const tab = view.name
    let inner
    if (tab === 'today') {
      inner = (
        <Today
          learner={learner}
          plan={plan}
          unitIndex={ps.unit}
          unitSessions={ps.sessions[unit.id] || 0}
          step={step}
          readAloud={plan.readAloud && !prefs.muted}
          unitNews={news[learner.id]}
          onDismissNews={() => setNews((n) => ({ ...n, [learner.id]: null }))}
          onStart={(i) => {
            sfx.tap()
            if (i < 3) setView({ name: 'practice', pid: learner.id, skillId: unit.steps[i].skill, step: i, run: Date.now() })
            else setView({ name: 'offscreen', pid: learner.id })
          }}
          onReplay={() => updatePlan(learner.id, (p) => ({ ...p, today: { ...p.today, date: todayKey(), step: 0 } }))}
          onSkills={() => goTab('skills')}
        />
      )
    } else if (tab === 'skills') {
      inner = (
        <Skills
          learner={learner}
          level={learner.free_level || plan.level}
          onLevel={(lv) => commitChild(learner.id, (c) => ({ ...c, free_level: lv }))}
          progress={learner.progress || {}}
          onOpen={(skillId) => {
            sfx.tap()
            setView({ name: 'practice', pid: learner.id, skillId, run: Date.now() })
          }}
        />
      )
    } else {
      inner = (
        <Plan
          learner={learner}
          plan={plan}
          unitIndex={ps.unit}
          sessions={ps.sessions}
          progress={learner.progress || {}}
          onSetUnit={(i) => updatePlan(learner.id, (p) => ({ ...p, unit: i }))}
          onFamily={() => setView({ name: 'family', pid: learner.id })}
        />
      )
    }
    body = (
      <div className="screen">
        <LearnerBar
          learner={learner}
          stars={learner.stars || 0}
          tab={tab}
          onTab={goTab}
          onSwitch={() => setView({ name: 'who' })}
          muted={prefs.muted}
          onMute={toggleMute}
        />
        <div className="view" key={tab}>{inner}</div>
      </div>
    )
  }

  const size = plan ? (YOUNG.has(plan.level) ? 'jk' : plan.level) : ''
  return (
    <div className={`app ${learner ? `is-${size} theme-${learner.theme}` : ''}`}>
      <Backdrop />
      <div className="view-root" key={view.name + (view.pid || '') + (view.run || '') + (session ? 'in' : 'out')}>{body}</div>
      <Confetti />
    </div>
  )
}
