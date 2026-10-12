import React, { useEffect, useRef, useState } from 'react'
import { makeQuestion } from '../data/skills.js'
import { QuestionVisual, HelpVisual, SpeakerIcon } from '../components/Visuals.jsx'
import { Choices, Balloons, Keypad } from '../components/Inputs.jsx'
import { Mascot } from '../components/Mascot.jsx'
import { StarMeter } from '../components/Meter.jsx'
import { burst, rain } from '../components/Confetti.jsx'
import { speak, stopSpeaking, sfx } from '../lib/audio.js'
import { pick } from '../lib/random.js'

const PRAISE = ['Great job!', 'You got it!', 'Awesome!', 'Super!', 'Way to go!', 'Nice one!', 'Yes!']

/**
 * One practice run. Free play runs forever; a guided step (`goal`) ends after
 * `goal` questions and reports back with onDone.
 */
export function Practice({ skill, learner, params, goal, stepLabel, entry, readAloud, onResult, onExit, onDone }) {
  const score = entry?.score || 0
  const scoreRef = useRef(score)
  scoreRef.current = score
  const ctx = () => ({ score: scoreRef.current, name: learner.name, params })

  const [q, setQ] = useState(() => makeQuestion(skill, ctx(), null))
  const [phase, setPhase] = useState('asking')
  const [picked, setPicked] = useState(null)
  const [mood, setMood] = useState({ m: 'idle', k: 0 })
  const [floater, setFloater] = useState(null)
  const [results, setResults] = useState([])
  const [mastered, setMastered] = useState(false)
  const [finished, setFinished] = useState(false)
  const timer = useRef()

  useEffect(() => {
    if (!readAloud) return
    const t = setTimeout(() => speak(q.say), 350)
    return () => clearTimeout(t)
  }, [q, readAloud])

  useEffect(() => () => {
    clearTimeout(timer.current)
    stopSpeaking()
  }, [])

  const reachedGoal = (n) => goal && n >= goal

  function next(count = results.length) {
    clearTimeout(timer.current)
    if (reachedGoal(count)) {
      setFinished(true)
      sfx.step()
      return
    }
    setQ((prev) => makeQuestion(skill, ctx(), prev))
    setPhase('asking')
    setPicked(null)
    setMood((m) => ({ m: 'idle', k: m.k + 1 }))
  }

  function answer(value, el) {
    if (phase !== 'asking') return
    const correct = value === q.answer
    setPicked(value)
    const res = onResult(skill.id, correct)
    const nextResults = [...results, correct]
    setResults(nextResults)
    if (correct) {
      setPhase('correct')
      sfx.correct()
      const r = el?.getBoundingClientRect?.()
      if (r) {
        burst(r.left + r.width / 2, r.top + r.height / 2, { count: 30 })
        setFloater({ k: Date.now(), x: r.left + r.width / 2, y: r.top })
      }
      setMood((m) => ({ m: 'cheer', k: m.k + 1 }))
      speak(pick(PRAISE))
      if (res.firstMastery) {
        timer.current = setTimeout(() => {
          setMastered(true)
          rain()
          sfx.fanfare()
          speak(`Hooray ${learner.name}! You mastered ${skill.title}!`)
        }, 700)
      } else {
        timer.current = setTimeout(() => next(nextResults.length), 1250)
      }
    } else {
      setPhase('wrong')
      sfx.wrong()
      setMood((m) => ({ m: 'oops', k: m.k + 1 }))
    }
  }

  const input =
    q.input === 'balloons' ? (
      <Balloons q={q} picked={picked} phase={phase} onPick={answer} />
    ) : q.input === 'keypad' ? (
      <Keypad key={q.id} phase={phase} onSubmit={answer} />
    ) : (
      <Choices q={q} picked={picked} phase={phase} onPick={answer} />
    )

  const streak = entry?.streak || 0

  return (
    <div className="screen practice">
      <header className="pbar">
        <button className="icon-btn" onClick={onExit} aria-label={goal ? 'Back to today' : 'Back to skills'}>
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div className="pbar__title">
          {stepLabel && <span className="pbar__eyebrow">{stepLabel}</span>}
          <span className="pbar__name"><span aria-hidden="true">{skill.icon}</span> {skill.title}</span>
        </div>
        <StarMeter score={score} />
      </header>

      <main className="stage">
        <div className="qmeta">
          {goal ? (
            <div className="dots" aria-label={`Question ${Math.min(results.length + 1, goal)} of ${goal}`}>
              {Array.from({ length: goal }, (_, i) => (
                <span key={i} className={'dot' + (i < results.length ? (results[i] ? ' is-right' : ' is-wrong') : i === results.length ? ' is-now' : '')} />
              ))}
            </div>
          ) : (
            <span className="qmeta__count">Question {results.length + (phase === 'asking' ? 1 : 0)}</span>
          )}
          {streak >= 3 && <span className="streak" key={streak}>🔥 {streak} in a row</span>}
        </div>

        <div className="qcard-wrap">
          <Mascot key={mood.k} mood={mood.m} size={78} className="qcard__mascot" />
          <section className={`qcard phase-${phase}`} key={q.id}>
            <div className="qprompt">
              <button className="say-btn" onClick={() => speak(q.say)} aria-label="Read it to me">
                <SpeakerIcon />
              </button>
              <p className={'qprompt__text' + (q.long ? ' is-long' : '')}>{q.prompt}</p>
            </div>
            {q.visual.kind !== 'none' && (
              <div className="qvisual">
                <QuestionVisual q={q} />
              </div>
            )}
          </section>
        </div>

        <section className="answer" key={'a' + q.id}>{input}</section>
      </main>

      {floater && (
        <span className="floater" key={floater.k} style={{ left: floater.x, top: floater.y }} aria-hidden="true">+1 ★</span>
      )}

      {phase === 'wrong' && <HelpSheet q={q} onNext={() => next(results.length)} />}

      {mastered && (
        <Celebration
          title={<>You mastered<br />{skill.title}!</>}
          note={`+10 bonus stars for ${learner.name}`}
          primary={goal ? 'Keep going' : 'Pick a new skill'}
          onPrimary={() => {
            setMastered(false)
            if (goal) next(results.length)
            else onExit()
          }}
          secondary={goal ? null : 'Keep practising'}
          onSecondary={() => {
            setMastered(false)
            next(results.length)
          }}
        />
      )}

      {finished && <StepDone results={results} onContinue={onDone} />}
    </div>
  )
}

