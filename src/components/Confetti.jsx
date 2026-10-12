import React, { useEffect, useRef } from 'react'

// One full-screen canvas; any component can call burst() or rain().
let api = null
export const burst = (x, y, opts) => api && api.burst(x, y, opts)
export const rain = (opts) => api && api.rain(opts)

function drawStar(ctx, r) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.45 : r
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr)
  }
  ctx.closePath()
  ctx.fill()
}

export function Confetti() {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let parts = []
    let raf = 0
    const fit = () => {
      cv.width = window.innerWidth * dpr
      cv.height = window.innerHeight * dpr
    }
    fit()
    window.addEventListener('resize', fit)
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const colors = () => {
      const s = getComputedStyle(document.documentElement)
      return ['--red', '--blue', '--yellow', '--green', '--clay'].map((v) => s.getPropertyValue(v).trim() || '#fbbc04')
    }
    const shapes = ['rect', 'circle', 'star']
    const loop = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      parts = parts.filter((p) => p.life > 0 && p.y < window.innerHeight + 40)
      for (const p of parts) {
        p.vy += p.g
        p.vx *= 0.99
        p.x += p.vx
        p.y += p.vy
        p.rot += p.vr
        p.life -= 1
        ctx.save()
        ctx.translate(p.x * dpr, p.y * dpr)
        ctx.rotate(p.rot)
        ctx.globalAlpha = Math.min(1, p.life / 30)
        ctx.fillStyle = p.c
        if (p.shape === 'star') drawStar(ctx, 7 * dpr)
        else if (p.shape === 'circle') {
          ctx.beginPath()
          ctx.arc(0, 0, 4 * dpr, 0, Math.PI * 2)
          ctx.fill()
        } else ctx.fillRect(-5 * dpr, -3 * dpr, 10 * dpr, 6 * dpr)
        ctx.restore()
      }
      raf = parts.length ? requestAnimationFrame(loop) : 0
    }
    const start = () => {
      if (!raf) raf = requestAnimationFrame(loop)
    }
    api = {
      burst(x, y, { count = 34, power = 9 } = {}) {
        const cs = colors()
        const n = reduced ? Math.round(count / 4) : count
        for (let i = 0; i < n; i++) {
          const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2
          const sp = power * (0.5 + Math.random() * 0.7)
          parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 0.32, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 90 + Math.random() * 40, c: cs[i % cs.length], shape: shapes[i % 3] })
        }
        start()
      },
      rain({ count = 170 } = {}) {
        const cs = colors()
        const n = reduced ? 30 : count
        for (let i = 0; i < n; i++) {
          parts.push({ x: Math.random() * window.innerWidth, y: -20 - Math.random() * window.innerHeight * 0.7, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, g: 0.05, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, life: 280, c: cs[i % cs.length], shape: shapes[i % 3] })
        }
        start()
      },
    }
    return () => {
      api = null
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', fit)
    }
  }, [])
  return <canvas ref={ref} className="confetti" aria-hidden="true" />
}
