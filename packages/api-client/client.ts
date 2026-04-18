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
    if (baseUrl) {
      const b = baseUrl
      if (!usePrefix) return b
      return b.endsWith('/') ? `${b}dashboard` : `${b}/dashboard`
    }

    const DEFAULT_URL = 'https://api.co.dev.wompi.dev/v1'
    let url: string = DEFAULT_URL

    try {
      const stored = localStorage.getItem('apiEnvironment')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.baseUrl) url = parsed.baseUrl
      }
    } catch { /* ignore */ }

    if (url === DEFAULT_URL) {
      const envUrl = import.meta.env?.VITE_API_GW_BASE_URL
      if (envUrl) url = String(envUrl)
    }

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
