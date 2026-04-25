const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '')

export const logApi = (...args) => {
  if (import.meta.env.DEV) {
    console.log('[API]', ...args)
  }
}
