// Device preferences (sound on/off). Learning progress lives in Supabase.
const KEY = 'ma-learning:prefs:v1'

export function loadPrefs() {
  try {
    const raw = window.localStorage.getItem(KEY)
    return { muted: false, ...(raw ? JSON.parse(raw) : {}) }
  } catch {
    return { muted: false }
  }
}

export function savePrefs(prefs) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch {}
}

export const todayKey = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
