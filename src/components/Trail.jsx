import React from 'react'

// The daily path. Aiden runs a baseball diamond; Aliya's butterfly visits a flower garden.
// `current` is how many of the 4 stops are done (0–4).

const DIAMOND = {
  start: [116, 268], // the batter's box, beside home plate
  stops: [[268, 150], [160, 42], [52, 150], [160, 258]],
  names: ['1st base', '2nd base', '3rd base', 'Home'],
}

const GARDEN = {
  start: [40, 256],
  stops: [[118, 196], [222, 226], [280, 132], [190, 54]],
  names: ['Red flower', 'Yellow flower', 'Blue flower', 'Big sunflower'],
}

export const TRAIL_NAMES = { diamond: DIAMOND.names, garden: GARDEN.names }

function DiamondField() {
  return (
    <g className="field">
      <path className="field__grass" d="M160 2 C 260 2 318 90 318 160 L 160 298 L 2 160 C 2 90 60 2 160 2 Z" />
      <path className="field__dirt" d="M160 258 L268 150 L160 42 L52 150 Z" />
      <path className="field__infield" d="M160 228 L238 150 L160 72 L82 150 Z" />
      <circle className="field__mound" cx="160" cy="150" r="13" />
      <path className="field__chalk" d="M160 258 L 310 108 M160 258 L 10 108" />
    </g>
  )
}

function GardenBed() {
  return (
    <g className="garden">
      <ellipse className="garden__lawn" cx="160" cy="160" rx="158" ry="136" />
      <path className="garden__path" d="M40 256 C 70 226 90 204 118 196 S 196 244 222 226 S 296 176 280 132 S 232 58 190 54" />
      <circle className="garden__sun" cx="56" cy="56" r="20" />
    </g>
  )
}

const BLOOMS = ['🌷', '🌼', '🪻', '🌻']

export function Trail({ theme = 'diamond', current = 0, avatar, steps }) {
  const L = theme === 'garden' ? GARDEN : DIAMOND
  const pos = current === 0 ? L.start : L.stops[Math.min(current, 4) - 1]
  const done = current >= 4
  return (
    <div className={`trail trail--${theme}${done ? ' is-done' : ''}`}>
      <svg viewBox="0 0 320 300" role="img" aria-label={`${current} of 4 stops done today`}>
        {theme === 'garden' ? <GardenBed /> : <DiamondField />}
        {L.stops.map(([x, y], i) => {
          const isDone = i < current
          const isNext = i === current
          return (
            <g key={i} className={'stop' + (isDone ? ' is-done' : '') + (isNext ? ' is-next' : '')} transform={`translate(${x} ${y})`}>
              <g className="stop__shape">
                {theme === 'diamond' ? (
                  <rect className="stop__base" x="-15" y="-15" width="30" height="30" rx="5" transform="rotate(45)" />
                ) : (
                  <circle className="stop__bud" r="17" />
                )}
              </g>
              <text className="stop__icon" y="7" textAnchor="middle">
                {isDone ? (theme === 'garden' ? BLOOMS[i] : '⭐') : steps?.[i]?.icon || i + 1}
              </text>
            </g>
          )
        })}
        <g className="runner" style={{ transform: `translate(${pos[0]}px, ${pos[1] - 34}px)` }}>
          <g className="runner__hop">
            <ellipse className="runner__shadow" cx="0" cy="30" rx="13" ry="4" />
            <circle className="runner__bubble" r="19" />
            <text className="runner__face" y="8" textAnchor="middle">{avatar}</text>
          </g>
        </g>
      </svg>
    </div>
  )
}
