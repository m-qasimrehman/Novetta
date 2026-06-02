import type {
  AxiosAdapter,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { createAuthTokens, createMockJwt, decodeJwt } from '../utils/authUtils'
import type { User } from '../types/auth'

interface PendingRegister {
  email: string
  phone: string
  name: string
  password: string
}

interface PendingReset {
  userId: string
}

const users: User[] = [
  {
    id: 'patient-01',
    name: 'Asha Patel',
    email: 'hello@novetta.health',
    phone: '+919876543210',
    role: 'patient',
  },
]

const credentials: Record<string, string> = {
  'hello@novetta.health': 'Novetta123$',
  '+919876543210': 'Novetta123$',
}

const pendingRegistrations: Record<string, PendingRegister> = {}
const pendingResets: Record<string, PendingReset> = {}
const refreshMap: Record<string, string> = {}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const responseFactory = <T>(data: T, status = 200, config?: InternalAxiosRequestConfig): AxiosResponse<T> => ({
  data,
  status,
  statusText: status === 200 ? 'OK' : 'ERROR',
  headers: {},
  config: config ?? ({} as InternalAxiosRequestConfig),
  request: {},
})

const getPath = (config: AxiosRequestConfig) => {
  if (!config.url) return null
  try {
    const url = new URL(config.url, 'https://api.novetta.example')
    return url.pathname
  } catch {
    return config.url
  }
}

const getRequestBody = (config: InternalAxiosRequestConfig) => {
  if (!config.data) {
    return null
  }
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data
}

const findUser = (emailOrPhone: string): User | undefined =>
  users.find(
    (user) => user.email.toLowerCase() === emailOrPhone.toLowerCase() || user.phone === emailOrPhone,
  )

export const mockAuthAdapter: AxiosAdapter = async (config: InternalAxiosRequestConfig) => {
  const path = getPath(config)
  const body = getRequestBody(config)
  await delay(520 + Math.random() * 260)

  if (!path || !config.method) {
    return responseFactory({ message: 'Invalid request.' }, 400, config)
  }

  if (path === '/auth/login' && config.method.toLowerCase() === 'post') {
    const { emailOrPhone, password } = body as { emailOrPhone: string; password: string }
    const user = findUser(emailOrPhone)
    if (!user || credentials[emailOrPhone] !== password) {
      return responseFactory({ message: 'Invalid credentials. Please try again.' }, 401, config)
    }

    const tokens = createAuthTokens(user)
    refreshMap[tokens.refreshToken] = user.id
    return responseFactory({ user, ...tokens }, 200, config)
  }

  if (path === '/auth/register' && config.method.toLowerCase() === 'post') {
    const { email, phone, name, password } = body as PendingRegister
    if (findUser(email) || findUser(phone)) {
      return responseFactory({ message: 'An account already exists with that email or phone.' }, 409, config)
    }

    const verificationToken = createMockJwt({ action: 'register', email, phone }, 600)
    pendingRegistrations[verificationToken] = { email, phone, name, password }
    return responseFactory({ message: 'Verification code sent.', verificationToken }, 200, config)
  }

  if (path === '/auth/verify-otp' && config.method.toLowerCase() === 'post') {
    const { token, code } = body as { token: string; code: string }
    if (!token || typeof code !== 'string' || code.length !== 6) {
      return responseFactory({ message: 'OTP verification failed. Please check your code.' }, 422, config)
    }

    if (pendingRegistrations[token]) {
      const pending = pendingRegistrations[token]
      const existing = findUser(pending.email)
      if (existing) {
        return responseFactory({ message: 'Account already exists. Please login instead.' }, 409, config)
      }

      const user: User = {
        id: `user-${Date.now()}`,
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        role: 'patient',
      }
      users.push(user)
      credentials[user.email] = pending.password
      if (user.phone) credentials[user.phone] = pending.password
      delete pendingRegistrations[token]

      const tokens = createAuthTokens(user)
      refreshMap[tokens.refreshToken] = user.id
      return responseFactory({ user, ...tokens }, 200, config)
    }

    const pendingReset = pendingResets[token]
    if (pendingReset) {
      const resetToken = createMockJwt({ action: 'reset', userId: pendingReset.userId }, 600)
      return responseFactory({ resetToken }, 200, config)
    }

    return responseFactory({ message: 'Verification token invalid or expired.' }, 404, config)
  }

  if (path === '/auth/forgot-password' && config.method.toLowerCase() === 'post') {
    const { emailOrPhone } = body as { emailOrPhone: string }
    const user = findUser(emailOrPhone)
    if (!user) {
      return responseFactory({ message: 'No account found. Please check your details.' }, 404, config)
    }
    const verificationToken = createMockJwt({ action: 'forgot', userId: user.id }, 600)
    pendingResets[verificationToken] = { userId: user.id }
    return responseFactory({ message: 'OTP sent for password reset.', verificationToken }, 200, config)
  }

  if (path === '/auth/reset-password' && config.method.toLowerCase() === 'post') {
    const { token, password } = body as { token: string; password: string }
    const pending = pendingResets[token]
    if (!pending) {
      return responseFactory({ message: 'Reset session expired. Please retry.' }, 410, config)
    }
    const user = users.find((entry) => entry.id === pending.userId)
    if (!user) {
      return responseFactory({ message: 'Reset reference is invalid.' }, 404, config)
    }
    credentials[user.email] = password
    if (user.phone) credentials[user.phone] = password
    delete pendingResets[token]
    return responseFactory({ message: 'Password updated successfully.' }, 200, config)
  }

  if (path === '/auth/refresh' && config.method.toLowerCase() === 'post') {
    const { refreshToken } = body as { refreshToken: string }
    const decoded = decodeJwt<{ userId?: string }>(refreshToken)
    if (!decoded?.userId || !refreshMap[refreshToken]) {
      return responseFactory({ message: 'Invalid refresh token.' }, 401, config)
    }
    const user = users.find((entry) => entry.id === decoded.userId)
    if (!user) {
      return responseFactory({ message: 'Refresh session invalid.' }, 401, config)
    }
    const tokens = createAuthTokens(user)
    delete refreshMap[refreshToken]
    refreshMap[tokens.refreshToken] = user.id
    return responseFactory({ ...tokens }, 200, config)
  }

  if (path === '/auth/logout' && config.method.toLowerCase() === 'post') {
    const { refreshToken } = body as { refreshToken: string }
    if (refreshToken && refreshMap[refreshToken]) {
      delete refreshMap[refreshToken]
    }
    return responseFactory({ message: 'Logged out successfully.' }, 200, config)
  }

  if (path === '/auth/me' && config.method.toLowerCase() === 'get') {
    const authorization = config.headers?.Authorization ?? config.headers?.authorization
    const token = typeof authorization === 'string' ? authorization.replace('Bearer ', '') : null
    if (!token) {
      return responseFactory({ message: 'Missing auth header.' }, 401, config)
    }
    const decoded = decodeJwt<{ userId?: string; exp?: number }>(token)
    if (!decoded?.userId || Date.now() / 1000 >= (decoded.exp ?? 0)) {
      return responseFactory({ message: 'Session expired.' }, 401, config)
    }
    const user = users.find((entry) => entry.id === decoded.userId)
    if (!user) {
      return responseFactory({ message: 'User not found.' }, 404, config)
    }
    return responseFactory({ user }, 200, config)
  }

  return responseFactory({ message: 'Not found.' }, 404, config)
}
