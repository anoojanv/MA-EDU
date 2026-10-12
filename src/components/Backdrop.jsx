import React from 'react'

// Slow-drifting shapes behind every screen.
export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <svg className="bd bd--1" viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" /></svg>
      <svg className="bd bd--2" viewBox="0 0 100 100"><path d="M50 10 L90 86 L10 86 Z" strokeLinejoin="round" strokeWidth="12" /></svg>
      <svg className="bd bd--3" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" rx="24" /></svg>
      <svg className="bd bd--4" viewBox="0 0 120 40"><path d="M6 20 Q 21 2 36 20 T 66 20 T 96 20 T 114 20" fill="none" strokeWidth="8" strokeLinecap="round" /></svg>
      <svg className="bd bd--5" viewBox="0 0 100 100"><path d="M50 4 L61 38 L97 38 L68 59 L79 94 L50 72 L21 94 L32 59 L3 38 L39 38 Z" strokeLinejoin="round" strokeWidth="6" /></svg>
    </div>
  )
}