function HelpSheet({ q, onNext }) {
  const btn = useRef(null)
  useEffect(() => {
    btn.current?.focus({ preventScroll: true })
    if (!q.help.say) return
    const t = setTimeout(() => speak(q.help.say), 450)
    return () => clearTimeout(t)
  }, [q])
  return (
    <div className="sheet-scrim">
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <span className="sheet__grip" aria-hidden="true" />
        <h2 id="help-title">Let’s figure it out</h2>
        <p className="sheet__answer">The answer is <b>{q.answerLabel}</b></p>
        <div className="sheet__visual">
          <HelpVisual help={q.help} />
        </div>
        <button ref={btn} className="btn btn--primary btn--big" onClick={onNext}>Got it, next one</button>
      </div>
    </div>
  )
}

function StepDone({ results, onContinue }) {
  const right = results.filter(Boolean).length
  const all = right === results.length
  useEffect(() => {
    rain({ count: all ? 140 : 70 })
    speak(all ? `Perfect! ${right} out of ${results.length}!` : `You got ${right} out of ${results.length}. Great work!`)
  }, [])
  return (
    <div className="celebrate celebrate--step" role="dialog" aria-modal="true" aria-labelledby="done-title">
      <div className="celebrate__rays" aria-hidden="true" />
      <div className="celebrate__card">
        <div className="done-stars" aria-hidden="true">
          {results.map((r, i) => <span key={i} className={'done-star' + (r ? ' is-on' : '')} style={{ '--i': i }}>★</span>)}
        </div>
        <h2 id="done-title">{all ? 'Perfect!' : 'Step complete!'}</h2>
        <p>{right} of {results.length} right on the first try</p>
        <button className="btn btn--primary btn--big" onClick={onContinue} autoFocus>Keep going</button>
      </div>
    </div>
  )
}

export function Trophy() {
  return (
    <svg className="trophy" viewBox="0 0 120 130" aria-hidden="true">
      <path className="trophy__handle" d="M30 30 H14 C 8 30 8 58 34 62 M90 30 H106 C 112 30 112 58 86 62" />
      <path className="trophy__cup" d="M28 18 H92 V46 C 92 66 78 80 60 80 C 42 80 28 66 28 46 Z" />
      <rect className="trophy__stem" x="52" y="80" width="16" height="18" rx="3" />
      <rect className="trophy__base" x="34" y="98" width="52" height="16" rx="5" />
      <path className="trophy__star" d="M60 30 L65 42 L78 42 L68 50 L72 63 L60 55 L48 63 L52 50 L42 42 L55 42 Z" />
    </svg>
  )
}

export function Celebration({ title, note, primary, onPrimary, secondary, onSecondary }) {
  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-labelledby="cel-title">
      <div className="celebrate__rays" aria-hidden="true" />
      <div className="celebrate__card">
        <Trophy />
        <h2 id="cel-title">{title}</h2>
        {note && <p>{note}</p>}
        <div className="celebrate__actions">
          <button className="btn btn--primary btn--big" onClick={onPrimary} autoFocus>{primary}</button>
          {secondary && <button className="btn" onClick={onSecondary}>{secondary}</button>}
        </div>
      </div>
    </div>
  )
}
