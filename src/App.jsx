import React, { useCallback, useEffect, useRef, useState } from 'react'
import { LEARNERS, PLANS } from './data/curriculum.js'
import { SKILL_BY_ID } from './data/skills.js'
import { applyResult } from './lib/mastery.js'
import { load, save, todayKey } from './lib/storage.js'
import { setMuted, speak, sfx } from './lib/audio.js'
import { Backdrop } from './components/Backdrop.jsx'
import { Confetti, rain } from './components/Confetti.jsx'
import { LearnerBar } from './components/LearnerBar.jsx'
import { Who } from './screens/Who.jsx'
import { Today } from './screens/Today.jsx'
import { Skills } from './screens/Skills.jsx'
import { Plan } from './screens/Plan.jsx'
import { Practice } from './screens/Practice.jsx'
import { Offscreen } from './screens/Offscreen.jsx'

const fresh = () => ({ v: 1, muted: false, progress: {}, stars: {}, plans: {}, levels: {} })
const blankPlan = () => ({ unit: 0, sessions: {}, today: { date: '', step: 0, completed: false } })

function initial() {
  const s = load()
  const st = s && s.v === 1 ? { ...fresh(), ...s } : fresh()
  setMuted(st.muted)
  return st
}

export default function App() {
  const [state, setState] = useState(initial)
  const ref = useRef(state)
  ref.current = state
  const [view, setView] = useState({ name: 'who' })
  const [news, setNews] = useState({})

  useEffect(() => {
    save(state)
    setMuted(state.muted)
  }, [state])

  const commit = (fn) => {
    const ns = fn(ref.current)
    ref.current = ns
    setState(ns)
    return ns
  }

  const learner = LEARNERS.find((l) => l.id === view.pid)
  const plan = learner && PLANS[learner.plan]
  const ps = (learner && state.plans[learner.id]) || blankPlan()
  const step = ps.today.date === todayKey() ? ps.today.step : 0
  const unit = plan?.units[ps.unit]

  const recordResult = useCallback((pid, skillId, correct) => {
    let out
    commit((s) => {
      const prev = s.progress[pid]?.[skillId]
      const e = applyResult(prev, correct)
      const firstMastery = !prev?.mastered && e.mastered
      out = { ...e, firstMastery }
      return {
        ...s,
        progress: { ...s.progress, [pid]: { ...(s.progress[pid] || {}), [skillId]: e } },
        stars: { ...s.stars, [pid]: (s.stars[pid] || 0) + (correct ? 1 : 0) + (firstMastery ? 10 : 0) },
      }
    })
    return out
  }, [])

  const updatePlan = (pid, fn) =>
    commit((s) => ({ ...s, plans: { ...s.plans, [pid]: fn(s.plans[pid] || blankPlan()) } }))

  const advanceStep = (pid) =>
    updatePlan(pid, (p) => {
      const today = todayKey()
      const cur = p.today.date === today ? p.today : { date: today, step: 0, completed: false }
      return { ...p, today: { ...cur, step: Math.min(4, cur.step + 1) } }
    })

  function finishDay(pid) {
    const l = LEARNERS.find((x) => x.id === pid)
    const pl = PLANS[l.plan]
    let unitDone = null
    commit((s) => {
      const p = s.plans[pid] || blankPlan()
      const today = todayKey()
      const cur = p.today.date === today ? p.today : { date: today, step: 0, completed: false }
      const u = pl.units[p.unit]
      let sessions = p.sessions
      let unitIdx = p.unit
      let bonus = 0
      if (!cur.completed) {
        bonus = 5
        sessions = { ...sessions, [u.id]: (sessions[u.id] || 0) + 1 }
        if (sessions[u.id] >= pl.sessionsPerUnit && unitIdx < pl.units.length - 1) {
          unitIdx += 1
          unitDone = { done: u.title, next: pl.units[unitIdx].title }
        }
      }
      return {
        ...s,
        stars: { ...s.stars, [pid]: (s.stars[pid] || 0) + bonus },
        plans: { ...s.plans, [pid]: { ...p, unit: unitIdx, sessions, today: { date: today, step: 4, completed: true } } },
      }
    })
    if (unitDone) setNews((n) => ({ ...n, [pid]: unitDone }))
    setView({ name: 'today', pid })
    setTimeout(() => {
      rain()
      sfx.fanfare()
      speak(l.theme === 'garden' ? `Your garden is blooming, ${l.name}!` : `Home run, ${l.name}!`)
    }, 350)
  }

  const goTab = (tab) => setView({ name: tab, pid: view.pid })
  const toggleMute = () => commit((s) => ({ ...s, muted: !s.muted }))

  let body
  if (view.name === 'who' || !learner) {
    body = (
      <Who
        learners={LEARNERS}
        stars={state.stars}
        plans={state.plans}
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
    body = (
      <Practice
        key={`${view.skillId}-${view.step ?? 'free'}-${view.run || 0}`}
        skill={skill}
        learner={learner}
        params={s?.params}
        goal={s?.n}
        stepLabel={guided ? `Step ${view.step + 1} of 4 · ${unit.title}` : 'Free play'}
        entry={state.progress[learner.id]?.[skill.id]}
        readAloud={plan.readAloud && !state.muted}
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
          readAloud={plan.readAloud && !state.muted}
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
          level={state.levels[learner.id] || learner.level}
          onLevel={(lv) => commit((s) => ({ ...s, levels: { ...s.levels, [learner.id]: lv } }))}
          progress={state.progress[learner.id] || {}}
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
          progress={state.progress[learner.id] || {}}
          onSetUnit={(i) => updatePlan(learner.id, (p) => ({ ...p, unit: i }))}
        />
      )
    }
    body = (
      <div className="screen">
        <LearnerBar
          learner={learner}
          stars={state.stars[learner.id] || 0}
          tab={tab}
          onTab={goTab}
          onSwitch={() => setView({ name: 'who' })}
          muted={state.muted}
          onMute={toggleMute}
        />
        <div className="view" key={tab}>{inner}</div>
      </div>
    )
  }

  return (
    <div className={`app ${learner ? `is-${learner.level} theme-${learner.theme}` : ''}`}>
      <Backdrop />
      <div className="view-root" key={view.name + (view.pid || '') + (view.run || '')}>{body}</div>
      <Confetti />
    </div>
  )
}
