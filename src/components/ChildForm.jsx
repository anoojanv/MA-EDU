import React from 'react'
import { LEVEL_INFO, LEVEL_ORDER, ageOf, beyondContent, levelFor } from '../data/curriculum.js'

export const AVATARS = ['⚾', '🦋', '🚀', '🦖', '🐱', '🐶', '🦄', '🐼', '🦊', '🐸', '🐙', '🦁', '🌟', '🐢', '🦉', '🐝']
export const WORLDS = [
  { id: 'diamond', icon: '⚾', name: 'Ballpark', desc: 'Run the bases' },
  { id: 'garden', icon: '🌷', name: 'Garden', desc: 'Make flowers bloom' },
  { id: 'space', icon: '🚀', name: 'Space', desc: 'Fly to the planets' },
]
export const TONES = ['blue', 'red', 'green', 'clay', 'yellow']

const today = () => new Date().toISOString().slice(0, 10)

/** Name, birthday, avatar, world and (optionally) a level override for one child. */
export function ChildForm({ value, onChange, index, showLevel }) {
  const set = (patch) => onChange({ ...value, ...patch })
  const auto = value.birth_date ? levelFor(value.birth_date) : null
  const level = value.level_override || auto
  return (
    <fieldset className={`card child-form tone-${value.tone}`}>
      <legend className="child-form__legend">
        <span className={`avatar avatar--sm tone-${value.tone}`}>{value.avatar}</span>
        {value.name.trim() || `Child ${index + 1}`}
      </legend>

      <div className="child-form__row">
        <label className="field">
          <span>First name</span>
          <input required maxLength={40} value={value.name} onChange={(e) => set({ name: e.target.value })} autoComplete="off" />
        </label>
        <label className="field">
          <span>Birthday</span>
          <input type="date" required min="2005-01-02" max={today()} value={value.birth_date} onChange={(e) => set({ birth_date: e.target.value })} />
        </label>
      </div>

      {value.birth_date && (
        <p className="child-form__level" role="status">
          Age {Math.max(0, ageOf(value.birth_date))} · <b>{LEVEL_INFO[level].long}</b>
          {value.level_override && value.level_override !== auto ? ' (set by you)' : ' this school year'}
          {beyondContent(value.birth_date) && <span className="child-form__note"> Lessons go up to Grade 3 for now.</span>}
        </p>
      )}

      {showLevel && value.birth_date && (
        <label className="field">
          <span>Level</span>
          <select value={value.level_override || ''} onChange={(e) => set({ level_override: e.target.value || null })}>
            <option value="">Match their age ({LEVEL_INFO[auto].long})</option>
            {LEVEL_ORDER.map((l) => <option key={l} value={l}>{LEVEL_INFO[l].long}</option>)}
          </select>
        </label>
      )}

      <div className="field">
        <span>Pick a buddy</span>
        <div className="picker picker--avatars" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button type="button" key={a} role="radio" aria-checked={value.avatar === a} className="picker__opt" onClick={() => set({ avatar: a })}>{a}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>Pick a world</span>
        <div className="picker picker--worlds" role="radiogroup" aria-label="World">
          {WORLDS.map((w) => (
            <button type="button" key={w.id} role="radio" aria-checked={value.theme === w.id} className="picker__world" onClick={() => set({ theme: w.id })}>
              <span className="picker__icon" aria-hidden="true">{w.icon}</span>
              <b>{w.name}</b>
              <small>{w.desc}</small>
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  )
}

export function blankChild(i) {
  return { name: '', birth_date: '', avatar: AVATARS[i % AVATARS.length], theme: WORLDS[i % WORLDS.length].id, tone: TONES[i % TONES.length], level_override: null }
}
