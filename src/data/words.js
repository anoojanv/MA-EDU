// High-frequency words for Grade 1, in three sets that build on each other.
export const SIGHT_WORDS = {
  1: ['the', 'a', 'and', 'I', 'to', 'is', 'it', 'in', 'see', 'can', 'we', 'go', 'me', 'my', 'up', 'look', 'like', 'you', 'here', 'play'],
  2: ['said', 'come', 'for', 'was', 'he', 'she', 'they', 'have', 'with', 'what', 'this', 'that', 'all', 'are', 'be', 'big', 'little', 'not', 'on', 'at'],
  3: ['one', 'two', 'three', 'red', 'blue', 'jump', 'run', 'help', 'make', 'find', 'where', 'funny', 'down', 'yes', 'no', 'saw', 'ran', 'went', 'out', 'good'],
}

export function wordsUpTo(set = 3) {
  const out = []
  for (let s = 1; s <= set; s++) out.push(...(SIGHT_WORDS[s] || []))
  return out
}
