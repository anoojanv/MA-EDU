export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

// How the read-aloud voice should say each letter's name. Canadian "zed".
export const LETTER_NAMES = {
  A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye',
  J: 'jay', K: 'kay', L: 'ell', M: 'em', N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'ar',
  S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zed',
}

// Letters that share a first sound, so they never appear as wrong answers to each other.
export const SAME_SOUND = { C: ['K', 'S'], K: ['C'], S: ['C'], G: ['J'], J: ['G'] }

// Lowercase letters kids flip around. Mixed in once a skill is going well.
export const MIRRORS = { B: ['D', 'P'], D: ['B', 'Q'], P: ['Q', 'B'], Q: ['P', 'D'] }

export const PICTURES = [
  { w: 'apple', e: '🍎' }, { w: 'ant', e: '🐜' },
  { w: 'banana', e: '🍌' }, { w: 'bear', e: '🐻' },
  { w: 'cat', e: '🐱' }, { w: 'cake', e: '🎂' },
  { w: 'dog', e: '🐶' }, { w: 'duck', e: '🦆' },
  { w: 'egg', e: '🥚' }, { w: 'elephant', e: '🐘' },
  { w: 'fish', e: '🐟' }, { w: 'frog', e: '🐸' },
  { w: 'goat', e: '🐐' }, { w: 'grapes', e: '🍇' },
  { w: 'hat', e: '🎩' }, { w: 'horse', e: '🐴' },
  { w: 'insect', e: '🐛' },
  { w: 'juice', e: '🧃' },
  { w: 'kite', e: '🪁' }, { w: 'koala', e: '🐨' },
  { w: 'lion', e: '🦁' }, { w: 'lemon', e: '🍋' }, { w: 'leaf', e: '🍁' },
  { w: 'moon', e: '🌙' }, { w: 'monkey', e: '🐒' },
  { w: 'nose', e: '👃' }, { w: 'nest', e: '🪺' },
  { w: 'octopus', e: '🐙' },
  { w: 'pig', e: '🐷' }, { w: 'pizza', e: '🍕' },
  { w: 'rabbit', e: '🐰' }, { w: 'rainbow', e: '🌈' },
  { w: 'sun', e: '☀️' }, { w: 'snake', e: '🐍' },
  { w: 'tiger', e: '🐯' }, { w: 'turtle', e: '🐢' },
  { w: 'umbrella', e: '☂️' },
  { w: 'van', e: '🚐' },
  { w: 'whale', e: '🐳' }, { w: 'watermelon', e: '🍉' },
  { w: 'yo-yo', e: '🪀' }, { w: 'yarn', e: '🧶' },
  { w: 'zebra', e: '🦓' },
]
