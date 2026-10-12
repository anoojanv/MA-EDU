import { rint, pick, shuffle, sample, numberChoices } from '../lib/random.js'
import { LETTERS, LETTER_NAMES, PICTURES, SAME_SOUND, MIRRORS } from './letters.js'
import { SIGHT_WORDS, wordsUpTo } from './words.js'
import { COINS, COIN_KINDS } from './coins.js'

export const LEVELS = [
  { id: 'jk', name: 'JK', long: 'Junior Kindergarten' },
  { id: 'g1', name: 'Grade 1', long: 'Grade 1' },
]

export const SUBJECTS = {
  letters: { name: 'Letters and sounds', tone: 'red' },
  counting: { name: 'Counting', tone: 'blue' },
  math: { name: 'Number sense', tone: 'blue' },
  money: { name: 'Money', tone: 'yellow' },
  reading: { name: 'Reading', tone: 'green' },
  stories: { name: 'Story problems', tone: 'clay' },
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

export const SKILLS = [
  // ───────── JK ─────────
  {
    id: 'letter-pop', level: 'jk', subject: 'letters', icon: '🎈',
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
    id: 'big-little', level: 'jk', subject: 'letters', icon: '🔠',
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
    id: 'first-sound', level: 'jk', subject: 'letters', icon: '🐸',
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
    id: 'count', level: 'jk', subject: 'counting', icon: '🐞',
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
    id: 'more-fewer', level: 'jk', subject: 'counting', icon: '⚖️',
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

  // ───────── Grade 1 ─────────
  {
    id: 'ten-frame', level: 'g1', subject: 'math', icon: '🔟',
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
    id: 'add-sub-20', level: 'g1', subject: 'math', icon: '🐸',
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
    id: 'tens-ones', level: 'g1', subject: 'math', icon: '🧱',
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
    id: 'compare', level: 'g1', subject: 'math', icon: '🐊',
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
    id: 'skip-count', level: 'g1', subject: 'math', icon: '🦘',
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
    id: 'coins', level: 'g1', subject: 'money', icon: '🪙',
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
      let coins, total
      do {
        coins = Array.from({ length: rint(2, score >= 50 ? 5 : 4) }, () => pick(pool))
        total = coins.reduce((t, k) => t + COINS[k].value, 0)
      } while (total > 100)
      coins.sort((x, y) => COINS[y].value - COINS[x].value)
      const set = new Set([total])
      for (const d of shuffle([5, -5, 10, -10, 15])) {
        if (set.size >= 4) break
        if (total + d > 0) set.add(total + d)
      }
      return {
        prompt: 'How much money is here?', say: 'How much money? Start with the biggest coin and count on.',
        visual: { kind: 'coins', coins },
        input: 'choice', choiceStyle: 'number',
        choices: shuffle([...set]).map((v) => opt(v, `${v}¢`)),
        answer: total, answerLabel: `${total}¢`,
        help: { kind: 'coinCount', coins, say: 'Start with the biggest coin, then count on.' },
      }
    },
  },
  {
    id: 'sight-words', level: 'g1', subject: 'reading', icon: '📖',
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
    id: 'baseball', level: 'g1', subject: 'stories', icon: '⚾',
    title: 'Baseball math', desc: 'Story problems from the ballpark',
    generate({ score, name, params }) {
      const who = name || 'Sam'
      const ops = params?.ops || '+-'
      const sub = ops === '-' || (ops.includes('-') && score >= 30 && Math.random() < 0.5)
      let a, b, ans, t
      if (!sub) {
        a = rint(1, 6); b = rint(1, 6); ans = a + b
        t = pick([
          { e: '⚾', s: `${who} hit ${a} balls at batting practice, then ${b} more. How many balls did ${who} hit?` },
          { e: '⚾', s: `The team scored ${a} runs in the first inning and ${b} runs in the second. How many runs in all?` },
          { e: '🧢', s: `${a} players ran onto the field. Then ${b} more ran out. How many players are on the field?` },
        ])
      } else {
        a = rint(4, 12); b = rint(1, a - 1); ans = a - b
        t = pick([
          { e: '⚾', s: `There were ${a} baseballs in the bucket. The coach took out ${b}. How many are left?` },
          { e: '🃏', s: `${who} had ${a} baseball cards and gave ${b} to a friend. How many cards are left?` },
          { e: '🌭', s: `The snack stand had ${a} hot dogs. Fans bought ${b}. How many are left?` },
        ])
      }
      const eq = `${a} ${sub ? '−' : '+'} ${b} = ${ans}`
      return {
        prompt: t.s, say: t.s, long: true,
        visual: { kind: 'story', a, b, sub, emoji: t.e },
        input: 'choice', choiceStyle: 'number',
        choices: numberChoices(ans, { min: 0, max: 20 }).map((v) => opt(v)),
        answer: ans, answerLabel: String(ans),
        help: { kind: 'story', a, b, sub, emoji: t.e, eq, say: `${a} ${sub ? 'take away' : 'plus'} ${b} is ${ans}.` },
      }
    },
  },
]

export const SKILL_BY_ID = Object.fromEntries(SKILLS.map((s) => [s.id, s]))

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
