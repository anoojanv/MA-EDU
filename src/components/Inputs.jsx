import React, { useEffect, useRef, useState } from 'react'
import { Coin, Items } from './Visuals.jsx'
import { sfx } from '../lib/audio.js'

function stateOf(choice, picked, answer, phase) {
  if (picked === null || picked === undefined) return ''
  if (choice.value === picked) return picked === answer ? 'is-right' : 'is-wrong'
  if (phase === 'wrong' && choice.value === answer) return 'is-answer'
  return 'is-dim'
}

export function Choices({ q, picked, phase, onPick }) {
  const style = q.choiceStyle || 'number'
  const locked = phase !== 'asking'
  return (
    <div className={`choices choices--${style} n${q.choices.length}`}>
      {q.choices.map((c, i) => (
        <button
          key={String(c.value)}
          className={`choice ${stateOf(c, picked, q.answer, phase)}`}
          style={{ '--i': i }}
          aria-disabled={locked}
          aria-label={c.kind === 'group' ? `Group of ${c.n}` : c.kind === 'coin' ? `Coin marked ${c.label}` : String(c.label)}
          onClick={(e) => !locked && onPick(c.value, e.currentTarget)}
        >
          {c.kind === 'group' ? (
            <Items emoji={c.emoji} n={c.n} cols={Math.min(c.n, 4)} small />
          ) : c.kind === 'coin' ? (
            <Coin kind={c.coin} size={88} />
          ) : (
            <span className="choice__label">{c.label}</span>
          )}
          {c.sub && <span className="choice__sub">{c.sub}</span>}
        </button>
      ))}
    </div>
  )
}

const BALLOON_TONES = ['red', 'blue', 'yellow', 'green', 'clay']

export function Balloons({ q, picked, phase, onPick }) {
  const locked = phase !== 'asking'
  return (
    <div className="balloons">
      {q.choices.map((c, i) => (
        <button
          key={String(c.value)}
          className={`balloon tone-${BALLOON_TONES[i % BALLOON_TONES.length]} ${stateOf(c, picked, q.answer, phase)}`}
          style={{ '--i': i, '--dur': `${2.4 + (i % 3) * 0.55}s` }}
          aria-label={`Balloon ${c.label}`}
          aria-disabled={locked}
          onClick={(e) => {
            if (locked) return
            sfx.pop()
            onPick(c.value, e.currentTarget)
          }}
        >
          <svg viewBox="0 0 80 124" className="balloon__svg" aria-hidden="true">
            <path className="balloon__string" d="M40 94 C 33 104, 47 112, 40 124" />
            <ellipse cx="40" cy="46" rx="34" ry="42" className="balloon__body" />
            <path d="M34 87 L46 87 L40 95 Z" className="balloon__knot" />
            <ellipse cx="26" cy="30" rx="6" ry="12" className="balloon__shine" />
          </svg>
          <span className="balloon__label">{c.label}</span>
        </button>
      ))}
    </div>
  )
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'ok']

export function Keypad({ phase, onSubmit }) {
  const [val, setVal] = useState('')
  const display = useRef(null)
  const locked = phase !== 'asking'
  const valRef = useRef(val)
  valRef.current = val

  const press = (k) => {
    if (locked) return
    sfx.tap()
    if (k === 'del') setVal((v) => v.slice(0, -1))
    else if (k === 'ok') {
      if (valRef.current !== '') onSubmit(Number(valRef.current), display.current)
    } else setVal((v) => (v.length >= 3 ? v : v === '0' ? k : v + k))
  }

  useEffect(() => {
    const h = (e) => {
      if (/^[0-9]$/.test(e.key)) press(e.key)
      else if (e.key === 'Backspace') press('del')
      else if (e.key === 'Enter') press('ok')
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })

  return (
    <div className="keypad-wrap">
      <div ref={display} className={`keypad__display ${phase === 'correct' ? 'is-right' : phase === 'wrong' ? 'is-wrong' : ''}`} aria-live="polite">
        {val || <span className="keypad__caret">?</span>}
      </div>
      <div className="keypad">
        {KEYS.map((k) => (
          <button
            key={k}
            className={`key key--${k}`}
            aria-disabled={locked || (k === 'ok' && val === '')}
            aria-label={k === 'del' ? 'Delete' : k === 'ok' ? 'Check my answer' : k}
            onClick={() => press(k)}
          >
            {k === 'del' ? '⌫' : k === 'ok' ? 'Check' : k}
          </button>
        ))}
      </div>
    </div>
  )
}
