import { ofetch } from 'ofetch'
import type { ApiClientConfig } from '@wompi/types'

export function createApiClient(config: ApiClientConfig = {}) {
  const {
    baseUrl,
    timeout = 60000,
    useAuth = true,
    usePrefix = true,
    onUnauthorized,
    getToken,
    refreshSession,
  } = config

  function resolveBaseUrl(): string {
    const url = baseUrl || (() => {
      const stored = localStorage.getItem('apiEnvironment')
      if (stored) {
        return JSON.parse(stored).baseUrl
      }
      return String(import.meta.env.VITE_API_GW_BASE_URL)
    })()

    if (!usePrefix) return url
    return url.endsWith('/') ? `${url}dashboard` : `${url}/dashboard`
  }

  return ofetch.create({
    baseURL: resolveBaseUrl(),
    timeout,

    async onRequest({ options }) {
      if (!useAuth) return

      if (refreshSession) {
        try {
          await refreshSession()
        } catch {
          try {
            await refreshSession()
          } catch {
            onUnauthorized?.()
            throw new Error('Session refresh failed')
          }
        }
      }

      const token = getToken?.() || localStorage.getItem('token')
      const userPrincipalID = sessionStorage.getItem('userPrincipalID')

      if (token) {
        options.headers = new Headers(options.headers)
        options.headers.set('Authorization', `Bearer ${token}`)
      }

      if (userPrincipalID) {
        if (!(options.headers instanceof Headers)) {
          options.headers = new Headers(options.headers)
        }
        options.headers.set('User-Principal-Id', userPrincipalID)
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        onUnauthorized?.()
      }
    },
  })
}
