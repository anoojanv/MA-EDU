export const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const sample = (arr, n) => shuffle(arr).slice(0, n)

/** Answer plus near-miss distractors, all inside [min, max]. */
export function numberChoices(answer, { count = 4, min = 0, max = 999, step = 1 } = {}) {
  const set = new Set([answer])
  const near = shuffle([1, 2, 3].flatMap((k) => [answer + k * step, answer - k * step]))
  for (const v of near) {
    if (set.size >= count) break
    if (v >= min && v <= max) set.add(v)
  }
  for (let v = min; set.size < count && v <= max; v += step) set.add(v)
  return shuffle([...set])
}
