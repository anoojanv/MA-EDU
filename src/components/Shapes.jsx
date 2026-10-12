import React from 'react'

// Simple SVG drawings for the newer skills: shapes, clocks, fractions and arrays.

const SHAPE_PATHS = {
  circle: <circle cx="50" cy="50" r="40" />,
  square: <rect x="14" y="14" width="72" height="72" rx="4" />,
  triangle: <path d="M50 10 L90 86 L10 86 Z" strokeLinejoin="round" />,
  rectangle: <rect x="6" y="26" width="88" height="50" rx="4" />,
  star: <path d="M50 8 L61 38 L93 38 L67 57 L77 89 L50 70 L23 89 L33 57 L7 38 L39 38 Z" strokeLinejoin="round" />,
  heart: <path d="M50 88 C 18 66 6 48 6 32 C 6 18 17 8 30 8 C 40 8 46 14 50 22 C 54 14 60 8 70 8 C 83 8 94 18 94 32 C 94 48 82 66 50 88 Z" />,
  hexagon: <path d="M28 12 L72 12 L94 50 L72 88 L28 88 L6 50 Z" strokeLinejoin="round" />,
  oval: <ellipse cx="50" cy="50" rx="44" ry="30" />,
}

export function Shape({ kind, tone = 'blue', size = 84 }) {
  return (
    <svg className={`shape tone-${tone}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <g className="shape__fill">{SHAPE_PATHS[kind]}</g>
    </svg>
  )
}

export function Clock({ h, m, size = 220 }) {
  const minuteAngle = m * 6
  const hourAngle = (h % 12) * 30 + m * 0.5
  return (
    <svg className="clock" width={size} height={size} viewBox="-110 -110 220 220" role="img" aria-label="Clock">
      <circle r="100" className="clock__face" />
      {Array.from({ length: 60 }, (_, i) => (
        <line key={i} y1={-92} y2={i % 5 === 0 ? -80 : -87} className={i % 5 === 0 ? 'clock__tick clock__tick--big' : 'clock__tick'} transform={`rotate(${i * 6})`} />
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const n = i + 1
        const t = (n * Math.PI) / 6
        return <text key={n} x={Math.sin(t) * 64} y={-Math.cos(t) * 64 + 9} textAnchor="middle" className="clock__num">{n}</text>
      })}
      <line y2={-50} className="clock__hour" transform={`rotate(${hourAngle})`} />
      <line y2={-78} className="clock__minute" transform={`rotate(${minuteAngle})`} />
      <circle r="6" className="clock__pin" />
    </svg>
  )
}

export function Fraction({ parts, shaded, shape = 'pie', labelled, size = 200 }) {
  if (shape === 'bar') {
    const w = 200 / parts
    return (
      <svg className="fraction" width={size * 1.4} height={size * 0.5} viewBox="-4 -4 208 68" role="img" aria-label={`${shaded} of ${parts} parts coloured`}>
        {Array.from({ length: parts }, (_, i) => (
          <g key={i}>
            <rect x={i * w} y="0" width={w} height="60" className={'fraction__part' + (i < shaded ? ' is-on' : '')} style={{ '--i': i }} />
            {labelled && <text x={i * w + w / 2} y="38" textAnchor="middle" className="fraction__label">1/{parts}</text>}
          </g>
        ))}
      </svg>
    )
  }
  const R = 90
  const pt = (k) => [Math.sin((k / parts) * 2 * Math.PI) * R, -Math.cos((k / parts) * 2 * Math.PI) * R]
  return (
    <svg className="fraction" width={size} height={size} viewBox="-100 -100 200 200" role="img" aria-label={`${shaded} of ${parts} parts coloured`}>
      {Array.from({ length: parts }, (_, i) => {
        const [x1, y1] = pt(i), [x2, y2] = pt(i + 1)
        const mid = pt(i + 0.5)
        return (
          <g key={i}>
            <path d={`M0 0 L${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2} Z`} className={'fraction__part' + (i < shaded ? ' is-on' : '')} style={{ '--i': i }} />
            {labelled && <text x={mid[0] * 0.58} y={mid[1] * 0.58 + 6} textAnchor="middle" className="fraction__label">1/{parts}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export function ArrayGrid({ rows, cols, emoji, totals }) {
  return (
    <div className="array">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="array__row" style={{ '--i': r }}>
          {Array.from({ length: cols }, (_, c) => <span key={c} className="array__item">{emoji}</span>)}
          {totals && <b className="array__total">{(r + 1) * cols}</b>}
        </div>
      ))}
    </div>
  )
}
