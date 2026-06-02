import type { AuthTokens, User } from '../types/auth'

const base64Encode = (value: string) => window.btoa(unescape(encodeURIComponent(value)))
const base64Decode = (value: string) => decodeURIComponent(escape(window.atob(value)))

export function createMockJwt(payload: Record<string, unknown>, expiresInSeconds = 900) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const expiry = Math.floor(Date.now() / 1000) + expiresInSeconds
  const body = { ...payload, exp: expiry }
  return [base64Encode(JSON.stringify(header)), base64Encode(JSON.stringify(body)), 'signature'].join('.')
}

export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const [, payload] = token.split('.')
    if (!payload) {
      return null
    }
    return JSON.parse(base64Decode(payload)) as T
  } catch {
    return null
  }
}

export function isTokenExpired(token: string | null) {
  if (!token) {
    return true
  }
  const payload = decodeJwt<{ exp?: number }>(token)
  if (!payload?.exp) {
    return true
  }
  return Date.now() / 1000 >= payload.exp
}

export function createAuthTokens(user: User): AuthTokens {
  const accessToken = createMockJwt({ userId: user.id, email: user.email, role: user.role }, 900)
  const refreshToken = createMockJwt({ userId: user.id }, 604800)
  const expiresAt = Math.floor(Date.now() / 1000) + 900
  return { accessToken, refreshToken, expiresAt }
}
