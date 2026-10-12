import React, { useEffect } from 'react'
import { Trail, TRAIL_NAMES } from '../components/Trail.jsx'
import { Mascot } from '../components/Mascot.jsx'
import { SpeakerIcon } from '../components/Visuals.jsx'
import { SKILL_BY_ID } from '../data/skills.js'
import { speak } from '../lib/audio.js'

function greeting(theme, name, step) {
  if (theme === 'garden') {
    if (step === 0) return `Hi ${name}! Let’s make the flowers bloom.`
    if (step < 3) return 'A flower bloomed! Let’s find the next one.'
    if (step === 3) return 'Last flower! This one we do together.'
    return 'Your whole garden is blooming!'
  }
  if (step === 0) return `Batter up, ${name}! Run all four bases today.`
  if (step < 3) return `Safe at ${TRAIL_NAMES.diamond[step - 1]}! Keep running.`
  if (step === 3) return 'Rounding third! Bring it home off the screen.'
  return 'Home run! Great game today.'
}

export function Today({ learner, plan, unitIndex, unitSessions, step, readAloud, unitNews, onStart, onReplay, onSkills, onDismissNews }) {
  const unit = plan.units[unitIndex]
  const names = TRAIL_NAMES[learner.theme]
  const stops = [
    ...unit.steps.map((s) => {
      const sk = SKILL_BY_ID[s.skill]
      return { icon: sk.icon, title: sk.title, meta: `${s.n} questions` }
    }),
    { icon: unit.offscreen.icon, title: unit.offscreen.title, meta: 'Off the screen, together' },
  ]
  const done = step >= 4
  const line = greeting(learner.theme, learner.name, step)
  const day = Math.min(plan.sessionsPerUnit, unitSessions + (done ? 0 : 1))

  useEffect(() => {
    if (!readAloud) return
    const t = setTimeout(() => speak(line), 500)
    return () => clearTimeout(t)
  }, [line, readAloud])

  const startLabel = done ? 'Play again' : step === 0 ? `Start: ${stops[0].title}` : step < 3 ? `Next: ${stops[step].title}` : `Next: ${stops[3].title}`

  return (
    <div className="today">
      {unitNews && (
        <div className="news" role="status">
          <span className="news__icon" aria-hidden="true">🏅</span>
          <p>
            <b>{learner.name} finished “{unitNews.done}”.</b> Next up: {unitNews.next}.
          </p>
          <button className="news__close" onClick={onDismissNews} aria-label="Dismiss">×</button>
        </div>
      )}

      <section className={`unit-banner tone-${learner.tone}`}>
        <p className="eyebrow">Unit {unitIndex + 1} of {plan.units.length} · {unit.when}</p>
        <h1><span aria-hidden="true">{unit.icon}</span> {unit.title}</h1>
        <button className="goal" onClick={() => speak(unit.goal)} aria-label={`Goal: ${unit.goal} Tap to hear it.`}>
          <SpeakerIcon size={20} />
          <span>{unit.goal}</span>
        </button>
        <div className="daypips" aria-label={`Day ${day} of ${plan.sessionsPerUnit} in this unit`}>
          {Array.from({ length: plan.sessionsPerUnit }, (_, i) => (
            <span key={i} className={'daypip' + (i < unitSessions ? ' is-done' : i === unitSessions && !done ? ' is-now' : '')} />
          ))}
          <span className="daypips__label">Day {day} of {plan.sessionsPerUnit}</span>
        </div>
      </section>

      <section className="today__main">
        <div className="today__trail">
          <div className="bubble-row">
            <Mascot mood={done ? 'cheer' : 'wave'} size={70} key={step} />
            <p className="bubble" key={line}>{line}</p>
          </div>
          <Trail theme={learner.theme} current={step} avatar={learner.avatar} steps={stops} />
        </div>

        <div className="today__plan">
          <h2 className="plan-title">Today’s plan <span>· about {plan.minutes} minutes</span></h2>
          <ol className="stops">
            {stops.map((s, i) => {
              const state = i < step ? 'is-done' : i === step ? 'is-now' : ''
              return (
                <li key={i} className={`stops__item ${state}`} style={{ '--i': i }}>
                  <span className="stops__mark" aria-hidden="true">{i < step ? '✓' : i + 1}</span>
                  <span className="stops__icon" aria-hidden="true">{s.icon}</span>
                  <span className="stops__text">
                    <span className="stops__title">{s.title}</span>
                    <span className="stops__meta">{names[i]} · {s.meta}</span>
                  </span>
                </li>
              )
            })}
          </ol>
          <div className="today__actions">
            <button className="btn btn--primary btn--big btn--go" onClick={done ? onReplay : () => onStart(step)}>
              {startLabel}
            </button>
            {done && <button className="btn" onClick={onSkills}>Free play</button>}
          </div>
        </div>
      </section>
    </div>
  )
}
