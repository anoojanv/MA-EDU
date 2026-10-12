import React, { useEffect, useRef, useState } from 'react'
import { tier } from '../lib/mastery.js'

function useCountUp(target, ms = 650) {
  const [v, setV] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    const a = from.current
    const b = target
    if (a === b) return
    const t0 = performance.now()
    let raf
    const step = (t) => {
      const k = Math.min(1, (t - t0) / ms)
      setV(Math.round(a + (b - a) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      from.current = b
    }
  }, [target, ms])
  return v
}

export function StarMeter({ score }) {
  const shown = useCountUp(score)
  const t = tier(score)
  return (
    <div className={`meter meter--${t.key}`} role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score} aria-label="Star Meter">
      <span className="meter__star" key={score}>★</span>
      <span className="meter__body">
        <span className="meter__top">
          <span className="meter__num">{shown}</span>
          <span className="meter__label">{t.name}</span>
        </span>
        <span className="meter__bar">
          <span className="meter__fill" style={{ width: `${score}%` }} />
          <span className="meter__mark" style={{ left: '50%' }} />
          <span className="meter__mark" style={{ left: '80%' }} />
        </span>
      </span>
    </div>
  )
}

export function Ring({ score = 0, mastered, size = 52 }) {
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <span className={'ring' + (mastered ? ' is-mastered' : '')} style={{ width: size, height: size }} aria-label={mastered ? 'Mastered' : `Star Meter ${score} of 100`}>
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={r} className="ring__track" />
        <circle cx="24" cy="24" r={r} className="ring__fill" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <span className="ring__num">{mastered ? '👑' : score}</span>
    </span>
  )
}
