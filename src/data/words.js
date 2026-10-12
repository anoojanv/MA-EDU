// High-frequency words in five sets that build on each other:
// sets 1–3 for Grade 1, set 4 for Grade 2 and set 5 for Grade 3.
export const SIGHT_WORDS = {
  1: ['the', 'a', 'and', 'I', 'to', 'is', 'it', 'in', 'see', 'can', 'we', 'go', 'me', 'my', 'up', 'look', 'like', 'you', 'here', 'play'],
  2: ['said', 'come', 'for', 'was', 'he', 'she', 'they', 'have', 'with', 'what', 'this', 'that', 'all', 'are', 'be', 'big', 'little', 'not', 'on', 'at'],
  3: ['one', 'two', 'three', 'red', 'blue', 'jump', 'run', 'help', 'make', 'find', 'where', 'funny', 'down', 'yes', 'no', 'saw', 'ran', 'went', 'out', 'good'],
  4: ['always', 'around', 'because', 'been', 'before', 'best', 'both', 'buy', 'call', 'cold', 'does', 'don\u2019t', 'fast', 'first', 'five', 'found', 'gave', 'goes', 'green', 'its', 'made', 'many', 'off', 'or', 'pull', 'read', 'right', 'sing', 'sit', 'sleep', 'tell', 'their', 'these', 'those', 'upon', 'us', 'use', 'very', 'wash', 'which', 'why', 'wish', 'work', 'would', 'write', 'your'],
  5: ['about', 'better', 'bring', 'carry', 'clean', 'cut', 'done', 'draw', 'drink', 'eight', 'fall', 'far', 'full', 'got', 'grow', 'hold', 'hot', 'hurt', 'if', 'keep', 'kind', 'laugh', 'light', 'long', 'much', 'myself', 'never', 'only', 'own', 'pick', 'seven', 'shall', 'show', 'six', 'small', 'start', 'ten', 'today', 'together', 'try', 'warm'],
}

export function wordsUpTo(set = 5) {
  const out = []
  for (let s = 1; s <= set; s++) out.push(...(SIGHT_WORDS[s] || []))
  return out
}
