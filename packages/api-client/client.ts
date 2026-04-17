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

    async onRequest({ request, options }) {
      if (!useAuth) return

      // Only attempt refresh if we have a refresh token
      const hasRefreshToken = !!localStorage.getItem('refreshToken')
      if (refreshSession && hasRefreshToken) {
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

      // DEBUG — remove after fixing
      console.log('[API DEBUG]', {
        url: request,
        baseURL: options.baseURL,
        token: token ? `${token.slice(0, 20)}...` : 'NULL',
        userPrincipalID: userPrincipalID || 'NULL',
      })

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
