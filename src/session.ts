import { reactive } from 'vue'

// Kept apart from the app's own sign-in (different keys), so signing in here
// never signs anyone in or out of the app.
const TOKEN_KEY = 'tpf_admin_token'
const USER_KEY = 'tpf_admin_user'

export interface AdminProfile { id: number; name: string; email: string }

function read<T>(key: string): T | null {
  try {
    const value = localStorage.getItem(key)
    return value ? (JSON.parse(value) as T) : null
  } catch {
    return null
  }
}

export const session = reactive({
  token: read<string>(TOKEN_KEY),
  user: read<AdminProfile>(USER_KEY),
})

export function signIn(token: string, user: AdminProfile) {
  session.token = token
  session.user = user
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function signOut() {
  session.token = null
  session.user = null
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
