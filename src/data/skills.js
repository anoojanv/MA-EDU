import { rint, pick, shuffle, sample, numberChoices } from '../lib/random.js'
import { LETTERS, LETTER_NAMES, PICTURES, SAME_SOUND, MIRRORS } from './letters.js'
import { SIGHT_WORDS, wordsUpTo } from './words.js'
import { COINS, COIN_KINDS, money } from './coins.js'

export const LEVELS = [
  { id: 'prek', name: 'Pre-K', long: 'Preschool' },
  { id: 'jk', name: 'JK', long: 'Junior Kindergarten' },
  { id: 'sk', name: 'SK', long: 'Senior Kindergarten' },
  { id: 'g1', name: 'Grade 1', long: 'Grade 1' },
  { id: 'g2', name: 'Grade 2', long: 'Grade 2' },
  { id: 'g3', name: 'Grade 3', long: 'Grade 3' },
]

export const SUBJECTS = {
  letters: { name: 'Letters and sounds', tone: 'red' },
  counting: { name: 'Counting', tone: 'blue' },
  math: { name: 'Number sense', tone: 'blue' },
  money: { name: 'Money', tone: 'yellow' },
  reading: { name: 'Reading', tone: 'green' },
  stories: { name: 'Story problems', tone: 'clay' },
  shapes: { name: 'Shapes', tone: 'green' },
  time: { name: 'Time', tone: 'yellow' },
  multiply: { name: 'Multiplying and sharing', tone: 'clay' },
  fractions: { name: 'Fractions', tone: 'red' },
}

const THINGS = ['🍎', '⭐', '🐞', '🌼', '🚗', '🐟', '🧁', '🦆', '🍓', '🎈', '🦋', '🍁']
const opt = (value, label) => ({ value, label: label ?? String(value) })

// Letters for a question: the target comes from the unit's letters,
// wrong answers come from the unit first, then the rest of the alphabet.
function letterSet(params, wrongCount) {
  const pool = [...new Set((params?.letters || LETTERS.join('')).toUpperCase().split(''))]
  const target = pick(pool)
  let wrong = pool.filter((l) => l !== target)
  if (wrong.length < wrongCount) wrong = wrong.concat(sample(LETTERS.filter((l) => l !== target && !wrong.includes(l)), wrongCount - wrong.length))
  return { target, wrong: sample(wrong, wrongCount) }
}

// Story problems take place in each child's own world.
const STORIES = {
  diamond: [
    { add: (w, a, b) => ({ e: '⚾', s: `${w} hit ${a} balls at batting practice, then ${b} more. How many balls did ${w} hit?` }),
      sub: (w, a, b) => ({ e: '⚾', s: `There were ${a} baseballs in the bucket. The coach took out ${b}. How many are left?` }) },
    { add: (w, a, b) => ({ e: '🧢', s: `The team scored ${a} runs in the first game and ${b} runs in the second. How many runs in all?` }),
      sub: (w, a, b) => ({ e: '🌭', s: `The snack stand had ${a} hot dogs. Fans bought ${b}. How many are left?` }) },
  ],
  garden: [
    { add: (w, a, b) => ({ e: '🌱', s: `${w} planted ${a} seeds, then ${b} more. How many seeds did ${w} plant?` }),
      sub: (w, a, b) => ({ e: '🦋', s: `There were ${a} butterflies in the garden. ${b} flew away. How many are still there?` }) },
    { add: (w, a, b) => ({ e: '🐝', s: `${a} bees visited the sunflowers and ${b} bees visited the roses. How many bees in all?` }),
      sub: (w, a, b) => ({ e: '🍓', s: `${w} picked ${a} strawberries and ate ${b}. How many are left?` }) },
  ],
  space: [
    { add: (w, a, b) => ({ e: '🚀', s: `${w}’s rocket flew past ${a} stars, then ${b} more. How many stars did it pass?` }),
      sub: (w, a, b) => ({ e: '🧑‍🚀', s: `There were ${a} astronauts on the space station. ${b} flew home. How many are still there?` }) },
    { add: (w, a, b) => ({ e: '🪐', s: `${w} counted ${a} moons around one planet and ${b} around another. How many moons in all?` }),
      sub: (w, a, b) => ({ e: '☄️', s: `The rocket had ${a} litres of fuel and used ${b}. How much fuel is left?` }) },
  ],
}

