import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { API_URL } from '../constants/app'
import { authStore } from '../features/auth/store/authStore'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean }
    if (
      error.response?.status === 401 &&
      !config?._retry &&
      config?.url !== '/auth/refresh'
    ) {
      config._retry = true
      const refreshToken = authStore.getState().refreshToken
      if (!refreshToken) {
        authStore.getState().clearAuth()
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await apiClient.post<{
          success: boolean
          data: { accessToken: string; refreshToken: string }
        }>('/auth/refresh', { refreshToken })

        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data

        authStore.getState().setAuth({
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt: Date.now() + 15 * 60 * 1000,
          user: authStore.getState().user,
        })

        if (config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`
        }
        return apiClient(config)
      } catch (refreshError) {
        authStore.getState().clearAuth()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
