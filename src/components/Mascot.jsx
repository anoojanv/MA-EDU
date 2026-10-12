import React from 'react'

// Pip: the app's guide. Moods: idle, wave, cheer, oops, think.
const MOUTHS = {
  idle: 'M46 76 Q60 87 74 76',
  wave: 'M44 74 Q60 90 76 74',
  cheer: 'M42 72 Q60 100 78 72 Z',
  oops: 'M52 82 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0',
  think: 'M49 80 Q60 76 71 80',
}

export function Mascot({ mood = 'idle', size = 96, className = '' }) {
  const open = mood === 'cheer' || mood === 'oops'
  return (
    <div className={`mascot is-${mood} ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 120 120" overflow="visible">
        <g className="mascot__bob">
          <path className="mascot__antenna" d="M60 22 Q 63 12 71 9" />
          <circle className="mascot__tip" cx="72" cy="9" r="6" />
          <path className="mascot__arm mascot__arm--l" d="M20 76 Q 8 72 6 60" />
          <path className="mascot__arm mascot__arm--r" d="M100 76 Q 112 72 114 60" />
          <path className="mascot__body" d="M60 20 C 92 20 106 46 104 72 C 102 98 84 110 60 110 C 36 110 18 98 16 72 C 14 46 28 20 60 20 Z" />
          <ellipse className="mascot__belly" cx="60" cy="92" rx="25" ry="13" />
          <g className="mascot__eyes">
            <ellipse cx="45" cy="57" rx="7" ry="9" className="mascot__eye" />
            <ellipse cx="75" cy="57" rx="7" ry="9" className="mascot__eye" />
            <circle cx="47.5" cy="53.5" r="2.4" className="mascot__glint" />
            <circle cx="77.5" cy="53.5" r="2.4" className="mascot__glint" />
          </g>
          <circle cx="33" cy="74" r="6" className="mascot__cheek" />
          <circle cx="87" cy="74" r="6" className="mascot__cheek" />
          <path className={'mascot__mouth' + (open ? ' is-open' : '')} d={MOUTHS[mood] || MOUTHS.idle} />
        </g>
      </svg>
    </div>
  )
}
