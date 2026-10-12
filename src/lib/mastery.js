// Star Meter: 0–100 per skill. Climbs fast early, slows near the top,
// and a miss costs more the higher you are, so 100 means steady accuracy.

export function nextScore(score, correct) {
  if (correct) {
    const up = score < 50 ? 10 : score < 80 ? 7 : score < 90 ? 4 : 2
    return Math.min(100, score + up)
  }
  const down = score < 50 ? 3 : score < 80 ? 6 : 8
  return Math.max(0, score - down)
}

export function tier(score) {
  if (score >= 100) return { key: 'master', name: 'Mastered' }
  if (score >= 80) return { key: 'star', name: 'Super star' }
  if (score >= 50) return { key: 'mid', name: 'Getting there' }
  if (score > 0) return { key: 'low', name: 'Warming up' }
  return { key: 'new', name: 'New' }
}

export function applyResult(prev, correct) {
  const e = prev || { score: 0, answered: 0, correct: 0, streak: 0, best: 0, mastered: false }
  const score = nextScore(e.score, correct)
  const streak = correct ? e.streak + 1 : 0
  return {
    score,
    answered: e.answered + 1,
    correct: e.correct + (correct ? 1 : 0),
    streak,
    best: Math.max(e.best, streak),
    mastered: e.mastered || score >= 100,
  }
}
