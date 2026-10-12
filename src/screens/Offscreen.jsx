import React, { useEffect } from 'react'
import { speak } from '../lib/audio.js'

export function Offscreen({ learner, unit, onDone, onBack }) {
  const a = unit.offscreen
  useEffect(() => {
    const t = setTimeout(() => speak(`${a.title}. ${a.text}`), 400)
    return () => clearTimeout(t)
  }, [a])
  return (
    <div className="screen offscreen">
      <div className="offscreen__card">
        <span className="offscreen__icon" aria-hidden="true">{a.icon}</span>
        <p className="eyebrow">Off the screen · do it together</p>
        <h1>{a.title}</h1>
        <p className="offscreen__text">{a.text}</p>
        <div className="offscreen__tip">
          <b>Grown-up tip</b>
          <p>{unit.parent}</p>
        </div>
        <div className="offscreen__actions">
          <button className="btn btn--primary btn--big" onClick={onDone}>We did it!</button>
          <button className="btn" onClick={onBack}>Not now</button>
        </div>
        <p className="offscreen__note">Tapping “We did it!” finishes {learner.name}’s plan for today.</p>
      </div>
    </div>
  )
}
