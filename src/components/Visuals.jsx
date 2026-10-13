import React, { useEffect, useId, useState } from 'react'
import { COINS, money } from '../data/coins.js'
import { speak, canSpeak } from '../lib/audio.js'
import { Shape, Clock, Fraction, ArrayGrid } from './Shapes.jsx'
import { SHAPES } from '../data/skills.js'

export function SpeakerIcon({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="speaker-icon">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Steps an index from 0 to n-1, for count-along animations. */
function useStepper(n, ms = 650, delay = 450) {
  const [i, setI] = useState(-1)
  useEffect(() => {
    let k = -1
    let t
    const tick = () => {
      k += 1
      setI(k)
      if (k < n - 1) t = setTimeout(tick, ms)
    }
    t = setTimeout(tick, delay)
    return () => clearTimeout(t)
  }, [n, ms, delay])
  return i
}

export function Items({ emoji, n, active = -1, faded = 0, cols, small }) {
  const c = cols ?? (n <= 5 ? n : 5)
  return (
    <div className={'items' + (small ? ' items--small' : '')} style={{ '--cols': c }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={'item' + (i <= active ? ' is-on' : '') + (i >= n - faded ? ' is-gone' : '')} style={{ '--i': i }}>
          <span className="item__e">{emoji}</span>
          {i <= active && <span className="item__n">{i + 1}</span>}
        </span>
      ))}
    </div>
  )
}

function CountAlong({ emoji, n }) {
  const i = useStepper(n)
  useEffect(() => {
    const t = setTimeout(() => speak(Array.from({ length: n }, (_, k) => k + 1).join(', '), { rate: 0.75 }), 400)
    return () => clearTimeout(t)
  }, [n])
  return (
    <div className="count-along">
      <Items emoji={emoji} n={n} active={i} />
      <div className="count-along__num" key={i} aria-live="polite">{i >= 0 ? i + 1 : ''}</div>
    </div>
  )
}

