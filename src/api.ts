import axios from 'axios'
import { API_URL } from './config'
import { session, signOut } from './session'

export const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  if (session.token) config.headers.Authorization = `Bearer ${session.token}`
  return config
})

// An expired session (401) or an account that is no longer admin (403) goes
// back to the sign-in page. The sign-in request itself shows its own error.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const signingIn = error.config?.url === '/auth/sign-in'
    if (!signingIn && (status === 401 || status === 403) && session.token) {
      signOut()
      window.location.assign(`/entrar?motivo=${status === 401 ? 'expirou' : 'sem-acesso'}`)
    }
    return Promise.reject(error)
  }
)

// The API's message for a failed request: the general one, or the first
// message of an invalid field.
export function apiError(e: unknown, fallback: string): string {
  const data = (e as any)?.response?.data
  const field = data?.errors && Object.values(data.errors as Record<string, string>)[0]
  const message = Array.isArray(data?.message) ? data.message[0] : data?.message
  return field || message || fallback
}