/** Worked rows for adding or subtracting by place value. */
function splitRows(a, b, sub) {
  const ans = sub ? a - b : a + b
  if (sub) return [`${a} − ${b}`, `Count back to ${a} − ${b - (b % 10)} = ${a - (b - (b % 10))}`, `Then back ${b % 10} more: ${ans}`]
  const big = (n) => n - (n % 10)
  return [`${a} + ${b}`, `Big parts: ${big(a)} + ${big(b)} = ${big(a) + big(b)}`, `Ones: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)}`, `${big(a) + big(b)} + ${(a % 10) + (b % 10)} = ${ans}`]
}

export const SHAPES = {
  circle: { name: 'circle', fact: 'A circle is round. It has no corners.' },
  square: { name: 'square', fact: 'A square has 4 sides that are all the same.' },
  triangle: { name: 'triangle', fact: 'A triangle has 3 sides and 3 corners.' },
  rectangle: { name: 'rectangle', fact: 'A rectangle has 4 sides: 2 long and 2 short.' },
  star: { name: 'star', fact: 'A star has 5 points.' },
  heart: { name: 'heart', fact: 'A heart is round on top and pointy on the bottom.' },
  hexagon: { name: 'hexagon', fact: 'A hexagon has 6 sides, like a honeycomb.' },
  oval: { name: 'oval', fact: 'An oval is like a stretched circle, like an egg.' },
}
const SHAPE_KINDS = Object.keys(SHAPES)

const FRACTION_WORDS = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['fourth', 'fourths'], 6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'] }