function TenFrame({ a, b, eq, active = -1 }) {
  return (
    <div className="tf-wrap">
      {eq && <div className="eq">{eq}</div>}
      <div className="tenframe" role="img" aria-label={`Ten frame with ${a} blue dots and ${b} red dots`}>
        {Array.from({ length: 10 }, (_, i) => {
          const kind = i < a ? 'a' : i < a + b ? 'b' : ''
          return (
            <div key={i} className="tf-cell">
              {kind && (
                <span className={`tf-dot tf-dot--${kind}${i <= active ? ' is-on' : ''}`} style={{ '--i': i }}>
                  {i <= active ? i + 1 : ''}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TenFrameCount({ a, b }) {
  const i = useStepper(a + b, 520)
  return <TenFrame a={a} b={b} active={i} eq={`${a} + ${b} = ${a + b}`} />
}

function NumberLine({ start, delta, max = 20 }) {
  const W = 660, pad = 22, y = 80
  const dir = Math.sign(delta), hops = Math.abs(delta)
  const end = start + delta
  // Zoom to the part of the line the hops use (at least 10 wide) so labels stay readable on phones.
  let lo = Math.max(0, Math.min(start, end) - 2)
  let hi = Math.min(max, Math.max(start, end) + 2)
  while (hi - lo < 10) {
    if (hi < max) hi++
    if (hi - lo < 10 && lo > 0) lo--
  }
  const step = (W - pad * 2) / (hi - lo)
  const x = (v) => pad + (v - lo) * step
  return (
    <div className="nl-wrap">
      <svg className="numberline" viewBox={`0 0 ${W} 120`} role="img" aria-label={`Start at ${start}, hop ${hops} ${dir > 0 ? 'forward' : 'back'}, land on ${end}`}>
        <line x1={pad} x2={W - pad} y1={y} y2={y} className="nl-axis" />
        {Array.from({ length: hi - lo + 1 }, (_, k) => lo + k).map((v) => (
          <g key={v}>
            <line x1={x(v)} x2={x(v)} y1={y - 7} y2={y + 7} className="nl-tick" />
            <text x={x(v)} y={y + 38} textAnchor="middle" className={'nl-label' + (v === start ? ' is-start' : '') + (v === end ? ' is-end' : '')}>{v}</text>
          </g>
        ))}
        {Array.from({ length: hops }, (_, k) => {
          const from = start + dir * k, to = from + dir
          const x1 = x(from), x2 = x(to), xm = (x1 + x2) / 2
          return <path key={k} className="nl-hop" d={`M ${x1} ${y - 4} Q ${xm} ${y - 46} ${x2} ${y - 4}`} pathLength="1" style={{ '--i': k }} />
        })}
        <circle cx={x(start)} cy={y} r="9" className="nl-start" />
        <circle cx={x(end)} cy={y} r="11" className="nl-end" style={{ '--i': hops }} />
      </svg>
    </div>
  )
}

function Blocks({ hundreds = 0, tens, ones, explain }) {
  return (
    <div className="blocks-wrap">
      <div className="blocks" role="img" aria-label={`${hundreds ? `${hundreds} hundreds, ` : ''}${tens} tens and ${ones} ones`}>
        {hundreds > 0 && (
          <div className="blocks__hundreds">
            {Array.from({ length: hundreds }, (_, i) => (
              <div key={i} className="flat" style={{ '--i': i }}>
                {Array.from({ length: 100 }, (_, j) => <span key={j} />)}
              </div>
            ))}
          </div>
        )}
        <div className="blocks__tens">
          {Array.from({ length: tens }, (_, i) => (
            <div key={i} className="rod" style={{ '--i': i }}>
              {Array.from({ length: 10 }, (_, j) => <span key={j} />)}
            </div>
          ))}
        </div>
        {ones > 0 && (
          <div className="blocks__ones">
            {Array.from({ length: ones }, (_, i) => <span key={i} className="cube" style={{ '--i': tens + i }} />)}
          </div>
        )}
      </div>
      {explain && (
        <div className="blocks__explain">
          {hundreds > 0 && <span className="chip tone-green"><b>{hundreds}</b> hundreds = {hundreds * 100}</span>}
          <span className="chip tone-blue"><b>{tens}</b> tens = {tens * 10}</span>
          <span className="chip tone-clay"><b>{ones}</b> ones = {ones}</span>
          <span className="blocks__sum">{hundreds > 0 ? `${hundreds * 100} + ` : ''}{tens * 10} + {ones} = {hundreds * 100 + tens * 10 + ones}</span>
        </div>
      )}
    </div>
  )
}

export function Coin({ kind, size = 64 }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const c = COINS[kind]
  const px = Math.round((size * c.d) / 28)
  const R = 46
  const poly = (n) =>
    Array.from({ length: n }, (_, i) => {
      const t = -Math.PI / 2 + (i * 2 * Math.PI) / n
      return `${(R * Math.cos(t)).toFixed(2)},${(R * Math.sin(t)).toFixed(2)}`
    }).join(' ')
  const outer = c.metal === 'gold' ? `url(#g${id})` : `url(#s${id})`
  return (
    <svg className="coin" width={px} height={px} viewBox="-50 -50 100 100" role="img" aria-label={`${c.name}, ${c.label}`}>
      <defs>
        <radialGradient id={`s${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#f5f7fa" />
          <stop offset="1" stopColor="#9aa3b0" />
        </radialGradient>
        <radialGradient id={`g${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffe8a3" />
          <stop offset="1" stopColor="#c08f27" />
        </radialGradient>
      </defs>
      {c.sides ? (
        <polygon points={poly(c.sides)} fill={outer} stroke="#86621a" strokeWidth="2" strokeLinejoin="round" />
      ) : (
        <circle r={R} fill={outer} stroke={c.metal === 'gold' ? '#86621a' : '#6c7584'} strokeWidth="2" />
      )}
      {c.metal === 'bi' && <circle r={R * 0.6} fill={`url(#g${id})`} stroke="#86621a" strokeWidth="1.5" />}
      <circle r={R - 7} fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="1.2" strokeDasharray="2 3" />
      <text y="8" textAnchor="middle" className="coin__label">{c.label}</text>
    </svg>
  )
}

function Coins({ coins, running }) {
  let total = 0
  return (
    <div className="coins">
      {coins.map((k, i) => {
        total += COINS[k].value
        return (
          <div key={i} className="coins__one" style={{ '--i': i }}>
            <Coin kind={k} size={76} />
            {running && <span className="coins__run" style={{ '--i': i }}>{money(total)}</span>}
          </div>
        )
      })}
    </div>
  )
}

function Sequence({ items, blank, reveal, step }) {
  return (
    <div className="seq">
      {items.map((v, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="seq__gap">{reveal ? `+${step}` : ''}</span>}
          <span className={'seq__box' + (i === blank ? (reveal ? ' is-reveal' : ' is-blank') : '')} style={{ '--i': i }}>
            {i === blank && !reveal ? '?' : v}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

function Compare({ a, b, sym }) {
  return (
    <div className="cmp">
      <span className="cmp__n">{a}</span>
      <span className={'cmp__sym' + (sym ? ' is-reveal' : '')}>{sym || '?'}</span>
      <span className="cmp__n">{b}</span>
    </div>
  )
}

function Picture({ emoji, word, reveal }) {
  return (
    <div className="pic">
      <span className="pic__e" role="img" aria-label={word}>{emoji}</span>
      {reveal && (
        <span className="pic__w">
          <b>{word[0]}</b>
          {word.slice(1)}
        </span>
      )}
    </div>
  )
}

function Listen({ say, fallback }) {
  return (
    <div className="listen-wrap">
      <button className="listen" onClick={() => speak(say)} aria-label="Hear it again">
        <span className="listen__ring" />
        <span className="listen__ring listen__ring--2" />
        <SpeakerIcon size={54} />
      </button>
      {!canSpeak && <span className="listen__fallback">{fallback}</span>}
    </div>
  )
}

function Story({ a, b, sub, emoji, eq }) {
  return (
    <div className="story">
      {sub ? (
        <Items emoji={emoji} n={a} faded={b} cols={Math.min(a, 6)} />
      ) : (
        <div className="story__add">
          <Items emoji={emoji} n={a} cols={Math.min(a, 3)} />
          <span className="story__plus">+</span>
          <Items emoji={emoji} n={b} cols={Math.min(b, 3)} />
        </div>
      )}
      {eq && <div className="eq eq--sm">{eq}</div>}
    </div>
  )
}

export function QuestionVisual({ q }) {
  const v = q.visual
  switch (v.kind) {
    case 'listen': return <Listen say={q.say} fallback={v.fallback} />
    case 'bigLetter': return <div className="bigletter" key={v.text}>{v.text}</div>
    case 'picture': return <Picture emoji={v.emoji} word={v.word} />
    case 'count': return <Items emoji={v.emoji} n={v.n} />
    case 'tenFrame': return <TenFrame a={v.a} b={v.b} eq={v.eq} />
    case 'equation': return <div className="eq eq--big">{v.text}</div>
    case 'compare': return <Compare a={v.a} b={v.b} />
    case 'sequence': return <Sequence items={v.items} blank={v.blank} />
    case 'blocks': return <Blocks hundreds={v.hundreds} tens={v.tens} ones={v.ones} />
    case 'coins': return <Coins coins={v.coins} />
    case 'story': return <Story a={v.a} b={v.b} sub={v.sub} emoji={v.emoji} />
    case 'storyIcon': return <div className="story-icon" aria-hidden="true">{v.emoji}</div>
    case 'array': return <ArrayGrid rows={v.rows} cols={v.cols} emoji={v.emoji} />
    case 'fraction': return <Fraction parts={v.parts} shaded={v.shaded} shape={v.shape} />
    case 'clock': return <Clock h={v.h} m={v.m} />
    default: return null
  }
}

export function HelpVisual({ help }) {
  let body = null
  switch (help.kind) {
    case 'letter':
      body = (
        <div className="letter-pair">
          <span className="letter-pair__big">{help.upper}</span>
          <span className="letter-pair__little">{help.lower}</span>
        </div>
      )
      break
    case 'word': body = <Picture emoji={help.emoji} word={help.word} reveal />; break
    case 'countAlong': body = <CountAlong emoji={help.emoji} n={help.n} />; break
    case 'groups':
      body = (
        <div className="groups">
          <div className="groups__one"><Items emoji={help.emoji} n={help.a} cols={Math.min(help.a, 4)} small /><b>{help.a}</b></div>
          <div className="groups__one"><Items emoji={help.emoji} n={help.b} cols={Math.min(help.b, 4)} small /><b>{help.b}</b></div>
        </div>
      )
      break
    case 'tenFrameCount': body = <TenFrameCount a={help.a} b={help.b} />; break
    case 'numberLine': body = <NumberLine start={help.start} delta={help.delta} max={help.max} />; break
    case 'compare': body = <Compare a={help.a} b={help.b} sym={help.sym} />; break
    case 'sequence': body = <Sequence items={help.items} blank={help.blank} step={help.step} reveal />; break
    case 'blocks': body = <Blocks hundreds={help.hundreds} tens={help.tens} ones={help.ones} explain />; break
    case 'split':
      body = (
        <div className="split">
          {help.rows.map((r, i) => <div key={i} className={'eq eq--sm' + (i === help.rows.length - 1 ? ' is-last' : '')} style={{ '--i': i }}>{r}</div>)}
        </div>
      )
      break
    case 'shape':
      body = (
        <div className="shape-help">
          <Shape kind={help.shape} tone="blue" size={140} />
          <b>{SHAPES[help.shape].name}</b>
        </div>
      )
      break
    case 'array': body = <ArrayGrid rows={help.rows} cols={help.cols} emoji={help.emoji} totals />; break
    case 'share':
      body = (
        <div className="groups groups--share">
          {Array.from({ length: help.groups }, (_, g) => (
            <div key={g} className="groups__one" style={{ '--i': g }}>
              <Items emoji={help.emoji} n={help.each} cols={Math.min(help.each, 3)} small />
              <b>{help.each}</b>
            </div>
          ))}
        </div>
      )
      break
    case 'fraction': body = <Fraction parts={help.parts} shaded={help.shaded} shape={help.shape} labelled />; break
    case 'clock': body = <Clock h={help.h} m={help.m} size={180} />; break
    case 'coinFact': {
      const c = COINS[help.coin]
      body = (
        <div className="coin-fact">
          <Coin kind={help.coin} size={120} />
          <p>The <b>{c.name}</b> is worth <b>{c.worth}</b>. {c.fact}</p>
        </div>
      )
      break
    }
    case 'coinCount': body = <Coins coins={help.coins} running />; break
    case 'spell':
      body = (
        <div className="spell" aria-label={help.word}>
          {help.word.split('').map((ch, i) => <span key={i} className="spell__ch" style={{ '--i': i }}>{ch}</span>)}
        </div>
      )
      break
    case 'story': body = <Story a={help.a} b={help.b} sub={help.sub} emoji={help.emoji} eq={help.eq} />; break
    default: body = null
  }
  return (
    <div className="help-visual">
      {body}
      {help.lines && (
        <div className="help-lines">
          {help.lines.map((l, i) => <p key={i}>{l}</p>)}
        </div>
      )}
    </div>
  )
}
