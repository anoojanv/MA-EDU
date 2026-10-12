// Read-aloud (Web Speech) and sound effects (Web Audio). No audio files needed.

let muted = false
export function setMuted(m) {
  muted = !!m
  if (muted) stopSpeaking()
}

export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

let voice = null
function pickVoice() {
  try {
    const vs = window.speechSynthesis.getVoices()
    voice =
      vs.find((v) => /en-CA/i.test(v.lang)) ||
      vs.find((v) => /en-(US|GB)/i.test(v.lang) && /google|samantha|female/i.test(v.name)) ||
      vs.find((v) => /^en/i.test(v.lang)) ||
      null
  } catch {
    voice = null
  }
}
if (canSpeak) {
  try {
    pickVoice()
    window.speechSynthesis.onvoiceschanged = pickVoice
  } catch {}
}

export function speak(text, { rate = 0.9 } = {}) {
  if (muted || !canSpeak || !text) return
  try {
    window.speechSynthesis.cancel()
    if (!voice) pickVoice()
    const u = new SpeechSynthesisUtterance(text)
    if (voice) u.voice = voice
    u.lang = voice?.lang || 'en-CA'
    u.rate = rate
    u.pitch = 1.1
    window.speechSynthesis.speak(u)
  } catch {}
}

export function stopSpeaking() {
  try {
    if (canSpeak) window.speechSynthesis.cancel()
  } catch {}
}

let ctx = null
function ac() {
  try {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext
      if (!C) return null
      ctx = new C()
    }
    if (ctx.state === 'suspended') ctx.resume()
    return ctx
  } catch {
    return null
  }
}

function tone(freq, start, dur, type = 'sine', gain = 0.12) {
  const c = ac()
  if (!c) return
  const t0 = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g).connect(c.destination)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

const play = (fn) => () => {
  if (!muted) fn()
}

export const sfx = {
  correct: play(() => [523, 659, 784].forEach((f, i) => tone(f, i * 0.08, 0.2, 'triangle'))),
  wrong: play(() => {
    tone(260, 0, 0.16, 'triangle', 0.08)
    tone(200, 0.12, 0.24, 'triangle', 0.07)
  }),
  pop: play(() => {
    tone(900, 0, 0.06, 'square', 0.04)
    tone(1400, 0.03, 0.08, 'sine', 0.06)
  }),
  tap: play(() => tone(660, 0, 0.05, 'sine', 0.05)),
  step: play(() => [392, 523].forEach((f, i) => tone(f, i * 0.1, 0.18, 'triangle', 0.1))),
  fanfare: play(() => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.26, 'triangle', 0.11))),
}