export const SKILLS = [
  // ───────── Pre-K to SK ─────────
  {
    id: 'letter-pop', levels: ['prek', 'jk', 'sk'], subject: 'letters', icon: '🎈',
    title: 'Pop the letter', desc: 'Hear a letter, pop its balloon',
    generate({ score, params }) {
      const little = params?.little || (score >= 60 && Math.random() < 0.5)
      const { target, wrong } = letterSet(params, score >= 40 ? 4 : 3)
      const name = LETTER_NAMES[target]
      const show = (l) => (little ? l.toLowerCase() : l)
      return {
        prompt: little ? 'Pop the little letter you hear' : 'Pop the letter you hear',
        say: little ? `Pop the little ${name}` : `Pop the letter ${name}`,
        visual: { kind: 'listen', fallback: show(target) },
        input: 'balloons',
        choices: shuffle([target, ...wrong]).map((l) => opt(l, show(l))),
        answer: target,
        answerLabel: show(target),
        help: { kind: 'letter', upper: target, lower: target.toLowerCase(), say: `This is ${name}. Big ${name}, little ${name}.` },
      }
    },
  },
  {
    id: 'big-little', levels: ['prek', 'jk', 'sk'], subject: 'letters', icon: '🔠',
    title: 'Big and little', desc: 'Match capital and lowercase letters',
    generate({ score, params }) {
      const flip = score >= 50 && Math.random() < 0.5
      let { target, wrong } = letterSet(params, 3)
      if (score >= 70 && MIRRORS[target]) wrong = [...MIRRORS[target], ...wrong].filter((l, i, a) => a.indexOf(l) === i).slice(0, 3)
      const name = LETTER_NAMES[target]
      return {
        prompt: flip ? 'Which big letter matches?' : 'Which little letter matches?',
        say: flip ? `Find the big letter that goes with little ${name}` : `Find the little letter that goes with big ${name}`,
        visual: { kind: 'bigLetter', text: flip ? target.toLowerCase() : target },
        input: 'choice', choiceStyle: 'letter',
        choices: shuffle([target, ...wrong]).map((l) => opt(l, flip ? l : l.toLowerCase())),
        answer: target,
        answerLabel: flip ? target : target.toLowerCase(),
        help: { kind: 'letter', upper: target, lower: target.toLowerCase(), say: `Big ${name} and little ${name} go together.` },
      }
    },
  },
  {
    id: 'first-sound', levels: ['jk', 'sk'], subject: 'letters', icon: '🐸',
    title: 'First sounds', desc: 'Which letter does the word start with?',
    generate({ score, params }) {
      const allowed = params?.letters ? params.letters.split('') : LETTERS
      const pics = PICTURES.filter((p) => allowed.includes(p.w[0].toUpperCase()))
      const p = pick(pics.length ? pics : PICTURES)
      const letter = p.w[0].toUpperCase()
      const avoid = new Set([letter, ...(SAME_SOUND[letter] || [])])
      const near = allowed.filter((l) => !avoid.has(l))
      const far = LETTERS.filter((l) => !avoid.has(l) && !near.includes(l))
      const n = score >= 50 ? 3 : 2
      const wrong = sample(near, n).concat(sample(far, n)).slice(0, n)
      return {
        prompt: 'What sound does it start with?',
        say: `${p.w}. Which letter does ${p.w} start with?`,
        visual: { kind: 'picture', emoji: p.e, word: p.w },
        input: 'choice', choiceStyle: 'letter',
        choices: shuffle([letter, ...wrong]).map((l) => opt(l)),
        answer: letter, answerLabel: letter,
        help: { kind: 'word', word: p.w, emoji: p.e, say: `${p.w} starts with ${LETTER_NAMES[letter]}.` },
      }
    },
  },
  {
    id: 'count', levels: ['prek', 'jk', 'sk'], byLevel: { prek: { max: 5 }, sk: { max: 20 } }, subject: 'counting', icon: '🐞',
    title: 'How many?', desc: 'Count the things and pick the number',
    generate({ score, params }) {
      const max = params?.max || 10
      const lo = Math.min(max, score < 40 ? 1 : score < 75 ? Math.ceil(max / 3) : Math.ceil(max / 2))
      const hi = score < 40 ? Math.min(max, Math.max(3, Math.ceil(max / 2))) : max
      const n = rint(lo, hi)
      const emoji = pick(THINGS)
      return {
        prompt: 'How many do you see?', say: 'How many? Count them!',
        visual: { kind: 'count', emoji, n },
        input: 'choice', choiceStyle: 'number',
        choices: numberChoices(n, { count: max <= 5 ? 3 : 4, min: 1, max: Math.max(max, 5) }).map((v) => opt(v)),
        answer: n, answerLabel: String(n),
        help: { kind: 'countAlong', emoji, n },
      }
    },
  },
  {
    id: 'more-fewer', levels: ['prek', 'jk', 'sk'], byLevel: { prek: { max: 5 } }, subject: 'counting', icon: '⚖️',
    title: 'More or fewer', desc: 'Which group has more?',
    generate({ score, params }) {
      const max = params?.max || 9
      const fewer = score >= 50 && Math.random() < 0.4
      const a = rint(1, max - 1)
      let b = a
      while (b === a) b = score >= 60 ? Math.max(1, Math.min(max, a + pick([-2, -1, 1, 2]))) : rint(1, max)
      const emoji = pick(THINGS)
      const big = Math.max(a, b), small = Math.min(a, b)
      const want = fewer ? (a < b ? 'L' : 'R') : a > b ? 'L' : 'R'
      const q = fewer ? 'Which group has fewer?' : 'Which group has more?'
      return {
        prompt: q, say: q,
        visual: { kind: 'none' },
        input: 'choice', choiceStyle: 'group',
        choices: [
          { value: 'L', kind: 'group', emoji, n: a, label: String(a) },
          { value: 'R', kind: 'group', emoji, n: b, label: String(b) },
        ],
        answer: want,
        answerLabel: `the group of ${fewer ? small : big}`,
        help: {
          kind: 'groups', emoji, a, b,
          lines: [fewer ? `${small} is fewer than ${big}.` : `${big} is more than ${small}.`],
          say: fewer ? `${small} is fewer than ${big}` : `${big} is more than ${small}`,
        },
      }
    },
  },

  // ───────── Grade 1 and up ─────────
  {
    id: 'ten-frame', levels: ['sk', 'g1'], subject: 'math', icon: '🔟',
    title: 'Ten-frame adding', desc: 'Add two groups of dots up to 10',
    generate({ score, params }) {
      const max = params?.max || 10
      const sum = score < 40 ? rint(2, Math.min(6, max)) : rint(4, max)
      const a = rint(1, sum - 1), b = sum - a
      return {
        prompt: 'Add the blue dots and the red dots', say: `${a} plus ${b}`,
        visual: { kind: 'tenFrame', a, b, eq: `${a} + ${b} = ?` },
        input: 'keypad',
        answer: sum, answerLabel: String(sum),
        help: { kind: 'tenFrameCount', a, b, say: `${a} and ${b} more makes ${sum}.` },
      }
    },
  },
  {
    id: 'add-sub-20', levels: ['g1', 'g2'], subject: 'math', icon: '🐸',
    title: 'Add and take away', desc: 'Number sentences up to 20',
    generate({ score, params }) {
      const ops = params?.ops || '+-'
      const sub = ops === '-' || (ops.includes('-') && score >= 30 && Math.random() < 0.5)
      let a, b, ans
      if (sub) { a = rint(score < 60 ? 5 : 10, 20); b = rint(1, Math.min(10, a - 1)); ans = a - b }
      else { a = rint(2, score < 60 ? 10 : 15); b = rint(1, Math.min(10, 20 - a)); ans = a + b }
      return {
        prompt: sub ? 'Take away' : 'Add', say: sub ? `${a} take away ${b}` : `${a} plus ${b}`,
        visual: { kind: 'equation', text: `${a} ${sub ? '−' : '+'} ${b} = ?` },
        input: 'keypad',
        answer: ans, answerLabel: String(ans),
        help: { kind: 'numberLine', start: a, delta: sub ? -b : b, max: 20, say: `Start at ${a}. Hop ${b} ${sub ? 'back' : 'forward'}. You land on ${ans}.` },
      }
    },
  },
  {
    id: 'tens-ones', levels: ['g1', 'g2'], subject: 'math', icon: '🧱',
    title: 'Tens and ones', desc: 'Read numbers built from blocks',
    generate({ score, params }) {
      const max = params?.max || 99
      const n = score < 40 ? rint(11, Math.min(39, max)) : score < 75 ? rint(20, Math.min(69, max)) : rint(Math.min(40, max - 10), max)
      const tens = Math.floor(n / 10), ones = n % 10
      return {
        prompt: 'What number do the blocks show?', say: 'What number is this? Count the tens, then the ones.',
        visual: { kind: 'blocks', tens, ones },
        input: 'keypad',
        answer: n, answerLabel: String(n),
        help: { kind: 'blocks', tens, ones, explain: true, say: `${tens} tens and ${ones} ones make ${n}.` },
      }
    },
  },
  {
    id: 'compare', levels: ['g1', 'g2', 'g3'], byLevel: { g3: { max: 999 } }, subject: 'math', icon: '🐊',
    title: 'Greater or less', desc: 'Compare numbers with < = >',
    generate({ score, params }) {
      const max = params?.max || (score < 50 ? 20 : 99)
      const a = rint(0, max)
      let b
      const r = Math.random()
      if (r < 0.15) b = a
      else if (max > 20 && r < 0.45 && a >= 10 && a % 10 !== Math.floor(a / 10)) b = (a % 10) * 10 + Math.floor(a / 10)
      else { b = a; while (b === a) b = Math.max(0, Math.min(max, a + rint(-9, 9))) }
      const sym = a > b ? '>' : a < b ? '<' : '='
      const big = Math.max(a, b), small = Math.min(a, b)
      const line = sym === '=' ? `${a} and ${b} are the same.` : `${big} is greater than ${small}.`
      return {
        prompt: 'Which sign makes it true?', say: `Compare ${a} and ${b}`,
        visual: { kind: 'compare', a, b },
        input: 'choice', choiceStyle: 'symbol',
        choices: [
          { value: '<', label: '<', sub: 'less than' },
          { value: '=', label: '=', sub: 'equal to' },
          { value: '>', label: '>', sub: 'greater than' },
        ],
        answer: sym, answerLabel: sym,
        help: { kind: 'compare', a, b, sym, lines: [line, 'The open side faces the bigger number.'], say: line },
      }
    },
  },
  {
    id: 'skip-count', levels: ['sk', 'g1', 'g2', 'g3'], byLevel: { sk: { steps: [10] }, g2: { steps: [2, 5, 10, 25] }, g3: { steps: [3, 4, 25, 100] } }, subject: 'math', icon: '🦘',
    title: 'Skip counting', desc: 'Count by 2s, 5s and 10s',
    generate({ score, params }) {
      const steps = params?.steps || (score < 40 ? [10, 5] : [2, 5, 10])
      const step = pick(steps)
      const start = step * rint(0, step === 10 ? 4 : 6)
      const items = Array.from({ length: 5 }, (_, i) => start + i * step)
      const blank = score < 50 ? 4 : rint(1, 4)
      const ans = items[blank]
      const wrong = shuffle([ans + step, ans - step, ans + 1, ans - 1].filter((v) => v >= 0 && v !== ans)).slice(0, 3)
      return {
        prompt: `Count by ${step}s. What number is missing?`, say: `Count by ${step}s. What number is missing?`,
        visual: { kind: 'sequence', items, blank },
        input: 'choice', choiceStyle: 'number',
        choices: shuffle([ans, ...wrong]).map((v) => opt(v)),
        answer: ans, answerLabel: String(ans),
        help: { kind: 'sequence', items, blank, step, say: items.join(', ') },
      }
    },
  },
  {
    id: 'coins', levels: ['sk', 'g1', 'g2', 'g3'], byLevel: { sk: { mode: 'identify' }, g2: { pool: ['loonie', 'quarter', 'dime', 'nickel'] }, g3: { pool: ['toonie', 'loonie', 'quarter', 'dime', 'nickel'] } }, subject: 'money', icon: '🪙',
    title: 'Canadian coins', desc: 'Name coins and count cents',
    generate({ score, params }) {
      const mode = params?.mode || 'mix'
      const identify = mode === 'identify' || (mode === 'mix' && Math.random() < (score < 40 ? 0.6 : 0.3))
      if (identify) {
        const kind = pick(COIN_KINDS)
        const c = COINS[kind]
        return {
          prompt: `Which coin is the ${c.name}?`, say: `Which coin is the ${c.name}?`,
          visual: { kind: 'none' },
          input: 'choice', choiceStyle: 'coin',
          choices: shuffle([kind, ...sample(COIN_KINDS.filter((k) => k !== kind), 3)]).map((k) => ({ value: k, kind: 'coin', coin: k, label: COINS[k].name })),
          answer: kind, answerLabel: `the ${c.name}`,
          help: { kind: 'coinFact', coin: kind, say: `The ${c.name} is worth ${c.worth}. ${c.fact}` },
        }
      }
      const pool = params?.pool || (score >= 50 ? ['quarter', 'dime', 'nickel'] : ['dime', 'nickel'])
      const cap = pool.includes('toonie') ? 1000 : pool.includes('loonie') ? 500 : 100
      let coins, total
      do {
        coins = Array.from({ length: rint(2, score >= 50 ? 5 : 4) }, () => pick(pool))
        total = coins.reduce((t, k) => t + COINS[k].value, 0)
      } while (total > cap)
      coins.sort((x, y) => COINS[y].value - COINS[x].value)
      const set = new Set([total])
      for (const d of shuffle(total >= 100 ? [25, -25, 10, -10, 100, -100] : [5, -5, 10, -10, 15])) {
        if (set.size >= 4) break
        if (total + d > 0) set.add(total + d)
      }
      return {
        prompt: 'How much money is here?', say: 'How much money? Start with the biggest coin and count on.',
        visual: { kind: 'coins', coins },
        input: 'choice', choiceStyle: 'number',
        choices: shuffle([...set]).map((v) => opt(v, money(v))),
        answer: total, answerLabel: money(total),
        help: { kind: 'coinCount', coins, say: 'Start with the biggest coin, then count on.' },
      }
    },
  },
  {
    id: 'sight-words', levels: ['sk', 'g1', 'g2', 'g3'], byLevel: { sk: { set: 1 }, g2: { set: 4 }, g3: { set: 5 } }, subject: 'reading', icon: '📖',
    title: 'Sight words', desc: 'Hear a word and find it',
    generate({ score, params }) {
      const list = params?.set ? SIGHT_WORDS[params.set] : wordsUpTo(3)
      const word = pick(list)
      const all = params?.set ? wordsUpTo(params.set) : list
      const same = all.filter((w) => w !== word && w[0].toLowerCase() === word[0].toLowerCase())
      const rest = all.filter((w) => w !== word && w[0].toLowerCase() !== word[0].toLowerCase())
      const wrong = [...sample(same, score >= 50 ? 2 : 1), ...sample(rest, 3)].slice(0, 3)
      return {
        prompt: 'Tap the word you hear', say: `Find the word: ${word}`,
        visual: { kind: 'listen', fallback: word },
        input: 'choice', choiceStyle: 'word',
        choices: shuffle([word, ...wrong]).map((w) => opt(w)),
        answer: word, answerLabel: word,
        help: { kind: 'spell', word, say: `${word}. ${word.split('').join(', ')}. ${word}.` },
      }
    },
  },
  {
    id: 'story', levels: ['g1', 'g2', 'g3'], byLevel: { g2: { max: 100 }, g3: { max: 1000 } },
    subject: 'stories', icon: '📚',
    title: 'Story problems', desc: 'Word problems from your own world',
    generate({ score, name, theme, params }) {
      const who = name || 'Sam'
      const max = params?.max || 20
      const ops = params?.ops || '+-'
      const sub = ops === '-' || (ops.includes('-') && score >= 30 && Math.random() < 0.5)
      const small = max <= 20
      let a, b, ans
      if (!sub) {
        if (small) { a = rint(1, 6); b = rint(1, 6) }
        else { a = rint(Math.floor(max / 10), Math.floor(max / 2)); b = rint(Math.floor(max / 20) || 1, max - a - 1) }
        ans = a + b
      } else {
        if (small) { a = rint(4, 12); b = rint(1, a - 1) }
        else { a = rint(Math.floor(max / 4), max - 1); b = rint(Math.floor(max / 20) || 1, a - 1) }
        ans = a - b
      }
      const t = pick(STORIES[theme] || STORIES.diamond)[sub ? 'sub' : 'add'](who, a, b)
      const eq = `${a} ${sub ? '−' : '+'} ${b} = ${ans}`
      return {
        prompt: t.s, say: t.s, long: true,
        visual: small ? { kind: 'story', a, b, sub, emoji: t.e } : { kind: 'storyIcon', emoji: t.e },
        input: small ? 'choice' : 'keypad', choiceStyle: 'number',
        choices: small ? numberChoices(ans, { min: 0, max: 20 }).map((v) => opt(v)) : undefined,
        answer: ans, answerLabel: String(ans),
        help: small
          ? { kind: 'story', a, b, sub, emoji: t.e, eq, say: `${a} ${sub ? 'take away' : 'plus'} ${b} is ${ans}.` }
          : { kind: 'split', rows: splitRows(a, b, sub), say: `${a} ${sub ? 'take away' : 'plus'} ${b} is ${ans}.` },
      }
    },
  },

  // ───────── Shapes (Pre-K, JK, SK) ─────────
  {
    id: 'shapes', levels: ['prek', 'jk', 'sk'], subject: 'shapes', icon: '🔺',
    title: 'Find the shape', desc: 'Circles, squares, triangles and more',
    generate({ score, params }) {
      const pool = params?.shapes || (score < 50 ? ['circle', 'square', 'triangle'] : SHAPE_KINDS)
      const target = pick(pool)
      const wrong = sample(SHAPE_KINDS.filter((k) => k !== target), score < 40 ? 2 : 3)
      const tone = pick(['red', 'blue', 'green', 'yellow', 'clay'])
      return {
        prompt: `Find the ${SHAPES[target].name}`, say: `Find the ${SHAPES[target].name}`,
        visual: { kind: 'listen', fallback: SHAPES[target].name },
        input: 'choice', choiceStyle: 'shape',
        choices: shuffle([target, ...wrong]).map((k) => ({ value: k, kind: 'shape', shape: k, tone, label: SHAPES[k].name })),
        answer: target, answerLabel: `the ${SHAPES[target].name}`,
        help: { kind: 'shape', shape: target, lines: [SHAPES[target].fact], say: `This is a ${SHAPES[target].name}. ${SHAPES[target].fact}` },
      }
    },
  },

  // ───────── Grade 2 and 3 ─────────
  {
    id: 'add-sub-100', levels: ['g2', 'g3'], byLevel: { g3: { max: 1000 } }, subject: 'math', icon: '🧮',
    title: 'Big adding and taking away', desc: 'Add and subtract two- and three-digit numbers',
    generate({ score, params }) {
      const max = params?.max || 100
      const ops = params?.ops || '+-'
      const sub = ops === '-' || (ops.includes('-') && score >= 25 && Math.random() < 0.5)
      // Low scores avoid regrouping (no carrying or borrowing); higher scores allow it.
      const regroup = params?.regroup ?? score >= 50
      let a, b
      for (let i = 0; i < 40; i++) {
        a = rint(Math.floor(max / 10), max - Math.floor(max / 10))
        b = rint(Math.max(1, Math.floor(max / 50)), sub ? a - 1 : max - 1 - a)
        const ones = sub ? a % 10 < b % 10 : (a % 10) + (b % 10) >= 10
        if (b > 0 && (regroup || !ones)) break
      }
      const ans = sub ? a - b : a + b
      return {
        prompt: sub ? 'Take away' : 'Add', say: sub ? `${a} take away ${b}` : `${a} plus ${b}`,
        visual: { kind: 'equation', text: `${a} ${sub ? '−' : '+'} ${b} = ?` },
        input: 'keypad',
        answer: ans, answerLabel: String(ans),
        help: { kind: 'split', rows: splitRows(a, b, sub), say: `${a} ${sub ? 'take away' : 'plus'} ${b} is ${ans}.` },
      }
    },
  },
  {
    id: 'place-value', levels: ['g2', 'g3'], subject: 'math', icon: '🏗️',
    title: 'Hundreds, tens and ones', desc: 'Read numbers up to 999 from blocks',
    generate({ score, params }) {
      const max = params?.max || 999
      const n = score < 40 ? rint(100, Math.min(299, max)) : rint(100, max)
      const hundreds = Math.floor(n / 100), tens = Math.floor(n / 10) % 10, ones = n % 10
      const askDigit = score >= 50 && Math.random() < 0.4
      if (askDigit) {
        const place = pick(['hundreds', 'tens', 'ones'])
        const val = { hundreds, tens, ones }[place]
        return {
          prompt: `How many ${place} are in ${n}?`, say: `How many ${place} are in ${n}?`,
          visual: { kind: 'equation', text: String(n) },
          input: 'choice', choiceStyle: 'number',
          choices: numberChoices(val, { min: 0, max: 9 }).map((v) => opt(v)),
          answer: val, answerLabel: String(val),
          help: { kind: 'blocks', hundreds, tens, ones, say: `${n} is ${hundreds} hundreds, ${tens} tens and ${ones} ones.` },
        }
      }
      return {
        prompt: 'What number do the blocks show?', say: 'What number is this? Count the hundreds, then the tens, then the ones.',
        visual: { kind: 'blocks', hundreds, tens, ones },
        input: 'keypad',
        answer: n, answerLabel: String(n),
        help: { kind: 'blocks', hundreds, tens, ones, say: `${hundreds} hundreds, ${tens} tens and ${ones} ones make ${n}.` },
      }
    },
  },
  {
    id: 'times', levels: ['g2', 'g3'], byLevel: { g2: { max: 5 } }, subject: 'multiply', icon: '✖️',
    title: 'Equal groups', desc: 'Rows and groups: the start of multiplying',
    generate({ score, params }) {
      const max = params?.max || 10
      const rows = rint(2, score < 50 ? Math.min(5, max) : max)
      const cols = rint(2, score < 50 ? 5 : max)
      const ans = rows * cols
      const emoji = pick(THINGS)
      const showSign = score >= 40
      return {
        prompt: showSign ? `${rows} × ${cols} = ?` : `${rows} rows of ${cols}. How many in all?`,
        say: showSign ? `${rows} times ${cols}` : `${rows} rows of ${cols}. How many in all?`,
        visual: { kind: 'array', rows, cols, emoji },
        input: 'keypad',
        answer: ans, answerLabel: String(ans),
        help: { kind: 'array', rows, cols, emoji, say: `Count by ${cols}s, ${rows} times: ${Array.from({ length: rows }, (_, i) => (i + 1) * cols).join(', ')}.` },
      }
    },
  },
  {
    id: 'share', levels: ['g3'], subject: 'multiply', icon: '🍪',
    title: 'Sharing equally', desc: 'Split things into equal groups',
    generate({ score, name, params }) {
      const groups = rint(2, score < 50 ? 4 : params?.max || 6)
      const each = rint(1, score < 50 ? 5 : 9)
      const total = groups * each
      const thing = pick([['🍪', 'cookies'], ['🍓', 'strawberries'], ['🖍️', 'crayons'], ['⚽', 'balls']])
      const s = `${name || 'Sam'} has ${total} ${thing[1]} to share with ${groups} friends. How many does each friend get?`
      return {
        prompt: s, say: s, long: true,
        visual: { kind: 'count', emoji: thing[0], n: total },
        input: 'keypad',
        answer: each, answerLabel: String(each),
        help: { kind: 'share', groups, each, emoji: thing[0], lines: [`${total} ÷ ${groups} = ${each}`, `${groups} × ${each} = ${total}`], say: `${total} shared by ${groups} is ${each} each.` },
      }
    },
  },
  {
    id: 'fractions', levels: ['g2', 'g3'], byLevel: { g2: { max: 4 } }, subject: 'fractions', icon: '🍕',
    title: 'Fractions', desc: 'How much of the shape is coloured?',
    generate({ score, params }) {
      const maxParts = params?.max || 8
      const partsPool = [2, 3, 4, 6, 8].filter((p) => p <= maxParts)
      const parts = pick(score < 40 ? partsPool.slice(0, 3) : partsPool)
      const shaded = score < 50 ? 1 : rint(1, parts - 1)
      const shape = pick(['pie', 'bar'])
      const label = (k, p) => `${k}/${p}`
      const set = new Set([label(shaded, parts)])
      const tries = shuffle([
        label(parts - shaded, parts), label(shaded, parts + 1 <= 8 ? parts + 1 : parts - 1), label(1, parts),
        label(shaded, parts === 2 ? 4 : 2), label(Math.min(parts, shaded + 1), parts),
      ])
      for (const t of tries) { if (set.size >= 4) break; if (!t.startsWith('0/')) set.add(t) }
      const words = FRACTION_WORDS[parts]
      return {
        prompt: 'What fraction is coloured?', say: 'What fraction of the shape is coloured?',
        visual: { kind: 'fraction', parts, shaded, shape },
        input: 'choice', choiceStyle: 'symbol',
        choices: shuffle([...set]).map((v) => opt(v)),
        answer: label(shaded, parts), answerLabel: label(shaded, parts),
        help: {
          kind: 'fraction', parts, shaded, shape, labelled: true,
          lines: [`${parts} equal parts. ${shaded} coloured.`, `${shaded} ${shaded === 1 ? words[0] : words[1]} = ${shaded}/${parts}`],
          say: `There are ${parts} equal parts and ${shaded} are coloured. That is ${shaded} ${shaded === 1 ? words[0] : words[1]}.`,
        },
      }
    },
  },
  {
    id: 'clock', levels: ['g1', 'g2', 'g3'], byLevel: { g1: { step: 30 }, g2: { step: 15 }, g3: { step: 5 } }, subject: 'time', icon: '🕒',
    title: 'Tell the time', desc: 'Read an analog clock',
    generate({ score, params }) {
      const step = params?.step || (score < 40 ? 30 : score < 75 ? 15 : 5)
      const h = rint(1, 12)
      const m = step * rint(0, 60 / step - 1)
      const fmt = (hh, mm) => `${hh}:${String(mm).padStart(2, '0')}`
      const ans = fmt(h, m)
      const set = new Set([ans])
      const near = shuffle([
        fmt(h === 12 ? 1 : h + 1, m), fmt(h, (m + 30) % 60), fmt(h === 1 ? 12 : h - 1, m),
        fmt((m / 5) || 12, h * 5 === 60 ? 0 : h * 5), fmt(h, (m + step) % 60),
      ])
      for (const t of near) { if (set.size >= 4) break; set.add(t) }
      return {
        prompt: 'What time is it?', say: 'What time does the clock show?',
        visual: { kind: 'clock', h, m },
        input: 'choice', choiceStyle: 'symbol',
        choices: shuffle([...set]).map((v) => opt(v)),
        answer: ans, answerLabel: ans,
        help: {
          kind: 'clock', h, m,
          lines: ['The short hand shows the hour.', m === 0 ? 'The long hand on 12 means o’clock.' : `The long hand counts minutes by 5s: ${m} minutes.`, `It is ${ans}.`],
          say: m === 0 ? `It is ${h} o’clock.` : `It is ${h} ${m < 10 ? 'oh ' + m : m}.`,
        },
      }
    },
  },
]

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]))

/** Skills for a level, for free play. */
export const skillsFor = (level) => SKILLS.filter((s) => s.levels.includes(level))

/** Free-play settings for a skill at a level, e.g. bigger numbers in Grade 3. */
export const freeParams = (skill, level) => skill.byLevel?.[level]

let qid = 0
/** Build a question, avoiding an exact repeat of the previous one. */
export function makeQuestion(skill, ctx, prev) {
  let q
  for (let i = 0; i < 6; i++) {
    q = skill.generate(ctx)
    if (!prev || q.prompt + q.answer + JSON.stringify(q.visual) !== prev.prompt + prev.answer + JSON.stringify(prev.visual)) break
  }
  return { ...q, id: ++qid }
}
