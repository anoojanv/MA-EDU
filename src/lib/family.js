import { supabase } from './supabase.js'

// Reads and writes for a family's children. Row-level security scopes every
// query to the signed-in grown-up, so no family id is passed from here.

const COLUMNS = 'id, name, birth_date, avatar, theme, tone, level_override, stars, progress, plan_state, free_level, sort_order'

function check({ data, error }) {
  if (error) throw error
  return data
}

export async function listChildren() {
  return check(await supabase.from('children').select(COLUMNS).order('sort_order').order('created_at'))
}

export async function addChildren(kids) {
  return check(await supabase.from('children').insert(kids).select(COLUMNS))
}

export async function updateChild(id, patch) {
  return check(await supabase.from('children').update(patch).eq('id', id).select(COLUMNS).single())
}

export async function removeChild(id) {
  return check(await supabase.from('children').delete().eq('id', id))
}

export async function recordAnswer(childId, skillId, correct, scoreAfter) {
  const { error } = await supabase.from('answers').insert({ child_id: childId, skill_id: skillId, correct, score_after: scoreAfter })
  if (error) console.warn('Could not record answer', error.message)
}

/** Answers from the last `days` days, oldest first. */
export async function recentAnswers(childId, days = 7) {
  const since = new Date()
  since.setHours(0, 0, 0, 0)
  since.setDate(since.getDate() - (days - 1))
  return check(
    await supabase
      .from('answers')
      .select('skill_id, correct, created_at')
      .eq('child_id', childId)
      .gte('created_at', since.toISOString())
      .order('created_at')
      .limit(5000),
  )
}
