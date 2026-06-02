import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthStatus, User } from '../types/auth'
import { AUTH_STORAGE_KEY } from '../../../constants/app'
import { isTokenExpired } from '../utils/authUtils'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  status: AuthStatus
  onboardingComplete: boolean
  setAuth: (payload: {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    expiresAt: number | null
  }) => void
  clearAuth: () => void
  setStatus: (status: AuthStatus) => void
  markOnboardingComplete: () => void
  isAuthenticated: () => boolean
}

export const authStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      status: 'idle',
      onboardingComplete: false,
      setAuth: (payload) =>
        set(() => ({
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          expiresAt: payload.expiresAt,
          status: payload.accessToken ? 'authenticated' : 'unauthenticated',
        })),
      clearAuth: () =>
        set(() => ({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          status: 'unauthenticated',
        })),
      setStatus: (status) => set(() => ({ status })),
      markOnboardingComplete: () => set(() => ({ onboardingComplete: true })),
      isAuthenticated: () => {
        const state = get()
        return Boolean(state.accessToken && !isTokenExpired(state.accessToken))
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
)
