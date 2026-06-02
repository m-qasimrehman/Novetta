import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { authStore } from '../features/auth/store/authStore'
import { authService } from '../features/auth/services/authService'
import { isTokenExpired } from '../features/auth/utils/authUtils'
import { ToastProvider } from './ToastProvider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export default function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    const state = authStore.getState()
    const accessToken = state.accessToken
    const refreshToken = state.refreshToken

    if (accessToken && !isTokenExpired(accessToken)) {
      state.setStatus('authenticated')
      return
    }

    if (refreshToken) {
      state.setStatus('loading')
      authService
        .refreshToken(refreshToken)
        .then((data) => {
          state.setAuth({
            user: state.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresAt: data.expiresAt,
          })
        })
        .catch(() => {
          state.clearAuth()
        })
        .finally(() => {
          const currentStatus = authStore.getState().accessToken ? 'authenticated' : 'unauthenticated'
          state.setStatus(currentStatus)
        })
    } else {
      state.setStatus('unauthenticated')
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ToastProvider>{children}</ToastProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
